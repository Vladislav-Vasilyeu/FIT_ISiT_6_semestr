WITH numbered AS (
    SELECT 
        rc.contract_id,
        ot.type_name,
        cl.full_name AS client,
        rc.total_amount,
        ROW_NUMBER() OVER (ORDER BY rc.total_amount DESC) AS rn
    FROM RENTAL_CONTRACT rc
    JOIN RENTAL_OBJECT ro ON rc.object_id = ro.object_id
    JOIN OBJECT_TYPE ot ON ro.type_id = ot.type_id
    JOIN CLIENT cl ON rc.client_id = cl.client_id
)
SELECT 
    rn,
    contract_id,
    type_name,
    client,
    total_amount
FROM numbered
WHERE rn BETWEEN 21 AND 40;   
