import axiosClient from './axiosClient';

const wardApi = {
  // [GET] /api/Ward
  getAll: () => {
    return axiosClient.get('/Ward');
  },

  // [GET] /api/Ward/{id}
  getById: (id) => {
    return axiosClient.get(`/Ward/${id}`);
  },

  // [POST] /api/Ward
  create: (key, data) => {
    return axiosClient.post(`/Ward/${key}`, data);
  },

  // [PUT] /api/Ward/{id}
  update: (id, data) => {
    return axiosClient.put(`/Ward/${id}`, data);
  },

  // [DELETE] /api/Ward/{id}
  delete: (id) => {
    return axiosClient.delete(`/Ward/${id}`);
  }
};

export default wardApi;