-- ============================================================
-- SQL SERVER — ДОПОЛНИТЕЛЬНЫЕ ОБЪЕКТЫ
-- Таблицы: CLIENT, OWNER, OBJECT_TYPE, RENTAL_OBJECT, 
--          RENTAL_CONTRACT, PAYMENT, OWNER_PAYMENT, 
--          MAINTENANCE, BOOKING
-- ============================================================

USE RentalService;
GO

-- ============================================================
-- 1. ДОПОЛНИТЕЛЬНЫЕ ИНДЕКСЫ (кроме тех что в таблицах)
-- ============================================================

CREATE NONCLUSTERED INDEX IX_RENTAL_OBJECT_OWNER ON RENTAL_OBJECT(owner_id);
CREATE NONCLUSTERED INDEX IX_RENTAL_OBJECT_TYPE ON RENTAL_OBJECT(type_id);
CREATE NONCLUSTERED INDEX IX_RENTAL_CONTRACT_CLIENT ON RENTAL_CONTRACT(client_id);
CREATE NONCLUSTERED INDEX IX_RENTAL_CONTRACT_OBJECT ON RENTAL_CONTRACT(object_id);
CREATE NONCLUSTERED INDEX IX_PAYMENT_CONTRACT ON PAYMENT(contract_id);
CREATE NONCLUSTERED INDEX IX_PAYMENT_CLIENT ON PAYMENT(client_id);
CREATE NONCLUSTERED INDEX IX_OWNER_PAYMENT_DATE ON OWNER_PAYMENT(payment_date);
CREATE NONCLUSTERED INDEX IX_OWNER_PAYMENT_OWNER ON OWNER_PAYMENT(owner_id);
CREATE NONCLUSTERED INDEX IX_MAINTENANCE_OBJECT ON MAINTENANCE(object_id);
CREATE NONCLUSTERED INDEX IX_MAINTENANCE_DATE ON MAINTENANCE(maintenance_date);
CREATE NONCLUSTERED INDEX IX_BOOKING_OBJECT ON BOOKING(object_id);
CREATE NONCLUSTERED INDEX IX_BOOKING_CLIENT ON BOOKING(client_id);
CREATE NONCLUSTERED INDEX IX_BOOKING_DATES ON BOOKING(planned_start, planned_end);

-- Композитный индекс для отчетов
CREATE NONCLUSTERED INDEX IX_CONTRACT_STATUS_DATES 
ON RENTAL_CONTRACT(status, start_date, end_date) 
INCLUDE (total_amount, client_id, object_id);

-- ============================================================
-- 2. ПРЕДСТАВЛЕНИЯ (VIEWS)
-- ============================================================

-- Доступные объекты аренды
CREATE VIEW VW_AVAILABLE_OBJECTS AS
SELECT 
    ro.object_id,
    ro.address,
    ro.area,
    ro.daily_rate,
    ro.description,
    ot.type_name,
    ot.category,
    own.full_name AS owner_name,
    own.phone AS owner_phone,
    own.email AS owner_email
FROM RENTAL_OBJECT ro
JOIN OBJECT_TYPE ot ON ro.type_id = ot.type_id
JOIN OWNER own ON ro.owner_id = own.owner_id
WHERE ro.status = N'Свободен';

-- Активные договоры с полной информацией
CREATE VIEW VW_ACTIVE_CONTRACTS AS
SELECT 
    rc.contract_id,
    rc.start_date,
    rc.end_date,
    rc.total_amount,
    rc.status,
    rc.deposit_amount,
    ro.object_id,
    ro.address AS object_address,
    ro.daily_rate,
    ro.area,
    cl.client_id,
    cl.full_name AS client_name,
    cl.phone AS client_phone,
    cl.email AS client_email,
    own.owner_id,
    own.full_name AS owner_name,
    own.phone AS owner_phone,
    DATEDIFF(day, rc.start_date, rc.end_date) AS rental_days
