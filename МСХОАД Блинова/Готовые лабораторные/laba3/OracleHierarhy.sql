ALTER TABLE OBJECT_TYPE
ADD parent_type_id NUMBER;

ALTER TABLE OBJECT_TYPE
ADD CONSTRAINT fk_object_type_parent
    FOREIGN KEY (parent_type_id)
    REFERENCES OBJECT_TYPE(type_id);
    
CREATE OR REPLACE PROCEDURE show_subtree_simple (
    p_parent_name IN VARCHAR2
)
IS
BEGIN
    DBMS_OUTPUT.PUT_LINE('Поддерево для: ' || p_parent_name);
    DBMS_OUTPUT.PUT_LINE('-----------------------------');

    FOR rec IN (
        WITH subtree (type_id, type_name, parent_id, lvl) AS (
            SELECT type_id, type_name, parent_type_id, 1
            FROM OBJECT_TYPE
            WHERE type_name = p_parent_name
            UNION ALL
            SELECT o.type_id, o.type_name, o.parent_type_id, s.lvl + 1
            FROM OBJECT_TYPE o
            JOIN subtree s ON o.parent_type_id = s.type_id
        )
        SELECT 
            type_name,
            lvl,
            LPAD('  ', (lvl-1)*2) || type_name AS дерево
        FROM subtree
        ORDER BY lvl, type_name
    ) LOOP
        DBMS_OUTPUT.PUT_LINE(rec.дерево || '  (уровень ' || rec.lvl || ')');
    END LOOP;
END;
/

EXEC show_subtree('Жилая')
EXEC show_subtree('Коммерческая')
EXEC show_subtree(

CREATE OR REPLACE PROCEDURE add_child_type (
    p_parent_name   IN VARCHAR2,
    p_new_name      IN VARCHAR2,
    p_category      IN VARCHAR2 DEFAULT NULL
)
IS
    v_parent_type_id   NUMBER;
    v_cat         VARCHAR2(50);
BEGIN
    SELECT type_id, NVL(p_category, category)
      INTO v_parent_type_id, v_cat
      FROM OBJECT_TYPE
     WHERE type_name = p_parent_name;

    INSERT INTO OBJECT_TYPE (type_name, category, parent_type_id)
    VALUES (p_new_name, v_cat, v_parent_type_id);

    DBMS_OUTPUT.PUT_LINE('Добавлен: ' || p_new_name || ' → ' || p_parent_name);
    DBMS_OUTPUT.PUT_LINE('Категория: ' || v_cat);

EXCEPTION
    WHEN NO_DATA_FOUND THEN
        DBMS_OUTPUT.PUT_LINE('Родитель не найден: ' || p_parent_name);
    WHEN OTHERS THEN
        DBMS_OUTPUT.PUT_LINE('Ошибка: ' || SQLERRM);
END;
/

EXEC add_child_type('Жилая', 'Пентхаус')
EXEC add_child_type('Транспорт', 'Мотоцикл')
EXEC add_child_type('Квартира', 'Студия')
EXEC add_child_type('Студия', 'Туалет')


CREATE OR REPLACE PROCEDURE move_subtree (
    p_branch_name      IN VARCHAR2,   
    p_new_parent_name  IN VARCHAR2    
)
IS
    v_branch_id     NUMBER;
    v_new_parent_id NUMBER;
BEGIN
    SELECT type_id INTO v_branch_id
      FROM OBJECT_TYPE WHERE type_name = p_branch_name;

    SELECT type_id INTO v_new_parent_id
      FROM OBJECT_TYPE WHERE type_name = p_new_parent_name;

    IF v_branch_id = v_new_parent_id THEN
        RAISE_APPLICATION_ERROR(-20001, 'Нельзя перемещать в самого себя');
    END IF;

    -- Перемещаем только корень ветки — все дети едут автоматически
    UPDATE OBJECT_TYPE
       SET parent_type_id = v_new_parent_id
     WHERE type_id = v_branch_id;

    DBMS_OUTPUT.PUT_LINE('Ветка "' || p_branch_name || '" перемещена под "' || p_new_parent_name || '"');

EXCEPTION
    WHEN NO_DATA_FOUND THEN
        DBMS_OUTPUT.PUT_LINE('Один из типов не найден');
    WHEN OTHERS THEN
        DBMS_OUTPUT.PUT_LINE('Ошибка: ' || SQLERRM);
END;
/

EXEC move_subtree('Транспорт', 'Оборудование')
EXEC move_subtree('Жилая', 'Все типы')
EXEC move_subtree('Студия', 'Дом')