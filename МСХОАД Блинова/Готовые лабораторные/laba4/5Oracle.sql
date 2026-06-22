DELETE FROM RENTAL_CONTRACT rc
WHERE rc.contract_id IN (
    SELECT contract_id
    FROM (
        SELECT 
            contract_id,
            ROW_NUMBER() OVER (
                PARTITION BY object_id, client_id, start_date 
                ORDER BY contract_id DESC
            ) AS rn
        FROM RENTAL_CONTRACT
    ) dup
    WHERE dup.rn > 1
);

