// RoutesPage.jsx - Version complète corrigée
import React, { useState, useEffect } from 'react';
import UserService from '../services/userService';
import './DashboardUser.css';

// ── SVG Icons ─────────────────────────────────────────────────────────────────
const Icons = {
  Road: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="3" y1="12" x2="21" y2="12"/>
      <line x1="3" y1="6" x2="21" y2="6"/>
      <line x1="3" y1="18" x2="21" y2="18"/>
    </svg>
  ),
  Secteur: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
      <circle cx="12" cy="10" r="3"/>
    </svg>
  ),
  Map: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="1,6 1,22 8,18 16,22 23,18 23,2 16,6 8,2 1,6"/>
      <line x1="8" y1="2" x2="8" y2="18"/>
      <line x1="16" y1="6" x2="16" y2="22"/>
    </svg>
  ),
  StreetView: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/>
      <circle cx="12" cy="12" r="3"/>
      <line x1="12" y1="2" x2="12" y2="9"/>
      <line x1="12" y1="15" x2="12" y2="22"/>
      <line x1="2" y1="12" x2="9" y2="12"/>
      <line x1="15" y1="12" x2="22" y2="12"/>
    </svg>
  ),
  Edit: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
    </svg>
  ),
  Delete: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3,6 5,6 21,6"/>
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
    </svg>
  ),
  Plus: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="5" x2="12" y2="19"/>
      <line x1="5" y1="12" x2="19" y2="12"/>
    </svg>
  ),
  Close: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18"/>
      <line x1="6" y1="6" x2="18" y2="18"/>
    </svg>
  ),
  Search: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8"/>
      <line x1="21" y1="21" x2="16.65" y2="16.65"/>
    </svg>
  ),
  Check: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20,6 9,17 4,12"/>
    </svg>
  ),
  Lightbulb: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 1 1 7.072 0l-.548.547A3.374 3.374 0 0 0 14 18.469V19a2 2 0 1 1-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/>
    </svg>
  ),
  Water: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2v4M12 22v-4M4 8l2 2M20 8l-2 2M4 16l2-2M20 16l-2-2"/>
      <circle cx="12" cy="12" r="8"/>
    </svg>
  ),
  Zap: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="13,2 3,14 12,14 11,22 21,10 12,10"/>
    </svg>
  ),
  Droplet: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/>
    </svg>
  ),
  Trash2: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3,6 5,6 21,6"/>
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
    </svg>
  ),
  Percent: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="19" y1="5" x2="5" y2="19"/>
      <circle cx="6.5" cy="6.5" r="2.5"/>
      <circle cx="17.5" cy="17.5" r="2.5"/>
    </svg>
  ),
  PlusCircle: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/>
      <line x1="12" y1="8" x2="12" y2="16"/>
      <line x1="8" y1="12" x2="16" y2="12"/>
    </svg>
  ),
  GripVertical: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="8" y1="6" x2="16" y2="6"/>
      <line x1="8" y1="12" x2="16" y2="12"/>
      <line x1="8" y1="18" x2="16" y2="18"/>
    </svg>
  ),
  Filter: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="22,3 2,3 10,13 10,21 14,18 14,13 22,3"/>
    </svg>
  ),
};

// ── Composant Critère avec Drag & Drop ─────────────────────────────────────
const CritereItem = ({ id, label, icon, checked, onToggle, onDragStart, onDragEnd, onDragOver, onDrop, isDragging }) => {
  const handleToggle = (e) => {
    e.stopPropagation();
    onToggle(id);
  };

  return (
    <div
      className={`critere-item ${checked ? 'checked' : ''} ${isDragging ? 'dragging' : ''}`}
      draggable
      onDragStart={(e) => onDragStart(e, id)}
      onDragEnd={onDragEnd}
      onDragOver={onDragOver}
      onDrop={(e) => onDrop(e, id)}
      onClick={handleToggle}
    >
      <div className="critere-grip" onMouseDown={(e) => e.stopPropagation()}>
        <Icons.GripVertical />
      </div>
      <div className="critere-content">
        <div className="critere-icon">{icon}</div>
        <span className="critere-label">{label}</span>
        {checked && (
          <div className="critere-check">
            <Icons.Check />
          </div>
        )}
      </div>
    </div>
  );
};

