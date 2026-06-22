-- ============================================================
-- ORACLE — ЗАПОЛНЕНИЕ ДАННЫМИ
-- ============================================================

-- ============================================================
-- 1. ТИПЫ ОБЪЕКТОВ
-- ============================================================

INSERT INTO OBJECT_TYPE (type_name, category) VALUES ('Квартира', 'Жилая');
INSERT INTO OBJECT_TYPE (type_name, category) VALUES ('Дом', 'Жилая');
INSERT INTO OBJECT_TYPE (type_name, category) VALUES ('Офис', 'Коммерческая');
INSERT INTO OBJECT_TYPE (type_name, category) VALUES ('Склад', 'Коммерческая');
INSERT INTO OBJECT_TYPE (type_name, category) VALUES ('Автомобиль', 'Транспорт');
INSERT INTO OBJECT_TYPE (type_name, category) VALUES ('Грузовик', 'Транспорт');
INSERT INTO OBJECT_TYPE (type_name, category) VALUES ('Строительное оборудование', 'Оборудование');
INSERT INTO OBJECT_TYPE (type_name, category) VALUES ('Офисная техника', 'Оборудование');

COMMIT;

-- ============================================================
-- 2. СОБСТВЕННИКИ
-- ============================================================

INSERT INTO OWNER (full_name, phone, email, passport_data, bank_account) 
VALUES ('Иванов Сергей Петрович', '+79001234567', 'ivanov@mail.ru', '4515 123456', '40817810100001234567');

INSERT INTO OWNER (full_name, phone, email, passport_data, bank_account) 
VALUES ('Петрова Мария Ивановна', '+79009876543', 'petrova@mail.ru', '4515 654321', '40817810100007654321');

INSERT INTO OWNER (full_name, phone, email, passport_data, bank_account) 
VALUES ('Сидоров Олег Викторович', '+79111111111', 'sidorov@mail.ru', '4515 111111', '40817810100001111111');

INSERT INTO OWNER (full_name, phone, email, passport_data, bank_account) 
VALUES ('Козлова Анна Сергеевна', '+79222222222', 'kozlova@mail.ru', '4515 222222', '40817810100002222222');

INSERT INTO OWNER (full_name, phone, email, passport_data, bank_account) 
VALUES ('Новиков Дмитрий Андреевич', '+79333333333', 'novikov@mail.ru', '4515 333333', '40817810100003333333');

COMMIT;

-- ============================================================
-- 3. КЛИЕНТЫ
-- ============================================================

INSERT INTO CLIENT (full_name, phone, email, passport_data, client_type, registration_date) 
VALUES ('Смирнов Алексей Владимирович', '+79444444444', 'smirnov@mail.ru', '4515 444444', 'Физ. лицо', TO_DATE('15.01.2024', 'DD.MM.YYYY'));

INSERT INTO CLIENT (full_name, phone, email, passport_data, client_type, registration_date) 
VALUES ('Васильева Елена Дмитриевна', '+79555555555', 'vasilieva@mail.ru', '4515 555555', 'Физ. лицо', TO_DATE('20.02.2024', 'DD.MM.YYYY'));

INSERT INTO CLIENT (full_name, phone, email, passport_data, client_type, registration_date) 
VALUES ('ООО "СтройПроект"', '+79666666666', 'info@stroyproekt.ru', '7701234567', 'Юр. лицо', TO_DATE('10.03.2024', 'DD.MM.YYYY'));

INSERT INTO CLIENT (full_name, phone, email, passport_data, client_type, registration_date) 
VALUES ('Козлов Михаил Сергеевич', '+79777777777', 'kozlov@mail.ru', '4515 777777', 'Физ. лицо', TO_DATE('05.04.2024', 'DD.MM.YYYY'));

INSERT INTO CLIENT (full_name, phone, email, passport_data, client_type, registration_date) 
VALUES ('ИП Иванова Татьяна Петровна', '+79888888888', 'ip.ivanova@mail.ru', '4515 888888', 'Юр. лицо', TO_DATE('12.05.2024', 'DD.MM.YYYY'));

