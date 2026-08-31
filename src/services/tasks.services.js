import axios from '@/libs/axios'

export const getTasks = async () => {
  const { data } = await axios.get('/api/tasks')
  return data
}

export const getTask = async (id) => {
  const { data } = await axios.get(`/api/tasks/${id}`)
  return data
}

export const getPendingTasks = async () => {
  const { data } = await axios.get('/api/tasks/pending')
  return data
}

export const getCompletedTasks = async () => {
  const { data } = await axios.get('/api/tasks/completed')
  return data
}

export const createTask = async (taskData) => {
  const { data } = await axios.post('/api/tasks', taskData)
  return data
}

export const updateTask = async (id, taskData) => {
  const { data } = await axios.put(`/api/tasks/${id}`, taskData)
  return data
}

export const deleteTask = async (id) => {
  const { data } = await axios.delete(`/api/tasks/${id}`)
  return data
}
