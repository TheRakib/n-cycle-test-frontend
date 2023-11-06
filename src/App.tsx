import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

import { Login } from './components/Login'
import { UserForm, UserProfile } from './components/User'
import { auth } from './utils/firebase'
import { useAuthState } from './utils/hooks'

const queryClient = new QueryClient()

const App = () => {
  const { user } = useAuthState()

  return (
    <main>
      {!user ? <Login /> : null}

      {user && (
        <div>
          <button className="btn btn-primary" onClick={() => auth().signOut()}>
            Sign Out
          </button>
          <UserForm />
          <UserProfile />
        </div>
      )}
    </main>
  )
}

const AppParent = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  )
}

export default AppParent
