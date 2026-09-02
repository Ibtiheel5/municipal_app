import React from 'react';

export const LogoMunicipal = ({ size = 80, className = '' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 200 200"
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    <defs>
      {/* Dégradé bleu pour le fond */}
      <linearGradient id="bgBlue" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style={{stopColor:'#1A365D', stopOpacity:1}} />
        <stop offset="100%" style={{stopColor:'#2B6CB0', stopOpacity:1}} />
      </linearGradient>

      {/* Dégradé doré */}
      <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style={{stopColor:'#D4AF37', stopOpacity:1}} />
        <stop offset="100%" style={{stopColor:'#F6E05E', stopOpacity:1}} />
      </linearGradient>

      {/* Dégradé rouge pour l'emblème */}
      <linearGradient id="redGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style={{stopColor:'#C53030', stopOpacity:1}} />
        <stop offset="100%" style={{stopColor:'#E53E3E', stopOpacity:1}} />
      </linearGradient>
    </defs>

    {/* Cercle extérieur - Bleu */}
    <circle cx="100" cy="100" r="95" fill="url(#bgBlue)" stroke="url(#goldGrad)" strokeWidth="3"/>

    {/* Cercle intérieur - Blanc */}
    <circle cx="100" cy="100" r="80" fill="white" stroke="#E2E8F0" strokeWidth="1"/>

    {/* Bâtiment municipal stylisé */}
    <g transform="translate(100, 85)">
      {/* Corps du bâtiment */}
      <rect x="-40" y="-20" width="80" height="45" fill="#2D3748" rx="3"/>

      {/* Colonnes */}
      <rect x="-35" y="-15" width="6" height="35" fill="#E8D5A3" rx="1"/>
      <rect x="-20" y="-15" width="6" height="35" fill="#E8D5A3" rx="1"/>
      <rect x="-5" y="-15" width="6" height="35" fill="#E8D5A3" rx="1"/>
      <rect x="10" y="-15" width="6" height="35" fill="#E8D5A3" rx="1"/>
      <rect x="25" y="-15" width="6" height="35" fill="#E8D5A3" rx="1"/>

      {/* Fronton triangulaire */}
      <polygon points="-45,-20 0,-45 45,-20" fill="url(#goldGrad)"/>

      {/* Drapeau tunisien */}
      <rect x="15" y="-52" width="2" height="15" fill="#D4AF37"/>
      <rect x="17" y="-52" width="14" height="9" fill="#E53E3E" rx="1"/>
      <circle cx="24" cy="-47.5" r="2.5" fill="white"/>

      {/* Porte */}
      <rect x="-7" y="5" width="14" height="20" fill="#1A365D" rx="2"/>
      <circle cx="-7" cy="15" r="1.5" fill="#D4AF37"/>

      {/* Fenêtres */}
      <rect x="-32" y="-10" width="5" height="5" fill="#90CDF4" rx="0.5"/>
      <rect x="23" y="-10" width="5" height="5" fill="#90CDF4" rx="0.5"/>
    </g>

    {/* Texte "MUNICIPALITÉ" */}
    <text
      x="100"
      y="168"
      textAnchor="middle"
      fontSize="14"
      fill="#1A365D"
      fontWeight="700"
      fontFamily="Arial, Helvetica, sans-serif"
      letterSpacing="3"
    >
      MUNICIPALITÉ
    </text>

    {/* Texte "RÉPUBLIQUE TUNISIENNE" */}
    <text
      x="100"
      y="184"
      textAnchor="middle"
      fontSize="9"
      fill="#718096"
      fontWeight="500"
      fontFamily="Arial, Helvetica, sans-serif"
      letterSpacing="2"
    >
      RÉPUBLIQUE TUNISIENNE
    </text>
  </svg>
);