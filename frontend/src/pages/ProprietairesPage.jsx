// ProprietairesPage.jsx
import React, { useState, useEffect } from 'react';
import UserService from '../services/userService';
import './ProprietairesPage.css';

// ── SVG Icons ─────────────────────────────────────────────────────────────────
const Icons = {
  User: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
      <circle cx="12" cy="12" r="4"/>
    </svg>
  ),
  Plus: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="5" x2="12" y2="19"/>
      <line x1="5" y1="12" x2="19" y2="12"/>
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
  Search: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8"/>
      <line x1="21" y1="21" x2="16.65" y2="16.65"/>
    </svg>
  ),
  Filter: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="22,3 2,3 10,13 10,21 14,18 14,13 22,3"/>
    </svg>
  ),
  Close: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18"/>
      <line x1="6" y1="6" x2="18" y2="18"/>
    </svg>
  ),
  Check: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20,6 9,17 4,12"/>
    </svg>
  ),
  Building: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="4" y="2" width="16" height="20" rx="2"/>
      <line x1="8" y1="6" x2="16" y2="6"/>
      <line x1="8" y1="10" x2="16" y2="10"/>
      <line x1="8" y1="14" x2="16" y2="14"/>
      <line x1="8" y1="18" x2="12" y2="18"/>
    </svg>
  ),
  Calendar: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2"/>
      <line x1="16" y1="2" x2="16" y2="6"/>
      <line x1="8" y1="2" x2="8" y2="6"/>
      <line x1="3" y1="10" x2="21" y2="10"/>
    </svg>
  ),
  Phone: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.56 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
    </svg>
  ),
};