export default function RoutesPage({ municipalite, onRefresh, showMsg }) {
  // ✅ Logs pour déboguer
  console.log('🛣️ RoutesPage - municipalite reçue:', municipalite);

  const [selectedSecteur, setSelectedSecteur] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [addLoading, setAddLoading] = useState(false);
  const [editRue, setEditRue] = useState(null);
  const [editLoading, setEditLoading] = useState(false);
  const [dragIndex, setDragIndex] = useState(null);
  const [dragOverIndex, setDragOverIndex] = useState(null);
  const [secteurs, setSecteurs] = useState([]);

  // ✅ Mettre à jour l'état local quand municipalite change
  useEffect(() => {
    if (municipalite && municipalite.secteurs) {
      console.log(`🛣️ RoutesPage - ${municipalite.secteurs.length} secteurs disponibles`);
      setSecteurs(municipalite.secteurs);
    } else {
      setSecteurs([]);
    }
  }, [municipalite]);

  // Définition des critères
  const criteres = [
    { id: 'eclairagePublic', label: 'Éclairage public', icon: <Icons.Lightbulb /> },
    { id: 'assainissement', label: 'Assainissement (ONAS)', icon: <Icons.Water /> },
    { id: 'eauPotable', label: 'Eau potable (SONEDE)', icon: <Icons.Droplet /> },
    { id: 'electricite', label: 'Réseau électrique (STEG)', icon: <Icons.Zap /> },
    { id: 'voirie', label: 'Voirie', icon: <Icons.Road /> },
    { id: 'proprete', label: 'Propreté', icon: <Icons.Trash2 /> },
    { id: 'autreCritere', label: 'Autre', icon: <Icons.PlusCircle /> },
  ];

  // Ordre des critères
  const [criteresOrder, setCriteresOrder] = useState(criteres.map(c => c.id));

  // ✅ Formulaire pour ajouter une rue - TOUS LES CRITERES A false
  const [formData, setFormData] = useState({
    nom: '',
    etat: 'BONNE',
    eclairagePublic: false,
    assainissement: false,
    eauPotable: false,
    electricite: false,
    voirie: false,
    proprete: false,
    autreCritere: false,
    autreCritereDetails: '',
    observations: '',
    priorite: 1,
    taux: 0,
    nbCriteresCoches: 0
  });

  // ✅ Formulaire pour modifier une rue
  const [editFormData, setEditFormData] = useState({
    nom: '',
    etat: 'BONNE',
    eclairagePublic: false,
    assainissement: false,
    eauPotable: false,
    electricite: false,
    voirie: false,
    proprete: false,
    autreCritere: false,
    autreCritereDetails: '',
    observations: '',
    priorite: 1,
    taux: 0,
    nbCriteresCoches: 0
  });

  const etatOptions = [
    { value: 'BONNE', label: 'Bonne', color: '#22C55E' },
    { value: 'MOYENNE', label: 'Moyenne', color: '#F59E0B' },
    { value: 'DEGRADEE', label: 'Dégradée', color: '#EF4444' }
  ];

  // Fonction pour compter les critères cochés
  const compterCriteresCoches = (data) => {
    let count = 0;
    if (data.eclairagePublic === true) count++;
    if (data.assainissement === true) count++;
    if (data.eauPotable === true) count++;
    if (data.electricite === true) count++;
    if (data.voirie === true) count++;
    if (data.proprete === true) count++;
    if (data.autreCritere === true) count++;
    return count;
  };

  // Fonction pour calculer le taux
  const calculerTaux = (nbCriteres) => {
    if (nbCriteres === 0) return 0;
    if (nbCriteres <= 2) return 0.08;
    if (nbCriteres <= 4) return 0.10;
    if (nbCriteres <= 6) return 0.12;
    return 0.14;
  };

  // Mettre à jour le taux et le compteur
  const updateTauxEtCompteur = (data, setData) => {
    const nbCriteres = compterCriteresCoches(data);
    const taux = calculerTaux(nbCriteres);
    setData(prev => ({
      ...prev,
      nbCriteresCoches: nbCriteres,
      taux: taux
    }));
  };

  // ✅ Réinitialiser le formulaire d'ajout
  const resetAddForm = () => {
    setFormData({
      nom: '',
      etat: 'BONNE',
      eclairagePublic: false,
      assainissement: false,
      eauPotable: false,
      electricite: false,
      voirie: false,
      proprete: false,
      autreCritere: false,
      autreCritereDetails: '',
      observations: '',
      priorite: 1,
      taux: 0,
      nbCriteresCoches: 0
    });
  };

  // ✅ Ouvrir le modal d'ajout
  const openAddModal = () => {
    if (!selectedSecteur) {
      showMsg('Veuillez sélectionner un secteur d\'abord.', 'error');
      return;
    }
    resetAddForm();
    setShowAddModal(true);
  };

  // Gestionnaire de changement pour le formulaire d'ajout
  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;

    let newData;
    if (type === 'checkbox') {
      newData = { ...formData, [name]: checked };
    } else {
      newData = { ...formData, [name]: value };
    }

    setFormData(newData);
    if (type === 'checkbox') {
      updateTauxEtCompteur(newData, setFormData);
    }
  };

  // Gestionnaire de changement pour le formulaire d'édition
  const handleEditFormChange = (e) => {
    const { name, value, type, checked } = e.target;

    let newData;
    if (type === 'checkbox') {
      newData = { ...editFormData, [name]: checked };
    } else {
      newData = { ...editFormData, [name]: value };
    }

    setEditFormData(newData);
    if (type === 'checkbox') {
      updateTauxEtCompteur(newData, setEditFormData);
    }
  };

  // ── Drag & Drop Handlers ─────────────────────────────────────────────────
  const handleDragStart = (e, id) => {
    setDragIndex(id);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', id);
  };

  const handleDragEnd = () => {
    setDragIndex(null);
    setDragOverIndex(null);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e, targetId) => {
    e.preventDefault();
    const sourceId = e.dataTransfer.getData('text/plain');

    if (sourceId === targetId) return;

    const newOrder = [...criteresOrder];
    const sourceIndex = newOrder.indexOf(sourceId);
    const targetIndex = newOrder.indexOf(targetId);

    if (sourceIndex === -1 || targetIndex === -1) return;

    newOrder.splice(sourceIndex, 1);
    newOrder.splice(targetIndex, 0, sourceId);

    setCriteresOrder(newOrder);
    setDragIndex(null);
    setDragOverIndex(null);
  };

  // ── Gestionnaire de toggle pour les critères ──────────────────────────────
  const toggleCriteres = (id, isEdit = false) => {
    if (isEdit) {
      const newData = { ...editFormData, [id]: !editFormData[id] };
      setEditFormData(newData);
      updateTauxEtCompteur(newData, setEditFormData);
    } else {
      const newData = { ...formData, [id]: !formData[id] };
      setFormData(newData);
      updateTauxEtCompteur(newData, setFormData);
    }
  };

  // ── Fonctions existantes ──────────────────────────────────────────────────
  const openGoogleMaps = (rue) => {
    const query = encodeURIComponent(`${rue.nom} ${municipalite?.nom || ''} Tunisie`);
    window.open(`https://www.google.com/maps/search/${query}`, '_blank');
  };

  const openStreetView = (rue) => {
    const coords = {
      'Tunis': { lat: 36.8190, lng: 10.1658 },
      'La Marsa': { lat: 36.8760, lng: 10.3230 },
      'Carthage': { lat: 36.8525, lng: 10.3230 },
      'Le Bardo': { lat: 36.8090, lng: 10.1350 },
      'Ariana': { lat: 36.8625, lng: 10.1956 },
      'Ben Arous': { lat: 36.7533, lng: 10.2281 },
      'La Goulette': { lat: 36.8181, lng: 10.3050 },
      'Sidi Bou Saïd': { lat: 36.8694, lng: 10.3417 },
      'Manouba': { lat: 36.8080, lng: 10.0980 },
      'Ezzouhour': { lat: 36.8350, lng: 10.1500 },
    };
    const c = coords[municipalite?.nom] || { lat: 36.8190, lng: 10.1658 };
    const query = encodeURIComponent(`${rue.nom} ${municipalite?.nom || ''} Tunisie`);
    window.open(
      `https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=${c.lat},${c.lng}&query=${query}`,
      '_blank'
    );
  };

  // ✅ handleAddRue corrigé
  const handleAddRue = async () => {
    if (!formData.nom.trim() || !selectedSecteur) {
      showMsg('Veuillez remplir tous les champs obligatoires.', 'error');
      return;
    }
    setAddLoading(true);
    try {
      // ✅ Normaliser les données pour garantir des booléens
      const payload = {
        nom: formData.nom.trim(),
        etat: formData.etat || 'BONNE',
        eclairagePublic: !!formData.eclairagePublic,
        assainissement: !!formData.assainissement,
        eauPotable: !!formData.eauPotable,
        electricite: !!formData.electricite,
        voirie: !!formData.voirie,
        proprete: !!formData.proprete,
        autreCritere: !!formData.autreCritere,
        autreCritereDetails: formData.autreCritereDetails || '',
        observations: formData.observations || '',
        priorite: formData.priorite || 1
      };

      console.log('📤 Envoi des données:', JSON.stringify(payload, null, 2));

      await UserService.ajouterRue(selectedSecteur.id, payload);
      showMsg('Route ajoutée avec succès !', 'success');
      setShowAddModal(false);

      // ✅ Réinitialiser le formulaire
      resetAddForm();

      setTimeout(async () => await onRefresh(), 100);
    } catch (error) {
      console.error('❌ Erreur ajout route:', error);
      showMsg(error.response?.data?.message || "Erreur lors de l'ajout de la route.", 'error');
    } finally {
      setAddLoading(false);
    }
  };

  // ✅ handleEditRue corrigé
  const handleEditRue = async () => {
    if (!editFormData.nom.trim() || !editRue) return;
    setEditLoading(true);
    try {
      const payload = {
        nom: editFormData.nom.trim(),
        etat: editFormData.etat || 'BONNE',
        eclairagePublic: !!editFormData.eclairagePublic,
        assainissement: !!editFormData.assainissement,
        eauPotable: !!editFormData.eauPotable,
        electricite: !!editFormData.electricite,
        voirie: !!editFormData.voirie,
        proprete: !!editFormData.proprete,
        autreCritere: !!editFormData.autreCritere,
        autreCritereDetails: editFormData.autreCritereDetails || '',
        observations: editFormData.observations || '',
        priorite: editFormData.priorite || 1
      };

      console.log('📤 Modification des données:', JSON.stringify(payload, null, 2));

      await UserService.modifierRue(editRue.id, payload);
      showMsg('Route modifiée avec succès !', 'success');
      setEditRue(null);
      setEditFormData({
        nom: '',
        etat: 'BONNE',
        eclairagePublic: false,
        assainissement: false,
        eauPotable: false,
        electricite: false,
        voirie: false,
        proprete: false,
        autreCritere: false,
        autreCritereDetails: '',
        observations: '',
        priorite: 1,
        taux: 0,
        nbCriteresCoches: 0
      });
      setTimeout(async () => await onRefresh(), 100);
    } catch (error) {
      console.error('❌ Erreur modification route:', error);
      showMsg(error.response?.data?.message || 'Erreur lors de la modification.', 'error');
    } finally {
      setEditLoading(false);
    }
  };

  const handleDeleteRue = async (rue) => {
    if (!window.confirm(`Supprimer la route "${rue.nom}" ?`)) return;
    try {
      await UserService.supprimerRue(rue.id);
      showMsg('Route supprimée.', 'success');
      setTimeout(async () => await onRefresh(), 100);
    } catch (error) {
      showMsg(error.response?.data?.message || 'Erreur lors de la suppression.', 'error');
    }
  };

  const openEditModal = (rue) => {
    setEditRue(rue);
    setEditFormData({
      nom: rue.nom || '',
      etat: rue.etat || 'BONNE',
      eclairagePublic: rue.eclairagePublic || false,
      assainissement: rue.assainissement || false,
      eauPotable: rue.eauPotable || false,
      electricite: rue.electricite || false,
      voirie: rue.voirie || false,
      proprete: rue.proprete || false,
      autreCritere: rue.autreCritere || false,
      autreCritereDetails: rue.autreCritereDetails || '',
      observations: rue.observations || '',
      priorite: rue.priorite || 1,
      taux: rue.taux || 0,
      nbCriteresCoches: rue.nbCriteresCoches || 0
    });
  };

  const getFilteredRoutes = () => {
    let routes = [];
    if (selectedSecteur) {
      routes = selectedSecteur.rues || [];
    } else {
      secteurs.forEach(s => {
        routes = [...routes, ...(s.rues || []).map(r => ({ ...r, secteurNom: s.nom }))];
      });
    }
    if (searchTerm) {
      routes = routes.filter(r => r.nom.toLowerCase().includes(searchTerm.toLowerCase()));
    }
    return routes;
  };

  const filteredRoutes = getFilteredRoutes();

  // Obtenir les critères triés
  const getSortedCriteres = () => {
    return criteresOrder.map(id => criteres.find(c => c.id === id)).filter(Boolean);
  };

  // Rendu des critères avec drag & drop
  const renderCriteres = (data, isEdit = false) => {
    const sortedCriteres = getSortedCriteres();
    return sortedCriteres.map((critere) => (
      <CritereItem
        key={critere.id}
        id={critere.id}
        label={critere.label}
        icon={critere.icon}
        checked={data[critere.id] || false}
        onToggle={(id) => toggleCriteres(id, isEdit)}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        isDragging={dragIndex === critere.id}
      />
    ));
  };

  const getTauxLabel = (nbCriteres) => {
    if (nbCriteres === 0) return 'Aucun critère sélectionné → Taux 0%';
    if (nbCriteres <= 2) return '1-2 critères → Taux 8%';
    if (nbCriteres <= 4) return '3-4 critères → Taux 10%';
    if (nbCriteres <= 6) return '5-6 critères → Taux 12%';
    return '7+ critères → Taux 14%';
  };

  return (
    <div className="routes-page">
      <div className="routes-header">
        <h2>
          <Icons.Road />
          Routes de {municipalite?.nom || 'Municipalité'}
        </h2>
        <div className="routes-header-actions">
          <div className="routes-search">
            <Icons.Search />
            <input
              type="text"
              placeholder="Rechercher une route..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
          <button
            className="routes-add-btn"
            onClick={openAddModal}  // ✅ Utiliser openAddModal
          >
            <Icons.Plus />
            Ajouter
          </button>
        </div>
      </div>

      <div className="routes-filter-section">
        <div className="routes-secteur-filter">
          <span className="routes-filter-label">
            <Icons.Secteur />
            Filtrer par secteur :
          </span>
          <div className="routes-secteur-buttons">
            <button
              className={`routes-secteur-btn ${!selectedSecteur ? 'active' : ''}`}
              onClick={() => setSelectedSecteur(null)}
            >
              Tous
            </button>
            {secteurs.map(s => (
              <button
                key={s.id}
                className={`routes-secteur-btn ${selectedSecteur?.id === s.id ? 'active' : ''}`}
                onClick={() => setSelectedSecteur(s)}
              >
                {s.nom}
              </button>
            ))}
          </div>
        </div>
      </div>

      {filteredRoutes.length === 0 ? (
        <div className="routes-empty">
          <Icons.Road />
          <span>
            {selectedSecteur
              ? `Aucune route dans le secteur "${selectedSecteur.nom}"`
              : 'Aucune route enregistrée'}
          </span>
          {selectedSecteur && (
            <button onClick={openAddModal}>  {/* ✅ Utiliser openAddModal */}
              Ajouter une route
            </button>
          )}
        </div>
      ) : (
        <div className="routes-table-wrapper">
          <table className="routes-table">
            <thead>
              <tr>
                <th>Nom de la route</th>
                <th>Secteur</th>
                <th>État</th>
                <th>Critères</th>
                <th>Taux</th>
                <th>Équipements</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredRoutes.map(rue => (
                <tr key={rue.id}>
                  <td>
                    <div className="routes-rue-name">
                      <Icons.Road />
                      {rue.nom}
                    </div>
                  </td>
                  <td>
                    <span className="routes-rue-secteur">
                      <Icons.Secteur />
                      {rue.secteurNom || selectedSecteur?.nom}
                    </span>
                  </td>
                  <td>
                    <span className={`routes-rue-etat ${rue.etat?.toLowerCase()}`}>
                      {rue.etat === 'BONNE' && 'Bonne'}
                      {rue.etat === 'MOYENNE' && 'Moyenne'}
                      {rue.etat === 'DEGRADEE' && 'Dégradée'}
                    </span>
                  </td>
                  <td>
                    <span className="routes-rue-criteres">
                      {rue.nbCriteresCoches || 0}/7
                    </span>
                  </td>
                  <td>
                    <span className="routes-rue-taux">
                      {(rue.taux * 100).toFixed(0)}%
                    </span>
                  </td>
                  <td>
                    <div className="routes-rue-infrastructures">
                      {rue.eclairagePublic && <span title="Éclairage public"><Icons.Lightbulb /></span>}
                      {rue.assainissement && <span title="Assainissement ONAS"><Icons.Water /></span>}
                      {rue.eauPotable && <span title="Eau potable SONEDE"><Icons.Droplet /></span>}
                      {rue.electricite && <span title="Électricité STEG"><Icons.Zap /></span>}
                      {rue.voirie && <span title="Voirie"><Icons.Road /></span>}
                      {rue.proprete && <span title="Propreté"><Icons.Trash2 /></span>}
                      {rue.autreCritere && <span title={rue.autreCritereDetails || 'Autre'}><Icons.PlusCircle /></span>}
                      {!rue.eclairagePublic && !rue.assainissement && !rue.eauPotable && !rue.electricite && !rue.voirie && !rue.proprete && !rue.autreCritere && (
                        <span className="routes-rue-no-infra">Aucun</span>
                      )}
                    </div>
                  </td>
                  <td>
                    <div className="routes-rue-actions">
                      <button
                        className="routes-rue-btn routes-rue-btn-maps"
                        onClick={() => openGoogleMaps(rue)}
                        title="Voir sur Google Maps"
                      >
                        <Icons.Map />
                        Maps
                      </button>
                      <button
                        className="routes-rue-btn routes-rue-btn-street"
                        onClick={() => openStreetView(rue)}
                        title="Street View"
                      >
                        <Icons.StreetView />
                        Street View
                      </button>
                      <button
                        className="routes-rue-btn routes-rue-btn-edit"
                        onClick={() => openEditModal(rue)}
                        title="Modifier"
                      >
                        <Icons.Edit />
                      </button>
                      <button
                        className="routes-rue-btn routes-rue-btn-delete"
                        onClick={() => handleDeleteRue(rue)}
                        title="Supprimer"
                      >
                        <Icons.Delete />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal Ajouter Route */}
      {showAddModal && (
        <div className="dashboard-modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="dashboard-modal dashboard-modal-large" onClick={e => e.stopPropagation()}>
            <div className="dashboard-modal-header">
              <h3>
                <Icons.Plus />
                Ajouter une route
              </h3>
              <button className="dashboard-modal-close" onClick={() => setShowAddModal(false)}>
                <Icons.Close />
              </button>
            </div>
            <div className="dashboard-modal-body">
              <p className="dashboard-modal-info">
                Secteur : <strong>{selectedSecteur?.nom}</strong>
              </p>

              {/* Nom de la route */}
              <div className="dashboard-form-group">
                <label>Nom de la route <span className="required">*</span></label>
                <input
                  type="text"
                  name="nom"
                  value={formData.nom}
                  onChange={handleFormChange}
                  placeholder="Ex: Avenue de la République"
                  required
                />
              </div>

              {/* État de la route */}
              <div className="dashboard-form-group">
                <label>État de la route</label>
                <select
                  name="etat"
                  value={formData.etat}
                  onChange={handleFormChange}
                  className="dashboard-form-select"
                >
                  {etatOptions.map(opt => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Section Critères d'évaluation */}
              <div className="dashboard-form-section">
                <div className="dashboard-form-section-header">
                  <h4 className="dashboard-form-section-title">
                    <Icons.Check />
                    Critères d'évaluation
                  </h4>
                  <span className="dashboard-section-badge">
                    {formData.nbCriteresCoches || 0}/7 coché(s)
                  </span>
                  <span className="dashboard-section-hint">
                    <Icons.GripVertical />
                    Glissez pour réorganiser
                  </span>
                </div>

                <div className="critere-grid">
                  {renderCriteres(formData, false)}
                </div>

                {formData.autreCritere && (
                  <div className="dashboard-form-group dashboard-form-group-margin">
                    <label>Précisez l'autre critère</label>
                    <input
                      type="text"
                      name="autreCritereDetails"
                      value={formData.autreCritereDetails}
                      onChange={handleFormChange}
                      placeholder="Ex: Signalisation, Trottoirs, etc."
                      className="dashboard-form-input"
                    />
                  </div>
                )}
              </div>

              {/* Section Taux calculé automatiquement */}
              <div className="dashboard-form-section dashboard-taux-section">
                <h4 className="dashboard-form-section-title">
                  <Icons.Percent />
                  Taux calculé automatiquement
                </h4>

                <div className="dashboard-taux-display">
                  <div className="dashboard-taux-info-left">
                    <span className="dashboard-taux-label">
                      {getTauxLabel(formData.nbCriteresCoches)}
                    </span>
                  </div>
                  <div className="dashboard-taux-value-container">
                    <span className="dashboard-taux-value">
                      {(formData.taux * 100).toFixed(0)}%
                    </span>
                    <span className="dashboard-taux-criteres">
                      {formData.nbCriteresCoches || 0} critère(s) coché(s)
                    </span>
                  </div>
                </div>

                <div className="dashboard-taux-legend">
                  <div className="dashboard-taux-legend-item">
                    <span className="dashboard-taux-legend-dot" style={{ backgroundColor: '#9CA3AF' }}></span>
                    <span>0 critère → 0%</span>
                  </div>
                  <div className="dashboard-taux-legend-item">
                    <span className="dashboard-taux-legend-dot" style={{ backgroundColor: '#22C55E' }}></span>
                    <span>1-2 critères → 8%</span>
                  </div>
                  <div className="dashboard-taux-legend-item">
                    <span className="dashboard-taux-legend-dot" style={{ backgroundColor: '#F59E0B' }}></span>
                    <span>3-4 critères → 10%</span>
                  </div>
                  <div className="dashboard-taux-legend-item">
                    <span className="dashboard-taux-legend-dot" style={{ backgroundColor: '#F97316' }}></span>
                    <span>5-6 critères → 12%</span>
                  </div>
                  <div className="dashboard-taux-legend-item">
                    <span className="dashboard-taux-legend-dot" style={{ backgroundColor: '#EF4444' }}></span>
                    <span>7+ critères → 14%</span>
                  </div>
                </div>
              </div>

              {/* Observations */}
              <div className="dashboard-form-section">
                <h4 className="dashboard-form-section-title">
                  <Icons.Edit />
                  Observations
                </h4>
                <div className="dashboard-form-group">
                  <textarea
                    name="observations"
                    value={formData.observations}
                    onChange={handleFormChange}
                    placeholder="Informations supplémentaires sur la route..."
                    rows="3"
                    className="dashboard-form-textarea"
                  />
                </div>
              </div>
            </div>
            <div className="dashboard-modal-footer">
              <button className="dashboard-btn-cancel" onClick={() => setShowAddModal(false)}>
                Annuler
              </button>
              <button
                className="dashboard-btn-primary"
                onClick={handleAddRue}
                disabled={addLoading || !formData.nom.trim()}
              >
                {addLoading ? 'Ajout...' : 'Ajouter la route'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Modifier Route */}
      {editRue && (
        <div className="dashboard-modal-overlay" onClick={() => setEditRue(null)}>
          <div className="dashboard-modal dashboard-modal-large" onClick={e => e.stopPropagation()}>
            <div className="dashboard-modal-header">
              <h3>
                <Icons.Edit />
                Modifier la route
              </h3>
              <button className="dashboard-modal-close" onClick={() => setEditRue(null)}>
                <Icons.Close />
              </button>
            </div>
            <div className="dashboard-modal-body">
              {/* Nom de la route */}
              <div className="dashboard-form-group">
                <label>Nom de la route <span className="required">*</span></label>
                <input
                  type="text"
                  name="nom"
                  value={editFormData.nom}
                  onChange={handleEditFormChange}
                  placeholder="Ex: Avenue de la République"
                  required
                />
              </div>

              {/* État de la route */}
              <div className="dashboard-form-group">
                <label>État de la route</label>
                <select
                  name="etat"
                  value={editFormData.etat}
                  onChange={handleEditFormChange}
                  className="dashboard-form-select"
                >
                  {etatOptions.map(opt => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Section Critères d'évaluation */}
              <div className="dashboard-form-section">
                <div className="dashboard-form-section-header">
                  <h4 className="dashboard-form-section-title">
                    <Icons.Check />
                    Critères d'évaluation
                  </h4>
                  <span className="dashboard-section-badge">
                    {editFormData.nbCriteresCoches || 0}/7 coché(s)
                  </span>
                  <span className="dashboard-section-hint">
                    <Icons.GripVertical />
                    Glissez pour réorganiser
                  </span>
                </div>

                <div className="critere-grid">
                  {renderCriteres(editFormData, true)}
                </div>

                {editFormData.autreCritere && (
                  <div className="dashboard-form-group dashboard-form-group-margin">
                    <label>Précisez l'autre critère</label>
                    <input
                      type="text"
                      name="autreCritereDetails"
                      value={editFormData.autreCritereDetails}
                      onChange={handleEditFormChange}
                      placeholder="Ex: Signalisation, Trottoirs, etc."
                      className="dashboard-form-input"
                    />
                  </div>
                )}
              </div>

              {/* Section Taux calculé automatiquement */}
              <div className="dashboard-form-section dashboard-taux-section">
                <h4 className="dashboard-form-section-title">
                  <Icons.Percent />
                  Taux calculé automatiquement
                </h4>

                <div className="dashboard-taux-display">
                  <div className="dashboard-taux-info-left">
                    <span className="dashboard-taux-label">
                      {getTauxLabel(editFormData.nbCriteresCoches)}
                    </span>
                  </div>
                  <div className="dashboard-taux-value-container">
                    <span className="dashboard-taux-value">
                      {(editFormData.taux * 100).toFixed(0)}%
                    </span>
                    <span className="dashboard-taux-criteres">
                      {editFormData.nbCriteresCoches || 0} critère(s) coché(s)
                    </span>
                  </div>
                </div>

                <div className="dashboard-taux-legend">
                  <div className="dashboard-taux-legend-item">
                    <span className="dashboard-taux-legend-dot" style={{ backgroundColor: '#9CA3AF' }}></span>
                    <span>0 critère → 0%</span>
                  </div>
                  <div className="dashboard-taux-legend-item">
                    <span className="dashboard-taux-legend-dot" style={{ backgroundColor: '#22C55E' }}></span>
                    <span>1-2 critères → 8%</span>
                  </div>
                  <div className="dashboard-taux-legend-item">
                    <span className="dashboard-taux-legend-dot" style={{ backgroundColor: '#F59E0B' }}></span>
                    <span>3-4 critères → 10%</span>
                  </div>
                  <div className="dashboard-taux-legend-item">
                    <span className="dashboard-taux-legend-dot" style={{ backgroundColor: '#F97316' }}></span>
                    <span>5-6 critères → 12%</span>
                  </div>
                  <div className="dashboard-taux-legend-item">
                    <span className="dashboard-taux-legend-dot" style={{ backgroundColor: '#EF4444' }}></span>
                    <span>7+ critères → 14%</span>
                  </div>
                </div>
              </div>

              {/* Observations */}
              <div className="dashboard-form-section">
                <h4 className="dashboard-form-section-title">
                  <Icons.Edit />
                  Observations
                </h4>
                <div className="dashboard-form-group">
                  <textarea
                    name="observations"
                    value={editFormData.observations}
                    onChange={handleEditFormChange}
                    placeholder="Informations supplémentaires sur la route..."
                    rows="3"
                    className="dashboard-form-textarea"
                  />
                </div>
              </div>
            </div>
            <div className="dashboard-modal-footer">
              <button className="dashboard-btn-cancel" onClick={() => setEditRue(null)}>
                Annuler
              </button>
              <button
                className="dashboard-btn-primary"
                onClick={handleEditRue}
                disabled={editLoading || !editFormData.nom.trim()}
              >
                {editLoading ? 'Modification...' : 'Enregistrer les modifications'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}