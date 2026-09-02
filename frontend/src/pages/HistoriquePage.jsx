// HistoriquePage.jsx
import React, { useState, useEffect } from 'react';
import RecetteService from '../services/recetteService';
import './HistoriquePage.css';

const Icons = {
  Clock: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12,6 12,12 16,14" />
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
};

export default function HistoriquePage({ showMsg }) {
  const [recettes, setRecettes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ type: '', annee: '', statut: '' });
  const [page, setPage] = useState(0);
  const [total, setTotal] = useState(0);
  const pageSize = 10;

  useEffect(() => {
    chargerHistorique();
  }, [filters, page]);

  const chargerHistorique = async () => {
    try {
      setLoading(true);
      const response = await RecetteService.rechercherRecettes(
        filters,
        page,
        pageSize,
        'date',
        'desc'
      );
      setRecettes(response.content || []);
      setTotal(response.totalElements || 0);
    } catch (error) {
      showMsg('Erreur chargement historique.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const exportCSV = () => {
    if (recettes.length === 0) {
      showMsg('Aucune donnée à exporter.', 'info');
      return;
    }
    const header = 'Code;Propriétaire;Type;Année;Montant;Payé;Statut;Date\n';
    const rows = recettes.map((r) =>
      [
        r.codeRecette,
        r.proprietaireNom,
        r.type,
        r.anneeFiscale,
        r.montant.toFixed(3),
        r.montantPaye.toFixed(3),
        r.statut,
        new Date(r.dateGeneration).toLocaleDateString(),
      ].join(';')
    ).join('\n');
    const blob = new Blob([header + rows], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'historique_recettes.csv';
    link.click();
    showMsg('CSV exporté.', 'success');
  };

  const handleFilterChange = (key, value) => {
    setFilters({ ...filters, [key]: value });
    setPage(0);
  };

  return (
    <div className="historique-page">
      <div className="historique-header">
        <h1>
          <Icons.Clock /> Historique
        </h1>
        <p>Historique complet des recettes</p>
      </div>

      <div className="historique-filters">
        <div className="historique-filters-grid">
          <div className="historique-filter-item">
            <label>Type</label>
            <select
              className="historique-select"
              value={filters.type}
              onChange={(e) => handleFilterChange('type', e.target.value)}
            >
              <option value="">Tous</option>
              <option value="TIB">TIB</option>
              <option value="TNB">TNB</option>
            </select>
          </div>
          <div className="historique-filter-item">
            <label>Année</label>
            <input
              type="number"
              className="historique-input"
              value={filters.annee}
              onChange={(e) => handleFilterChange('annee', e.target.value)}
              placeholder="Ex: 2026"
            />
          </div>
          <div className="historique-filter-item">
            <label>Statut</label>
            <select
              className="historique-select"
              value={filters.statut}
              onChange={(e) => handleFilterChange('statut', e.target.value)}
            >
              <option value="">Tous</option>
              <option value="EN_ATTENTE">En attente</option>
              <option value="PAYE">Payé</option>
              <option value="EN_RETARD">En retard</option>
            </select>
          </div>
          <div className="historique-filter-actions">
            <button className="btn-historique-search" onClick={chargerHistorique}>
              <Icons.Search /> Filtrer
            </button>
            <button className="btn-historique-secondary" onClick={exportCSV}>
              <Icons.Download /> CSV
            </button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="historique-loading">
          <div className="historique-spinner" />
          <span>Chargement...</span>
        </div>
      ) : (
        <div className="historique-table-wrapper">
          <div className="historique-table-scroll">
            <table className="historique-table">
              <thead>
                <tr>
                  <th>Code</th>
                  <th>Propriétaire</th>
                  <th>Type</th>
                  <th>Année</th>
                  <th>Montant</th>
                  <th>Payé</th>
                  <th>Statut</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {recettes.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="no-data">Aucune recette</td>
                  </tr>
                ) : (
                  recettes.map((r) => (
                    <tr key={r.id}>
                      <td>{r.codeRecette}</td>
                      <td>{r.proprietaireNom}</td>
                      <td>{r.type}</td>
                      <td>{r.anneeFiscale}</td>
                      <td>{r.montant.toFixed(3)} TND</td>
                      <td>{r.montantPaye.toFixed(3)} TND</td>
                      <td>{r.statut}</td>
                      <td>{new Date(r.dateGeneration).toLocaleDateString()}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          <div className="historique-pagination">
            <button
              disabled={page === 0}
              onClick={() => setPage((p) => p - 1)}
            >
              Précédent
            </button>
            <span>
              Page {page + 1} / {Math.ceil(total / pageSize)}
            </span>
            <button
              disabled={page >= Math.ceil(total / pageSize) - 1}
              onClick={() => setPage((p) => p + 1)}
            >
              Suivant
            </button>
          </div>
        </div>
      )}
    </div>
  );
}