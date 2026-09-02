// RapportsPage.jsx
import React, { useState, useEffect } from 'react';
import RecetteService from '../services/recetteService';
import jsPDF from 'jspdf';
import { autoTable } from 'jspdf-autotable'; // ✅ IMPORT NOMÉ
import * as XLSX from 'xlsx';
import './RapportsPage.css';

// ── Icônes SVG ──────────────────────────────────────────────────────────────
const Icons = {
  BarChart: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="20" x2="12" y2="10" />
      <line x1="18" y1="20" x2="18" y2="4" />
      <line x1="6" y1="20" x2="6" y2="16" />
    </svg>
  ),
  Download: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7,10 12,15 17,10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  ),
  Search: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  ),
  Coins: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="8" cy="8" r="6" />
      <path d="M18.09 10.37A6 6 0 1 1 10.34 18" />
      <path d="M7 6h1v4" />
      <path d="m16.71 13.88.7.71-2.82 2.82" />
    </svg>
  ),
  Calendar: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  ),
  FileText: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14,2 14,8 20,8" />
    </svg>
  ),
};

export default function RapportsPage({ showMsg }) {
  const [recettes, setRecettes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ type: '', annee: '', statut: '', dateDebut: '', dateFin: '' });
  const [stats, setStats] = useState({
    total: 0,
    encaisse: 0,
    tib: 0,
    tnb: 0,
    enRetard: 0,
    paye: 0,
    encours: 0,
    tauxRecouvrement: 0,
    parAnnee: [],
    parMois: []
  });

  useEffect(() => {
    chargerRapports();
  }, [filters]);

  const chargerRapports = async () => {
    try {
      setLoading(true);
      const response = await RecetteService.rechercherRecettes(
        {
          type: filters.type || undefined,
          annee: filters.annee || undefined,
          statut: filters.statut || undefined
        },
        0,
        10000,
        'date',
        'desc'
      );
      let data = response.content || [];

      if (filters.dateDebut) {
        const d = new Date(filters.dateDebut);
        data = data.filter(r => new Date(r.dateGeneration) >= d);
      }
      if (filters.dateFin) {
        const d = new Date(filters.dateFin);
        data = data.filter(r => new Date(r.dateGeneration) <= d);
      }

      setRecettes(data);

      const total = data.length;
      const encaisse = data.reduce((acc, r) => acc + (r.montantPaye || 0), 0);
      const tib = data.filter(r => r.type === 'TIB').reduce((acc, r) => acc + (r.montant || 0), 0);
      const tnb = data.filter(r => r.type === 'TNB').reduce((acc, r) => acc + (r.montant || 0), 0);
      const enRetard = data.filter(r => r.statut === 'EN_RETARD').length;
      const paye = data.filter(r => r.statut === 'PAYE').length;
      const encours = data.filter(r => r.statut === 'EN_ATTENTE' || r.statut === 'PARTIEL').length;
      const totalMontant = data.reduce((acc, r) => acc + (r.montant || 0), 0);
      const tauxRecouvrement = totalMontant > 0 ? (encaisse / totalMontant) * 100 : 0;

      const parAnnee = {};
      data.forEach(r => {
        const an = r.anneeFiscale;
        if (!parAnnee[an]) parAnnee[an] = { tib: 0, tnb: 0, total: 0 };
        parAnnee[an].total += r.montant || 0;
        if (r.type === 'TIB') parAnnee[an].tib += r.montant || 0;
        else parAnnee[an].tnb += r.montant || 0;
      });
      const annees = Object.keys(parAnnee).sort();
      const parAnneeArray = annees.map(a => ({
        annee: a,
        tib: parAnnee[a].tib,
        tnb: parAnnee[a].tnb,
        total: parAnnee[a].total
      }));

      const moisLabels = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'];
      const moisMontants = new Array(12).fill(0);
      const anneeCourante = new Date().getFullYear();
      data.forEach(r => {
        if (r.anneeFiscale === anneeCourante && r.dateGeneration) {
          const date = new Date(r.dateGeneration);
          const mois = date.getMonth();
          moisMontants[mois] += r.montant || 0;
        }
      });
      const parMoisArray = moisLabels.map((label, i) => ({ mois: label, montant: moisMontants[i] }));

      setStats({
        total,
        encaisse,
        tib,
        tnb,
        enRetard,
        paye,
        encours,
        tauxRecouvrement,
        parAnnee: parAnneeArray,
        parMois: parMoisArray
      });
    } catch (error) {
      showMsg('Erreur lors du chargement des rapports.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters({ ...filters, [key]: value });
  };

  // ── Export PDF textuel (avec autoTable) ──────────────────────────────────
  const exportPDF = () => {
    if (recettes.length === 0) {
      showMsg('Aucune donnée à exporter.', 'info');
      return;
    }

    try {
      const doc = new jsPDF('p', 'mm', 'a4');
      const pageWidth = doc.internal.pageSize.getWidth();

      doc.setFontSize(18);
      doc.setTextColor('#0F172A');
      doc.text('Rapport des Recettes Municipales', pageWidth / 2, 20, { align: 'center' });

      doc.setFontSize(10);
      doc.setTextColor('#64748B');
      doc.text(`Édité le ${new Date().toLocaleDateString('fr-TN')} à ${new Date().toLocaleTimeString('fr-TN')}`, pageWidth / 2, 28, { align: 'center' });

      doc.setDrawColor('#C8102E');
      doc.line(20, 32, pageWidth - 20, 32);

      // Indicateurs clés
      doc.setFontSize(12);
      doc.setTextColor('#0F172A');
      doc.text('Indicateurs clés', 20, 42);
      autoTable(doc, {
        startY: 46,
        head: [['Indicateur', 'Valeur']],
        body: [
          ['Total recettes', stats.total],
          ['Total encaissé', stats.encaisse.toFixed(3) + ' TND'],
          ['TIB', stats.tib.toFixed(3) + ' TND'],
          ['TNB', stats.tnb.toFixed(3) + ' TND'],
          ['Payées', stats.paye],
          ['En retard', stats.enRetard],
          ['En cours', stats.encours],
          ['Taux de recouvrement', stats.tauxRecouvrement.toFixed(1) + '%']
        ],
        theme: 'striped',
        styles: { fontSize: 10, cellPadding: 2 },
        headStyles: { fillColor: '#C8102E', textColor: '#FFFFFF', fontSize: 10 },
        margin: { left: 20, right: 20 }
      });

      // Tableau détaillé
      const tableY = doc.lastAutoTable.finalY + 10;
      doc.setFontSize(12);
      doc.setTextColor('#0F172A');
      doc.text('Détail des recettes (50 premières)', 20, tableY);

      const body = recettes.slice(0, 50).map(r => [
        r.codeRecette || '',
        r.type || '',
        r.proprietaireNom || '',
        r.anneeFiscale || '',
        (r.montant || 0).toFixed(3) + ' TND',
        (r.montantPaye || 0).toFixed(3) + ' TND',
        ((r.montant || 0) - (r.montantPaye || 0)).toFixed(3) + ' TND',
        r.statut || ''
      ]);

      autoTable(doc, {
        startY: tableY + 4,
        head: [['Code', 'Type', 'Propriétaire', 'Année', 'Montant', 'Payé', 'Reste', 'Statut']],
        body: body,
        theme: 'striped',
        styles: { fontSize: 8, cellPadding: 1.5 },
        headStyles: { fillColor: '#0A1E3D', textColor: '#FFFFFF', fontSize: 8 },
        margin: { left: 20, right: 20 },
        pageBreak: 'auto'
      });

      // Section des lois
      const loiY = doc.lastAutoTable.finalY + 10;
      if (loiY + 50 < doc.internal.pageSize.height) {
        doc.setFontSize(11);
        doc.setTextColor('#0F172A');
        doc.text('Textes de loi applicables', 20, loiY);
        doc.setFontSize(9);
        doc.setTextColor('#334155');
        const lois = [
          '• Loi n° 89-14 du 8 mars 1989 relative aux taxes municipales (articles 3, 4 et 7).',
          '• Code des impôts directs et taxes indirectes (articles 42 bis, 43, 44).',
          '• Décret n° 2001-2767 du 5 novembre 2001 fixant les modalités de recouvrement.',
          '• Loi n° 2017-52 du 21 juin 2017 portant réforme du système fiscal local.'
        ];
        lois.forEach((l, i) => {
          doc.text(l, 20, loiY + 8 + i * 6);
        });
        doc.setFontSize(8);
        doc.setTextColor('#64748B');
        doc.text('Document établi conformément à la législation tunisienne en vigueur.', 20, loiY + 8 + lois.length * 6 + 4);
      }

      doc.save('Rapport_Recettes_' + new Date().toISOString().slice(0, 10) + '.pdf');
      showMsg('PDF textuel exporté avec succès !', 'success');
    } catch (error) {
      console.error(error);
      showMsg('Erreur lors de l\'export PDF. Vérifiez les dépendances.', 'error');
    }
  };

  // ── Export Excel ──────────────────────────────────────────────────────────
  const exportExcel = () => {
    if (recettes.length === 0) {
      showMsg('Aucune donnée à exporter.', 'info');
      return;
    }
    const data = recettes.map(r => ({
      'Code recette': r.codeRecette || '',
      Type: r.type || '',
      Propriétaire: r.proprietaireNom || '',
      CIN: r.proprietaireCin || '',
      Année: r.anneeFiscale || '',
      Montant: r.montant || 0,
      'Montant payé': r.montantPaye || 0,
      Reste: (r.montant || 0) - (r.montantPaye || 0),
      Statut: r.statut || '',
      'Date génération': r.dateGeneration ? new Date(r.dateGeneration).toLocaleDateString('fr-TN') : '',
      'Date limite': r.dateLimite ? new Date(r.dateLimite).toLocaleDateString('fr-TN') : '',
      Rue: r.rueNom || '',
      Secteur: r.secteurNom || '',
      Municipalité: r.municipaliteNom || ''
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Recettes');
    XLSX.writeFile(wb, 'Rapport_Recettes_' + new Date().toISOString().slice(0, 10) + '.xlsx');
    showMsg('Excel exporté avec succès !', 'success');
  };

  // ── Helpers d'affichage ──────────────────────────────────────────────────
  const formatMontant = (m) => (m ?? 0).toFixed(3) + ' TND';
  const formatDate = (d) => d ? new Date(d).toLocaleDateString('fr-TN') : 'N/A';

  return (
    <div className="rapports-page">
      <div className="rapports-header">
        <h1><Icons.BarChart /> Rapports et Statistiques</h1>
        <p>Analyse complète des recettes municipales – Conforme à la législation tunisienne</p>
      </div>

      {/* Filtres */}
      <div className="rapports-filters">
        <div className="filter-item">
          <label>Type</label>
          <select value={filters.type} onChange={e => handleFilterChange('type', e.target.value)}>
            <option value="">Tous</option>
            <option value="TIB">TIB</option>
            <option value="TNB">TNB</option>
          </select>
        </div>
        <div className="filter-item">
          <label>Année</label>
          <input type="number" value={filters.annee} onChange={e => handleFilterChange('annee', e.target.value)} placeholder="Ex: 2026" />
        </div>
        <div className="filter-item">
          <label>Statut</label>
          <select value={filters.statut} onChange={e => handleFilterChange('statut', e.target.value)}>
            <option value="">Tous</option>
            <option value="EN_ATTENTE">En attente</option>
            <option value="PAYE">Payé</option>
            <option value="EN_RETARD">En retard</option>
            <option value="PARTIEL">Partiellement payé</option>
          </select>
        </div>
        <div className="filter-item">
          <label>Date début</label>
          <input type="date" value={filters.dateDebut} onChange={e => handleFilterChange('dateDebut', e.target.value)} />
        </div>
        <div className="filter-item">
          <label>Date fin</label>
          <input type="date" value={filters.dateFin} onChange={e => handleFilterChange('dateFin', e.target.value)} />
        </div>
        <div className="filter-actions">
          <button className="btn-primary" onClick={chargerRapports}><Icons.Search /> Appliquer</button>
          <button className="btn-secondary" onClick={() => setFilters({ type: '', annee: '', statut: '', dateDebut: '', dateFin: '' })}>Réinitialiser</button>
        </div>
      </div>

      {loading ? (
        <div className="rapports-loading"><div className="spinner" /><span>Chargement des données...</span></div>
      ) : (
        <>
          {/* Cartes indicateurs */}
          <div className="stats-grid">
            <div className="stat-card"><div className="stat-value">{stats.total}</div><div className="stat-label">Total recettes</div></div>
            <div className="stat-card"><div className="stat-value">{formatMontant(stats.encaisse)}</div><div className="stat-label">Total encaissé</div></div>
            <div className="stat-card"><div className="stat-value">{formatMontant(stats.tib)}</div><div className="stat-label">TIB</div></div>
            <div className="stat-card"><div className="stat-value">{formatMontant(stats.tnb)}</div><div className="stat-label">TNB</div></div>
            <div className="stat-card"><div className="stat-value">{stats.paye}</div><div className="stat-label">Payées</div></div>
            <div className="stat-card"><div className="stat-value">{stats.enRetard}</div><div className="stat-label">En retard</div></div>
            <div className="stat-card"><div className="stat-value">{stats.encours}</div><div className="stat-label">En cours</div></div>
            <div className="stat-card"><div className="stat-value">{stats.tauxRecouvrement.toFixed(1)}%</div><div className="stat-label">Taux de recouvrement</div></div>
          </div>

          {/* Tableaux récapitulatifs */}
          <div className="charts-grid">
            <div className="chart-card">
              <h4>Par année</h4>
              <table className="mini-table">
                <thead><tr><th>Année</th><th>TIB</th><th>TNB</th><th>Total</th></tr></thead>
                <tbody>
                  {stats.parAnnee.map(a => (
                    <tr key={a.annee}><td>{a.annee}</td><td>{formatMontant(a.tib)}</td><td>{formatMontant(a.tnb)}</td><td>{formatMontant(a.total)}</td></tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="chart-card">
              <h4>Évolution mensuelle ({new Date().getFullYear()})</h4>
              <table className="mini-table">
                <thead><tr><th>Mois</th><th>Montant</th></tr></thead>
                <tbody>
                  {stats.parMois.map(m => (
                    <tr key={m.mois}><td>{m.mois}</td><td>{formatMontant(m.montant)}</td></tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Tableau détaillé */}
          <div className="rapports-table-wrapper">
            <div className="table-header">
              <h3>Détail des recettes</h3>
              <div className="table-actions">
                <button className="btn-pdf" onClick={exportPDF}><Icons.Download /> PDF</button>
                <button className="btn-excel" onClick={exportExcel}><Icons.FileText /> Excel</button>
              </div>
            </div>
            <div className="table-scroll">
              <table className="rapports-table">
                <thead>
                  <tr>
                    <th>Code</th>
                    <th>Type</th>
                    <th>Propriétaire</th>
                    <th>Année</th>
                    <th>Montant</th>
                    <th>Payé</th>
                    <th>Reste</th>
                    <th>Statut</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {recettes.length === 0 ? (
                    <tr><td colSpan="9" className="no-data">Aucune recette trouvée.</td></tr>
                  ) : (
                    recettes.slice(0, 100).map(r => (
                      <tr key={r.id}>
                        <td>{r.codeRecette}</td>
                        <td><span className={`type-badge ${r.type === 'TIB' ? 'type-tib' : 'type-tnb'}`}>{r.type}</span></td>
                        <td>{r.proprietaireNom}</td>
                        <td>{r.anneeFiscale}</td>
                        <td>{formatMontant(r.montant)}</td>
                        <td>{formatMontant(r.montantPaye)}</td>
                        <td>{formatMontant(r.montant - r.montantPaye)}</td>
                        <td><span className={`status-badge ${r.statut === 'PAYE' ? 'status-success' : r.statut === 'EN_RETARD' ? 'status-danger' : 'status-warning'}`}>{r.statut}</span></td>
                        <td>{formatDate(r.dateGeneration)}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            <div className="table-footer">
              <span>Affichage des {Math.min(recettes.length, 100)} premières lignes sur {recettes.length}</span>
            </div>
          </div>

          {/* Section lois */}
          <div className="loi-section">
            <h4>Textes de loi applicables</h4>
            <ul>
              <li>Loi n° 89-14 du 8 mars 1989 relative aux taxes municipales (articles 3, 4 et 7).</li>
              <li>Code des impôts directs et taxes indirectes (articles 42 bis, 43, 44).</li>
              <li>Décret n° 2001-2767 du 5 novembre 2001 fixant les modalités de recouvrement des taxes municipales.</li>
              <li>Loi n° 2017-52 du 21 juin 2017 portant réforme du système fiscal local.</li>
            </ul>
            <p>Document établi conformément à la législation tunisienne en vigueur.</p>
          </div>
        </>
      )}
    </div>
  );
}