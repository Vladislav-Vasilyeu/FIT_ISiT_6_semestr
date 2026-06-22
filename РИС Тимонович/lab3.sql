--------------------------------------------------------------------------------
-- ЛАБОРАТОРНАЯ 3 — распределённые транзакции Oracle (database link)
--------------------------------------------------------------------------------
--
-- АРХИТЕКТУРА
--   Ноутбук 1 (Docker, контейнер oracle-ris) — «сервер A»
--     локальная таблица: RISD
--     database link:     RISD_RISA  →  указывает на ноутбук 2
--
--   Ноутбук 2 (Oracle в виртуальной машине) — «сервер B»
--     локальная таблица: RISA
--     database link:     RISA_RISD  →  указывает на ноутбук 1
--
-- ПОДКЛЮЧЕНИЕ SQL Developer (на каждом ноутбуке к СВОЕМУ Oracle):
--   Host: localhost   Port: 1521   Service: XEPDB1
--
-- ПЕРЕД НАЧАЛОМ
--   1) На ноутбуке 1: docker start oracle-ris  (если контейнер остановлен)
--   2) На ноутбуке 2: Oracle в VM запущен, listener на 1521
--   3) Узнать IP обоих ПК:  ipconfig   (Wi-Fi / Ethernet, не 127.0.0.1)
--   4) Заменить ниже IP_PC1 и IP_PC2 на реальные адреса
--   5) Проверить связь с другого ПК:  Test-NetConnection <IP> -Port 1521
--
-- КАК ВЫПОЛНЯТЬ СКРИПТ
--   Выполняйте блоки по порядку. В заголовке каждого блока указано КТО и ПОД КЕМ.
--   Команда CONNECT переключает пользователя в текущей сессии SQL Developer / SQL*Plus.
--   В SQL Developer: выделите блок и нажмите F5 (Run Script), чтобы CONNECT сработал.
--
--------------------------------------------------------------------------------

-- >>> ЗАМЕНИТЕ НА СВОИ IP <<<
DEFINE IP_PC1 = '192.168.1.100'   -- ноутбук 1 (Docker)
DEFINE IP_PC2 = '192.168.1.101'   -- ноутбук 2 (VM)


================================================================================
БЛОК A — ОБА НОУТБУКА
Кто:      каждый студент на своём ПК
Под кем:  SYSTEM / MyStrongPassw0rd
Сервис:   XEPDB1
Что:      создать учебного пользователя RISA (п. 1 задания)
================================================================================

-- Если подключились к CDB (сервис XE), переключитесь в PDB:
-- ALTER SESSION SET CONTAINER = XEPDB1;

SELECT name, open_mode FROM v$pdbs;

-- DROP USER RISA CASCADE;   -- раскомментировать, если нужно пересоздать пользователя
CREATE USER RISA IDENTIFIED BY "MyStrongPassw0rd";
GRANT CONNECT, CREATE SESSION, CREATE TABLE, CREATE DATABASE LINK TO RISA;
ALTER USER RISA QUOTA UNLIMITED ON USERS;

SELECT username, account_status FROM dba_users WHERE username = 'RISA';


================================================================================
БЛОК B — ТОЛЬКО НОУТБУК 1 (Docker, сервер A)
Кто:      студент с ноутбуком, где oracle-ris
Под кем:  сначала SYSTEM (блок A уже выполнен), затем RISA (команда CONNECT ниже)
Что:      database link на сервер B, локальная таблица RISD (п. 2 и 3 задания)
================================================================================

-- Переключение на пользователя RISA (дальше все объекты — в схеме RISA):
CONNECT RISA/"MyStrongPassw0rd"@//localhost:1521/XEPDB1;

-- Линк к удалённой таблице RISA на ноутбуке 2 (VM):
CREATE DATABASE LINK RISD_RISA
  CONNECT TO RISA IDENTIFIED BY "MyStrongPassw0rd"
  USING '(DESCRIPTION=
            (ADDRESS=(PROTOCOL=TCP)(HOST=&IP_PC2)(PORT=1521))
            (CONNECT_DATA=(SERVICE_NAME=XEPDB1)))';

-- Локальная таблица на сервере A:
CREATE TABLE RISD (
   id   NUMBER PRIMARY KEY,
   name VARCHAR2(255) NOT NULL
);

-- DROP TABLE RISD CASCADE CONSTRAINTS;   -- только если нужно пересоздать


================================================================================
БЛОК C — ТОЛЬКО НОУТБУК 2 (VM, сервер B)
Кто:      студент со вторым ноутбуком (Oracle в виртуальной машине)
Под кем:  сначала SYSTEM (блок A), затем RISA (CONNECT ниже)
Что:      зеркальный database link на сервер A, локальная таблица RISA, тестовые данные
================================================================================

-- Переключение на пользователя RISA:
CONNECT RISA/"MyStrongPassw0rd"@//localhost:1521/XEPDB1;

