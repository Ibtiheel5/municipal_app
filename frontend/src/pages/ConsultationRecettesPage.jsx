// ConsultationRecettesPage.jsx - Consultation des Recettes par Code TIB/TNB
// L'agent saisit un code, le système affiche toutes les années d'imposition
// avec montant dû, payé, restant, statut, et actions (paiement / quittance).
import React, { useState, useRef } from 'react';
import RecetteService from '../services/recetteService';
import UserService from '../services/userService';
import './TIBPage.css';
import './ConsultationRecettesPage.css';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

const Icons = {
  Search: () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>),
  User: () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>),
  Building: () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="2" width="16" height="20" rx="2"/><line x1="8" y1="6" x2="16" y2="6"/><line x1="8" y1="10" x2="16" y2="10"/><line x1="8" y1="14" x2="16" y2="14"/><line x1="8" y1="18" x2="12" y2="18"/></svg>),
  Coins: () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="8" cy="8" r="6"/><path d="M18.09 10.37A6 6 0 1 1 10.34 18"/><path d="M7 6h1v4"/><path d="m16.71 13.88.7.71-2.82 2.82"/></svg>),
  Check: () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20,6 9,17 4,12"/></svg>),
  X: () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>),
  Download: () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7,10 12,15 17,10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>),
  Printer: () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6,9 6,2 18,2 18,9"/><path d="M18,9H6"/><rect x="6" y="14" width="12" height="8"/></svg>),
  Plus: () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>),
  Eye: () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>),
};

const TYPES_TAXE = [
  { value: 'TIB', label: 'Code TIB', disponible: true },
  { value: 'TNB', label: 'Code TNB', disponible: false }, // à activer plus tard
];