INSERT INTO CLIENT (full_name, phone, email, passport_data, client_type, registration_date) 
VALUES ('Морозов Павел Андреевич', '+79999999999', 'morozov@mail.ru', '4515 999999', 'Физ. лицо', TO_DATE('01.06.2024', 'DD.MM.YYYY'));

COMMIT;

-- ============================================================
-- 4. ОБЪЕКТЫ АРЕНДЫ
-- ============================================================

INSERT INTO RENTAL_OBJECT (owner_id, type_id, address, area, daily_rate, status, description) 
VALUES (1, 1, 'г. Москва, ул. Ленина, д. 10, кв. 25', 45.5, 2500, 'Занят', 'Однокомнатная квартира, ремонт 2023');

INSERT INTO RENTAL_OBJECT (owner_id, type_id, address, area, daily_rate, status, description) 
VALUES (1, 1, 'г. Москва, ул. Гагарина, д. 5, кв. 12', 62, 3500, 'Свободен', 'Двухкомнатная квартира с балконом');

INSERT INTO RENTAL_OBJECT (owner_id, type_id, address, area, daily_rate, status, description) 
VALUES (2, 2, 'г. Санкт-Петербург, ул. Солнечная, д. 15', 120, 5000, 'Занят', 'Коттедж с участком 10 соток');

INSERT INTO RENTAL_OBJECT (owner_id, type_id, address, area, daily_rate, status, description) 
VALUES (2, 3, 'г. Москва, пр. Мира, д. 100, оф. 305', 35, 4000, 'Свободен', 'Офис в бизнес-центре класса B');

INSERT INTO RENTAL_OBJECT (owner_id, type_id, address, area, daily_rate, status, description) 
VALUES (3, 4, 'г. Екатеринбург, ул. Промышленная, д. 50', 200, 3000, 'На ремонте', 'Склад с погрузчиком');

INSERT INTO RENTAL_OBJECT (owner_id, type_id, address, area, daily_rate, status, description) 
VALUES (3, 5, 'г. Москва, ш. Энтузиастов, д. 20', NULL, 2000, 'Занят', 'Легковой автомобиль Hyundai Solaris');

INSERT INTO RENTAL_OBJECT (owner_id, type_id, address, area, daily_rate, status, description) 
VALUES (4, 6, 'г. Казань, ул. Транспортная, д. 8', NULL, 4500, 'Свободен', 'Грузовик 5 тонн с водителем');

INSERT INTO RENTAL_OBJECT (owner_id, type_id, address, area, daily_rate, status, description) 
VALUES (4, 7, 'г. Новосибирск, ул. Строительная, д. 30', NULL, 1500, 'Свободен', 'Бетономешалка, отбойный молоток');

INSERT INTO RENTAL_OBJECT (owner_id, type_id, address, area, daily_rate, status, description) 
VALUES (5, 8, 'г. Москва, ул. Технологическая, д. 12', NULL, 800, 'Забронирован', 'Принтер, сканер, копир');

INSERT INTO RENTAL_OBJECT (owner_id, type_id, address, area, daily_rate, status, description) 
VALUES (1, 3, 'г. Москва, ул. Арбат, д. 1, оф. 100', 50, 6000, 'Свободен', 'Престижный офис в центре');

COMMIT;

-- ============================================================
-- 5. ДОГОВОРЫ АРЕНДЫ (триггер автоматически пересчитает total_amount!)
-- ============================================================

INSERT INTO RENTAL_CONTRACT (object_id, client_id, start_date, end_date, status, deposit_amount) 
VALUES (1, 1, TO_DATE('01.06.2024', 'DD.MM.YYYY'), TO_DATE('30.06.2024', 'DD.MM.YYYY'), 'Активен', 5000);

INSERT INTO RENTAL_CONTRACT (object_id, client_id, start_date, end_date, status, deposit_amount) 
VALUES (3, 2, TO_DATE('15.05.2024', 'DD.MM.YYYY'), TO_DATE('15.08.2024', 'DD.MM.YYYY'), 'Активен', 10000);

