PRAGMA foreign_keys = ON;


CREATE TABLE IF NOT EXISTS object_type (
    type_id INTEGER PRIMARY KEY AUTOINCREMENT,
    type_name TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('Жилая', 'Коммерческая', 'Транспорт', 'Оборудование')),
    parent_id INTEGER REFERENCES object_type(type_id) ON DELETE SET NULL,
    hierarchy_path TEXT DEFAULT '/'
);

CREATE TABLE IF NOT EXISTS owner (
    owner_id INTEGER PRIMARY KEY AUTOINCREMENT,
    full_name TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT,
    passport_data TEXT NOT NULL,
    bank_account TEXT,
    created_at TEXT DEFAULT (datetime('now', 'localtime')),
    sync_status TEXT DEFAULT 'pending' CHECK (sync_status IN ('synced', 'pending', 'conflict'))
);

CREATE TABLE IF NOT EXISTS client (
    client_id INTEGER PRIMARY KEY AUTOINCREMENT,
    full_name TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT,
    passport_data TEXT NOT NULL,
    client_type TEXT DEFAULT 'Физ. лицо' CHECK (client_type IN ('Физ. лицо', 'Юр. лицо')),
    registration_date TEXT DEFAULT (date('now')),
    sync_status TEXT DEFAULT 'pending' CHECK (sync_status IN ('synced', 'pending', 'conflict'))
);

CREATE TABLE IF NOT EXISTS rental_object (
    object_id INTEGER PRIMARY KEY AUTOINCREMENT,
    owner_id INTEGER NOT NULL REFERENCES owner(owner_id) ON DELETE CASCADE,
    type_id INTEGER NOT NULL REFERENCES object_type(type_id) ON DELETE RESTRICT,
    address TEXT NOT NULL,
    area REAL,
    daily_rate REAL NOT NULL CHECK (daily_rate > 0),
    status TEXT DEFAULT 'Свободен' CHECK (status IN ('Свободен', 'Занят', 'На ремонте', 'Забронирован')),
    description TEXT,
    latitude REAL,
    longitude REAL,
    photo_path TEXT,
    created_at TEXT DEFAULT (datetime('now', 'localtime')),
    updated_at TEXT DEFAULT (datetime('now', 'localtime')),
    sync_status TEXT DEFAULT 'pending'
);

CREATE TABLE IF NOT EXISTS object_inspection (
    inspection_id INTEGER PRIMARY KEY AUTOINCREMENT,
    object_id INTEGER NOT NULL REFERENCES rental_object(object_id) ON DELETE CASCADE,
    agent_id INTEGER,
    inspection_date TEXT DEFAULT (datetime('now', 'localtime')),
    condition_rating INTEGER CHECK (condition_rating BETWEEN 1 AND 5),
    notes TEXT,
    photo_paths TEXT,
    sync_status TEXT DEFAULT 'pending'
);

CREATE TABLE IF NOT EXISTS local_contract_draft (
    draft_id INTEGER PRIMARY KEY AUTOINCREMENT,
    object_id INTEGER NOT NULL REFERENCES rental_object(object_id) ON DELETE CASCADE,
    client_id INTEGER REFERENCES client(client_id) ON DELETE SET NULL,
    start_date TEXT NOT NULL,
    end_date TEXT NOT NULL,
    daily_rate REAL NOT NULL,
    total_amount REAL,
    deposit_amount REAL DEFAULT 0,
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'approved', 'rejected')),
    created_by_agent_id INTEGER,
    created_at TEXT DEFAULT (datetime('now', 'localtime')),
    sent_to_server_at TEXT,
    server_contract_id INTEGER
);


