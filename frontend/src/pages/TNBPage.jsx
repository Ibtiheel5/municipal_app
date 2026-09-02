// TNBPage.jsx - Module TNB (Taxe sur les Terrains Non Bâtis)
// Version alignée sur les nouvelles routes backend dédiées /api/user/tnb-gestion/**
// (voir backend/controller/TNBGestionController.java du module TNB).
//
// Règles métier :
//   Méthode Valeur Vénale : Montant TNB = (VN × 3) / 1000
//   Méthode Densité       : Montant TNB = Prix densité × Surface du terrain
//     Densité élevée = 0.385 | Densité moyenne = 0.115 | Densité faible = 0.04
//   (valeurs stockées en base, gérées depuis TNBAdminPage.jsx > Paramètres TNB)
//
// ✅ AJOUT : Enregistrement d'un terrain non bâti pour un propriétaire
//    (Section 2), via UserService.ajouterTerrainTNB(proprietaireId, data)
//    -> POST /api/user/tnb-gestion/proprietaires/{proprietaireId}/terrains
//
import React, { useState, useEffect, useMemo, useRef } from 'react';
import UserService from '../services/userService';
import './TIBPage.css';
import './TNBPage.css';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

// ── SVG Icons ────────────────────────────────────────────────────────────
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
  Map: () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="1,6 1,22 8,18 16,22 23,18 23,2 16,6 8,2"/><line x1="8" y1="2" x2="8" y2="18"/><line x1="16" y1="6" x2="16" y2="22"/></svg>),
  Coins: () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="8" cy="8" r="6"/><path d="M18.09 10.37A6 6 0 1 1 10.34 18"/><path d="M7 6h1v4"/><path d="m16.71 13.88.7.71-2.82 2.82"/></svg>),
  Plus: () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>),
};

const SOURCES_DOSSIER = [
  { value: 'DECLARATION', label: 'Déclaration' },
  { value: 'RECENSEMENT', label: 'Recensement' },
  { value: 'CONTROLE', label: 'Contrôle' },
];

const METHODES = {
  VALEUR_VENALE: 'VALEUR_VENALE',
  DENSITE: 'DENSITE',
};

