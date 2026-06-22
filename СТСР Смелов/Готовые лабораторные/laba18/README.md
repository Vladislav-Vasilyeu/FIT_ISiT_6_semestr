# Лабораторная работа 18

HTTP-сервер на встроенном модуле Node.js `http` и Sequelize для MS SQL Server.

## Запуск

1. Создать БД с именем по своим инициалам и выполнить скрипт `C:/CommonSpace/10.sql`.
2. Если имя БД не `XYZ`, указать его перед запуском:

```powershell
$env:DB_NAME="ABC"
npm start
```

По умолчанию используются параметры из задания:

```text
host: 172.16.193.223
user: student
password: fitfit
port: 1433
database: XYZ
```

Сервер запускается на `http://localhost:3000`.

## Примеры JSON для Postman

Факультет:

```json
{
  "FACULTY": "TEST",
  "FACULTY_NAME": "Тестовый факультет"
}
```

Кафедра:

```json
{
  "PULPIT": "TST",
  "PULPIT_NAME": "Тестовая кафедра",
  "FACULTY": "TEST"
}
```

Дисциплина:

```json
{
  "SUBJECT": "TS",
  "SUBJECT_NAME": "Тестовая дисциплина",
  "PULPIT": "TST"
}
```

Тип аудитории:

```json
{
  "AUDITORIUM_TYPE": "TS",
  "AUDITORIUM_TYPENAME": "Тестовый тип аудитории"
}
```

Аудитория:

```json
{
  "AUDITORIUM": "999-1",
  "AUDITORIUM_NAME": "999-1",
  "AUDITORIUM_CAPACITY": 30,
  "AUDITORIUM_TYPE": "TS"
}
```
