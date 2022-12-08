const url = new URL('https://linglingsyu.github.io/jsfinal/admin.html')
// console.log(url)
const RANK = url.pathname.includes('/admin.html') ? 'admin' : 'customer'
const ADMIN_TOKEN = 'KDN0aAbHc2VV8UDB2pUwsMQoIHI3'
const BASE_URL = `https://livejs-api.hexschool.io/api/livejs/v1/${RANK}/elsasyu`

const axiosOptions = {
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
}
if (RANK === 'admin') axiosOptions.headers.Authorization = ADMIN_TOKEN

const API = axios.create(axiosOptions)

export { API }
