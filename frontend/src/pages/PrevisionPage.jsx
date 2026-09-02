// src/pages/PrevisionPage.jsx
import React, { useState, useEffect } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import './PrevisionPage.css';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const API_IA_URL = process.env.REACT_APP_IA_URL || 'http://localhost:8001';

// ── Icônes SVG ──────────────────────────────────────────────────────────────
const Icons = {
  TrendingUp: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="23,6 13.5,15.5 8.5,10.5 1,18"/>
      <polyline points="17,6 23,6 23,12"/>
    </svg>
  ),
  Refresh: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="23,4 23,11 16,11"/>
      <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 11"/>
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
  Download: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
      <polyline points="7,10 12,15 17,10"/>
      <line x1="12" y1="15" x2="12" y2="3"/>
    </svg>
  ),
  Info: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/>
      <line x1="12" y1="12" x2="12" y2="16"/>
      <line x1="12" y1="8" x2="12.01" y2="8"/>
    </svg>
  ),
};

export default function PrevisionPage({ showMsg }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [training, setTraining] = useState(false);
  const [steps, setSteps] = useState(12);

  useEffect(() => {
    chargerPrevision();
  }, [steps]);

  const chargerPrevision = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_IA_URL}/api/ai/prevision?steps=${steps}`);
      if (!response.ok) {
        if (response.status === 503) {
          showMsg('Le modèle n\'est pas encore entraîné. Lancez l\'entraînement.', 'warning');
          setData(null);
          return;
        }
        throw new Error('Erreur lors du chargement');
      }
      const result = await response.json();
      setData(result);
    } catch (error) {
      showMsg(error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const entrainerModele = async () => {
    setTraining(true);
    try {
      const response = await fetch(`${API_IA_URL}/api/ai/prevision/train?force=true`, {
        method: 'POST',
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Erreur lors de l\'entraînement');
      }
      const result = await response.json();
      showMsg(`✅ Modèle entraîné avec succès ! (${result.n_observations} mois)`, 'success');
      await chargerPrevision();
    } catch (error) {
      showMsg(`❌ ${error.message}`, 'error');
    } finally {
      setTraining(false);
    }
  };

  const exporterCSV = () => {
    if (!data) return;

    const rows = [
      ['Date', 'Type', 'Montant (TND)']
    ];

    data.history.dates.forEach((date, i) => {
      rows.push([date, 'Historique', data.history.values[i].toFixed(3)]);
    });

    data.forecast.dates.forEach((date, i) => {
      rows.push([date, 'Prévision', data.forecast.values[i].toFixed(3)]);
    });

    const csv = rows.map(row => row.join(';')).join('\n');
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `prevision_recettes_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    showMsg('📊 CSV exporté avec succès !', 'success');
  };

  const formatMontant = (value) => {
    return new Intl.NumberFormat('fr-TN', {
      minimumFractionDigits: 3,
      maximumFractionDigits: 3
    }).format(value);
  };

  // ── Graphique ──
  const chartData = data ? {
    labels: [...data.history.dates, ...data.forecast.dates],
    datasets: [
      {
        label: 'Historique',
        data: [...data.history.values, ...Array(data.forecast.values.length).fill(null)],
        borderColor: '#0A1E3D',
        backgroundColor: 'rgba(10, 30, 61, 0.1)',
        fill: true,
        tension: 0.3,
        pointBackgroundColor: '#0A1E3D',
        pointRadius: 4,
      },
      {
        label: 'Prévision',
        data: [...Array(data.history.values.length).fill(null), ...data.forecast.values],
        borderColor: '#C8102E',
        backgroundColor: 'rgba(200, 16, 46, 0.1)',
        borderDash: [5, 5],
        fill: true,
        tension: 0.3,
        pointBackgroundColor: '#C8102E',
        pointRadius: 4,
      }
    ]
  } : null;

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: { font: { size: 12 } }
      },
      tooltip: {
        callbacks: {
          label: (ctx) => {
            if (ctx.raw === null) return '';
            return `${ctx.dataset.label}: ${formatMontant(ctx.raw)} TND`;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: (val) => formatMontant(val)
        }
      }
    }
  };

  return (
    <div className="prevision-page">
      <div className="prevision-header">
        <h1>
          <Icons.TrendingUp /> Prévision des recettes
        </h1>
        <p>Prévision des recettes municipales sur les 12 prochains mois</p>
      </div>

      {/* ── Barre d'outils ── */}
      <div className="prevision-toolbar">
        <div className="prevision-actions">
          <button
            className="btn-train"
            onClick={entrainerModele}
            disabled={training}
          >
            <Icons.Refresh />
            {training ? 'Entraînement...' : 'Réentraîner'}
          </button>
          <button
            className="btn-export"
            onClick={exporterCSV}
            disabled={!data}
          >
            <Icons.Download /> Exporter CSV
          </button>
          <div className="prevision-steps">
            <label>Période :</label>
            <select value={steps} onChange={(e) => setSteps(Number(e.target.value))}>
              <option value="6">6 mois</option>
              <option value="12">12 mois</option>
              <option value="24">24 mois</option>
            </select>
          </div>
        </div>
      </div>

      {/* ── Loading ── */}
      {loading && (
        <div className="prevision-loading">
          <div className="prevision-spinner" />
          <span>Chargement des prévisions...</span>
        </div>
      )}

      {/* ── Données ── */}
      {data && !loading && (
        <>
          {/* Statistiques */}
          <div className="prevision-stats-grid">
            <div className="prevision-stat-card">
              <span className="prevision-stat-label">Total historique</span>
              <span className="prevision-stat-value">{formatMontant(data.summary.total_historique)} TND</span>
            </div>
            <div className="prevision-stat-card">
              <span className="prevision-stat-label">Moyenne mensuelle</span>
              <span className="prevision-stat-value">{formatMontant(data.summary.moyenne_mensuelle_historique)} TND</span>
            </div>
            <div className="prevision-stat-card prevision-stat-highlight">
              <span className="prevision-stat-label">📈 Total prévu</span>
              <span className="prevision-stat-value">{formatMontant(data.summary.total_prevu)} TND</span>
            </div>
            <div className="prevision-stat-card">
              <span className="prevision-stat-label">Moyenne prévue</span>
              <span className="prevision-stat-value">{formatMontant(data.summary.moyenne_mensuelle_prevue)} TND</span>
            </div>
          </div>

          {/* Graphique */}
          <div className="prevision-chart-card">
            <div className="prevision-chart-header">
              <h3><Icons.Calendar /> Évolution des recettes</h3>
            </div>
            <div className="prevision-chart-body">
              <Line data={chartData} options={chartOptions} />
            </div>
          </div>

          {/* Tableau des prévisions */}
          <div className="prevision-table-card">
            <div className="prevision-table-header">
              <h3>📋 Détail des prévisions</h3>
            </div>
            <div className="prevision-table-wrapper">
              <table className="prevision-table">
                <thead>
                  <tr>
                    <th>Période</th>
                    <th>Montant prévu (TND)</th>
                    <th>Évolution</th>
                  </tr>
                </thead>
                <tbody>
                  {data.forecast.dates.map((date, i) => {
                    const current = data.forecast.values[i];
                    const previous = i > 0 ? data.forecast.values[i - 1] : data.history.values[data.history.values.length - 1];
                    const evolution = ((current - previous) / previous * 100);
                    const isPositive = evolution >= 0;

                    return (
                      <tr key={date}>
                        <td>{new Date(date).toLocaleDateString('fr-TN', { month: 'long', year: 'numeric' })}</td>
                        <td>{formatMontant(current)}</td>
                        <td style={{ color: isPositive ? '#16a34a' : '#dc2626' }}>
                          {isPositive ? '▲' : '▼'} {Math.abs(evolution).toFixed(1)}%
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* ── État vide ── */}
      {!data && !loading && (
        <div className="prevision-empty">
          <Icons.Info />
          <h3>Aucune prévision disponible</h3>
          <p>Le modèle n'est pas encore entraîné ou il n'y a pas assez de données.</p>
          <button className="btn-train" onClick={entrainerModele} disabled={training}>
            <Icons.Refresh />
            {training ? 'Entraînement...' : 'Entraîner le modèle'}
          </button>
        </div>
      )}
    </div>
  );
}