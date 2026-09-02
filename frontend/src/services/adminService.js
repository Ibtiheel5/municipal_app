import api from './api';

const AdminService = {
  getUsersEnAttente: () => api.get('/api/admin/users/en-attente').then(r => r.data),
  getAllUsers: () => api.get('/api/admin/users').then(r => r.data),
  accepterEtAffecter: (userId, municipaliteId) =>
    api.put(`/api/admin/users/${userId}/accepter`, { municipaliteId }).then(r => r.data),
  refuserUtilisateur: (userId) =>
    api.put(`/api/admin/users/${userId}/refuser`).then(r => r.data),
  getMunicipalites: () => api.get('/api/admin/municipalites').then(r => r.data),
};

export default AdminService;