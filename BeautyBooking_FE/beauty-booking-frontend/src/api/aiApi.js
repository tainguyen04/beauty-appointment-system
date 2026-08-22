import axiosClient from './axiosClient';

const aiApi = {
  chat: ({ conversationId = null, prompt, guestMessages = [] }) =>
    axiosClient.post('/AI/chat', {
      conversationId,
      prompt,
      guestMessages,
    }),

  getConversations: () => axiosClient.get('/AI/conversations'),

  getMessages: (conversationId) =>
    axiosClient.get(`/AI/conversations/${conversationId}/messages`),

  createKnowledge: ({ title, content }) =>
    axiosClient.post('/AI/knowledge', { title, content }),

  uploadKnowledgeFile: ({ file, title }) => {
    const formData = new FormData();
    formData.append('file', file);
    if (title?.trim()) formData.append('title', title.trim());
    return axiosClient.post('/AI/knowledge/file', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  reindexKnowledge: () => axiosClient.post('/AI/knowledge/reindex'),
};

export default aiApi;
