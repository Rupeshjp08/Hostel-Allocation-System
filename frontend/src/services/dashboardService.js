import api from './api'

export const getStudentDashboard = () => api.get('/dashboard/student')
export const getWardenDashboard = () => api.get('/dashboard/warden')
