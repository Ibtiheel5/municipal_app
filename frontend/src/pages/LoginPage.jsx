// LoginPage.jsx - Version moderne et professionnelle
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './LoginPage.css';

// ── SVG Icons ─────────────────────────────────────────────────────────────────
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
        <polygon
          points="15.75,7.75 16.25,9.31 17.89,9.31 16.56,10.26 17.07,11.82 15.75,10.85 14.43,11.82 14.94,10.26 13.61,9.31 15.25,9.31"
          fill="#E70013"
        />
      </svg>
    ),
    TunisiaFlagLarge: () => (
      <svg viewBox="0 0 120 80" width="120" height="80">
        <rect width="120" height="80" fill="#E70013"/>
        <circle cx="60" cy="40" r="26" fill="white"/>
        <circle cx="56" cy="40" r="20" fill="#E70013"/>
        <circle cx="66" cy="40" r="15" fill="white"/>
        <polygon
          points="63,31 65.0,37.25 71.56,37.22 66.23,41.05 68.29,47.28 63,43.4 57.71,47.28 59.77,41.05 54.44,37.22 61.0,37.25"
          fill="#E70013"
        />
      </svg>
    ),
  Email: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
      <polyline points="22,6 12,13 2,6"/>
    </svg>
  ),
  Lock: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
      <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
    </svg>
  ),
  Eye: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
      <circle cx="12" cy="12" r="3"/>
    </svg>
  ),
  EyeOff: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
      <line x1="1" y1="1" x2="23" y2="23"/>
    </svg>
  ),
  ArrowRight: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="5" y1="12" x2="19" y2="12"/>
      <polyline points="12,5 19,12 12,19"/>
    </svg>
  ),
  Shield: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
    </svg>
  ),
  Check: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20,6 9,17 4,12"/>
    </svg>
  ),
};

const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  useEffect(() => {
    // Récupérer l'email sauvegardé
    const savedEmail = localStorage.getItem('rememberedEmail');
    if (savedEmail) {
      setFormData(prev => ({ ...prev, email: savedEmail }));
      setRememberMe(true);
    }
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const data = await login(formData);

      // Sauvegarder l'email si "Se souvenir de moi" est coché
      if (rememberMe) {
        localStorage.setItem('rememberedEmail', formData.email);
      } else {
        localStorage.removeItem('rememberedEmail');
      }

      if (data.role === 'ADMIN') {
        navigate('/admin/dashboard');
      } else if (data.statut === 'EN_ATTENTE') {
        setError('Votre compte est en attente de validation par un administrateur.');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      } else if (data.statut === 'REFUSE') {
        setError('Votre demande d\'accès a été refusée. Contactez l\'administrateur.');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      } else {
        // ⬅ MODIFIÉ : on n'atterrit plus directement sur le Dashboard
        // Municipalité — l'utilisateur choisit d'abord son espace
        // (Municipalité ou Recettes), deux dashboards indépendants.
        navigate('/user/choix');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Email ou mot de passe incorrect.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      {/* Background avec effet */}
      <div className="login-bg">
        <div className="login-bg-pattern" />
        <div className="login-bg-glow" />
        <div className="login-bg-grid" />
      </div>

      {/* Container principal */}
      <div className="login-container">
        {/* Côté gauche - Formulaire */}
        <div className="login-left">
          <div className="login-card">
            {/* En-tête */}
            <div className="login-header">
              <div className="login-logo">
                <Icons.Logo />
                <div className="login-logo-text">
                  <span className="login-logo-title">Baladiya</span>
                  <span className="login-logo-sub">Smart Management</span>
                </div>
              </div>
              <div className="login-flag">
                <Icons.TunisiaFlag />
              </div>
            </div>

            <div className="login-welcome">
              <h1>Bienvenue</h1>
              <p>Connectez-vous à votre espace municipal</p>
            </div>

            {/* Formulaire */}
            <form onSubmit={handleSubmit} className="login-form">
              {error && (
                <div className="login-error">
                  <Icons.Shield />
                  <span>{error}</span>
                </div>
              )}

              <div className="form-group">
                <label>Adresse email</label>
                <div className="input-wrapper">
                  <span className="input-icon">
                    <Icons.Email />
                  </span>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="exemple@baladiya.tn"
                    required
                    autoFocus
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Mot de passe</label>
                <div className="input-wrapper">
                  <span className="input-icon">
                    <Icons.Lock />
                  </span>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="••••••••"
                    required
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <Icons.EyeOff /> : <Icons.Eye />}
                  </button>
                </div>
              </div>

              <div className="form-options">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                  />
                  <span className="checkmark">
                    {rememberMe && <Icons.Check />}
                  </span>
                  Se souvenir de moi
                </label>
                <Link to="/forgot-password" className="forgot-link">
                  Mot de passe oublié ?
                </Link>
              </div>

              <button type="submit" disabled={loading} className="login-btn">
                {loading ? (
                  <span className="loader">Connexion...</span>
                ) : (
                  <>
                    Se connecter
                    <Icons.ArrowRight />
                  </>
                )}
              </button>
            </form>

            <div className="login-footer">
              <p>
                Pas encore de compte ?{' '}
                <Link to="/register" className="register-link">
                  S'inscrire
                </Link>
              </p>
            </div>
          </div>
        </div>

        {/* Côté droit - Illustration */}
        <div className="login-right">
          <div className="login-right-content">
            <div className="login-right-flag">
              <Icons.TunisiaFlagLarge />
            </div>
            <h2>Plateforme de gestion municipale</h2>
            <p>
              Gérez efficacement votre municipalité, ses secteurs et ses routes
              grâce à notre solution intelligente.
            </p>
            <div className="login-right-features">
              <div className="feature-item">
                <Icons.Check />
                <span>Gestion centralisée</span>
              </div>
              <div className="feature-item">
                <Icons.Check />
                <span>Données en temps réel</span>
              </div>
              <div className="feature-item">
                <Icons.Check />
                <span>Sécurisé et fiable</span>
              </div>
            </div>
            <div className="login-right-footer">
              <span>République Tunisienne</span>
              <span>•</span>
              <span>Ministère de l'Intérieur</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
