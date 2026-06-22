# Лабораторная работа 08 - HTTP Сервер (Node.js)

## Запуск сервера

```bash
node server.js
```

Сервер запустится на порту 3000: http://localhost:3000

---

## API Endpoints

### Задание 01: /connection
- `GET /connection` - показать текущее значение KeepAliveTimeout
- `GET /connection?set=10000` - установить новое значение (мс)

### Задание 02: /headers
- `GET /headers` - отобразить все заголовки запроса и ответа

### Задание 03: /parameter (query string)
- `GET /parameter?x=10&y=5` - математические операции с параметрами

### Задание 04: /parameter (path params)
- `GET /parameter/10/5` - математические операции через URL

### Задание 05: /close
- `GET /close` - остановить сервер через 10 секунд

### Задание 06: /socket
- `GET /socket` - информация о сокете (IP и порты клиента/сервера)

### Задание 07: /req-data
- `GET/POST /req-data` - демонстрация порционной обработки (chunked transfer)

### Задание 08: /resp-status
- `GET /resp-status?code=404&mess=Not%20Found` - кастомный статус ответа

### Задание 09: /formparameter
- `GET /formparameter` - HTML форма с различными input типами
- `POST /formparameter` - обработка данных формы

### Задание 10: /json
- `POST /json` - обработка JSON (см. example_request.json)

Пример запроса:
```json
{
  "x": 10,
  "y": 20,
  "s": "Hello",
  "o": {"name": "John", "age": 30},
  "m": [1, 2, 3, 4, 5]
}
```

### Задание 11: /xml
- `POST /xml` - обработка XML (см. example_request.xml)

Пример запроса:
```xml
<?xml version="1.0" encoding="UTF-8"?>
<request>
    <xx value="10"/>
    <xx value="20"/>
    <mm value="Hello"/>
    <mm value="World"/>
</request>
```

### Задание 12: /files
- `GET /files` - получить количество файлов в директории static
- Заголовок ответа: `X-static-files-count: N`

### Задание 13: /files/filename
- `GET /files/test.txt` - получить конкретный файл из static

### Задание 14: /upload
- `GET /upload` - форма для загрузки файла
- `POST /upload` - загрузка файла в директорию static

---

## Ответы на вопросы (Задание 15)

### 40. Назначение заголовка Content-Type
**Content-Type** указывает MIME-тип содержимого тела запроса или ответа. 
Примеры:
- `text/html` - HTML документ
- `application/json` - JSON данные
- `application/xml` - XML данные
- `multipart/form-data` - форма с файлами
- `application/x-www-form-urlencoded` - обычная HTML форма

### 41. Назначение заголовка Accept
**Accept** сообщает серверу, какие типы контента клиент может принять в ответе.
Пример: `Accept: application/json, text/html` - клиент предпочитает JSON, но примет HTML.

### 42. Multipart/form-data
Значение **multipart/form-data** используется для отправки форм, содержащих:
- Файлы (file upload)
- Большие объемы данных
- Данные в разных форматах одновременно

Данные разделяются boundary-строкой, каждая часть имеет свои заголовки.

### 43. Обеспечение Multipart/form-data через тег form
```html
<form action="/upload" method="POST" enctype="multipart/form-data">
    <input type="file" name="file">
    <input type="submit" value="Загрузить">
</form>
```
Атрибут **enctype="multipart/form-data"** обязателен для загрузки файлов.

### 44. Значение Content-Type по умолчанию для form
По умолчанию: **application/x-www-form-urlencoded**

Данные кодируются как: `key1=value1&key2=value2` (спецсимволы URL-encoded)

### 45. Параметры в GET-запросе
**Где:** В URL после знака `?`
**Формат:** `ключ=значение`, разделены `&`
**Пример:** `/parameter?x=10&y=20`

### 46. Параметры в POST-запросе
**Где:** В теле запроса (body)
**Формат зависит от Content-Type:**
- `application/x-www-form-urlencoded`: `key1=value1&key2=value2`
- `application/json`: `{"key1": "value1", "key2": "value2"}`
- `multipart/form-data`: разделенные boundary части

### 47. JSON (JavaScript Object Notation)
Легковесный формат обмена данными, основанный на JavaScript.
**Особенности:**
- Текстовый формат
- Читаемый человеком
- Поддерживает объекты, массивы, строки, числа, boolean, null
- Стандарт де-факто для REST API

### 48. XML (eXtensible Markup Language)
Расширяемый язык разметки для хранения и передачи данных.
**Особенности:**
- Иерархическая структура (теги)
- Строгий синтаксис (все теги должны закрываться)
- Поддержка атрибутов
- Поддержка пространств имен (namespaces)
- Машинно- и человекочитаемый
- Используется в SOAP, RSS, конфигурационных файлах
