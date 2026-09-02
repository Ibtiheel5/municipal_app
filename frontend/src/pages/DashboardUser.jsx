// DashboardUser.jsx - Version corrigée
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import UserService from '../services/userService';
import DashboardHome from './DashboardHome';
import SecteursPage from './SecteursPage';
import RoutesPage from './RoutesPage';
import ProprietairesPage from './ProprietairesPage';
import TIBPage from './TIBPage';
import TNBPage from './TNBPage';
import './DashboardUser.css';

// ⬇️ SI LE FICHIER N'EXISTE PAS, COMMENTEZ CETTE LIGNE ⬇️
import RisquePage from './RisquePage';

// ── Logo depuis le dossier public ──────────────────────────────────────────
const Logo = () => (
  <img
    src="/municipalite.png"
    alt="Municipalité"
    style={{ height: '40px', width: 'auto', objectFit: 'contain' }}
  />
);

// ── Toutes les icônes (centralisées) ──────────────────────────────────────
export const Icons = {
  TunisiaFlag: () => (
    <svg viewBox="0 0 30 20" width="30" height="20">
      <rect width="30" height="20" fill="#E70013"/>
      <circle cx="15" cy="10" r="6.5" fill="white"/>
      <circle cx="14" cy="10" r="5" fill="#E70013"/>
      <circle cx="16.5" cy="10" r="3.75" fill="white"/>
      <polygon points="15.75,7.75 16.25,9.31 17.89,9.31 16.56,10.26 17.07,11.82 15.75,10.85 14.43,11.82 14.94,10.26 13.61,9.31 15.25,9.31" fill="#E70013"/>
    </svg>
  ),
  Dashboard: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/>
      <rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>
    </svg>
  ),
  Secteur: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
    </svg>
  ),
  Road: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/>
    </svg>
  ),
  User: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
    </svg>
  ),
  Logout: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16,17 21,12 16,7"/><line x1="21" y1="12" x2="9" y2="12"/>
    </svg>
  ),
  Building: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="4" y="2" width="16" height="20" rx="2"/><line x1="8" y1="6" x2="16" y2="6"/><line x1="8" y1="10" x2="16" y2="10"/>
      <line x1="8" y1="14" x2="16" y2="14"/><line x1="8" y1="18" x2="12" y2="18"/>
    </svg>
  ),
  Calculator: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="4" y="2" width="16" height="20" rx="2"/><line x1="8" y1="6" x2="16" y2="6"/><line x1="8" y1="10" x2="16" y2="10"/>
      <line x1="8" y1="14" x2="12" y2="14"/><line x1="16" y1="14" x2="16" y2="14"/><line x1="8" y1="18" x2="12" y2="18"/><line x1="16" y1="18" x2="16" y2="18"/>
    </svg>
  ),
  Refresh: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="23,4 23,11 16,11"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 11"/>
    </svg>
  ),
  Land: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 3v18h18"/><path d="M3 15l5-4 4 4 5-5 4 4"/>
    </svg>
  ),
  Menu: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/>
    </svg>
  ),
  Close: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
    </svg>
  ),
  Users: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
      <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
    </svg>
  ),
  Activity: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="22,12 18,12 15,21 9,3 6,12 2,12"/>
    </svg>
  ),
  ArrowRight: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12,5 19,12 12,19"/>
    </svg>
  ),
  MapPin: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
    </svg>
  ),
  Check: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20,6 9,17 4,12"/>
    </svg>
  ),
  Wallet: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/>
    </svg>
  ),
  TrendingUp: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="23,6 13.5,15.5 8.5,10.5 1,18"/><polyline points="17,6 23,6 23,12"/>
    </svg>
  ),
  PieChart: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21.21 15.89A10 10 0 1 1 8 2.83"/><path d="M22 12A10 10 0 0 0 12 2v10z"/>
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
  Zap: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="13,2 3,14 12,14 11,22 21,10 12,10" />
    </svg>
  ),
  Plus: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  ),
  BarChart: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="20" x2="12" y2="10" />
      <line x1="18" y1="20" x2="18" y2="4" />
      <line x1="6" y1="20" x2="6" y2="16" />
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
  // ⬇️ AJOUTER SI BESOIN ⬇️
  Shield: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
    </svg>
  ),
};

