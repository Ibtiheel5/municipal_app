// RecettesPage.jsx - Dashboard Recettes > Toutes les recettes
// Module financier indépendant du Dashboard Municipalité : lecture seule sur
// l'origine des taxes (TIB/TNB), gestion du paiement uniquement.
import React, { useState, useEffect, useCallback } from 'react';
import RecetteService from '../services/recetteService';
import UserService from '../services/userService';
import './RecettesPage.css';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

// ── SVG Icons (mêmes conventions que TIBPage) ────────────────────────────
const Icons = {
  Search: () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>),
  Eye: () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>),
  Check: () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20,6 9,17 4,12"/></svg>),
  X: () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>),
  Download: () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7,10 12,15 17,10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>),
  Printer: () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6,9 6,2 18,2 18,9"/><path d="M18,9H6"/><rect x="6" y="14" width="12" height="8"/></svg>),
  ArrowUp: () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="19" x2="12" y2="5"/><polyline points="5,12 12,5 19,12"/></svg>),
  ArrowDown: () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><polyline points="19,12 12,19 5,12"/></svg>),
  Coins: () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="8" cy="8" r="6"/><path d="M18.09 10.37A6 6 0 1 1 10.34 18"/><path d="M7 6h1v4"/><path d="m16.71 13.88.7.71-2.82 2.82"/></svg>),
};

const TAILLE_PAGE = 20;

