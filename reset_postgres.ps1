$pg_hba = "C:\Program Files\PostgreSQL\16\data\pg_hba.conf"
$psql = "C:\Program Files\PostgreSQL\16\bin\psql.exe"
$service = "postgresql-x64-16"

Write-Host "Resetting PostgreSQL password to 'admin'..."

# Trust
$text = [IO.File]::ReadAllText($pg_hba)
$text = $text.Replace("127.0.0.1/32            scram-sha-256", "127.0.0.1/32            trust")
$text = $text.Replace("::1/128                 scram-sha-256", "::1/128                 trust")
[IO.File]::WriteAllText($pg_hba, $text)

Restart-Service -Name $service
Start-Sleep -Seconds 3

& $psql -U postgres -c "ALTER USER postgres WITH PASSWORD 'admin';"

# Revert
$text = [IO.File]::ReadAllText($pg_hba)
$text = $text.Replace("127.0.0.1/32            trust", "127.0.0.1/32            scram-sha-256")
$text = $text.Replace("::1/128                 trust", "::1/128                 scram-sha-256")
[IO.File]::WriteAllText($pg_hba, $text)

Restart-Service -Name $service
Start-Sleep -Seconds 2
Write-Host "Success! Password reset to 'admin'"
Start-Sleep -Seconds 3
