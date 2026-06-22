
-- Таблица типов объектов
CREATE TABLE OBJECT_TYPE (
    type_id NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    type_name VARCHAR2(50) NOT NULL UNIQUE,
    category VARCHAR2(50) NOT NULL CHECK (category IN ('Жилая', 'Коммерческая', 'Транспорт', 'Оборудование'))
);

-- Таблица собственников
CREATE TABLE OWNER (
    owner_id NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    full_name VARCHAR2(100) NOT NULL,
    phone VARCHAR2(20) NOT NULL,
    email VARCHAR2(100) UNIQUE,
    passport_data VARCHAR2(100) NOT NULL,
    bank_account VARCHAR2(50),
    CONSTRAINT chk_owner_email CHECK (email LIKE '%@%.%')
);

-- Таблица клиентов
CREATE TABLE CLIENT (
    client_id NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    full_name VARCHAR2(100) NOT NULL,
    phone VARCHAR2(20) NOT NULL,
    email VARCHAR2(100) UNIQUE,
    passport_data VARCHAR2(100) NOT NULL,
    client_type VARCHAR2(20) DEFAULT 'Физ. лицо' NOT NULL CHECK (client_type IN ('Физ. лицо', 'Юр. лицо')),
    registration_date DATE DEFAULT SYSDATE NOT NULL,
    CONSTRAINT chk_client_email CHECK (email LIKE '%@%.%')
);

-- Таблица объектов аренды
CREATE TABLE RENTAL_OBJECT (
    object_id NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    owner_id NUMBER NOT NULL,
    type_id NUMBER NOT NULL,
    address VARCHAR2(200) NOT NULL,
    area NUMBER(10,2),
    daily_rate NUMBER(10,2) NOT NULL CHECK (daily_rate > 0),
    status VARCHAR2(20) DEFAULT 'Свободен' NOT NULL CHECK (status IN ('Свободен', 'Занят', 'На ремонте', 'Забронирован')),
    description VARCHAR2(500),
    FOREIGN KEY (owner_id) REFERENCES OWNER(owner_id) ON DELETE CASCADE,
    FOREIGN KEY (type_id) REFERENCES OBJECT_TYPE(type_id)
);

-- Таблица договоров аренды
CREATE TABLE RENTAL_CONTRACT (
    contract_id NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    object_id NUMBER NOT NULL,
    client_id NUMBER NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    total_amount NUMBER(12,2) NOT NULL,
    status VARCHAR2(20) DEFAULT 'Активен' NOT NULL CHECK (status IN ('Активен', 'Завершен', 'Расторгнут')),
    deposit_amount NUMBER(12,2) DEFAULT 0,
    FOREIGN KEY (object_id) REFERENCES RENTAL_OBJECT(object_id),
    FOREIGN KEY (client_id) REFERENCES CLIENT(client_id),
    CONSTRAINT chk_dates CHECK (end_date > start_date)
);

-- Таблица платежей клиентов
CREATE TABLE PAYMENT (
    payment_id NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    contract_id NUMBER NOT NULL,
    client_id NUMBER NOT NULL,
    payment_date DATE DEFAULT SYSDATE NOT NULL,
    amount NUMBER(12,2) NOT NULL CHECK (amount > 0),
    payment_type VARCHAR2(20) NOT NULL CHECK (payment_type IN ('Наличные', 'Безналичные', 'Карта', 'Онлайн')),
    status VARCHAR2(20) DEFAULT 'Ожидает' NOT NULL CHECK (status IN ('Ожидает', 'Выполнен', 'Отменен')),
    FOREIGN KEY (contract_id) REFERENCES RENTAL_CONTRACT(contract_id),
    FOREIGN KEY (client_id) REFERENCES CLIENT(client_id)
);

-- Таблица выплат собственникам
CREATE TABLE OWNER_PAYMENT (
    owner_payment_id NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    owner_id NUMBER NOT NULL,
    contract_id NUMBER NOT NULL,
    payment_date DATE DEFAULT SYSDATE NOT NULL,
    amount NUMBER(12,2) NOT NULL,
    commission_percent NUMBER(5,2) DEFAULT 10.00 NOT NULL,
    FOREIGN KEY (owner_id) REFERENCES OWNER(owner_id),
    FOREIGN KEY (contract_id) REFERENCES RENTAL_CONTRACT(contract_id)
);

-- Таблица обслуживания
CREATE TABLE MAINTENANCE (
    maintenance_id NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    object_id NUMBER NOT NULL,
    maintenance_date DATE DEFAULT SYSDATE NOT NULL,
    description VARCHAR2(500) NOT NULL,
    cost NUMBER(10,2) DEFAULT 0,
    executor VARCHAR2(100),
    FOREIGN KEY (object_id) REFERENCES RENTAL_OBJECT(object_id)
);

-- Таблица бронирований
CREATE TABLE BOOKING (
    booking_id NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    object_id NUMBER NOT NULL,
    client_id NUMBER NOT NULL,
    booking_date DATE DEFAULT SYSDATE NOT NULL,
    planned_start DATE NOT NULL,
    planned_end DATE NOT NULL,
    status VARCHAR2(20) DEFAULT 'Активна' NOT NULL CHECK (status IN ('Активна', 'Подтверждена', 'Отменена', 'Исполнена')),
    FOREIGN KEY (object_id) REFERENCES RENTAL_OBJECT(object_id),
    FOREIGN KEY (client_id) REFERENCES CLIENT(client_id),
    CONSTRAINT chk_booking_dates CHECK (planned_end > planned_start)
);

-- Индексы для оптимизации
CREATE INDEX idx_rental_object_status ON RENTAL_OBJECT(status);
CREATE INDEX idx_rental_contract_dates ON RENTAL_CONTRACT(start_date, end_date);
CREATE INDEX idx_payment_date ON PAYMENT(payment_date);
CREATE INDEX idx_client_phone ON CLIENT(phone);

-- Триггер для автоматического расчета total_amount (Oracle синтаксис)
CREATE OR REPLACE TRIGGER tr_calc_total_amount
BEFORE INSERT OR UPDATE ON RENTAL_CONTRACT
FOR EACH ROW
DECLARE
    v_daily_rate NUMBER;
BEGIN
    SELECT daily_rate INTO v_daily_rate 
    FROM RENTAL_OBJECT 
    WHERE object_id = :NEW.object_id;
    
    :NEW.total_amount := (:NEW.end_date - :NEW.start_date) * v_daily_rate;
END;
/

-- Создание представлений для безопасности (опционально)
CREATE VIEW v_available_objects AS
SELECT * FROM RENTAL_OBJECT WHERE status = 'Свободен';

-- Комментарии к таблицам (документация)
COMMENT ON TABLE CLIENT IS 'Клиенты системы аренды';
COMMENT ON TABLE OWNER IS 'Собственники объектов аренды';
COMMENT ON TABLE RENTAL_OBJECT IS 'Объекты недвижимости и имущества для аренды';
COMMENT ON TABLE RENTAL_CONTRACT IS 'Договоры аренды между клиентами и собственниками';