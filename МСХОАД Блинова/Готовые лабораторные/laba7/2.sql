SELECT 
    type_name          AS "Вид услуги",
    month_year         AS "Период",
    total_amount       AS "Сумма",
    pattern_match      AS "Паттерн",
    match_number       AS "Номер паттерна"
FROM (
    SELECT 
        ot.type_name,
        TO_CHAR(rc.start_date, 'YYYY-MM') AS month_year,
        SUM(rc.total_amount)              AS total_amount,
        rc.start_date                     AS dt
    FROM RENTAL_CONTRACT rc
    JOIN RENTAL_OBJECT ro ON rc.object_id = ro.object_id
    JOIN OBJECT_TYPE ot ON ro.type_id = ot.type_id
    WHERE rc.start_date >= DATE '2024-01-01'
      AND rc.status IN ('Активен', 'Завершен')
    GROUP BY ot.type_name, 
             TO_CHAR(rc.start_date, 'YYYY-MM'),
             rc.start_date
)
MATCH_RECOGNIZE (
    PARTITION BY type_name
    ORDER BY dt
    MEASURES 
        MATCH_NUMBER()      AS match_number,
        CLASSIFIER()        AS pattern_match,
        total_amount        AS total_amount,
        month_year          AS month_year,
        dt                  AS dt               
    PATTERN (UP DOWN UP)
    DEFINE 
        UP   AS total_amount > PREV(total_amount),
        DOWN AS total_amount < PREV(total_amount)
)
ORDER BY type_name, match_number, dt;



