
SELECT 
    client_id,
    client_name,
    month,
    current_amount,
    planned_amount,
    growth_percent
FROM (
    SELECT 
        cl.client_id,
        cl.full_name AS client_name,
        EXTRACT(MONTH FROM rc.start_date) AS month,
        SUM(rc.total_amount) AS current_amount
    FROM RENTAL_CONTRACT rc
    JOIN CLIENT cl ON rc.client_id = cl.client_id
    WHERE rc.start_date >= DATE '2025-01-01'
      AND rc.start_date <  DATE '2026-01-01'        -- базовый 2025 год
      AND rc.status IN ('Активен', 'Завершен')
    GROUP BY cl.client_id, cl.full_name, EXTRACT(MONTH FROM rc.start_date)
)
MODEL
    PARTITION BY (client_id, client_name)
    DIMENSION BY (month)
    MEASURES (
        current_amount,
        0 AS planned_amount,
        0 AS growth_percent
    )
    RULES (
        planned_amount[FOR month FROM 1 TO 12 INCREMENT 1] = 
            current_amount[CV(month)] * 1.10,                    -- +10% рост
        
        growth_percent[ANY] = ROUND(
            (planned_amount[CV()] - current_amount[CV()]) / 
            NULLIF(current_amount[CV()], 0) * 100, 2)
    )
ORDER BY client_id, month;