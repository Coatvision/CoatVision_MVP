# CoatVision Validation and Test Automation Script for Windows
# This script runs automated tests to validate endpoints, check app functionality,
# and ensure a stable integrated system.
# Compatible with Windows PowerShell and PowerShell Core

param(
    [switch]$Backend = $false,
    [switch]$Integration = $false,
    [switch]$All = $false,
    [string]$Url = "http://localhost:8000",
    [switch]$Help = $false
)

# Stop on errors
$ErrorActionPreference = "Continue"

# Colors for output
function Write-Info { param($Message) Write-Host "[INFO] $Message" -ForegroundColor Cyan }
function Write-Success { param($Message) Write-Host "[SUCCESS] $Message" -ForegroundColor Green }
function Write-Warning { param($Message) Write-Host "[WARNING] $Message" -ForegroundColor Yellow }
function Write-Error { param($Message) Write-Host "[ERROR] $Message" -ForegroundColor Red }
function Write-Test { param($Message) Write-Host "[TEST] $Message" -ForegroundColor Cyan }
function Write-Pass { param($Message) Write-Host "[PASS] $Message" -ForegroundColor Green }
function Write-Fail { param($Message) Write-Host "[FAIL] $Message" -ForegroundColor Red }

function Print-Banner {
    Write-Host ""
    Write-Host "============================================" -ForegroundColor Blue
    Write-Host "   CoatVision Test Automation" -ForegroundColor Blue
    Write-Host "============================================" -ForegroundColor Blue
    Write-Host ""
}

function Print-Usage {
    Write-Host "CoatVision Test Automation Script"
    Write-Host ""
    Write-Host "Usage: .\run-tests.ps1 [-Backend] [-Integration] [-All] [-Url <url>] [-Help]"
    Write-Host ""
    Write-Host "Options:"
    Write-Host "  -Backend        Run backend API tests only"
    Write-Host "  -Integration    Run integration tests only"
    Write-Host "  -All            Run all tests (default)"
    Write-Host "  -Url <url>      Backend API URL (default: http://localhost:8000)"
    Write-Host "  -Help           Show this help message"
    Write-Host ""
}

if ($Help) {
    Print-Usage
    exit 0
}

# Default to running all tests if no specific option is selected
if (-not $Backend -and -not $Integration) {
    $All = $true
}
if ($All) {
    $Backend = $true
    $Integration = $true
}

Print-Banner

# Get script directory and project root
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$ProjectRoot = Split-Path -Parent $ScriptDir

Set-Location $ProjectRoot
Write-Info "Working directory: $ProjectRoot"
Write-Info "Backend URL: $Url"
Write-Host ""

# Test counters
$script:TestsPassed = 0
$script:TestsFailed = 0
$script:TestsSkipped = 0

# Helper function to make HTTP requests
function Invoke-TestRequest {
    param(
        [string]$Uri,
        [string]$Method = "GET"
    )
    try {
        $response = Invoke-WebRequest -Uri $Uri -Method $Method -TimeoutSec 10 -UseBasicParsing -ErrorAction Stop
        return @{
            StatusCode = $response.StatusCode
            Content = $response.Content
            Headers = $response.Headers
            Success = $true
        }
    } catch {
        return @{
            StatusCode = 0
            Content = ""
            Headers = @{}
            Success = $false
            Error = $_.Exception.Message
        }
    }
}

# Test runner function
function Run-Test {
    param(
        [string]$TestName,
        [scriptblock]$TestScript
    )
    
    Write-Test $TestName
    try {
        $result = & $TestScript
        if ($result) {
            Write-Pass $TestName
            $script:TestsPassed++
            return $true
        } else {
            Write-Fail $TestName
            $script:TestsFailed++
            return $false
        }
    } catch {
        Write-Fail "$TestName - Error: $($_.Exception.Message)"
        $script:TestsFailed++
        return $false
    }
}

# Check if backend is running
function Test-BackendRunning {
    Write-Info "Checking if backend is running at $Url..."
    $response = Invoke-TestRequest -Uri "$Url/health"
    if ($response.Success) {
        Write-Success "Backend is running"
        return $true
    } else {
        Write-Warning "Backend is not running at $Url"
        Write-Info "Please start the backend with: .\scripts\setup-backend.ps1"
        return $false
    }
}

