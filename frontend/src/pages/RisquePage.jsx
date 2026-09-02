// src/pages/RisquePage.jsx
import React, { useState } from 'react';
import './RisquePage.css';

const API_IA_URL = process.env.REACT_APP_IA_URL || 'http://localhost:8001';

// ── Icônes SVG ──────────────────────────────────────────────────────────────
const Icons = {
  Shield: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
    </svg>
  ),
  Search: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8"/>
      <line x1="21" y1="21" x2="16.65" y2="16.65"/>
    </svg>
  ),
  User: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
      <circle cx="12" cy="7" r="4"/>
    </svg>
  ),
  TrendingUp: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="23,6 13.5,15.5 8.5,10.5 1,18"/>
      <polyline points="17,6 23,6 23,12"/>
    </svg>
  ),
  PieChart: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21.21 15.89A10 10 0 1 1 8 2.83"/>
      <path d="M22 12A10 10 0 0 0 12 2v10z"/>
    </svg>
  ),
  Refresh: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="23,4 23,11 16,11"/>
      <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 11"/>
    </svg>
  ),
  Info: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/>
      <line x1="12" y1="12" x2="12" y2="16"/>
      <line x1="12" y1="8" x2="12.01" y2="8"/>
    </svg>
  ),
  Check: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20,6 9,17 4,12"/>
    </svg>
  ),
  Alert: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/>
      <line x1="12" y1="8" x2="12" y2="12"/>
      <line x1="12" y1="16" x2="12.01" y2="16"/>
    </svg>
  ),
  Circle: ({ color }) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="6" fill={color || 'currentColor'}/>
    </svg>
  ),
};

