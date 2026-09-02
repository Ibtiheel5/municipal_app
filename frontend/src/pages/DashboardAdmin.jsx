import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import AdminService from '../services/adminService';
import TIBAdminPage from './TIBAdminPage';
import TNBAdminPage from './TNBAdminPage';
import './DashboardAdmin.css';
// DashboardAdmin.jsx
import {
  LogoMunicipal,
  IconMunicipalite,
  IconUser,
  IconLogout,
  IconPending,
  IconActive,
  IconRefused,
  IconMunicipalitesList,
  IconStats,
  IconLoading,
  IconSearch,
  IconPlus,
  IconEdit,
  IconDelete
} from '../components/icons/Icons';

const DashboardAdmin = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('en-attente');
  const [usersEnAttente, setUsersEnAttente] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [municipalites, setMunicipalites] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedMunicipalite, setSelectedMunicipalite] = useState({});
  const [message, setMessage] = useState({ text: '', type: '' });

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [attente, users, munis] = await Promise.all([
        AdminService.getUsersEnAttente(),
        AdminService.getAllUsers(),
        AdminService.getMunicipalites(),
      ]);
      setUsersEnAttente(attente);
      setAllUsers(users);
      setMunicipalites(munis);
    } catch (err) {
      showMessage('Erreur lors du chargement des données', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showMessage = (text, type) => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: '', type: '' }), 3000);
  };

  const handleAccepter = async (userId) => {
    const muniId = selectedMunicipalite[userId];
    if (!muniId) { showMessage("Veuillez sélectionner une municipalité avant d'accepter.", 'error'); return; }
    try {
      await AdminService.accepterEtAffecter(userId, muniId);
      showMessage('Utilisateur accepté et affecté avec succès !', 'success');
      loadData();
    } catch (err) {
      showMessage("Erreur lors de l'affectation.", 'error');
    }
  };

  const handleRefuser = async (userId) => {
    if (!window.confirm('Confirmer le refus de cet utilisateur ?')) return;
    try {
      await AdminService.refuserUtilisateur(userId);
      showMessage('Utilisateur refusé.', 'success');
      loadData();
    } catch (err) {
      showMessage('Erreur lors du refus.', 'error');
    }
  };

  const handleLogout = () => { logout(); navigate('/login'); };

  const getStatutBadge = (statut) => {
    const styles = {
      EN_ATTENTE: { bg: '#fef3c7', color: '#92400e', label: 'En attente' },
      ACTIF:      { bg: '#d1fae5', color: '#065f46', label: 'Actif' },
      REFUSE:     { bg: '#fee2e2', color: '#991b1b', label: 'Refusé' },
    };
    const s = styles[statut] || styles.EN_ATTENTE;
    return (
      <span className="admin-status-badge" style={{ padding:'0.2rem 0.7rem', borderRadius:'999px', fontSize:'0.75rem', fontWeight:600, background:s.bg, color:s.color }}>
        {s.label}
      </span>
    );
  };

  return (
    <div className="admin-dashboard">
      <header className="admin-dashboard-header">
        <div className="admin-dashboard-title">
          <IconMunicipalite size={32} style={{ color: 'white' }} />
          <h1>Tableau de bord Administrateur</h1>
          <span className="admin-role-badge">ADMIN</span>
        </div>
        <div className="admin-user-info">
          <span><IconUser size={16} style={{ marginRight: '6px' }} /> {user?.nom}</span>
          <button onClick={handleLogout} className="admin-btn-logout">
            <IconLogout size={16} style={{ marginRight: '4px' }} />
            Déconnexion
          </button>
        </div>
      </header>

      <main className="admin-dashboard-content">
        {message.text && <div className={`admin-alert admin-alert-${message.type}`}>{message.text}</div>}

        <div className="admin-stats-grid">
          <div className="admin-stat-card">
            <div className="admin-stat-icon"><IconPending size={32} style={{ color: '#f59e0b' }} /></div>
            <div className="admin-stat-number">{usersEnAttente.length}</div>
            <div className="admin-stat-label">En attente</div>
          </div>
          <div className="admin-stat-card">
            <div className="admin-stat-icon"><IconActive size={32} style={{ color: '#10b981' }} /></div>
            <div className="admin-stat-number">{allUsers.filter(u => u.statut === 'ACTIF').length}</div>
            <div className="admin-stat-label">Utilisateurs actifs</div>
          </div>
          <div className="admin-stat-card">
            <div className="admin-stat-icon"><IconMunicipalitesList size={32} style={{ color: '#2c6fad' }} /></div>
            <div className="admin-stat-number">{municipalites.length}</div>
            <div className="admin-stat-label">Municipalités</div>
          </div>
        </div>

        <div className="admin-tabs">
          <button className={`admin-tab ${activeTab === 'en-attente' ? 'active' : ''}`} onClick={() => setActiveTab('en-attente')}>
            <IconPending />
            En attente {usersEnAttente.length > 0 && <span className="admin-tab-badge">{usersEnAttente.length}</span>}
          </button>
          <button className={`admin-tab ${activeTab === 'tous' ? 'active' : ''}`} onClick={() => setActiveTab('tous')}>
            <IconUser />
            Tous les utilisateurs
          </button>
          <button className={`admin-tab ${activeTab === 'municipalites' ? 'active' : ''}`} onClick={() => setActiveTab('municipalites')}>
            <IconMunicipalitesList />
            Municipalités
          </button>
          <button className={`admin-tab ${activeTab === 'parametres-tib' ? 'active' : ''}`} onClick={() => setActiveTab('parametres-tib')}>
            Paramètres TIB
          </button>
          <button className={`admin-tab ${activeTab === 'parametres-tnb' ? 'active' : ''}`} onClick={() => setActiveTab('parametres-tnb')}>
            Paramètres TNB
          </button>
        </div>

        {loading ? (
          <div className="admin-loading-spinner">
            <IconLoading className="admin-spin" />
            <span style={{ marginLeft: '12px' }}>Chargement...</span>
          </div>
        ) : (
          <>
            {activeTab === 'en-attente' && (
              <div className="admin-table-container">
                <h2 className="admin-section-title">Demandes en attente de validation</h2>
                {usersEnAttente.length === 0 ? (
                  <div className="admin-empty-state">Aucune demande en attente</div>
                ) : (
                  <table className="admin-data-table">
                    <thead><tr><th>Nom</th><th>Email</th><th>Affecter à</th><th>Actions</th></tr></thead>
                    <tbody>
                      {usersEnAttente.map(u => (
                        <tr key={u.id}>
                          <td><strong>{u.nom}</strong></td>
                          <td>{u.email}</td>
                          <td>
                            <select className="admin-select-muni"
                              value={selectedMunicipalite[u.id] || ''}
                              onChange={(e) => setSelectedMunicipalite({ ...selectedMunicipalite, [u.id]: e.target.value })}>
                              <option value="">-- Choisir une municipalité --</option>
                              {municipalites.map(m => <option key={m.id} value={m.id}>{m.nom}</option>)}
                            </select>
                          </td>
                          <td className="admin-actions-cell">
                            <button className="admin-btn-accept" onClick={() => handleAccepter(u.id)}>Accepter</button>
                            <button className="admin-btn-refuse" onClick={() => handleRefuser(u.id)}>Refuser</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            )}

            {activeTab === 'tous' && (
              <div className="admin-table-container">
                <h2 className="admin-section-title">Tous les utilisateurs</h2>
                <table className="admin-data-table">
                  <thead><tr><th>Nom</th><th>Email</th><th>Statut</th><th>Municipalité affectée</th></tr></thead>
                  <tbody>
                    {allUsers.map(u => (
                      <tr key={u.id}>
                        <td><strong>{u.nom}</strong></td>
                        <td>{u.email}</td>
                        <td>{getStatutBadge(u.statut)}</td>
                        <td>{u.municipaliteNom || <span style={{ color:'#9ca3af' }}>Non affecté</span>}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {activeTab === 'parametres-tib' && (
              <TIBAdminPage showMsg={showMessage} />
            )}

            {activeTab === 'parametres-tnb' && (
              <TNBAdminPage showMsg={showMessage} />
            )}

            {activeTab === 'municipalites' && (
              <div className="admin-table-container">
                <h2 className="admin-section-title">Municipalités de Tunis</h2>
                <div className="admin-muni-grid">
                  {municipalites.map(m => (
                    <div key={m.id} className="admin-muni-card">
                      <div className="admin-muni-icon"><IconMunicipalite size={32} style={{ color: '#1A3A5C' }} /></div>
                      <div className="admin-muni-name">{m.nom}</div>
                      <div className="admin-muni-info">{m.secteurs?.length || 0} secteur(s)</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
};

export default DashboardAdmin;