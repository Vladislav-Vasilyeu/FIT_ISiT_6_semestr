--------------------------------------------------------------------------------
-- ЛАБОРАТОРНАЯ 3 (п. 1–8) — распределённая транзакция Oracle
-- Бригада: KGV2 (ноутбук 1, Docker) + VVV (ноутбук 2, VM)
--------------------------------------------------------------------------------
--
-- PDB: Docker = XEPDB1 (KGV2), VM = FREEPDB1 (VVV)
-- Линки: KGV2_VVV, VVV_KGV2
--
-- ВАЖНО: каждый блок можно запускать отдельно (F5) — без всплывающих окон.
-- Перед блоками C и D замените IP на реальные адреса ноутбуков.
--
-- ПОДКЛЮЧЕНИЕ SQL Developer (удобнее, чем CONNECT в скрипте):
--   Ноутбук 1: KGV2 / MyStrongPassw0rd @ localhost:1521/XEPDB1
--   Ноутбук 2: VVV  / MyStrongPassw0rd @ localhost:1521/FREEPDB1
--------------------------------------------------------------------------------


================================================================================
БЛОК A — НОУТБУК 1 (Docker), студент KGV2
Под кем: SYSTEM @ XEPDB1
================================================================================

ALTER SESSION SET CONTAINER = XEPDB1;

SELECT name, open_mode FROM v$pdbs;

-- DROP USER KGV2 CASCADE;
CREATE USER KGV2 IDENTIFIED BY "MyStrongPassw0rd";
GRANT CONNECT, CREATE SESSION, CREATE TABLE, CREATE DATABASE LINK TO KGV2;
ALTER USER KGV2 QUOTA UNLIMITED ON USERS;

SELECT username, account_status FROM dba_users WHERE username = 'KGV2';


================================================================================
БЛОК B — НОУТБУК 2 (VM), студент VVV
Под кем: SYSTEM @ FREEPDB1
================================================================================

ALTER SESSION SET CONTAINER = FREEPDB1;

SELECT name, open_mode FROM v$pdbs;

-- DROP USER VVV CASCADE;
CREATE USER VVV IDENTIFIED BY "MyStrongPassw0rd";
GRANT CONNECT, CREATE SESSION, CREATE TABLE, CREATE DATABASE LINK TO VVV;
ALTER USER VVV QUOTA UNLIMITED ON USERS;

SELECT username, account_status FROM dba_users WHERE username = 'VVV';


================================================================================
БЛОК C — ТОЛЬКО НОУТБУК 1 (Docker), студент KGV2
Под кем: KGV2
Перед запуском: замените 192.168.1.101 на IP ноутбука VVV (VM)
================================================================================

CONNECT KGV2/"MyStrongPassw0rd"@//localhost:1521/XEPDB1;

CREATE DATABASE LINK KGV2_VVV
  CONNECT TO VVV IDENTIFIED BY "MyStrongPassw0rd"
  USING '(DESCRIPTION=
            (ADDRESS=(PROTOCOL=TCP)(HOST=192.168.1.101)(PORT=1521))
            (CONNECT_DATA=(SERVICE_NAME=FREEPDB1)))';

CREATE TABLE TABLE_KGV2 (
   id   NUMBER PRIMARY KEY,
   name VARCHAR2(255) NOT NULL
);


================================================================================
БЛОК D — ТОЛЬКО НОУТБУК 2 (VM), студент VVV
Под кем: VVV
Перед запуском: замените 192.168.1.100 на IP ноутбука KGV2 (Docker)
================================================================================

CONNECT VVV/"MyStrongPassw0rd"@//localhost:1521/FREEPDB1;

CREATE DATABASE LINK VVV_KGV2
  CONNECT TO KGV2 IDENTIFIED BY "MyStrongPassw0rd"
  USING '(DESCRIPTION=
            (ADDRESS=(PROTOCOL=TCP)(HOST=192.168.1.100)(PORT=1521))
            (CONNECT_DATA=(SERVICE_NAME=XEPDB1)))';

CREATE TABLE TABLE_VVV (
   id   NUMBER PRIMARY KEY,
   name VARCHAR2(255) NOT NULL
);

INSERT INTO TABLE_VVV (id, name) VALUES (1, 'Alice');
COMMIT;


================================================================================
БЛОК E — ПРОВЕРКА СВЯЗИ
================================================================================

-- --- Ноутбук 1 (KGV2) ---
CONNECT KGV2/"MyStrongPassw0rd"@//localhost:1521/XEPDB1;

SELECT db_link, username, host FROM user_db_links;
SELECT table_name FROM user_tables;
SELECT * FROM TABLE_KGV2;
SELECT * FROM TABLE_VVV@KGV2_VVV;

-- --- Ноутбук 2 (VVV) ---
-- CONNECT VVV/"MyStrongPassw0rd"@//localhost:1521/FREEPDB1;
-- SELECT * FROM TABLE_VVV;
-- SELECT * FROM TABLE_KGV2@VVV_KGV2;


================================================================================
БЛОК F — ТОЛЬКО НОУТБУК 1 (KGV2), п.6
================================================================================

CONNECT KGV2/"MyStrongPassw0rd"@//localhost:1521/XEPDB1;

BEGIN
   INSERT INTO TABLE_KGV2 (id, name) VALUES (10, 'KGV2_ins1');
   INSERT INTO TABLE_VVV@KGV2_VVV (id, name) VALUES (10, 'VVV_ins1');
   COMMIT;
END;
/

BEGIN
   INSERT INTO TABLE_KGV2 (id, name) VALUES (20, 'KGV2_ins2');
   UPDATE TABLE_VVV@KGV2_VVV SET name = 'VVV_upd' WHERE id = 1;
   COMMIT;
END;
/

BEGIN
   UPDATE TABLE_KGV2 SET name = 'KGV2_upd' WHERE id = 10;
   INSERT INTO TABLE_VVV@KGV2_VVV (id, name) VALUES (20, 'VVV_ins2');
   COMMIT;
END;
/

SELECT * FROM TABLE_KGV2 ORDER BY id;
SELECT * FROM TABLE_VVV@KGV2_VVV ORDER BY id;


================================================================================
БЛОК G — ТОЛЬКО НОУТБУК 1 (KGV2), п.7
================================================================================

CONNECT KGV2/"MyStrongPassw0rd"@//localhost:1521/XEPDB1;

BEGIN
   INSERT INTO TABLE_KGV2 (id, name) VALUES (30, 'Petr');
   COMMIT;

   INSERT INTO TABLE_VVV@KGV2_VVV (id, name) VALUES (1, 'Duplicate PK');
   COMMIT;
END;
/

SELECT * FROM TABLE_KGV2 WHERE id = 30;
SELECT * FROM TABLE_VVV@KGV2_VVV WHERE id = 1;


================================================================================
БЛОК H — ТОЛЬКО НОУТБУК 1 (KGV2), п.8, ДВА ОКНА
================================================================================

CONNECT KGV2/"MyStrongPassw0rd"@//localhost:1521/XEPDB1;

BEGIN
   UPDATE TABLE_VVV@KGV2_VVV SET name = 'Locked' WHERE id = 1;
END;
/
-- Окно 2: UPDATE TABLE_VVV@KGV2_VVV SET name = 'Wait' WHERE id = 1;
-- Окно 1: COMMIT; или ROLLBACK;


================================================================================
ВОЗВРАТ К SYSTEM
================================================================================

CONNECT SYSTEM/"MyStrongPassw0rd"@//localhost:1521/XEPDB1;