CREATE TABLE IF NOT EXISTS change_log (
    log_id INTEGER PRIMARY KEY AUTOINCREMENT,
    table_name TEXT NOT NULL,
    record_id INTEGER NOT NULL,
    operation TEXT NOT NULL CHECK (operation IN ('INSERT', 'UPDATE', 'DELETE')),
    old_values TEXT,
    new_values TEXT,
    changed_by_agent_id INTEGER,
    changed_at TEXT DEFAULT (datetime('now', 'localtime')),
    synced INTEGER DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_rental_object_status ON rental_object(status);
CREATE INDEX IF NOT EXISTS idx_rental_object_owner ON rental_object(owner_id);
CREATE INDEX IF NOT EXISTS idx_rental_object_type ON rental_object(type_id);
CREATE INDEX IF NOT EXISTS idx_rental_object_coords ON rental_object(latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_owner_phone ON owner(phone);
CREATE INDEX IF NOT EXISTS idx_client_phone ON client(phone);
CREATE INDEX IF NOT EXISTS idx_inspection_object ON object_inspection(object_id);
CREATE INDEX IF NOT EXISTS idx_contract_draft_status ON local_contract_draft(status);

CREATE VIEW IF NOT EXISTS vw_available_for_map AS
SELECT 
    ro.object_id,
    ro.address,
    ro.daily_rate,
    ro.latitude,
    ro.longitude,
    ro.status,
    ot.type_name,
    own.full_name AS owner_name,
    own.phone AS owner_phone
FROM rental_object ro
JOIN object_type ot ON ro.type_id = ot.type_id
JOIN owner own ON ro.owner_id = own.owner_id
WHERE ro.status = 'Свободен' AND ro.latitude IS NOT NULL;


CREATE VIEW IF NOT EXISTS vw_pending_sync AS
SELECT 'rental_object' AS table_name, object_id AS record_id, sync_status, updated_at as last_modified
FROM rental_object WHERE sync_status != 'synced'
UNION ALL
SELECT 'owner', owner_id, sync_status, created_at
FROM owner WHERE sync_status != 'synced'
UNION ALL
SELECT 'client', client_id, sync_status, created_at
FROM client WHERE sync_status != 'synced';

CREATE TRIGGER IF NOT EXISTS tr_calc_contract_amount
BEFORE INSERT ON local_contract_draft
FOR EACH ROW
BEGIN
    SELECT CASE 
        WHEN NEW.start_date >= NEW.end_date THEN
            RAISE(ABORT, 'Дата окончания должна быть позже даты начала')
    END;
    
    UPDATE rental_object SET updated_at = datetime('now', 'localtime') 
    WHERE object_id = NEW.object_id;
END;


CREATE TRIGGER IF NOT EXISTS tr_log_object_update
AFTER UPDATE ON rental_object
FOR EACH ROW
BEGIN
    INSERT INTO change_log (table_name, record_id, operation, old_values, new_values)
    VALUES (
        'rental_object',
        OLD.object_id,
        'UPDATE',
        json_object('status', OLD.status, 'daily_rate', OLD.daily_rate),
        json_object('status', NEW.status, 'daily_rate', NEW.daily_rate)
    );
END;

INSERT INTO object_type (type_name, category, parent_id, hierarchy_path) VALUES
('Квартира', 'Жилая', NULL, '/1/'),
('Дом', 'Жилая', NULL, '/2/'),
('Офис', 'Коммерческая', NULL, '/3/'),
('Склад', 'Коммерческая', NULL, '/4/');


INSERT INTO owner (full_name, phone, email, passport_data, bank_account, sync_status) VALUES
('Иванов Сергей Петрович', '+79001234567', 'ivanov@mail.ru', '4515 123456', '40817810100001234567', 'synced'),
('Петрова Мария Ивановна', '+79009876543', 'petrova@mail.ru', '4515 654321', '40817810100007654321', 'synced');


INSERT INTO client (full_name, phone, email, passport_data, client_type, sync_status) VALUES
('Смирнов Алексей Владимирович', '+79444444444', 'smirnov@mail.ru', '4515 444444', 'Физ. лицо', 'synced'),
('ООО СтройПроект', '+79666666666', 'info@stroyproekt.ru', '7701234567', 'Юр. лицо', 'synced');


INSERT INTO rental_object (owner_id, type_id, address, area, daily_rate, status, description, latitude, longitude, sync_status) VALUES
(1, 1, 'г. Москва, ул. Ленина, д. 10, кв. 25', 45.5, 2500.00, 'Свободен', 'Однокомнатная квартира', 55.7558, 37.6173, 'synced'),
(1, 1, 'г. Москва, ул. Гагарина, д. 5, кв. 12', 62.0, 3500.00, 'Занят', 'Двухкомнатная квартира', 55.7522, 37.6156, 'synced'),
(2, 3, 'г. Москва, пр. Мира, д. 100, оф. 305', 35.0, 4000.00, 'Свободен', 'Офис в бизнес-центре', 55.7580, 37.6200, 'pending');


INSERT INTO object_inspection (object_id, agent_id, condition_rating, notes, photo_paths) VALUES
(1, 101, 5, 'Отличное состояние', '["/photos/1.jpg"]'),
(2, 101, 4, 'Хорошее состояние', '["/photos/2.jpg"]');


INSERT INTO local_contract_draft (object_id, client_id, start_date, end_date, daily_rate, total_amount, deposit_amount, status, created_by_agent_id) VALUES
(1, 1, '2024-07-01', '2024-07-10', 2500.00, 22500.00, 5000.00, 'draft', 101);

UPDATE rental_object SET status = 'На ремонте' WHERE object_id = 1;
SELECT * FROM change_log;

INSERT INTO rental_object (owner_id, type_id, address, daily_rate, status) 
VALUES (999, 1, 'Тест', 1000, 'Свободен');

SELECT * FROM vw_available_for_map