FROM RENTAL_CONTRACT rc
JOIN RENTAL_OBJECT ro ON rc.object_id = ro.object_id
JOIN CLIENT cl ON rc.client_id = cl.client_id
JOIN OWNER own ON ro.owner_id = own.owner_id
WHERE rc.status = N'Активен';

-- Финансовая сводка по собственникам
CREATE VIEW VW_OWNER_FINANCE AS
SELECT 
    own.owner_id,
    own.full_name,
    own.email,
    own.bank_account,
    COUNT(DISTINCT ro.object_id) AS total_objects,
    COUNT(DISTINCT rc.contract_id) AS total_contracts,
    ISNULL(SUM(op.amount), 0) AS total_paid_to_owner,
    ISNULL(AVG(op.commission_percent), 10.00) AS avg_commission,
    ISNULL(SUM(rc.total_amount), 0) AS total_contracts_amount
FROM OWNER own
LEFT JOIN RENTAL_OBJECT ro ON own.owner_id = ro.owner_id
LEFT JOIN RENTAL_CONTRACT rc ON ro.object_id = rc.object_id
LEFT JOIN OWNER_PAYMENT op ON own.owner_id = op.owner_id
GROUP BY own.owner_id, own.full_name, own.email, own.bank_account;

-- Просроченные платежи (ожидают более 7 дней)
CREATE VIEW VW_OVERDUE_PAYMENTS AS
SELECT 
    p.payment_id,
    p.amount,
    p.payment_date,
    p.payment_type,
    p.status,
    rc.contract_id,
    rc.start_date,
    rc.end_date,
    cl.client_id,
    cl.full_name AS client_name,
    cl.phone AS client_phone,
    ro.address AS object_address,
    DATEDIFF(day, p.payment_date, GETDATE()) AS days_overdue
FROM PAYMENT p
JOIN RENTAL_CONTRACT rc ON p.contract_id = rc.contract_id
JOIN CLIENT cl ON p.client_id = cl.client_id
JOIN RENTAL_OBJECT ro ON rc.object_id = ro.object_id
WHERE p.status = N'Ожидает' 
    AND p.payment_date < DATEADD(day, -7, CAST(GETDATE() AS DATE));

-- Статистика по типам объектов
CREATE VIEW VW_OBJECT_TYPE_STATS AS
SELECT 
    ot.type_id,
    ot.type_name,
    ot.category,
    COUNT(ro.object_id) AS total_objects,
    COUNT(CASE WHEN ro.status = N'Свободен' THEN 1 END) AS available_count,
    COUNT(CASE WHEN ro.status = N'Занят' THEN 1 END) AS rented_count,
    AVG(ro.daily_rate) AS avg_daily_rate,
    MIN(ro.daily_rate) AS min_rate,
    MAX(ro.daily_rate) AS max_rate,
    AVG(ro.area) AS avg_area
FROM OBJECT_TYPE ot
LEFT JOIN RENTAL_OBJECT ro ON ot.type_id = ro.type_id
GROUP BY ot.type_id, ot.type_name, ot.category;

-- История платежей клиента с деталями
CREATE VIEW VW_CLIENT_PAYMENT_HISTORY AS
SELECT 
    cl.client_id,
    cl.full_name AS client_name,
    p.payment_id,
    p.amount,
    p.payment_date,
    p.payment_type,
    p.status,
    rc.contract_id,
    rc.start_date,
    rc.end_date,
    ro.address AS object_address
FROM CLIENT cl
JOIN PAYMENT p ON cl.client_id = p.client_id
JOIN RENTAL_CONTRACT rc ON p.contract_id = rc.contract_id
JOIN RENTAL_OBJECT ro ON rc.object_id = ro.object_id;

-- ============================================================
-- 3. ФУНКЦИИ
-- ============================================================

-- Расчет стоимости аренды по дням
CREATE FUNCTION FN_CALC_RENTAL_COST (
    @daily_rate DECIMAL(10,2),
    @start_date DATE,
    @end_date DATE
)
RETURNS DECIMAL(12,2)
AS
BEGIN
    IF @start_date >= @end_date RETURN 0;
    RETURN @daily_rate * DATEDIFF(day, @start_date, @end_date);
