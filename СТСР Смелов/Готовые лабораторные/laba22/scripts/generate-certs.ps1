$ErrorActionPreference = "Stop"

$root = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
$certDir = Join-Path $root "certs"
$opensslDir = Join-Path $root "openssl"

New-Item -ItemType Directory -Force -Path $certDir | Out-Null

$openssl = Get-Command openssl -ErrorAction SilentlyContinue
if ($openssl) {
    $opensslPath = $openssl.Source
} else {
    $candidates = @(
        "C:\Program Files\Git\usr\bin\openssl.exe",
        "C:\Program Files\Git\mingw64\bin\openssl.exe",
        "C:\Program Files\OpenSSL-Win64\bin\openssl.exe"
    )
    $opensslPath = $candidates | Where-Object { Test-Path $_ } | Select-Object -First 1
}

if (-not $opensslPath) {
    throw "openssl.exe was not found. Install OpenSSL or Git for Windows."
}

Write-Host "OpenSSL: $opensslPath"

& $opensslPath req -x509 -newkey rsa:4096 -sha256 -days 3650 -nodes `
    -keyout (Join-Path $certDir "ca-lab22-xyz.key") `
    -out (Join-Path $certDir "ca-lab22-xyz.crt") `
    -config (Join-Path $opensslDir "ca.cnf")

& $opensslPath req -new -newkey rsa:2048 -nodes `
    -keyout (Join-Path $certDir "rs-lab22-abc.key") `
    -out (Join-Path $certDir "rs-lab22-abc.csr") `
    -config (Join-Path $opensslDir "resource.cnf")

& $opensslPath x509 -req -sha256 -days 825 `
    -in (Join-Path $certDir "rs-lab22-abc.csr") `
    -CA (Join-Path $certDir "ca-lab22-xyz.crt") `
    -CAkey (Join-Path $certDir "ca-lab22-xyz.key") `
    -CAcreateserial `
    -out (Join-Path $certDir "rs-lab22-abc.crt") `
    -extfile (Join-Path $opensslDir "resource-ext.cnf") `
    -extensions v3_server

Write-Host "Done. Certificates were saved to $certDir"
