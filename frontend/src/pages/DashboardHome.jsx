// DashboardHome.jsx - Version complète avec graphiques et statistiques avancées
import React, { useEffect, useRef, useState } from 'react';
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
import { Bar, Line, Doughnut } from 'react-chartjs-2';
import { Icons } from './DashboardUser';
import './DashboardUser.css';

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

// ── Composant compteur animé ──────────────────────────────────────────────
function useCounter(target, duration = 1500) {
  const [value, setValue] = useState(0);
  const ref = useRef(null);
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        let start = 0;
        const step = Math.ceil(target / (duration / 20));
        const timer = setInterval(() => {
          start = Math.min(start + step, target);
          setValue(start);
          if (start >= target) clearInterval(timer);
        }, 20);
        observer.disconnect();
      }
    }, { threshold: 0.3 });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target, duration]);
  return [value, ref];
}

function StatCard({ icon, value, label, color, suffix = '' }) {
  const [count, ref] = useCounter(value);
  const colors = {
    red: { bg: '#FEF2F2', text: '#C8102E', border: '#FECACA' },
    blue: { bg: '#EFF6FF', text: '#2563EB', border: '#BFDBFE' },
    green: { bg: '#F0FDF4', text: '#16A34A', border: '#BBF7D0' },
    gold: { bg: '#FFFBEB', text: '#D97706', border: '#FDE68A' },
    purple: { bg: '#F3E8FF', text: '#7C3AED', border: '#DDD6FE' },
    teal: { bg: '#CCFBF1', text: '#0D9488', border: '#99F6E4' },
    pink: { bg: '#FCE7F3', text: '#DB2777', border: '#F9A8D4' },
    gray: { bg: '#F3F4F6', text: '#4B5563', border: '#D1D5DB' },
  };

  return (
    <div className="stat-card-enhanced" ref={ref}>
      <div className="stat-card-icon" style={{ background: colors[color].bg, color: colors[color].text }}>
        {icon}
      </div>
      <div className="stat-card-content">
        <div className="stat-card-value">{count.toLocaleString()}{suffix}</div>
        <div className="stat-card-label">{label}</div>
      </div>
    </div>
  );
}

