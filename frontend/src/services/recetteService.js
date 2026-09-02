// recetteService.js (v2)
import api from './api';

// ════════════════════════════════════════════════════════════════
//  RECETTE SERVICE - Dashboard Recettes (module financier indépendant)
// ════════════════════════════════════════════════════════════════

const RecetteService = {
  // ── "Toutes les recettes" ────────────────────────────────────────────────

  rechercherRecettes: async (filters = {}, page = 0, size = 20, sortBy = 'date', sortDir = 'desc') => {
    try {
      const params = new URLSearchParams();
      if (filters.type) params.append('type', filters.type);
      if (filters.annee) params.append('annee', filters.annee);
      if (filters.statut) params.append('statut', filters.statut);
      if (filters.secteur) params.append('secteur', filters.secteur);
      if (filters.search) params.append('search', filters.search);
      params.append('page', page);
      params.append('size', size);
      params.append('sortBy', sortBy);
      params.append('sortDir', sortDir);

      const response = await api.get(`/api/user/recettes?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.error('❌ Erreur rechercherRecettes:', error);
      throw error;
    }
  },

  getRecette: async (id) => {
    try {
      const response = await api.get(`/api/user/recettes/${id}`);
      return response.data;
    } catch (error) {
      console.error('❌ Erreur getRecette:', error);
      throw error;
    }
  },

  marquerRecettePaye: async (id, modePaiement) => {
    try {
      const response = await api.put(`/api/user/recettes/${id}/payer`, { modePaiement });
      return response.data;
    } catch (error) {
      console.error('❌ Erreur marquerRecettePaye:', error);
      throw error;
    }
  },

  // ── Relevé de compte (recherche par Code TIB/TNB) ───────────────────────

  getReleveCompte: async (code) => {
    try {
      const response = await api.get(`/api/user/recettes/releve/${encodeURIComponent(code)}`);
      return response.data;
    } catch (error) {
      console.error('❌ Erreur getReleveCompte:', error);
      throw error;
    }
  },

  enregistrerPaiementAnnee: async (code, annee, montant, modePaiement) => {
    try {
      const response = await api.post(
        `/api/user/recettes/releve/${encodeURIComponent(code)}/annees/${annee}/paiements`,
        { montant, modePaiement }
      );
      return response.data;
    } catch (error) {
      console.error('❌ Erreur enregistrerPaiementAnnee:', error);
      throw error;
    }
  },

  getQuittancesByRecette: async (recetteId) => {
    try {
      const response = await api.get(`/api/user/recettes/${recetteId}/quittances`);
      return response.data;
    } catch (error) {
      console.error('❌ Erreur getQuittancesByRecette:', error);
      throw error;
    }
  },

  getQuittance: async (numeroQuittance) => {
    try {
      const response = await api.get(`/api/user/recettes/quittances/${encodeURIComponent(numeroQuittance)}`);
      return response.data;
    } catch (error) {
      console.error('❌ Erreur getQuittance:', error);
      throw error;
    }
  },
};

export default RecetteService;
