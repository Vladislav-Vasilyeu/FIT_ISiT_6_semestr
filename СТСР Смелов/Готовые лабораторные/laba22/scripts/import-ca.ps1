$ErrorActionPreference = "Stop"

$root = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
$caCert = Join-Path $root "certs\ca-lab22-xyz.crt"

if (-not (Test-Path $caCert)) {
    throw "CA certificate was not found: $caCert. Run scripts\generate-certs.ps1 first."
}

Import-Certificate -FilePath $caCert -CertStoreLocation Cert:\LocalMachine\Root | Out-Null
Write-Host "CA certificate was imported to Cert:\LocalMachine\Root"
