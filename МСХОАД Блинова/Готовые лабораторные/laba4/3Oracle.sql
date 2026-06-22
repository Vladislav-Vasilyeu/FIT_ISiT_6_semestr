WITH stats AS (
    SELECT 
        ot.type_name                                   AS Вид_услуги,
        SUM(rc.total_amount)                           AS Объём_услуги,
        SUM(SUM(rc.total_amount)) OVER ()              AS Общий_объём_всех_услуг,
        MAX(SUM(rc.total_amount)) OVER ()              AS Максимальный_объём_одной_услуги
    FROM RENTAL_CONTRACT rc
    INNER JOIN RENTAL_OBJECT ro ON rc.object_id = ro.object_id
    INNER JOIN OBJECT_TYPE ot ON ro.type_id = ot.type_id
    WHERE rc.start_date >= ADD_MONTHS(TRUNC(SYSDATE), -12)   -- последние 12 месяцев
      AND rc.status IN ('Активен', 'Завершен')
    GROUP BY ot.type_name
)
SELECT 
    Вид_услуги,
    Объём_услуги,
    ROUND(100.0 * Объём_услуги / Общий_объём_всех_услуг, 2) AS Процент_от_общего,
    ROUND(100.0 * Объём_услуги / Максимальный_объём_одной_услуги, 2) AS Процент_от_максимума
FROM stats
ORDER BY Объём_услуги DESC;