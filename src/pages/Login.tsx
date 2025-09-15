import { useState } from 'react'
import { useAuthStore } from '../stores/authStore'
import LoadingSpinner from '../components/common/LoadingSpinner'
import { joinTeam } from '../lib/auth'

export default function Login() {
  const [isSignUp, setIsSignUp] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [error, setError] = useState('')
  
  const { signIn, signUp, loading } = useAuthStore()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    try {
      if (isSignUp) {
        await signUp(email, password, fullName)
      } else {
        await signIn(email, password)
      }
      // Handle invite link (?invite=TEAM_ID)
      const params = new URLSearchParams(window.location.search)
      const inviteTeam = params.get('invite')
      if (inviteTeam) {
        try {
          await joinTeam(inviteTeam)
        } catch (e: any) {
          console.error('Join team failed', e)
        }
      }
    } catch (err: any) {
      setError(err.message || 'Der opstod en fejl')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h1 className="text-center text-3xl font-bold text-blue-600 mb-2">
            FlowCaser
          </h1>
          <h2 className="text-center text-2xl font-bold text-gray-900">
            {isSignUp ? 'Opret konto' : 'Log ind'}
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            {isSignUp ? 'Kom i gang med FlowCaser' : 'Velkommen tilbage'}
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            {isSignUp && (
              <div>
                <label htmlFor="fullName" className="form-label">
                  Fulde navn
                </label>
                <input
                  id="fullName"
                  name="fullName"
                  type="text"
                  required={isSignUp}
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="form-input"
                  placeholder="Dit fulde navn"
                />
              </div>
            )}

            <div>
              <label htmlFor="email" className="form-label">
                Email adresse
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="form-input"
                placeholder="din@email.dk"
              />
            </div>

            <div>
              <label htmlFor="password" className="form-label">
                Adgangskode
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete={isSignUp ? 'new-password' : 'current-password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="form-input"
                placeholder="Din adgangskode"
              />
            </div>
          </div>

          {error && (
            <div className="alert-error">
              <p>{error}</p>
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <LoadingSpinner size="sm" className="mr-2" />
                  {isSignUp ? 'Opretter konto...' : 'Logger ind...'}
                </div>
              ) : (
                isSignUp ? 'Opret konto' : 'Log ind'
              )}
            </button>
          </div>

          <div className="text-center">
            <button
              type="button"
              onClick={() => {
                setIsSignUp(!isSignUp)
                setError('')
                setEmail('')
                setPassword('')
                setFullName('')
              }}
              className="text-blue-600 hover:text-blue-500 text-sm font-medium"
            >
              {isSignUp 
                ? 'Har du allerede en konto? Log ind' 
                : 'Har du ikke en konto? Opret en'
              }
            </button>
          </div>
        </form>

        {/* Demo credentials */}
        <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="text-sm font-medium text-blue-800 mb-2">Demo Login:</h3>
          <p className="text-sm text-blue-700">
            Email: demo@flowcaser.dk<br />
            Password: demo123
          </p>
          <button
            onClick={() => {
              setEmail('demo@flowcaser.dk')
              setPassword('demo123')
              setIsSignUp(false)
            }}
            className="mt-2 text-xs text-blue-600 hover:text-blue-500 underline"
          >
            Udfyld demo login
          </button>
        </div>
      </div>
    </div>
  )
}
