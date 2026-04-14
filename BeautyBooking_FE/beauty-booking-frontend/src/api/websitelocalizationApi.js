import axiosClient from './axiosClient';

const websitelocalizationApi = {
  // GET /api/Websitelocalization
  getAll: (params) => axiosClient.get('/Websitelocalization', { params }),
  
  // GET /api/Websitelocalization/{id}
  getById: (id) => axiosClient.get(`/Websitelocalization/${id}`),
  
  // POST /api/Websitelocalization
  create: (data) => axiosClient.post('/Websitelocalization', data),
  
  // PUT /api/Websitelocalization/{key}
  update: (key, data) => axiosClient.put(`/Websitelocalization/${key}`, data),
  
  // PUT /api/Websitelocalization/{key}/wards
  updateWards: (key, data) => axiosClient.put(`/Websitelocalization/${key}/wards`, data),
  
  // DELETE /api/Websitelocalization/{id}
  delete: (id) => axiosClient.delete(`/Websitelocalization/${id}`),
};

export default websitelocalizationApi;