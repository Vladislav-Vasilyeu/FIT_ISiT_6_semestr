--------------------------------------------------------------------------------
-- ЛАБОРАТОРНАЯ 3 (п. 1–8) — распределённая транзакция Oracle
-- Бригада: KGV (ноутбук 1, Docker) + VVV (ноутбук 2, VM)
--------------------------------------------------------------------------------
--
-- PDB НА СЕРВЕРАХ (могут отличаться — это нормально):
--   Ноутбук 1 (Docker):  XEPDB1   — локально для KGV
--   Ноутбук 2 (VM):      FREEPDB1 — локально для VVV
--
-- В database link SERVICE_NAME всегда указывает PDB УДАЛЁННОГО сервера:
--   KGV_VVV (на Docker) → SERVICE_NAME = FREEPDB1
--   VVV_KGV (на VM)     → SERVICE_NAME = XEPDB1
--
-- ПОДКЛЮЧЕНИЕ SQL Developer:
--   Ноутбук 1: localhost:1521/XEPDB1,  SYSTEM или KGV
--   Ноутбук 2: localhost:1521/FREEPDB1, SYSTEM или VVV
--   (на ноуте 2 — из той среды, где виден listener: в VM или через проброс порта)
--
-- ПЕРЕД НАЧАЛОМ: ipconfig, Test-NetConnection <IP> -Port 1521 между ноутбуками
-- Выполняйте блоки F5 (Run Script), чтобы работали CONNECT и DEFINE.
--------------------------------------------------------------------------------

DEFINE IP_DOCKER = '26.191.211.216'   -- IP ноутбука KGV (Docker), заменить!
DEFINE IP_VM     = '26.27.136.13'   -- IP ноутбука VVV (VM), заменить!
DEFINE PDB_KGV   = 'XEPDB1'          -- PDB на ноутбуке 1 (Docker)
DEFINE PDB_VVV   = 'FREEPDB1'        -- PDB на ноутбуке 2 (VM)
DEFINE PWD       = 'MyStrongPassw0rd'


================================================================================
БЛОК A — НОУТБУК 1 (Docker), студент KGV
Задание п.3 — создать пользователя KGV в PDB XEPDB1
Под кем: SYSTEM
================================================================================

ALTER SESSION SET CONTAINER = &PDB_KGV;

SELECT name, open_mode FROM v$pdbs;

-- DROP USER KGV CASCADE;
CREATE USER KGV IDENTIFIED BY "&PWD";
GRANT CONNECT, CREATE SESSION, CREATE TABLE, CREATE DATABASE LINK TO KGV;
ALTER USER KGV QUOTA UNLIMITED ON USERS;

SELECT username, account_status FROM dba_users WHERE username = 'KGV';


================================================================================
БЛОК B — НОУТБУК 2 (VM), студент VVV
Задание п.3 — создать пользователя VVV в PDB FREEPDB1
Под кем: SYSTEM
================================================================================

ALTER SESSION SET CONTAINER = &PDB_VVV;
show CON_NAME
SELECT name, open_mode FROM v$pdbs;

DROP USER VVV CASCADE;
CREATE USER VVV IDENTIFIED BY "&PWD";
GRANT CONNECT, CREATE SESSION, CREATE TABLE, CREATE DATABASE LINK TO VVV;
ALTER USER VVV QUOTA UNLIMITED ON USERS;

SELECT username, account_status FROM dba_users WHERE username = 'VVV';


================================================================================
БЛОК C — ТОЛЬКО НОУТБУК 1 (Docker), студент KGV
Задание п.4, п.5 — DBLINK KGV_VVV и локальная таблица TABLE_KGV
Под кем: KGV
================================================================================

CONNECT KGV/"&PWD"@//localhost:1521/&PDB_KGV;

-- п.4: KGV_VVV → пользователь VVV на сервере 2, PDB = FREEPDB1
CREATE DATABASE LINK KGV_VVV
  CONNECT TO VVV IDENTIFIED BY "&PWD"
  USING '(DESCRIPTION=
            (ADDRESS=(PROTOCOL=TCP)(HOST=&IP_VM)(PORT=1521))
            (CONNECT_DATA=(SERVICE_NAME=&PDB_VVV)))';

-- п.5: таблица в схеме KGV (сервер 1, XEPDB1)
CREATE TABLE TABLE_KGV (
   id   NUMBER PRIMARY KEY,
   name VARCHAR2(255) NOT NULL
);


================================================================================
БЛОК D — ТОЛЬКО НОУТБУК 2 (VM), студент VVV
Задание п.4, п.5 — DBLINK VVV_KGV и локальная таблица TABLE_VVV
Под кем: VVV
================================================================================

CONNECT VVV/"&PWD"@//localhost:1521/&PDB_VVV;

-- п.4: VVV_KGV → пользователь KGV на сервере 1, PDB = XEPDB1


