// DashboardRecettesHome.jsx
import React, { useState, useEffect, useMemo } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
  Filler
} from 'chart.js';
// Import des composants graphiques avec fallback
import { Bar, Pie, Line } from 'react-chartjs-2';
import RecetteService from '../services/recetteService';
import './DashboardRecettesHome.css';

// Enregistrement des composants Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
  Filler
);

// ── Icônes SVG ──────────────────────────────────────────────────────────────
const Icons = {
  Coins: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="8" cy="8" r="6" />
      <path d="M18.09 10.37A6 6 0 1 1 10.34 18" />
      <path d="M7 6h1v4" />
      <path d="m16.71 13.88.7.71-2.82 2.82" />
    </svg>
  ),
  Receipt: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 4h16v16H4z" />
      <line x1="8" y1="8" x2="16" y2="8" />
      <line x1="8" y1="12" x2="16" y2="12" />
      <line x1="8" y1="16" x2="12" y2="16" />
    </svg>
  ),
  FileText: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14,2 14,8 20,8" />
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
  PieChart: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21.21 15.89A10 10 0 1 1 8 2.83" />
      <path d="M22 12A10 10 0 0 0 12 2v10z" />
    </svg>
  ),
  BarChart: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="20" x2="12" y2="10" />
      <line x1="18" y1="20" x2="18" y2="4" />
      <line x1="6" y1="20" x2="6" y2="16" />
    </svg>
  ),
  TrendingUp: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="23,6 13.5,15.5 8.5,10.5 1,18" />
      <polyline points="17,6 23,6 23,12" />
    </svg>
  ),
  Filter: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="22,3 2,3 10,13 10,21 14,18 14,13 22,3" />
    </svg>
  ),
};

