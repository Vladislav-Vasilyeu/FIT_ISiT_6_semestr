# Лабораторная работа 22

Тема: HTTPS, CA-сертификат и сертификат ресурса.

В работе используются учебные обозначения из задания:

- CA: `CA-LAB22-XYZ`
- Resource: `RS-LAB22-ABC`
- домены Resource: `LAB22-ABC`, `ABC`

## Структура

- `certs/` - CA-сертификат, ключи, CSR и сертификат Resource.
- `openssl/` - конфигурационные файлы OpenSSL.
- `scripts/generate-certs.ps1` - генерация CA, CSR и сертификата Resource.
- `scripts/import-ca.ps1` - импорт CA-сертификата в доверенные корневые центры Windows.
- `22-01/server.js` - HTTPS-приложение, принимающее GET-запросы.

## Генерация сертификатов

```powershell
.\scripts\generate-certs.ps1
```

Или через npm-скрипт:

```powershell
npm run certs
```

Скрипт ищет `openssl.exe` в `PATH`, а также в стандартных каталогах Git for Windows.

## Импорт CA-сертификата

PowerShell нужно запустить от имени администратора:

```powershell
.\scripts\import-ca.ps1
```

Или через npm-скрипт:

```powershell
npm run import-ca
```

Сертификат импортируется в хранилище `LocalMachine\Root`.

## Запуск приложения 22-01

```powershell
node .\22-01\server.js
```

Или:

```powershell
npm start
```

После запуска приложение доступно по HTTPS:

- `https://localhost:8443/`
- `https://localhost:8443/status`

Для проверки доменов из задания можно добавить записи в файл hosts:

```text
127.0.0.1 LAB22-ABC
127.0.0.1 ABC
```

Тогда адреса для браузера:

- `https://LAB22-ABC:8443/`
- `https://ABC:8443/`
