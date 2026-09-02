// ParametresRecettesPage.jsx
import React, { useState, useEffect } from 'react';
import UserService from '../services/userService';
import './ParametresRecettesPage.css'; // ⬅ Nouveau fichier CSS

const Icons = {
  Settings: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3" />
      <path d="M12,1v2 M12,21v2 M4.22,4.22l1.42,1.42 M18.36,18.36l1.42,1.42 M1,12h2 M21,12h2 M4.22,19.78l1.42-1.42 M18.36,5.64l1.42-1.42" />
    </svg>
  ),
  Save: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
      <polyline points="17,21 17,13 7,13 7,21" />
      <polyline points="7,3 7,8 15,8" />
    </svg>
  ),
};

export default function ParametresRecettesPage({ showMsg }) {
  const [parametres, setParametres] = useState({ fraisAdministratifs: 10, coefficientTIB: 0.02, delaiPaiementJours: 30 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    chargerParametres();
  }, []);

  const chargerParametres = async () => {
    try {
      const data = await UserService.getParametresTIB();
      setParametres(data);
    } catch (error) {
      showMsg('Erreur chargement paramètres.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setParametres({ ...parametres, [name]: parseFloat(value) || 0 });
  };

  const handleSave = async () => {
    try {
      await UserService.modifierParametresTIB(parametres);
      showMsg('Paramètres enregistrés.', 'success');
    } catch (error) {
      showMsg('Erreur enregistrement.', 'error');
    }
  };

  return (
    <div className="parametres-recettes-page">
      <div className="param-header">
        <h1><Icons.Settings /> Paramètres Recettes</h1>
        <p>Configuration des paramètres généraux du module recettes</p>
      </div>

      {loading ? (
        <div className="param-loading"><div className="spinner" /><span>Chargement...</span></div>
      ) : (
        <div className="param-card">
          <div className="param-card-body">
            <div className="param-grid">
              <div className="param-item">
                <label>Frais administratifs (TND)</label>
                <input type="number" name="fraisAdministratifs" value={parametres.fraisAdministratifs} onChange={handleChange} step="0.001" />
              </div>
              <div className="param-item">
                <label>Coefficient TIB</label>
                <input type="number" name="coefficientTIB" value={parametres.coefficientTIB} onChange={handleChange} step="0.0001" />
              </div>
              <div className="param-item">
                <label>Délai de paiement (jours)</label>
                <input type="number" name="delaiPaiementJours" value={parametres.delaiPaiementJours} onChange={handleChange} />
              </div>
            </div>
            <button className="param-save-btn" onClick={handleSave}><Icons.Save /> Enregistrer</button>
          </div>
        </div>
      )}
    </div>
  );
}