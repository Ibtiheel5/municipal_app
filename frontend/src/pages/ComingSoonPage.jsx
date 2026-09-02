// ComingSoonPage.jsx - Placeholder réutilisé par les onglets du Dashboard Recettes
// pas encore construits. À remplacer un par un par de vraies pages.
import React from 'react';

export default function ComingSoonPage({ title, description, icon }) {
  return (
    <div className="recettes-coming-soon">
      <div className="recettes-coming-soon-icon">{icon}</div>
      <h3>{title}</h3>
      <p>{description || 'Cette section du Dashboard Recettes arrive bientôt.'}</p>
    </div>
  );
}
