$LogFile = "$env:USERPROFILE\.spacetime-mud\logs\openai.log"

if (Test-Path $LogFile) {
    Get-Content -Path $LogFile -Wait
} else {
    Write-Host "File not found: $LogFile"
}