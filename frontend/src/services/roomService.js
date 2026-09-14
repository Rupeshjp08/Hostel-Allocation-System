import api from './api'

export const getRooms = (params) => api.get('/rooms', { params })
export const getRoomById = (id) => api.get(`/rooms/${id}`)
export const createRoom = (payload) => api.post('/rooms', payload)
export const updateRoom = (id, payload) => api.put(`/rooms/${id}`, payload)
export const deleteRoom = (id) => api.delete(`/rooms/${id}`)
