DECLARE @start date = DATEADD(MONTH, -6, DATEFROMPARTS(YEAR(CURRENT_DATE), MONTH(CURRENT_DATE), 1)); 
DECLARE @end   date = DATEFROMPARTS(YEAR(CURRENT_DATE), MONTH(CURRENT_DATE), 1);                      

SELECT
    cl.client_type AS Вид_клиента,
    FORMAT(DATEFROMPARTS(YEAR(rc.start_date), MONTH(rc.start_date), 1), 'yyyy-MM') AS Период,
    SUM(rc.total_amount) AS Сумма_аренды_за_месяц
FROM dbo.RENTAL_CONTRACT rc
JOIN dbo.CLIENT cl ON rc.client_id = cl.client_id
WHERE rc.start_date >= @start
  AND rc.start_date <  @end
  AND rc.status IN (N'Активен', N'Завершен')
GROUP BY
    cl.client_type,
    DATEFROMPARTS(YEAR(rc.start_date), MONTH(rc.start_date), 1)
ORDER BY
    cl.client_type,
    DATEFROMPARTS(YEAR(rc.start_date), MONTH(rc.start_date), 1);