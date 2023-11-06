import z from 'zod'
import axios from 'axios'
import Cookies from 'js-cookie'

export const userDataSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
})

export type UserData = z.infer<typeof userDataSchema>

interface UpdateUserDataArgs {
  userId: string
  userData: UserData
}

const BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000'

const client = () => {
  const defaultOptions = {
    baseURL: BASE_URL,
    headers: {
      'Content-Type': 'application/json',
    },
  }

  const instance = axios.create(defaultOptions)

  instance.interceptors.request.use((config) => {
    const token = Cookies.get('token')
    config.headers.Authorization = token ? `Bearer ${token}` : ''
    return config
  })

  return instance
}

export const getUserData = async (userId: string) => {
  const resp = await client().get(`/users/${userId}`)
  const jsonData = await resp.data
  return userDataSchema.parse(jsonData.data) // ensure the data is valid
}

export const updateUserData = async (args: UpdateUserDataArgs) => {
  const resp = await client().put(`/users/${args.userId}`, args.userData)
  const jsonData = await resp.data
  return jsonData.data as UserData
}
