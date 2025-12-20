# Enable Windows Long Path Support
# Run this script as Administrator in PowerShell

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Enable Windows Long Path Support" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if running as Administrator
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)

if (-not $isAdmin) {
    Write-Host "ERROR: This script must be run as Administrator!" -ForegroundColor Red
    Write-Host ""
    Write-Host "To run as Administrator:" -ForegroundColor Yellow
    Write-Host "1. Right-click on PowerShell" -ForegroundColor Yellow
    Write-Host "2. Select 'Run as administrator'" -ForegroundColor Yellow
    Write-Host "3. Run this script again" -ForegroundColor Yellow
    Write-Host ""
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host "Checking current Long Path setting..." -ForegroundColor Yellow
$currentValue = Get-ItemProperty -Path "HKLM:\SYSTEM\CurrentControlSet\Control\FileSystem" -Name "LongPathsEnabled" -ErrorAction SilentlyContinue

if ($currentValue) {
    Write-Host "Current value: $($currentValue.LongPathsEnabled)" -ForegroundColor White
    if ($currentValue.LongPathsEnabled -eq 1) {
        Write-Host "Long paths are already enabled!" -ForegroundColor Green
        Write-Host ""
        Read-Host "Press Enter to exit"
        exit 0
    }
} else {
    Write-Host "Long paths setting not found (will be created)" -ForegroundColor White
}

Write-Host ""
Write-Host "Enabling long path support..." -ForegroundColor Yellow

try {
    Set-ItemProperty -Path "HKLM:\SYSTEM\CurrentControlSet\Control\FileSystem" -Name "LongPathsEnabled" -Value 1 -Type DWord -Force
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Green
    Write-Host "  SUCCESS!" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "Long path support has been enabled." -ForegroundColor Green
    Write-Host ""
    Write-Host "IMPORTANT: You MUST RESTART your computer!" -ForegroundColor Red
    Write-Host ""
    Write-Host "After restart, run the build:" -ForegroundColor Yellow
    Write-Host "  cd android" -ForegroundColor White
    Write-Host "  gradlew assembleRelease" -ForegroundColor White
    Write-Host ""
} catch {
    Write-Host ""
    Write-Host "ERROR: Failed to enable long paths!" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    Write-Host ""
}

Read-Host "Press Enter to exit"
