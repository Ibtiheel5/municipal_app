// TIBAdminPage.jsx - Administration > Paramètres TIB
// Réservé aux comptes ADMIN. Gère : Catégories TIB, Valeurs vénales, Frais administratifs.
import React, { useState, useEffect } from 'react';
import UserService from '../services/userService';
import './TIBPage.css';

const emptyCategorie = { id: null, code: '', libelle: '', prixReferenceM2: '' };
const emptyZone = { id: null, zone: '', valeurVenaleM2: '' };

export default function TIBAdminPage({ showMsg }) {
  const [categories, setCategories] = useState([]);
  const [zones, setZones] = useState([]);
  const [parametres, setParametres] = useState({ fraisAdministratifs: '', coefficientTIB: '', delaiPaiementJours: '' });

  const [formCategorie, setFormCategorie] = useState(emptyCategorie);
  const [formZone, setFormZone] = useState(emptyZone);
  const [loading, setLoading] = useState(false);

  useEffect(() => { chargerTout(); }, []);

  const chargerTout = async () => {
    try {
      setLoading(true);
      const [c, z, p] = await Promise.all([
        UserService.getCategoriesTIBAdmin(),
        UserService.getValeursVenalesAdmin(),
        UserService.getParametresTIB(),
      ]);
      setCategories(c);
      setZones(z);
      setParametres(p);
    } catch (error) {
      showMsg('Erreur lors du chargement des paramètres TIB.', 'error');
    } finally {
      setLoading(false);
    }
  };

  // ── Catégories TIB ──────────────────────────────────────────────
  const soumettreCategorie = async () => {
    if (!formCategorie.code || !formCategorie.libelle || !formCategorie.prixReferenceM2) {
      showMsg('Veuillez remplir tous les champs de la catégorie.', 'error');
      return;
    }
    try {
      const payload = { ...formCategorie, prixReferenceM2: parseFloat(formCategorie.prixReferenceM2), actif: true };
      if (formCategorie.id) {
        await UserService.modifierCategorieTIB(formCategorie.id, payload);
        showMsg('Catégorie modifiée.', 'success');
      } else {
        await UserService.creerCategorieTIB(payload);
        showMsg('Catégorie ajoutée.', 'success');
      }
      setFormCategorie(emptyCategorie);
      chargerTout();
    } catch (error) {
      showMsg('Erreur lors de l\'enregistrement de la catégorie.', 'error');
    }
  };

  const supprimerCategorie = async (id) => {
    if (!window.confirm('Désactiver cette catégorie ?')) return;
    try {
      await UserService.supprimerCategorieTIB(id);
      showMsg('Catégorie désactivée.', 'success');
      chargerTout();
    } catch (error) {
      showMsg('Erreur lors de la suppression.', 'error');
    }
  };

  // ── Valeurs vénales ──────────────────────────────────────────────
  const soumettreZone = async () => {
    if (!formZone.zone || !formZone.valeurVenaleM2) {
      showMsg('Veuillez remplir tous les champs de la zone.', 'error');
      return;
    }
    try {
      const payload = { zone: formZone.zone, valeurVenaleM2: parseFloat(formZone.valeurVenaleM2) };
      if (formZone.id) {
        await UserService.modifierValeurVenale(formZone.id, payload);
        showMsg('Valeur vénale modifiée.', 'success');
      } else {
        await UserService.creerValeurVenale(payload);
        showMsg('Valeur vénale ajoutée.', 'success');
      }
      setFormZone(emptyZone);
      chargerTout();
    } catch (error) {
      showMsg('Erreur lors de l\'enregistrement de la zone.', 'error');
    }
  };

  const supprimerZone = async (id) => {
    if (!window.confirm('Supprimer cette valeur vénale ?')) return;
    try {
      await UserService.supprimerValeurVenale(id);
      showMsg('Valeur vénale supprimée.', 'success');
      chargerTout();
    } catch (error) {
      showMsg('Erreur lors de la suppression.', 'error');
    }
  };

  // ── Paramètres globaux (frais administratifs) ─────────────────────
  const enregistrerParametres = async () => {
    try {
      const payload = {
        fraisAdministratifs: parseFloat(parametres.fraisAdministratifs),
        coefficientTIB: parseFloat(parametres.coefficientTIB),
        delaiPaiementJours: parseInt(parametres.delaiPaiementJours),
      };
      const updated = await UserService.modifierParametresTIB(payload);
      setParametres(updated);
      showMsg('Paramètres enregistrés.', 'success');
    } catch (error) {
      showMsg('Erreur lors de l\'enregistrement des paramètres.', 'error');
    }
  };

  if (loading) {
    return <div className="tib-loading"><div className="tib-loading-spinner" /><span>Chargement...</span></div>;
  }

  return (
    <div className="tib-page">
      <div className="tib-header">
        <h1>Administration — Paramètres TIB</h1>
        <p>Gestion des catégories, des valeurs vénales par zone et des frais administratifs</p>
      </div>

      {/* Frais administratifs / coefficient */}
      <div className="tib-card tib-card-full">
        <div className="tib-card-header"><h3>Frais administratifs & coefficient légal</h3></div>
        <div className="tib-card-body">
          <div className="calcul-grid">
            <div className="calcul-item">
              <label>Frais administratifs (TND)</label>
              <input type="number" className="tib-input" step="0.001" value={parametres.fraisAdministratifs}
                onChange={e => setParametres({ ...parametres, fraisAdministratifs: e.target.value })} />
            </div>
            <div className="calcul-item">
              <label>Coefficient TIB (ex : 0.02 = 2%)</label>
              <input type="number" className="tib-input" step="0.0001" value={parametres.coefficientTIB}
                onChange={e => setParametres({ ...parametres, coefficientTIB: e.target.value })} />
            </div>
            <div className="calcul-item">
              <label>Délai de paiement (jours)</label>
              <input type="number" className="tib-input" value={parametres.delaiPaiementJours}
                onChange={e => setParametres({ ...parametres, delaiPaiementJours: e.target.value })} />
            </div>
          </div>
          <button className="btn-generer" onClick={enregistrerParametres}>Enregistrer les paramètres</button>
        </div>
      </div>

      {/* Catégories TIB */}
      <div className="tib-card tib-card-full">
        <div className="tib-card-header"><h3>Catégories TIB<span className="badge-count">{categories.length}</span></h3></div>
        <div className="tib-card-body">
          <div className="search-grid" style={{ marginBottom: '1rem' }}>
            <div className="search-item">
              <label>Code</label>
              <input className="tib-input" value={formCategorie.code} onChange={e => setFormCategorie({ ...formCategorie, code: e.target.value })} placeholder="Ex: CAT-A" />
            </div>
            <div className="search-item">
              <label>Libellé</label>
              <input className="tib-input" value={formCategorie.libelle} onChange={e => setFormCategorie({ ...formCategorie, libelle: e.target.value })} placeholder="Ex: Zone résidentielle" />
            </div>
            <div className="search-item">
              <label>Prix référence (TND/m²)</label>
              <input type="number" step="0.001" className="tib-input" value={formCategorie.prixReferenceM2} onChange={e => setFormCategorie({ ...formCategorie, prixReferenceM2: e.target.value })} />
            </div>
            <div className="search-item search-actions">
              <button className="btn-search" onClick={soumettreCategorie}>{formCategorie.id ? 'Modifier' : 'Ajouter'}</button>
              {formCategorie.id && <button className="btn-secondary" onClick={() => setFormCategorie(emptyCategorie)}>Annuler</button>}
            </div>
          </div>

          <div className="table-wrapper">
            <table className="avis-table">
              <thead><tr><th>Code</th><th>Libellé</th><th>Prix référence (TND/m²)</th><th>Statut</th><th>Actions</th></tr></thead>
              <tbody>
                {categories.map(c => (
                  <tr key={c.id}>
                    <td><strong>{c.code}</strong></td>
                    <td>{c.libelle}</td>
                    <td>{c.prixReferenceM2.toFixed(3)}</td>
                    <td><span className={c.actif ? 'status-badge status-success' : 'status-badge status-danger'}>{c.actif ? 'Actif' : 'Inactif'}</span></td>
                    <td className="action-buttons">
                      <button className="btn-view" onClick={() => setFormCategorie(c)}>Modifier</button>
                      <button className="btn-payer" onClick={() => supprimerCategorie(c.id)}>Désactiver</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Valeurs vénales */}
      <div className="tib-card tib-card-full">
        <div className="tib-card-header"><h3>Valeurs vénales par zone<span className="badge-count">{zones.length}</span></h3></div>
        <div className="tib-card-body">
          <div className="search-grid" style={{ marginBottom: '1rem' }}>
            <div className="search-item">
              <label>Zone</label>
              <input className="tib-input" value={formZone.zone} onChange={e => setFormZone({ ...formZone, zone: e.target.value })} placeholder="Ex: Tunis Centre" />
            </div>
            <div className="search-item">
              <label>Valeur vénale (TND/m²)</label>
              <input type="number" step="0.001" className="tib-input" value={formZone.valeurVenaleM2} onChange={e => setFormZone({ ...formZone, valeurVenaleM2: e.target.value })} />
            </div>
            <div className="search-item search-actions">
              <button className="btn-search" onClick={soumettreZone}>{formZone.id ? 'Modifier' : 'Ajouter'}</button>
              {formZone.id && <button className="btn-secondary" onClick={() => setFormZone(emptyZone)}>Annuler</button>}
            </div>
          </div>

          <div className="table-wrapper">
            <table className="avis-table">
              <thead><tr><th>Zone</th><th>Valeur vénale (TND/m²)</th><th>Actions</th></tr></thead>
              <tbody>
                {zones.map(z => (
                  <tr key={z.id}>
                    <td>{z.zone}</td>
                    <td>{z.valeurVenaleM2.toFixed(3)}</td>
                    <td className="action-buttons">
                      <button className="btn-view" onClick={() => setFormZone(z)}>Modifier</button>
                      <button className="btn-payer" onClick={() => supprimerZone(z.id)}>Supprimer</button>
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
