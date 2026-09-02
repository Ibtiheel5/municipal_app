// RegisterPage.jsx - Version moderne et professionnelle avec drapeau tunisien
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './RegisterPage.css';

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
  User: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
      <circle cx="12" cy="7" r="4"/>
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
  Success: () => (
    <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="32" cy="32" r="30"/>
      <polyline points="20,32 28,40 44,24"/>
    </svg>
  ),
};

const RegisterPage = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ nom: '', email: '', password: '', confirmPassword: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: '' });
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.nom.trim()) newErrors.nom = 'Le nom est obligatoire';
    if (!formData.email.trim()) newErrors.email = "L'email est obligatoire";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email invalide';
    }
    if (formData.password.length < 6) newErrors.password = 'Minimum 6 caractères';
    if (formData.password !== formData.confirmPassword)
      newErrors.confirmPassword = 'Les mots de passe ne correspondent pas';
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) { setErrors(validationErrors); return; }
    setLoading(true);
    try {
      await register({ nom: formData.nom, email: formData.email, password: formData.password });
      setSuccess(true);
    } catch (err) {
      const serverErrors = err.response?.data?.errors || {};
      const message = err.response?.data?.message || '';
      if (message) setErrors({ general: message });
      else setErrors(serverErrors);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="register-page">
        <div className="register-bg">
          <div className="register-bg-pattern" />
          <div className="register-bg-glow" />
          <div className="register-bg-grid" />
        </div>

        <div className="register-container">
          <div className="register-success">
            <div className="register-success-icon">
              <Icons.Success />
            </div>
            <h2>Inscription réussie !</h2>
            <p>
              Votre compte est en attente de validation par un administrateur.<br />
              Vous recevrez une confirmation une fois votre compte activé.
            </p>
            <Link to="/login" className="register-success-btn">
              Retour à la connexion
              <Icons.ArrowRight />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="register-page">
      {/* Background avec effet */}
      <div className="register-bg">
        <div className="register-bg-pattern" />
        <div className="register-bg-glow" />
        <div className="register-bg-grid" />
      </div>

      {/* Container principal */}
      <div className="register-container">
        {/* Côté gauche - Formulaire */}
        <div className="register-left">
          <div className="register-card">
            {/* En-tête */}
            <div className="register-header">
              <div className="register-logo">
                <Icons.Logo />
                <div className="register-logo-text">
                  <span className="register-logo-title">Baladiya</span>
                  <span className="register-logo-sub">Smart Management</span>
                </div>
              </div>
              <div className="register-flag">
                <Icons.TunisiaFlag />
              </div>
            </div>

            <div className="register-welcome">
              <h1>Créer un compte</h1>
              <p>Inscrivez-vous pour accéder à votre espace municipal</p>
            </div>

            {/* Formulaire */}
            <form onSubmit={handleSubmit} className="register-form">
              {errors.general && (
                <div className="register-error">
                  <Icons.Shield />
                  <span>{errors.general}</span>
                </div>
              )}

              <div className="form-group">
                <label>Nom complet</label>
                <div className="input-wrapper">
                  <span className="input-icon">
                    <Icons.User />
                  </span>
                  <input
                    type="text"
                    name="nom"
                    value={formData.nom}
                    onChange={handleChange}
                    placeholder="Prénom Nom"
                    required
                  />
                </div>
                {errors.nom && <span className="field-error">{errors.nom}</span>}
              </div>

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
                  />
                </div>
                {errors.email && <span className="field-error">{errors.email}</span>}
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
                    placeholder="Minimum 6 caractères"
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
                {errors.password && <span className="field-error">{errors.password}</span>}
              </div>

              <div className="form-group">
                <label>Confirmer le mot de passe</label>
                <div className="input-wrapper">
                  <span className="input-icon">
                    <Icons.Lock />
                  </span>
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="••••••••"
                    required
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? <Icons.EyeOff /> : <Icons.Eye />}
                  </button>
                </div>
                {errors.confirmPassword && <span className="field-error">{errors.confirmPassword}</span>}
              </div>

              <button type="submit" disabled={loading} className="register-btn">
                {loading ? (
                  <span className="loader">Inscription...</span>
                ) : (
                  <>
                    S'inscrire
                    <Icons.ArrowRight />
                  </>
                )}
              </button>
            </form>

            <div className="register-footer">
              <p>
                Déjà un compte ?{' '}
                <Link to="/login" className="login-link">
                  Se connecter
                </Link>
              </p>
            </div>
          </div>
        </div>

        {/* Côté droit - Illustration */}
        <div className="register-right">
          <div className="register-right-content">
            <div className="register-right-flag">
              <Icons.TunisiaFlagLarge />
            </div>
            <h2>Plateforme de gestion municipale</h2>
            <p>
              Rejoignez la plateforme officielle de gestion municipale tunisienne
              et facilitez l'administration de votre territoire.
            </p>
            <div className="register-right-features">
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
            <div className="register-right-footer">
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

export default RegisterPage;