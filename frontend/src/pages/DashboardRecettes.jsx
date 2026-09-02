// DashboardRecettes.jsx - Dashboard Recettes (module financier indépendant)
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import UserService from '../services/userService';
import RecettesPage from './RecettesPage';
import ReleveComptePage from './ReleveComptePage';
import DashboardRecettesHome from './DashboardRecettesHome';  // ⬅ IMPORT AJOUTÉ
import ComingSoonPage from './ComingSoonPage';
import './DashboardUser.css';
import './DashboardRecettes.css';
import AvisPage from './AvisPage';
import PaiementsPage from './PaiementsPage';
import HistoriquePage from './HistoriquePage';
import RapportsPage from './RapportsPage';
import ParametresRecettesPage from './ParametresRecettesPage';
import PrevisionPage from './PrevisionPage';

// ── SVG Icons ────────────────────────────────────────────────────────────
const Icons = {
  Logo: () => (
    <svg viewBox="0 0 40 40" fill="none">
      <rect x="3" y="20" width="34" height="17" rx="2" stroke="#C8102E" strokeWidth="1.5"/>
      <path d="M10 20V12a10 10 0 0 1 20 0v8" stroke="#C8102E" strokeWidth="1.5" strokeLinecap="round"/>
      <rect x="16" y="25" width="8" height="12" rx="1" fill="#C8102E"/>
      <circle cx="20" cy="12" r="3" fill="#C8102E"/>
      <line x1="20" y1="3" x2="20" y2="7" stroke="#C8102E" strokeWidth="1.5"/>
    </svg>
  ),
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
      <rect x="3" y="3" width="7" height="7" rx="1"/>
      <rect x="14" y="3" width="7" height="7" rx="1"/>
      <rect x="3" y="14" width="7" height="7" rx="1"/>
      <rect x="14" y="14" width="7" height="7" rx="1"/>
    </svg>
  ),
  Coins: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="8" cy="8" r="6"/>
      <path d="M18.09 10.37A6 6 0 1 1 10.34 18"/>
      <path d="M7 6h1v4"/>
      <path d="m16.71 13.88.7.71-2.82 2.82"/>
    </svg>
  ),
  FileText: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
      <polyline points="14,2 14,8 20,8"/>
    </svg>
  ),
  Search: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8"/>
      <line x1="21" y1="21" x2="16.65" y2="16.65"/>
    </svg>
  ),
  CreditCard: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="1" y="4" width="22" height="16" rx="2"/>
      <line x1="1" y1="10" x2="23" y2="10"/>
    </svg>
  ),
  Clock: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/>
      <polyline points="12,6 12,12 16,14"/>
    </svg>
  ),
  BarChart: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="20" x2="12" y2="10"/>
      <line x1="18" y1="20" x2="18" y2="4"/>
      <line x1="6" y1="20" x2="6" y2="16"/>
    </svg>
  ),
  Settings: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3"/>
      <path d="M12,1v2 M12,21v2 M4.22,4.22l1.42,1.42 M18.36,18.36l1.42,1.42 M1,12h2 M21,12h2 M4.22,19.78l1.42-1.42 M18.36,5.64l1.42-1.42"/>
    </svg>
  ),
  User: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
      <circle cx="12" cy="7" r="4"/>
    </svg>
  ),
  Logout: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
      <polyline points="16,17 21,12 16,7"/>
      <line x1="21" y1="12" x2="9" y2="12"/>
    </svg>
  ),
  TrendingUp: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="23,6 13.5,15.5 8.5,10.5 1,18"/>
      <polyline points="17,6 23,6 23,12"/>
    </svg>
  ),
};

const DashboardRecettes = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('accueil');
  const [municipalite, setMunicipalite] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ text: '', type: '' });

  useEffect(() => {
    (async () => {
      try {
        const data = await UserService.getMaMunicipalite();
        setMunicipalite(data);
      } catch {
        // Non bloquant
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const showMsg = (text, type) => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: '', type: '' }), 3000);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const tabs = [
    { id: 'accueil', label: 'Tableau de bord', icon: <Icons.Dashboard /> },
    { id: 'toutes', label: 'Toutes les recettes', icon: <Icons.Coins /> },
    { id: 'releve', label: 'Relevé de compte', icon: <Icons.Search /> },
    { id: 'avis', label: 'Avis', icon: <Icons.FileText /> },
    { id: 'paiements', label: 'Paiements', icon: <Icons.CreditCard /> },
    { id: 'historique', label: 'Historique', icon: <Icons.Clock /> },
    { id: 'rapports', label: 'Rapports', icon: <Icons.BarChart /> },
    { id: 'parametres', label: 'Paramètres', icon: <Icons.Settings /> },
    { id: 'prevision', label: 'Prévision', icon: <Icons.TrendingUp /> },
  ];

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="dashboard-loading-spinner" />
        <span>Chargement du Dashboard Recettes...</span>
      </div>
    );
  }

  return (
    <div className="dashboard-page">
      {/* ── NAVBAR ── */}
      <nav className="dashboard-nav">
        <div className="dashboard-nav-left">
          <div className="dashboard-logo">
            <Icons.Logo />
            <div className="dashboard-logo-text">
              <span className="dashboard-logo-title">Baladiya</span>
              <span className="dashboard-logo-sub">Dashboard Recettes</span>
            </div>
          </div>
          <div className="dashboard-flag">
            <Icons.TunisiaFlag />
          </div>
        </div>

        <div className="dashboard-nav-right">
          <div className="dashboard-user-info">
            <div className="dashboard-user-avatar">
              <Icons.User />
            </div>
            <div className="dashboard-user-details">
              <span className="dashboard-user-name">{user?.nom || 'Utilisateur'}</span>
              <span className="dashboard-user-role">{municipalite?.nom || 'Municipalité'}</span>
            </div>
          </div>
          <button onClick={handleLogout} className="dashboard-logout-btn">
            <Icons.Logout />
            <span>Déconnexion</span>
          </button>
        </div>
      </nav>

      {/* ── MAIN CONTENT ── */}
      <main className="dashboard-main">
        <div className="dashboard-content">
          {message.text && (
            <div className={`dashboard-alert dashboard-alert-${message.type}`}>
              <span>{message.text}</span>
            </div>
          )}

          {/* ── TABS ── */}
          <div className="dashboard-tabs">
            {tabs.map(tab => (
              <button
                key={tab.id}
                className={`dashboard-tab ${activeTab === tab.id ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                <span className="dashboard-tab-icon">{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          {/* ── CONTENT ── */}
          <div className="dashboard-tab-content">
            {activeTab === 'accueil' && (
              <DashboardRecettesHome showMsg={showMsg} />
            )}
            {activeTab === 'toutes' && (
              <RecettesPage user={user} showMsg={showMsg} />
            )}
            {activeTab === 'releve' && (
              <ReleveComptePage showMsg={showMsg} />
            )}
            {activeTab === 'avis' && <AvisPage showMsg={showMsg} />}
            {activeTab === 'paiements' && <PaiementsPage showMsg={showMsg} />}
            {activeTab === 'historique' && <HistoriquePage showMsg={showMsg} />}
            {activeTab === 'rapports' && <RapportsPage showMsg={showMsg} />}
            {activeTab === 'prevision' && <PrevisionPage showMsg={showMsg} />}
            {activeTab === 'parametres' && <ParametresRecettesPage showMsg={showMsg} />}
          </div>
        </div>
      </main>
    </div>
  );
};

export default DashboardRecettes;