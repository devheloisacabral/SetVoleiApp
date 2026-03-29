import api from './api';

export const unidadesService = {
  listar: () => api.get('/unidades'),
  criar: (body) => api.post('/unidades', body),
  atualizar: (id, body) => api.patch(`/unidades/${id}`, body),
  deletar: (id) => api.delete(`/unidades/${id}`),
};
