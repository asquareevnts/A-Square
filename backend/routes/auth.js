import express from 'express';
import passport from 'passport';
import {
  createUser,
  getUserByEmail,
  verifyPassword,
  updateLastLogin,
  getUserStats
} from '../db/database.js';

const router = express.Router();

// Local Registration
router.post('/register', async (req, res) => {
  try {
    const { email, password, fullName, phone } = req.body;

    // Validation
    if (!email || !password || !fullName) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email, password, and full name are required' 
      });
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid email format' 
      });
    }

    // Password strength validation
    if (password.length < 8) {
      return res.status(400).json({ 
        success: false, 
        message: 'Password must be at least 8 characters long' 
      });
    }

    const user = await createUser(email, password, fullName, phone);
    
    // Log the user in automatically after registration
    req.login(user, (err) => {
      if (err) {
        return res.status(500).json({ 
          success: false, 
          message: 'Registration successful but failed to log in' 
        });
      }
      
      res.status(201).json({
        success: true,
        message: 'Registration successful',
        user: {
          id: user.id,
          email: user.email,
          fullName: user.full_name
        }
      });
    });

  } catch (error) {
    if (error.message === 'Email already exists') {
      return res.status(409).json({ 
        success: false, 
        message: 'Email already registered' 
      });
    }
    
    console.error('Registration error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Registration failed. Please try again.' 
    });
  }
});

// Local Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email and password are required' 
      });
    }

    const user = getUserByEmail(email);

    if (!user) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid email or password' 
      });
    }

    // Check if user registered with Google
    if (user.provider === 'google' && !user.password) {
      return res.status(401).json({ 
        success: false, 
        message: 'Please login with Google' 
      });
    }

    const isValidPassword = await verifyPassword(password, user.password);

    if (!isValidPassword) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid email or password' 
      });
    }

    updateLastLogin(user.id);

    req.login(user, (err) => {
      if (err) {
        return res.status(500).json({ 
          success: false, 
          message: 'Login failed' 
        });
      }

      res.json({
        success: true,
        message: 'Login successful',
        user: {
          id: user.id,
          email: user.email,
          fullName: user.full_name,
          profilePicture: user.profile_picture
        }
      });
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Login failed. Please try again.' 
    });
  }
});

// Google OAuth
router.get('/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

router.get('/google/callback',
  passport.authenticate('google', { failureRedirect: '/signin' }),
  (req, res) => {
    // Successful authentication, redirect to home or dashboard
    res.redirect('http://localhost:5173/');
  }
);

// Logout
router.post('/logout', (req, res) => {
  req.logout((err) => {
    if (err) {
      return res.status(500).json({ 
        success: false, 
        message: 'Logout failed' 
      });
    }
    res.json({ 
      success: true, 
      message: 'Logged out successfully' 
    });
  });
});

// Get current user
router.get('/me', (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ 
      success: false, 
      message: 'Not authenticated' 
    });
  }

  res.json({
    success: true,
    user: {
      id: req.user.id,
      email: req.user.email,
      fullName: req.user.full_name,
      phone: req.user.phone,
      profilePicture: req.user.profile_picture,
      provider: req.user.provider,
      emailVerified: req.user.email_verified
    }
  });
});

// Get user statistics (admin only)
router.get('/stats', (req, res) => {
  try {
    const stats = getUserStats();
    res.json({ success: true, stats });
  } catch (error) {
    console.error('Stats error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to retrieve stats' 
    });
  }
});

export default router;
