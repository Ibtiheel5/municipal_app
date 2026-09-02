// HomePage.jsx - Version ultra professionnelle avec drapeau tunisien
import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import './HomePage.css';

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

  TunisiaFlagLarge: () => (
    <svg viewBox="0 0 120 80" width="120" height="80">
      <rect width="120" height="80" fill="#E70013"/>
      {/* Étape 1 : disque blanc */}
      <circle cx="60" cy="40" r="26" fill="white"/>
      {/* Étape 2 : cercle rouge = corps du croissant */}
      <circle cx="56" cy="40" r="20" fill="#E70013"/>
      {/* Étape 3 : découpe blanche décalée à droite → crée le croissant ouvert vers la droite */}
      <circle cx="66" cy="40" r="15" fill="white"/>
      {/* Étape 4 : étoile rouge centrée dans la découpe */}
      <polygon
        points="63,31 65.0,37.25 71.56,37.22 66.23,41.05 68.29,47.28 63,43.4 57.71,47.28 59.77,41.05 54.44,37.22 61.0,37.25"
        fill="#E70013"
      />
    </svg>
  ),
  TunisiaFlag: ({ size = 30 }) => (
    <svg viewBox="0 0 30 20" width={size} height={size * 2/3}>
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

  ArrowRight: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="5" y1="12" x2="19" y2="12"/>
      <polyline points="12,5 19,12 12,19"/>
    </svg>
  ),

  Login: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/>
      <polyline points="10,17 15,12 10,7"/>
      <line x1="15" y1="12" x2="3" y2="12"/>
    </svg>
  ),

  Register: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
      <circle cx="9" cy="7" r="4"/>
      <line x1="19" y1="8" x2="19" y2="14"/>
      <line x1="22" y1="11" x2="16" y2="11"/>
    </svg>
  ),

  Info: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/>
      <line x1="12" y1="8" x2="12" y2="12"/>
      <line x1="12" y1="16" x2="12.01" y2="16"/>
    </svg>
  ),

  Check: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20,6 9,17 4,12"/>
    </svg>
  ),

  Refresh: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="23,4 23,11 16,11"/>
      <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 11"/>
    </svg>
  ),

  Calendar: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2"/>
      <line x1="16" y1="2" x2="16" y2="6"/>
      <line x1="8" y1="2" x2="8" y2="6"/>
      <line x1="3" y1="10" x2="21" y2="10"/>
    </svg>
  ),

  Mail: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
      <polyline points="22,6 12,13 2,6"/>
    </svg>
  ),

  Phone: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.56 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
    </svg>
  ),

  Chevron: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="9,18 15,12 9,6"/>
    </svg>
  ),

  Facebook: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
    </svg>
  ),

  Twitter: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"/>
    </svg>
  ),

  LinkedIn: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/>
      <rect x="2" y="9" width="4" height="12"/>
      <circle cx="4" cy="4" r="2"/>
    </svg>
  ),

  Home: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
      <polyline points="9,22 9,12 15,12 15,22"/>
    </svg>
  ),

  MapPin: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
      <circle cx="12" cy="10" r="3"/>
    </svg>
  ),

  Road: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <line x1="3" y1="12" x2="21" y2="12"/>
      <line x1="3" y1="6" x2="21" y2="6"/>
      <line x1="3" y1="18" x2="21" y2="18"/>
    </svg>
  ),

  Users: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
      <circle cx="9" cy="7" r="4"/>
      <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
      <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
    </svg>
  ),

  Shield: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
    </svg>
  ),

  Monitor: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="3" width="20" height="14" rx="2"/>
      <line x1="8" y1="21" x2="16" y2="21"/>
      <line x1="12" y1="17" x2="12" y2="21"/>
    </svg>
  ),

  Activity: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="22,12 18,12 15,21 9,3 6,12 2,12"/>
    </svg>
  ),

  Menu: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="3" y1="12" x2="21" y2="12"/>
      <line x1="3" y1="6" x2="21" y2="6"/>
      <line x1="3" y1="18" x2="21" y2="18"/>
    </svg>
  ),

  Close: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18"/>
      <line x1="6" y1="6" x2="18" y2="18"/>
    </svg>
  ),

  Building: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="4" y="2" width="16" height="20" rx="2"/>
      <line x1="8" y1="6" x2="16" y2="6"/>
      <line x1="8" y1="10" x2="16" y2="10"/>
      <line x1="8" y1="14" x2="16" y2="14"/>
      <line x1="8" y1="18" x2="12" y2="18"/>
    </svg>
  ),

  Award: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="8" r="6"/>
      <polyline points="12,14 12,21 9,18 6,21 6,14"/>
    </svg>
  ),

  Globe: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/>
      <line x1="2" y1="12" x2="22" y2="12"/>
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
    </svg>
  ),

  Clock: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/>
      <polyline points="12,6 12,12 16,14"/>
    </svg>
  ),

  Star: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26 12,2"/>
    </svg>
  ),

  User: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
      <circle cx="12" cy="7" r="4"/>
    </svg>
  ),

  Settings: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3"/>
      <path d="M12,1v2 M12,21v2 M4.22,4.22l1.42,1.42 M18.36,18.36l1.42,1.42 M1,12h2 M21,12h2 M4.22,19.78l1.42-1.42 M18.36,5.64l1.42-1.42"/>
    </svg>
  ),

  Logout: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
      <polyline points="16,17 21,12 16,7"/>
      <line x1="21" y1="12" x2="9" y2="12"/>
    </svg>
  ),

  Notification: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
      <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
    </svg>
  ),

  Search: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8"/>
      <line x1="21" y1="21" x2="16.65" y2="16.65"/>
    </svg>
  ),

  Filter: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="22,3 2,3 10,13 10,21 14,18 14,13 22,3"/>
    </svg>
  ),
};

