# generer_historique_tnb.ps1
param(
    [string]$Token,
    [int]$NbMois = 12
)

Write-Host "Generation de $NbMois mois d'historique TNB..."

for ($i = 0; $i -lt $NbMois; $i++) {
    $mois = (Get-Date).AddMonths(-$i)
    $anneeFiscale = $mois.Year
    $dateDebut = "$anneeFiscale-01-01"
    $moisLabel = $mois.ToString("yyyy-MM")

    Write-Host "   Generation avis TNB pour $moisLabel..."

    $body = "{""sourceDossier"":""DECLARATION"",""anneeFiscale"":$anneeFiscale,""dateDebutImposition"":""$dateDebut"",""terrainId"":1,""methode"":""DENSITE"",""densiteId"":1,""surface"":500,""observations"":""Test TNB $moisLabel""}"

    curl.exe -X POST http://localhost:8081/api/user/tnb-gestion/generer-avis `
        -H "Authorization: Bearer $Token" `
        -H "Content-Type: application/json" `
        -d $body 2>$null

    Start-Sleep -Seconds 1
}

Write-Host "Historique TNB genere avec succes !"