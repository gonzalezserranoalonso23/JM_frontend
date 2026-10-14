import axios from '@/libs/axios'

export const getTypeInventories = async () => {
  const { data } = await axios.get('/api/type-inventory')
  return data
}
