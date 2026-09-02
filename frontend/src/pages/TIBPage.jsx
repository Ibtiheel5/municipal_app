// TIBPage.jsx - Workflow administratif complet (4 sections)
// ✅ CORRECTIF : Montant FNAT recalculé dynamiquement (et non "frais administratifs")
//    Ancienne formule : Taxe totale = Montant TIB + Frais administratifs (saisis manuellement)
//    Nouvelle formule : Montant TIB   = Prix de référence × Surface × 2% × Taux de la rue
//                        Montant FNAT = Prix de référence × Surface × 4%
//                        Taxe totale  = Montant TIB + Montant FNAT
import React, { useState, useEffect, useMemo, useRef } from 'react';
import UserService from '../services/userService';
import './TIBPage.css';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

// ── SVG Icons ─────────────────────────────────────────────────────────────
const Icons = {
  Road: () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>),
  Building: () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="2" width="16" height="20" rx="2"/><line x1="8" y1="6" x2="16" y2="6"/><line x1="8" y1="10" x2="16" y2="10"/><line x1="8" y1="14" x2="16" y2="14"/><line x1="8" y1="18" x2="12" y2="18"/></svg>),
  Calendar: () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>),
  Calculator: () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="2" width="16" height="20" rx="2"/><line x1="8" y1="6" x2="16" y2="6"/><line x1="8" y1="10" x2="16" y2="10"/><line x1="8" y1="14" x2="12" y2="14"/><line x1="8" y1="18" x2="12" y2="18"/></svg>),
  Download: () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7,10 12,15 17,10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>),
  Printer: () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6,9 6,2 18,2 18,9"/><path d="M18,9H6"/><rect x="6" y="14" width="12" height="8"/></svg>),
  Check: () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20,6 9,17 4,12"/></svg>),
  X: () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>),
  Clock: () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12,6 12,12 16,14"/></svg>),
  User: () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>),
  Search: () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>),
  FileText: () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14,2 14,8 20,8"/></svg>),
  Layers: () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12,2 2,7 12,12 22,7"/><polyline points="2,17 12,22 22,17"/><polyline points="2,12 12,17 22,12"/></svg>),
  Filter: () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="22,3 2,3 10,12.46 10,19 14,21 14,12.46"/></svg>),
};

const SOURCES_DOSSIER = [
  { value: 'DECLARATION', label: 'Déclaration' },
  { value: 'RECENSEMENT', label: 'Recensement' },
  { value: 'CONTROLE', label: 'Contrôle' },
  { value: 'AUTRE', label: 'Autre' },
];

