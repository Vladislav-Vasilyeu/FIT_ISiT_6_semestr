-- SQL Server Implementation
-- Создание базы данных
CREATE DATABASE RentalService;
GO

USE RentalService;
GO

-- Таблица типов объектов
CREATE TABLE OBJECT_TYPE (
    type_id INT IDENTITY(1,1) PRIMARY KEY,
    type_name NVARCHAR(50) NOT NULL,
    category NVARCHAR(50) NOT NULL CHECK (category IN ('Жилая', 'Коммерческая', 'Транспорт', 'Оборудование')),
    CONSTRAINT UQ_TYPE_NAME UNIQUE (type_name)
);

-- Таблица собственников
CREATE TABLE OWNER (
    owner_id INT IDENTITY(1,1) PRIMARY KEY,
    full_name NVARCHAR(100) NOT NULL,
    phone NVARCHAR(20) NOT NULL,
    email NVARCHAR(100),
    passport_data NVARCHAR(100) NOT NULL,
    bank_account NVARCHAR(50),
    CONSTRAINT UQ_OWNER_EMAIL UNIQUE (email),
    CONSTRAINT CHK_OWNER_EMAIL CHECK (email LIKE '%@%.%')
);

-- Таблица клиентов
CREATE TABLE CLIENT (
    client_id INT IDENTITY(1,1) PRIMARY KEY,
    full_name NVARCHAR(100) NOT NULL,
    phone NVARCHAR(20) NOT NULL,
    email NVARCHAR(100),
    passport_data NVARCHAR(100) NOT NULL,
    client_type NVARCHAR(20) NOT NULL DEFAULT ('Физическое лицо') CHECK (client_type IN ('Физическое лицо', 'Юридическое лицо')),
    registration_date DATE NOT NULL DEFAULT GETDATE(),
    CONSTRAINT UQ_CLIENT_EMAIL UNIQUE (email),
    CONSTRAINT CHK_CLIENT_EMAIL CHECK (email LIKE '%@%.%')
);

-- Таблица объектов аренды
CREATE TABLE RENTAL_OBJECT (
    object_id INT IDENTITY(1,1) PRIMARY KEY,
    owner_id INT NOT NULL,
    type_id INT NOT NULL,
    address NVARCHAR(200) NOT NULL,
    area DECIMAL(10,2),
    daily_rate DECIMAL(10,2) NOT NULL CHECK (daily_rate > 0),
    status NVARCHAR(20) NOT NULL DEFAULT ('Свободен') CHECK (status IN ('Свободен', 'Занят', 'На ремонте', 'Забронирован')),
    description NVARCHAR(500),
    FOREIGN KEY (owner_id) REFERENCES OWNER(owner_id) ON DELETE CASCADE,
    FOREIGN KEY (type_id) REFERENCES OBJECT_TYPE(type_id)
);

-- Таблица договоров аренды
CREATE TABLE RENTAL_CONTRACT (
    contract_id INT IDENTITY(1,1) PRIMARY KEY,
    object_id INT NOT NULL,
    client_id INT NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    total_amount DECIMAL(12,2) NOT NULL,
    status NVARCHAR(20) NOT NULL DEFAULT ('Активен') CHECK (status IN ('Активен', 'Завершен', 'Расторгнут')),
    deposit_amount DECIMAL(12,2) DEFAULT (0),
    FOREIGN KEY (object_id) REFERENCES RENTAL_OBJECT(object_id),
    FOREIGN KEY (client_id) REFERENCES CLIENT(client_id),
    CONSTRAINT CHK_DATES CHECK (end_date > start_date)
);

-- Таблица платежей клиентов
CREATE TABLE PAYMENT (
    payment_id INT IDENTITY(1,1) PRIMARY KEY,
    contract_id INT NOT NULL,
    client_id INT NOT NULL,
    payment_date DATE NOT NULL DEFAULT GETDATE(),
    amount DECIMAL(12,2) NOT NULL CHECK (amount > 0),
    payment_type NVARCHAR(20) NOT NULL CHECK (payment_type IN ('Наличные', 'Безналичные', 'Карта', 'Онлайн')),
    status NVARCHAR(20) NOT NULL DEFAULT ('Ожидает') CHECK (status IN ('Ожидает', 'Выполнен', 'Отменен')),
    FOREIGN KEY (contract_id) REFERENCES RENTAL_CONTRACT(contract_id),
    FOREIGN KEY (client_id) REFERENCES CLIENT(client_id)
);

-- Таблица выплат собственникам
CREATE TABLE OWNER_PAYMENT (
    owner_payment_id INT IDENTITY(1,1) PRIMARY KEY,
    owner_id INT NOT NULL,
    contract_id INT NOT NULL,
    payment_date DATE NOT NULL DEFAULT GETDATE(),
    amount DECIMAL(12,2) NOT NULL,
    commission_percent DECIMAL(5,2) NOT NULL DEFAULT (10.00),
    FOREIGN KEY (owner_id) REFERENCES OWNER(owner_id),
    FOREIGN KEY (contract_id) REFERENCES RENTAL_CONTRACT(contract_id)
);

-- Таблица обслуживания
CREATE TABLE MAINTENANCE (
    maintenance_id INT IDENTITY(1,1) PRIMARY KEY,
    object_id INT NOT NULL,
    maintenance_date DATE NOT NULL DEFAULT GETDATE(),
    description NVARCHAR(500) NOT NULL,
    cost DECIMAL(10,2) DEFAULT (0),
    executor NVARCHAR(100),
    FOREIGN KEY (object_id) REFERENCES RENTAL_OBJECT(object_id)
);

-- Таблица бронирований
CREATE TABLE BOOKING (
    booking_id INT IDENTITY(1,1) PRIMARY KEY,
    object_id INT NOT NULL,
    client_id INT NOT NULL,
    booking_date DATE NOT NULL DEFAULT GETDATE(),
    planned_start DATE NOT NULL,
    planned_end DATE NOT NULL,
    status NVARCHAR(20) NOT NULL DEFAULT ('Активна') CHECK (status IN ('Активна', 'Подтверждена', 'Отменена', 'Исполнена')),
    FOREIGN KEY (object_id) REFERENCES RENTAL_OBJECT(object_id),
    FOREIGN KEY (client_id) REFERENCES CLIENT(client_id),
    CONSTRAINT CHK_BOOKING_DATES CHECK (planned_end > planned_start)
);

-- Индексы для оптимизации
CREATE INDEX IX_RENTAL_OBJECT_STATUS ON RENTAL_OBJECT(status);
CREATE INDEX IX_RENTAL_CONTRACT_DATES ON RENTAL_CONTRACT(start_date, end_date);
CREATE INDEX IX_PAYMENT_DATE ON PAYMENT(payment_date);
CREATE INDEX IX_CLIENT_PHONE ON CLIENT(phone);

-- Триггер для автоматического расчета total_amount в договоре
CREATE TRIGGER TR_CALC_TOTAL_AMOUNT
ON RENTAL_CONTRACT
FOR INSERT, UPDATE
AS
BEGIN
    UPDATE rc
    SET total_amount = DATEDIFF(day, i.start_date, i.end_date) * ro.daily_rate
    FROM RENTAL_CONTRACT rc
    INNER JOIN inserted i ON rc.contract_id = i.contract_id
    INNER JOIN RENTAL_OBJECT ro ON i.object_id = ro.object_id;
END;
GO