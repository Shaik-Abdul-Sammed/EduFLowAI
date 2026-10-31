import axios from 'axios'
import { getApiBaseURL } from '../config/apiConfig'
import { showWakeUpBanner, hideWakeUpBanner } from '../utils/wakeUpHandler'

export const apiClient = axios.create({
  baseURL: getApiBaseURL(),
  headers: {
    'Content-Type': 'application/json'
  }
})

apiClient.interceptors.request.use((config) => {
  const token = typeof localStorage !== 'undefined' ? (localStorage.getItem('accessToken') || localStorage.getItem('token')) : null
  if (token && !config.headers.Authorization) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

apiClient.interceptors.response.use(
  (response) => {
    hideWakeUpBanner()
    // Check if HTML error was returned on an API call (indicative of Render 502/504 spinup proxy page)
    if (typeof response.data === 'string' && response.data.includes('<!DOCTYPE html>')) {
      if (!response.config._retry) {
        response.config._retry = true
        showWakeUpBanner('Server is waking up... Please wait a moment.')
        return new Promise((resolve) => {
          setTimeout(() => {
            resolve(apiClient(response.config))
          }, 3000)
        })
      }
    }
    return response
  },
  async (error) => {
    const config = error.config
    const status = error.response ? error.response.status : null
    const isColdStart = status === 502 || status === 503 || status === 504 || error.code === 'ERR_NETWORK' || !error.response

    if (config && isColdStart && !config._retry) {
      config._retry = true
      showWakeUpBanner('Server is waking up... Please wait a moment.')
      await new Promise((resolve) => setTimeout(resolve, 3000))
      hideWakeUpBanner()
      return apiClient(config)
    }

    hideWakeUpBanner()
    return Promise.reject(error)
  }
)

export default apiClient
