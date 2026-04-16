import axiosClient from './axiosClient';

const helpdeskCatalogApi = {
  // GET all catalogs
  getAll: () => axiosClient.get('/HelpdeskCatalog'),

  // GET by id
  getById: (id) => axiosClient.get(`/HelpdeskCatalog/${id}`),

  // CREATE catalog
  create: (data) => axiosClient.post('/HelpdeskCatalog', data),

  // UPDATE catalog
  update: (id, data) => axiosClient.put(`/HelpdeskCatalog/${id}`, data),

  // DELETE catalog
  delete: (id) => axiosClient.delete(`/HelpdeskCatalog/${id}`),

  // PATCH status
  updateStatus: (id, isActived) =>
    axiosClient.patch(`/HelpdeskCatalog/${id}/status?isActived=${isActived}`)
};

export default helpdeskCatalogApi;