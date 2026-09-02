// SecteursPage.jsx - Version complète corrigée
import React, { useState, useEffect } from 'react';
import UserService from '../services/userService';
import './DashboardUser.css';

const Icons = {
  Secteur: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
      <circle cx="12" cy="10" r="3"/>
    </svg>
  ),
  Road: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="3" y1="12" x2="21" y2="12"/>
      <line x1="3" y1="6" x2="21" y2="6"/>
      <line x1="3" y1="18" x2="21" y2="18"/>
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
  Check: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20,6 9,17 4,12"/>
    </svg>
  ),
};

export default function SecteursPage({ municipalite, onRefresh, showMsg }) {
  // ✅ Utiliser un état local
  const [secteurs, setSecteurs] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [addLoading, setAddLoading] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [newSecteurName, setNewSecteurName] = useState('');
  const [editSecteur, setEditSecteur] = useState(null);
  const [editSecteurName, setEditSecteurName] = useState('');
  const [deletingId, setDeletingId] = useState(null);

  // ✅ Mettre à jour l'état local quand municipalite change
  useEffect(() => {
    console.log('📂 SecteursPage - municipalite reçue:', municipalite);
    if (municipalite && municipalite.secteurs) {
      console.log(`📂 SecteursPage - ${municipalite.secteurs.length} secteurs chargés`);
      setSecteurs(municipalite.secteurs);
    } else {
      setSecteurs([]);
    }
  }, [municipalite]);

  const handleAddSecteur = async () => {
    if (!newSecteurName.trim()) {
      showMsg('Veuillez entrer un nom de secteur.', 'error');
      return;
    }
    setAddLoading(true);
    try {
      await UserService.ajouterSecteur({ nom: newSecteurName.trim() });
      showMsg('Secteur ajouté avec succès !', 'success');
      setShowAddModal(false);
      setNewSecteurName('');
      setTimeout(async () => await onRefresh(), 100);
    } catch (error) {
      const message = error.response?.data?.message || "Erreur lors de l'ajout du secteur.";
      showMsg(message, 'error');
    } finally {
      setAddLoading(false);
    }
  };

  const handleEditSecteur = async () => {
    if (!editSecteurName.trim() || !editSecteur) {
      showMsg('Veuillez entrer un nom de secteur.', 'error');
      return;
    }
    setEditLoading(true);
    try {
      await UserService.modifierSecteur(editSecteur.id, { nom: editSecteurName.trim() });
      showMsg('Secteur modifié avec succès !', 'success');
      setShowEditModal(false);
      setEditSecteur(null);
      setEditSecteurName('');
      setTimeout(async () => await onRefresh(), 100);
    } catch (error) {
      const message = error.response?.data?.message || "Erreur lors de la modification du secteur.";
      showMsg(message, 'error');
    } finally {
      setEditLoading(false);
    }
  };

  const handleDeleteSecteur = async (secteur) => {
    if (!window.confirm(`Supprimer le secteur "${secteur.nom}" ? Cette action est irréversible.`)) return;

    setDeletingId(secteur.id);
    try {
      await UserService.supprimerSecteur(secteur.id);
      showMsg('Secteur supprimé avec succès.', 'success');
      setTimeout(async () => await onRefresh(), 100);
    } catch (error) {
      let errorMessage = "Erreur lors de la suppression du secteur.";
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      showMsg(errorMessage, 'error');
    } finally {
      setDeletingId(null);
    }
  };

  const openEditModal = (secteur) => {
    setEditSecteur(secteur);
    setEditSecteurName(secteur.nom);
    setShowEditModal(true);
  };

  if (!municipalite) {
    return (
      <div className="secteurs-page">
        <div className="secteurs-empty">
          <Icons.Secteur />
          <span>Chargement des secteurs...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="secteurs-page">
      <div className="secteurs-header">
        <h2>
          <Icons.Secteur />
          Secteurs de {municipalite?.nom || 'Municipalité'}
        </h2>
        <button className="secteurs-add-btn" onClick={() => setShowAddModal(true)}>
          <Icons.Plus />
          Ajouter un secteur
        </button>
      </div>

      <div className="secteurs-grid">
        {secteurs.length === 0 ? (
          <div className="secteurs-empty">
            <Icons.Secteur />
            <span>Aucun secteur enregistré</span>
            <button onClick={() => setShowAddModal(true)}>
              Ajouter votre premier secteur
            </button>
          </div>
        ) : (
          secteurs.map(secteur => (
            <div key={secteur.id} className="secteur-card">
              <div className="secteur-card-header">
                <div className="secteur-card-icon">
                  <Icons.Secteur />
                </div>
                <h3>{secteur.nom}</h3>
                <span className="secteur-card-badge">
                  {secteur.rues?.length || 0} route(s)
                </span>
              </div>
              <div className="secteur-card-stats">
                <div className="secteur-card-stat">
                  <Icons.Road />
                  <span>{secteur.rues?.length || 0} routes</span>
                </div>
              </div>
              <div className="secteur-card-actions">
                <button
                  className="secteur-card-btn secteur-card-btn-edit"
                  onClick={() => openEditModal(secteur)}
                >
                  <Icons.Edit />
                  Modifier
                </button>
                <button
                  className="secteur-card-btn secteur-card-btn-delete"
                  onClick={() => handleDeleteSecteur(secteur)}
                  disabled={deletingId === secteur.id}
                >
                  {deletingId === secteur.id ? (
                    'Suppression...'
                  ) : (
                    <>
                      <Icons.Delete />
                      Supprimer
                    </>
                  )}
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal Ajouter Secteur */}
      {showAddModal && (
        <div className="dashboard-modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="dashboard-modal" onClick={e => e.stopPropagation()}>
            <div className="dashboard-modal-header">
              <h3>
                <Icons.Plus />
                Ajouter un secteur
              </h3>
              <button className="dashboard-modal-close" onClick={() => setShowAddModal(false)}>
                <Icons.Close />
              </button>
            </div>
            <div className="dashboard-modal-body">
              <p className="dashboard-modal-info">
                Municipalité : <strong>{municipalite?.nom}</strong>
              </p>
              <div className="dashboard-form-group">
                <label>Nom du secteur <span className="required">*</span></label>
                <input
                  type="text"
                  value={newSecteurName}
                  onChange={e => setNewSecteurName(e.target.value)}
                  placeholder="Ex: Centre-ville, Cité Ennasr, Médina..."
                  onKeyDown={e => e.key === 'Enter' && handleAddSecteur()}
                  autoFocus
                />
              </div>
            </div>
            <div className="dashboard-modal-footer">
              <button className="dashboard-btn-cancel" onClick={() => setShowAddModal(false)}>
                Annuler
              </button>
              <button
                className="dashboard-btn-primary"
                onClick={handleAddSecteur}
                disabled={addLoading || !newSecteurName.trim()}
              >
                {addLoading ? 'Ajout...' : 'Ajouter le secteur'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Modifier Secteur */}
      {showEditModal && editSecteur && (
        <div className="dashboard-modal-overlay" onClick={() => setShowEditModal(false)}>
          <div className="dashboard-modal" onClick={e => e.stopPropagation()}>
            <div className="dashboard-modal-header">
              <h3>
                <Icons.Edit />
                Modifier le secteur
              </h3>
              <button className="dashboard-modal-close" onClick={() => setShowEditModal(false)}>
                <Icons.Close />
              </button>
            </div>
            <div className="dashboard-modal-body">
              <p className="dashboard-modal-info">
                Secteur : <strong>{editSecteur.nom}</strong>
              </p>
              <div className="dashboard-form-group">
                <label>Nouveau nom <span className="required">*</span></label>
                <input
                  type="text"
                  value={editSecteurName}
                  onChange={e => setEditSecteurName(e.target.value)}
                  placeholder="Ex: Centre-ville, Cité Ennasr, Médina..."
                  onKeyDown={e => e.key === 'Enter' && handleEditSecteur()}
                  autoFocus
                />
              </div>
            </div>
            <div className="dashboard-modal-footer">
              <button className="dashboard-btn-cancel" onClick={() => setShowEditModal(false)}>
                Annuler
              </button>
              <button
                className="dashboard-btn-primary"
                onClick={handleEditSecteur}
                disabled={editLoading || !editSecteurName.trim()}
              >
                {editLoading ? 'Modification...' : 'Enregistrer'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}