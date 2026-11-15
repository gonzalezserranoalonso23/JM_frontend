import axios from 'axios'

// Requests that run before a session exists. No Authorization header and no
// expired-token redirect. Used by app status, the Railway code, and login.
const publicApi = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 6000
})

export default publicApi