END;
GO

-- Получение дохода собственника за период
CREATE FUNCTION FN_GET_OWNER_INCOME (
    @owner_id INT,
    @start_date DATE,
    @end_date DATE
)
RETURNS DECIMAL(12,2)
AS
BEGIN
    DECLARE @income DECIMAL(12,2);
    SELECT @income = SUM(amount)
    FROM OWNER_PAYMENT
    WHERE owner_id = @owner_id 
        AND payment_date BETWEEN @start_date AND @end_date;
    RETURN ISNULL(@income, 0);
END;
GO

-- Проверка доступности объекта на даты
CREATE FUNCTION FN_CHECK_OBJECT_AVAILABILITY (
    @object_id INT,
    @start_date DATE,
    @end_date DATE
)
RETURNS BIT
AS
BEGIN
    IF EXISTS (
        SELECT 1 FROM RENTAL_CONTRACT rc
        WHERE rc.object_id = @object_id
            AND rc.status = N'Активен'
            AND @start_date < rc.end_date 
            AND @end_date > rc.start_date
    )
        RETURN 0; -- Недоступен
    RETURN 1; -- Доступен
END;
GO

-- ============================================================
-- 4. ПРОЦЕДУРЫ
-- ============================================================

-- Создание договора с автоматическим расчетом суммы
CREATE PROCEDURE SP_CREATE_CONTRACT
    @object_id INT,
    @client_id INT,
    @start_date DATE,
    @end_date DATE,
    @deposit_amount DECIMAL(12,2) = 0,
    @new_contract_id INT OUTPUT
AS
BEGIN
    SET NOCOUNT ON;
    
    DECLARE @daily_rate DECIMAL(10,2);
    DECLARE @total_amount DECIMAL(12,2);
    
    -- Получаем ставку объекта
    SELECT @daily_rate = daily_rate 
    FROM RENTAL_OBJECT 
    WHERE object_id = @object_id;
    
    IF @daily_rate IS NULL
    BEGIN
        RAISERROR(N'Объект не найден', 16, 1);
        RETURN;
    END
    
    -- Рассчитываем сумму
    SET @total_amount = dbo.FN_CALC_RENTAL_COST(@daily_rate, @start_date, @end_date);
    
    -- Проверяем доступность
    IF dbo.FN_CHECK_OBJECT_AVAILABILITY(@object_id, @start_date, @end_date) = 0
    BEGIN
        RAISERROR(N'Объект недоступен на указанные даты', 16, 1);
        RETURN;
    END
    
    -- Создаем договор
    INSERT INTO RENTAL_CONTRACT (object_id, client_id, start_date, end_date, 
                                 total_amount, deposit_amount, status)
    VALUES (@object_id, @client_id, @start_date, @end_date, 
            @total_amount, @deposit_amount, N'Активен');
    
    SET @new_contract_id = SCOPE_IDENTITY();
    
    -- Обновляем статус объекта
    UPDATE RENTAL_OBJECT 
    SET status = N'Занят' 
    WHERE object_id = @object_id;
    
    SELECT @new_contract_id AS contract_id, @total_amount AS calculated_amount;
END;
GO

-- Регистрация платежа и автоматическое создание выплаты собственнику
CREATE PROCEDURE SP_REGISTER_PAYMENT
    @contract_id INT,
    @amount DECIMAL(12,2),
    @payment_type NVARCHAR(20)
