import { useForm } from 'react-hook-form'
import { useAuthState, useUpdateUser, useUser } from '../utils/hooks'
import { zodResolver } from '@hookform/resolvers/zod'
import { userDataSchema } from '../utils/api'

import type { UserData } from '../utils/api'

export const UserForm = () => {
  const { user } = useAuthState()
  const { refetch } = useUser(user?.uid)
  const mutation = useUpdateUser()

  const {
    handleSubmit,
    register,
    formState: { errors },
  } = useForm<UserData>({
    resolver: zodResolver(userDataSchema),
    defaultValues: {
      name: '',
      email: '',
    },
  })

  const onSubmit = (data: UserData) => {
    if (user?.uid) {
      const userId = user.uid
      mutation.mutate(
        {
          userId,
          userData: { ...data },
        },
        {
          onSuccess: () => {
            refetch()
          },
        },
      )
    }
  }

  return (
    <form
      className="border-2 border-gray-200 rounded-md p-4 my-8"
      onSubmit={handleSubmit(onSubmit)}
    >
      <div>
        <label htmlFor="name" className="label">
          Name
        </label>
        <input
          id="name"
          type="text"
          className="input input-bordered"
          required={true}
          placeholder="Enter your name"
          {...register('name')}
        />
        {errors.name && (
          <p className="text-red-500 text-xs italic">{errors.name.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="email" className="label">
          Email
        </label>
        <input
          id="email"
          className="input input-bordered"
          type="email"
          autoComplete="email"
          placeholder="Enter your email"
          required={true}
          {...register('email')}
        />
        {errors.email && (
          <p className="text-red-500 text-xs italic">{errors.email.message}</p>
        )}
      </div>

      <button
        className={`btn ${mutation.isPending ? 'btn-disabled' : 'btn-primary'}`}
        type="submit"
      >
        Save
      </button>
    </form>
  )
}

export const UserProfile = () => {
  const { user } = useAuthState()
  const { data, isLoading } = useUser(user?.uid)

  if (isLoading) {
    return <p>Loading...</p>
  }

  if (!data) {
    return <p> Woops! You haven't set up your profile yet.</p>
  }

  return (
    <div className="border-2 border-gray-200 rounded-md p-4">
      <h1 className="text-xl font-semibold mb-4">User Profile</h1>
      <p className="mb-2">Name: {data?.name}</p>
      <p className="mb-2">Email: {data?.email}</p>
    </div>
  )
}
