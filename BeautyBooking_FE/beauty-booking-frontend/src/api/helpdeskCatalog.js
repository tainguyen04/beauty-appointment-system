import axiosClient from './axiosClient';

const helpdeskCatalogApi = {
  // GET: api/HelpdeskCatalog (Lấy danh sách, hỗ trợ lọc qua params nếu cần)
  getAll: () => {
    return axiosClient.get('/HelpdeskCatalog');
  },

  // GET: api/HelpdeskCatalog/{id} (Lấy chi tiết)
  getById: (id) => {
    return axiosClient.get(`/HelpdeskCatalog/${id}`);
  },

  // POST: api/HelpdeskCatalog (Tạo mới Catalog)
  create: (data) => {
    return axiosClient.post('/HelpdeskCatalog', data);
  },

  // POST: api/HelpdeskCatalog/{id}/contents (Thêm danh sách nội dung)
  addContents: (id, contents) => {
    return axiosClient.post(`/HelpdeskCatalog/${id}/contents`, contents);
  },

  // PUT: api/HelpdeskCatalog/{id} (Cập nhật)
  update: (id, data) => {
    return axiosClient.put(`/HelpdeskCatalog/${id}`, data);
  },

  // DELETE: api/HelpdeskCatalog/{id} (Xóa)
  delete: (id) => {
    return axiosClient.delete(`/HelpdeskCatalog/${id}`);
  },
};

export default helpdeskCatalogApi;