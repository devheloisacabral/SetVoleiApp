import api from './api';

export const planosService = {
  listar: () => api.get('/planos'),
  criar: (body) => api.post('/planos', body),
  atualizar: (id, body) => api.patch(`/planos/${id}`, body),
  inativar: (id) => api.delete(`/planos/${id}`),
};