export default function ConsultationRecettesPage({ showMsg }) {
  const [typeTaxe, setTypeTaxe] = useState('TIB');
  const [codeSaisi, setCodeSaisi] = useState('');
  const [dossier, setDossier] = useState(null);
  const [loading, setLoading] = useState(false);
  const [genererEnCours, setGenererEnCours] = useState(null);
  const [selectedAnnee, setSelectedAnnee] = useState(null);
  const [showPaiementModal, setShowPaiementModal] = useState(false);
  const [showQuittanceModal, setShowQuittanceModal] = useState(false);
  const [quittanceData, setQuittanceData] = useState(null);
  const printRef = useRef(null);

  // État pour le formulaire de paiement
  const [paiementMontant, setPaiementMontant] = useState('');
  const [paiementMode, setPaiementMode] = useState('ESPECES');
  const [paiementReference, setPaiementReference] = useState('');

  const rechercherDossier = async () => {
    if (!codeSaisi.trim()) {
      showMsg('Veuillez saisir un code.', 'error');
      return;
    }
    if (typeTaxe === 'TNB') {
      showMsg('La consultation par Code TNB sera disponible prochainement.', 'info');
      return;
    }
    setLoading(true);
    setDossier(null);
    try {
      let data;
      if (typeTaxe === 'TIB') {
        data = await RecetteService.consulterParCodeTib(codeSaisi.trim());
      } else {
        data = await RecetteService.consulterParCodeTnb(codeSaisi.trim());
      }
      setDossier(data);
    } catch (error) {
      const message = error.response?.data?.message || 'Aucun dossier trouvé pour ce code.';
      showMsg(message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const rafraichirDossier = async () => {
    if (!dossier) return;
    try {
      let data;
      if (typeTaxe === 'TIB') {
        data = await RecetteService.consulterParCodeTib(dossier.codeTaxe);
      } else {
        data = await RecetteService.consulterParCodeTnb(dossier.codeTaxe);
      }
      setDossier(data);
    } catch (error) {
      showMsg('Erreur lors du rafraîchissement du dossier.', 'error');
    }
  };

  const handleGenererAnnee = async (annee) => {
    if (!dossier) return;
    setGenererEnCours(annee);
    try {
      let result;
      if (typeTaxe === 'TIB') {
        result = await RecetteService.genererAvisAnnee(dossier.codeTaxe, annee);
      } else {
        // À implémenter pour TNB
        showMsg('Génération TNB non disponible.', 'error');
        setGenererEnCours(null);
        return;
      }
      showMsg(`Avis généré pour l'année ${annee}.`, 'success');
      await rafraichirDossier();
    } catch (error) {
      const message = error.response?.data?.message || 'Erreur lors de la génération.';
      showMsg(message, 'error');
    } finally {
      setGenererEnCours(null);
    }
  };

  // ── Paiement ──────────────────────────────────────────────────────────────

  const ouvrirPaiement = (anneeItem) => {
    setSelectedAnnee(anneeItem);
    setPaiementMontant(anneeItem.montantRestant?.toFixed(3) || '');
    setPaiementMode('ESPECES');
    setPaiementReference('');
    setShowPaiementModal(true);
  };

  const handleEnregistrerPaiement = async () => {
    if (!selectedAnnee || !paiementMontant || parseFloat(paiementMontant) <= 0) {
      showMsg('Veuillez saisir un montant valide.', 'error');
      return;
    }
    try {
      const payload = {
        montant: parseFloat(paiementMontant),
        modePaiement: paiementMode,
        referenceTransaction: paiementReference || null,
      };
      let result;
      if (typeTaxe === 'TIB') {
        result = await RecetteService.enregistrerPaiementTib(dossier.codeTaxe, selectedAnnee.annee, payload);
      } else {
        result = await RecetteService.enregistrerPaiementTnb(dossier.codeTaxe, selectedAnnee.annee, payload);
      }
      showMsg('Paiement enregistré avec succès !', 'success');
      setShowPaiementModal(false);
      await rafraichirDossier();
    } catch (error) {
      const msg = error.response?.data?.message || 'Erreur lors de l\'enregistrement du paiement.';
      showMsg(msg, 'error');
    }
  };

  // ── Quittance ──────────────────────────────────────────────────────────────

  const ouvrirQuittance = async (anneeItem) => {
    try {
      let data;
      if (typeTaxe === 'TIB') {
        data = await RecetteService.getQuittanceTib(anneeItem.avisId);
      } else {
        data = await RecetteService.getQuittanceTnb(anneeItem.avisId);
      }
      setQuittanceData(data);
      setShowQuittanceModal(true);
    } catch (error) {
      showMsg('Erreur lors du chargement de la quittance.', 'error');
    }
  };

  const handleImprimerQuittance = () => window.print();

  const handleExporterPDFQuittance = async () => {
    const element = printRef.current;
    if (!element) return;
    try {
      const canvas = await html2canvas(element, { scale: 2, useCORS: true, logging: false });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save('Quittance_' + (quittanceData?.numeroQuittance || '') + '.pdf');
      showMsg('PDF exporté avec succès !', 'success');
    } catch (error) {
      showMsg('Erreur lors de l\'export PDF.', 'error');
    }
  };

  // ── Helpers d'affichage ──────────────────────────────────────────────────

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('fr-TN', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  const getStatutBadge = (statut) => {
    const classes = {
      EN_ATTENTE: 'status-badge status-warning',
      PARTIELLEMENT_PAYE: 'status-badge status-warning',
      PAYE: 'status-badge status-success',
      EN_RETARD: 'status-badge status-danger',
      NON_GENERE: 'status-badge status-neutre',
    };
    const labels = {
      EN_ATTENTE: '⏳ En attente',
      PARTIELLEMENT_PAYE: '🟠 Partiellement payé',
      PAYE: '✅ Payé',
      EN_RETARD: '⚠️ En retard',
      NON_GENERE: '❌ Non généré',
    };
    return <span className={classes[statut] || 'status-badge'}>{labels[statut] || statut}</span>;
  };

  // ── Rendu du tableau ──────────────────────────────────────────────────────

  const renderAnneesTable = () => {
    if (!dossier) return null;
    return (
      <div className="table-wrapper">
        <table className="avis-table">
          <thead>
            <tr>
              <th>Année</th>
              <th>Montant dû</th>
              <th>Montant payé</th>
              <th>Reste à payer</th>
              <th>Statut</th>
              <th>Date paiement</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {dossier.anneesImposition.map(a => (
              <tr key={a.annee} className={a.statut === 'EN_RETARD' ? 'row-danger' : ''}>
                <td><strong>{a.annee}</strong></td>
                <td>{a.montant != null ? a.montant.toFixed(3) + ' TND' : 'N/A'}</td>
                <td>{a.montantPaye != null ? a.montantPaye.toFixed(3) + ' TND' : '0 TND'}</td>
                <td>{a.montantRestant != null ? a.montantRestant.toFixed(3) + ' TND' : '0 TND'}</td>
                <td>{getStatutBadge(a.statut)}</td>
                <td>{a.datePaiement ? formatDate(a.datePaiement) : '—'}</td>
                <td>
                  <div className="action-buttons">
                    {a.genere ? (
                      <>
                        {a.statut === 'PAYE' ? (
                          <button className="btn-view" onClick={() => ouvrirQuittance(a)} title="Voir quittance">
                            📄 Quittance
                          </button>
                        ) : (
                          <button className="btn-payer" onClick={() => ouvrirPaiement(a)} title="Enregistrer paiement">
                            💰 Payer
                          </button>
                        )}
                      </>
                    ) : (
                      <button
                        className="btn-search"
                        style={{ height: '30px', padding: '0 12px', fontSize: '12px' }}
                        onClick={() => handleGenererAnnee(a.annee)}
                        disabled={genererEnCours === a.annee}
                      >
                        <Icons.Plus /> {genererEnCours === a.annee ? 'Génération...' : 'Générer avis'}
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  // ── Rendu principal ──────────────────────────────────────────────────────

  return (
    <div className="tib-page">
      <div className="tib-header">
        <h1><Icons.Coins /> Consultation des Recettes</h1>
        <p>Saisissez un Code TIB (ou TNB) pour retrouver le dossier et afficher toutes les années d'imposition</p>
      </div>

      {/* ── BARRE DE RECHERCHE ── */}
      <div className="tib-card tib-card-full">
        <div className="tib-card-header"><h3><Icons.Search /> Rechercher un dossier</h3></div>
        <div className="tib-card-body">
          <div className="consult-search-grid">
            <div className="search-item">
              <label>Type de code</label>
              <select className="tib-select" value={typeTaxe} onChange={e => setTypeTaxe(e.target.value)}>
                {TYPES_TAXE.map(t => (
                  <option key={t.value} value={t.value}>{t.label}{!t.disponible ? ' (bientôt disponible)' : ''}</option>
                ))}
              </select>
            </div>
            <div className="search-item" style={{ gridColumn: 'span 2' }}>
              <label>{typeTaxe === 'TIB' ? 'Code TIB' : 'Code TNB'}</label>
              <input
                type="text"
                className="tib-input"
                value={codeSaisi}
                onChange={e => setCodeSaisi(e.target.value)}
                placeholder="Ex: TIB-2026-000042"
                onKeyDown={e => e.key === 'Enter' && rechercherDossier()}
              />
            </div>
            <div className="search-item search-actions">
              <button className="btn-search" onClick={rechercherDossier} disabled={loading}>
                <Icons.Search /> {loading ? 'Recherche...' : 'Rechercher'}
              </button>
            </div>
          </div>
          {typeTaxe === 'TNB' && (
            <p className="formule-hint" style={{ marginTop: '1rem' }}>
              La consultation par Code TNB sera activée prochainement.
            </p>
          )}
        </div>
      </div>

      {dossier && (
        <>
          {/* ── INFOS DU DOSSIER ── */}
          <div className="tib-card tib-card-full">
            <div className="tib-card-header"><h3><Icons.Building /> Informations du dossier — {dossier.codeTaxe}</h3></div>
            <div className="tib-card-body">
              <div className="info-grid">
                <div className="info-item"><label>Code de la taxe</label><span className="info-value">{dossier.codeTaxe}</span></div>
                <div className="info-item"><label>Propriétaire</label><span className="info-value">{dossier.proprietaireNom}</span></div>
                <div className="info-item"><label>CIN</label><span className="info-value">{dossier.proprietaireCin}</span></div>
                <div className="info-item"><label>Adresse</label><span className="info-value">{dossier.adresse}</span></div>
                <div className="info-item"><label>Municipalité</label><span className="info-value">{dossier.municipaliteNom}</span></div>
                <div className="info-item"><label>Secteur</label><span className="info-value">{dossier.secteurNom}</span></div>
                <div className="info-item"><label>Date de début d'imposition</label><span className="info-value">{formatDate(dossier.dateDebutImposition)}</span></div>
                <div className="info-item"><label>Année fiscale actuelle</label><span className="info-value">{dossier.anneeFiscaleActuelle}</span></div>
              </div>
            </div>
          </div>

          {/* ── TABLEAU DES ANNÉES ── */}
          <div className="tib-card tib-card-full">
            <div className="tib-card-header">
              <h3>Années d'imposition <span className="badge-count">{dossier.nbAnneesTotal}</span></h3>
            </div>
            <div className="tib-card-body">
              {renderAnneesTable()}
            </div>
          </div>

          {/* ── RÉCAPITULATIF ── */}
          <div className="consult-summary-grid">
            <div className="consult-summary-card">
              <span className="consult-summary-label">Total à payer</span>
              <span className="consult-summary-value">{dossier.totalAPayer?.toFixed(3) || dossier.totalPaye?.toFixed(3) || '0'} TND</span>
            </div>
            <div className="consult-summary-card consult-summary-success">
              <span className="consult-summary-label">Total payé</span>
              <span className="consult-summary-value">{dossier.totalPaye?.toFixed(3) || '0'} TND</span>
            </div>
            <div className="consult-summary-card consult-summary-danger">
              <span className="consult-summary-label">Total restant</span>
              <span className="consult-summary-value">{dossier.totalRestant?.toFixed(3) || '0'} TND</span>
            </div>
          </div>
        </>
      )}

      {/* ── MODAL PAIEMENT ── */}
      {showPaiementModal && selectedAnnee && (
        <div className="modal-overlay" onClick={() => setShowPaiementModal(false)}>
          <div className="modal-content modal-small" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Enregistrer un paiement</h2>
              <button className="modal-close" onClick={() => setShowPaiementModal(false)}><Icons.X /></button>
            </div>
            <div className="modal-body">
              <p className="modal-intro-text">
                Année <strong>{selectedAnnee.annee}</strong> — Restant dû : <strong>{selectedAnnee.montantRestant?.toFixed(3)} TND</strong>
              </p>
              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label>Montant à payer (TND)</label>
                <input
                  type="number"
                  step="0.001"
                  className="tib-input"
                  value={paiementMontant}
                  onChange={e => setPaiementMontant(e.target.value)}
                  placeholder="Ex: 100.000"
                  min="0"
                />
              </div>
              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label>Mode de paiement</label>
                <select className="tib-select" value={paiementMode} onChange={e => setPaiementMode(e.target.value)}>
                  <option value="ESPECES">Espèces</option>
                  <option value="CHEQUE">Chèque</option>
                  <option value="VIREMENT">Virement</option>
                  <option value="CARTE_BANCAIRE">Carte bancaire</option>
                </select>
              </div>
              <div className="form-group">
                <label>Référence (optionnel)</label>
                <input
                  type="text"
                  className="tib-input"
                  value={paiementReference}
                  onChange={e => setPaiementReference(e.target.value)}
                  placeholder="N° chèque, virement, etc."
                />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setShowPaiementModal(false)}>Annuler</button>
              <button className="btn-payer" onClick={handleEnregistrerPaiement}>
                <Icons.Check /> Enregistrer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL QUITTANCE ── */}
      {showQuittanceModal && quittanceData && (
        <div className="modal-overlay" onClick={() => setShowQuittanceModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} ref={printRef}>
            <div className="modal-header">
              <h2>Quittance de paiement</h2>
              <button className="modal-close" onClick={() => setShowQuittanceModal(false)}><Icons.X /></button>
            </div>
            <div className="modal-body">
              <div className="avis-details">
                <div className="avis-header">
                  <div className="avis-number">
                    <label>Numéro de quittance</label>
                    <span className="avis-number-value">{quittanceData.numeroQuittance}</span>
                  </div>
                  <div className="avis-status">{getStatutBadge(quittanceData.statut)}</div>
                </div>

                <div className="avis-info-grid">
                  <div className="avis-info-item"><label>Code taxe</label><span>{quittanceData.codeTaxe}</span></div>
                  <div className="avis-info-item"><label>Propriétaire</label><span>{quittanceData.proprietaireNom}</span></div>
                  <div className="avis-info-item"><label>CIN</label><span>{quittanceData.proprietaireCin}</span></div>
                  <div className="avis-info-item"><label>Adresse</label><span>{quittanceData.adresse}</span></div>
                  <div className="avis-info-item"><label>Municipalité</label><span>{quittanceData.municipaliteNom}</span></div>
                  <div className="avis-info-item"><label>Secteur</label><span>{quittanceData.secteurNom}</span></div>
                  <div className="avis-info-item"><label>Rue</label><span>{quittanceData.rueNom}</span></div>
                  <div className="avis-info-item"><label>Année fiscale</label><span>{quittanceData.anneeFiscale}</span></div>
                </div>

                <div className="avis-calcul">
                  <div className="avis-calcul-item"><label>Montant total dû</label><span>{quittanceData.montantTotal?.toFixed(3)} TND</span></div>
                  <div className="avis-calcul-item"><label>Montant payé</label><span>{quittanceData.montantPaye?.toFixed(3)} TND</span></div>
                  <div className="avis-calcul-item"><label>Reste</label><span>{quittanceData.montantRestant?.toFixed(3)} TND</span></div>
                  <div className="avis-calcul-item"><label>Date paiement</label><span>{formatDate(quittanceData.dateDernierPaiement)}</span></div>
                  <div className="avis-calcul-item"><label>Mode paiement</label><span>{quittanceData.modePaiement}</span></div>
                </div>

                <div className="avis-observations">
                  <label>Agent ayant enregistré</label>
                  <p>{quittanceData.agentNom || 'Inconnu'}</p>
                </div>

                <div style={{ marginTop: '1rem', borderTop: '1px solid #ccc', paddingTop: '0.5rem', textAlign: 'center' }}>
                  <span style={{ fontStyle: 'italic', color: '#64748B' }}>Cachet de la recette municipale</span>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setShowQuittanceModal(false)}>Fermer</button>
              <button className="btn-print" onClick={handleImprimerQuittance}><Icons.Printer /> Imprimer</button>
              <button className="btn-pdf" onClick={handleExporterPDFQuittance}><Icons.Download /> Télécharger PDF</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}