// TNBAdminPage.jsx - Administration > Paramètres TNB
// Réservé aux comptes ADMIN. Gère : Densités urbaines, Valeurs vénales (référentiel).
import React, { useState, useEffect } from 'react';
import UserService from '../services/userService';
import './TIBPage.css';

const emptyDensite = { id: null, categorie: '', prixDensite: '', actif: true };
const emptyValeur = { id: null, valeurVn: '', annee: new Date().getFullYear(), description: '' };

export default function TNBAdminPage({ showMsg }) {
  const [densites, setDensites] = useState([]);
  const [valeurs, setValeurs] = useState([]);

  const [formDensite, setFormDensite] = useState(emptyDensite);
  const [formValeur, setFormValeur] = useState(emptyValeur);
  const [loading, setLoading] = useState(false);

  useEffect(() => { chargerTout(); }, []);

  const chargerTout = async () => {
    try {
      setLoading(true);
      const [d, v] = await Promise.all([
        UserService.getDensitesTNBAdmin(),
        UserService.getValeursVenalesTNBAdmin(),
      ]);
      setDensites(d);
      setValeurs(v);
    } catch (error) {
      showMsg('Erreur lors du chargement des paramètres TNB.', 'error');
    } finally {
      setLoading(false);
    }
  };

  // ── Densités urbaines ──────────────────────────────────────────
  const soumettreDensite = async () => {
    if (!formDensite.categorie || !formDensite.prixDensite) {
      showMsg('Veuillez remplir tous les champs de la densité.', 'error');
      return;
    }
    try {
      const payload = { ...formDensite, prixDensite: parseFloat(formDensite.prixDensite), actif: true };
      if (formDensite.id) {
        await UserService.modifierDensiteTNB(formDensite.id, payload);
        showMsg('Densité modifiée.', 'success');
      } else {
        await UserService.creerDensiteTNB(payload);
        showMsg('Densité ajoutée.', 'success');
      }
      setFormDensite(emptyDensite);
      chargerTout();
    } catch (error) {
      showMsg("Erreur lors de l'enregistrement de la densité.", 'error');
    }
  };

  const supprimerDensite = async (id) => {
    if (!window.confirm('Supprimer cette catégorie de densité ?')) return;
    try {
      await UserService.supprimerDensiteTNB(id);
      showMsg('Densité supprimée.', 'success');
      chargerTout();
    } catch (error) {
      showMsg('Erreur lors de la suppression.', 'error');
    }
  };

  // ── Valeurs vénales (référentiel) ─────────────────────────────
  const soumettreValeur = async () => {
    if (!formValeur.valeurVn || !formValeur.annee) {
      showMsg('Veuillez remplir la valeur VN et l\'année.', 'error');
      return;
    }
    try {
      const payload = {
        valeurVn: parseFloat(formValeur.valeurVn),
        annee: parseInt(formValeur.annee),
        description: formValeur.description,
      };
      if (formValeur.id) {
        await UserService.modifierValeurVenaleTNB(formValeur.id, payload);
        showMsg('Valeur vénale modifiée.', 'success');
      } else {
        await UserService.creerValeurVenaleTNB(payload);
        showMsg('Valeur vénale ajoutée.', 'success');
      }
      setFormValeur(emptyValeur);
      chargerTout();
    } catch (error) {
      showMsg("Erreur lors de l'enregistrement de la valeur vénale.", 'error');
    }
  };

  const supprimerValeur = async (id) => {
    if (!window.confirm('Supprimer cette valeur vénale ?')) return;
    try {
      await UserService.supprimerValeurVenaleTNB(id);
      showMsg('Valeur vénale supprimée.', 'success');
      chargerTout();
    } catch (error) {
      showMsg('Erreur lors de la suppression.', 'error');
    }
  };

  if (loading) {
    return <div className="tib-loading"><div className="tib-loading-spinner" /><span>Chargement...</span></div>;
  }

  return (
    <div className="tib-page">
      <div className="tib-header">
        <h1>Administration — Paramètres TNB</h1>
        <p>Gestion des densités urbaines et du référentiel des valeurs vénales</p>
      </div>

      {/* Densités urbaines */}
      <div className="tib-card tib-card-full">
        <div className="tib-card-header">
          <h3>Densités urbaines<span className="badge-count">{densites.length}</span></h3>
        </div>
        <div className="tib-card-body">
          <p className="formule-hint">
            Utilisées pour la Méthode 2 de calcul TNB : Montant TNB = Prix densité × Surface du terrain.
          </p>
          <div className="search-grid" style={{ marginBottom: '1rem' }}>
            <div className="search-item">
              <label>Catégorie</label>
              <input className="tib-input" value={formDensite.categorie}
                onChange={e => setFormDensite({ ...formDensite, categorie: e.target.value })}
                placeholder="Ex: Densité élevée" />
            </div>
            <div className="search-item">
              <label>Prix densité (TND/m²)</label>
              <input type="number" step="0.001" className="tib-input" value={formDensite.prixDensite}
                onChange={e => setFormDensite({ ...formDensite, prixDensite: e.target.value })}
                placeholder="Ex: 0.385" />
            </div>
            <div className="search-item search-actions">
              <button className="btn-search" onClick={soumettreDensite}>{formDensite.id ? 'Modifier' : 'Ajouter'}</button>
              {formDensite.id && <button className="btn-secondary" onClick={() => setFormDensite(emptyDensite)}>Annuler</button>}
            </div>
          </div>

          <div className="table-wrapper">
            <table className="avis-table">
              <thead><tr><th>Catégorie</th><th>Prix densité (TND/m²)</th><th>Statut</th><th>Actions</th></tr></thead>
              <tbody>
                {densites.length === 0 ? (
                  <tr><td colSpan={4} className="no-data">Aucune densité enregistrée.</td></tr>
                ) : densites.map(d => (
                  <tr key={d.id}>
                    <td><strong>{d.categorie}</strong></td>
                    <td>{d.prixDensite.toFixed(3)}</td>
                    <td><span className={d.actif ? 'status-badge status-success' : 'status-badge status-danger'}>{d.actif ? 'Actif' : 'Inactif'}</span></td>
                    <td className="action-buttons">
                      <button className="btn-view" onClick={() => setFormDensite(d)}>Modifier</button>
                      <button className="btn-payer" onClick={() => supprimerDensite(d.id)}>Supprimer</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Valeurs vénales (référentiel) */}
      <div className="tib-card tib-card-full">
        <div className="tib-card-header">
          <h3>Valeurs vénales (référentiel)<span className="badge-count">{valeurs.length}</span></h3>
        </div>
        <div className="tib-card-body">
          <p className="formule-hint">
            Catalogue consultable des valeurs vénales de référence. La valeur utilisée pour un avis TNB (Méthode 1)
            est saisie librement lors de la génération de l'avis.
          </p>
          <div className="search-grid" style={{ marginBottom: '1rem' }}>
            <div className="search-item">
              <label>Valeur VN (TND)</label>
              <input type="number" step="1" className="tib-input" value={formValeur.valeurVn}
                onChange={e => setFormValeur({ ...formValeur, valeurVn: e.target.value })}
                placeholder="Ex: 100000" />
            </div>
            <div className="search-item">
              <label>Année</label>
              <input type="number" className="tib-input" value={formValeur.annee}
                onChange={e => setFormValeur({ ...formValeur, annee: e.target.value })} />
            </div>
            <div className="search-item">
              <label>Description</label>
              <input className="tib-input" value={formValeur.description}
                onChange={e => setFormValeur({ ...formValeur, description: e.target.value })}
                placeholder="Ex: Zone résidentielle centre-ville" />
            </div>
            <div className="search-item search-actions">
              <button className="btn-search" onClick={soumettreValeur}>{formValeur.id ? 'Modifier' : 'Ajouter'}</button>
              {formValeur.id && <button className="btn-secondary" onClick={() => setFormValeur(emptyValeur)}>Annuler</button>}
            </div>
          </div>

          <div className="table-wrapper">
            <table className="avis-table">
              <thead><tr><th>Valeur VN (TND)</th><th>Année</th><th>Description</th><th>Actions</th></tr></thead>
              <tbody>
                {valeurs.length === 0 ? (
                  <tr><td colSpan={4} className="no-data">Aucune valeur vénale enregistrée.</td></tr>
                ) : valeurs.map(v => (
                  <tr key={v.id}>
                    <td>{v.valeurVn.toLocaleString('fr-TN')}</td>
                    <td>{v.annee}</td>
                    <td>{v.description || '—'}</td>
                    <td className="action-buttons">
                      <button className="btn-view" onClick={() => setFormValeur(v)}>Modifier</button>
                      <button className="btn-payer" onClick={() => supprimerValeur(v.id)}>Supprimer</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
