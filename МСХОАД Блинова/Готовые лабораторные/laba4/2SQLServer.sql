SELECT 
    ot.type_name                                      AS Вид_услуги,
    YEAR(rc.start_date)                               AS Год,
    DATEPART(QUARTER, rc.start_date)                  AS Квартал,
    DATEPART(MONTH, rc.start_date)                    AS Месяц,
    CASE 
        WHEN GROUPING(DATEPART(MONTH, rc.start_date)) = 1 
             AND GROUPING(DATEPART(QUARTER, rc.start_date)) = 1 THEN 'Год'
        WHEN GROUPING(DATEPART(MONTH, rc.start_date)) = 1 THEN 'Квартал'
        ELSE 'Месяц'
    END                                               AS Период,
    COUNT(DISTINCT rc.contract_id)                    AS Количество_договоров,
    COUNT(*)                                          AS Количество_аренд,
    SUM(rc.total_amount)                              AS Сумма_всего,
    AVG(rc.total_amount)                              AS Средняя_сумма
FROM RENTAL_CONTRACT rc
INNER JOIN RENTAL_OBJECT ro ON rc.object_id = ro.object_id
INNER JOIN OBJECT_TYPE ot ON ro.type_id = ot.type_id
WHERE rc.start_date >= '20230101'   -- или DATEADD(YEAR, -3, GETDATE())
GROUP BY GROUPING SETS (
    (ot.type_name, YEAR(rc.start_date), DATEPART(QUARTER, rc.start_date), DATEPART(MONTH, rc.start_date)),  -- месяц
    (ot.type_name, YEAR(rc.start_date), DATEPART(QUARTER, rc.start_date)),                                  -- квартал
    (ot.type_name, YEAR(rc.start_date)),                                                                    -- год
    (ot.type_name)                                                                                          -- итого по виду
)
ORDER BY ot.type_name, Год DESC, Квартал DESC, Месяц DESC;