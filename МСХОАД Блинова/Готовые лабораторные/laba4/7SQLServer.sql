WITH частота_аренды AS (
    SELECT 
        cl.client_id,
        cl.full_name                               AS Клиент,
        cl.client_type                             AS Вид_клиента,
        ot.type_name                               AS Услуга,
        COUNT(rc.contract_id)                      AS Количество_раз,
        ROW_NUMBER() OVER (
            PARTITION BY cl.client_id 
            ORDER BY COUNT(rc.contract_id) DESC, ot.type_name
        )                                          AS Ранг
    FROM CLIENT cl
    LEFT JOIN RENTAL_CONTRACT rc ON cl.client_id = rc.client_id
    LEFT JOIN RENTAL_OBJECT ro   ON rc.object_id = ro.object_id
    LEFT JOIN OBJECT_TYPE ot     ON ro.type_id   = ot.type_id
    GROUP BY cl.client_id, cl.full_name, cl.client_type, ot.type_name
)
SELECT 
    Клиент,
    Вид_клиента,
    Услуга                                     AS Наиболее_частая_услуга,
    Количество_раз                             AS Сколько_раз_арендовал,
    Ранг                                       AS Ранг_внутри_клиента
FROM частота_аренды
WHERE Ранг = 1
ORDER BY Вид_клиента, Количество_раз DESC, Клиент;