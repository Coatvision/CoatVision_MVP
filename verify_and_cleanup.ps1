Param()

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

$supabaseUrl = $env:SUPABASE_URL
$serviceKey  = $env:SUPABASE_SERVICE_KEY
$anonKey     = $env:SUPABASE_ANON_KEY

$outFile = Join-Path $PSScriptRoot 'verify_output.json'
$timestamp = (Get-Date).ToUniversalTime().ToString('yyyy-MM-ddTHH:mm:ssZ')

function Invoke-JsonPost {
    Param(
        [Parameter(Mandatory)] [string] $Url,
        [Parameter(Mandatory)] [hashtable] $Headers,
        [Parameter()]             [object] $Body
    )
    try {
        $response = Invoke-WebRequest -Uri $Url -Method Post -Headers $Headers -UseBasicParsing -ContentType 'application/json' -Body ($Body | ConvertTo-Json -Depth 8)
        return @{ status = $response.StatusCode; body = $response.Content }
    } catch {
        $err = $_.Exception.Message
        $resp = $null
        if ($_.Exception -is [System.Net.WebException]) {
            $resp = $_.Exception.Response
        } elseif ($_.Exception.PSObject.Properties.Match('Response').Count -gt 0) {
            $resp = $_.Exception.Response
        }
        if ($resp) {
            try {
                $reader = New-Object IO.StreamReader($resp.GetResponseStream())
                $content = $reader.ReadToEnd()
                $reader.Close()
                $statusCode = 0
                try { $statusCode = [int]$resp.StatusCode } catch { $statusCode = 0 }
                return @{ status = $statusCode; body = $content }
            } catch {
                return @{ status = 0; body = $err }
            }
        }
        return @{ status = 0; body = $err }
    }
}

# Defaults
$writeRes   = @{ status = 0; body = 'env missing' }
$summaryRes = @{ status = 0; body = 'env missing' }
$latestRes  = @{ status = 0; body = 'env missing' }

if ($supabaseUrl) {
    if ($serviceKey) {
        $writeRes = Invoke-JsonPost -Url "$supabaseUrl/rest/v1/rpc/insert_analysis_from_payload" -Headers @{ apikey = $serviceKey; Authorization = "Bearer $serviceKey" } -Body @{ payload = @{ id = 'res_verify'; mode = 'test'; createdAt = '2025-12-31T00:00:00Z'; result = @{ cvi = 1.1; cqi = 2.2 }; request = @{ note = 'verify' } } }
    } else {
        $writeRes = @{ status = 0; body = 'SUPABASE_SERVICE_KEY not set' }
    }

    if ($anonKey) {
        $summaryRes = Invoke-JsonPost -Url "$supabaseUrl/rest/v1/rpc/get_dashboard_summary" -Headers @{ apikey = $anonKey; Authorization = "Bearer $anonKey" } -Body @{}
        $latestRes  = Invoke-JsonPost -Url "$supabaseUrl/rest/v1/rpc/get_latest_analyses" -Headers @{ apikey = $anonKey; Authorization = "Bearer $anonKey" } -Body @{ p_limit = 5 }
    } else {
        $summaryRes = @{ status = 0; body = 'SUPABASE_ANON_KEY not set' }
        $latestRes  = @{ status = 0; body = 'SUPABASE_ANON_KEY not set' }
    }
} else {
    $writeRes   = @{ status = 0; body = 'SUPABASE_URL not set' }
    $summaryRes = @{ status = 0; body = 'SUPABASE_URL not set' }
    $latestRes  = @{ status = 0; body = 'SUPABASE_URL not set' }
}

$json = [pscustomobject]@{
    created = @(
        @{ type='extension'; name='pgcrypto' },
        @{ type='extension'; name='uuid-ossp' },
        @{ type='table'; name='public.analyses' },
        @{ type='policy'; name='public.analyses.anon_read_analyses' },
        @{ type='policy'; name='public.analyses.forbid_anon_write_analyses' },
        @{ type='table'; name='public.jobs' },
        @{ type='table'; name='public.reports' },
        @{ type='table'; name='public.training_sessions' },
        @{ type='function'; name='public.insert_analysis_from_payload' },
        @{ type='function'; name='public.get_dashboard_summary' },
        @{ type='function'; name='public.get_latest_analyses' },
        @{ type='storage_bucket'; id='outputs'; public=$true }
    )
    verification = @{ 
        extensions      = 'Run via Supabase UI: SELECT extname, extversion FROM pg_extension ORDER BY extname;'
        tables_columns  = "Run via Supabase UI: SELECT table_schema, table_name, column_name, data_type, is_nullable, column_default FROM information_schema.columns WHERE (table_schema='public' AND table_name IN ('analyses','jobs','reports','training_sessions')) ORDER BY table_name, ordinal_position;"
        rls_analyses    = "Run via Supabase UI: SELECT relname, relrowsecurity FROM pg_class JOIN pg_namespace n ON pg_class.relnamespace=n.oid WHERE n.nspname='public' AND relname='analyses'; and list policies via pg_policy."
        functions       = 'Run via Supabase UI: list RPCs via pg_proc for names insert_analysis_from_payload, get_dashboard_summary, get_latest_analyses.'
        storage_bucket  = "Run via Supabase UI: SELECT * FROM storage.buckets WHERE id='outputs';"
        rest_rpc        = @{ 
            insert_analysis_from_payload = @{ status = $writeRes.status;   body = $writeRes.body }
            get_dashboard_summary        = @{ status = $summaryRes.status; body = $summaryRes.body }
            get_latest_analyses          = @{ status = $latestRes.status;  body = $latestRes.body }
        }
    }
    warnings = @(
        'Ensure SUPABASE_SERVICE_KEY is never embedded in client code.',
        'Validate anon key limitations for your frontend use cases.'
    )
    env_mapping = @{ 
        backend  = @('SUPABASE_URL','SUPABASE_SERVICE_KEY','JWT_SECRET','COATVISION_CORS_ORIGINS')
        frontend = @('VITE_BACKEND_URL','VITE_COATVISION_USE_REMOTE','VITE_SUPABASE_URL','VITE_SUPABASE_ANON_KEY')
        mobile   = @('EXPO_PUBLIC_COATVISION_API_BASE_URL','EXPO_PUBLIC_COATVISION_USE_REMOTE')
    }
    next_steps = @(
        'If REST RPC write succeeded, remove the verification record (res_verify) if desired via service role.',
        'Set environment variables on Render/Vercel/Expo and redeploy services.',
        'Backend can now call insert_analysis_from_payload using service role to write analyses.'
    )
    timestamp = $timestamp
}

$json | ConvertTo-Json -Depth 8 | Set-Content -Path $outFile -Encoding UTF8
Write-Host "Verification written to $outFile"