// ── Counter Hook ──────────────────────────────────────────────────────────────
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

// ── Stat Item ─────────────────────────────────────────────────────────────────
function StatItem({ icon, target, label, color = '#C8102E' }) {
  const [value, ref] = useCounter(target);
  return (
    <div className="stat-item" ref={ref}>
      <div className="stat-icon" style={{ color }}>{icon}</div>
      <span className="stat-num">{value.toLocaleString()}</span>
      <span className="stat-label">{label}</span>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function HomePage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    setMobileMenuOpen(false);
  };

  return (
    <div className="hp-root">

      {/* ── NAVBAR ── */}
      <nav className={`hp-nav ${scrolled ? 'scrolled' : ''}`}>
        <Link to="/" className="hp-brand">
          <div className="hp-logo-box">
            <Icons.Logo />
          </div>
          <div className="hp-brand-text">
            Baladiya Smart Management
            <small>منصة التسيير البلدي الذكي</small>
          </div>
        </Link>

        <button className="hp-mobile-toggle" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
          {mobileMenuOpen ? <Icons.Close /> : <Icons.Menu />}
        </button>

        <div className={`hp-navlinks ${mobileMenuOpen ? 'open' : ''}`}>
          <button onClick={() => scrollToSection('home')} className="hp-navlink active">Accueil</button>
          <button onClick={() => scrollToSection('services')} className="hp-navlink">Services</button>
          <button onClick={() => scrollToSection('about')} className="hp-navlink">À propos</button>
          <button onClick={() => scrollToSection('news')} className="hp-navlink">Actualités</button>
          <button onClick={() => scrollToSection('contact')} className="hp-navlink">Contact</button>
        </div>

        <div className="hp-navbtns">
          <Link to="/login" className="hp-btn-login">
            <span className="hp-btn-icon"><Icons.Login /></span>
            <span>Connexion</span>
          </Link>
          <Link to="/register" className="hp-btn-register">
            <span className="hp-btn-icon"><Icons.Register /></span>
            <span>Inscription</span>
          </Link>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className="hp-hero" id="home">
        <div className="hp-hero-pattern" />
        <div className="hp-hero-grid" />
        <div className="hp-hero-glow" />

        <div className="hp-hero-content">
          <div className="hp-hero-badge">
            <span className="hp-hero-badge-flag"><Icons.TunisiaFlag size={24} /></span>
            <span className="hp-pulse" />
            <span>Plateforme officielle • منصة رسمية</span>
          </div>

          <h1 className="hp-hero-title">
            Bienvenue sur la plateforme de{' '}
            <em>gestion municipale</em>
          </h1>

          <p className="hp-hero-sub">
            Une solution intelligente pour la gestion des municipalités,
            secteurs et routes en Tunisie. Simplifiez l'administration,
            améliorez les services aux citoyens.
          </p>

          <div className="hp-hero-btns">
            <Link to="/register" className="hp-btn-primary">
              <span className="hp-btn-icon"><Icons.ArrowRight /></span>
              Commencer maintenant
            </Link>
            <button onClick={() => scrollToSection('about')} className="hp-btn-secondary">
              <span className="hp-btn-icon"><Icons.Info /></span>
              En savoir plus
            </button>
          </div>

          <div className="hp-hero-trust">
            <div className="hp-hero-trust-item">
              <Icons.Shield />
              <span>Sécurisé</span>
            </div>
            <div className="hp-hero-trust-divider" />
            <div className="hp-hero-trust-item">
              <Icons.Award />
              <span>Certifié</span>
            </div>
            <div className="hp-hero-trust-divider" />
            <div className="hp-hero-trust-item">
              <Icons.Globe />
              <span>National</span>
            </div>
          </div>
        </div>

        <div className="hp-hero-right">
          <div className="hp-hero-flag-container">
            <Icons.TunisiaFlagLarge />
            <span className="hp-hero-flag-label">République Tunisienne</span>
          </div>

          {[
            { icon: <Icons.Home />, color: 'red',   num: '350+', sub: 'Municipalités' },
            { icon: <Icons.MapPin />, color: 'blue', num: '1200+', sub: 'Secteurs' },
            { icon: <Icons.Road />,   color: 'green', num: '8000+', sub: 'Routes' },
            { icon: <Icons.Users />,  color: 'gold', num: '500+', sub: 'Utilisateurs' },
          ].map((c, i) => (
            <div className="hp-hcard" key={i}>
              <div className={`hp-hcard-icon hp-hcard-icon--${c.color}`}>{c.icon}</div>
              <div>
                <div className="hp-hcard-num">{c.num}</div>
                <div className="hp-hcard-sub">{c.sub}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── STATS BAR ── */}
      <div className="hp-stats">
        <div className="hp-stats-inner">
          <StatItem icon={<Icons.Home />}   target={350}  label="Municipalités" color="#C8102E" />
          <StatItem icon={<Icons.MapPin />} target={1200} label="Secteurs" color="#3b82f6" />
          <StatItem icon={<Icons.Road />}   target={8000} label="Routes" color="#22c55e" />
          <StatItem icon={<Icons.Users />}  target={500}  label="Utilisateurs" color="#f59e0b" />
        </div>
      </div>

      {/* ── SERVICES ── */}
      <section className="hp-section hp-section--gray" id="services">
        <div className="hp-section-header">
          <div className="hp-tag">
            <Icons.Check />
            Nos modules
          </div>
          <h2 className="hp-section-title">Services de la plateforme</h2>
          <p className="hp-section-sub">
            Gestion centralisée et intelligente de l'ensemble du territoire municipal tunisien
          </p>
        </div>
        <div className="hp-services-grid">
          {[
            {
              icon: <Icons.Building />,
              title: 'Gestion des municipalités',
              desc: 'Gestion centralisée des baladiyat tunisiennes avec toutes leurs informations territoriales.',
            },
            {
              icon: <Icons.MapPin />,
              title: 'Gestion des secteurs',
              desc: 'Organisation et suivi des secteurs géographiques par municipalité avec cartographie.',
            },
            {
              icon: <Icons.Road />,
              title: 'Gestion des routes',
              desc: 'Suivi, ajout et gestion complète du réseau de routes et rues par secteur avec Google Maps.',
            },
            {
              icon: <Icons.Users />,
              title: 'Gestion des utilisateurs',
              desc: 'Administration sécurisée avec workflow d\'approbation et affectation aux municipalités.',
            },
          ].map((s, i) => (
            <div className="hp-svc-card" key={i}>
              <div className="hp-svc-icon">{s.icon}</div>
              <h3 className="hp-svc-title">{s.title}</h3>
              <p className="hp-svc-desc">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── ABOUT STRIP ── */}
      <div className="hp-about" id="about">
        <div className="hp-about-left">
          <div className="hp-tag hp-tag--light">
            <Icons.Info />
            À propos
          </div>
          <h2 className="hp-about-title">
            Une plateforme au service des citoyens tunisiens
          </h2>
          <div className="hp-about-divider" />
          <p className="hp-about-desc">
            Baladiya Smart Management modernise la gestion municipale en Tunisie.
            Notre plateforme permet aux agents et administrateurs de gérer
            efficacement les territoires, d'améliorer la transparence et
            d'optimiser les services publics locaux grâce à des technologies modernes.
          </p>
          <div className="hp-about-flag">
            <Icons.TunisiaFlag size={36} />
            <span>République Tunisienne • Ministère de l'Intérieur</span>
          </div>
        </div>
        <div className="hp-about-right">
          {[
            { icon: <Icons.Shield />,  color: 'red',   title: 'Sécurisé et fiable',  sub: 'JWT + Spring Security + BCrypt' },
            { icon: <Icons.Monitor />, color: 'green', title: 'Interface moderne',    sub: 'React 18 + Spring Boot 3.2' },
            { icon: <Icons.MapPin />,  color: 'blue',  title: 'Données réelles',      sub: 'Gouvernorat de Tunis' },
            { icon: <Icons.Activity />,color: 'gold',  title: 'Haute performance',    sub: 'PostgreSQL + JPA optimisé' },
          ].map((b, i) => (
            <div className="hp-about-card" key={i}>
              <div className={`hp-about-icon hp-about-icon--${b.color}`}>{b.icon}</div>
              <div>
                <div className="hp-about-card-title">{b.title}</div>
                <div className="hp-about-card-sub">{b.sub}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── NEWS ── */}
      <section className="hp-section" id="news">
        <div className="hp-section-header">
          <div className="hp-tag">
            <Icons.Calendar />
            Actualités
          </div>
          <h2 className="hp-section-title">Informations municipales</h2>
          <p className="hp-section-sub">Dernières annonces et mises à jour de la plateforme</p>
        </div>
        <div className="hp-news-grid">
          {[
            {
              bg: '#eaf3de',
              iconColor: '#3b6d11',
              icon: <Icons.Road />,
              tag: 'Nouveau',
              tagClass: 'new',
              title: 'Nouvelle route ajoutée — Secteur Médina, Tunis',
              date: '28 juin 2026'
            },
            {
              bg: '#e6f1fb',
              iconColor: '#185fa5',
              icon: <Icons.Building />,
              tag: 'Info',
              tagClass: 'info',
              title: 'Mise à jour des secteurs — Municipalité La Marsa',
              date: '25 juin 2026'
            },
            {
              bg: '#faeeda',
              iconColor: '#854f0b',
              icon: <Icons.Info />,
              tag: 'Mise à jour',
              tagClass: 'update',
              title: 'Maintenance système planifiée — 30 juin 2026',
              date: '22 juin 2026'
            },
            {
              bg: '#fbeaf0',
              iconColor: '#993556',
              icon: <Icons.MapPin />,
              tag: 'Nouveau',
              tagClass: 'new',
              title: 'Nouveau secteur enregistré — Cité Ennasr, Ariana',
              date: '20 juin 2026'
            },
          ].map((n, i) => (
            <div className="hp-news-card" key={i}>
              <div className="hp-news-header" style={{ background: n.bg }}>
                <span style={{ color: n.iconColor, width: 40, height: 40, display: 'flex' }}>
                  {n.icon}
                </span>
              </div>
              <div className="hp-news-body">
                <span className={`hp-news-tag hp-news-tag--${n.tagClass}`}>
                  {n.tagClass === 'new' && <Icons.Check />}
                  {n.tagClass === 'info' && <Icons.Info />}
                  {n.tagClass === 'update' && <Icons.Refresh />}
                  {n.tag}
                </span>
                <p className="hp-news-title">{n.title}</p>
                <div className="hp-news-date">
                  <span style={{ width: 14, height: 14, display: 'flex' }}><Icons.Calendar /></span>
                  {n.date}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="hp-footer" id="contact">
        <div className="hp-footer-inner">
          <div className="hp-footer-top">
            <div className="hp-footer-flag">
              <Icons.TunisiaFlag size={40} />
              <div>
                <span className="hp-footer-flag-title">République Tunisienne</span>
                <span className="hp-footer-flag-sub">Ministère de l'Intérieur</span>
              </div>
            </div>
          </div>

          <div className="hp-footer-grid">
            <div className="hp-footer-brand">
              <div className="hp-footer-logo">
                <div className="hp-footer-logo-box"><Icons.Logo /></div>
                <span className="hp-footer-logo-name">Baladiya Smart Management</span>
              </div>
              <p className="hp-footer-desc">
                Plateforme officielle de gestion municipale tunisienne.
                Moderniser l'administration locale pour mieux servir les citoyens.
              </p>
              <div className="hp-footer-contacts">
                <div className="hp-fc"><span className="hp-fc-icon"><Icons.Mail /></span> contact@baladiya.tn</div>
                <div className="hp-fc"><span className="hp-fc-icon"><Icons.Phone /></span> +216 71 000 000</div>
                <div className="hp-fc"><span className="hp-fc-icon"><Icons.MapPin /></span> Tunis, Tunisie</div>
              </div>
            </div>

            {[
              { title: 'Navigation', links: ['Accueil', 'Services', 'À propos', 'Actualités'] },
              { title: 'Compte',     links: ['Se connecter', "S'inscrire", 'Dashboard', 'Paramètres'] },
              { title: 'Informations', links: ['Mentions légales', 'Confidentialité', 'CGU', 'Accessibilité'] },
            ].map((col, i) => (
              <div className="hp-footer-col" key={i}>
                <h4 className="hp-footer-col-title">{col.title}</h4>
                {col.links.map((l, j) => (
                  <button
                    key={j}
                    className="hp-footer-link"
                    onClick={() => {
                      if (l === 'Accueil') scrollToSection('home');
                      else if (l === 'Services') scrollToSection('services');
                      else if (l === 'À propos') scrollToSection('about');
                      else if (l === 'Actualités') scrollToSection('news');
                      else if (l === 'Contact') scrollToSection('contact');
                    }}
                  >
                    <span className="hp-fc-icon"><Icons.Chevron /></span>
                    {l}
                  </button>
                ))}
              </div>
            ))}
          </div>

          <div className="hp-footer-bottom">
            <div className="hp-footer-copy">
              <Icons.TunisiaFlag size={24} />
              <span>© 2026 Baladiya Smart Management — Tous droits réservés</span>
            </div>
            <div className="hp-footer-social">
              {[<Icons.Facebook />, <Icons.Twitter />, <Icons.LinkedIn />].map((ic, i) => (
                <button className="hp-social-btn" key={i}>{ic}</button>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}