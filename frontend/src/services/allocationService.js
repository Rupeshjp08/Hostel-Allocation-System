import api from './api'

export const createAllocation = (payload) => api.post('/allocations', payload)
export const getMyAllocation = () => api.get('/allocations/my')
export const getAllocations = (params) => api.get('/allocations', { params })
export const cancelAllocation = (id) => api.put(`/allocations/${id}/cancel`)