INSERT INTO RENTAL_CONTRACT (object_id, client_id, start_date, end_date, status, deposit_amount) 
VALUES (6, 4, TO_DATE('10.06.2024', 'DD.MM.YYYY'), TO_DATE('20.06.2024', 'DD.MM.YYYY'), 'Активен', 3000);

INSERT INTO RENTAL_CONTRACT (object_id, client_id, start_date, end_date, status, deposit_amount) 
VALUES (2, 3, TO_DATE('01.04.2024', 'DD.MM.YYYY'), TO_DATE('31.05.2024', 'DD.MM.YYYY'), 'Завершен', 7000);

INSERT INTO RENTAL_CONTRACT (object_id, client_id, start_date, end_date, status, deposit_amount) 
VALUES (4, 5, TO_DATE('15.06.2024', 'DD.MM.YYYY'), TO_DATE('15.07.2024', 'DD.MM.YYYY'), 'Активен', 8000);

INSERT INTO RENTAL_CONTRACT (object_id, client_id, start_date, end_date, status, deposit_amount) 
VALUES (9, 6, TO_DATE('01.07.2024', 'DD.MM.YYYY'), TO_DATE('10.07.2024', 'DD.MM.YYYY'), 'Активен', 2000);

COMMIT;

-- ============================================================
-- 6. ПЛАТЕЖИ КЛИЕНТОВ
-- ============================================================

INSERT INTO PAYMENT (contract_id, client_id, payment_date, amount, payment_type, status) 
VALUES (1, 1, TO_DATE('01.06.2024', 'DD.MM.YYYY'), 72500, 'Безналичные', 'Выполнен');

INSERT INTO PAYMENT (contract_id, client_id, payment_date, amount, payment_type, status) 
VALUES (2, 2, TO_DATE('15.05.2024', 'DD.MM.YYYY'), 155000, 'Безналичные', 'Выполнен');

INSERT INTO PAYMENT (contract_id, client_id, payment_date, amount, payment_type, status) 
VALUES (2, 2, TO_DATE('15.06.2024', 'DD.MM.YYYY'), 155000, 'Безналичные', 'Выполнен');

INSERT INTO PAYMENT (contract_id, client_id, payment_date, amount, payment_type, status) 
VALUES (3, 4, TO_DATE('10.06.2024', 'DD.MM.YYYY'), 20000, 'Карта', 'Выполнен');

INSERT INTO PAYMENT (contract_id, client_id, payment_date, amount, payment_type, status) 
VALUES (4, 3, TO_DATE('01.04.2024', 'DD.MM.YYYY'), 217000, 'Безналичные', 'Выполнен');

INSERT INTO PAYMENT (contract_id, client_id, payment_date, amount, payment_type, status) 
VALUES (5, 5, TO_DATE('15.06.2024', 'DD.MM.YYYY'), 120000, 'Безналичные', 'Выполнен');

INSERT INTO PAYMENT (contract_id, client_id, payment_date, amount, payment_type, status) 
VALUES (1, 1, TO_DATE('15.06.2024', 'DD.MM.YYYY'), 0, 'Наличные', 'Ожидает');

INSERT INTO PAYMENT (contract_id, client_id, payment_date, amount, payment_type, status) 
VALUES (6, 6, TO_DATE('25.06.2024', 'DD.MM.YYYY'), 7200, 'Онлайн', 'Выполнен');

COMMIT;

-- ============================================================
-- 7. ВЫПЛАТЫ СОБСТВЕННИКАМ
-- ============================================================

INSERT INTO OWNER_PAYMENT (owner_id, contract_id, payment_date, amount, commission_percent) 
VALUES (1, 1, TO_DATE('02.06.2024', 'DD.MM.YYYY'), 65250, 10);

