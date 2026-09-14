import api from './api'

export const registerStudent = (payload) => {
  return api.post('/auth/register', payload)
}

export const loginUser = (payload) => {
  return api.post('/auth/login', payload)
}

export const getCurrentUser = () => {
  return api.get('/auth/me')
}
