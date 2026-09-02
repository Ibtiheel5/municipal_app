// PaiementsPage.jsx
import React, { useState, useEffect } from 'react';
import RecetteService from '../services/recetteService';

const Icons = {
  CreditCard: () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>),
  Search: () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>),
  Download: () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7,10 12,15 17,10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>),
};

export default function PaiementsPage({ showMsg }) {
  const [paiements, setPaiements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ mode: '', dateDebut: '', dateFin: '', agent: '' });
  const [page, setPage] = useState(0);
  const [total, setTotal] = useState(0);
  const pageSize = 10;

  useEffect(() => {
    chargerPaiements();
  }, [filters, page]);

  const chargerPaiements = async () => {
    try {
      setLoading(true);
      const response = await RecetteService.rechercherRecettes({}, 0, 1000, 'date', 'desc');
      let all = response.content || [];
      let paiementsList = [];
      for (const recette of all) {
        if (recette.montantPaye > 0) {
          const quittances = await RecetteService.getQuittancesByRecette(recette.id);
          paiementsList.push(...quittances.map(q => ({ ...q, recette })));
        }
      }
      if (filters.mode) paiementsList = paiementsList.filter(p => p.modePaiement === filters.mode);
      if (filters.agent) paiementsList = paiementsList.filter(p => p.agentNom?.toLowerCase().includes(filters.agent.toLowerCase()));
      if (filters.dateDebut) {
        const d = new Date(filters.dateDebut);
        paiementsList = paiementsList.filter(p => new Date(p.datePaiement) >= d);
      }
      if (filters.dateFin) {
        const d = new Date(filters.dateFin);
        paiementsList = paiementsList.filter(p => new Date(p.datePaiement) <= d);
      }
      setTotal(paiementsList.length);
      setPaiements(paiementsList.slice(page * pageSize, (page + 1) * pageSize));
    } catch (error) {
      showMsg('Erreur chargement paiements.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date) => new Date(date).toLocaleString('fr-TN');

  return (
    <div className="recettes-page">
      <div className="recettes-header">
        <h1><Icons.CreditCard /> Paiements</h1>
        <p>Liste de tous les paiements enregistrés</p>
      </div>

      <div className="recettes-card">
        <div className="recettes-card-body">
          <div className="filtres-grid" style={{ gridTemplateColumns: 'repeat(5, 1fr)' }}>
            <div className="filtre-item">
              <label>Mode de paiement</label>
              <select className="recettes-select" value={filters.mode} onChange={e => setFilters({ ...filters, mode: e.target.value })}>
                <option value="">Tous</option>
                <option value="ESPECES">Espèces</option>
                <option value="CHEQUE">Chèque</option>
                <option value="VIREMENT">Virement</option>
                <option value="CARTE_BANCAIRE">Carte bancaire</option>
              </select>
            </div>
            <div className="filtre-item">
              <label>Date début</label>
              <input type="date" className="recettes-input" value={filters.dateDebut} onChange={e => setFilters({ ...filters, dateDebut: e.target.value })} />
            </div>
            <div className="filtre-item">
              <label>Date fin</label>
              <input type="date" className="recettes-input" value={filters.dateFin} onChange={e => setFilters({ ...filters, dateFin: e.target.value })} />
            </div>
            <div className="filtre-item">
              <label>Agent</label>
              <input type="text" className="recettes-input" placeholder="Nom de l'agent" value={filters.agent} onChange={e => setFilters({ ...filters, agent: e.target.value })} />
            </div>
            <div className="filtre-item filtre-actions">
              <button className="btn-recettes-search" onClick={chargerPaiements}><Icons.Search /> Filtrer</button>
            </div>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="recettes-loading"><div className="recettes-spinner" /><span>Chargement...</span></div>
      ) : (
        <div className="recettes-card">
          <div className="recettes-card-body">
            <div className="table-wrapper">
              <table className="avis-table">
                <thead>
                  <tr>
                    <th>N° Quittance</th>
                    <th>Recette</th>
                    <th>Propriétaire</th>
                    <th>Montant</th>
                    <th>Mode</th>
                    <th>Date</th>
                    <th>Agent</th>
                  </tr>
                </thead>
                <tbody>
                  {paiements.length === 0 ? (
                    <tr><td colSpan="7" className="no-data">Aucun paiement trouvé</td></tr>
                  ) : (
                    paiements.map(p => (
                      <tr key={p.id}>
                        <td>{p.numeroQuittance}</td>
                        <td>{p.recette?.codeRecette}</td>
                        <td>{p.recette?.proprietaireNom}</td>
                        <td>{p.montant.toFixed(3)} TND</td>
                        <td>{p.modePaiement}</td>
                        <td>{formatDate(p.datePaiement)}</td>
                        <td>{p.agentNom}</td>
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
          </div>
        </div>
      )}
    </div>
  );
}