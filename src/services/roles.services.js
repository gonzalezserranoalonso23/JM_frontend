import axios from '@/libs/axios'

export const getRoles = async () => {
  const { data } = await axios.get('/api/roles')
  return data
}