export default function RisquePage({ showMsg }) {
  const [proprietaireId, setProprietaireId] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [entrainementEnCours, setEntrainementEnCours] = useState(false);

  // ── Évaluer le risque ──────────────────────────────────────────────────────
  const getRisque = async () => {
    if (!proprietaireId) {
      showMsg('Veuillez saisir un ID de propriétaire.', 'error');
      return;
    }
    setLoading(true);
    try {
      const response = await fetch(`${API_IA_URL}/api/ai/risque/${proprietaireId}`);
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Erreur lors de la prédiction');
      }
      const data = await response.json();
      setResult(data);
      showMsg('Évaluation du risque terminée avec succès', 'success');
    } catch (error) {
      showMsg(error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  // ── Entraîner le modèle ──────────────────────────────────────────────────
  const entrainerModele = async () => {
    setEntrainementEnCours(true);
    try {
      const response = await fetch(`${API_IA_URL}/api/ai/risque/train?force=true`, {
        method: 'POST',
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Erreur lors de l\'entraînement');
      }
      const data = await response.json();
      showMsg(`Modèle entraîné avec succès (${data.nb_samples} échantillons)`, 'success');
    } catch (error) {
      showMsg(error.message, 'error');
    } finally {
      setEntrainementEnCours(false);
    }
  };

  // ── Helpers d'affichage ──────────────────────────────────────────────────
  const getLevelInfo = (niveau) => {
    const levels = {
      faible: { color: '#22c55e', bg: '#dcfce7', icon: 'check' },
      moyen: { color: '#eab308', bg: '#fef3c7', icon: 'alert' },
      eleve: { color: '#f97316', bg: '#ffedd5', icon: 'alert' },
      critique: { color: '#ef4444', bg: '#fee2e2', icon: 'alert' },
    };
    return levels[niveau] || { color: '#6b7280', bg: '#f3f4f6', icon: 'info' };
  };

  const getClasseLabel = (classe) => {
    const labels = {
      0: 'Faible',
      1: 'Moyen',
      2: 'Élevé',
      3: 'Critique',
    };
    return labels[classe] || 'Inconnu';
  };

  const getClasseColor = (classe) => {
    const colors = {
      0: '#22c55e',
      1: '#eab308',
      2: '#f97316',
      3: '#ef4444',
    };
    return colors[classe] || '#6b7280';
  };

  // ── Rendu ──────────────────────────────────────────────────────────────────
  return (
    <div className="risque-page">
      <div className="risque-header">
        <h1>
          <Icons.Shield /> Scoring de risque de retard
        </h1>
        <p>
          Évaluez le risque de retard ou d'impayé d'un propriétaire à partir de son historique fiscal
        </p>
      </div>

      {/* ── Barre de recherche ── */}
      <div className="risque-search-card">
        <div className="risque-search-body">
          <div className="risque-search-grid">
            <div className="risque-search-item">
              <label>
                <Icons.User /> ID du propriétaire
              </label>
              <input
                type="number"
                className="risque-input"
                placeholder="Ex: 1, 39, 40, 41..."
                value={proprietaireId}
                onChange={(e) => setProprietaireId(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && getRisque()}
                min="1"
              />
            </div>
            <div className="risque-search-actions">
              <button
                className="btn-evaluer"
                onClick={getRisque}
                disabled={loading}
              >
                <Icons.Search /> {loading ? 'Chargement...' : 'Évaluer'}
              </button>
            </div>
            <div className="risque-search-actions">
              <button
                className="btn-retrain"
                onClick={entrainerModele}
                disabled={entrainementEnCours}
              >
                <Icons.Refresh /> {entrainementEnCours ? 'Entraînement...' : 'Réentraîner'}
              </button>
            </div>
          </div>
          <div className="risque-hint">
            <Icons.Info />
            Le modèle utilise 11 features : nombre d'avis, retards, paiements, superficie, montants.
            Score de 0 (faible risque) à 100 (risque critique).
          </div>
        </div>
      </div>

      {/* ── Résultat ── */}
      {result && (
        <div className="risque-result-card">
          <div className="risque-result-body">
            {/* En-tête */}
            <div className="risque-result-header">
              <div className="risque-proprietaire">
                <label>Propriétaire ID</label>
                <span className="risque-proprietaire-value">#{result.proprietaire_id}</span>
              </div>
              <div
                className="risque-badge"
                style={{
                  background: getLevelInfo(result.niveau).bg,
                  color: getLevelInfo(result.niveau).color
                }}
              >
                {result.niveau} — Score: {result.score}/100
              </div>
            </div>

            {/* Grille d'informations */}
            <div className="risque-info-grid">
              <div className="risque-info-item">
                <label>Niveau de risque</label>
                <span className="large" style={{ color: getLevelInfo(result.niveau).color }}>
                  {result.niveau}
                </span>
              </div>
              <div className="risque-info-item">
                <label>Score</label>
                <span className="large">{result.score}/100</span>
              </div>
              <div className="risque-info-item">
                <label>Classe</label>
                <span className="large" style={{ color: getClasseColor(result.classe) }}>
                  {getClasseLabel(result.classe)}
                </span>
              </div>
            </div>

            {/* Probabilités */}
            <div className="risque-probabilities">
              <div className="risque-probabilities-title">
                <Icons.PieChart /> Probabilités par classe
              </div>
              <div className="risque-prob-grid">
                {[
                  { key: 'faible', label: 'Faible', color: '#22c55e' },
                  { key: 'moyen', label: 'Moyen', color: '#eab308' },
                  { key: 'eleve', label: 'Élevé', color: '#f97316' },
                  { key: 'critique', label: 'Critique', color: '#ef4444' },
                ].map((item) => {
                  const value = result.probabilites[item.key] || 0;
                  const isHighlight = value > 0.5;
                  return (
                    <div
                      key={item.key}
                      className={`risque-prob-item ${isHighlight ? 'highlight' : ''}`}
                      style={{ borderColor: isHighlight ? item.color : '#E2E8F0' }}
                    >
                      <span className="label" style={{ color: item.color }}>
                        <Icons.Circle color={item.color} /> {item.label}
                      </span>
                      <span className="value" style={{ color: item.color }}>
                        {(value * 100).toFixed(1)}%
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Features */}
            <div className="risque-features">
              <div className="risque-features-title">
                <Icons.TrendingUp /> Features utilisées
              </div>
              <div className="risque-features-grid">
                {Object.entries(result.features).map(([key, value]) => (
                  <div key={key} className="risque-feature-item">
                    <span className="key">{key}:</span>
                    <span className="value">
                      {typeof value === 'number' ? value.toFixed(2) : value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── État vide ── */}
      {!result && !loading && (
        <div className="risque-empty">
          <Icons.Shield />
          <h3>Aucune évaluation effectuée</h3>
          <p>Saisissez un ID de propriétaire et cliquez sur "Évaluer"</p>
          <div className="hint">Exemples d'IDs : 1, 39, 40, 41</div>
        </div>
      )}

      {/* ── Loading ── */}
      {loading && (
        <div className="risque-loading">
          <div className="spinner" />
          <span>Calcul du score de risque...</span>
        </div>
      )}
    </div>
  );
}