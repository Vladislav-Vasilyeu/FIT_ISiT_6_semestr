# Лабораторная работа 16

Приложение `16-01` - HTTP-сервер GraphQL для работы с БД MSSQL.

## Запуск

1. Создайте свою БД на SQL Server с именем по инициалам вместо `XYZ`.
2. Выполните скрипт `C:/CommonSpace/10.sql` для создания и заполнения таблиц.
3. Скопируйте `.env.example` в `.env` и укажите имя своей БД:

```env
DB_NAME=XYZ
```

4. Установите зависимости и запустите сервер:

```bash
npm install
npm start
```

Сервер запускается на `http://localhost:3000/graphql`.

## Таблицы

Решение рассчитано на стандартную структуру лабораторной БД:

- `FACULTY(FACULTY, FACULTY_NAME)`
- `PULPIT(PULPIT, PULPIT_NAME, FACULTY)`
- `TEACHER(TEACHER, TEACHER_NAME, PULPIT)`
- `SUBJECT(SUBJECT, SUBJECT_NAME, PULPIT)`

## Файлы

- `src/server.js` - запуск HTTP-сервера.
- `src/schema.js` - GraphQL-схема.
- `src/resolvers.js` - обработчики GraphQL-запросов.
- `src/db.js` - подключение к MSSQL.
- `graphql-examples.md` - примеры запросов и мутаций.
- `theory.md` - краткие ответы на теоретические вопросы.
