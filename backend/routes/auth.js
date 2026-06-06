const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const ActivityLog = require('../models/ActivityLog');
const { protect } = require('../middleware/auth');
const { sendVerificationOTP } = require('../utils/email');

const router = express.Router();

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

const setCookie = (res, token) => {
  res.cookie('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });
};

const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

// POST /api/auth/register — creates user + sends OTP
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, company, role, phone } = req.body;

    // Server-side validation
    if (!name || name.trim().length < 2) {
      return res.status(400).json({ message: 'Name must be at least 2 characters' });
    }
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ message: 'Please enter a valid email address' });
    }
    if (!password || password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    const otp = generateOTP();
    const user = await User.create({
      name,
      email,
      password,
      company: company || '',
      role: role || 'procurement_officer',
      phone: phone || '',
      verificationOTP: otp,
      otpExpiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 min
    });

    // Send OTP email
    try {
      await sendVerificationOTP(email, otp, name);
    } catch (emailErr) {
      console.error('Email send failed:', emailErr.message);
      // Still allow registration if email fails (dev mode)
    }

    await ActivityLog.create({
      user: user._id,
      action: 'user_register',
      entityType: 'user',
      entityId: user._id,
      description: `${user.name} registered as ${user.role}`,
    });

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      emailVerified: false,
      message: 'Account created. Please verify your email with the OTP sent.',
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/auth/verify-otp — verifies OTP and logs user in
router.post('/verify-otp', async (req, res) => {
  try {
    const { email, otp } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    if (user.emailVerified) {
      return res.status(400).json({ message: 'Email already verified' });
    }
    if (user.verificationOTP !== otp) {
      return res.status(400).json({ message: 'Invalid OTP' });
    }
    if (user.otpExpiresAt < new Date()) {
      return res.status(400).json({ message: 'OTP has expired. Please resend.' });
    }

    user.emailVerified = true;
    user.verificationOTP = null;
    user.otpExpiresAt = null;
    await user.save();

    const token = generateToken(user._id);
    setCookie(res, token);

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      company: user.company,
      phone: user.phone,
      emailVerified: true,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/auth/resend-otp
router.post('/resend-otp', async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (user.emailVerified) return res.status(400).json({ message: 'Email already verified' });

    const otp = generateOTP();
    user.verificationOTP = otp;
    user.otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);
    await user.save();

    try {
      await sendVerificationOTP(email, otp, user.name);
    } catch (emailErr) {
      console.error('Email resend failed:', emailErr.message);
    }

    res.json({ message: 'OTP resent to your email' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    if (!user.isActive) {
      return res.status(403).json({ message: 'Account is deactivated' });
    }

    if (!user.emailVerified) {
      // Resend OTP for unverified users
      const otp = generateOTP();
      user.verificationOTP = otp;
      user.otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);
      await user.save();

      try {
        await sendVerificationOTP(email, otp, user.name);
      } catch (emailErr) {
        console.error('Email send failed:', emailErr.message);
      }

      return res.status(403).json({
        message: 'Email not verified. A new OTP has been sent.',
        emailVerified: false,
        email: user.email,
      });
    }

    const token = generateToken(user._id);
    setCookie(res, token);

    await ActivityLog.create({
      user: user._id,
      action: 'user_login',
      entityType: 'user',
      entityId: user._id,
      description: `${user.name} logged in`,
    });

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      company: user.company,
      phone: user.phone,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/auth/logout
router.post('/logout', (req, res) => {
  res.cookie('token', '', {
    httpOnly: true,
    expires: new Date(0),
  });
  res.json({ message: 'Logged out successfully' });
});

// GET /api/auth/me
router.get('/me', protect, async (req, res) => {
  res.json(req.user);
});

module.exports = router;
