// AvisPage.jsx
import React, { useState, useEffect, useMemo } from 'react';
import UserService from '../services/userService';
import { Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend
} from 'chart.js';
import './AvisPage.css';

ChartJS.register(ArcElement, Tooltip, Legend);

// ── Icônes SVG ──────────────────────────────────────────────────────────────
const Icons = {
  FileText: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14,2 14,8 20,8" />
    </svg>
  ),
  Eye: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  ),
  Search: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  ),
  Download: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7,10 12,15 17,10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  ),
  Check: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20,6 9,17 4,12" />
    </svg>
  ),
  X: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  ),
  Filter: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="22,3 2,3 10,13 10,21 14,18 14,13 22,3" />
    </svg>
  ),
  PieChart: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21.21 15.89A10 10 0 1 1 8 2.83" />
      <path d="M22 12A10 10 0 0 0 12 2v10z" />
    </svg>
  ),
};

export default function AvisPage({ showMsg }) {
  const [avis, setAvis] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ type: '', annee: '', statut: '', search: '' });
  const [showDetail, setShowDetail] = useState(null);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const pageSize = 10;

  useEffect(() => {
    chargerAvis();
  }, [filters, page]);

  const chargerAvis = async () => {
    try {
      setLoading(true);
      const [tibAvis, tnbAvis] = await Promise.all([
        UserService.rechercherHistoriqueTIB({ annee: filters.annee || undefined, statut: filters.statut || undefined }),
        UserService.rechercherHistoriqueTNB({ annee: filters.annee || undefined, statut: filters.statut || undefined })
      ]);
      let tous = [...tibAvis, ...tnbAvis];
      tous = tous.map(a => ({ ...a, type: a.codeTib ? 'TIB' : 'TNB' }));
      if (filters.type) tous = tous.filter(a => a.type === filters.type);
      if (filters.search) {
        const s = filters.search.toLowerCase();
        tous = tous.filter(a =>
          a.proprietaireNom?.toLowerCase().includes(s) ||
          a.numeroAvis?.toLowerCase().includes(s) ||
          a.codeTib?.toLowerCase().includes(s) ||
          a.codeTnb?.toLowerCase().includes(s)
        );
      }
      const start = page * pageSize;
      setAvis(tous.slice(start, start + pageSize));
      setTotal(tous.length);
    } catch (error) {
      showMsg('Erreur lors du chargement des avis.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters({ ...filters, [key]: value });
    setPage(0);
  };

  const marquerPaye = async (avisItem) => {
    try {
      if (avisItem.type === 'TIB') {
        await UserService.marquerAvisTIBPaye(avisItem.id);
      } else {
        await UserService.marquerAvisTNBPaye(avisItem.id);
      }
      showMsg('Avis marqué comme payé.', 'success');
      chargerAvis();
    } catch (error) {
      showMsg('Erreur lors du marquage du paiement.', 'error');
    }
  };

  const getStatutBadge = (statut) => {
    const classes = { EN_ATTENTE: 'status-warning', PAYE: 'status-success', EN_RETARD: 'status-danger' };
    const labels = { EN_ATTENTE: 'En attente', PAYE: 'Payé', EN_RETARD: 'En retard' };
    return <span className={`status-badge ${classes[statut] || ''}`}>{labels[statut] || statut}</span>;
  };

  const formatDate = (date) => date ? new Date(date).toLocaleDateString('fr-TN') : 'N/A';

  // ── Statistiques pour le graphique ──────────────────────────────────────
  const stats = useMemo(() => {
    const totalAvis = avis.length;
    const parStatut = {};
    avis.forEach(a => {
      const s = a.statut || 'EN_ATTENTE';
      parStatut[s] = (parStatut[s] || 0) + 1;
    });
    return { totalAvis, parStatut };
  }, [avis]);

  const pieData = {
    labels: Object.keys(stats.parStatut).map(s => {
      const labels = { EN_ATTENTE: 'En attente', PAYE: 'Payé', EN_RETARD: 'En retard' };
      return labels[s] || s;
    }),
    datasets: [{
      data: Object.values(stats.parStatut),
      backgroundColor: ['#F59E0B', '#22C55E', '#EF4444'],
      borderWidth: 2,
      borderColor: '#fff'
    }]
  };

  const pieOptions = {
    plugins: {
      legend: { position: 'bottom', labels: { font: { size: 10 } } },
      tooltip: { callbacks: { label: ctx => `${ctx.label}: ${ctx.raw} avis` } }
    },
    responsive: true,
    maintainAspectRatio: false
  };

  return (
    <div className="avis-page">
      <div className="avis-header">
        <h1><Icons.FileText /> Gestion des Avis</h1>
        <p>Liste de tous les avis TIB et TNB générés</p>
      </div>

      {/* ── Filtres ── */}
      <div className="avis-filters">
        <div className="filter-group">
          <Icons.Filter />
          <select value={filters.type} onChange={e => handleFilterChange('type', e.target.value)}>
            <option value="">Tous les types</option>
            <option value="TIB">TIB</option>
            <option value="TNB">TNB</option>
          </select>
        </div>
        <div className="filter-group">
          <input type="number" placeholder="Année" value={filters.annee} onChange={e => handleFilterChange('annee', e.target.value)} />
        </div>
        <div className="filter-group">
          <select value={filters.statut} onChange={e => handleFilterChange('statut', e.target.value)}>
            <option value="">Tous les statuts</option>
            <option value="EN_ATTENTE">En attente</option>
            <option value="PAYE">Payé</option>
            <option value="EN_RETARD">En retard</option>
          </select>
        </div>
        <div className="filter-group search">
          <Icons.Search />
          <input type="text" placeholder="Rechercher..." value={filters.search} onChange={e => handleFilterChange('search', e.target.value)} />
        </div>
        <button className="btn-primary" onClick={() => chargerAvis()}>Rechercher</button>
      </div>

      {/* ── Statistiques et graphique ── */}
      <div className="avis-stats-row">
        <div className="avis-stat-card">
          <span className="stat-number">{stats.totalAvis}</span>
          <span className="stat-label">Avis affichés</span>
        </div>
        <div className="avis-stat-card">
          <span className="stat-number">{Object.values(stats.parStatut).reduce((a, b) => a + b, 0)}</span>
          <span className="stat-label">Total sur cette page</span>
        </div>
        {Object.keys(stats.parStatut).length > 0 && (
          <div className="avis-chart-container">
            <Pie data={pieData} options={pieOptions} />
          </div>
        )}
      </div>

      {/* ── Tableau ── */}
      {loading ? (
        <div className="loading-spinner">Chargement...</div>
      ) : (
        <>
          <div className="avis-table-wrapper">
            <table className="avis-table">
              <thead>
                <tr>
                  <th>N° Avis / Code</th>
                  <th>Type</th>
                  <th>Propriétaire</th>
                  <th>Année</th>
                  <th>Montant</th>
                  <th>Statut</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {avis.length === 0 ? (
                  <tr><td colSpan="8" className="no-data">Aucun avis trouvé</td></tr>
                ) : (
                  avis.map(a => (
                    <tr key={a.id}>
                      <td><strong>{a.numeroAvis || a.codeTib || a.codeTnb}</strong></td>
                      <td><span className={`type-badge ${a.type === 'TIB' ? 'type-tib' : 'type-tnb'}`}>{a.type}</span></td>
                      <td>{a.proprietaireNom}</td>
                      <td>{a.anneeFiscale}</td>
                      <td>{(a.taxeTotale || a.montantTnb || 0).toFixed(3)} TND</td>
                      <td>{getStatutBadge(a.statut)}</td>
                      <td>{formatDate(a.dateAvis || a.dateCreation)}</td>
                      <td>
                        <button className="btn-icon" onClick={() => setShowDetail(a)} title="Voir détail"><Icons.Eye /></button>
                        {a.statut !== 'PAYE' && (
                          <button className="btn-icon success" onClick={() => marquerPaye(a)} title="Marquer payé"><Icons.Check /></button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          <div className="pagination">
            <button disabled={page === 0} onClick={() => setPage(p => p - 1)}>Précédent</button>
            <span>Page {page + 1} / {Math.ceil(total / pageSize)}</span>
            <button disabled={page >= Math.ceil(total / pageSize) - 1} onClick={() => setPage(p => p + 1)}>Suivant</button>
          </div>
        </>
      )}

      {/* ── Modal Détail ── */}
      {showDetail && (
        <div className="modal-overlay" onClick={() => setShowDetail(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Détail de l'avis</h2>
              <button className="modal-close" onClick={() => setShowDetail(null)}><Icons.X /></button>
            </div>
            <div className="modal-body">
              <pre>{JSON.stringify(showDetail, null, 2)}</pre>
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setShowDetail(null)}>Fermer</button>
              <button className="btn-pdf"><Icons.Download /> PDF</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}