// ReleveComptePage.jsx - Style épuré, PDF sans boutons
import React, { useState, useRef, useEffect } from 'react';
import RecetteService from '../services/recetteService';
import './ReleveComptePage.css';
import './TIBPage.css';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

// ── Toutes les icônes en SVG (aucun emoji) ──────────────────────────────
const Icons = {
  Search: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  ),
  FileText: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14,2 14,8 20,8" />
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
  Printer: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="6,9 6,2 18,2 18,9" />
      <path d="M18,9H6" />
      <rect x="6" y="14" width="12" height="8" />
    </svg>
  ),
  Download: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7,10 12,15 17,10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  ),
  X: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  ),
  Check: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20,6 9,17 4,12" />
    </svg>
  ),
  User: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  ),
  MapPin: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
      <circle cx="12" cy="10" r="3" />
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
  Eye: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  ),
  List: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="8" y1="6" x2="21" y2="6" />
      <line x1="8" y1="12" x2="21" y2="12" />
      <line x1="8" y1="18" x2="21" y2="18" />
      <line x1="3" y1="6" x2="3.01" y2="6" />
      <line x1="3" y1="12" x2="3.01" y2="12" />
      <line x1="3" y1="18" x2="3.01" y2="18" />
    </svg>
  ),
  Receipt: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 4h16v16H4z" />
      <line x1="8" y1="8" x2="16" y2="8" />
      <line x1="8" y1="12" x2="16" y2="12" />
      <line x1="8" y1="16" x2="12" y2="16" />
    </svg>
  ),
};

