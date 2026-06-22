-------- Создаем типы

-- тип для места использования (t2)
CREATE TYPE usage_place_obj_t AS OBJECT (
    assignment_id NUMBER,
    location VARCHAR2(100),
    assigned_date DATE
);

-- коллекция мест (K2)
CREATE TYPE usage_place_table_t 
    AS TABLE OF usage_place_obj_t;

-- тип лицензии (t1) с вложенной коллекцией
CREATE TYPE license_obj_t AS OBJECT (
    license_id NUMBER,
    software_name VARCHAR2(100),
    usage_places usage_place_table_t
);

-- коллекция лицензий (K1)
CREATE TYPE license_table_t 
    AS TABLE OF license_obj_t;



-------- Создаем таблицу
CREATE TABLE license_obj_tab OF license_obj_t
    NESTED TABLE usage_places STORE AS usage_places_nt;


-- вставка данных
INSERT INTO license_obj_tab VALUES (
    license_obj_t(
        1,
        'Photoshop',
        usage_place_table_t(
            usage_place_obj_t(1, 'Office 1', SYSDATE),
            usage_place_obj_t(2, 'Office 2', SYSDATE)
        )
    )
);

INSERT INTO license_obj_tab VALUES (
    license_obj_t(
        2,
        'AutoCAD',
        usage_place_table_t(
            usage_place_obj_t(1, 'Office 3', SYSDATE),
            usage_place_obj_t(2, 'Office 2', SYSDATE)
        )
    )
);

INSERT INTO license_obj_tab VALUES (
    license_obj_t(
        3,
        'Microsoft Office',
        usage_place_table_t(
            usage_place_obj_t(1, 'Office 1', SYSDATE),
            usage_place_obj_t(2, 'Office 3', SYSDATE)
        )
    )
);

INSERT INTO license_obj_tab VALUES (
    license_obj_t(
        3,
        'Windows',
        usage_place_table_t(
        )
    )
);

-- b пересечение коллекций
select * from license_obj_tab;

SELECT l1.software_name, l2.software_name
    FROM license_obj_tab l1,
         license_obj_tab l2,
         TABLE(l1.usage_places) p1,
         TABLE(l2.usage_places) p2
    WHERE l1.license_id < l2.license_id
    AND p1.location = p2.location;

-- c проверка элемента
SELECT *
    FROM license_obj_tab l
    WHERE EXISTS (
        SELECT 1
        FROM TABLE(l.usage_places) p
        WHERE p.location = 'Office 1'
    );

-- d пустые коллекции
SELECT *
    FROM license_obj_tab
    WHERE usage_places IS EMPTY;

-- e обмен коллекций
DECLARE
    v1 usage_place_table_t;
    v2 usage_place_table_t;
BEGIN
    SELECT usage_places INTO v1 FROM license_obj_tab WHERE license_id = 1;
    SELECT usage_places INTO v2 FROM license_obj_tab WHERE license_id = 2;

    UPDATE license_obj_tab
    SET usage_places = v2
    WHERE license_id = 1;

    UPDATE license_obj_tab
    SET usage_places = v1
    WHERE license_id = 2;
END;


-- преобразование
SELECT l.license_id, p.location
    FROM license_obj_tab l,
         TABLE(l.usage_places) p;
         
     
-- BULK операции
DECLARE
    TYPE t_names IS TABLE OF VARCHAR2(100);
    v_names t_names;
BEGIN
    SELECT software_name BULK COLLECT INTO v_names
    FROM license_obj_tab;

    FOR i IN 1..v_names.COUNT LOOP
        DBMS_OUTPUT.PUT_LINE(v_names(i));
    END LOOP;
END;




