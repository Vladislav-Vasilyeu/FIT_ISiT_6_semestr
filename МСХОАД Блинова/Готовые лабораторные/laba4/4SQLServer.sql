DECLARE @PageNumber INT = 1; 
DECLARE @PageSize   INT = 20; 

;WITH OrderedContracts AS (
    SELECT
        rc.contract_id,
        cl.client_type,
        cl.full_name,
        rc.start_date,
        rc.total_amount,
        ROW_NUMBER() OVER (ORDER BY rc.start_date DESC, rc.contract_id) AS rn
    FROM RentalService.dbo.RENTAL_CONTRACT rc
    INNER JOIN RentalService.dbo.CLIENT cl ON rc.client_id = cl.client_id
    WHERE rc.status IN (N'Активен', N'Завершен')
)
SELECT
    contract_id,
    client_type,
    full_name,
    start_date,
    total_amount
FROM OrderedContracts
WHERE rn BETWEEN (@PageNumber - 1) * @PageSize + 1 AND @PageNumber * @PageSize
ORDER BY rn;