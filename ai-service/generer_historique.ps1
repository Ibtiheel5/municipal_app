# generer_historique.ps1 - Version corrigée
param(
    [string]$Token,
    [int]$NbMois = 12
)

Write-Host "Generation de $NbMois mois d'historique..."

for ($i = 0; $i -lt $NbMois; $i++) {
    $mois = (Get-Date).AddMonths(-$i)
    $anneeFiscale = $mois.Year
    $dateDebut = "$anneeFiscale-01-01"
    $moisLabel = $mois.ToString("yyyy-MM")

    Write-Host "   Generation avis pour $moisLabel..."

    $body = "{""sourceDossier"":""DECLARATION"",""anneeFiscale"":$anneeFiscale,""dateDebutImposition"":""$dateDebut"",""bienId"":1,""categorieId"":1,""surface"":150,""observations"":""Test $moisLabel""}"

    curl.exe -X POST http://localhost:8081/api/user/tib-gestion/generer-avis `
        -H "Authorization: Bearer $Token" `
        -H "Content-Type: application/json" `
        -d $body 2>$null

    Start-Sleep -Seconds 1
}

Write-Host "Historique genere avec succes !"