--------------------------------------------------------------------------------
-- ЛАБОРАТОРНАЯ 3 (п. 1–8) — распределённая транзакция Oracle
-- Бригада: KGV (ноутбук 1, Docker) + VVV (ноутбук 2, VM)
--------------------------------------------------------------------------------
--
-- СООТВЕТСТВИЕ ЗАДАНИЮ
--   п.3  — пользователи KGV и VVV в PDB, привилегии на таблицы и DBLINK
--   п.4  — DBLINK типа USER1_USER2: KGV_VVV (на сервере KGV), VVV_KGV (на сервере VVV)
--   п.5  — TABLE_KGV (схема KGV), TABLE_VVV (схема VVV)
--   п.6  — скрипт от владельца линка KGV: INSERT/INSERT, INSERT/UPDATE, UPDATE/INSERT
--   п.7  — нарушение целостности на удалённом сервере (VVV)
--   п.8  — блокировка строки на удалённом сервере
--
-- п.9–22 (автономные транзакции, UDP-координатор, API DFS) — ОТДЕЛЬНАЯ ЧАСТЬ,
--   выполняется по материалам лекции 04 и лаб. 2 (C++), не в этом SQL-файле.
--
-- ПОДКЛЮЧЕНИЕ SQL Developer (каждый — к СВОЕМУ серверу):
--   Host: localhost   Port: 1521
--   KGV (Docker):  Service PDBORCL  (если в XE 21 только XEPDB1 — см. примечание ниже)
--   VVV (VM):      Service PDBORCL  (уточните у преподавателя, если иное)
--   Админ:         SYSTEM / MyStrongPassw0rd
--
-- ПРИМЕЧАНИЕ ПРО PDBORCL НА DOCKER (gvenzl/oracle-xe:21-slim)
--   В образе по умолчанию PDB называется XEPDB1, а не PDBORCL.
--   Варианты: (1) согласовать с преподавателем использование XEPDB1 на Docker;
--   (2) создать PDBORCL от SYS; (3) в VM переименовать/использовать тот же service name.
--   Ниже задано PDBORCL — при необходимости замените &PDB на XEPDB1 только на Docker.
--
-- ПЕРЕД НАЧАЛОМ: оба Oracle запущены, ipconfig, Test-NetConnection <IP> -Port 1521
-- Выполняйте блоки F5 (Run Script), чтобы работали CONNECT и DEFINE.
--------------------------------------------------------------------------------

DEFINE IP_DOCKER = '192.168.1.100'   -- IP ноутбука KGV (Docker), заменить!
DEFINE IP_VM     = '192.168.1.101'   -- IP ноутбука VVV (VM), заменить!
DEFINE PDB       = 'PDBORCL'          -- на Docker при необходимости: XEPDB1
DEFINE PWD       = 'MyStrongPassw0rd'


================================================================================
БЛОК A — НОУТБУК 1 (Docker), студент KGV
Задание п.3 — создать пользователя KGV в PDB
Под кем: SYSTEM
================================================================================

-- ALTER SESSION SET CONTAINER = &PDB;

SELECT name, open_mode FROM v$pdbs;

-- DROP USER KGV CASCADE;
CREATE USER KGV IDENTIFIED BY "&PWD";
GRANT CONNECT, CREATE SESSION, CREATE TABLE, CREATE DATABASE LINK TO KGV;
ALTER USER KGV QUOTA UNLIMITED ON USERS;

SELECT username, account_status FROM dba_users WHERE username = 'KGV';


================================================================================
БЛОК B — НОУТБУК 2 (VM), студент VVV
Задание п.3 — создать пользователя VVV в PDB
Под кем: SYSTEM
================================================================================

-- ALTER SESSION SET CONTAINER = &PDB;

SELECT name, open_mode FROM v$pdbs;

-- DROP USER VVV CASCADE;
CREATE USER VVV IDENTIFIED BY "&PWD";
GRANT CONNECT, CREATE SESSION, CREATE TABLE, CREATE DATABASE LINK TO VVV;
ALTER USER VVV QUOTA UNLIMITED ON USERS;

SELECT username, account_status FROM dba_users WHERE username = 'VVV';


================================================================================
БЛОК C — ТОЛЬКО НОУТБУК 1 (Docker), студент KGV
Задание п.4, п.5 — DBLINK KGV_VVV и локальная таблица TABLE_KGV
Под кем: KGV (владелец линка для п.6–8)
================================================================================

CONNECT KGV/"&PWD"@//localhost:1521/&PDB;

-- п.4: линк типа USER1_USER2 = KGV_VVV → подключается к пользователю VVV на сервере 2
CREATE DATABASE LINK KGV_VVV
  CONNECT TO VVV IDENTIFIED BY "&PWD"
  USING '(DESCRIPTION=
            (ADDRESS=(PROTOCOL=TCP)(HOST=&IP_VM)(PORT=1521))
            (CONNECT_DATA=(SERVICE_NAME=&PDB)))';