const DashboardUser = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [municipalite, setMunicipalite] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState({ text: '', type: '' });
  const [refreshKey, setRefreshKey] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    loadData();
  }, [refreshKey]);

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await UserService.getMaMunicipalite();
      setMunicipalite(data);
      setError('');
    } catch (err) {
      console.error('Erreur de chargement:', err);
      setError('Aucune municipalité affectée à votre compte.');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
  };

  const showMsg = (text, type) => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: '', type: '' }), 3000);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const tabs = [
    { id: 'dashboard', label: 'Accueil', icon: <Icons.Dashboard /> },
    { id: 'secteurs', label: 'Secteurs', icon: <Icons.Secteur /> },
    { id: 'routes', label: 'Routes', icon: <Icons.Road /> },
    { id: 'proprietaires', label: 'Propriétaires', icon: <Icons.User /> },
    { id: 'tib', label: 'TIB', icon: <Icons.Calculator /> },
    { id: 'tnb', label: 'TNB', icon: <Icons.Land /> },
    // ⬇️ ONGLET RISQUE (commenté si RisquePage n'existe pas) ⬇️
    { id: 'risque', label: 'Risque', icon: <Icons.Shield /> },
  ];

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="dashboard-loading-spinner" />
        <span>Chargement de votre espace...</span>
      </div>
    );
  }

  return (
    <div className="dashboard-wrapper">
      {/* TOP BAR */}
      <header className="dashboard-topbar">
        <div className="topbar-left">
          <button className="mobile-toggle" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <Icons.Close /> : <Icons.Menu />}
          </button>
          <div className="dashboard-logo">
            <Logo />
            <div className="logo-text">
              <span className="logo-title">Municipalité</span>
              <span className="logo-sub">Gestion municipale</span>
            </div>
          </div>
          <div className="topbar-flag">
            <Icons.TunisiaFlag />
          </div>
        </div>
        <div className="topbar-right">
          <button className="btn-refresh" onClick={handleRefresh} title="Rafraîchir">
            <Icons.Refresh />
          </button>
          <div className="user-profile">
            <div className="user-avatar">
              <Icons.User />
            </div>
            <div className="user-info">
              <span className="user-name">{user?.nom || 'Utilisateur'}</span>
              <span className="user-role">{municipalite?.nom || 'Municipalité'}</span>
            </div>
          </div>
          <button className="btn-logout" onClick={handleLogout}>
            <Icons.Logout />
            <span>Déconnexion</span>
          </button>
        </div>
      </header>

      {/* BODY */}
      <div className="dashboard-body">
        <nav className={`dashboard-sidebar ${mobileMenuOpen ? 'open' : ''}`}>
          <div className="sidebar-menu">
            {tabs.map(tab => (
              <button
                key={tab.id}
                className={`sidebar-item ${activeTab === tab.id ? 'active' : ''}`}
                onClick={() => {
                  setActiveTab(tab.id);
                  setMobileMenuOpen(false);
                }}
              >
                <span className="sidebar-icon">{tab.icon}</span>
                <span className="sidebar-label">{tab.label}</span>
              </button>
            ))}
          </div>
          <div className="sidebar-footer">
            <span className="sidebar-version">v3.0</span>
          </div>
        </nav>

        <main className="dashboard-main-content">
          {message.text && (
            <div className={`dashboard-alert dashboard-alert-${message.type}`}>
              <span>{message.text}</span>
            </div>
          )}

          {error && (
            <div className="dashboard-alert dashboard-alert-error">
              <span>{error}</span>
            </div>
          )}

          {!error && municipalite && (!municipalite.secteurs || municipalite.secteurs.length === 0) && (
            <div className="dashboard-alert dashboard-alert-warning">
              <span>Aucun secteur trouvé. Ajoutez votre premier secteur !</span>
            </div>
          )}

          <div className="tab-content">
            {activeTab === 'dashboard' && (
              <DashboardHome key={refreshKey} municipalite={municipalite} user={user} />
            )}
            {activeTab === 'secteurs' && (
              <SecteursPage key={refreshKey} municipalite={municipalite} onRefresh={loadData} showMsg={showMsg} />
            )}
            {activeTab === 'routes' && (
              <RoutesPage key={refreshKey} municipalite={municipalite} onRefresh={loadData} showMsg={showMsg} />
            )}
            {activeTab === 'proprietaires' && (
              <ProprietairesPage showMsg={showMsg} />
            )}
            {activeTab === 'tib' && (
              <TIBPage user={user} showMsg={showMsg} />
            )}
            {activeTab === 'tnb' && (
              <TNBPage user={user} showMsg={showMsg} />
            )}
            {/* ⬇️ ONGLET RISQUE (commenté) ⬇️ */}
            {activeTab === 'risque' && <RisquePage showMsg={showMsg} />}
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardUser;