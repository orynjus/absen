param(
    [string]$Url = $(if ($env:WEBAPP_URL) { $env:WEBAPP_URL } else { "" })
)
if (-not $Url) {
    Write-Host "Usage: .\test_webapp.ps1 -Url <WEBAPP_URL>"
    exit 1
}

Write-Host "--- GET $Url ---"
try {
    $get = Invoke-RestMethod -Uri $Url -Method Get -ContentType 'application/json' -ErrorAction Stop
    Write-Output ($get | ConvertTo-Json -Depth 5)
} catch {
    Write-Host "GET failed: $_"
}

Write-Host "`n--- POST sample log ---"
$body = @{ 
    studentId = 'TEST-001'
    name = 'Test Murid'
    kelas = 'X-A'
    date = (Get-Date).ToString('yyyy-MM-dd')
    time = (Get-Date).ToString('HH:mm')
    type = 'Masuk'
    method = 'PowerShell'
}

try {
    $res = Invoke-RestMethod -Uri $Url -Method Post -Body ($body | ConvertTo-Json) -ContentType 'application/json' -ErrorAction Stop
    Write-Output "Response:"
    Write-Output ($res | ConvertTo-Json -Depth 5)
} catch {
    Write-Host "POST failed: $_"
}
