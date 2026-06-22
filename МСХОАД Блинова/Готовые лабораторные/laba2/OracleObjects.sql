-- ============================================================
-- ORACLE — ДОПОЛНИТЕЛЬНЫЕ ОБЪЕКТЫ
-- ============================================================

-- ============================================================
-- 1. ДОПОЛНИТЕЛЬНЫЕ ИНДЕКСЫ
-- ============================================================

CREATE INDEX idx_rental_object_owner ON RENTAL_OBJECT(owner_id);
CREATE INDEX idx_rental_object_type ON RENTAL_OBJECT(type_id);
CREATE INDEX idx_rental_contract_client ON RENTAL_CONTRACT(client_id);
CREATE INDEX idx_rental_contract_object ON RENTAL_CONTRACT(object_id);
CREATE INDEX idx_payment_contract ON PAYMENT(contract_id);
CREATE INDEX idx_payment_client ON PAYMENT(client_id);
CREATE INDEX idx_owner_payment_date ON OWNER_PAYMENT(payment_date);
CREATE INDEX idx_owner_payment_owner ON OWNER_PAYMENT(owner_id);
CREATE INDEX idx_maintenance_object ON MAINTENANCE(object_id);
CREATE INDEX idx_maintenance_date ON MAINTENANCE(maintenance_date);
CREATE INDEX idx_booking_object ON BOOKING(object_id);
CREATE INDEX idx_booking_client ON BOOKING(client_id);
CREATE INDEX idx_booking_dates ON BOOKING(planned_start, planned_end);
CREATE INDEX idx_contract_status_dates ON RENTAL_CONTRACT(status, start_date, end_date);

-- ============================================================
-- 2. ПРЕДСТАВЛЕНИЯ (VIEWS)
-- ============================================================

-- Доступные объекты (расширенное)
CREATE OR REPLACE VIEW vw_available_objects_detail AS
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
WHERE ro.status = 'Свободен';

-- Активные договоры с деталями
CREATE OR REPLACE VIEW vw_active_contracts AS
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
    cl.client_id,
    cl.full_name AS client_name,
    cl.phone AS client_phone,
    own.owner_id,
    own.full_name AS owner_name,
    (rc.end_date - rc.start_date) AS rental_days
FROM RENTAL_CONTRACT rc
JOIN RENTAL_OBJECT ro ON rc.object_id = ro.object_id
JOIN CLIENT cl ON rc.client_id = cl.client_id
JOIN OWNER own ON ro.owner_id = own.owner_id
WHERE rc.status = 'Активен';

-- Финансовая сводка по собственникам
CREATE OR REPLACE VIEW vw_owner_finance AS
SELECT 
    own.owner_id,
    own.full_name,
    own.email,
    own.bank_account,
    COUNT(DISTINCT ro.object_id) AS total_objects,
    COUNT(DISTINCT rc.contract_id) AS total_contracts,
    NVL(SUM(op.amount), 0) AS total_paid,
    NVL(AVG(op.commission_percent), 10) AS avg_commission
FROM OWNER own
LEFT JOIN RENTAL_OBJECT ro ON own.owner_id = ro.owner_id
LEFT JOIN RENTAL_CONTRACT rc ON ro.object_id = rc.object_id
LEFT JOIN OWNER_PAYMENT op ON own.owner_id = op.owner_id
GROUP BY own.owner_id, own.full_name, own.email, own.bank_account;

-- Просроченные платежи
CREATE OR REPLACE VIEW vw_overdue_payments AS
SELECT 
    p.payment_id,
    p.amount,
    p.payment_date,
    p.status,
    cl.full_name AS client_name,
    cl.phone AS client_phone,
    TRUNC(SYSDATE - p.payment_date) AS days_overdue
FROM PAYMENT p
JOIN CLIENT cl ON p.client_id = cl.client_id
WHERE p.status = 'Ожидает' 
    AND p.payment_date < SYSDATE - 7;

-- Статистика по типам объектов
CREATE OR REPLACE VIEW vw_object_type_stats AS
SELECT 
    ot.type_id,
    ot.type_name,
    ot.category,
    COUNT(ro.object_id) AS total_objects,
    COUNT(CASE WHEN ro.status = 'Свободен' THEN 1 END) AS available_count,
    AVG(ro.daily_rate) AS avg_daily_rate
FROM OBJECT_TYPE ot
LEFT JOIN RENTAL_OBJECT ro ON ot.type_id = ro.type_id
GROUP BY ot.type_id, ot.type_name, ot.category;

-- ============================================================
-- 3. ФУНКЦИИ
-- ============================================================