# Backend API Tests
function Run-BackendTests {
    Write-Host ""
    Write-Host "============================================" -ForegroundColor Blue
    Write-Info "Running Backend API Tests"
    Write-Host "============================================" -ForegroundColor Blue
    Write-Host ""
    
    if (-not (Test-BackendRunning)) {
        Write-Warning "Skipping backend tests - backend not running"
        $script:TestsSkipped++
        return
    }
    
    # Test 1: Health endpoint returns 200
    Run-Test "Health endpoint returns 200" {
        $response = Invoke-TestRequest -Uri "$Url/health"
        return $response.StatusCode -eq 200
    }
    
    # Test 2: Root endpoint returns status ok
    Run-Test "Root endpoint returns status ok" {
        $response = Invoke-TestRequest -Uri "$Url/"
        return $response.Content -match '"status":\s*"ok"'
    }
    
    # Test 3: API version check
    Run-Test "API version is 2.0.0" {
        $response = Invoke-TestRequest -Uri "$Url/"
        return $response.Content -match '"version":\s*"2.0.0"'
    }
    
    # Test 4: Check analyze endpoint exists
    Run-Test "Analyze endpoint is available" {
        $response = Invoke-TestRequest -Uri "$Url/api/analyze"
        return $response.StatusCode -in @(200, 405, 422) -or $response.Success
    }
    
    # Test 5: Check jobs endpoint exists
    Run-Test "Jobs endpoint is available" {
        $response = Invoke-TestRequest -Uri "$Url/api/jobs"
        return $response.StatusCode -in @(200, 405, 422) -or $response.Success
    }
    
    # Test 6: Check calibration endpoint exists
    Run-Test "Calibration endpoint is available" {
        $response = Invoke-TestRequest -Uri "$Url/api/calibration"
        return $response.StatusCode -in @(200, 405, 422) -or $response.Success
    }
    
    # Test 7: Check reports endpoint exists
    Run-Test "Reports endpoint is available" {
        $response = Invoke-TestRequest -Uri "$Url/api/report"
        return $response.StatusCode -in @(200, 405, 422) -or $response.Success
    }
    
    # Test 8: JSON content type
    Run-Test "Returns JSON content type" {
        $response = Invoke-TestRequest -Uri "$Url/"
        $contentType = $response.Headers["Content-Type"]
        return $contentType -match "application/json"
    }
    
    Write-Host ""
}

# Python unit tests
function Run-PythonTests {
    Write-Host ""
    Write-Host "============================================" -ForegroundColor Blue
    Write-Info "Running Python Unit Tests"
    Write-Host "============================================" -ForegroundColor Blue
    Write-Host ""
    
    $pytestCmd = $null
    $venvPytest = Join-Path $ProjectRoot "backend\.venv\Scripts\pytest.exe"
    
    # Check if pytest is available
    if (Test-Path $venvPytest) {
        $pytestCmd = $venvPytest
    } elseif (Get-Command pytest -ErrorAction SilentlyContinue) {
        $pytestCmd = "pytest"
    } else {
        Write-Warning "pytest not found. Skipping Python tests."
        $script:TestsSkipped++
        return
    }
    
    $testsDir = Join-Path $ProjectRoot "tests"
    if (Test-Path $testsDir) {
        Write-Info "Running pytest..."
        try {
            $result = & $pytestCmd $testsDir -v --tb=short 2>&1
            if ($LASTEXITCODE -eq 0) {
                Write-Pass "Python unit tests passed"
                $script:TestsPassed++
            } else {
                Write-Fail "Python unit tests failed"
                $script:TestsFailed++
            }
        } catch {
            Write-Fail "Python unit tests failed: $($_.Exception.Message)"
            $script:TestsFailed++
        }
    } else {
        Write-Warning "No tests directory found"
        $script:TestsSkipped++
    }
    
    Write-Host ""
}

# Integration tests
function Run-IntegrationTests {
    Write-Host ""
    Write-Host "============================================" -ForegroundColor Blue
    Write-Info "Running Integration Tests"
    Write-Host "============================================" -ForegroundColor Blue
    Write-Host ""
    
    if (-not (Test-BackendRunning)) {
        Write-Warning "Skipping integration tests - backend not running"
        $script:TestsSkipped++
        return
    }
    
    # Test 1: Full health check flow
    Run-Test "Full health check flow" {
        $response = Invoke-TestRequest -Uri "$Url/health"
        return $response.Content -match "healthy"
    }
    
    # Test 2: API endpoints structure
    Run-Test "API endpoints structure" {
        $response = Invoke-TestRequest -Uri "$Url/"
        return ($response.Content -match "endpoints") -and 
               ($response.Content -match "analyze") -and 
               ($response.Content -match "jobs")
    }
    
    # Test 3: Response time check
    Run-Test "Response time < 2 seconds" {
        $stopwatch = [System.Diagnostics.Stopwatch]::StartNew()
        $response = Invoke-TestRequest -Uri "$Url/health"
        $stopwatch.Stop()
        $responseTime = $stopwatch.Elapsed.TotalSeconds
        Write-Info "Response time: ${responseTime}s"
        return $responseTime -lt 2
    }
    
    Write-Host ""
}

# Print summary
function Print-Summary {
    Write-Host ""
    Write-Host "============================================" -ForegroundColor Blue
    Write-Host "   Test Summary"
    Write-Host "============================================" -ForegroundColor Blue
    Write-Host ""
    Write-Host "Passed:  $script:TestsPassed" -ForegroundColor Green
    Write-Host "Failed:  $script:TestsFailed" -ForegroundColor Red
    Write-Host "Skipped: $script:TestsSkipped" -ForegroundColor Yellow
    Write-Host ""
    
    $total = $script:TestsPassed + $script:TestsFailed
    if ($script:TestsFailed -eq 0 -and $total -gt 0) {
        Write-Success "All tests passed!"
        return 0
    } elseif ($script:TestsFailed -gt 0) {
        Write-Error "Some tests failed!"
        return 1
    } else {
        Write-Warning "No tests were run"
        return 0
    }
}

# Main execution
if ($Backend) {
    Run-BackendTests
    Run-PythonTests
}

if ($Integration) {
    Run-IntegrationTests
}

$exitCode = Print-Summary
exit $exitCode
