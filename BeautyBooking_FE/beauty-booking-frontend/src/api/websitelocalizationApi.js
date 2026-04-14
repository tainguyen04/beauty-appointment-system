import axiosClient from './axiosClient';

const websitelocalizationApi = {

  // ================= GET =================
  getAll: (params) =>
    axiosClient.get('/Websitelocalization', { params }),

  getById: (key) =>
    axiosClient.get(`/Websitelocalization/${key}`),

  // ================= CREATE =================
  create: (data) =>
    axiosClient.post('/Websitelocalization', data),

  // ================= UPDATE =================
  // update localization only
  update: (key, data) =>
    axiosClient.put(`/Websitelocalization/${key}`, data),

  // update wards list
  updateWards: (key, data) =>
    axiosClient.put(`/Websitelocalization/${key}/wards`, data),

  // ================= TOGGLE ACTIVE =================
  toggleActive: (key) =>
    axiosClient.patch(`/Websitelocalization/${key}/toggle-active`),

  // toggle wards active
  toggleWardActive: (key, wardIds) =>
    axiosClient.patch(`/Websitelocalization/${key}/wards/toggle-active`, wardIds),

  // ================= DELETE =================
  delete: (key) =>
    axiosClient.delete(`/Websitelocalization/${key}`),

  // delete wards
  deleteWards: (key, wardIds) =>
    axiosClient.delete(`/Websitelocalization/${key}/wards`, {
      data: wardIds
    }),
};

export default websitelocalizationApi;