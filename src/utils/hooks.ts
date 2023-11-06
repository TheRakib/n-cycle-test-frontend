import { useEffect, useRef, useState } from 'react'
import { auth } from './firebase'
import { onAuthStateChanged } from 'firebase/auth'
import type { User } from 'firebase/auth'
import { useQuery, useMutation } from '@tanstack/react-query'
import { updateUserData, getUserData } from './api'
import Cookies from 'js-cookie'

export const useAuthState = () => {
  const authRef = useRef(auth())
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(authRef.current, (authUser) => {
      if (authUser) {
        void authUser
          .getIdToken(true)
          .then((token) => {
            Cookies.set('token', token)
            setUser(authUser)
          })
          .catch(() => {
            Cookies.remove('token')
          })
      } else {
        setUser(null)
      }
    })
    return () => {
      unsubscribe()
    }
  }, [])

  return { user }
}

export const useUser = (userId?: string) => {
  return useQuery({
    queryKey: ['user', userId],
    queryFn: async () => {
      if (userId) {
        return await getUserData(userId)
      }
      return null
    },
    enabled: !!userId,
  })
}

export const useUpdateUser = () => {
  return useMutation({
    mutationFn: updateUserData,
  })
}
