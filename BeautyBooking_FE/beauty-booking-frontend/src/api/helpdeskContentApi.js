import axiosClient from './axiosClient';

const helpdeskContentApi = {
  // GET all contents
  getAll: () => axiosClient.get('/HelpdeskContent'),

  // GET by id
  getById: (id) => axiosClient.get(`/HelpdeskContent/${id}`),

  // CREATE content (gắn vào catalogId)
  create: (catalogId, data) =>
    axiosClient.post(`/HelpdeskContent/${catalogId}`, data),

  // UPDATE content
  update: (id, data) =>
    axiosClient.put(`/HelpdeskContent/${id}`, data),

  // DELETE content
  delete: (id) =>
    axiosClient.delete(`/HelpdeskContent/${id}`)
};

export default helpdeskContentApi;