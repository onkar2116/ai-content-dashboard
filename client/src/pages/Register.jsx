import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

function Register() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { user, register } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (user) navigate('/', { replace: true })
  }, [user, navigate])

  const validate = () => {
    const trimmedName = name.trim()
    if (trimmedName.length < 2 || trimmedName.length > 50) {
      return 'Name must be between 2 and 50 characters'
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      return 'Please enter a valid email address'
    }
    if (password.length < 6) {
      return 'Password must be at least 6 characters'
    }
    return null
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    const validationError = validate()
    if (validationError) {
      setError(validationError)
      return
    }

    setLoading(true)

    try {
      await register(name.trim(), email.trim(), password)
      navigate('/')
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-md mx-auto mt-10 sm:mt-20">
      <h2 className="text-2xl font-bold mb-6 text-center text-gray-900 dark:text-white">Create Account</h2>
      <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-800 space-y-4">
        {error && (
          <div className="p-3 bg-red-50 dark:bg-red-900/50 border border-red-200 dark:border-red-700 rounded-lg text-red-600 dark:text-red-300 text-sm">
            {error}
          </div>
        )}
        <div>
          <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-2.5 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            required
          />
        </div>
        <div>
          <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-2.5 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            required
          />
        </div>
        <div>
          <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            minLength={6}
            className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-2.5 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            required
          />
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">At least 6 characters</p>
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white disabled:opacity-50 disabled:cursor-not-allowed rounded-lg font-medium transition-colors"
        >
          {loading ? 'Creating account...' : 'Create Account'}
        </button>
        <p className="text-center text-sm text-gray-500 dark:text-gray-400">
          Already have an account?{' '}
          <Link to="/login" className="text-indigo-600 dark:text-indigo-400 hover:underline">Login</Link>
        </p>
      </form>
    </div>
  )
}

export default Register
