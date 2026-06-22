--6
SELECT 
    TABLE_NAME,
    COLUMN_NAME,
    DATA_TYPE
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_NAME IN ('ne_10m_geography_regions_points', 'ne_10m_rivers_europe', 'ne_10m_lakes')
AND COLUMN_NAME = 'geom';

--7
SELECT DISTINCT 'Points' AS TableName,  geom.STSrid AS SRID FROM ne_10m_geography_regions_points
UNION ALL
SELECT DISTINCT 'Rivers',  geom.STSrid FROM ne_10m_rivers_europe
UNION ALL
SELECT DISTINCT 'Lakes',  geom.STSrid FROM ne_10m_lakes;

--8
SELECT COLUMN_NAME, DATA_TYPE 
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_NAME = 'ne_10m_geography_regions_points' 
AND DATA_TYPE != 'geometry';


SELECT COLUMN_NAME, DATA_TYPE 
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_NAME = 'ne_10m_rivers_europe' 
AND DATA_TYPE != 'geometry';


SELECT COLUMN_NAME, DATA_TYPE 
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_NAME = 'ne_10m_lakes' 
AND DATA_TYPE != 'geometry';

--9
SELECT TOP 1 name, geom.STAsText() AS WKT 
FROM ne_10m_geography_regions_points;

SELECT TOP 1 name, geom.STAsText() AS WKT 
FROM ne_10m_rivers_europe;

SELECT TOP 1 name, geom.STAsText() AS WKT 
FROM ne_10m_lakes;

--10.1
SELECT 
    r.name_ru AS RiverName,
    l.name_ru AS LakeName,
    r.geom.STIntersection(l.geom).STAsText() AS IntersectionPoint
FROM ne_10m_rivers_europe r
JOIN ne_10m_lakes l ON r.geom.STIntersects(l.geom) = 1;


SELECT 
    p.name_ru AS PointName,
    l.name_ru AS LakeName
FROM ne_10m_geography_regions_points p
JOIN ne_10m_lakes l ON l.geom.STContains(p.geom) = 1;

--10.2
SELECT TOP 1
    r.name_ru,
    l.name_ru,
    r.geom.STUnion(l.geom).STAsText() AS Combined
FROM ne_10m_rivers_europe r
JOIN ne_10m_lakes l ON r.geom.STIntersects(l.geom) = 1;

--10.3
SELECT 
    r.name_ru AS River,
    l.name_ru AS SourceLake
FROM ne_10m_rivers_europe r
JOIN ne_10m_lakes l ON l.geom.STContains(r.geom.STStartPoint()) = 1;

--10.4
SELECT 
    name,
    geom.STNumPoints() AS OriginalPoints,
    geom.STAsText() AS OriginalWKT
FROM ne_10m_rivers_europe
WHERE name = 'Volga';

SELECT 
    name,
    geom.STNumPoints() AS OriginalPoints,
    geom.Reduce(0.01).STNumPoints() AS SimplifiedPoints,
    geom.Reduce(0.01).STAsText() AS SimplifiedWKT
FROM ne_10m_rivers_europe
WHERE name = 'Volga';

--10.5
SELECT 
    name_ru,
    geom.STX AS Longitude,
    geom.STY AS Latitude
FROM ne_10m_geography_regions_points;

--10.6
SELECT 
    'Points (Точки)' AS ObjectType,
    geom.STDimension() AS Dimension,
    COUNT(*) AS Count
FROM ne_10m_geography_regions_points
GROUP BY geom.STDimension()

UNION ALL

SELECT 
    'Rivers (Линии)',
    geom.STDimension(),
    COUNT(*)
FROM ne_10m_rivers_europe
GROUP BY geom.STDimension()

UNION ALL

SELECT 
    'Lakes (Полигоны)',
    geom.STDimension(),
    COUNT(*)
FROM ne_10m_lakes
GROUP BY geom.STDimension();

--10.7
SELECT 
    name_ru,
    geom.STLength() AS Length_Degrees,
    geom.STLength() * 111 AS ApproxLength_KM  
FROM ne_10m_rivers_europe
ORDER BY geom.STLength() ASC;

--10.8
SELECT TOP 5
    p.name_ru AS PointName,
    l.name_ru AS NearestLake,
    p.geom.STDistance(l.geom) AS Distance_Degrees,
    p.geom.STDistance(l.geom) * 111 AS ApproxDistance_KM
FROM ne_10m_geography_regions_points p
CROSS JOIN ne_10m_lakes l
WHERE p.name IS NOT NULL AND l.name IS NOT NULL
ORDER BY p.geom.STDistance(l.geom);

--11
CREATE TABLE MyObjects (
    ID INT PRIMARY KEY,
    ObjType NVARCHAR(50),
    Name NVARCHAR(100),
    Description NVARCHAR(200),
    geom GEOMETRY
);

INSERT INTO MyObjects VALUES 
(1, 'Point', 'Minsk_Center', 'Центр Минска', 
 GEOMETRY::STGeomFromText('POINT(27.5615 53.9045)', 4326));

INSERT INTO MyObjects VALUES 
(2, 'Line', 'Minsk_Brest_Highway', 'Трасса М1 Минск-Брест', 
 GEOMETRY::STGeomFromText('LINESTRING(27.5615 53.9045, 26.9 53.4, 26.0 53.1, 25.3 52.6, 23.68 52.10)', 4326));

INSERT INTO MyObjects VALUES 
(3, 'Polygon', 'Test_Zone_Belarus', 'Тестовая зона в Минской области', 
 GEOMETRY::STGeomFromText('POLYGON((27.0 53.5, 28.0 53.5, 28.0 54.0, 27.0 54.0, 27.0 53.5))', 4326));

SELECT ID, ObjType, Name, Description, geom.STAsText() AS WKT FROM MyObjects;

--12
SELECT 
    'Точка: Минск' AS MyObject,
    l.name AS InsideLake,
    'STContains' AS CheckMethod
FROM ne_10m_lakes l
JOIN MyObjects m ON l.geom.STContains(m.geom) = 1
WHERE m.ID = 1

UNION ALL

SELECT 
    'Трасса М1',
    r.name_ru,
    'STIntersects'
FROM ne_10m_rivers_europe r
JOIN MyObjects m ON r.geom.STIntersects(m.geom) = 1
WHERE m.ID = 2

UNION ALL

SELECT 
    'Минская обл.',
    r.name,
    'STIntersects'
FROM ne_10m_rivers_europe r
JOIN MyObjects m ON r.geom.STIntersects(m.geom) = 1
WHERE m.ID = 3

UNION ALL

SELECT 
    'Минская обл.',
    p.name,
    'STContains (точка в полигоне)'
FROM ne_10m_geography_regions_points p
JOIN MyObjects m ON m.geom.STContains(p.geom) = 1
WHERE m.ID = 3;