import axiosClient from './axiosClient';

const websitelocalizationApi = {
  // [GET] /api/Websitelocalization
  getAll: () => {
    return axiosClient.get('/Websitelocalization');
  },

  // [GET] /api/Websitelocalization/{id}
  getById: (id) => {
    return axiosClient.get(`/Websitelocalization/${id}`);
  },

  // [POST] /api/Websitelocalization
  create: (data) => {
    return axiosClient.post('/Websitelocalization', data);
  },

  // [PUT] /api/Websitelocalization/{key}
  update: (key, data) => {
    return axiosClient.put(`/Websitelocalization/${key}`, data);
  },

  // [DELETE] /api/Websitelocalization/{id}
  delete: (id) => {
    return axiosClient.delete(`/Websitelocalization/${id}`);
  }
};

export default websitelocalizationApi;