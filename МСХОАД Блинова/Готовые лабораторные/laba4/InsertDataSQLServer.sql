DECLARE @i INT = 1;
WHILE @i <= 120
BEGIN
    DECLARE @obj INT = (SELECT TOP 1 object_id FROM RENTAL_OBJECT ORDER BY NEWID());
    DECLARE @cli INT = (SELECT TOP 1 client_id FROM CLIENT ORDER BY NEWID());
    DECLARE @start DATE = DATEADD(DAY, ABS(CHECKSUM(NEWID())) % 1000, '20230101');
    DECLARE @days INT = 30 + ABS(CHECKSUM(NEWID())) % 180;
    DECLARE @end DATE = DATEADD(DAY, @days, @start);
    DECLARE @rate DECIMAL(10,2) = (SELECT daily_rate FROM RENTAL_OBJECT WHERE object_id = @obj);

    INSERT INTO RENTAL_CONTRACT (object_id, client_id, start_date, end_date, total_amount, status)
    VALUES (@obj, @cli, @start, @end, @rate * @days, 'Активен');

    SET @i = @i + 1;
END;


INSERT INTO PAYMENT (contract_id, client_id, payment_date, amount, payment_type, status)
SELECT 
    rc.contract_id, 
    rc.client_id, 
    DATEADD(DAY, ABS(CHECKSUM(NEWID())) % DATEDIFF(DAY, rc.start_date, rc.end_date), rc.start_date),
    rc.total_amount * (0.4 + ABS(CHECKSUM(NEWID())) % 60 / 100.0),
    CASE ABS(CHECKSUM(NEWID())) % 4 WHEN 0 THEN 'Наличные' WHEN 1 THEN 'Безналичные' ELSE 'Карта' END,
    'Выполнен'
FROM RENTAL_CONTRACT rc
WHERE rc.contract_id % 3 <> 0;  -- не всем договорам платёж