export default function TIBPage({ user, showMsg }) {
  // ── Référentiels ───────────────────────────────────────────────────────
  const [rues, setRues] = useState([]);
  const [categories, setCategories] = useState([]);
  // ✅ CORRECTIF : ajout de tauxFNAT (ex: 0.04 = 4%) dans les paramètres.
  //    fraisAdministratifs (valeur fixe) n'est plus utilisé pour le calcul, gardé
  //    uniquement en repli si le back ne renvoie pas encore le nouveau champ.
  const [parametres, setParametres] = useState({
    fraisAdministratifs: 10,
    coefficientTIB: 0.02,
    tauxFNAT: 0.04,
    delaiPaiementJours: 30,
  });

  // ── Section 1 : informations administratives ─────────────────────────
  const [codeTibApercu] = useState(() => 'TIB-' + new Date().getFullYear() + '-XXXXX (généré à la validation)');
  const [sourceDossier, setSourceDossier] = useState('DECLARATION');
  const [anneeFiscale, setAnneeFiscale] = useState(new Date().getFullYear());
  const [dateCreation] = useState(new Date().toISOString().slice(0, 10));
  const [dateDebutImposition, setDateDebutImposition] = useState(new Date().toISOString().slice(0, 10));

  // ── Section 2 : bien immobilier ────────────────────────────────────────
  const [selectedRueId, setSelectedRueId] = useState('');
  const [rueEquipements, setRueEquipements] = useState(null);
  const [proprietaires, setProprietaires] = useState([]);
  const [selectedProprietaire, setSelectedProprietaire] = useState(null);
  const [selectedBien, setSelectedBien] = useState(null);
  const [searchCin, setSearchCin] = useState('');
  const [searchNom, setSearchNom] = useState('');

  // ── Section 3 : calcul ──────────────────────────────────────────────────
  const [selectedCategorieId, setSelectedCategorieId] = useState('');
  const [surface, setSurface] = useState('');
  // ❌ SUPPRIMÉ : fraisAdmin (saisie manuelle) — remplacé par un calcul automatique
  // const [fraisAdmin, setFraisAdmin] = useState('');

  // ── Section 4 : avis + historique ───────────────────────────────────────
  const [avisGeneres, setAvisGeneres] = useState([]);
  const [historique, setHistorique] = useState([]);
  const [filtreAnnee, setFiltreAnnee] = useState('');
  const [filtreRue, setFiltreRue] = useState('');
  const [filtreStatut, setFiltreStatut] = useState('');
  // Filtre par propriétaire (recherche CIN/Nom puis sélection)
  const [filtreProprietaireSearch, setFiltreProprietaireSearch] = useState('');
  const [filtreProprietaireResults, setFiltreProprietaireResults] = useState([]);
  const [filtreProprietaireId, setFiltreProprietaireId] = useState('');
  const [filtreProprietaireLabel, setFiltreProprietaireLabel] = useState('');
  // Pagination côté client du tableau historique
  const [pageHistorique, setPageHistorique] = useState(0);
  const TAILLE_PAGE_HISTORIQUE = 10;
  const [selectedAvis, setSelectedAvis] = useState(null);
  const [showAvisModal, setShowAvisModal] = useState(false);

  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const printRef = useRef(null);

  // ── Chargement initial ─────────────────────────────────────────────────
  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const [ruesData, categoriesData, parametresData] = await Promise.all([
          UserService.getRuesForTIBGestion(),
          UserService.getCategoriesTIB(),
          UserService.getParametresTIB().catch(() => null),
        ]);
        setRues(ruesData);
        setCategories(categoriesData);
        if (parametresData) {
          // ✅ CORRECTIF : fusion avec les valeurs par défaut pour garantir que
          // tauxFraisAdministratifs reste défini même si le backend ne le renvoie pas encore.
          setParametres(prev => ({ ...prev, ...parametresData }));
        }
        await chargerHistorique();
      } catch (error) {
        showMsg('Erreur lors du chargement des données TIB.', 'error');
      } finally {
        setLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const chargerHistorique = async (filters = {}) => {
    try {
      const data = await UserService.rechercherHistoriqueTIB(filters);
      setHistorique(data);
    } catch (error) {
      showMsg('Erreur lors du chargement de l\'historique.', 'error');
    }
  };

  // ── Section 2 : sélection rue / propriétaire / bien ─────────────────────
  const handleRueChange = async (e) => {
    const rueId = e.target.value;
    setSelectedRueId(rueId);
    setSelectedProprietaire(null);
    setSelectedBien(null);
    setAvisGeneres([]);
    setRueEquipements(null);
    setPageHistorique(0);

    if (!rueId) { setProprietaires([]); return; }

    try {
      setLoading(true);
      const [proprietairesData, tibInfo] = await Promise.all([
        UserService.getProprietairesByRue(rueId),
        UserService.getTIBInfo(rueId).catch(() => null),
      ]);
      setProprietaires(proprietairesData);
      if (tibInfo) setRueEquipements(tibInfo);
    } catch (error) {
      showMsg('Erreur lors du chargement des propriétaires.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleProprietaireSelect = async (proprietaireId) => {
    if (!proprietaireId) {
      setSelectedProprietaire(null);
      setSelectedBien(null);
      return;
    }
    try {
      setLoading(true);
      const data = await UserService.getProprietaireDetails(proprietaireId);
      setSelectedProprietaire(data);

      const avis = await UserService.getAvisByProprietaireTIB(proprietaireId);
      setAvisGeneres(avis);

      if (data.biens && data.biens.length > 0) {
        selectionnerBien(data.biens[0]);
      } else {
        setSelectedBien(null);
        setSurface('');
      }
    } catch (error) {
      showMsg('Erreur lors du chargement des détails du propriétaire.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const selectionnerBien = (bien) => {
    setSelectedBien(bien);
    setSurface(bien.superficie != null ? bien.superficie.toString() : '');
  };

  const handleBienSelect = (bienId) => {
    const bien = selectedProprietaire?.biens?.find(b => b.id === bienId);
    if (bien) selectionnerBien(bien);
  };

  const rechercherProprietaires = async () => {
    if (!searchCin && !searchNom) {
      showMsg('Veuillez saisir un CIN ou un nom.', 'error');
      return;
    }
    try {
      setLoading(true);
      const data = await UserService.rechercherProprietaires(searchCin, searchNom);
      setProprietaires(data);
      if (data.length === 0) showMsg('Aucun propriétaire trouvé.', 'info');
    } catch (error) {
      showMsg('Erreur lors de la recherche.', 'error');
    } finally {
      setLoading(false);
    }
  };

  // ── Section 3 : calcul en temps réel (100% côté client, formule officielle) ──
  const selectedCategorie = useMemo(
    () => categories.find(c => c.id === parseInt(selectedCategorieId)) || null,
    [categories, selectedCategorieId]
  );

  // ✅ CORRECTIF PRINCIPAL — nouvelle formule :
  //    Montant TIB   = Prix de référence × Surface × 2% (coefficient) × Taux de la rue
  //    Montant FNAT  = Prix de référence × Surface × 4% (tauxFNAT)
  //    Taxe totale   = Montant TIB + Montant FNAT
  const calcul = useMemo(() => {
    const prixReference = selectedCategorie?.prixReferenceM2 || 0;
    const surfaceNum = parseFloat(surface) || 0;
    const tauxRue = selectedBien?.tauxTIB ?? rueEquipements?.taux ?? 0;
    const coefficient = parametres.coefficientTIB ?? 0.02;
    const tauxFNAT = parametres.tauxFNAT ?? 0.04;

    const montantTib = prixReference * surfaceNum * coefficient * tauxRue;
    const montantFnat = prixReference * surfaceNum * tauxFNAT;
    const taxeTotale = montantTib + montantFnat;

    return {
      prixReference,
      surface: surfaceNum,
      tauxRue,
      coefficient,
      tauxFNAT,
      montantTib,
      montantFnat,
      taxeTotale,
    };
  }, [selectedCategorie, surface, selectedBien, rueEquipements, parametres]);

  // ── Section 1+3+4 : génération de l'avis ────────────────────────────────
  const handleGenererAvis = async () => {
    if (!selectedBien) { showMsg('Veuillez sélectionner un bien.', 'error'); return; }
    if (!selectedCategorieId) { showMsg('Veuillez sélectionner une catégorie TIB.', 'error'); return; }
    if (!surface || parseFloat(surface) <= 0) { showMsg('Veuillez saisir une surface valide.', 'error'); return; }
    if (!anneeFiscale) { showMsg('Veuillez indiquer l\'année fiscale.', 'error'); return; }
    if (!dateDebutImposition) { showMsg('Veuillez indiquer la date de début d\'imposition.', 'error'); return; }

    setGenerating(true);
    try {
      const data = await UserService.genererAvisTIB({
        sourceDossier,
        anneeFiscale: parseInt(anneeFiscale),
        dateDebutImposition,
        bienId: selectedBien.id,
        categorieId: parseInt(selectedCategorieId),
        surface: parseFloat(surface),
        // ✅ CORRECTIF : on envoie le montant FNAT calculé (Prix réf × Surface × 4%)
        // au lieu d'une valeur saisie manuellement ou d'un paramètre fixe.
        // NB : la clé API/colonne DB reste "fraisAdministratifs" (nom historique
        // en base) ; seul le libellé affiché à l'écran devient "Montant FNAT".
        fraisAdministratifs: calcul.montantFnat,
        observations: 'Généré automatiquement',
      });

      showMsg('Avis TIB généré avec succès !', 'success');

      const avis = await UserService.getAvisByProprietaireTIB(selectedProprietaire.id);
      setAvisGeneres(avis);
      chargerHistorique();

      setSelectedAvis(data);
      setShowAvisModal(true);
    } catch (error) {
      showMsg('Erreur lors de la génération de l\'avis.', 'error');
    } finally {
      setGenerating(false);
    }
  };

  const handleMarquerPaye = async (avisId) => {
    if (!window.confirm('Confirmer le paiement de cet avis ?')) return;
    try {
      await UserService.marquerAvisTIBPaye(avisId);
      showMsg('Avis marqué comme payé.', 'success');
      if (selectedProprietaire) {
        const avis = await UserService.getAvisByProprietaireTIB(selectedProprietaire.id);
        setAvisGeneres(avis);
      }
      chargerHistorique(filtresActifs());
    } catch (error) {
      showMsg('Erreur lors du marquage du paiement.', 'error');
    }
  };

  // ── Section 4 : filtres historique ──────────────────────────────────────
  const filtresActifs = () => ({
    annee: filtreAnnee || undefined,
    rueId: filtreRue || undefined,
    statut: filtreStatut || undefined,
    proprietaireId: filtreProprietaireId || undefined,
  });

  const appliquerFiltres = () => {
    setPageHistorique(0);
    chargerHistorique(filtresActifs());
  };

  const reinitialiserFiltres = () => {
    setFiltreAnnee(''); setFiltreRue(''); setFiltreStatut('');
    setFiltreProprietaireId(''); setFiltreProprietaireLabel(''); setFiltreProprietaireSearch(''); setFiltreProprietaireResults([]);
    setPageHistorique(0);
    chargerHistorique({});
  };

  // Recherche de propriétaire pour le filtre historique (par CIN ou Nom)
  const rechercherProprietaireFiltre = async () => {
    const q = filtreProprietaireSearch.trim();
    if (!q) { showMsg('Saisissez un CIN ou un nom.', 'error'); return; }
    try {
      // Si la saisie est numérique -> recherche par CIN, sinon par nom
      const estCin = /^\d+$/.test(q);
      const data = await UserService.rechercherProprietaires(estCin ? q : '', estCin ? '' : q);
      setFiltreProprietaireResults(data);
      if (data.length === 0) showMsg('Aucun propriétaire trouvé.', 'info');
    } catch (error) {
      showMsg('Erreur lors de la recherche du propriétaire.', 'error');
    }
  };

  const choisirProprietaireFiltre = (p) => {
    setFiltreProprietaireId(p.id);
    setFiltreProprietaireLabel(`${p.prenom} ${p.nom} (${p.cin})`);
    setFiltreProprietaireResults([]);
    setFiltreProprietaireSearch('');
    setPageHistorique(0);
  };

  const retirerFiltreProprietaire = () => {
    setFiltreProprietaireId('');
    setFiltreProprietaireLabel('');
    setPageHistorique(0);
    chargerHistorique({ ...filtresActifs(), proprietaireId: undefined });
  };

  // Liste affichée (avis du propriétaire sélectionné en section 2, ou historique global)
  // paginée côté client, 10 lignes par page.
  const listeAffichee = selectedProprietaire ? avisGeneres : historique;
  const totalPagesHistorique = Math.max(1, Math.ceil(listeAffichee.length / TAILLE_PAGE_HISTORIQUE));
  const listeAffecheePage = useMemo(() => {
    const start = pageHistorique * TAILLE_PAGE_HISTORIQUE;
    return listeAffichee.slice(start, start + TAILLE_PAGE_HISTORIQUE);
  }, [listeAffichee, pageHistorique]);

  const allerPageHistorique = (n) => {
    if (n >= 0 && n < totalPagesHistorique) setPageHistorique(n);
  };

  // ── Export / Impression ──────────────────────────────────────────────────
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
      pdf.save('Avis_TIB_' + (selectedAvis?.numeroAvis || selectedAvis?.codeTib || '') + '.pdf');
      showMsg('PDF exporté avec succès !', 'success');
    } catch (error) {
      showMsg('Erreur lors de l\'export PDF.', 'error');
    }
  };

  // ── Helpers d'affichage ────────────────────────────────────────────────
  const getStatutBadge = (statut) => {
    const classes = { EN_ATTENTE: 'status-badge status-warning', PAYE: 'status-badge status-success', EN_RETARD: 'status-badge status-danger' };
    const labels = { EN_ATTENTE: 'En attente', PAYE: 'Payé', EN_RETARD: 'En retard' };
    return <span className={classes[statut] || 'status-badge'}>{labels[statut] || statut}</span>;
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('fr-TN', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  const getJoursRestantsText = (j) => {
    if (j === null || j === undefined) return 'N/A';
    if (j < 0) return 'En retard de ' + Math.abs(j) + ' jours';
    if (j === 0) return 'Échéance aujourd\'hui';
    return j + ' jours restants';
  };

  if (loading && rues.length === 0) {
    return (
      <div className="tib-loading">
        <div className="tib-loading-spinner" />
        <span>Chargement des données...</span>
      </div>
    );
  }

  return (
    <div className="tib-page">
      <div className="tib-header">
        <h1><Icons.Calculator /> Taxe d'Infrastructure de Base (TIB)</h1>
        <p>Workflow administratif complet : dossier, bien, calcul et avis de paiement</p>
      </div>

      {/* ══════════════ SECTION 1 — INFORMATIONS ADMINISTRATIVES ══════════════ */}
      <div className="tib-card tib-card-full">
        <div className="tib-card-header">
          <h3><Icons.FileText /> 1. Informations administratives</h3>
        </div>
        <div className="tib-card-body">
          <div className="calcul-grid">
            <div className="calcul-item">
              <label>Code TIB</label>
              <div className="date-display">{codeTibApercu}</div>
            </div>
            <div className="calcul-item">
              <label>Source du dossier</label>
              <select className="tib-select" value={sourceDossier} onChange={e => setSourceDossier(e.target.value)}>
                {SOURCES_DOSSIER.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </div>
            <div className="calcul-item">
              <label>Année fiscale</label>
              <input type="number" className="tib-input" value={anneeFiscale} onChange={e => setAnneeFiscale(e.target.value)} min="2000" max="2100" />
            </div>
            <div className="calcul-item">
              <label>Date de création</label>
              <div className="date-display"><Icons.Calendar /> {formatDate(dateCreation)}</div>
            </div>
            <div className="calcul-item">
              <label>Date de début d'imposition</label>
              <input type="date" className="tib-input" value={dateDebutImposition} onChange={e => setDateDebutImposition(e.target.value)} />
            </div>
          </div>
        </div>
      </div>

      {/* ══════════════ SECTION 2 — BIEN IMMOBILIER ══════════════ */}
      <div className="tib-card tib-card-full">
        <div className="tib-card-header"><h3><Icons.Search /> Rechercher un propriétaire par CIN ou Nom</h3></div>
        <div className="tib-card-body">
          <div className="search-grid">
            <div className="search-item">
              <label>CIN</label>
              <input type="text" value={searchCin} onChange={e => setSearchCin(e.target.value)} placeholder="Ex: 12345678" className="tib-input" />
            </div>
            <div className="search-item">
              <label>Nom</label>
              <input type="text" value={searchNom} onChange={e => setSearchNom(e.target.value)} placeholder="Ex: Ben Ali" className="tib-input" />
            </div>
            <div className="search-item search-actions">
              <button className="btn-search" onClick={rechercherProprietaires}><Icons.Search /> Rechercher</button>
            </div>
          </div>
        </div>
      </div>

      <div className="tib-card tib-card-full">
        <div className="tib-card-header"><h3><Icons.Building /> 2. Informations du bien immobilier</h3></div>
        <div className="tib-card-body">
          <div className="calcul-grid" style={{ marginBottom: '1rem' }}>
            <div className="calcul-item">
              <label><Icons.Road /> Rue</label>
              <select className="tib-select" value={selectedRueId} onChange={handleRueChange}>
                <option value="">-- Sélectionnez une rue --</option>
                {rues.map(rue => (
                  <option key={rue.id} value={rue.id}>{rue.nom} - {rue.secteurNom} ({rue.nbProprietaires} propriétaire(s))</option>
                ))}
              </select>
            </div>
            {selectedRueId && (
              <div className="calcul-item">
                <label><Icons.User /> Propriétaire</label>
                <select className="tib-select" value={selectedProprietaire?.id || ''} onChange={e => handleProprietaireSelect(e.target.value ? parseInt(e.target.value) : '')}>
                  <option value="">-- Sélectionnez un propriétaire --</option>
                  {proprietaires.map(p => (
                    <option key={p.id} value={p.id}>{p.nom} {p.prenom} - {p.cin} ({p.nbBiens} bien(s))</option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {selectedProprietaire && (
            <div className="info-grid">
              <div className="info-item"><label>Nom et prénom</label><span className="info-value">{selectedProprietaire.prenom} {selectedProprietaire.nom}</span></div>
              <div className="info-item"><label>CIN</label><span className="info-value">{selectedProprietaire.cin}</span></div>
              <div className="info-item"><label>Adresse complète</label><span className="info-value">{selectedProprietaire.adresse}</span></div>
              <div className="info-item"><label>Municipalité</label><span className="info-value">{selectedProprietaire.municipaliteNom}</span></div>
              <div className="info-item"><label>Secteur</label><span className="info-value">{selectedProprietaire.secteurNom}</span></div>
              <div className="info-item"><label>Équipements de la rue</label>
                <span className="info-value">
                  {rueEquipements?.eclairagePublic && '💡 '}
                  {rueEquipements?.eauPotable && '💧 '}
                  {rueEquipements?.assainissement && '🚰 '}
                  {rueEquipements?.electricite && '⚡ '}
                  {!rueEquipements?.eclairagePublic && !rueEquipements?.eauPotable && !rueEquipements?.assainissement && !rueEquipements?.electricite && 'Aucun'}
                </span>
              </div>

              {selectedProprietaire.biens?.length > 0 && (
                <div className="info-item" style={{ gridColumn: '1 / -1' }}>
                  <label>Bien concerné</label>
                  <select className="tib-select" value={selectedBien?.id || ''} onChange={e => handleBienSelect(parseInt(e.target.value))}>
                    {selectedProprietaire.biens.map(b => (
                      <option key={b.id} value={b.id}>{b.adresse} - {b.typeBien} ({b.superficie} m²)</option>
                    ))}
                  </select>
                </div>
              )}
              {selectedBien && (
                <>
                  <div className="info-item"><label>Type de bien</label><span className="info-value">{selectedBien.typeBien}</span></div>
                  <div className="info-item"><label>Surface construite</label><span className="info-value">{selectedBien.superficie} m²</span></div>
                  <div className="info-item"><label>Taux TIB de la rue</label><span className="info-value tib-taux">{((selectedBien.tauxTIB || 0) * 100).toFixed(0)}%</span></div>
                </>
              )}

              {(!selectedProprietaire.biens || selectedProprietaire.biens.length === 0) && (
                <div className="no-biens-message" style={{ gridColumn: '1 / -1' }}>
                  <Icons.Building />
                  <div className="no-biens-content">
                    <h4>Aucun bien enregistré</h4>
                    <p>Ce propriétaire n'a pas encore de bien immobilier enregistré.</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ══════════════ SECTION 3 — CALCUL DE LA TIB ══════════════ */}
      {selectedBien && (
        <div className="tib-card tib-card-full">
          <div className="tib-card-header"><h3><Icons.Calculator /> 3. Calcul de la TIB</h3></div>
          <div className="tib-card-body">
            <div className="calcul-grid">
              <div className="calcul-item">
                <label><Icons.Layers /> Catégorie TIB</label>
                <select className="tib-select" value={selectedCategorieId} onChange={e => setSelectedCategorieId(e.target.value)}>
                  <option value="">-- Sélectionnez une catégorie --</option>
                  {categories.map(c => (
                    <option key={c.id} value={c.id}>{c.libelle} ({c.prixReferenceM2} TND/m²)</option>
                  ))}
                </select>
              </div>
              <div className="calcul-item">
                <label>Prix de référence (TND/m²)</label>
                <div className="date-display">{calcul.prixReference.toFixed(3)}</div>
              </div>
              <div className="calcul-item">
                <label>Surface construite (m²)</label>
                <input type="number" className="tib-input" value={surface} onChange={e => setSurface(e.target.value)} placeholder="Ex: 150" min="0" step="0.01" />
              </div>
              <div className="calcul-item">
                <label>Taux de la rue</label>
                <div className="taux-display">{(calcul.tauxRue * 100).toFixed(0)}%</div>
              </div>
              <div className="calcul-item">
                <label>Coefficient légal (TIB)</label>
                <div className="date-display">{(calcul.coefficient * 100).toFixed(0)}%</div>
              </div>
              {/* ✅ CORRECTIF : remplace l'input manuel par un affichage
                  du taux FNAT appliqué (4%), puisque le montant est désormais calculé */}
              <div className="calcul-item">
                <label>Taux FNAT</label>
                <div className="date-display">{(calcul.tauxFNAT * 100).toFixed(0)}%</div>
              </div>
            </div>

            <p className="formule-hint">
              Montant TIB = Prix de référence × Surface × {(calcul.coefficient * 100).toFixed(0)}% × Taux rue
              &nbsp;|&nbsp; Montant FNAT = Prix de référence × Surface × {(calcul.tauxFNAT * 100).toFixed(0)}%
              &nbsp;|&nbsp; Taxe totale = Montant TIB + Montant FNAT
            </p>

            <div className="calcul-grid" style={{ marginTop: '.75rem' }}>
              <div className="calcul-item">
                <label>Montant TIB</label>
                <div className="montant-display">{calcul.montantTib.toFixed(3)} TND</div>
              </div>
              <div className="calcul-item">
                <label>Montant FNAT</label>
                <div className="montant-display">{calcul.montantFnat.toFixed(3)} TND</div>
              </div>
              <div className="calcul-item">
                <label>Taxe totale</label>
                <div className="montant-display montant-total">{calcul.taxeTotale.toFixed(3)} TND</div>
              </div>
            </div>

            <button className="btn-generer" onClick={handleGenererAvis} disabled={generating || !surface || parseFloat(surface) <= 0 || !selectedCategorieId}>
              {generating ? 'Génération...' : 'Générer l\'avis'}
            </button>
          </div>
        </div>
      )}

      {/* ══════════════ SECTION 4 — AVIS ET HISTORIQUE ══════════════ */}
      <div className="tib-card tib-card-full">
        <div className="tib-card-header"><h3><Icons.Clock /> 4. Avis et historique {selectedProprietaire ? '(propriétaire sélectionné)' : ''}<span className="badge-count">{listeAffichee.length}</span></h3></div>
        <div className="tib-card-body">
          <div className="search-grid" style={{ marginBottom: '.75rem' }}>
            <div className="search-item">
              <label><Icons.Filter /> Année</label>
              <input type="number" className="tib-input" value={filtreAnnee} onChange={e => setFiltreAnnee(e.target.value)} placeholder="Ex: 2026" />
            </div>
            <div className="search-item">
              <label>Rue</label>
              <select className="tib-select" value={filtreRue} onChange={e => setFiltreRue(e.target.value)}>
                <option value="">Toutes les rues</option>
                {rues.map(r => <option key={r.id} value={r.id}>{r.nom}</option>)}
              </select>
            </div>
            <div className="search-item">
              <label>Statut</label>
              <select className="tib-select" value={filtreStatut} onChange={e => setFiltreStatut(e.target.value)}>
                <option value="">Tous les statuts</option>
                <option value="EN_ATTENTE">En attente</option>
                <option value="PAYE">Payé</option>
                <option value="EN_RETARD">En retard</option>
              </select>
            </div>
            <div className="search-item search-actions">
              <button className="btn-search" onClick={appliquerFiltres}><Icons.Search /> Filtrer</button>
              <button className="btn-secondary" onClick={reinitialiserFiltres}>Réinitialiser</button>
            </div>
          </div>

          {/* Filtre Propriétaire (recherche CIN/Nom, ne s'applique que sur l'historique global) */}
          <div className="search-grid" style={{ marginBottom: '1rem' }}>
            <div className="search-item" style={{ gridColumn: 'span 2' }}>
              <label><Icons.User /> Propriétaire</label>
              {filtreProprietaireLabel ? (
                <div className="date-display" style={{ justifyContent: 'space-between' }}>
                  <span>{filtreProprietaireLabel}</span>
                  <button type="button" className="btn-secondary" style={{ height: '24px', padding: '0 10px' }} onClick={retirerFiltreProprietaire}>✕</button>
                </div>
              ) : (
                <input
                  type="text"
                  className="tib-input"
                  value={filtreProprietaireSearch}
                  onChange={e => setFiltreProprietaireSearch(e.target.value)}
                  placeholder="CIN ou nom du propriétaire"
                  onKeyDown={e => e.key === 'Enter' && rechercherProprietaireFiltre()}
                />
              )}
            </div>
            {!filtreProprietaireLabel && (
              <div className="search-item search-actions">
                <button className="btn-search" onClick={rechercherProprietaireFiltre}><Icons.Search /> Chercher</button>
              </div>
            )}
          </div>
          {filtreProprietaireResults.length > 0 && (
            <div className="table-wrapper" style={{ marginBottom: '1rem' }}>
              <table className="avis-table">
                <thead><tr><th>CIN</th><th>Nom</th><th>Prénom</th><th></th></tr></thead>
                <tbody>
                  {filtreProprietaireResults.map(p => (
                    <tr key={p.id}>
                      <td>{p.cin}</td><td>{p.nom}</td><td>{p.prenom}</td>
                      <td><button className="btn-view" onClick={() => choisirProprietaireFiltre(p)}>Choisir</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div className="table-wrapper">
            <table className="avis-table">
              <thead>
                <tr>
                  <th>N° Avis / Code TIB</th>
                  <th>Année fiscale</th>
                  <th>Rue</th>
                  <th>Propriétaire</th>
                  <th>Montant</th>
                  <th>Date</th>
                  <th>Statut</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {listeAffecheePage.length === 0 ? (
                  <tr><td colSpan={8} className="no-data">Aucun avis trouvé.</td></tr>
                ) : listeAffecheePage.map(avis => (
                  <tr key={avis.id} className={avis.estEnRetard ? 'row-danger' : ''}>
                    <td><strong>{avis.numeroAvis || avis.codeTib}</strong></td>
                    <td>{avis.anneeFiscale}</td>
                    <td>{avis.rueNom}</td>
                    <td>{avis.proprietaireNom}</td>
                    <td>{avis.taxeTotale?.toFixed(3)} TND</td>
                    <td>{formatDate(avis.dateAvis)}</td>
                    <td>{getStatutBadge(avis.statut)}</td>
                    <td>
                      <div className="action-buttons">
                        {avis.statut === 'EN_ATTENTE' && (
                          <button className="btn-payer" onClick={() => handleMarquerPaye(avis.id)} title="Marquer comme payé"><Icons.Check /></button>
                        )}
                        <button className="btn-view" onClick={() => { setSelectedAvis(avis); setShowAvisModal(true); }} title="Voir détails"><Icons.Search /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {listeAffichee.length > TAILLE_PAGE_HISTORIQUE && (
            <div className="pagination">
              <button onClick={() => allerPageHistorique(pageHistorique - 1)} disabled={pageHistorique === 0}>Précédent</button>
              <span>Page {pageHistorique + 1} sur {totalPagesHistorique}</span>
              <button onClick={() => allerPageHistorique(pageHistorique + 1)} disabled={pageHistorique >= totalPagesHistorique - 1}>Suivant</button>
            </div>
          )}
        </div>
      </div>


      {/* ── MODAL DÉTAILS AVIS ── */}
      {showAvisModal && selectedAvis && (
        <div className="modal-overlay" onClick={() => setShowAvisModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} ref={printRef}>
            <div className="modal-header">
              <h2>Avis de paiement TIB</h2>
              <button className="modal-close" onClick={() => setShowAvisModal(false)}><Icons.X /></button>
            </div>
            <div className="modal-body">
              <div className="avis-details">
                <div className="avis-header">
                  <div className="avis-number">
                    <label>Numéro d'avis / Code TIB</label>
                    <span className="avis-number-value">{selectedAvis.numeroAvis || selectedAvis.codeTib}</span>
                  </div>
                  <div className="avis-status">{getStatutBadge(selectedAvis.statut)}</div>
                </div>

                <div className="avis-info-grid">
                  <div className="avis-info-item"><label>Source du dossier</label><span>{selectedAvis.sourceDossierLabel}</span></div>
                  <div className="avis-info-item"><label>Année fiscale</label><span>{selectedAvis.anneeFiscale}</span></div>
                  <div className="avis-info-item"><label>Propriétaire</label><span>{selectedAvis.proprietaireNom}</span></div>
                  <div className="avis-info-item"><label>Bien</label><span>{selectedAvis.bienAdresse}</span></div>
                  <div className="avis-info-item"><label>Rue</label><span>{selectedAvis.rueNom}</span></div>
                  <div className="avis-info-item"><label>Date de l'avis</label><span>{formatDate(selectedAvis.dateAvis)}</span></div>
                  <div className="avis-info-item"><label>Date limite</label><span className={selectedAvis.estEnRetard ? 'text-danger' : ''}>{formatDate(selectedAvis.dateLimite)}</span></div>
                  <div className="avis-info-item"><label>Jours restants</label><span className={selectedAvis.estEnRetard ? 'text-danger' : ''}>{getJoursRestantsText(selectedAvis.joursRestants)}</span></div>
                </div>

                <div className="avis-calcul">
                  <div className="avis-calcul-item"><label>Catégorie</label><span>{selectedAvis.categorieLibelle}</span></div>
                  <div className="avis-calcul-item"><label>Surface</label><span>{selectedAvis.surface} m²</span></div>
                  <div className="avis-calcul-item"><label>Montant TIB</label><span>{selectedAvis.montantTib?.toFixed(3)} TND</span></div>
                  <div className="avis-calcul-item"><label>Montant FNAT</label><span>{selectedAvis.fraisAdministratifs?.toFixed(3)} TND</span></div>
                  <div className="avis-calcul-item avis-montant"><label>Taxe totale</label><span>{selectedAvis.taxeTotale?.toFixed(3)} TND</span></div>
                </div>

                {selectedAvis.observations && (
                  <div className="avis-observations"><label>Observations</label><p>{selectedAvis.observations}</p></div>
                )}
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setShowAvisModal(false)}>Fermer</button>
              <button className="btn-print" onClick={handleImprimer}><Icons.Printer /> Imprimer</button>
              <button className="btn-pdf" onClick={handleExporterPDF}><Icons.Download /> Télécharger PDF</button>
              {selectedAvis.statut === 'EN_ATTENTE' && (
                <button className="btn-payer" onClick={() => { handleMarquerPaye(selectedAvis.id); setShowAvisModal(false); }}>
                  <Icons.Check /> Marquer comme payé
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}