AS
BEGIN
    SET NOCOUNT ON;
    
    DECLARE @client_id INT;
    DECLARE @owner_id INT;
    DECLARE @owner_amount DECIMAL(12,2);
    DECLARE @commission DECIMAL(5,2) = 10.00;
    
    -- Получаем client_id из договора
    SELECT @client_id = client_id 
    FROM RENTAL_CONTRACT 
    WHERE contract_id = @contract_id;
    
    IF @client_id IS NULL
    BEGIN
        RAISERROR(N'Договор не найден', 16, 1);
        RETURN;
    END
    
    -- Регистрируем платеж клиента
    INSERT INTO PAYMENT (contract_id, client_id, amount, payment_type, status)
    VALUES (@contract_id, @client_id, @amount, @payment_type, N'Выполнен');
    
    -- Получаем owner_id
    SELECT @owner_id = ro.owner_id 
    FROM RENTAL_OBJECT ro
    JOIN RENTAL_CONTRACT rc ON ro.object_id = rc.object_id
    WHERE rc.contract_id = @contract_id;
    
    -- Рассчитываем сумму для собственника (минус комиссия)
    SET @owner_amount = @amount * (1 - @commission / 100);
    
    -- Создаем выплату собственнику
    INSERT INTO OWNER_PAYMENT (owner_id, contract_id, amount, commission_percent)
    VALUES (@owner_id, @contract_id, @owner_amount, @commission);
    
    SELECT 
        SCOPE_IDENTITY() AS payment_id,
        @owner_amount AS owner_payment_amount,
        @commission AS commission_percent;
END;
GO

-- Завершение договора и освобождение объекта
CREATE PROCEDURE SP_CLOSE_CONTRACT
    @contract_id INT,
    @return_deposit BIT = 0
AS
BEGIN
    SET NOCOUNT ON;
    
    DECLARE @object_id INT;
    DECLARE @deposit_amount DECIMAL(12,2);
    
    SELECT 
        @object_id = object_id,
        @deposit_amount = deposit_amount
    FROM RENTAL_CONTRACT 
    WHERE contract_id = @contract_id;
    
    IF @object_id IS NULL
    BEGIN
        RAISERROR(N'Договор не найден', 16, 1);
        RETURN;
    END
    
    -- Обновляем статус договора
    UPDATE RENTAL_CONTRACT 
    SET status = N'Завершен' 
    WHERE contract_id = @contract_id;
    
    -- Освобождаем объект
    UPDATE RENTAL_OBJECT 
    SET status = N'Свободен' 
    WHERE object_id = @object_id;
    
    -- Если нужно вернуть залог — создаем платеж с отрицательной суммой
    IF @return_deposit = 1 AND @deposit_amount > 0
    BEGIN
        DECLARE @client_id INT;
        SELECT @client_id = client_id FROM RENTAL_CONTRACT WHERE contract_id = @contract_id;
        
        INSERT INTO PAYMENT (contract_id, client_id, amount, payment_type, status)
        VALUES (@contract_id, @client_id, -@deposit_amount, N'Возврат залога', N'Выполнен');
    END
    
    SELECT N'Договор завершен, объект освобожден' AS result;
END;
GO

-- ============================================================
-- 5. ТРИГГЕРЫ
-- ============================================================

-- Триггер: автоматический расчет total_amount при вставке договора
CREATE TRIGGER TR_CALC_CONTRACT_AMOUNT
ON RENTAL_CONTRACT
INSTEAD OF INSERT
AS
BEGIN
    SET NOCOUNT ON;
    
    INSERT INTO RENTAL_CONTRACT (object_id, client_id, start_date, end_date, 
                                 total_amount, status, deposit_amount)
    SELECT 
        i.object_id,
        i.client_id,
        i.start_date,
        i.end_date,
        dbo.FN_CALC_RENTAL_COST(ro.daily_rate, i.start_date, i.end_date),
        ISNULL(i.status, N'Активен'),
        ISNULL(i.deposit_amount, 0)
    FROM inserted i
    JOIN RENTAL_OBJECT ro ON i.object_id = ro.object_id;
    
    -- Обновляем статус объекта
    UPDATE RENTAL_OBJECT 
    SET status = N'Занят' 
    WHERE object_id IN (SELECT object_id FROM inserted);
END;
GO

