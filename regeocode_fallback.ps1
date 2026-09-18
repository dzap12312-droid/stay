$ErrorActionPreference = 'Stop'
$utf8NoBom = New-Object System.Text.UTF8Encoding($false)
$root = "D:\생산지원\본부장님 숙제\supplier-map"
$headers = @{ 'User-Agent' = 'PaldoVina-PhuTho-SupplierMap/1.0 (internal factory logistics mapping tool)' }

$jsonText = [System.IO.File]::ReadAllText("$root\data\suppliers.json", [System.Text.Encoding]::UTF8)
$suppliers = $jsonText | ConvertFrom-Json

function Clean-Base($addr) {
    $q = $addr -replace '\[[^\]]*\]', ''
    $q = $q -replace '\(MST[^)]*\)', ''
    $q = $q -replace '\s+', ' '
    $q = $q.Trim().Trim(',').Trim('.').Trim()
    if ($q -notmatch '(?i)viet ?nam|việt nam') { $q = "$q, Việt Nam" }
    return $q
}

function Get-IndustrialCandidate($cleanAddr) {
    if ($cleanAddr -match '((?:Khu công nghiệp|Cụm công nghiệp|KCN|CCN)[^,]*)') {
        $zone = $matches[1].Trim()
        # 마지막 1~2개 구간(성/시)까지 붙여서 후보 생성
        $parts = $cleanAddr -split ',' | ForEach-Object { $_.Trim() }
        $tailCount = [Math]::Min(2, $parts.Count - 1)
        $tail = $parts[($parts.Count - $tailCount)..($parts.Count - 1)] -join ', '
        return "$zone, $tail"
    }
    return $null
}

function Get-ProgressiveCandidates($cleanAddr) {
    $parts = $cleanAddr -split ',' | ForEach-Object { $_.Trim() } | Where-Object { $_ -ne '' }
    $candidates = @()
    # 앞에서부터 한 구간씩 제거하며 후보 생성. 최소 2개 구간(예: 성/시, Việt Nam) 남을 때까지.
    for ($i = 1; $i -le ($parts.Count - 2); $i++) {
        $candidates += ($parts[$i..($parts.Count - 1)] -join ', ')
    }
    return $candidates
}

function Try-Geocode($query) {
    $encQ = [uri]::EscapeDataString($query)
    $url = "https://nominatim.openstreetmap.org/search?format=json&limit=1&countrycodes=vn&q=$encQ"
    try {
        $resp = Invoke-RestMethod -Uri $url -Headers $headers -Method Get -TimeoutSec 15
        Start-Sleep -Milliseconds 1100
        if ($resp -and $resp.Count -gt 0) {
            return @{ ok = $true; lat = [double]$resp[0].lat; lon = [double]$resp[0].lon; display = $resp[0].display_name }
        }
        return @{ ok = $false }
    } catch {
        Start-Sleep -Milliseconds 1100
        return @{ ok = $false }
    }
}

$results = New-Object System.Collections.ArrayList
$targets = $suppliers | Where-Object { $_.locationStatus -eq 'failed' }
Write-Output "재시도 대상: $($targets.Count)건"

$successCount = 0
foreach ($s in $targets) {
    $clean = Clean-Base $s.address
    $parts = $clean -split ',' | ForEach-Object { $_.Trim() } | Where-Object { $_ -ne '' }

    $candidates = New-Object System.Collections.ArrayList
    [void]$candidates.Add(@{ q = $clean; level = 'exact'; partCount = $parts.Count })

    $industrial = Get-IndustrialCandidate $clean
    if ($industrial) { [void]$candidates.Add(@{ q = $industrial; level = 'industrial_zone'; partCount = 99 }) }

    foreach ($c in (Get-ProgressiveCandidates $clean)) {
        $pc = ($c -split ',').Count
        [void]$candidates.Add(@{ q = $c; level = 'progressive'; partCount = $pc })
    }

    $found = $false
    foreach ($cand in $candidates) {
        $r = Try-Geocode $cand.q
        if ($r.ok) {
            $precision = if ($cand.level -eq 'exact') { 'exact' }
                         elseif ($cand.level -eq 'industrial_zone') { 'industrial_zone' }
                         elseif ($cand.partCount -ge 3) { 'ward_district' }
                         else { 'province_level' }

            $s.latitude = $r.lat
            $s.longitude = $r.lon
            $s.locationStatus = 'geocoded'
            $s | Add-Member -NotePropertyName 'geocodePrecision' -NotePropertyValue $precision -Force
            $s | Add-Member -NotePropertyName 'geocodeQueryUsed' -NotePropertyValue $cand.q -Force

            Write-Output "OK  id=$($s.id) [$precision] $($cand.q) -> $($r.lat),$($r.lon)"
            [void]$results.Add([PSCustomObject]@{ id=$s.id; status='geocoded'; precision=$precision; query=$cand.q; lat=$r.lat; lon=$r.lon })
            $found = $true
            $successCount++
            break
        }
    }

    if (-not $found) {
        $s | Add-Member -NotePropertyName 'geocodePrecision' -NotePropertyValue $null -Force
        $s | Add-Member -NotePropertyName 'geocodeQueryUsed' -NotePropertyValue $null -Force
        Write-Output "FAIL id=$($s.id) 모든 후보 실패: $clean"
        [void]$results.Add([PSCustomObject]@{ id=$s.id; status='failed'; precision=$null; query=$clean; lat=$null; lon=$null })
    }
}

# geocodePrecision/geocodeQueryUsed 필드를 이미 성공했던(18건) 항목에도 채워 스키마를 통일
foreach ($s in $suppliers) {
    if (-not ($s.PSObject.Properties.Name -contains 'geocodePrecision')) {
        $s | Add-Member -NotePropertyName 'geocodePrecision' -NotePropertyValue $(if ($s.locationStatus -eq 'geocoded') { 'exact' } else { $null }) -Force
    }
    if (-not ($s.PSObject.Properties.Name -contains 'geocodeQueryUsed')) {
        $s | Add-Member -NotePropertyName 'geocodeQueryUsed' -NotePropertyValue $null -Force
    }
}

$json = $suppliers | ConvertTo-Json -Depth 6
[System.IO.File]::WriteAllText("$root\data\suppliers.json", $json, $utf8NoBom)

$logJson = $results | ConvertTo-Json -Depth 4
[System.IO.File]::WriteAllText("$root\geocode_fallback_log.json", $logJson, $utf8NoBom)

$totalGeocoded = ($suppliers | Where-Object { $_.locationStatus -eq 'geocoded' }).Count
Write-Output "완료. 이번 회차 신규 확보: $successCount / $($targets.Count). 전체 좌표 확보: $totalGeocoded / $($suppliers.Count)"