INSERT INTO OWNER_PAYMENT (owner_id, contract_id, payment_date, amount, commission_percent) 
VALUES (2, 2, TO_DATE('16.05.2024', 'DD.MM.YYYY'), 139500, 10);

INSERT INTO OWNER_PAYMENT (owner_id, contract_id, payment_date, amount, commission_percent) 
VALUES (2, 2, TO_DATE('16.06.2024', 'DD.MM.YYYY'), 139500, 10);

INSERT INTO OWNER_PAYMENT (owner_id, contract_id, payment_date, amount, commission_percent) 
VALUES (3, 3, TO_DATE('11.06.2024', 'DD.MM.YYYY'), 18000, 10);

INSERT INTO OWNER_PAYMENT (owner_id, contract_id, payment_date, amount, commission_percent) 
VALUES (2, 4, TO_DATE('02.04.2024', 'DD.MM.YYYY'), 195300, 10);

INSERT INTO OWNER_PAYMENT (owner_id, contract_id, payment_date, amount, commission_percent) 
VALUES (4, 5, TO_DATE('16.06.2024', 'DD.MM.YYYY'), 108000, 10);

INSERT INTO OWNER_PAYMENT (owner_id, contract_id, payment_date, amount, commission_percent) 
VALUES (5, 6, TO_DATE('26.06.2024', 'DD.MM.YYYY'), 6480, 10);

COMMIT;

-- ============================================================
-- 8. ОБСЛУЖИВАНИЕ
-- ============================================================

INSERT INTO MAINTENANCE (object_id, maintenance_date, description, cost, executor) 
VALUES (5, TO_DATE('01.06.2024', 'DD.MM.YYYY'), 'Покраска стен, замена освещения', 15000, 'ООО РемонтСтрой');

INSERT INTO MAINTENANCE (object_id, maintenance_date, description, cost, executor) 
VALUES (1, TO_DATE('15.05.2024', 'DD.MM.YYYY'), 'Профилактика сантехники', 3500, 'Иванов С.П.');

INSERT INTO MAINTENANCE (object_id, maintenance_date, description, cost, executor) 
VALUES (6, TO_DATE('05.06.2024', 'DD.MM.YYYY'), 'Замена масла, ТО-1', 8000, 'Автосервис "Мастер"');

INSERT INTO MAINTENANCE (object_id, maintenance_date, description, cost, executor) 
VALUES (3, TO_DATE('10.05.2024', 'DD.MM.YYYY'), 'Чистка бассейна, уборка территории', 5000, 'КлинингПро');

COMMIT;

-- ============================================================
-- 9. БРОНИРОВАНИЯ
-- ============================================================

INSERT INTO BOOKING (object_id, client_id, booking_date, planned_start, planned_end, status) 
VALUES (9, 6, TO_DATE('20.06.2024', 'DD.MM.YYYY'), TO_DATE('01.07.2024', 'DD.MM.YYYY'), TO_DATE('10.07.2024', 'DD.MM.YYYY'), 'Подтверждена');

INSERT INTO BOOKING (object_id, client_id, booking_date, planned_start, planned_end, status) 
VALUES (7, 3, TO_DATE('18.06.2024', 'DD.MM.YYYY'), TO_DATE('05.07.2024', 'DD.MM.YYYY'), TO_DATE('20.07.2024', 'DD.MM.YYYY'), 'Активна');

INSERT INTO BOOKING (object_id, client_id, booking_date, planned_start, planned_end, status) 
VALUES (8, 4, TO_DATE('19.06.2024', 'DD.MM.YYYY'), TO_DATE('01.07.2024', 'DD.MM.YYYY'), TO_DATE('15.07.2024', 'DD.MM.YYYY'), 'Активна');

INSERT INTO BOOKING (object_id, client_id, booking_date, planned_start, planned_end, status) 
VALUES (10, 2, TO_DATE('15.06.2024', 'DD.MM.YYYY'), TO_DATE('01.08.2024', 'DD.MM.YYYY'), TO_DATE('31.08.2024', 'DD.MM.YYYY'), 'Отменена');

COMMIT;