import api from './api'

export const createApplication = (payload) => api.post('/applications', payload)
export const getMyApplications = () => api.get('/applications/my')
export const getApplications = (params) => api.get('/applications', { params })
export const getApplicationById = (id) => api.get(`/applications/${id}`)
export const approveApplication = (id, payload) => api.put(`/applications/${id}/approve`, payload)
export const rejectApplication = (id, payload) => api.put(`/applications/${id}/reject`, payload)
export const cancelApplication = (id) => api.put(`/applications/${id}/cancel`)
