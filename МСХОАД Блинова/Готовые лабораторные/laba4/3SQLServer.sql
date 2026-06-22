SELECT 
    ot.type_name                                   AS вид_услуги,
    SUM(rc.total_amount)                           AS объем_услуг,
    ROUND(100.0 * SUM(rc.total_amount) / 
          SUM(SUM(rc.total_amount)) OVER (), 2)    AS процент_от_общего,
    ROUND(100.0 * SUM(rc.total_amount) / 
          MAX(SUM(rc.total_amount)) OVER (), 2)    AS процент_от_максимума
FROM RENTAL_CONTRACT rc
JOIN RENTAL_OBJECT ro ON rc.object_id = ro.object_id
JOIN OBJECT_TYPE ot   ON ro.type_id   = ot.type_id
WHERE rc.start_date >= DATEADD(MONTH, -12, CAST(GETDATE() AS DATE))
  AND rc.status IN (N'Активен', N'Завершен')
GROUP BY ot.type_name
ORDER BY объем_услуг DESC;