export default function TNBPage({ user, showMsg }) {
  // ── Référentiels ───────────────────────────────────────────────────────
  const [densites, setDensites] = useState([]); // [{id, categorie, prixDensite}]

  // ── Section 1 : informations administratives ─────────────────────────
  const [codeTnbApercu] = useState(() => 'TNB-' + new Date().getFullYear() + '-XXXXX (généré à la validation)');
  const [sourceDossier, setSourceDossier] = useState('DECLARATION');
  const [anneeFiscale, setAnneeFiscale] = useState(new Date().getFullYear());
  const [dateCreation] = useState(new Date().toISOString().slice(0, 10));
  const [dateDebutImposition, setDateDebutImposition] = useState(new Date().toISOString().slice(0, 10));

  // ── Section 2 : propriétaire / terrain ──────────────────────────────────
  const [searchCin, setSearchCin] = useState('');
  const [searchNom, setSearchNom] = useState('');
  const [proprietaires, setProprietaires] = useState([]);
  const [selectedProprietaire, setSelectedProprietaire] = useState(null);
  const [selectedTerrain, setSelectedTerrain] = useState(null);

  // ✅ AJOUT : État pour le formulaire d'enregistrement d'un terrain
  const [showAddTerrainModal, setShowAddTerrainModal] = useState(false);
  const [terrainForm, setTerrainForm] = useState({ reference: '', surface: '' });
  const [addingTerrain, setAddingTerrain] = useState(false);

  // ── Section 3 : calcul ──────────────────────────────────────────────────
  const [methode, setMethode] = useState(METHODES.VALEUR_VENALE);
  const [valeurVenale, setValeurVenale] = useState('');
  const [selectedDensiteId, setSelectedDensiteId] = useState('');

  // ── Section 4 : avis + historique ───────────────────────────────────────
  const [avisGeneres, setAvisGeneres] = useState([]);
  const [historique, setHistorique] = useState([]);
  const [rechercheAvis, setRechercheAvis] = useState('');
  const [filtreAnnee, setFiltreAnnee] = useState('');
  const [filtreStatut, setFiltreStatut] = useState('');
  const [filtreMethode, setFiltreMethode] = useState('');
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
        // ✅ CORRECTIF : ne plus avaler l'erreur silencieusement
        const densitesData = await UserService.getDensitesUrbaines();
        console.log('📊 Densités chargées:', densitesData);
        setDensites(densitesData || []);
        if (!densitesData || densitesData.length === 0) {
          showMsg('Aucune densité urbaine configurée. Ajoutez-en depuis Administration > Paramètres TNB.', 'error');
        }
        await chargerHistorique();
      } catch (error) {
        console.error('❌ Erreur chargement densités:', error);
        showMsg('Erreur lors du chargement des densités urbaines.', 'error');
      } finally {
        setLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const chargerHistorique = async (filters = {}) => {
    try {
      // ✅ route dédiée TNB : /api/user/tnb-gestion/avis/historique
      const data = await UserService.rechercherHistoriqueTNB(filters);
      setHistorique(data);
    } catch (error) {
      showMsg('Erreur lors du chargement de l\'historique TNB.', 'error');
    }
  };

  // ── Section 2 : recherche / sélection ────────────────────────────────────
  const rechercherProprietaires = async () => {
    if (!searchCin && !searchNom) {
      showMsg('Veuillez saisir un CIN ou un nom.', 'error');
      return;
    }
    try {
      setLoading(true);
      // ✅ route dédiée TNB : /api/user/tnb-gestion/proprietaires/recherche
      const data = await UserService.rechercherProprietairesTNB(searchCin, searchNom);
      setProprietaires(data);
      if (data.length === 0) showMsg('Aucun propriétaire trouvé.', 'info');
    } catch (error) {
      showMsg('Erreur lors de la recherche.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleProprietaireSelect = async (proprietaireId) => {
    if (!proprietaireId) {
      setSelectedProprietaire(null);
      setSelectedTerrain(null);
      setAvisGeneres([]);
      return;
    }
    try {
      setLoading(true);
      // ✅ route dédiée TNB : /api/user/tnb-gestion/proprietaire/{id} (inclut la liste des terrains)
      const data = await UserService.getProprietaireDetailsTNB(proprietaireId);
      setSelectedProprietaire(data);

      const avis = await UserService.getAvisByProprietaireTNB(proprietaireId);
      setAvisGeneres(avis);

      if (data.terrains && data.terrains.length > 0) {
        setSelectedTerrain(data.terrains[0]);
      } else {
        setSelectedTerrain(null);
      }
    } catch (error) {
      showMsg('Erreur lors du chargement des détails du propriétaire.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleTerrainSelect = (terrainId) => {
    const terrain = selectedProprietaire?.terrains?.find(t => t.id === terrainId);
    if (terrain) setSelectedTerrain(terrain);
  };

  // ✅ AJOUT : Enregistrer un nouveau terrain pour le propriétaire sélectionné
  const ouvrirModalAjoutTerrain = () => {
    if (!selectedProprietaire) {
      showMsg('Veuillez sélectionner un propriétaire avant d\'ajouter un terrain.', 'error');
      return;
    }
    setTerrainForm({ reference: '', surface: '' });
    setShowAddTerrainModal(true);
  };

  const handleAjouterTerrain = async () => {
    if (!terrainForm.reference.trim()) {
      showMsg('Veuillez indiquer une référence ou une adresse pour le terrain.', 'error');
      return;
    }
    if (!terrainForm.surface || parseFloat(terrainForm.surface) <= 0) {
      showMsg('Veuillez saisir une surface valide.', 'error');
      return;
    }

    setAddingTerrain(true);
    try {
      await UserService.ajouterTerrainTNB(selectedProprietaire.id, {
        reference: terrainForm.reference.trim(),
        surface: parseFloat(terrainForm.surface),
      });

      showMsg('Terrain enregistré avec succès !', 'success');
      setShowAddTerrainModal(false);
      setTerrainForm({ reference: '', surface: '' });

      // ✅ Recharger le propriétaire pour récupérer la liste de terrains à jour
      const data = await UserService.getProprietaireDetailsTNB(selectedProprietaire.id);
      setSelectedProprietaire(data);

      if (data.terrains && data.terrains.length > 0) {
        // Sélectionne automatiquement le dernier terrain ajouté
        setSelectedTerrain(data.terrains[data.terrains.length - 1]);
      }
    } catch (error) {
      const message = error.response?.data?.message || "Erreur lors de l'enregistrement du terrain.";
      showMsg(message, 'error');
    } finally {
      setAddingTerrain(false);
    }
  };

  // ── Section 3 : calcul en temps réel (100% côté client) ─────────────────
  const selectedDensite = useMemo(
    () => densites.find(d => d.id === parseInt(selectedDensiteId)) || null,
    [densites, selectedDensiteId]
  );

  // Pré-sélectionne automatiquement une catégorie de densité si le terrain
  // en a une déjà associée (renvoyée par le backend en tant que densiteId)
  useEffect(() => {
    if (selectedTerrain?.densiteId && densites.length > 0) {
      setSelectedDensiteId(selectedTerrain.densiteId.toString());
    } else {
      setSelectedDensiteId('');
    }
    setValeurVenale('');
  }, [selectedTerrain, densites]);

  const calcul = useMemo(() => {
    const vn = parseFloat(valeurVenale) || 0;
    const surface = selectedTerrain?.surface || 0;
    const prixDensite = selectedDensite?.prixDensite || 0;

    // Méthode 1 : Montant TNB = (VN × 3) / 1000
    const montantValeurVenale = (vn * 3) / 1000;
    // Méthode 2 : Montant TNB = Prix densité × Surface
    const montantDensite = prixDensite * surface;

    const montantTnb = methode === METHODES.VALEUR_VENALE ? montantValeurVenale : montantDensite;

    return {
      vn,
      surface,
      prixDensite,
      montantValeurVenale,
      montantDensite,
      montantTnb,
    };
  }, [methode, valeurVenale, selectedTerrain, selectedDensite]);

  // ── Section 1+3+4 : génération de l'avis ────────────────────────────────
  const handleGenererAvis = async () => {
    if (!selectedTerrain) { showMsg('Veuillez sélectionner un terrain.', 'error'); return; }
    if (methode === METHODES.VALEUR_VENALE && (!valeurVenale || parseFloat(valeurVenale) <= 0)) {
      showMsg('Veuillez saisir une valeur vénale valide.', 'error'); return;
    }
    if (methode === METHODES.DENSITE && !selectedDensiteId) {
      showMsg('Veuillez sélectionner une catégorie de densité.', 'error'); return;
    }
    if (!anneeFiscale) { showMsg('Veuillez indiquer l\'année fiscale.', 'error'); return; }
    if (!dateDebutImposition) { showMsg('Veuillez indiquer la date de début d\'imposition.', 'error'); return; }

    setGenerating(true);
    try {
      // ✅ route dédiée TNB : POST /api/user/tnb-gestion/generer-avis
      // Le montant est recalculé et vérifié côté serveur (voir TNBGestionService),
      // il n'a pas besoin d'être envoyé dans la requête.
      const data = await UserService.genererAvisTNB({
        sourceDossier,
        anneeFiscale: parseInt(anneeFiscale),
        dateDebutImposition,
        terrainId: selectedTerrain.id,
        methode,
        valeurVenale: methode === METHODES.VALEUR_VENALE ? parseFloat(valeurVenale) : null,
        densiteId: methode === METHODES.DENSITE ? parseInt(selectedDensiteId) : null,
        surface: selectedTerrain.surface,
        observations: 'Généré automatiquement',
      });

      showMsg('Avis TNB généré avec succès !', 'success');

      const avis = await UserService.getAvisByProprietaireTNB(selectedProprietaire.id);
      setAvisGeneres(avis);
      chargerHistorique(filtresActifs());

      setSelectedAvis(data);
      setShowAvisModal(true);
    } catch (error) {
      const message = error.response?.data?.message || 'Erreur lors de la génération de l\'avis.';
      showMsg(message, 'error');
    } finally {
      setGenerating(false);
    }
  };

  const handleMarquerPaye = async (avisId) => {
    if (!window.confirm('Confirmer le paiement de cet avis ?')) return;
    try {
      // ✅ route dédiée TNB : PUT /api/user/tnb-gestion/avis/{id}/payer
      await UserService.marquerAvisTNBPaye(avisId);
      showMsg('Avis marqué comme payé.', 'success');
      if (selectedProprietaire) {
        const avis = await UserService.getAvisByProprietaireTNB(selectedProprietaire.id);
        setAvisGeneres(avis);
      }
      chargerHistorique(filtresActifs());
    } catch (error) {
      showMsg('Erreur lors du marquage du paiement.', 'error');
    }
  };

  // ── Section 4 : filtres historique ──────────────────────────────────────
  const filtresActifs = () => ({
    recherche: rechercheAvis || undefined,
    annee: filtreAnnee || undefined,
    statut: filtreStatut || undefined,
    methode: filtreMethode || undefined,
  });

  const appliquerFiltres = () => {
    setPageHistorique(0);
    chargerHistorique(filtresActifs());
  };

  const reinitialiserFiltres = () => {
    setRechercheAvis(''); setFiltreAnnee(''); setFiltreStatut(''); setFiltreMethode('');
    setPageHistorique(0);
    chargerHistorique({});
  };

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
      pdf.save('Avis_TNB_' + (selectedAvis?.numeroAvis || selectedAvis?.codeTnb || '') + '.pdf');
      showMsg('PDF exporté avec succès !', 'success');
    } catch (error) {
      showMsg('Erreur lors de l\'export PDF.', 'error');
    }
  };

  // Export Excel (CSV compatible Excel) de l'historique affiché à l'écran
  const handleExporterExcel = () => {
    if (listeAffichee.length === 0) {
      showMsg('Aucune donnée à exporter.', 'info');
      return;
    }
    const entetes = ['Avis', 'Propriétaire', 'Méthode', 'Année', 'Montant TNB', 'Statut'];
    const lignes = listeAffichee.map(a => [
      a.numeroAvis || a.codeTnb || '',
      a.proprietaireNom || '',
      a.methode === METHODES.DENSITE ? 'Densité Urbaine' : 'Valeur Vénale',
      a.anneeFiscale ?? '',
      (a.montantTnb ?? 0).toFixed(3),
      a.statut || '',
    ]);
    const csv = [entetes, ...lignes]
      .map(ligne => ligne.map(champ => `"${String(champ).replace(/"/g, '""')}"`).join(';'))
      .join('\r\n');
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'Historique_TNB_' + new Date().toISOString().slice(0, 10) + '.csv';
    link.click();
    URL.revokeObjectURL(url);
    showMsg('Export Excel généré avec succès !', 'success');
  };

  // ── Helpers d'affichage ────────────────────────────────────────────────
  const getStatutBadge = (statut) => {
    const classes = { EN_ATTENTE: 'status-badge status-warning', PAYE: 'status-badge status-success', EN_RETARD: 'status-badge status-danger' };
    const labels = { EN_ATTENTE: 'En attente', PAYE: 'Payé', EN_RETARD: 'En retard' };
    return <span className={classes[statut] || 'status-badge'}>{labels[statut] || statut}</span>;
  };

  const getMethodeBadge = (m) => {
    if (m === METHODES.DENSITE) return <span className="methode-badge methode-densite">Densité Urbaine</span>;
    return <span className="methode-badge methode-vn">Valeur Vénale</span>;
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

  if (loading && densites.length === 0 && historique.length === 0) {
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
        <h1><Icons.Map /> Taxe sur les Terrains Non Bâtis (TNB)</h1>
        <p>Workflow administratif complet : dossier, terrain, calcul et avis de paiement</p>
      </div>

      {/* ══════════════ SECTION 1 — INFORMATIONS ADMINISTRATIVES ══════════════ */}
      <div className="tib-card tib-card-full">
        <div className="tib-card-header">
          <h3><Icons.FileText /> 1. Informations administratives</h3>
        </div>
        <div className="tib-card-body">
          <div className="calcul-grid">
            <div className="calcul-item">
              <label>Code TNB</label>
              <div className="date-display">{codeTnbApercu}</div>
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

      {/* ══════════════ SECTION 2 — INFORMATIONS DU TERRAIN ══════════════ */}
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
          {proprietaires.length > 0 && (
            <div className="calcul-item" style={{ marginTop: '1rem' }}>
              <label><Icons.User /> Propriétaire</label>
              <select className="tib-select" value={selectedProprietaire?.id || ''} onChange={e => handleProprietaireSelect(e.target.value ? parseInt(e.target.value) : '')}>
                <option value="">-- Sélectionnez un propriétaire --</option>
                {proprietaires.map(p => (
                  <option key={p.id} value={p.id}>{p.nom} {p.prenom} - {p.cin}</option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      <div className="tib-card tib-card-full">
        <div className="tib-card-header"><h3><Icons.Building /> 2. Informations du terrain</h3></div>
        <div className="tib-card-body">
          {!selectedProprietaire ? (
            <p className="no-data">Recherchez et sélectionnez un propriétaire ci-dessus.</p>
          ) : (
            <div className="info-grid">
              <div className="info-item"><label>Nom du propriétaire</label><span className="info-value">{selectedProprietaire.prenom} {selectedProprietaire.nom}</span></div>
              <div className="info-item"><label>CIN</label><span className="info-value">{selectedProprietaire.cin}</span></div>
              <div className="info-item"><label>Rue</label><span className="info-value">{selectedProprietaire.rueNom}</span></div>
              <div className="info-item"><label>Municipalité</label><span className="info-value">{selectedProprietaire.municipaliteNom}</span></div>
              <div className="info-item"><label>Secteur</label><span className="info-value">{selectedProprietaire.secteurNom}</span></div>
              <div className="info-item"><label>Adresse</label><span className="info-value">{selectedProprietaire.adresse}</span></div>

              {selectedProprietaire.terrains?.length > 0 ? (
                <>
                  <div className="info-item" style={{ gridColumn: '1 / -1' }}>
                    <label>Terrain concerné</label>
                    <select className="tib-select" value={selectedTerrain?.id || ''} onChange={e => handleTerrainSelect(parseInt(e.target.value))}>
                      {selectedProprietaire.terrains.map(t => (
                        <option key={t.id} value={t.id}>{t.adresse || t.reference} - {t.surface} m²</option>
                      ))}
                    </select>
                  </div>
                  {selectedTerrain && (
                    <div className="info-item"><label>Surface du terrain</label><span className="info-value">{selectedTerrain.surface} m²</span></div>
                  )}
                  {/* ✅ AJOUT : possibilité d'enregistrer un terrain supplémentaire */}
                  <div className="info-item" style={{ gridColumn: '1 / -1' }}>
                    <button className="btn-search" onClick={ouvrirModalAjoutTerrain}>
                      <Icons.Plus /> Enregistrer un autre terrain
                    </button>
                  </div>
                </>
              ) : (
                <div className="no-biens-message" style={{ gridColumn: '1 / -1' }}>
                  <Icons.Map />
                  <div className="no-biens-content">
                    <h4>Aucun terrain enregistré</h4>
                    <p>Ce propriétaire n'a pas encore de terrain non bâti enregistré.</p>
                    {/* ✅ AJOUT : bouton pour ouvrir le formulaire d'enregistrement */}
                    <button className="btn-search" style={{ marginTop: '.75rem' }} onClick={ouvrirModalAjoutTerrain}>
                      <Icons.Plus /> Enregistrer un terrain
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ══════════════ SECTION 3 — CALCUL TNB ══════════════ */}
      {selectedTerrain && (
        <div className="tib-card tib-card-full">
          <div className="tib-card-header"><h3><Icons.Calculator /> 3. Calcul TNB</h3></div>
          <div className="tib-card-body">

            {/* ── Sélecteur de méthode ── */}
            <div className="methode-radio-group">
              <label className={'methode-radio-option' + (methode === METHODES.VALEUR_VENALE ? ' active' : '')}>
                <input
                  type="radio"
                  name="methode-tnb"
                  checked={methode === METHODES.VALEUR_VENALE}
                  onChange={() => setMethode(METHODES.VALEUR_VENALE)}
                />
                <span className="methode-radio-label">
                  <strong><Icons.Coins /> Calcul par Valeur Vénale</strong>
                  <span>Montant TNB = (VN × 3) / 1000</span>
                </span>
              </label>
              <label className={'methode-radio-option' + (methode === METHODES.DENSITE ? ' active' : '')}>
                <input
                  type="radio"
                  name="methode-tnb"
                  checked={methode === METHODES.DENSITE}
                  onChange={() => setMethode(METHODES.DENSITE)}
                />
                <span className="methode-radio-label">
                  <strong><Icons.Layers /> Calcul par Densité Urbaine</strong>
                  <span>Montant TNB = Prix densité × Surface</span>
                </span>
              </label>
            </div>

            {/* ── Méthode 1 : Valeur Vénale ── */}
            {methode === METHODES.VALEUR_VENALE && (
              <>
                <div className="calcul-grid">
                  <div className="calcul-item">
                    <label><Icons.Coins /> Valeur Vénale (VN) — TND</label>
                    <input
                      type="number"
                      className="tib-input"
                      value={valeurVenale}
                      onChange={e => setValeurVenale(e.target.value)}
                      placeholder="Ex: 100000"
                      min="0"
                      step="0.001"
                    />
                  </div>
                  <div className="calcul-item">
                    <label>Montant TNB</label>
                    <div className="montant-display">{calcul.montantValeurVenale.toFixed(3)} TND</div>
                  </div>
                </div>
                <p className="formule-hint">
                  Montant TNB = (Valeur Vénale × 3) / 1000 &nbsp;|&nbsp; Exemple : VN = 100 000 TND → (100 000 × 3) / 1000 = 300 TND
                </p>
              </>
            )}

            {/* ── Méthode 2 : Densité Urbaine ── */}
            {methode === METHODES.DENSITE && (
              <>
                <div className="calcul-grid">
                  <div className="calcul-item">
                    <label><Icons.Layers /> Catégorie de densité</label>
                    <select className="tib-select" value={selectedDensiteId} onChange={e => setSelectedDensiteId(e.target.value)}>
                      <option value="">-- Sélectionnez une catégorie --</option>
                      {densites.map(d => (
                        <option key={d.id} value={d.id}>{d.categorie} ({d.prixDensite})</option>
                      ))}
                    </select>
                  </div>
                  <div className="calcul-item">
                    <label>Prix densité</label>
                    <div className="date-display">{calcul.prixDensite}</div>
                  </div>
                  <div className="calcul-item">
                    <label>Surface du terrain (m²)</label>
                    <div className="date-display">{calcul.surface}</div>
                  </div>
                  <div className="calcul-item">
                    <label>Montant TNB</label>
                    <div className="montant-display">{calcul.montantDensite.toFixed(3)} TND</div>
                  </div>
                </div>
                <p className="formule-hint">
                  Montant TNB = Prix densité × Surface du terrain &nbsp;|&nbsp; Exemple : Surface = 500 m², Densité élevée (0.385) → 0.385 × 500 = 192.500 TND
                </p>
              </>
            )}

            {/* ── Résultat final ── */}
            <div className="resultat-final-card" style={{ marginTop: '1.25rem' }}>
              <div className="resultat-final-methode">
                <label>Méthode utilisée</label>
                <span>{methode === METHODES.DENSITE ? 'Densité Urbaine' : 'Valeur Vénale'}</span>
              </div>
              <div className="resultat-final-montant">
                <label>Montant TNB</label>
                <div className="montant-value">{calcul.montantTnb.toFixed(3)} TND</div>
              </div>
            </div>

            <button
              className="btn-generer"
              onClick={handleGenererAvis}
              disabled={
                generating ||
                (methode === METHODES.VALEUR_VENALE && (!valeurVenale || parseFloat(valeurVenale) <= 0)) ||
                (methode === METHODES.DENSITE && !selectedDensiteId)
              }
            >
              {generating ? 'Génération...' : 'Générer l\'avis'}
            </button>
          </div>
        </div>
      )}

      {/* ══════════════ SECTION 4 — AVIS ET HISTORIQUE ══════════════ */}
      <div className="tib-card tib-card-full">
        <div className="tib-card-header">
          <h3><Icons.Clock /> 4. Avis et historique {selectedProprietaire ? '(propriétaire sélectionné)' : ''}<span className="badge-count">{listeAffichee.length}</span></h3>
        </div>
        <div className="tib-card-body">
          <div className="search-grid" style={{ marginBottom: '.75rem' }}>
            <div className="search-item">
              <label><Icons.Search /> Propriétaire ou N° avis</label>
              <input type="text" className="tib-input" value={rechercheAvis} onChange={e => setRechercheAvis(e.target.value)} placeholder="Nom, CIN ou N° avis" />
            </div>
            <div className="search-item">
              <label><Icons.Filter /> Année</label>
              <input type="number" className="tib-input" value={filtreAnnee} onChange={e => setFiltreAnnee(e.target.value)} placeholder="Ex: 2026" />
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
            <div className="search-item">
              <label>Méthode</label>
              <select className="tib-select" value={filtreMethode} onChange={e => setFiltreMethode(e.target.value)}>
                <option value="">Toutes les méthodes</option>
                <option value={METHODES.VALEUR_VENALE}>Valeur Vénale</option>
                <option value={METHODES.DENSITE}>Densité Urbaine</option>
              </select>
            </div>
          </div>
          <div className="search-grid" style={{ marginBottom: '1rem' }}>
            <div className="search-item search-actions">
              <button className="btn-search" onClick={appliquerFiltres}><Icons.Search /> Filtrer</button>
              <button className="btn-secondary" onClick={reinitialiserFiltres}>Réinitialiser</button>
            </div>
            <div className="search-item search-actions">
              <button className="btn-print" onClick={handleExporterExcel}><Icons.Download /> Export Excel</button>
            </div>
          </div>

          <div className="table-wrapper">
            <table className="avis-table">
              <thead>
                <tr>
                  <th>Avis</th>
                  <th>Propriétaire</th>
                  <th>Méthode</th>
                  <th>Année</th>
                  <th>Montant</th>
                  <th>Statut</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {listeAffecheePage.length === 0 ? (
                  <tr><td colSpan={7} className="no-data">Aucun avis trouvé.</td></tr>
                ) : listeAffecheePage.map(avis => (
                  <tr key={avis.id} className={avis.estEnRetard ? 'row-danger' : ''}>
                    <td><strong>{avis.numeroAvis || avis.codeTnb}</strong></td>
                    <td>{avis.proprietaireNom}</td>
                    <td>{getMethodeBadge(avis.methode)}</td>
                    <td>{avis.anneeFiscale}</td>
                    <td>{avis.montantTnb?.toFixed(3)} TND</td>
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

          {listeAffichee.length > TAILLE_PAGE_HISTORIQUE && (
            <div className="pagination">
              <button onClick={() => allerPageHistorique(pageHistorique - 1)} disabled={pageHistorique === 0}>Précédent</button>
              <span>Page {pageHistorique + 1} sur {totalPagesHistorique}</span>
              <button onClick={() => allerPageHistorique(pageHistorique + 1)} disabled={pageHistorique >= totalPagesHistorique - 1}>Suivant</button>
            </div>
          )}
        </div>
      </div>

      {/* ✅ AJOUT — MODAL ENREGISTRER UN TERRAIN */}
      {showAddTerrainModal && (
        <div className="modal-overlay" onClick={() => setShowAddTerrainModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Enregistrer un terrain</h2>
              <button className="modal-close" onClick={() => setShowAddTerrainModal(false)}><Icons.X /></button>
            </div>
            <div className="modal-body">
              <p className="dashboard-modal-info" style={{ marginBottom: '1rem' }}>
                Propriétaire : <strong>{selectedProprietaire?.prenom} {selectedProprietaire?.nom}</strong> ({selectedProprietaire?.cin})
              </p>
              <div className="calcul-grid" style={{ gridTemplateColumns: '1fr' }}>
                <div className="calcul-item">
                  <label>Référence / Adresse du terrain <span className="required">*</span></label>
                  <input
                    type="text"
                    className="tib-input"
                    value={terrainForm.reference}
                    onChange={e => setTerrainForm({ ...terrainForm, reference: e.target.value })}
                    placeholder="Ex: Lot n°12, Rue de la Liberté"
                    autoFocus
                  />
                </div>
                <div className="calcul-item">
                  <label>Surface (m²) <span className="required">*</span></label>
                  <input
                    type="number"
                    className="tib-input"
                    value={terrainForm.surface}
                    onChange={e => setTerrainForm({ ...terrainForm, surface: e.target.value })}
                    placeholder="Ex: 500"
                    min="0"
                    step="0.01"
                    onKeyDown={e => e.key === 'Enter' && handleAjouterTerrain()}
                  />
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setShowAddTerrainModal(false)}>Annuler</button>
              <button
                className="btn-generer"
                style={{ width: 'auto', marginTop: 0 }}
                onClick={handleAjouterTerrain}
                disabled={addingTerrain || !terrainForm.reference.trim() || !terrainForm.surface}
              >
                {addingTerrain ? 'Enregistrement...' : 'Enregistrer le terrain'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL DÉTAILS AVIS ── */}
      {showAvisModal && selectedAvis && (
        <div className="modal-overlay" onClick={() => setShowAvisModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} ref={printRef}>
            <div className="modal-header">
              <h2>Avis de paiement TNB</h2>
              <button className="modal-close" onClick={() => setShowAvisModal(false)}><Icons.X /></button>
            </div>
            <div className="modal-body">
              <div className="avis-details">
                <div className="avis-header">
                  <div className="avis-number">
                    <label>Numéro d'avis / Code TNB</label>
                    <span className="avis-number-value">{selectedAvis.numeroAvis || selectedAvis.codeTnb}</span>
                  </div>
                  <div className="avis-status">{getStatutBadge(selectedAvis.statut)}</div>
                </div>

                <div className="avis-info-grid">
                  <div className="avis-info-item"><label>Source du dossier</label><span>{selectedAvis.sourceDossierLabel}</span></div>
                  <div className="avis-info-item"><label>Année fiscale</label><span>{selectedAvis.anneeFiscale}</span></div>
                  <div className="avis-info-item"><label>Propriétaire</label><span>{selectedAvis.proprietaireNom}</span></div>
                  <div className="avis-info-item"><label>Terrain</label><span>{selectedAvis.terrainAdresse}</span></div>
                  <div className="avis-info-item"><label>Méthode</label><span>{getMethodeBadge(selectedAvis.methode)}</span></div>
                  <div className="avis-info-item"><label>Date de l'avis</label><span>{formatDate(selectedAvis.dateAvis)}</span></div>
                  <div className="avis-info-item"><label>Date limite</label><span className={selectedAvis.estEnRetard ? 'text-danger' : ''}>{formatDate(selectedAvis.dateLimite)}</span></div>
                  <div className="avis-info-item"><label>Jours restants</label><span className={selectedAvis.estEnRetard ? 'text-danger' : ''}>{getJoursRestantsText(selectedAvis.joursRestants)}</span></div>
                </div>

                <div className="avis-calcul">
                  {selectedAvis.methode === METHODES.DENSITE ? (
                    <>
                      <div className="avis-calcul-item"><label>Catégorie</label><span>{selectedAvis.densiteCategorie}</span></div>
                      <div className="avis-calcul-item"><label>Prix densité</label><span>{selectedAvis.prixDensite}</span></div>
                      <div className="avis-calcul-item"><label>Surface</label><span>{selectedAvis.surface} m²</span></div>
                    </>
                  ) : (
                    <div className="avis-calcul-item"><label>Valeur Vénale</label><span>{selectedAvis.valeurVenale?.toFixed(3)} TND</span></div>
                  )}
                  <div className="avis-calcul-item avis-montant"><label>Montant TNB</label><span>{selectedAvis.montantTnb?.toFixed(3)} TND</span></div>
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