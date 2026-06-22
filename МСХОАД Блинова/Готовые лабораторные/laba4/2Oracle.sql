SELECT 
    ot.type_name                                      AS "Вид услуги",
    EXTRACT(YEAR FROM rc.start_date)                  AS Год,
    TRUNC(rc.start_date, 'Q')                         AS Квартал,    
    EXTRACT(MONTH FROM rc.start_date)                 AS Месяц,
    COUNT(*)                                          AS "Количество договоров",
    SUM(rc.total_amount)                              AS "Сумма, ₽",
    GROUPING(EXTRACT(YEAR FROM rc.start_date))        AS grp_year,
    GROUPING(TRUNC(rc.start_date, 'Q'))               AS grp_quarter,
    GROUPING(EXTRACT(MONTH FROM rc.start_date))       AS grp_month,
    GROUPING(ot.type_name)                            AS grp_type
FROM RENTAL_CONTRACT rc
JOIN RENTAL_OBJECT ro ON rc.object_id = ro.object_id
JOIN OBJECT_TYPE ot ON ro.type_id = ot.type_id
WHERE rc.status IN ('Активен', 'Завершен')
GROUP BY GROUPING SETS (
    (ot.type_name, EXTRACT(YEAR FROM rc.start_date), TRUNC(rc.start_date, 'Q'), EXTRACT(MONTH FROM rc.start_date)),  -- месяц
    (ot.type_name, EXTRACT(YEAR FROM rc.start_date), TRUNC(rc.start_date, 'Q')),                                     -- квартал
    (ot.type_name, EXTRACT(YEAR FROM rc.start_date)),                                                                -- год
    (ot.type_name)                                                                                                   -- итого по виду услуги
)
ORDER BY ot.type_name, Год NULLS LAST, Квартал NULLS LAST, Месяц NULLS LAST;