export default function ProprietairesPage({ showMsg }) {
  const [proprietaires, setProprietaires] = useState([]);
  const [rues, setRues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRue, setFilterRue] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [formData, setFormData] = useState({
    cin: '',
    nom: '',
    prenom: '',
    dateNaissance: '',
    telephone: '',
    adresse: '',
    numeroBien: '',
    superficie: '',
    typeBien: 'MAISON',
    observations: '',
    rueId: ''
  });

  const typeBiens = ['MAISON', 'APPARTEMENT', 'LOCAL_COMMERCIAL', 'TERRAIN', 'AUTRE'];
  const typeBiensLabels = {
    'MAISON': 'Maison',
    'APPARTEMENT': 'Appartement',
    'LOCAL_COMMERCIAL': 'Local commercial',
    'TERRAIN': 'Terrain',
    'AUTRE': 'Autre'
  };

  useEffect(() => {
    loadProprietaires();
    loadRues();
  }, [currentPage, filterRue, searchTerm]);

  const loadProprietaires = async () => {
    try {
      setLoading(true);
      console.log('🔄 Chargement des propriétaires...');
      const params = new URLSearchParams({
        page: currentPage,
        size: 10,
        sortBy: 'id',
        sortDir: 'desc'
      });
      if (searchTerm) params.append('search', searchTerm);
      if (filterRue) params.append('rueId', filterRue);

      const data = await UserService.getProprietaires(params);
      console.log('📦 Propriétaires chargés:', data.totalElements || 0);
      setProprietaires(data.content || []);
      setTotalPages(data.totalPages || 0);
      setTotalElements(data.totalElements || 0);
    } catch (error) {
      console.error('❌ Erreur chargement propriétaires:', error);
      showMsg('Erreur lors du chargement des propriétaires.', 'error');
    } finally {
      setLoading(false);
    }
  };


  const loadRues = async () => {
    try {
      const data = await UserService.getRuesForTIBGestion();
      setRues(data);
    } catch (error) {
      console.error('Erreur chargement rues:', error);
    }
  };

// ✅ CORRECTION : handleSubmit avec refresh forcé
const handleSubmit = async (e) => {
  e.preventDefault();
  try {
    console.log('📤 Enregistrement du propriétaire:', editingId ? 'Modification' : 'Création');
    if (editingId) {
      await UserService.updateProprietaire(editingId, formData);
      showMsg('Propriétaire modifié avec succès !', 'success');
    } else {
      await UserService.createProprietaire(formData);
      showMsg('Propriétaire ajouté avec succès !', 'success');
    }
    setShowModal(false);
    setEditingId(null);
    resetForm();

    // ✅ Forcer le rechargement
    setTimeout(async () => {
      await loadProprietaires();
    }, 100);
  } catch (error) {
    console.error('❌ Erreur enregistrement:', error);
    showMsg(error.response?.data?.message || 'Erreur lors de l\'enregistrement.', 'error');
  }
};

// ✅ CORRECTION : handleDelete avec refresh forcé
const handleDelete = async (id, nom) => {
  if (!window.confirm(`Supprimer le propriétaire "${nom}" ?`)) return;
  try {
    console.log('🗑️ Suppression du propriétaire:', id);
    await UserService.deleteProprietaire(id);
    showMsg('Propriétaire supprimé avec succès.', 'success');

    // ✅ Forcer le rechargement
    setTimeout(async () => {
      await loadProprietaires();
    }, 100);
  } catch (error) {
    console.error('❌ Erreur suppression:', error);
    showMsg('Erreur lors de la suppression.', 'error');
  }
};

  const handleEdit = async (id) => {
    try {
      const data = await UserService.getProprietaire(id);
      setFormData({
        cin: data.cin || '',
        nom: data.nom || '',
        prenom: data.prenom || '',
        dateNaissance: data.dateNaissance || '',
        telephone: data.telephone || '',
        adresse: data.adresse || '',
        numeroBien: data.numeroBien || '',
        superficie: data.superficie || '',
        typeBien: data.typeBien || 'MAISON',
        observations: data.observations || '',
        rueId: data.rueId || ''
      });
      setEditingId(id);
      setShowModal(true);
    } catch (error) {
      showMsg('Erreur lors du chargement des données.', 'error');
    }
  };

  const resetForm = () => {
    setFormData({
      cin: '',
      nom: '',
      prenom: '',
      dateNaissance: '',
      telephone: '',
      adresse: '',
      numeroBien: '',
      superficie: '',
      typeBien: 'MAISON',
      observations: '',
      rueId: ''
    });
    setEditingId(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 0 && newPage < totalPages) {
      setCurrentPage(newPage);
    }
  };

  return (
    <div className="proprietaires-page">
      {/* En-tête */}
      <div className="proprietaires-header">
        <h1>
          <Icons.User />
          Gestion des Propriétaires
        </h1>
        <button className="btn-add" onClick={() => { resetForm(); setShowModal(true); }}>
          <Icons.Plus />
          Ajouter un propriétaire
        </button>
      </div>

      {/* Filtres et recherche */}
      <div className="proprietaires-filters">
        <div className="filter-group">
          <Icons.Search />
          <input
            type="text"
            placeholder="Rechercher par CIN, Nom ou Prénom..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="filter-input"
          />
        </div>
        <div className="filter-group">
          <Icons.Filter />
          <select
            value={filterRue}
            onChange={(e) => setFilterRue(e.target.value)}
            className="filter-select"
          >
            <option value="">Toutes les rues</option>
            {rues.map(rue => (
              <option key={rue.id} value={rue.id}>{rue.nom}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Statistiques */}
      <div className="proprietaires-stats">
        <span>Total: <strong>{totalElements}</strong> propriétaire(s)</span>
      </div>

      {/* Tableau */}
      {loading ? (
        <div className="loading-spinner">Chargement...</div>
      ) : (
        <>
          <div className="proprietaires-table-wrapper">
            <table className="proprietaires-table">
              <thead>
                <tr>
                  <th>CIN</th>
                  <th>Nom complet</th>
                  <th>Téléphone</th>
                  <th>Type de bien</th>
                  <th>Superficie</th>
                  <th>Rue</th>
                  <th>Secteur</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {proprietaires.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="no-data">Aucun propriétaire enregistré</td>
                  </tr>
                ) : (
                  proprietaires.map(p => (
                    <tr key={p.id}>
                      <td><strong>{p.cin}</strong></td>
                      <td>{p.prenom} {p.nom}</td>
                      <td>{p.telephone || 'N/A'}</td>
                      <td><span className="type-badge">{typeBiensLabels[p.typeBien] || p.typeBien}</span></td>
                      <td>{p.superficie} m²</td>
                      <td>{p.rueNom}</td>
                      <td>{p.secteurNom}</td>
                      <td>
                        <div className="action-buttons">
                          <button className="btn-edit" onClick={() => handleEdit(p.id)} title="Modifier">
                            <Icons.Edit />
                          </button>
                          <button className="btn-delete" onClick={() => handleDelete(p.id, p.prenom + ' ' + p.nom)} title="Supprimer">
                            <Icons.Delete />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="pagination">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 0}
                className="pagination-btn"
              >
                Précédent
              </button>
              <span className="pagination-info">
                Page {currentPage + 1} sur {totalPages}
              </span>
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage >= totalPages - 1}
                className="pagination-btn"
              >
                Suivant
              </button>
            </div>
          )}
        </>
      )}

      {/* Modal Ajout/Modification */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content modal-large" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingId ? 'Modifier' : 'Ajouter'} un propriétaire</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}>
                <Icons.Close />
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-grid">
                  <div className="form-group">
                    <label>CIN <span className="required">*</span></label>
                    <input
                      type="text"
                      name="cin"
                      value={formData.cin}
                      onChange={handleInputChange}
                      placeholder="12345678"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Nom <span className="required">*</span></label>
                    <input
                      type="text"
                      name="nom"
                      value={formData.nom}
                      onChange={handleInputChange}
                      placeholder="Ben Ali"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Prénom <span className="required">*</span></label>
                    <input
                      type="text"
                      name="prenom"
                      value={formData.prenom}
                      onChange={handleInputChange}
                      placeholder="Mohamed"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Date de naissance <span className="required">*</span></label>
                    <input
                      type="date"
                      name="dateNaissance"
                      value={formData.dateNaissance}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Téléphone</label>
                    <input
                      type="tel"
                      name="telephone"
                      value={formData.telephone}
                      onChange={handleInputChange}
                      placeholder="71 000 000"
                    />
                  </div>
                  <div className="form-group">
                    <label>Adresse <span className="required">*</span></label>
                    <input
                      type="text"
                      name="adresse"
                      value={formData.adresse}
                      onChange={handleInputChange}
                      placeholder="N° 12, Rue de la Liberté"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Rue <span className="required">*</span></label>
                    <select
                      name="rueId"
                      value={formData.rueId}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="">Sélectionner une rue</option>
                      {rues.map(rue => (
                        <option key={rue.id} value={rue.id}>{rue.nom}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Type de bien <span className="required">*</span></label>
                    <select
                      name="typeBien"
                      value={formData.typeBien}
                      onChange={handleInputChange}
                      required
                    >
                      {typeBiens.map(t => (
                        <option key={t} value={t}>{typeBiensLabels[t]}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Superficie (m²) <span className="required">*</span></label>
                    <input
                      type="number"
                      name="superficie"
                      value={formData.superficie}
                      onChange={handleInputChange}
                      placeholder="150"
                      min="0"
                      step="0.01"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Numéro du bien</label>
                    <input
                      type="text"
                      name="numeroBien"
                      value={formData.numeroBien}
                      onChange={handleInputChange}
                      placeholder="Ex: B-12"
                    />
                  </div>
                  <div className="form-group full-width">
                    <label>Observations</label>
                    <textarea
                      name="observations"
                      value={formData.observations}
                      onChange={handleInputChange}
                      placeholder="Informations complémentaires..."
                      rows="3"
                    />
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn-cancel" onClick={() => setShowModal(false)}>
                  Annuler
                </button>
                <button type="submit" className="btn-save">
                  <Icons.Check />
                  {editingId ? 'Modifier' : 'Ajouter'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}