export default function DashboardRecettesHome({ showMsg }) {
  const [stats, setStats] = useState({
    totalEncaissement: 0,
    totalRecettes: 0,
    nbAvis: 0,
    nbPaiements: 0,
    nbEnRetard: 0,
    montantMoyen: 0,
    parAnnee: { labels: [], tib: [], tnb: [] },
    parMois: { labels: [], montants: [] },
    evolutionMensuelle: { labels: [], montants: [] },
    repartition: { tib: 0, tnb: 0 },
    statuts: { labels: [], counts: [] }
  });
  const [loading, setLoading] = useState(true);
  const [filtreAnnee, setFiltreAnnee] = useState('toutes');
  const [filtreType, setFiltreType] = useState('tous');
  const [anneesDisponibles, setAnneesDisponibles] = useState([]);

  useEffect(() => {
    chargerStats();
  }, []);

  const chargerStats = async () => {
    try {
      setLoading(true);
      const response = await RecetteService.rechercherRecettes({}, 0, 1000, 'date', 'desc');
      const recettes = response.content || [];

      // Calculs généraux
      const totalEncaissement = recettes.reduce((acc, r) => acc + (r.montantPaye || 0), 0);
      const totalRecettes = recettes.length;
      const nbPaiements = recettes.filter(r => r.montantPaye > 0).length;
      const nbAvis = recettes.filter(r => r.numeroAvis).length;
      const nbEnRetard = recettes.filter(r => r.statut === 'EN_RETARD').length;
      const montantMoyen = totalRecettes > 0 ? totalEncaissement / totalRecettes : 0;

      // Années disponibles
      const annees = [...new Set(recettes.map(r => r.anneeFiscale).filter(Boolean))].sort();
      setAnneesDisponibles(annees);

      // Par année (toutes)
      const parAnnee = {};
      recettes.forEach(r => {
        const annee = r.anneeFiscale;
        if (!annee) return;
        if (!parAnnee[annee]) parAnnee[annee] = { tib: 0, tnb: 0 };
        if (r.type === 'TIB') parAnnee[annee].tib += r.montant || 0;
        else if (r.type === 'TNB') parAnnee[annee].tnb += r.montant || 0;
      });
      const anneesKeys = Object.keys(parAnnee).sort();
      const tibData = anneesKeys.map(a => parAnnee[a].tib);
      const tnbData = anneesKeys.map(a => parAnnee[a].tnb);

      // Par mois (évolution) – on prend les 12 derniers mois
      const moisLabels = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'];
      const moisMontants = new Array(12).fill(0);
      const anneeCourante = new Date().getFullYear();
      recettes.forEach(r => {
        if (r.anneeFiscale === anneeCourante && r.dateGeneration) {
          const date = new Date(r.dateGeneration);
          const mois = date.getMonth();
          moisMontants[mois] += r.montant || 0;
        }
      });

      // Évolution mensuelle (sur 12 mois glissants) – pour le line chart
      const evoMontants = new Array(12).fill(0);
      // On prend les recettes des 12 derniers mois (mois courant et 11 précédents)
      const now = new Date();
      const moisActuel = now.getMonth();
      const anneeActuelle = now.getFullYear();
      recettes.forEach(r => {
        if (r.dateGeneration) {
          const d = new Date(r.dateGeneration);
          // Calculer la différence en mois
          const diffMois = (anneeActuelle - d.getFullYear()) * 12 + (moisActuel - d.getMonth());
          if (diffMois >= 0 && diffMois < 12) {
            evoMontants[11 - diffMois] += r.montant || 0;
          }
        }
      });
      const evoLabels = [];
      for (let i = 11; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        evoLabels.push(d.toLocaleDateString('fr', { month: 'short', year: 'numeric' }));
      }

      // Répartition TIB/TNB
      let totalTIB = 0, totalTNB = 0;
      recettes.forEach(r => {
        if (r.type === 'TIB') totalTIB += r.montant || 0;
        else if (r.type === 'TNB') totalTNB += r.montant || 0;
      });

      // Statuts
      const statutsCount = {};
      recettes.forEach(r => {
        const s = r.statut || 'EN_ATTENTE';
        statutsCount[s] = (statutsCount[s] || 0) + 1;
      });
      const statutLabels = Object.keys(statutsCount);
      const statutCounts = statutLabels.map(s => statutsCount[s]);

      setStats({
        totalEncaissement,
        totalRecettes,
        nbAvis,
        nbPaiements,
        nbEnRetard,
        montantMoyen,
        parAnnee: { labels: anneesKeys, tib: tibData, tnb: tnbData },
        parMois: { labels: moisLabels, montants: moisMontants },
        evolutionMensuelle: { labels: evoLabels, montants: evoMontants },
        repartition: { tib: totalTIB, tnb: totalTNB },
        statuts: { labels: statutLabels, counts: statutCounts }
      });
    } catch (error) {
      console.error('Erreur chargement stats:', error);
      showMsg('Erreur lors du chargement des statistiques.', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Filtrage des données (simulé ici – on pourrait recalculer les graphiques)
  // On ne filtre pas vraiment les données, on pourrait faire une nouvelle requête avec filtres,
  // mais pour l'instant on garde tout.

  if (loading) {
    return (
      <div className="recettes-loading">
        <div className="recettes-spinner" />
        <span>Chargement des statistiques...</span>
      </div>
    );
  }

  // Vérification que Chart.js est bien chargé
  if (typeof Bar === 'undefined' || typeof Pie === 'undefined' || typeof Line === 'undefined') {
    return (
      <div className="recettes-loading" style={{ color: '#991B1B' }}>
        <p>Les bibliothèques de graphiques ne sont pas chargées. Veuillez installer :</p>
        <code>npm install chart.js react-chartjs-2</code>
      </div>
    );
  }

  const statutColors = {
    EN_ATTENTE: '#F59E0B',
    PAYE: '#22C55E',
    EN_RETARD: '#EF4444',
    PARTIEL: '#F97316'
  };

  const optionsBar = {
    responsive: true,
    plugins: {
      legend: { position: 'top' },
      tooltip: { callbacks: { label: ctx => `${ctx.dataset.label}: ${ctx.raw.toFixed(3)} TND` } }
    },
    scales: {
      y: { beginAtZero: true, ticks: { callback: val => val.toFixed(0) } }
    }
  };

  const optionsPie = {
    responsive: true,
    plugins: {
      legend: { position: 'bottom' },
      tooltip: { callbacks: { label: ctx => `${ctx.label}: ${ctx.raw.toFixed(3)} TND` } }
    }
  };

  return (
    <div className="dashboard-recettes-home">
      {/* Filtres rapides */}
      <div className="filters-bar">
        <div className="filter-item">
          <Icons.Filter />
          <span>Filtrer par année :</span>
          <select value={filtreAnnee} onChange={e => setFiltreAnnee(e.target.value)}>
            <option value="toutes">Toutes</option>
            {anneesDisponibles.map(a => (
              <option key={a} value={a}>{a}</option>
            ))}
          </select>
        </div>
        <div className="filter-item">
          <span>Type :</span>
          <select value={filtreType} onChange={e => setFiltreType(e.target.value)}>
            <option value="tous">Tous</option>
            <option value="TIB">TIB</option>
            <option value="TNB">TNB</option>
          </select>
        </div>
        <button className="btn-refresh" onClick={chargerStats}>
          <Icons.Calendar /> Rafraîchir
        </button>
      </div>

      {/* Cartes statistiques */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon"><Icons.Coins /></div>
          <div className="stat-value">{stats.totalEncaissement.toFixed(3)} TND</div>
          <div className="stat-label">Total encaissé</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon"><Icons.FileText /></div>
          <div className="stat-value">{stats.totalRecettes}</div>
          <div className="stat-label">Total recettes</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon"><Icons.Receipt /></div>
          <div className="stat-value">{stats.nbAvis}</div>
          <div className="stat-label">Avis générés</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon"><Icons.Calendar /></div>
          <div className="stat-value">{stats.nbPaiements}</div>
          <div className="stat-label">Paiements enregistrés</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon"><Icons.TrendingUp /></div>
          <div className="stat-value">{stats.nbEnRetard}</div>
          <div className="stat-label">Recettes en retard</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon"><Icons.PieChart /></div>
          <div className="stat-value">{stats.montantMoyen.toFixed(3)} TND</div>
          <div className="stat-label">Montant moyen / recette</div>
        </div>
      </div>

      {/* Graphiques */}
      <div className="charts-grid">
        <div className="chart-card">
          <div className="chart-header">
            <Icons.BarChart />
            <h4>Recettes par année</h4>
          </div>
          <Bar
            data={{
              labels: stats.parAnnee.labels,
              datasets: [
                { label: 'TIB', data: stats.parAnnee.tib, backgroundColor: '#C8102E', borderRadius: 4 },
                { label: 'TNB', data: stats.parAnnee.tnb, backgroundColor: '#1D4ED8', borderRadius: 4 }
              ]
            }}
            options={optionsBar}
          />
        </div>

        <div className="chart-card">
          <div className="chart-header">
            <Icons.PieChart />
            <h4>Répartition TIB / TNB</h4>
          </div>
          <Pie
            data={{
              labels: ['TIB', 'TNB'],
              datasets: [{
                data: [stats.repartition.tib, stats.repartition.tnb],
                backgroundColor: ['#C8102E', '#1D4ED8'],
                borderWidth: 2,
                borderColor: '#fff'
              }]
            }}
            options={optionsPie}
          />
        </div>

        <div className="chart-card">
          <div className="chart-header">
            <Icons.Calendar />
            <h4>Recettes par mois ({new Date().getFullYear()})</h4>
          </div>
          <Bar
            data={{
              labels: stats.parMois.labels,
              datasets: [{
                label: 'Montant (TND)',
                data: stats.parMois.montants,
                backgroundColor: '#0A1E3D',
                borderRadius: 4,
              }]
            }}
            options={{
              responsive: true,
              plugins: { legend: { display: false }, tooltip: { callbacks: { label: ctx => `${ctx.raw.toFixed(3)} TND` } } },
              scales: { y: { beginAtZero: true, ticks: { callback: val => val.toFixed(0) } } }
            }}
          />
        </div>

        <div className="chart-card">
          <div className="chart-header">
            <Icons.TrendingUp />
            <h4>Évolution sur 12 mois</h4>
          </div>
          <Line
            data={{
              labels: stats.evolutionMensuelle.labels,
              datasets: [{
                label: 'Montant (TND)',
                data: stats.evolutionMensuelle.montants,
                borderColor: '#C8102E',
                backgroundColor: 'rgba(200,16,46,0.1)',
                fill: true,
                tension: 0.3,
                pointRadius: 4,
                pointBackgroundColor: '#C8102E'
              }]
            }}
            options={{
              responsive: true,
              plugins: {
                legend: { display: false },
                tooltip: { callbacks: { label: ctx => `${ctx.raw.toFixed(3)} TND` } }
              },
              scales: {
                y: { beginAtZero: true, ticks: { callback: val => val.toFixed(0) } }
              }
            }}
          />
        </div>

        <div className="chart-card">
          <div className="chart-header">
            <Icons.PieChart />
            <h4>Statuts des recettes</h4>
          </div>
          <Bar
            data={{
              labels: stats.statuts.labels,
              datasets: [{
                label: 'Nombre de recettes',
                data: stats.statuts.counts,
                backgroundColor: stats.statuts.labels.map(label => statutColors[label] || '#94A3B8'),
                borderRadius: 4,
              }]
            }}
            options={{
              responsive: true,
              plugins: { legend: { display: false }, tooltip: { callbacks: { label: ctx => `${ctx.raw} recette(s)` } } },
              scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } }
            }}
          />
        </div>
      </div>
    </div>
  );
}