-- Линк к таблице RISD на ноутбуке 1 (Docker):
-- Если в VM другой service name — замените XEPDB1 (узнать: SELECT name FROM v$pdbs;)
CREATE DATABASE LINK RISA_RISD
  CONNECT TO RISA IDENTIFIED BY "MyStrongPassw0rd"
  USING '(DESCRIPTION=
            (ADDRESS=(PROTOCOL=TCP)(HOST=&IP_PC1)(PORT=1521))
            (CONNECT_DATA=(SERVICE_NAME=XEPDB1)))';

-- Локальная таблица на сервере B:
CREATE TABLE RISA (
   id   NUMBER PRIMARY KEY,
   name VARCHAR2(255) NOT NULL
);

-- DROP TABLE RISA CASCADE CONSTRAINTS;   -- только если нужно пересоздать

INSERT INTO RISA (id, name) VALUES (1, 'Alice');
COMMIT;


================================================================================
БЛОК D — ПРОВЕРКА СВЯЗИ (оба ноутбука, по очереди)
================================================================================

-- --- На ноутбуке 1 (RISA) ---
CONNECT RISA/"MyStrongPassw0rd"@//localhost:1521/XEPDB1;

SELECT table_name FROM user_tables;
SELECT * FROM RISD;
SELECT * FROM RISA@RISD_RISA;          -- должна вернуться строка Alice с ноутбука 2

-- --- На ноутбуке 2 (RISA) ---
-- CONNECT RISA/"MyStrongPassw0rd"@//localhost:1521/XEPDB1;
-- SELECT table_name FROM user_tables;
-- SELECT * FROM RISA;
-- SELECT * FROM RISD@RISA_RISD;       -- таблица RISD с ноутбука 1 (пока пустая — это нормально)


================================================================================
БЛОК E — ТОЛЬКО НОУТБУК 1 (п. 4 задания: распределённые транзакции)
Кто:      студент с Docker
Под кем:  RISA
Что:      INSERT/UPDATE в локальной RISD и удалённой RISA@RISD_RISA
================================================================================

CONNECT RISA/"MyStrongPassw0rd"@//localhost:1521/XEPDB1;

INSERT INTO RISA@RISD_RISA (id, name) VALUES (2, 'Misha');
INSERT INTO RISD (id, name) VALUES (3, 'Misha');
COMMIT;

BEGIN
   INSERT INTO RISD (id, name) VALUES (2, 'Misha');
   COMMIT;

   INSERT INTO RISA@RISD_RISA (id, name) VALUES (3, 'Pasha');
   COMMIT;
END;
/

BEGIN
   INSERT INTO RISD (id, name) VALUES (4, 'Sasha');
   COMMIT;

   UPDATE RISA@RISD_RISA SET name = 'Sasha' WHERE id = 1;
   COMMIT;
END;
/

BEGIN
   UPDATE RISD SET name = 'Gleb' WHERE id = 1337;
   COMMIT;

   INSERT INTO RISA@RISD_RISA (id, name) VALUES (5, 'Vlad');
   COMMIT;
END;
/

SELECT * FROM RISD;
SELECT * FROM RISA@RISD_RISA;


================================================================================
БЛОК F — ТОЛЬКО НОУТБУК 1 (п. 5 задания: ошибка целостности)
Под кем:  RISA
Что:      дубликат первичного ключа на удалённой стороне — ожидается ORA- ошибка
================================================================================

CONNECT RISA/"MyStrongPassw0rd"@//localhost:1521/XEPDB1;

BEGIN
   INSERT INTO RISD (id, name) VALUES (10, 'Petr');
   COMMIT;

   INSERT INTO RISA@RISD_RISA (id, name) VALUES (1, 'Invalid Item');
   COMMIT;
END;
/


================================================================================
БЛОК G — ТОЛЬКО НОУТБУК 1 (п. 6 задания: блокировка ресурса)
Под кем:  RISA, ДВА окна SQL Developer одновременно
================================================================================
--
-- Окно 1 (RISA): выполнить блок ниже и НЕ делать COMMIT / ROLLBACK — сессия держит блокировку
--
BEGIN
   DELETE FROM RISA@RISD_RISA WHERE id = 1;
END;
/
--
-- Окно 2 (RISA): в другом подключении попробовать изменить ту же строку, например:
--   UPDATE RISA@RISD_RISA SET name = 'Blocked' WHERE id = 1;
-- Запрос должен зависнуть (ожидание блокировки).
-- Затем в окне 1: ROLLBACK; или COMMIT; — во 2-м окне операция завершится.
--


================================================================================
ВОЗВРАТ К АДМИНИСТРАТОРУ (при необходимости)
Выполнять на том ноутбуке, где нужен доступ SYSTEM (удаление пользователя, отладка)
================================================================================

CONNECT SYSTEM/"MyStrongPassw0rd"@//localhost:1521/XEPDB1;

-- Примеры проверок от SYSTEM:
-- SELECT username FROM dba_users WHERE username = 'RISA';
-- SELECT owner, db_link, host FROM dba_db_links WHERE owner = 'RISA';
-- DROP USER RISA CASCADE;