export default function RecettesPage({ user, showMsg }) {
  const [recettes, setRecettes] = useState([]);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);

  const [secteurs, setSecteurs] = useState([]);
  const [municipaliteNom, setMunicipaliteNom] = useState('');

  const [search, setSearch] = useState('');
  const [type, setType] = useState('');
  const [annee, setAnnee] = useState('');
  const [statut, setStatut] = useState('');
  const [secteur, setSecteur] = useState('');

  const [sortBy, setSortBy] = useState('date');
  const [sortDir, setSortDir] = useState('desc');

  const [selectedRecette, setSelectedRecette] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showPayerModal, setShowPayerModal] = useState(false);
  const [modePaiement, setModePaiement] = useState('ESPECES');
  const printRef = React.useRef(null);

  // ── Chargement des secteurs (pour le filtre) via les rues déjà exposées ──
  useEffect(() => {
    (async () => {
      try {
        const rues = await UserService.getRuesForTIBGestion();
        const noms = [...new Set(rues.map(r => r.secteurNom).filter(Boolean))].sort();
        setSecteurs(noms);
      } catch {
        // Non bloquant : le filtre secteur reste juste vide si ça échoue.
      }
    })();
  }, []);

  // ── Chargement des recettes ────────────────────────────────────────────
  const charger = useCallback(async (pageATirer = page) => {
    try {
      setLoading(true);
      const filters = { type, annee, statut, secteur, search };
      const data = await RecetteService.rechercherRecettes(filters, pageATirer, TAILLE_PAGE, sortBy, sortDir);
      setRecettes(data.content || []);
      setTotalElements(data.totalElements || 0);
      setTotalPages(Math.max(1, data.totalPages || 1));
      if (data.content?.length > 0) {
        setMunicipaliteNom(data.content[0].municipaliteNom || '');
      }
    } catch (error) {
      showMsg('Erreur lors du chargement des recettes.', 'error');
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [type, annee, statut, secteur, search, sortBy, sortDir]);

  useEffect(() => { charger(0); setPage(0); /* eslint-disable-next-line */ }, [type, annee, statut, secteur, sortBy, sortDir]);
  useEffect(() => { charger(page); /* eslint-disable-next-line */ }, [page]);

  const lancerRecherche = () => { setPage(0); charger(0); };
  const reinitialiser = () => {
    setSearch(''); setType(''); setAnnee(''); setStatut(''); setSecteur('');
    setSortBy('date'); setSortDir('desc'); setPage(0);
  };

  const trierPar = (champ) => {
    if (sortBy === champ) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(champ);
      setSortDir('desc');
    }
  };

  const iconeTri = (champ) => {
    if (sortBy !== champ) return null;
    return sortDir === 'asc' ? <Icons.ArrowUp /> : <Icons.ArrowDown />;
  };

  // ── Détails / paiement ─────────────────────────────────────────────────
  const ouvrirDetail = async (recette) => {
    try {
      const detail = await RecetteService.getRecette(recette.id);
      setSelectedRecette(detail);
      setShowDetailModal(true);
    } catch {
      showMsg('Erreur lors du chargement du détail.', 'error');
    }
  };

  const ouvrirPayer = (recette) => {
    setSelectedRecette(recette);
    setModePaiement('ESPECES');
    setShowPayerModal(true);
  };

  const confirmerPaiement = async () => {
    try {
      await RecetteService.marquerRecettePaye(selectedRecette.id, modePaiement);
      showMsg('Recette marquée comme payée.', 'success');
      setShowPayerModal(false);
      charger(page);
    } catch {
      showMsg('Erreur lors du marquage du paiement.', 'error');
    }
  };

  const handleImprimer = () => window.print();

  const handleExporterPDF = async () => {
    const element = printRef.current;
    if (!element) return;
    try {
      const canvas = await html2canvas(element, { scale: 2, useCORS: true, logging: false });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save('Recette_' + (selectedRecette?.codeRecette || '') + '.pdf');
      showMsg('PDF exporté avec succès !', 'success');
    } catch {
      showMsg('Erreur lors de l\'export PDF.', 'error');
    }
  };

  // ── Helpers d'affichage ────────────────────────────────────────────────
  const getStatutBadge = (statutVal) => {
    const classes = { EN_ATTENTE: 'status-badge status-warning', PAYE: 'status-badge status-success', EN_RETARD: 'status-badge status-danger' };
    const labels = { EN_ATTENTE: 'En attente', PAYE: 'Payé', EN_RETARD: 'En retard' };
    return <span className={classes[statutVal] || 'status-badge'}>{labels[statutVal] || statutVal}</span>;
  };

  const getTypeBadge = (typeVal) => (
    <span className={`type-badge type-badge-${typeVal?.toLowerCase()}`}>{typeVal}</span>
  );

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('fr-TN', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  return (
    <div className="recettes-page">
      <div className="recettes-header">
        <h1><Icons.Coins /> Toutes les recettes</h1>
        <p>{municipaliteNom ? `Municipalité de ${municipaliteNom} — ` : ''}Vue consolidée des recettes TIB et TNB, synchronisée automatiquement depuis le Dashboard Municipalité</p>
      </div>

      {/* ── FILTRES ── */}
      <div className="recettes-card">
        <div className="recettes-card-body">
          <div className="filtres-grid">
            <div className="filtre-item filtre-search">
              <label>Recherche</label>
              <input
                type="text"
                className="recettes-input"
                placeholder="Code recette, nom ou CIN du propriétaire..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && lancerRecherche()}
              />
            </div>
            <div className="filtre-item">
              <label>Type</label>
              <select className="recettes-select" value={type} onChange={e => setType(e.target.value)}>
                <option value="">Tous</option>
                <option value="TIB">TIB</option>
                <option value="TNB">TNB</option>
              </select>
            </div>
            <div className="filtre-item">
              <label>Année</label>
              <input type="number" className="recettes-input" placeholder="Ex: 2026" value={annee} onChange={e => setAnnee(e.target.value)} />
            </div>
            <div className="filtre-item">
              <label>Statut</label>
              <select className="recettes-select" value={statut} onChange={e => setStatut(e.target.value)}>
                <option value="">Tous</option>
                <option value="EN_ATTENTE">En attente</option>
                <option value="PAYE">Payé</option>
                <option value="EN_RETARD">En retard</option>
              </select>
            </div>
            <div className="filtre-item">
              <label>Secteur</label>
              <select className="recettes-select" value={secteur} onChange={e => setSecteur(e.target.value)}>
                <option value="">Tous</option>
                {secteurs.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div className="filtre-item filtre-actions">
              <button className="btn-recettes-search" onClick={lancerRecherche}><Icons.Search /> Filtrer</button>
              <button className="btn-recettes-secondary" onClick={reinitialiser}>Réinitialiser</button>
            </div>
          </div>
        </div>
      </div>

      {/* ── TABLEAU ── */}
      <div className="recettes-card">
        <div className="recettes-card-header">
          <h3>Recettes <span className="badge-count">{totalElements}</span></h3>
        </div>
        <div className="recettes-card-body">
          {loading ? (
            <div className="recettes-loading"><div className="recettes-spinner" /><span>Chargement...</span></div>
          ) : (
            <>
              <div className="table-wrapper">
                <table className="recettes-table">
                  <thead>
                    <tr>
                      <th>Code Recette</th>
                      <th>Type</th>
                      <th>Référence Taxe</th>
                      <th>Propriétaire</th>
                      <th>CIN</th>
                      <th className="th-sortable" onClick={() => trierPar('annee')}>Année {iconeTri('annee')}</th>
                      <th className="th-sortable" onClick={() => trierPar('montant')}>Montant {iconeTri('montant')}</th>
                      <th className="th-sortable" onClick={() => trierPar('date')}>Date {iconeTri('date')}</th>
                      <th>Statut</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recettes.length === 0 ? (
                      <tr><td colSpan={10} className="no-data">Aucune recette trouvée.</td></tr>
                    ) : recettes.map(r => (
                      <tr key={r.id} className={r.estEnRetard ? 'row-danger' : ''}>
                        <td><strong>{r.codeRecette}</strong></td>
                        <td>{getTypeBadge(r.type)}</td>
                        <td>{r.numeroAvis || 'N/A'}</td>
                        <td>{r.proprietaireNom}</td>
                        <td>{r.proprietaireCin}</td>
                        <td>{r.anneeFiscale}</td>
                        <td>{r.montant?.toFixed(3)} TND</td>
                        <td>{formatDate(r.dateGeneration)}</td>
                        <td>{getStatutBadge(r.statut)}</td>
                        <td>
                          <div className="action-buttons">
                            <button className="btn-icon" onClick={() => ouvrirDetail(r)} title="Consulter"><Icons.Eye /></button>
                            {r.statut === 'EN_ATTENTE' && (
                              <button className="btn-icon btn-icon-success" onClick={() => ouvrirPayer(r)} title="Marquer comme payé"><Icons.Check /></button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {totalPages > 1 && (
                <div className="pagination">
                  <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0}>Précédent</button>
                  <span>Page {page + 1} sur {totalPages} ({totalElements} recettes)</span>
                  <button onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} disabled={page >= totalPages - 1}>Suivant</button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* ── MODAL DÉTAIL / IMPRESSION ── */}
      {showDetailModal && selectedRecette && (
        <div className="modal-overlay" onClick={() => setShowDetailModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} ref={printRef}>
            <div className="modal-header">
              <h2>Recette {selectedRecette.codeRecette}</h2>
              <button className="modal-close" onClick={() => setShowDetailModal(false)}><Icons.X /></button>
            </div>
            <div className="modal-body">
              <div className="recette-details">
                <div className="recette-header-row">
                  <div>
                    <label>Code recette</label>
                    <span className="recette-code-value">{selectedRecette.codeRecette}</span>
                  </div>
                  <div className="recette-status">{getStatutBadge(selectedRecette.statut)}</div>
                </div>

                <div className="recette-info-grid">
                  <div className="recette-info-item"><label>Type de taxe</label><span>{selectedRecette.typeLabel}</span></div>
                  <div className="recette-info-item"><label>Référence avis</label><span>{selectedRecette.numeroAvis || 'N/A'}</span></div>
                  <div className="recette-info-item"><label>Propriétaire</label><span>{selectedRecette.proprietaireNom}</span></div>
                  <div className="recette-info-item"><label>CIN</label><span>{selectedRecette.proprietaireCin}</span></div>
                  <div className="recette-info-item"><label>Rue</label><span>{selectedRecette.rueNom}</span></div>
                  <div className="recette-info-item"><label>Secteur</label><span>{selectedRecette.secteurNom}</span></div>
                  <div className="recette-info-item"><label>Municipalité</label><span>{selectedRecette.municipaliteNom}</span></div>
                  <div className="recette-info-item"><label>Année fiscale</label><span>{selectedRecette.anneeFiscale}</span></div>
                  <div className="recette-info-item"><label>Date de génération</label><span>{formatDate(selectedRecette.dateGeneration)}</span></div>
                  <div className="recette-info-item"><label>Date limite</label><span className={selectedRecette.estEnRetard ? 'text-danger' : ''}>{formatDate(selectedRecette.dateLimite)}</span></div>
                  {selectedRecette.statut === 'PAYE' && (
                    <>
                      <div className="recette-info-item"><label>Date de paiement</label><span>{formatDate(selectedRecette.datePaiement)}</span></div>
                      <div className="recette-info-item"><label>Mode de paiement</label><span>{selectedRecette.modePaiementLabel}</span></div>
                    </>
                  )}
                </div>

                <div className="recette-montant-box">
                  <label>Montant de la recette</label>
                  <span>{selectedRecette.montant?.toFixed(3)} TND</span>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-recettes-secondary" onClick={() => setShowDetailModal(false)}>Fermer</button>
              <button className="btn-recettes-print" onClick={handleImprimer}><Icons.Printer /> Imprimer</button>
              <button className="btn-recettes-pdf" onClick={handleExporterPDF}><Icons.Download /> Télécharger PDF</button>
              {selectedRecette.statut === 'EN_ATTENTE' && (
                <button className="btn-icon-success btn-payer-full" onClick={() => { setShowDetailModal(false); ouvrirPayer(selectedRecette); }}>
                  <Icons.Check /> Marquer comme payé
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL PAIEMENT ── */}
      {showPayerModal && selectedRecette && (
        <div className="modal-overlay" onClick={() => setShowPayerModal(false)}>
          <div className="modal-content modal-small" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Confirmer le paiement</h2>
              <button className="modal-close" onClick={() => setShowPayerModal(false)}><Icons.X /></button>
            </div>
            <div className="modal-body">
              <p className="modal-intro-text">
                Recette <strong>{selectedRecette.codeRecette}</strong> — {selectedRecette.montant?.toFixed(3)} TND
              </p>
              <label className="modal-label">Mode de paiement</label>
              <div className="mode-paiement-grid">
                {[
                  { value: 'ESPECES', label: 'Espèces' },
                  { value: 'CHEQUE', label: 'Chèque' },
                  { value: 'VIREMENT', label: 'Virement' },
                  { value: 'CARTE_BANCAIRE', label: 'Carte bancaire' },
                ].map(m => (
                  <button
                    key={m.value}
                    type="button"
                    className={`mode-paiement-btn ${modePaiement === m.value ? 'mode-paiement-btn-active' : ''}`}
                    onClick={() => setModePaiement(m.value)}
                  >
                    {m.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-recettes-secondary" onClick={() => setShowPayerModal(false)}>Annuler</button>
              <button className="btn-icon-success btn-payer-full" onClick={confirmerPaiement}><Icons.Check /> Confirmer le paiement</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
