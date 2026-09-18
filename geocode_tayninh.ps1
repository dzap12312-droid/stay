$ErrorActionPreference = 'Stop'
$utf8NoBom = New-Object System.Text.UTF8Encoding($false)
$root = "D:\생산지원\본부장님 숙제\supplier-map"
$headers = @{ 'User-Agent' = 'PaldoVina-PhuTho-TayNinh-SupplierMap/1.0 (internal factory logistics mapping tool)' }

# 떠이닌공장 업체 86건을 추가한 뒤(id 89~174) 아직 좌표가 없는(locationStatus='pending') 건만
# 지오코딩한다. 기존 푸토공장 88건(id 1~88)은 이미 geocode_log.json/geocode_fallback_log.json으로
# 확보된 좌표라서 이 스크립트는 절대 건드리지 않는다(regeocode_fallback.ps1과 달리 대상이 'pending'뿐).
# 해외소재(한국) 업체는 locationStatus='overseas'로 표시되어 있어 애초에 대상에서 제외된다.

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
$targets = $suppliers | Where-Object { $_.locationStatus -eq 'pending' }
Write-Output "떠이닌 지오코딩 대상: $($targets.Count)건 (해외소재 제외)"

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
            $s.geocodePrecision = $precision
            $s.geocodeQueryUsed = $cand.q

            Write-Output "OK  id=$($s.id) [$precision] $($cand.q) -> $($r.lat),$($r.lon)"
            [void]$results.Add([PSCustomObject]@{ id=$s.id; status='geocoded'; precision=$precision; query=$cand.q; lat=$r.lat; lon=$r.lon })
            $found = $true
            $successCount++
            break
        }
    }

    if (-not $found) {
        $s.locationStatus = 'failed'
        Write-Output "FAIL id=$($s.id) 모든 후보 실패: $clean"
        [void]$results.Add([PSCustomObject]@{ id=$s.id; status='failed'; precision=$null; query=$clean; lat=$null; lon=$null })
    }
}

$json = $suppliers | ConvertTo-Json -Depth 6
[System.IO.File]::WriteAllText("$root\data\suppliers.json", $json, $utf8NoBom)

$jsHeader = "/**`n * suppliers.js`n * data/suppliers.json 과 동일한 내용을 담은 fallback 데이터 파일이다.`n * index.html 을 서버 없이 파일로 직접 열면(file://) 브라우저 보안 정책상`n * fetch()로 JSON 파일을 읽을 수 없으므로, <script> 태그로 이 파일을 불러와`n * 전역 변수로 데이터를 제공한다. suppliers.json 을 갱신했다면 이 파일도 함께`n * 갱신해야 한다(내용은 100% 동일해야 함).`n */`nconst SUPPLIERS_FALLBACK_DATA = "
[System.IO.File]::WriteAllText("$root\data\suppliers.js", "$jsHeader$json;`n", $utf8NoBom)

$logJson = $results | ConvertTo-Json -Depth 4
[System.IO.File]::WriteAllText("$root\geocode_tayninh_log.json", $logJson, $utf8NoBom)

$totalGeocoded = ($suppliers | Where-Object { $_.locationStatus -eq 'geocoded' }).Count
Write-Output "완료. 이번 회차 신규 확보: $successCount / $($targets.Count). 전체 좌표 확보: $totalGeocoded / $($suppliers.Count)"
Write-Output "실패건은 지도 안 '지오코딩 실행' 버튼(추가 재시도) 또는 상세패널에서 위도/경도 직접 입력으로 보완하세요."