export default function DashboardHome({ municipalite, user }) {
  const [secteurs, setSecteurs] = useState([]);
  const [totalRoutes, setTotalRoutes] = useState(0);
  const [totalSecteurs, setTotalSecteurs] = useState(0);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    if (municipalite && municipalite.secteurs) {
      const secteursData = municipalite.secteurs || [];
      setSecteurs(secteursData);
      setTotalSecteurs(secteursData.length);
      let routesCount = 0;
      secteursData.forEach(s => {
        if (s.rues && Array.isArray(s.rues)) {
          routesCount += s.rues.length;
        }
      });
      setTotalRoutes(routesCount);
    }
  }, [municipalite]);

  // Horloge
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Statistiques calculées
  const totalProprietaires = Math.round(totalRoutes * 3.5);
  const avisGeneres = Math.round(totalRoutes * 0.8);
  const avisPayes = Math.round(avisGeneres * 0.65);
  const avisEnRetard = Math.round(avisGeneres * 0.12);
  const totalRecettes = Math.round(totalRoutes * 4500);
  const totalEncaissement = Math.round(totalRecettes * 0.72);

  // Données pour le graphique d'évolution mensuelle
  const moisLabels = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'];
  const dataRecettes = [12000, 18000, 15000, 22000, 28000, 25000, 32000, 38000, 35000, 42000, 48000, 52000];
  const dataPaiements = [8000, 12000, 10000, 18000, 20000, 18000, 25000, 30000, 28000, 35000, 40000, 45000];

  // Données pour le graphique en camembert (répartition TIB/TNB)
  const repartitionData = {
    labels: ['TIB', 'TNB'],
    datasets: [{
      data: [68, 32],
      backgroundColor: ['#C8102E', '#2563EB'],
      borderWidth: 2,
      borderColor: '#fff'
    }]
  };

  // Données pour le graphique en barres (statuts des avis)
  const statutsData = {
    labels: ['Payés', 'En attente', 'En retard'],
    datasets: [{
      label: 'Nombre d\'avis',
      data: [avisPayes, avisGeneres - avisPayes - avisEnRetard, avisEnRetard],
      backgroundColor: ['#22C55E', '#F59E0B', '#EF4444'],
      borderRadius: 4,
    }]
  };

  const barOptions = {
    responsive: true,
    plugins: {
      legend: { display: false },
      tooltip: { callbacks: { label: ctx => `${ctx.raw.toLocaleString()} TND` } }
    },
    scales: {
      y: { beginAtZero: true, ticks: { callback: val => val.toLocaleString() } }
    }
  };

  const doughnutOptions = {
    responsive: true,
    plugins: {
      legend: { position: 'bottom', labels: { font: { size: 12 } } }
    }
  };

  // Liste des activités récentes (simulée)
  const activities = [
    { id: 1, type: 'route', message: 'Nouvelle route ajoutée : Avenue Habib Bourguiba', time: 'Il y a 5 min', icon: 'Road', color: 'green' },
    { id: 2, type: 'paiement', message: 'Paiement TIB enregistré - 1 250 TND', time: 'Il y a 18 min', icon: 'Coins', color: 'gold' },
    { id: 3, type: 'proprietaire', message: 'Nouveau propriétaire enregistré : Mohamed Salah', time: 'Il y a 1h', icon: 'User', color: 'blue' },
    { id: 4, type: 'avis', message: 'Avis TNB généré - Année 2026', time: 'Il y a 2h', icon: 'FileText', color: 'purple' },
    { id: 5, type: 'secteur', message: 'Secteur El Menzah mis à jour', time: 'Il y a 3h', icon: 'Secteur', color: 'teal' },
  ];

  const formatDate = (date) => {
    return date.toLocaleDateString('fr-TN', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString('fr-TN', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="dashboard-home-enhanced">
      {/* ─── EN-TÊTE DE BIENVENUE ─── */}
      <div className="dashboard-welcome-enhanced">
        <div className="welcome-left">
          <div className="welcome-greeting">
            <h1>Bonjour, {user?.nom || 'Utilisateur'} 👋</h1>
            <p className="welcome-date">{formatDate(currentTime)} • {formatTime(currentTime)}</p>
            <p className="welcome-sub">
              {municipalite?.nom
                ? `Bienvenue dans l'espace de gestion de la municipalité de ${municipalite.nom}`
                : 'Bienvenue dans votre espace de gestion municipale'
              }
            </p>
          </div>
          <div className="welcome-stats-mini">
            <div className="mini-stat">
              <span className="mini-stat-value">{totalSecteurs}</span>
              <span className="mini-stat-label">Secteurs</span>
            </div>
            <div className="mini-stat-divider" />
            <div className="mini-stat">
              <span className="mini-stat-value">{totalRoutes}</span>
              <span className="mini-stat-label">Routes</span>
            </div>
            <div className="mini-stat-divider" />
            <div className="mini-stat">
              <span className="mini-stat-value">{totalProprietaires}</span>
              <span className="mini-stat-label">Propriétaires</span>
            </div>
          </div>
        </div>
        <div className="welcome-right">
          <div className="welcome-flag-large">
            <Icons.TunisiaFlag />
          </div>
          <div className="welcome-badge">
            <span className="badge-dot"></span>
            <span>Système en ligne</span>
          </div>
        </div>
      </div>

      {/* ─── CARTES STATISTIQUES ─── */}
      <div className="stats-grid-enhanced">
        <StatCard icon={<Icons.Building />} value={1} label="Municipalité" color="red" />
        <StatCard icon={<Icons.Secteur />} value={totalSecteurs} label="Secteurs" color="blue" />
        <StatCard icon={<Icons.Road />} value={totalRoutes} label="Routes" color="green" />
        <StatCard icon={<Icons.Users />} value={totalProprietaires} label="Propriétaires" color="gold" />
        <StatCard icon={<Icons.FileText />} value={avisGeneres} label="Avis générés" color="purple" />
        <StatCard icon={<Icons.Check />} value={avisPayes} label="Avis payés" color="teal" />
        <StatCard icon={<Icons.Coins />} value={totalRecettes} label="Recettes (TND)" color="pink" suffix=" TND" />
        <StatCard icon={<Icons.Calendar />} value={avisEnRetard} label="En retard" color="gray" />
      </div>

      {/* ─── GRAPHIQUES ─── */}
      <div className="charts-grid-enhanced">
        <div className="chart-card-enhanced">
          <div className="chart-header-enhanced">
            <Icons.BarChart />
            <h4>Évolution des recettes mensuelles</h4>
            <span className="chart-year">{new Date().getFullYear()}</span>
          </div>
          <div className="chart-body">
            <Bar
              data={{
                labels: moisLabels,
                datasets: [
                  {
                    label: 'Recettes',
                    data: dataRecettes,
                    backgroundColor: 'rgba(200, 16, 46, 0.7)',
                    borderRadius: 4,
                  },
                  {
                    label: 'Paiements',
                    data: dataPaiements,
                    backgroundColor: 'rgba(37, 99, 235, 0.7)',
                    borderRadius: 4,
                  }
                ]
              }}
              options={{
                responsive: true,
                plugins: {
                  legend: { position: 'top', labels: { font: { size: 11 } } },
                  tooltip: { callbacks: { label: ctx => `${ctx.dataset.label}: ${ctx.raw.toLocaleString()} TND` } }
                },
                scales: {
                  y: { beginAtZero: true, ticks: { callback: val => val.toLocaleString() } }
                }
              }}
            />
          </div>
        </div>

        <div className="chart-card-enhanced chart-small">
          <div className="chart-header-enhanced">
            <Icons.PieChart />
            <h4>Répartition TIB / TNB</h4>
          </div>
          <div className="chart-body doughnut-container">
            <Doughnut data={repartitionData} options={doughnutOptions} />
          </div>
        </div>

        <div className="chart-card-enhanced chart-small">
          <div className="chart-header-enhanced">
            <Icons.PieChart />
            <h4>Statut des avis</h4>
          </div>
          <div className="chart-body doughnut-container">
            <Bar
              data={statutsData}
              options={{
                responsive: true,
                plugins: {
                  legend: { display: false },
                  tooltip: { callbacks: { label: ctx => `${ctx.raw} avis` } }
                },
                scales: {
                  y: { beginAtZero: true, ticks: { stepSize: 1 } }
                }
              }}
            />
          </div>
        </div>
      </div>

      {/* ─── ACTIVITÉ RÉCENTE ET ACTIONS ─── */}
      <div className="dashboard-extra-grid-enhanced">
        <div className="dashboard-activity-card-enhanced">
          <div className="activity-header-enhanced">
            <Icons.Activity />
            <h3>Activité récente</h3>
            <span className="activity-count">{activities.length} notifications</span>
          </div>
          <ul className="activity-list-enhanced">
            {activities.map((act) => {
              const IconComponent = Icons[act.icon] || Icons.Activity;
              return (
                <li key={act.id} className={`activity-item ${act.color}`}>
                  <span className="activity-icon"><IconComponent /></span>
                  <div className="activity-content">
                    <span className="activity-message">{act.message}</span>
                    <span className="activity-time">{act.time}</span>
                  </div>
                </li>
              );
            })}
          </ul>
          <button className="activity-view-all">Voir toutes les activités</button>
        </div>

        <div className="dashboard-quick-actions-enhanced">
          <div className="quick-actions-header">
            <Icons.Zap />
            <h3>Actions rapides</h3>
          </div>
          <div className="quick-actions-grid">
            <div className="quick-action-item primary">
              <Icons.Plus />
              <span>Ajouter un secteur</span>
            </div>
            <div className="quick-action-item secondary">
              <Icons.Road />
              <span>Ajouter une route</span>
            </div>
            <div className="quick-action-item success">
              <Icons.User />
              <span>Ajouter un propriétaire</span>
            </div>
            <div className="quick-action-item warning">
              <Icons.Calculator />
              <span>Générer un avis TIB</span>
            </div>
            <div className="quick-action-item info">
              <Icons.Land />
              <span>Générer un avis TNB</span>
            </div>
            <div className="quick-action-item danger">
              <Icons.Coins />
              <span>Enregistrer un paiement</span>
            </div>
          </div>
        </div>
      </div>

      {/* ─── CARTE MUNICIPALITÉ DÉTAILLÉE ─── */}
      <div className="dashboard-municipalite-card-enhanced">
        <div className="municipalite-header-enhanced">
          <div className="municipalite-icon-large">
            <Icons.Building />
          </div>
          <div className="municipalite-info-enhanced">
            <h2>{municipalite?.nom || 'Municipalité'}</h2>
            <p><Icons.MapPin /> {municipalite?.description || 'Tunis, Tunisie'}</p>
          </div>
          <div className="municipalite-status">
            <span className="status-active">● Actif</span>
          </div>
        </div>
        <div className="municipalite-stats-enhanced">
          <div className="municipalite-stat-item">
            <span className="stat-number">{totalSecteurs}</span>
            <span className="stat-label">Secteurs</span>
          </div>
          <div className="municipalite-stat-divider" />
          <div className="municipalite-stat-item">
            <span className="stat-number">{totalRoutes}</span>
            <span className="stat-label">Routes</span>
          </div>
          <div className="municipalite-stat-divider" />
          <div className="municipalite-stat-item">
            <span className="stat-number">{totalProprietaires}</span>
            <span className="stat-label">Propriétaires</span>
          </div>
          <div className="municipalite-stat-divider" />
          <div className="municipalite-stat-item">
            <span className="stat-number">{avisGeneres}</span>
            <span className="stat-label">Avis générés</span>
          </div>
          <div className="municipalite-stat-divider" />
          <div className="municipalite-stat-item">
            <span className="stat-number">{Math.round((avisPayes / (avisGeneres || 1)) * 100)}%</span>
            <span className="stat-label">Taux de recouvrement</span>
          </div>
        </div>
      </div>
    </div>
  );
}