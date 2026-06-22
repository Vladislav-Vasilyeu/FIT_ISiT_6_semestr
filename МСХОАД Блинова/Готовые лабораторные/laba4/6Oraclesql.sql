WITH последние_6_мес AS (
    SELECT 
        cl.client_type                               AS Вид_клиента,
        EXTRACT(YEAR FROM rc.start_date)             AS Год,
        EXTRACT(MONTH FROM rc.start_date)            AS Месяц,
        TRUNC(rc.start_date, 'MM')                   AS Дата_начала_месяца,
        SUM(rc.total_amount)                         AS Сумма_аренды_за_месяц
    FROM RENTAL_CONTRACT rc
    INNER JOIN CLIENT cl ON rc.client_id = cl.client_id
    WHERE rc.start_date >= ADD_MONTHS(TRUNC(SYSDATE), -6)
      AND rc.start_date < TRUNC(SYSDATE)
      AND rc.status IN ('Активен', 'Завершен')
    GROUP BY cl.client_type, EXTRACT(YEAR FROM rc.start_date), EXTRACT(MONTH FROM rc.start_date), TRUNC(rc.start_date, 'MM')
)
SELECT 
    Вид_клиента,
    TO_CHAR(Дата_начала_месяца, 'YYYY-MM')       AS Период,
    Сумма_аренды_за_месяц                        AS Сумма_аренды,
    SUM(Сумма_аренды_за_месяц) OVER (
        PARTITION BY Вид_клиента
        ORDER BY Дата_начала_месяца
        ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW
    )                                            AS Накопительная_сумма
FROM последние_6_мес
ORDER BY Вид_клиента, Дата_начала_месяца;