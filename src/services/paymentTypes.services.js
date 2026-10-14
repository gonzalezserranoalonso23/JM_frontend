import axios from '@/libs/axios'

export const getPaymentTypes = async () => {
  const { data } = await axios.get('/api/payment-types')
  return data
}
