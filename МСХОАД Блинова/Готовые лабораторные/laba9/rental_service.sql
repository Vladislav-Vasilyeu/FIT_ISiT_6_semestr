-- ========================================
-- ТИПЫ ДЛЯ ВАРИАНТА 5: Услуги аренды
-- ========================================

-- t2: Вид услуги (вложенная коллекция)
CREATE OR REPLACE TYPE TypeOfService AS OBJECT (
    type_id     NUMBER(4),
    type_name   VARCHAR2(80),
    unit        VARCHAR2(30),      -- например: сутки, час, месяц
    description VARCHAR2(200)
);
/

-- Коллекция видов услуг (K2)
CREATE OR REPLACE TYPE TypeOfServiceTable AS TABLE OF TypeOfService;
/

-- t1: Услуга аренды (с вложенной коллекцией K2)
CREATE OR REPLACE TYPE RentalService AS OBJECT (
    service_id   NUMBER(6),
    service_name VARCHAR2(100),
    base_price   NUMBER(12,2),
    types        TypeOfServiceTable          -- вложенная коллекция K2
);
/

-- Коллекция услуг (K1)
CREATE OR REPLACE TYPE RentalServiceTable AS TABLE OF RentalService;
/



CREATE TABLE Types_of_Service OF TypeOfService
    (type_id PRIMARY KEY);

CREATE TABLE Rental_Services OF RentalService
    (service_id PRIMARY KEY)
NESTED TABLE types STORE AS Service_Types_NT;



-- Виды услуг
INSERT INTO Types_of_Service VALUES (1, 'Аренда легкового автомобиля', 'сутки', 'Toyota, Kia, Hyundai');
INSERT INTO Types_of_Service VALUES (2, 'Аренда грузового автомобиля', 'сутки', 'Грузоподъёмность до 10т');
INSERT INTO Types_of_Service VALUES (3, 'Аренда спецтехники', 'смена', 'Экскаватор, погрузчик');
INSERT INTO Types_of_Service VALUES (4, 'Аренда микроавтобуса', 'сутки', 'До 20 пассажиров');
INSERT INTO Types_of_Service VALUES (5, 'Аренда инструмента', 'сутки', 'Перфоратор, болгарка');

-- Услуги с вложенными коллекциями
INSERT INTO Rental_Services VALUES (
    101, 
    'Аренда автотранспорта', 
    4500,
    TypeOfServiceTable(
        TypeOfService(1, 'Аренда легкового автомобиля', 'сутки', 'Toyota, Kia, Hyundai'),
        TypeOfService(2, 'Аренда грузового автомобиля', 'сутки', 'Грузоподъёмность до 10т')
    )
);

INSERT INTO Rental_Services VALUES (
    102, 
    'Аренда спецтехники', 
    18500,
    TypeOfServiceTable(
        TypeOfService(3, 'Аренда спецтехники', 'смена', 'Экскаватор, погрузчик')
    )
);

INSERT INTO Rental_Services VALUES (
    103, 
    'Аренда пассажирского транспорта', 
    9200,
    TypeOfServiceTable(
        TypeOfService(1, 'Аренда легкового автомобиля', 'сутки', 'Toyota, Kia, Hyundai'),
        TypeOfService(4, 'Аренда микроавтобуса', 'сутки', 'До 20 пассажиров')
    )
);

COMMIT;



DECLARE
    K1          RentalServiceTable := RentalServiceTable();
    temp        RentalService;
