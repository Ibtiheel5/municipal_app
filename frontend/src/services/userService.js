// userService.js - Version corrigée (sans doublon)
import api from './api';

// ════════════════════════════════════════════════════════════════
//  USER SERVICE - Toutes les méthodes pour l'application
// ════════════════════════════════════════════════════════════════

const UserService = {
  // ──────────────────────────────────────────────────────────────
  // 1. AUTHENTIFICATION & UTILISATEUR
  // ──────────────────────────────────────────────────────────────

  getMaMunicipalite: async () => {
    try {
      console.log('📡 Appel de getMaMunicipalite...');
      const response = await api.get('/api/user/ma-municipalite');
      console.log('✅ getMaMunicipalite - réponse:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Erreur getMaMunicipalite:', error);
      throw error;
    }
  },

  // ──────────────────────────────────────────────────────────────
  // 2. SECTEURS
  // ──────────────────────────────────────────────────────────────

  ajouterSecteur: async (data) => {
    try {
      const response = await api.post('/api/user/secteurs', data);
      return response.data;
    } catch (error) {
      console.error('❌ Erreur ajouterSecteur:', error);
      throw error;
    }
  },

  modifierSecteur: async (secteurId, data) => {
    try {
      const response = await api.put(`/api/user/secteurs/${secteurId}`, data);
      return response.data;
    } catch (error) {
      console.error('❌ Erreur modifierSecteur:', error);
      throw error;
    }
  },

  supprimerSecteur: async (secteurId) => {
    try {
      const response = await api.delete(`/api/user/secteurs/${secteurId}`);
      return response.data;
    } catch (error) {
      console.error('❌ Erreur supprimerSecteur:', error);
      throw error;
    }
  },

  // ──────────────────────────────────────────────────────────────
  // 3. RUES
  // ──────────────────────────────────────────────────────────────

  ajouterRue: async (secteurId, data) => {
    try {
      const response = await api.post(`/api/user/secteurs/${secteurId}/rues`, data);
      return response.data;
    } catch (error) {
      console.error('❌ Erreur ajouterRue:', error);
      throw error;
    }
  },

  modifierRue: async (rueId, data) => {
    try {
      const response = await api.put(`/api/user/rues/${rueId}`, data);
      return response.data;
    } catch (error) {
      console.error('❌ Erreur modifierRue:', error);
      throw error;
    }
  },

  supprimerRue: async (rueId) => {
    try {
      const response = await api.delete(`/api/user/rues/${rueId}`);
      return response.data;
    } catch (error) {
      console.error('❌ Erreur supprimerRue:', error);
      throw error;
    }
  },

  // ──────────────────────────────────────────────────────────────
  // 4. TIB - GESTION
  // ──────────────────────────────────────────────────────────────

  getRuesForTIBGestion: async () => {
    try {
      const response = await api.get('/api/user/tib-gestion/rues');
      return response.data;
    } catch (error) {
      console.error('❌ Erreur getRuesForTIBGestion:', error);
      throw error;
    }
  },

  getProprietairesByRue: async (rueId) => {
    try {
      const response = await api.get(`/api/user/tib-gestion/proprietaires/rue/${rueId}`);
      return response.data;
    } catch (error) {
      console.error('❌ Erreur getProprietairesByRue:', error);
      throw error;
    }
  },

  getProprietaireDetails: async (proprietaireId) => {
    try {
      const response = await api.get(`/api/user/tib-gestion/proprietaire/${proprietaireId}`);
      return response.data;
    } catch (error) {
      console.error('❌ Erreur getProprietaireDetails:', error);
      throw error;
    }
  },

  rechercherProprietaires: async (cin, nom) => {
    try {
      const params = new URLSearchParams();
      if (cin) params.append('cin', cin);
      if (nom) params.append('nom', nom);
      const response = await api.get(`/api/user/tib-gestion/proprietaires/recherche?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.error('❌ Erreur rechercherProprietaires:', error);
      throw error;
    }
  },

  getAvisByProprietaireTIB: async (proprietaireId) => {
    try {
      const response = await api.get(`/api/user/tib-gestion/avis/proprietaire/${proprietaireId}`);
      return response.data;
    } catch (error) {
      console.error('❌ Erreur getAvisByProprietaireTIB:', error);
      throw error;
    }
  },

  rechercherHistoriqueTIB: async (filters = {}) => {
    try {
      const params = new URLSearchParams();
      if (filters.annee) params.append('annee', filters.annee);
      if (filters.rueId) params.append('rueId', filters.rueId);
      if (filters.proprietaireId) params.append('proprietaireId', filters.proprietaireId);
      if (filters.statut) params.append('statut', filters.statut);
      const response = await api.get(`/api/user/tib-gestion/avis/historique?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.error('❌ Erreur rechercherHistoriqueTIB:', error);
      throw error;
    }
  },

  genererAvisTIB: async (data) => {
    try {
      const response = await api.post('/api/user/tib-gestion/generer-avis', data);
      return response.data;
    } catch (error) {
      console.error('❌ Erreur genererAvisTIB:', error);
      throw error;
    }
  },

  marquerAvisTIBPaye: async (avisId) => {
    try {
      const response = await api.put(`/api/user/tib-gestion/avis/${avisId}/payer`);
      return response.data;
    } catch (error) {
      console.error('❌ Erreur marquerAvisTIBPaye:', error);
      throw error;
    }
  },

  getCategoriesTIB: async () => {
    try {
      const response = await api.get('/api/user/categories-tib');
      return response.data;
    } catch (error) {
      console.error('❌ Erreur getCategoriesTIB:', error);
      throw error;
    }
  },

  // ✅ Corrigé : /api/admin/tib/parametres est réservé ADMIN et renvoyait 403
  // pour les USER normaux, ce qui vidait silencieusement frais/coefficient
  // dans TIBPage.jsx. Ce nouvel endpoint est accessible USER + ADMIN.
  getParametresTIB: async () => {
    try {
      const response = await api.get('/api/user/tib-gestion/parametres');
      return response.data;
    } catch (error) {
      console.error('❌ Erreur getParametresTIB:', error);
      throw error;
    }
  },

  // ──────────────────────────────────────────────────────────────
  // 7. ADMINISTRATION TIB (page Paramètres — réservée ADMIN)
  //    Fusionné depuis userService_ADDITIONS.js, qui n'était jamais
  //    importé : c'est ce qui faisait planter TIBAdminPage.jsx.
  // ──────────────────────────────────────────────────────────────

  getCategoriesTIBAdmin: async () => {
    const response = await api.get('/api/admin/tib/categories');
    return response.data;
  },
  creerCategorieTIB: async (payload) => {
    const response = await api.post('/api/admin/tib/categories', payload);
    return response.data;
  },
  modifierCategorieTIB: async (id, payload) => {
    const response = await api.put(`/api/admin/tib/categories/${id}`, payload);
    return response.data;
  },
  supprimerCategorieTIB: async (id) => {
    const response = await api.delete(`/api/admin/tib/categories/${id}`);
    return response.data;
  },

  getValeursVenalesAdmin: async () => {
    const response = await api.get('/api/admin/tib/valeurs-venales');
    return response.data;
  },
  creerValeurVenale: async (payload) => {
    const response = await api.post('/api/admin/tib/valeurs-venales', payload);
    return response.data;
  },
  modifierValeurVenale: async (id, payload) => {
    const response = await api.put(`/api/admin/tib/valeurs-venales/${id}`, payload);
    return response.data;
  },
  supprimerValeurVenale: async (id) => {
    const response = await api.delete(`/api/admin/tib/valeurs-venales/${id}`);
    return response.data;
  },

  modifierParametresTIB: async (payload) => {
    const response = await api.put('/api/admin/tib/parametres', payload);
    return response.data;
  },

  getTIBInfo: async (rueId) => {
    try {
      const response = await api.get(`/api/user/tib/rue/${rueId}`);
      return response.data;
    } catch (error) {
      console.error('❌ Erreur getTIBInfo:', error);
      throw error;
    }
  },

  // ──────────────────────────────────────────────────────────────
  // 5. PROPRIETAIRES (CRUD)
  // ──────────────────────────────────────────────────────────────

  createProprietaire: async (data) => {
    try {
      const response = await api.post('/api/user/proprietaires', data);
      return response.data;
    } catch (error) {
      console.error('❌ Erreur createProprietaire:', error);
      throw error;
    }
  },

  updateProprietaire: async (id, data) => {
    try {
      const response = await api.put(`/api/user/proprietaires/${id}`, data);
      return response.data;
    } catch (error) {
      console.error('❌ Erreur updateProprietaire:', error);
      throw error;
    }
  },

  deleteProprietaire: async (id) => {
    try {
      const response = await api.delete(`/api/user/proprietaires/${id}`);
      return response.data;
    } catch (error) {
      console.error('❌ Erreur deleteProprietaire:', error);
      throw error;
    }
  },

  getProprietaire: async (id) => {
    try {
      const response = await api.get(`/api/user/proprietaires/${id}`);
      return response.data;
    } catch (error) {
      console.error('❌ Erreur getProprietaire:', error);
      throw error;
    }
  },

  getProprietaires: async (params = {}) => {
    try {
      const queryParams = new URLSearchParams();
      Object.keys(params).forEach(key => {
        if (params[key] !== null && params[key] !== undefined && params[key] !== '') {
          queryParams.append(key, params[key]);
        }
      });
      const response = await api.get(`/api/user/proprietaires?${queryParams.toString()}`);
      return response.data;
    } catch (error) {
      console.error('❌ Erreur getProprietaires:', error);
      throw error;
    }
  },

  countProprietaires: async () => {
    try {
      const response = await api.get('/api/user/proprietaires/count');
      return response.data;
    } catch (error) {
      console.error('❌ Erreur countProprietaires:', error);
      throw error;
    }
  },

  // ──────────────────────────────────────────────────────────────
  // 6. MÉTHODES DÉPRÉCIÉES (COMPATIBILITÉ)
  // ──────────────────────────────────────────────────────────────

  getRuesForTIB: async () => {
    console.warn('⚠️ getRuesForTIB est déprécié, utilisez getRuesForTIBGestion');
    return UserService.getRuesForTIBGestion();
  },

  getDensitesUrbaines: async () => {
    try {
      const response = await api.get('/api/user/tnb-gestion/densites');
      return response.data;
    } catch (error) {
      console.error('❌ Erreur getDensitesUrbaines:', error);
      throw error;
    }
  },

  // ── Section 2 : recherche / détails propriétaire + terrains ─────────────
  rechercherProprietairesTNB: async (cin, nom) => {
    try {
      const params = new URLSearchParams();
      if (cin) params.append('cin', cin);
      if (nom) params.append('nom', nom);
      const response = await api.get(`/api/user/tnb-gestion/proprietaires/recherche?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.error('❌ Erreur rechercherProprietairesTNB:', error);
      throw error;
    }
  },

  getProprietaireDetailsTNB: async (proprietaireId) => {
    try {
      const response = await api.get(`/api/user/tnb-gestion/proprietaire/${proprietaireId}`);
      return response.data;
    } catch (error) {
      console.error('❌ Erreur getProprietaireDetailsTNB:', error);
      throw error;
    }
  },

  // ── Section 1 + 3 + 4 : génération et historique des avis ───────────────
  genererAvisTNB: async (data) => {
    try {
      const response = await api.post('/api/user/tnb-gestion/generer-avis', data);
      return response.data;
    } catch (error) {
      console.error('❌ Erreur genererAvisTNB:', error);
      throw error;
    }
  },

  getAvisByProprietaireTNB: async (proprietaireId) => {
    try {
      const response = await api.get(`/api/user/tnb-gestion/avis/proprietaire/${proprietaireId}`);
      return response.data;
    } catch (error) {
      console.error('❌ Erreur getAvisByProprietaireTNB:', error);
      throw error;
    }
  },

  rechercherHistoriqueTNB: async (filters = {}) => {
    try {
      const params = new URLSearchParams();
      if (filters.annee) params.append('annee', filters.annee);
      if (filters.statut) params.append('statut', filters.statut);
      if (filters.methode) params.append('methode', filters.methode);
      if (filters.recherche) params.append('search', filters.recherche);
      const response = await api.get(`/api/user/tnb-gestion/avis/historique?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.error('❌ Erreur rechercherHistoriqueTNB:', error);
      throw error;
    }
  },

  getAvisTNBDetails: async (avisId) => {
    try {
      const response = await api.get(`/api/user/tnb-gestion/avis/${avisId}`);
      return response.data;
    } catch (error) {
      console.error('❌ Erreur getAvisTNBDetails:', error);
      throw error;
    }
  },

  marquerAvisTNBPaye: async (avisId) => {
    try {
      const response = await api.put(`/api/user/tnb-gestion/avis/${avisId}/payer`);
      return response.data;
    } catch (error) {
      console.error('❌ Erreur marquerAvisTNBPaye:', error);
      throw error;
    }
  },

  // ═══════════════════ ADMINISTRATION — Paramètres TNB ═══════════════════

  // ── Densités urbaines (CRUD admin) ───────────────────────────────────────
  getDensitesTNBAdmin: async () => {
    try {
      const response = await api.get('/api/admin/tnb/densites');
      return response.data;
    } catch (error) {
      console.error('❌ Erreur getDensitesTNBAdmin:', error);
      throw error;
    }
  },

  creerDensiteTNB: async (data) => {
    try {
      const response = await api.post('/api/admin/tnb/densites', data);
      return response.data;
    } catch (error) {
      console.error('❌ Erreur creerDensiteTNB:', error);
      throw error;
    }
  },

  modifierDensiteTNB: async (id, data) => {
    try {
      const response = await api.put(`/api/admin/tnb/densites/${id}`, data);
      return response.data;
    } catch (error) {
      console.error('❌ Erreur modifierDensiteTNB:', error);
      throw error;
    }
  },

  supprimerDensiteTNB: async (id) => {
    try {
      const response = await api.delete(`/api/admin/tnb/densites/${id}`);
      return response.data;
    } catch (error) {
      console.error('❌ Erreur supprimerDensiteTNB:', error);
      throw error;
    }
  },

  // ── Valeurs vénales — référentiel (CRUD admin) ───────────────────────────
  getValeursVenalesTNBAdmin: async () => {
    try {
      const response = await api.get('/api/admin/tnb/valeurs-venales');
      return response.data;
    } catch (error) {
      console.error('❌ Erreur getValeursVenalesTNBAdmin:', error);
      throw error;
    }
  },

  creerValeurVenaleTNB: async (data) => {
    try {
      const response = await api.post('/api/admin/tnb/valeurs-venales', data);
      return response.data;
    } catch (error) {
      console.error('❌ Erreur creerValeurVenaleTNB:', error);
      throw error;
    }
  },

  modifierValeurVenaleTNB: async (id, data) => {
    try {
      const response = await api.put(`/api/admin/tnb/valeurs-venales/${id}`, data);
      return response.data;
    } catch (error) {
      console.error('❌ Erreur modifierValeurVenaleTNB:', error);
      throw error;
    }
  },

  supprimerValeurVenaleTNB: async (id) => {
    try {
      const response = await api.delete(`/api/admin/tnb/valeurs-venales/${id}`);
      return response.data;
    } catch (error) {
      console.error('❌ Erreur supprimerValeurVenaleTNB:', error);
      throw error;
    }
  },
   ajouterTerrainTNB: async (proprietaireId, data) => {
      try {
        const response = await api.post(
          `/api/user/tnb-gestion/proprietaires/${proprietaireId}/terrains`,
          data
        );
        return response.data;
      } catch (error) {
        console.error('❌ Erreur ajouterTerrainTNB:', error);
        throw error;
      }
    },

};

export default UserService;