-- Триггер: проверка пересечения бронирований
CREATE TRIGGER TR_CHECK_BOOKING_OVERLAP
ON BOOKING
INSTEAD OF INSERT
AS
BEGIN
    SET NOCOUNT ON;
    
    IF EXISTS (
        SELECT 1 
        FROM inserted i
        JOIN BOOKING b ON i.object_id = b.object_id
        WHERE b.status IN (N'Активна', N'Подтверждена')
        AND i.planned_start < b.planned_end 
        AND i.planned_end > b.planned_start
    )
    BEGIN
        RAISERROR(N'Объект уже забронирован на эти даты', 16, 1);
        RETURN;
    END;
    
    INSERT INTO BOOKING (object_id, client_id, planned_start, planned_end, status)
    SELECT object_id, client_id, planned_start, planned_end, 
           ISNULL(status, N'Активна')
    FROM inserted;
END;
GO

-- Триггер: обновление статуса объекта при подтверждении бронирования
CREATE TRIGGER TR_UPDATE_OBJECT_ON_BOOKING
ON BOOKING
AFTER UPDATE
AS
BEGIN
    SET NOCOUNT ON;
    
    IF UPDATE(status)
    BEGIN
        UPDATE RENTAL_OBJECT 
        SET status = N'Забронирован'
        WHERE object_id IN (
            SELECT object_id FROM inserted 
            WHERE status = N'Подтверждена'
        );
    END
END;
GO

-- ============================================================
-- 6. ПРАВА ДОСТУПА (Роли)
-- ============================================================

-- Создание ролей
IF NOT EXISTS (SELECT * FROM sys.database_principals WHERE name = N'ROLE_ADMIN')
    CREATE ROLE ROLE_ADMIN;
    
IF NOT EXISTS (SELECT * FROM sys.database_principals WHERE name = N'ROLE_MANAGER')
    CREATE ROLE ROLE_MANAGER;
    
IF NOT EXISTS (SELECT * FROM sys.database_principals WHERE name = N'ROLE_ACCOUNTANT')
    CREATE ROLE ROLE_ACCOUNTANT;

-- Права для менеджера
GRANT SELECT, INSERT, UPDATE ON CLIENT TO ROLE_MANAGER;
GRANT SELECT, INSERT, UPDATE ON RENTAL_CONTRACT TO ROLE_MANAGER;
GRANT SELECT, INSERT, UPDATE ON BOOKING TO ROLE_MANAGER;
GRANT SELECT ON RENTAL_OBJECT TO ROLE_MANAGER;
GRANT SELECT ON OWNER TO ROLE_MANAGER;
GRANT SELECT ON OBJECT_TYPE TO ROLE_MANAGER;
GRANT SELECT ON VW_AVAILABLE_OBJECTS TO ROLE_MANAGER;
GRANT SELECT ON VW_ACTIVE_CONTRACTS TO ROLE_MANAGER;
GRANT EXECUTE ON SP_CREATE_CONTRACT TO ROLE_MANAGER;

-- Права для бухгалтера
GRANT SELECT, INSERT, UPDATE ON PAYMENT TO ROLE_ACCOUNTANT;
GRANT SELECT, INSERT, UPDATE ON OWNER_PAYMENT TO ROLE_ACCOUNTANT;
GRANT SELECT ON RENTAL_CONTRACT TO ROLE_ACCOUNTANT;
GRANT SELECT ON CLIENT TO ROLE_ACCOUNTANT;
GRANT SELECT ON OWNER TO ROLE_ACCOUNTANT;
GRANT SELECT ON VW_OWNER_FINANCE TO ROLE_ACCOUNTANT;
GRANT SELECT ON VW_OVERDUE_PAYMENTS TO ROLE_ACCOUNTANT;
GRANT EXECUTE ON SP_REGISTER_PAYMENT TO ROLE_ACCOUNTANT;
GRANT EXECUTE ON SP_CLOSE_CONTRACT TO ROLE_ACCOUNTANT;

-- Права для администратора
GRANT SELECT, INSERT, UPDATE, DELETE ON SCHEMA::dbo TO ROLE_ADMIN;
GRANT EXECUTE ON SCHEMA::dbo TO ROLE_ADMIN;