BEGIN
    -- a. 
    SELECT VALUE(s) BULK COLLECT INTO K1 
    FROM Rental_Services s;

    DBMS_OUTPUT.PUT_LINE('=== K1 создана. Количество услуг: ' || K1.COUNT || ' ===');

    -- b. 
    DBMS_OUTPUT.PUT_LINE('Услуги с пересекающимися видами услуг:');
    FOR i IN 1..K1.COUNT LOOP
        FOR j IN i+1..K1.COUNT LOOP
            DECLARE
                v_intersect NUMBER;
            BEGIN
                SELECT COUNT(*) INTO v_intersect
                FROM TABLE(K1(i).types) t1,
                     TABLE(K1(j).types) t2
                WHERE t1.type_id = t2.type_id;   -- сравниваем по уникальному полю

                IF v_intersect > 0 THEN
                    DBMS_OUTPUT.PUT_LINE('   → ' || K1(i).service_name || 
                                       ' и ' || K1(j).service_name);
                END IF;
            END;
        END LOOP;
    END LOOP;

    -- c. 
    DECLARE
        test_service RentalService := RentalService(101, NULL, NULL, NULL);
    BEGIN
        IF K1(1).service_id = test_service.service_id THEN
            DBMS_OUTPUT.PUT_LINE('Элемент с service_id=101 — член коллекции K1');
        END IF;
    END;

    -- d. 
    DBMS_OUTPUT.PUT_LINE('Услуги без указанных видов (пустые K2):');
    FOR i IN 1..K1.COUNT LOOP
        IF K1(i).types IS EMPTY OR K1(i).types.COUNT = 0 THEN
            DBMS_OUTPUT.PUT_LINE('   → ' || K1(i).service_name);
        END IF;
    END LOOP;

    -- e.
    IF K1.COUNT >= 2 THEN
        DBMS_OUTPUT.PUT_LINE('--- Обмен K2 между услугами ---');
        DBMS_OUTPUT.PUT_LINE('До обмена:');
        DBMS_OUTPUT.PUT_LINE('  ' || K1(1).service_name || ' видов: ' || K1(1).types.COUNT);
        DBMS_OUTPUT.PUT_LINE('  ' || K1(2).service_name || ' видов: ' || K1(2).types.COUNT);

        temp := K1(1);
        K1(1).types := K1(2).types;
        K1(2).types := temp.types;

        DBMS_OUTPUT.PUT_LINE('После обмена:');
        DBMS_OUTPUT.PUT_LINE('  ' || K1(1).service_name || ' видов: ' || K1(1).types.COUNT);
        DBMS_OUTPUT.PUT_LINE('  ' || K1(2).service_name || ' видов: ' || K1(2).types.COUNT);
    END IF;
END;
/

DECLARE
    K1 RentalServiceTable := RentalServiceTable();
BEGIN
    SELECT VALUE(s) BULK COLLECT INTO K1 FROM Rental_Services s;

    DBMS_OUTPUT.PUT_LINE('=== ПУНКТ 3. Преобразование коллекции ===');

    -- 3.1
    DBMS_OUTPUT.PUT_LINE('→ В реляционную форму:');
    FOR rec IN (
        SELECT s.service_name, t.type_name, t.unit
        FROM TABLE(K1) s, TABLE(s.types) t
    ) LOOP
        DBMS_OUTPUT.PUT_LINE('   ' || rec.service_name || ' → ' || rec.type_name || ' (' || rec.unit || ')');
    END LOOP;

    -- 3.2 
    DBMS_OUTPUT.PUT_LINE('→ В упрощённую коллекцию:');
    FOR i IN 1..K1.COUNT LOOP
        DBMS_OUTPUT.PUT_LINE('   ' || K1(i).service_id || ' - ' || 
                           K1(i).service_name || ' (' || K1(i).base_price || ' руб.)');
    END LOOP;
END;
/


DECLARE
    TYPE t_ids IS TABLE OF NUMBER;
    service_ids t_ids;
BEGIN
    DBMS_OUTPUT.PUT_LINE('=== ПУНКТ 4. BULK-операции ===');

    
    SELECT service_id BULK COLLECT INTO service_ids
    FROM Rental_Services 
    WHERE base_price > 7000;

    DBMS_OUTPUT.PUT_LINE('BULK COLLECT → найдено ' || service_ids.COUNT || ' дорогих услуг');

    
    IF service_ids.COUNT > 0 THEN
        FORALL i IN 1..service_ids.COUNT
            UPDATE Rental_Services 
            SET base_price = base_price * 1.1
            WHERE service_id = service_ids(i);

        DBMS_OUTPUT.PUT_LINE('FORALL → цены увеличены на 10% для ' || service_ids.COUNT || ' услуг');
    END IF;

    COMMIT;
END;
/

--
--SELECT ServiceSummary(service_id, service_name, base_price)
--BULK COLLECT INTO summary
--FROM TABLE(K1);
    --