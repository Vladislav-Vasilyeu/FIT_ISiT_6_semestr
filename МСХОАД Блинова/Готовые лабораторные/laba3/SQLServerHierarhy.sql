ALTER TABLE OBJECT_TYPE
ADD hierarchy_path HIERARCHYID NULL;

ALTER TABLE OBJECT_TYPE
ADD level AS hierarchy_path.GetLevel();



INSERT INTO OBJECT_TYPE (type_name, category, hierarchy_path)
VALUES (N'Все типы', N'Все', hierarchyid::GetRoot());

DECLARE @root hierarchyid = (SELECT hierarchy_path FROM OBJECT_TYPE WHERE type_name = N'Все типы');

UPDATE OBJECT_TYPE SET hierarchy_path = @root.GetDescendant(NULL, NULL)
WHERE type_name = N'Жилая';

UPDATE OBJECT_TYPE SET hierarchy_path = @root.GetDescendant(
    (SELECT hierarchy_path FROM OBJECT_TYPE WHERE type_name = N'Жилая'), NULL)
WHERE type_name = N'Коммерческая';

UPDATE OBJECT_TYPE SET hierarchy_path = @root.GetDescendant(
    (SELECT hierarchy_path FROM OBJECT_TYPE WHERE type_name = N'Коммерческая'), NULL)
WHERE type_name = N'Транспорт';

UPDATE OBJECT_TYPE SET hierarchy_path = @root.GetDescendant(
    (SELECT hierarchy_path FROM OBJECT_TYPE WHERE type_name = N'Транспорт'), NULL)
WHERE type_name = N'Оборудование';
---
DECLARE @жил hierarchyid = (SELECT hierarchy_path FROM OBJECT_TYPE WHERE type_name = N'Жилая');
UPDATE OBJECT_TYPE SET hierarchy_path = @жил.GetDescendant(NULL, NULL) WHERE type_name = N'Квартира';
UPDATE OBJECT_TYPE SET hierarchy_path = @жил.GetDescendant(
    (SELECT hierarchy_path FROM OBJECT_TYPE WHERE type_name = N'Квартира'), NULL)
WHERE type_name = N'Дом';
---
DECLARE @ком hierarchyid = (SELECT hierarchy_path FROM OBJECT_TYPE WHERE type_name = N'Коммерческая');
UPDATE OBJECT_TYPE SET hierarchy_path = @ком.GetDescendant(NULL, NULL) WHERE type_name = N'Офис';
UPDATE OBJECT_TYPE SET hierarchy_path = @ком.GetDescendant(
    (SELECT hierarchy_path FROM OBJECT_TYPE WHERE type_name = N'Офис'), NULL)
WHERE type_name = N'Склад';
---
DECLARE @транс hierarchyid = (SELECT hierarchy_path FROM OBJECT_TYPE WHERE type_name = N'Транспорт');
UPDATE OBJECT_TYPE SET hierarchy_path = @транс.GetDescendant(NULL, NULL) WHERE type_name = N'Автомобиль';
UPDATE OBJECT_TYPE SET hierarchy_path = @транс.GetDescendant(
    (SELECT hierarchy_path FROM OBJECT_TYPE WHERE type_name = N'Автомобиль'), NULL)
WHERE type_name = N'Грузовик';
---
DECLARE @обор hierarchyid = (SELECT hierarchy_path FROM OBJECT_TYPE WHERE type_name = N'Оборудование');
UPDATE OBJECT_TYPE SET hierarchy_path = @обор.GetDescendant(NULL, NULL) WHERE type_name = N'Строительное оборудование';
UPDATE OBJECT_TYPE SET hierarchy_path = @обор.GetDescendant(
    (SELECT hierarchy_path FROM OBJECT_TYPE WHERE type_name = N'Строительное оборудование'), NULL)
WHERE type_name = N'Офисная техника';
---


SELECT 
    type_id,
    type_name,
    category,
    hierarchy_path.ToString()           AS path,
    hierarchy_path.GetLevel()           AS level,
    hierarchy_path.GetAncestor(1).ToString() AS parent_path,
    REPLICATE('    ', hierarchy_path.GetLevel()) + type_name AS tree_view
FROM OBJECT_TYPE
ORDER BY hierarchy_path;



CREATE OR ALTER PROCEDURE ПоказатьПодчинённые
    @НазваниеРодителя nvarchar(100)
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @hid hierarchyid;

   
    SELECT @hid = hierarchy_path
    FROM OBJECT_TYPE
    WHERE type_name = @НазваниеРодителя;

    IF @hid IS NULL
    BEGIN
        PRINT 'Не найден тип: ' + @НазваниеРодителя;
        RETURN;
    END

   
    SELECT 
        type_id,
        type_name,
        hierarchy_path.GetLevel() AS Уровень,
        REPLICATE('  ', hierarchy_path.GetLevel()) + type_name AS Дерево
    FROM OBJECT_TYPE
    WHERE hierarchy_path.IsDescend
    antOf(@hid) = 1
    ORDER BY hierarchy_path;
END
GO

EXEC ПоказатьПодчинённые @НазваниеРодителя = N'Все типы';
EXEC ПоказатьПодчинённые @НазваниеРодителя = N'Жилая';
EXEC ПоказатьПодчинённые @НазваниеРодителя = N'Коммерческая';
EXEC ПоказатьПодчинённые @НазваниеРодителя = N'Транспорт';
EXEC ПоказатьПодчинённые @НазваниеРодителя = N'Оборудование';


CREATE OR ALTER PROCEDURE ДобавитьПодтип
    @Родитель nvarchar(100),
    @Новый    nvarchar(50)
AS
BEGIN
    DECLARE @ph hierarchyid = (SELECT hierarchy_path FROM OBJECT_TYPE WHERE type_name = @Родитель);
    
    IF @ph IS NULL 
    BEGIN
        PRINT 'Родитель не найден';
        RETURN;
    END

    DECLARE @newpath hierarchyid = @ph.GetDescendant(NULL, NULL);

    INSERT INTO OBJECT_TYPE (type_name, category, hierarchy_path)
    SELECT @Новый, category, @newpath
    FROM OBJECT_TYPE
    WHERE type_name = @Родитель;
END
GO

EXEC ДобавитьПодтип @Родитель = N'Жилая', @Новый = N'Гостинка';
EXEC ДобавитьПодтип @Родитель = N'Коммерческая', @Новый = N'Ресторан';

CREATE OR ALTER PROCEDURE ПереместитьВетку
    @Откуда nvarchar(100),
    @Куда   nvarchar(100)
AS
BEGIN
    DECLARE @old hierarchyid = (SELECT hierarchy_path FROM OBJECT_TYPE WHERE type_name = @Откуда);
    DECLARE @new hierarchyid = (SELECT hierarchy_path FROM OBJECT_TYPE WHERE type_name = @Куда);

    IF @old IS NULL OR @new IS NULL RETURN;

    UPDATE OBJECT_TYPE
    SET hierarchy_path = hierarchy_path.GetReparentedValue(@old, @new)
    WHERE hierarchy_path.IsDescendantOf(@old) = 1
       OR hierarchy_path = @old;
END
GO

EXEC ПереместитьВетку @Откуда = N'Транспорт', @Куда = N'Коммерческая';
EXEC ПереместитьВетку @Откуда = N'Оборудование', @Куда = N'Жилая';