-- п.5: таблица в схеме KGV (сервер 1)
CREATE TABLE TABLE_KGV (
   id   NUMBER PRIMARY KEY,
   name VARCHAR2(255) NOT NULL
);


================================================================================
БЛОК D — ТОЛЬКО НОУТБУК 2 (VM), студент VVV
Задание п.4, п.5 — DBLINK VVV_KGV и локальная таблица TABLE_VVV
Под кем: VVV
================================================================================

CONNECT VVV/"&PWD"@//localhost:1521/&PDB;

-- п.4: зеркальный линк VVV_KGV → пользователь KGV на сервере 1
CREATE DATABASE LINK VVV_KGV
  CONNECT TO KGV IDENTIFIED BY "&PWD"
  USING '(DESCRIPTION=
            (ADDRESS=(PROTOCOL=TCP)(HOST=&IP_DOCKER)(PORT=1521))
            (CONNECT_DATA=(SERVICE_NAME=&PDB)))';

-- п.5: таблица в схеме VVV (сервер 2)
CREATE TABLE TABLE_VVV (
   id   NUMBER PRIMARY KEY,
   name VARCHAR2(255) NOT NULL
);

INSERT INTO TABLE_VVV (id, name) VALUES (1, 'Alice');
COMMIT;


================================================================================
БЛОК E — ПРОВЕРКА СВЯЗИ
================================================================================

-- --- Ноутбук 1 (KGV) ---
CONNECT KGV/"&PWD"@//localhost:1521/&PDB;

SELECT db_link, username, host FROM user_db_links;
SELECT table_name FROM user_tables;
SELECT * FROM TABLE_KGV;
SELECT * FROM TABLE_VVV@KGV_VVV;       -- строка Alice с сервера VVV

-- --- Ноутбук 2 (VVV) ---
-- CONNECT VVV/"&PWD"@//localhost:1521/&PDB;
-- SELECT db_link, username, host FROM user_db_links;
-- SELECT * FROM TABLE_VVV;
-- SELECT * FROM TABLE_KGV@VVV_KGV;


================================================================================
БЛОК F — ТОЛЬКО НОУТБУК 1 (KGV)
Задание п.6 — распределённые транзакции от владельца DBLINK (KGV)
Под кем: KGV
Три случая: INSERT/INSERT, INSERT/UPDATE, UPDATE/INSERT
================================================================================

CONNECT KGV/"&PWD"@//localhost:1521/&PDB;

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
Задание п.7 — нарушение целостности на УДАЛЁННОМ сервере (VVV)
Под кем: KGV
Ожидается: ORA-00001 (дубликат PK) на TABLE_VVV@KGV_VVV;
           локальный INSERT в TABLE_KGV уже закоммичен — откат удалённой части не отменит его
================================================================================

CONNECT KGV/"&PWD"@//localhost:1521/&PDB;

BEGIN
   INSERT INTO TABLE_KGV (id, name) VALUES (30, 'Petr');
   COMMIT;

   INSERT INTO TABLE_VVV@KGV_VVV (id, name) VALUES (1, 'Duplicate PK');
   COMMIT;
END;
/

-- Проверка: на сервере 1 строка (30) есть; на сервере 2 id=1 не изменился
SELECT * FROM TABLE_KGV WHERE id = 30;
SELECT * FROM TABLE_VVV@KGV_VVV WHERE id = 1;


================================================================================
БЛОК H — ТОЛЬКО НОУТБУК 1 (KGV), ДВА ОКНА SQL Developer
Задание п.8 — блокировка ресурса на удалённом сервере
Под кем: KGV в обоих окнах
================================================================================
--
-- Окно 1: начать изменение на удалённой таблице БЕЗ COMMIT
--
CONNECT KGV/"&PWD"@//localhost:1521/&PDB;

BEGIN
   UPDATE TABLE_VVV@KGV_VVV SET name = 'Locked' WHERE id = 1;
END;
/
--
-- Окно 2: попытка доступа к той же строке — сессия зависнет в ожидании
--   UPDATE TABLE_VVV@KGV_VVV SET name = 'Wait' WHERE id = 1;
--
-- Окно 1: завершить блокировку
--   COMMIT;   или   ROLLBACK;
-- После этого окно 2 продолжит выполнение.
--


================================================================================
ВОЗВРАТ К SYSTEM (на любом ноутбуке, при необходимости)
================================================================================

CONNECT SYSTEM/"&PWD"@//localhost:1521/&PDB;

-- SELECT owner, db_link, host FROM dba_db_links WHERE owner IN ('KGV','VVV');
-- DROP USER KGV CASCADE;   -- только на сервере 1
-- DROP USER VVV CASCADE;   -- только на сервере 2
