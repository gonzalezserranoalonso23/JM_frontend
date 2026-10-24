import axios from '@/libs/axios'

export const getVaultUpdatedAt = async () => {
  const { data } = await axios.get('/api/denominations')
  return data
}

export const openVault = async (secret) => {
  const { data } = await axios.post('/api/denominations/open', { secret })
  return data
}

export const saveVault = async ({ secret, quantities }) => {
  const { data } = await axios.put('/api/denominations', { secret, quantities })
  return data
}
