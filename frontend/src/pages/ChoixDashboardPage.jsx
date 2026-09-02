// ChoixDashboardPage.jsx - Écran de choix après connexion
// Le Dashboard Municipalité et le Dashboard Recettes sont deux espaces
// totalement indépendants : aucun bouton pour passer de l'un à l'autre une
// fois dedans. Ce choix se fait une seule fois, ici, juste après le login.
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './ChoixDashboardPage.css';

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
  Building: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <rect x="4" y="2" width="16" height="20" rx="2"/>
      <line x1="8" y1="6" x2="16" y2="6"/><line x1="8" y1="10" x2="16" y2="10"/>
      <line x1="8" y1="14" x2="16" y2="14"/><line x1="8" y1="18" x2="12" y2="18"/>
    </svg>
  ),
  Coins: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="8" cy="8" r="6"/><path d="M18.09 10.37A6 6 0 1 1 10.34 18"/><path d="M7 6h1v4"/><path d="m16.71 13.88.7.71-2.82 2.82"/>
    </svg>
  ),
  ArrowRight: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12,5 19,12 12,19"/>
    </svg>
  ),
  Logout: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16,17 21,12 16,7"/><line x1="21" y1="12" x2="9" y2="12"/>
    </svg>
  ),
};

export default function ChoixDashboardPage() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="choix-page">
      <div className="choix-topbar">
        <div className="choix-logo">
          <Icons.Logo />
          <div className="choix-logo-text">
            <span className="choix-logo-title">Baladiya</span>
            <span className="choix-logo-sub">Smart Management</span>
          </div>
        </div>
        <div className="choix-topbar-right">
          <Icons.TunisiaFlag />
          <button className="choix-logout-btn" onClick={handleLogout}>
            <Icons.Logout />
            <span>Déconnexion</span>
          </button>
        </div>
      </div>

      <div className="choix-content">
        <h1>Bienvenue{user?.nom ? `, ${user.nom}` : ''}</h1>
        <p>Choisissez l'espace que vous souhaitez ouvrir</p>

        <div className="choix-cards">
          <button className="choix-card choix-card-municipalite" onClick={() => navigate('/user/dashboard')}>
            <div className="choix-card-icon">
              <Icons.Building />
            </div>
            <h2>Dashboard Municipalité</h2>
            <p>Secteurs, routes, propriétaires, taxes TIB et TNB — gestion administrative complète.</p>
            <span className="choix-card-cta">Ouvrir <Icons.ArrowRight /></span>
          </button>

          <button className="choix-card choix-card-recettes" onClick={() => navigate('/user/recettes')}>
            <div className="choix-card-icon">
              <Icons.Coins />
            </div>
            <h2>Dashboard Recettes</h2>
            <p>Suivi financier des recettes, avis et paiements générés automatiquement par la Municipalité.</p>
            <span className="choix-card-cta">Ouvrir <Icons.ArrowRight /></span>
          </button>
        </div>
      </div>
    </div>
  );
}
