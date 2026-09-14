import api from './api'

export const getHostels = (params) => api.get('/hostels', { params })
export const createHostel = (payload) => api.post('/hostels', payload)
export const updateHostel = (id, payload) => api.put(`/hostels/${id}`, payload)
export const deleteHostel = (id) => api.delete(`/hostels/${id}`)