export default function ReleveComptePage({ showMsg }) {
  const [code, setCode] = useState('');
  const [releve, setReleve] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [showPayerModal, setShowPayerModal] = useState(false);
  const [anneeSelectionnee, setAnneeSelectionnee] = useState(null);
  const [montantPaiement, setMontantPaiement] = useState('');
  const [modePaiement, setModePaiement] = useState('ESPECES');
  const [submitting, setSubmitting] = useState(false);

  const [showQuittancesModal, setShowQuittancesModal] = useState(false);
  const [quittancesAnnee, setQuittancesAnnee] = useState([]);
  const [quittanceDetail, setQuittanceDetail] = useState(null);
  const printRef = useRef(null);
  const globalPrintRef = useRef(null);

  // ── Recherche ──────────────────────────────────────────────────────────────
  const rechercher = async () => {
    if (!code.trim()) {
      showMsg('Veuillez saisir un Code TIB ou TNB.', 'error');
      return;
    }
    try {
      setLoading(true);
      setError('');
      const data = await RecetteService.getReleveCompte(code.trim());
      setReleve(data);
    } catch (err) {
      setReleve(null);
      const message = err.response?.data?.message || err.message || 'Aucun dossier trouvé pour ce code.';
      setError(message);
      showMsg(message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const rafraichirReleve = async () => {
    if (!releve) return null;
    try {
      const data = await RecetteService.getReleveCompte(releve.codeRecherche);
      setReleve(data);
      return data;
    } catch (err) {
      showMsg('Erreur lors du rafraîchissement du relevé.', 'error');
      return null;
    }
  };

  // ── Ouverture du modal paiement ───────────────────────────────────────────
  const ouvrirPayer = (annee) => {
    if (annee.montantRestant <= 0.001) {
      showMsg('Cette année est déjà entièrement payée.', 'error');
      return;
    }
    setAnneeSelectionnee(annee);
    setMontantPaiement(annee.montantRestant?.toFixed(3) || '');
    setModePaiement('ESPECES');
    setShowPayerModal(true);
  };

  const fermerModalPaiement = () => {
    setShowPayerModal(false);
    setAnneeSelectionnee(null);
  };

  // ── Confirmation paiement ─────────────────────────────────────────────────
  const confirmerPaiement = async () => {
    const montant = parseFloat(montantPaiement);
    if (!montant || montant <= 0) {
      showMsg('Veuillez saisir un montant valide.', 'error');
      return;
    }
    if (!anneeSelectionnee) {
      showMsg('Aucune année sélectionnée.', 'error');
      return;
    }
    if (montant > anneeSelectionnee.montantRestant + 0.001) {
      showMsg('Le montant dépasse le reste à payer pour cette année.', 'error');
      return;
    }
    if (anneeSelectionnee.montantRestant <= 0.001) {
      showMsg('Cette année est déjà entièrement payée.', 'error');
      return;
    }

    try {
      setSubmitting(true);
      await RecetteService.enregistrerPaiementAnnee(
        releve.codeRecherche,
        anneeSelectionnee.annee,
        montant,
        modePaiement
      );
      showMsg('Paiement enregistré avec succès !', 'success');
      fermerModalPaiement();

      const data = await rafraichirReleve();
      if (data) {
        const anneeMaj = data.annees.find(a => a.annee === anneeSelectionnee.annee);
        if (anneeMaj?.statut === 'PAYE') {
          showMsg(`L'année ${anneeSelectionnee.annee} est maintenant entièrement payée.`, 'success');
        }
        if (anneeMaj?.recetteId && anneeMaj?.quittanceDisponible) {
          const quittances = await RecetteService.getQuittancesByRecette(anneeMaj.recetteId);
          if (quittances.length > 0) {
            const derniere = await RecetteService.getQuittance(quittances[0].numeroQuittance);
            setQuittanceDetail(derniere);
          }
        }
      }
    } catch (err) {
      const message = err.response?.data?.message || err.message || 'Erreur lors de l\'enregistrement du paiement.';
      showMsg(message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // ── Quittances ─────────────────────────────────────────────────────────────
  const voirQuittances = async (annee) => {
    if (!annee.recetteId) {
      showMsg('Aucune recette associée à cette année.', 'error');
      return;
    }
    try {
      const quittances = await RecetteService.getQuittancesByRecette(annee.recetteId);
      if (quittances.length === 1) {
        const detail = await RecetteService.getQuittance(quittances[0].numeroQuittance);
        setQuittanceDetail(detail);
      } else if (quittances.length > 1) {
        setQuittancesAnnee(quittances);
        setShowQuittancesModal(true);
      } else {
        showMsg('Aucune quittance trouvée pour cette année.', 'info');
      }
    } catch (err) {
      showMsg('Erreur lors du chargement des quittances.', 'error');
    }
  };

  const choisirQuittance = async (numeroQuittance) => {
    try {
      const detail = await RecetteService.getQuittance(numeroQuittance);
      setQuittanceDetail(detail);
      setShowQuittancesModal(false);
    } catch (err) {
      showMsg('Erreur lors du chargement de la quittance.', 'error');
    }
  };

  // ── Impression / PDF ──────────────────────────────────────────────────────
  // Impression de la quittance individuelle
  const handleImprimer = () => window.print();

  // Export PDF de la quittance individuelle (sans les boutons)
  const handleExporterPDF = async () => {
    const element = printRef.current;
    if (!element) return;
    try {
      // On cache temporairement les boutons pour le PDF
      const footer = element.querySelector('.modal-footer');
      const originalDisplay = footer ? footer.style.display : null;
      if (footer) footer.style.display = 'none';

      const canvas = await html2canvas(element, { scale: 2, useCORS: true, logging: false });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save('Quittance_' + (quittanceDetail?.numeroQuittance || '') + '.pdf');
      showMsg('PDF exporté avec succès !', 'success');

      if (footer) footer.style.display = originalDisplay || '';
    } catch (err) {
      showMsg('Erreur lors de l\'export PDF.', 'error');
    }
  };

  // Export PDF récapitulatif global (toutes les années)
  const handleExporterPDFGlobal = async () => {
    if (!releve) {
      showMsg('Aucun relevé à exporter.', 'error');
      return;
    }
    // Créer un élément temporaire pour le PDF global
    const container = document.createElement('div');
    container.style.position = 'absolute';
    container.style.left = '-9999px';
    container.style.top = '0';
    container.style.background = '#fff';
    container.style.padding = '20px';
    container.style.fontFamily = 'Arial, sans-serif';
    container.style.width = '800px';

    container.innerHTML = `
      <div style="text-align:center; margin-bottom:20px;">
        <h2 style="margin:0; color:#0A1E3D;">RÉCAPITULATIF DES RECETTES</h2>
        <p style="margin:5px 0; font-size:14px; color:#555;">${releve.proprietaireNom} – ${releve.proprietaireCin}</p>
        <p style="margin:0; font-size:12px; color:#777;">${releve.bienAdresse} – ${releve.municipaliteNom}</p>
        <hr style="margin:15px 0; border:1px solid #ccc;" />
      </div>
      <table style="width:100%; border-collapse:collapse; font-size:12px;">
        <thead>
          <tr style="background:#f5f5f5;">
            <th style="border:1px solid #ddd; padding:8px; text-align:left;">Année</th>
            <th style="border:1px solid #ddd; padding:8px; text-align:right;">Montant dû</th>
            <th style="border:1px solid #ddd; padding:8px; text-align:right;">Montant payé</th>
            <th style="border:1px solid #ddd; padding:8px; text-align:right;">Reste à payer</th>
            <th style="border:1px solid #ddd; padding:8px; text-align:center;">Statut</th>
          </tr>
        </thead>
        <tbody>
          ${releve.annees.map(a => `
            <tr>
              <td style="border:1px solid #ddd; padding:8px;">${a.annee}</td>
              <td style="border:1px solid #ddd; padding:8px; text-align:right;">${(a.montantDu ?? 0).toFixed(3)} TND</td>
              <td style="border:1px solid #ddd; padding:8px; text-align:right;">${(a.montantPaye ?? 0).toFixed(3)} TND</td>
              <td style="border:1px solid #ddd; padding:8px; text-align:right;">${(a.montantRestant ?? 0).toFixed(3)} TND</td>
              <td style="border:1px solid #ddd; padding:8px; text-align:center;">${a.statut}</td>
            </tr>
          `).join('')}
        </tbody>
        <tfoot>
          <tr style="background:#f9f9f9; font-weight:bold;">
            <td style="border:1px solid #ddd; padding:8px;">TOTAL</td>
            <td style="border:1px solid #ddd; padding:8px; text-align:right;">${(releve.totalDu ?? 0).toFixed(3)} TND</td>
            <td style="border:1px solid #ddd; padding:8px; text-align:right;">${(releve.totalPaye ?? 0).toFixed(3)} TND</td>
            <td style="border:1px solid #ddd; padding:8px; text-align:right;">${(releve.totalRestant ?? 0).toFixed(3)} TND</td>
            <td style="border:1px solid #ddd; padding:8px;"></td>
          </tr>
        </tfoot>
      </table>
      <div style="margin-top:20px; padding:15px; border:1px solid #aaa; background:#fafafa; font-size:11px; color:#444;">
        <p style="margin:0 0 8px 0;"><strong>Textes de loi applicables :</strong></p>
        <ul style="margin:0; padding-left:20px;">
          <li>Loi n° 89-14 du 8 mars 1989 relative aux taxes municipales (article 3, 4 et 7).</li>
          <li>Code des impôts directs et taxes indirectes (article 42 bis, 43, 44).</li>
          <li>Décret n° 2001-2767 du 5 novembre 2001 fixant les modalités de recouvrement des taxes municipales.</li>
          <li>Loi n° 2017-52 du 21 juin 2017 portant réforme du système fiscal local.</li>
        </ul>
        <p style="margin:10px 0 0 0;">Ce document est un extrait officiel du relevé de compte. Il ne tient lieu ni de quittance ni de titre de perception.</p>
      </div>
      <div style="margin-top:10px; text-align:center; font-size:10px; color:#999;">
        Généré le ${new Date().toLocaleDateString('fr-TN', { day:'2-digit', month:'2-digit', year:'numeric', hour:'2-digit', minute:'2-digit' })}
      </div>
    `;

    document.body.appendChild(container);

    try {
      const canvas = await html2canvas(container, { scale: 2, useCORS: true, logging: false });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save('Recapitulatif_Recettes_' + releve.codeRecherche + '.pdf');
      showMsg('Récapitulatif PDF exporté avec succès !', 'success');
    } catch (err) {
      showMsg('Erreur lors de l\'export du récapitulatif.', 'error');
    } finally {
      document.body.removeChild(container);
    }
  };

  // ── Helpers d'affichage ────────────────────────────────────────────────────
  const getStatutBadge = (statutVal) => {
    const classes = {
      EN_ATTENTE: 'status-badge status-warning',
      PARTIEL: 'status-badge status-partiel',
      PAYE: 'status-badge status-success',
      EN_RETARD: 'status-badge status-danger'
    };
    const labels = {
      EN_ATTENTE: 'Non payé',
      PARTIEL: 'Partiellement payé',
      PAYE: 'Payé',
      EN_RETARD: 'Non payé'
    };
    return <span className={classes[statutVal] || 'status-badge'}>{labels[statutVal] || statutVal}</span>;
  };

  const formatMontant = (m) => (m ?? 0).toFixed(3) + ' TND';
  const formatDate = (date) => date ? new Date(date).toLocaleDateString('fr-TN', { day: '2-digit', month: '2-digit', year: 'numeric' }) : 'N/A';
  const formatDateTime = (date) => date ? new Date(date).toLocaleString('fr-TN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'N/A';

  // ── Rendu principal ────────────────────────────────────────────────────────
  return (
    <div className="releve-page">
      <div className="releve-header">
        <h1>
          <Icons.FileText />
          Relevé de compte
        </h1>
        <p>Saisissez un Code TIB ou TNB pour obtenir l'historique annuel complet du contribuable</p>
      </div>

      {/* ── Barre de recherche ── */}
      <div className="releve-card">
        <div className="releve-card-body">
          <div className="releve-search-row">
            <input
              type="text"
              className="releve-input"
              placeholder="Ex: TIB-2026-000123 ou AVIS-2020-000003"
              value={code}
              onChange={e => setCode(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && rechercher()}
            />
            <button className="btn-releve-search" onClick={rechercher} disabled={loading}>
              <Icons.Search />
              {loading ? 'Recherche...' : 'Rechercher'}
            </button>
          </div>
          {error && <p className="releve-error">{error}</p>}
        </div>
      </div>

      {releve && (
        <>
          {/* ── Informations du dossier ── */}
          <div className="releve-card">
            <div className="releve-card-body">
              <div className="releve-dossier-grid">
                <div>
                  <label>Type</label>
                  <span className={`type-badge type-badge-${releve.type?.toLowerCase()}`}>{releve.type}</span>
                </div>
                <div><label>Propriétaire</label><span>{releve.proprietaireNom}</span></div>
                <div><label>CIN</label><span>{releve.proprietaireCin}</span></div>
                <div><label>Bien</label><span>{releve.bienAdresse} ({releve.bienTypeBien})</span></div>
                <div><label>Rue</label><span>{releve.rueNom}</span></div>
                <div><label>Secteur</label><span>{releve.secteurNom}</span></div>
                <div><label>Municipalité</label><span>{releve.municipaliteNom}</span></div>
                <div><label>Début d'imposition</label><span>{releve.anneeDebutImposition}</span></div>
              </div>
            </div>
          </div>

          {/* ── Tableau des années ── */}
          <div className="releve-card">
            <div className="releve-card-header">
              <h3>Historique annuel</h3>
              {releve.annees && releve.annees.length > 0 && (
                <button className="btn-releve-pdf" onClick={handleExporterPDFGlobal} style={{ marginLeft: 'auto' }}>
                  <Icons.Download /> Récapitulatif global
                </button>
              )}
            </div>
            <div className="releve-card-body">
              <div className="table-wrapper">
                <table className="releve-table">
                  <thead>
                    <tr>
                      <th>Année</th>
                      <th>Montant à payer</th>
                      <th>Montant payé</th>
                      <th>Reste à payer</th>
                      <th>Statut</th>
                      <th>Quittance</th>
                    </tr>
                  </thead>
                  <tbody>
                    {releve.annees.map(a => (
                      <tr key={a.annee} className={a.statut === 'EN_RETARD' ? 'row-danger' : ''}>
                        <td><strong>{a.annee}</strong></td>
                        <td>{formatMontant(a.montantDu)}</td>
                        <td>{formatMontant(a.montantPaye)}</td>
                        <td>{formatMontant(a.montantRestant)}</td>
                        <td>{getStatutBadge(a.statut)}</td>
                        <td>
                          {a.quittanceDisponible ? (
                            <button className="btn-releve-link" onClick={() => voirQuittances(a)}>
                              <Icons.Eye /> Voir
                            </button>
                          ) : (
                            <button
                              className="btn-releve-payer"
                              onClick={() => ouvrirPayer(a)}
                              disabled={a.montantRestant <= 0.001}
                            >
                              <Icons.Coins /> Enregistrer paiement
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="releve-totaux-row">
                      <td>Total</td>
                      <td>{formatMontant(releve.totalDu)}</td>
                      <td>{formatMontant(releve.totalPaye)}</td>
                      <td>{formatMontant(releve.totalRestant)}</td>
                      <td colSpan={2}></td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          </div>
        </>
      )}

      {/* ── Modal de paiement ── */}
      {showPayerModal && anneeSelectionnee && (
        <div className="modal-overlay" onClick={fermerModalPaiement}>
          <div className="modal-content modal-small" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Paiement — Année {anneeSelectionnee.annee}</h2>
              <button className="modal-close" onClick={fermerModalPaiement}>
                <Icons.X />
              </button>
            </div>
            <div className="modal-body">
              <p className="modal-intro-text">
                Reste à payer : <strong>{formatMontant(anneeSelectionnee.montantRestant)}</strong>
                {anneeSelectionnee.projection && (
                  <span style={{ marginLeft: '8px', color: '#F59E0B', fontSize: '12px' }}>
                    (Année en projection – un avis sera généré automatiquement)
                  </span>
                )}
              </p>

              <label className="modal-label">Montant à encaisser (TND)</label>
              <input
                type="number"
                className="releve-input"
                value={montantPaiement}
                onChange={e => setMontantPaiement(e.target.value)}
                min="0.001"
                max={anneeSelectionnee.montantRestant}
                step="0.001"
                disabled={anneeSelectionnee.montantRestant <= 0.001}
              />

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
              <button className="btn-releve-secondary" onClick={fermerModalPaiement}>
                Annuler
              </button>
              <button
                className="btn-releve-confirm"
                onClick={confirmerPaiement}
                disabled={submitting || anneeSelectionnee.montantRestant <= 0.001}
              >
                {submitting ? 'Enregistrement...' : 'Confirmer le paiement'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal liste des quittances ── */}
      {showQuittancesModal && (
        <div className="modal-overlay" onClick={() => setShowQuittancesModal(false)}>
          <div className="modal-content modal-small" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Quittances</h2>
              <button className="modal-close" onClick={() => setShowQuittancesModal(false)}>
                <Icons.X />
              </button>
            </div>
            <div className="modal-body">
              <div className="table-wrapper">
                <table className="releve-table">
                  <thead>
                    <tr>
                      <th>N° Quittance</th>
                      <th>Montant</th>
                      <th>Date</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {quittancesAnnee.map(q => (
                      <tr key={q.numeroQuittance}>
                        <td>{q.numeroQuittance}</td>
                        <td>{formatMontant(q.montant)}</td>
                        <td>{formatDateTime(q.datePaiement)}</td>
                        <td>
                          <button className="btn-releve-link" onClick={() => choisirQuittance(q.numeroQuittance)}>
                            <Icons.Eye /> Voir
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal détail quittance ── */}
      {quittanceDetail && (
        <div className="modal-overlay" onClick={() => setQuittanceDetail(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            {/* Zone imprimable : tout sauf le footer des boutons */}
            <div ref={printRef} className="quittance-print-area">
              <div className="modal-header">
                <h2>
                  <Icons.Receipt /> Quittance {quittanceDetail.numeroQuittance}
                </h2>
                <button className="modal-close" onClick={() => setQuittanceDetail(null)}>
                  <Icons.X />
                </button>
              </div>
              <div className="modal-body">
                <div className="quittance-details">
                  <div className="quittance-top">
                    <div>
                      <span className="quittance-numero">{quittanceDetail.numeroQuittance}</span>
                      <span className="quittance-sub">Recette {quittanceDetail.codeRecette}</span>
                    </div>
                    <div className="quittance-montant-badge">{formatMontant(quittanceDetail.montant)}</div>
                  </div>

                  <div className="quittance-info-grid">
                    <div className="quittance-info-item"><label>Type de taxe</label><span>{quittanceDetail.typeLabel}</span></div>
                    <div className="quittance-info-item"><label>Année fiscale</label><span>{quittanceDetail.anneeFiscale}</span></div>
                    <div className="quittance-info-item"><label>Propriétaire</label><span>{quittanceDetail.proprietaireNom}</span></div>
                    <div className="quittance-info-item"><label>CIN</label><span>{quittanceDetail.proprietaireCin}</span></div>
                    <div className="quittance-info-item"><label>Adresse</label><span>{quittanceDetail.proprietaireAdresse}</span></div>
                    <div className="quittance-info-item"><label>Rue</label><span>{quittanceDetail.rueNom}</span></div>
                    <div className="quittance-info-item"><label>Secteur</label><span>{quittanceDetail.secteurNom}</span></div>
                    <div className="quittance-info-item"><label>Municipalité</label><span>{quittanceDetail.municipaliteNom}</span></div>
                    <div className="quittance-info-item"><label>Date de paiement</label><span>{formatDateTime(quittanceDetail.datePaiement)}</span></div>
                    <div className="quittance-info-item"><label>Mode de paiement</label><span>{quittanceDetail.modePaiementLabel}</span></div>
                    <div className="quittance-info-item"><label>Agent</label><span>{quittanceDetail.agentNom}</span></div>
                  </div>

                  <div className="quittance-cachet">
                    <span>Cachet et signature de la recette municipale</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer avec les boutons (non inclus dans le PDF) */}
            <div className="modal-footer">
              <button className="btn-releve-secondary" onClick={() => setQuittanceDetail(null)}>
                Fermer
              </button>
              <button className="btn-releve-print" onClick={handleImprimer}>
                <Icons.Printer /> Imprimer
              </button>
              <button className="btn-releve-pdf" onClick={handleExporterPDF}>
                <Icons.Download /> Télécharger PDF
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}