-- Расчет стоимости аренды
CREATE OR REPLACE FUNCTION fn_calc_rental_cost (
    p_daily_rate IN NUMBER,
    p_start_date IN DATE,
    p_end_date IN DATE
) RETURN NUMBER IS
BEGIN
    RETURN p_daily_rate * (p_end_date - p_start_date);
END;
/

-- Доход собственника за период
CREATE OR REPLACE FUNCTION fn_get_owner_income (
    p_owner_id IN NUMBER,
    p_start_date IN DATE,
    p_end_date IN DATE
) RETURN NUMBER IS
    v_income NUMBER;
BEGIN
    SELECT NVL(SUM(amount), 0) INTO v_income
    FROM OWNER_PAYMENT
    WHERE owner_id = p_owner_id 
        AND payment_date BETWEEN p_start_date AND p_end_date;
    RETURN v_income;
END;
/

-- ============================================================
-- 4. ПРОЦЕДУРЫ
-- ============================================================

-- Создание договора с авторасчетом
CREATE OR REPLACE PROCEDURE sp_create_contract (
    p_object_id IN NUMBER,
    p_client_id IN NUMBER,
    p_start_date IN DATE,
    p_end_date IN DATE,
    p_deposit_amount IN NUMBER DEFAULT 0,
    p_new_contract_id OUT NUMBER
) IS
    v_daily_rate NUMBER;
    v_total_amount NUMBER;
BEGIN
    SELECT daily_rate INTO v_daily_rate 
    FROM RENTAL_OBJECT 
    WHERE object_id = p_object_id;
    
    v_total_amount := fn_calc_rental_cost(v_daily_rate, p_start_date, p_end_date);
    
    INSERT INTO RENTAL_CONTRACT (object_id, client_id, start_date, end_date, 
                                 total_amount, deposit_amount)
    VALUES (p_object_id, p_client_id, p_start_date, p_end_date, 
            v_total_amount, p_deposit_amount)
    RETURNING contract_id INTO p_new_contract_id;
    
    UPDATE RENTAL_OBJECT 
    SET status = 'Занят' 
    WHERE object_id = p_object_id;
    
    COMMIT;
END;
/

-- Регистрация платежа с выплатой собственнику
CREATE OR REPLACE PROCEDURE sp_register_payment (
    p_contract_id IN NUMBER,
    p_amount IN NUMBER,
    p_payment_type IN VARCHAR2
) IS
    v_client_id NUMBER;
    v_owner_id NUMBER;
    v_owner_amount NUMBER;
BEGIN
    SELECT client_id INTO v_client_id 
    FROM RENTAL_CONTRACT 
    WHERE contract_id = p_contract_id;
    
    INSERT INTO PAYMENT (contract_id, client_id, amount, payment_type, status)
    VALUES (p_contract_id, v_client_id, p_amount, p_payment_type, 'Выполнен');
    
    SELECT ro.owner_id INTO v_owner_id 
    FROM RENTAL_OBJECT ro
    JOIN RENTAL_CONTRACT rc ON ro.object_id = rc.object_id
    WHERE rc.contract_id = p_contract_id;
    
    v_owner_amount := p_amount * 0.9;
    
    INSERT INTO OWNER_PAYMENT (owner_id, contract_id, amount, commission_percent)
    VALUES (v_owner_id, p_contract_id, v_owner_amount, 10);
    
    COMMIT;
END;
/

-- ============================================================
-- 5. ДОПОЛНИТЕЛЬНЫЕ ТРИГГЕРЫ
-- ============================================================

-- Проверка пересечения бронирований
CREATE OR REPLACE TRIGGER tr_check_booking_overlap
BEFORE INSERT OR UPDATE ON BOOKING
FOR EACH ROW
DECLARE
    v_count NUMBER;
BEGIN
    SELECT COUNT(*) INTO v_count
    FROM BOOKING b
    WHERE b.object_id = :NEW.object_id 
    AND b.status IN ('Активна', 'Подтверждена')
    AND b.booking_id != NVL(:NEW.booking_id, 0)
    AND :NEW.planned_start < b.planned_end 
    AND :NEW.planned_end > b.planned_start;
    
    IF v_count > 0 THEN
        RAISE_APPLICATION_ERROR(-20001, 'Объект уже забронирован на эти даты');
    END IF;
END;
/

-- Обновление статуса объекта при бронировании
CREATE OR REPLACE TRIGGER tr_update_object_on_booking
AFTER UPDATE ON BOOKING
FOR EACH ROW
BEGIN
    IF :NEW.status = 'Подтверждена' AND :OLD.status != 'Подтверждена' THEN
        UPDATE RENTAL_OBJECT 
        SET status = 'Забронирован' 
        WHERE object_id = :NEW.object_id;
    END IF;
END;
/