const express = require('express')
const jwt = require('jsonwebtoken')
const User = require('../models/User')

const router = express.Router()

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const name = req.body.name?.trim()
    const email = req.body.email?.trim().toLowerCase()
    const { password } = req.body

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email, and password are required' })
    }

    if (name.length < 2 || name.length > 50) {
      return res.status(400).json({ message: 'Name must be between 2 and 50 characters' })
    }

    if (!EMAIL_RE.test(email)) {
      return res.status(400).json({ message: 'Please enter a valid email address' })
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' })
    }

    if (password.length > 128) {
      return res.status(400).json({ message: 'Password must not exceed 128 characters' })
    }

    const existingUser = await User.findOne({ email })
    if (existingUser) {
      return res.status(409).json({ message: 'Email already registered' })
    }

    const user = await User.create({ name, email, password })

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' })

    res.status(201).json({ token, user })
  } catch (err) {
    console.error('Register error:', err)
    res.status(500).json({ message: 'Server error' })
  }
})

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const email = req.body.email?.trim().toLowerCase()
    const { password } = req.body

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' })
    }

    if (!EMAIL_RE.test(email)) {
      return res.status(400).json({ message: 'Please enter a valid email address' })
    }

    const user = await User.findOne({ email })
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' })
    }

    const isMatch = await user.comparePassword(password)
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' })
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' })

    res.json({ token, user })
  } catch (err) {
    console.error('Login error:', err)
    res.status(500).json({ message: 'Server error' })
  }
})

// GET /api/auth/me — get current user from token
router.get('/me', async (req, res) => {
  try {
    const authHeader = req.headers.authorization
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'No token provided' })
    }

    const token = authHeader.split(' ')[1]
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    const user = await User.findById(decoded.id)

    if (!user) {
      return res.status(401).json({ message: 'User not found' })
    }

    res.json({ user })
  } catch {
    res.status(401).json({ message: 'Invalid token' })
  }
})

module.exports = router
