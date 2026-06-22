

DROP TYPE T_Service_Type FORCE;

CREATE OR REPLACE TYPE T_Service_Type AS OBJECT (
    type_id        NUMBER,
    type_name      VARCHAR2(50),
    category       VARCHAR2(50),
    parent_id      NUMBER,
    description    VARCHAR2(200),

    CONSTRUCTOR FUNCTION T_Service_Type (
        p_type_name VARCHAR2,
        p_category  VARCHAR2,
        p_parent_id NUMBER DEFAULT NULL,
        p_description VARCHAR2 DEFAULT NULL
    ) RETURN SELF AS RESULT,

    MAP MEMBER FUNCTION get_map RETURN VARCHAR2 DETERMINISTIC,   

    MEMBER FUNCTION get_full_name RETURN VARCHAR2 DETERMINISTIC,
    MEMBER PROCEDURE print_info
);
/

CREATE OR REPLACE TYPE BODY T_Service_Type AS

    CONSTRUCTOR FUNCTION T_Service_Type (
        p_type_name VARCHAR2,
        p_category  VARCHAR2,
        p_parent_id NUMBER DEFAULT NULL,
        p_description VARCHAR2 DEFAULT NULL
    ) RETURN SELF AS RESULT IS
    BEGIN
        SELF.type_id     := NULL;
        SELF.type_name   := p_type_name;
        SELF.category    := p_category;
        SELF.parent_id   := p_parent_id;
        SELF.description := p_description;
        RETURN;
    END;

    MAP MEMBER FUNCTION get_map RETURN VARCHAR2 DETERMINISTIC IS
    BEGIN
        RETURN NVL(category, '-') || '|' || NVL(type_name, '-');
    END;

    MEMBER FUNCTION get_full_name RETURN VARCHAR2 IS
    BEGIN
        RETURN type_name || ' (' || category || ')';
    END;

    MEMBER PROCEDURE print_info IS
    BEGIN
        DBMS_OUTPUT.PUT_LINE('Вид услуги: ' || get_full_name());
        DBMS_OUTPUT.PUT_LINE('   ID: ' || NVL(TO_CHAR(type_id), '-'));
        DBMS_OUTPUT.PUT_LINE('   Родитель: ' || NVL(TO_CHAR(parent_id), '-'));
        DBMS_OUTPUT.PUT_LINE('   MAP: ' || get_map());
    END;

END;
/
drop table OBJ_SERVICE_TYPES

CREATE TABLE OBJ_SERVICE_TYPES OF T_Service_Type (
    type_id PRIMARY KEY
);


CREATE OR REPLACE VIEW VW_SERVICE_TYPES AS
SELECT VALUE(o) AS service_obj
FROM OBJ_SERVICE_TYPES o;


INSERT INTO OBJ_SERVICE_TYPES
SELECT 
    T_Service_Type(
        type_id,
        type_name,
        category,
        parent_type_id,
        'Вид услуги из реляционной таблицы'
    )
FROM OBJECT_TYPE;

COMMIT;

DECLARE
    svc T_Service_Type;
BEGIN
    SELECT VALUE(o) INTO svc
    FROM OBJ_SERVICE_TYPES o
    WHERE o.type_name = 'Квартира'
    FETCH FIRST 1 ROW ONLY;

    svc.print_info();                    
    DBMS_OUTPUT.PUT_LINE('Полное имя: ' || svc.get_full_name());
END;
/


CREATE INDEX idx_obj_service_category ON OBJ_SERVICE_TYPES(category);

DROP INDEX idx_obj_service_map_expr
CREATE INDEX idx_obj_service_map_expr 
ON OBJ_SERVICE_TYPES(category || '|' || type_name)

DROP INDEX idx_obj_service
CREATE INDEX idx_obj_service_method ON OBJ_SERVICE_TYPES o (o.get_map())

SELECT * FROM obj_service_types o
where o.get_map() = 'Жилая|Квартира';

SELECT * FROM obj_service_types o
WHERE o.category = 'Оборудование';