CREATE DATABASE LINK VVV_KGV2
  CONNECT TO KGV2 IDENTIFIED BY "MyStrongPassw0rd"
  USING '(DESCRIPTION=
            (ADDRESS=(PROTOCOL=TCP)(HOST=&IP_DOCKER)(PORT=1521))
            (CONNECT_DATA=(SERVICE_NAME=XEPDB1)))';

-- п.5: таблица в схеме VVV (сервер 2, FREEPDB1)
CREATE TABLE TABLE_VVV (
   id   NUMBER PRIMARY KEY,
   name VARCHAR2(255) NOT NULL
);

INSERT INTO TABLE_VVV (id, name) VALUES (1, 'Alice');

COMMIT;


================================================================================
БЛОК E — ПРОВЕРКА СВЯЗИ
================================================================================

-- --- Ноутбук 1 (KGV, XEPDB1) ---
CONNECT KGV/"&PWD"@//localhost:1521/&PDB_KGV;

SELECT db_link, username, host FROM user_db_links;
SELECT table_name FROM user_tables;
SELECT * FROM TABLE_KGV;
SELECT * FROM TABLE_VVV@KGV_VVV;       -- строка Alice с FREEPDB1 (VVV)

-- --- Ноутбук 2 (VVV, FREEPDB1) ---
-- CONNECT VVV/"&PWD"@//26.212.28.85:1521/FREEPDB1;
-- SELECT db_link, username, host FROM user_db_links;
-- SELECT * FROM TABLE_VVV;
-- SELECT * FROM TABLE_KGV2@VVV_KGV2;


================================================================================
БЛОК F — ТОЛЬКО НОУТБУК 1 (KGV)
Задание п.6 — распределённые транзакции от владельца DBLINK (KGV)
Под кем: KGV
Три случая: INSERT/INSERT, INSERT/UPDATE, UPDATE/INSERT
================================================================================

CONNECT KGV/"&PWD"@//localhost:1521/&PDB_KGV;

-- Случай 1: INSERT / INSERT (успешно)
BEGIN
   INSERT INTO TABLE_KGV (id, name) VALUES (10, 'KGV_ins1');
   INSERT INTO TABLE_VVV@KGV_VVV (id, name) VALUES (10, 'VVV_ins1');
   COMMIT;
END;
/

-- Случай 2: INSERT / UPDATE (успешно)
BEGIN
   INSERT INTO TABLE_KGV (id, name) VALUES (20, 'KGV_ins2');
   UPDATE TABLE_VVV@KGV_VVV SET name = 'VVV_upd' WHERE id = 1;
   COMMIT;
END;
/

-- Случай 3: UPDATE / INSERT (успешно)
BEGIN
   UPDATE TABLE_KGV SET name = 'KGV_upd' WHERE id = 10;
   INSERT INTO TABLE_VVV@KGV_VVV (id, name) VALUES (20, 'VVV_ins2');
   COMMIT;
END;
/

SELECT * FROM TABLE_KGV ORDER BY id;
SELECT * FROM TABLE_VVV@KGV_VVV ORDER BY id;


================================================================================
БЛОК G — ТОЛЬКО НОУТБУК 1 (KGV)
Задание п.7 — нарушение целостности на УДАЛЁННОМ сервере (VVV / FREEPDB1)
Под кем: KGV
================================================================================

CONNECT KGV/"&PWD"@//localhost:1521/&PDB_KGV;

BEGIN
   INSERT INTO TABLE_KGV (id, name) VALUES (30, 'Petr');
   COMMIT;

   INSERT INTO TABLE_VVV@KGV_VVV (id, name) VALUES (1, 'Duplicate PK');
   COMMIT;
END;
/

SELECT * FROM TABLE_KGV WHERE id = 30;
SELECT * FROM TABLE_VVV@KGV_VVV WHERE id = 1;


================================================================================
БЛОК H — ТОЛЬКО НОУТБУК 1 (KGV), ДВА ОКНА SQL Developer
Задание п.8 — блокировка ресурса на удалённом сервере (FREEPDB1)
Под кем: KGV в обоих окнах
================================================================================
--
-- Окно 1:
--
CONNECT KGV/"&PWD"@//localhost:1521/&PDB_KGV;

BEGIN
   UPDATE TABLE_VVV@KGV_VVV SET name = 'Locked' WHERE id = 1;
END;
/
--
-- Окно 2: UPDATE TABLE_VVV@KGV_VVV SET name = 'Wait' WHERE id = 1;
-- Окно 1: COMMIT; или ROLLBACK;
--


================================================================================
ВОЗВРАТ К SYSTEM
================================================================================

-- Ноутбук 1 (Docker):
CONNECT SYSTEM/"&PWD"@//localhost:1521/&PDB_KGV;

-- Ноутбук 2 (VM):
-- CONNECT SYSTEM/"&PWD"@//localhost:1521/&PDB_VVV;
