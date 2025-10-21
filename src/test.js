// passport.js
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');

passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: "https://yepper-backend.onrender.com/api/auth/google/callback"
}, async (accessToken, refreshToken, profile, done) => {
  try {
    let user = await User.findOne({ googleId: profile.id });
    
    if (user) {
      return done(null, user);
    }

    // Check if user exists with same email
    user = await User.findOne({ email: profile.emails[0].value });
    
    if (user) {
      // Link Google account to existing user
      user.googleId = profile.id;
      user.avatar = profile.photos[0].value;
      user.isVerified = true;
      await user.save();
      return done(null, user);
    }

    // Create new user
    user = new User({
      googleId: profile.id,
      name: profile.displayName,
      email: profile.emails[0].value,
      avatar: profile.photos[0].value,
      isVerified: true
    });

    await user.save();
    done(null, user);
  } catch (error) {
    done(error, null);
  }
}));

passport.serializeUser((user, done) => {
  done(null, user._id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

// User.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: function() {
      return !this.googleId;
    }
  },
  googleId: {
    type: String,
    sparse: true
  },
  avatar: {
    type: String,
    default: ''
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  verificationToken: {
    type: String,
    default: null
  },
  verificationTokenExpires: {
    type: Date,
    default: null
  },
  resetPasswordToken: {
    type: String,
    default: null
  },
  resetPasswordExpires: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  if (!this.password) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  if (!this.password) return false;
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);

// authController.js
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const nodemailer = require('nodemailer');

const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET || 'your-jwt-secret', {
    expiresIn: '7d'
  });
};

const createTransporter = () => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    throw new Error('Email credentials not configured');
  }

  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });
};

const maskEmail = (email) => {
  const [localPart, domain] = email.split('@');
  if (localPart.length <= 2) {
    return `${localPart[0]}*****@${domain}`;
  }
  const visibleChars = Math.min(2, localPart.length - 1);
  const maskedPart = '*'.repeat(5);
  return `${localPart.substring(0, visibleChars)}${maskedPart}@${domain}`;
};

exports.googleSuccess = async (req, res) => {
  if (req.user) {
    const token = generateToken(req.user._id);
    res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/success?token=${token}`);
  } else {
    res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/login?error=google_auth_failed`);
  }
};

exports.googleFailure = (req, res) => {
  res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/login?error=google_auth_failed`);
};

// authMiddleware.js
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const authMiddleware = async (req, res, next) => {
  try { 
    // Get token from Authorization header
    const authHeader = req.header('Authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        success: false,
        message: 'No token provided. Please include Authorization header with Bearer token.' 
      });
    }

    const token = authHeader.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ 
        success: false,
        message: 'No token provided' 
      });
    }

    // FIXED: Better JWT secret handling
    const JWT_SECRET = process.env.JWT_SECRET;
    if (!JWT_SECRET) {
      console.error('JWT_SECRET environment variable is not set!');
      return res.status(500).json({ 
        success: false,
        message: 'Server configuration error' 
      });
    }

    // Verify the token
    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (jwtError) {
      console.error('JWT verification error:', jwtError.message);
      
      if (jwtError.name === 'JsonWebTokenError') {
        return res.status(401).json({ 
          success: false,
          message: 'Invalid token' 
        });
      }
      
      if (jwtError.name === 'TokenExpiredError') {
        return res.status(401).json({ 
          success: false,
          message: 'Token expired',
          expired: true
        });
      }
      
      return res.status(401).json({ 
        success: false,
        message: 'Token verification failed' 
      });
    }

    // Find the user with timeout
    let user;
    try {
      // FIXED: Add timeout and better error handling for database queries
      user = await Promise.race([
        User.findById(decoded.userId),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Database timeout')), 5000)
        )
      ]);
    } catch (dbError) {
      console.error('Database error in auth middleware:', dbError);
      return res.status(500).json({ 
        success: false,
        message: 'Database connection error' 
      });
    }

    if (!user) {
      return res.status(401).json({ 
        success: false,
        message: 'User not found' 
      });
    }

    // FIXED: Check if user is still active/verified if needed
    if (!user.isVerified) {
      return res.status(401).json({ 
        success: false,
        message: 'Account not verified',
        requiresVerification: true
      });
    }

    // Set user information in request
    req.user = {
      userId: decoded.userId,
      id: decoded.userId,
      _id: decoded.userId,
      email: user.email,
      name: user.name,
      isVerified: user.isVerified,
      userObject: user,
      ...decoded
    };
    
    next();
  } catch (error) {
    console.error('Auth middleware unexpected error:', error);
    
    // FIXED: Don't expose internal errors to client
    res.status(500).json({ 
      success: false,
      message: 'Authentication service temporarily unavailable' 
    });
  }
};

module.exports = authMiddleware;

// authRoutes.js
const express = require('express');
const passport = require('passport');
const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/authmiddleware');

const router = express.Router();

router.get('/me', authMiddleware, authController.getCurrentUser);

router.get('/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

router.get('/google/callback',
  passport.authenticate('google', { failureRedirect: '/auth/google/failure' }),
  authController.googleSuccess
);

router.get('/google/failure', authController.googleFailure);

module.exports = router;

// server.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const session = require('express-session');
const passport = require('passport');
require('dotenv').config();
require('./config/passport');

// User
const authRoutes = require('./routes/authRoutes');

// Ad Promoter
const createWebsiteRoutes = require('./AdPromoter/routes/createWebsiteRoutes');
const createCategoryRoutes = require('./AdPromoter/routes/createCategoryRoutes');
const adDisplayRoutes = require('./AdPromoter/routes/AdDisplayRoutes');
const businessCategoriesRoutes = require('./AdPromoter/routes/businessCategoriesRoutes');

// AdOwner.js
const webAdvertiseRoutes = require('./AdOwner/routes/WebAdvertiseRoutes');

const app = express();

// Middleware
app.use(express.json());

const allowedOrigins = [
  'http://localhost:3000',
  'https://yepper-backend.onrender.com',
  'http://localhost:3001',
  'http://yepper.cc',
  'https://yepper.cc',
  'http://localhost:3000/',
  'https://yepper-backend.onrender.com',
  'https://www.yepper.cc',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:3001',
  'null'
];

// CORS configuration - IMPORTANT: Must be before routes
app.use(cors({
  origin: function (origin, callback) {
    console.log('Request origin:', origin);
    
    // Allow requests with no origin (mobile apps, curl, file://)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      return callback(null, true);
    }
    
    const msg = `The CORS policy for this site does not allow access from the specified Origin: ${origin}`;
    return callback(new Error(msg), false);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'], // Added PATCH here
  allowedHeaders: ['Content-Type', 'Authorization'],
  exposedHeaders: ['Content-Range', 'X-Content-Range']
}));

// Handle preflight requests explicitly for all routes
app.options('*', cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      return callback(null, true);
    }
    return callback(new Error('Not allowed by CORS'), false);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  exposedHeaders: ['Content-Range', 'X-Content-Range']
}));

app.use(session({
  secret: process.env.SESSION_SECRET || 'your-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: { 
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax'
  }
}));

app.use(passport.initialize());
app.use(passport.session());

// Auth Routes
app.use('/api/auth', authRoutes);

// AdPromoter Routes
app.use('/api/createWebsite', createWebsiteRoutes);
app.use('/api/business-categories', businessCategoriesRoutes);
app.use('/api/ad-categories', createCategoryRoutes);
app.use('/api/ads', adDisplayRoutes);

// AdOwner Routes
app.use('/api/web-advertise', webAdvertiseRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error Details:', {
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method
  });
  
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/mern-auth', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connected'))
.catch(err => console.log('MongoDB connection error:', err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

// AuthContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const API_URL = process.env.REACT_APP_API_URL || 'https://yepper-backend.onrender.com';

  // Set up axios interceptors for automatic token handling
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }

    // Add response interceptor to handle token expiration
    const responseInterceptor = axios.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          console.log('Token expired or invalid, logging out...');
          handleInvalidToken();
        }
        return Promise.reject(error);
      }
    );

    return () => {
      axios.interceptors.response.eject(responseInterceptor);
    };
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      getCurrentUser();
    } else {
      setIsLoading(false);
    }
  }, []);

  const getCurrentUser = async (retryCount = 0) => {
    const token = localStorage.getItem('token');
    if (!token) {
      setIsLoading(false);
      return;
    }

    try {
      console.log('Fetching current user...');
      const response = await axios.get(`${API_URL}/api/auth/me`);
      
      if (response.data.success && response.data.user) {
        console.log('User authenticated successfully:', response.data.user.email);
        setUser(response.data.user);
        setIsAuthenticated(true);
      } else {
        console.log('Invalid response format:', response.data);
        handleInvalidToken();
      }
    } catch (error) {
      console.error('Get current user error:', error);
      
      if (error.response) {
        const status = error.response.status;
        
        if (status === 401) {
          console.log('Token is invalid or expired, removing...');
          handleInvalidToken();
        } else if (status >= 500) {
          // Server error - retry once after a delay
          if (retryCount < 1) {
            console.log('Server error, retrying in 2 seconds...');
            setTimeout(() => getCurrentUser(retryCount + 1), 2000);
            return;
          } else {
            console.log('Server still unavailable after retry');
            setIsLoading(false);
          }
        } else {
          handleInvalidToken();
        }
      } else if (error.request) {
        // Network error (server not responding)
        if (retryCount < 2) {
          console.log(`Network error, retrying in ${(retryCount + 1) * 2} seconds...`);
          setTimeout(() => getCurrentUser(retryCount + 1), (retryCount + 1) * 2000);
          return;
        } else {
          console.log('Network still unavailable after retries');
          setIsLoading(false);
        }
      } else {
        console.log('Unexpected error, keeping token');
        setIsLoading(false);
      }
    } finally {
      if (retryCount === 0) {
        setIsLoading(false);
      }
    }
  };

  const handleInvalidToken = () => {
    console.log('Handling invalid token - clearing auth state');
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
    setUser(null);
    setIsAuthenticated(false);
  };

  const setAuthToken = (token) => {
    if (token) {
      console.log('Setting auth token');
      localStorage.setItem('token', token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      handleInvalidToken();
    }
  };

  const handleAutoLogin = async (token) => {
    try {
      setAuthToken(token);
      const response = await axios.get(`${API_URL}/api/auth/me`);
      if (response.data.success && response.data.user) {
        setUser(response.data.user);
        setIsAuthenticated(true);
        return { success: true, user: response.data.user };
      } else {
        throw new Error('Invalid token received');
      }
    } catch (error) {
      console.error('Auto-login error:', error);
      handleInvalidToken();
      throw new Error('Auto-login failed');
    }
  };

  // UPDATED: Now accepts optional returnUrl parameter
  const signup = async (email, password, name, returnUrl = null) => {
    try {
      const requestData = {
        email,
        password,
        name
      };
      
      // Add returnUrl if provided
      if (returnUrl) {
        requestData.returnUrl = returnUrl;
      }

      const response = await axios.post(`${API_URL}/api/auth/register`, requestData);

      return {
        success: true,
        requiresVerification: response.data.requiresVerification,
        maskedEmail: response.data.maskedEmail,
        message: response.data.message
      };
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Registration failed');
    }
  };

  const login = async (email, password) => {
    try {
      console.log('Attempting login...');
      const response = await axios.post(`${API_URL}/api/auth/login`, {
        email,
        password
      });

      const { token, user } = response.data;
      
      if (!token || !user) {
        throw new Error('Invalid response from server');
      }

      console.log('Login successful, setting auth state');
      setAuthToken(token);
      setUser(user);
      setIsAuthenticated(true);

      return { success: true, user };
    } catch (error) {
      console.error('Login error:', error);
      const errorMessage = error.response?.data?.message || 'Login failed';
      const errorData = error.response?.data;
      
      if (errorData?.requiresVerification) {
        const verificationError = new Error(errorMessage);
        verificationError.requiresVerification = true;
        verificationError.maskedEmail = errorData.maskedEmail;
        throw verificationError;
      }
      
      throw new Error(errorMessage);
    }
  };

  const logout = () => {
    console.log('Logging out user');
    handleInvalidToken();
  };

  const retryAuthentication = () => {
    const token = localStorage.getItem('token');
    if (token && !isAuthenticated) {
      console.log('Retrying authentication...');
      setIsLoading(true);
      getCurrentUser();
    }
  };

  // Debug logging
  useEffect(() => {
    console.log('Auth state changed:', {
      isAuthenticated,
      hasUser: !!user,
      userEmail: user?.email,
      isLoading,
      hasToken: !!localStorage.getItem('token')
    });
  }, [isAuthenticated, user, isLoading]);

  const value = {
    user,
    isAuthenticated,
    isLoading,
    signup,
    login,
    logout,
    setAuthToken,
    getCurrentUser,
    handleAutoLogin,
    retryAuthentication,
    token: localStorage.getItem('token')
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// AuthSuccess.js
import React, { useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import LoadingSpinner from '../components/LoadingSpinner';

const AuthSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { login } = useAuth();

  useEffect(() => {
    const token = searchParams.get('token');
    if (token) {
      // Simulate getting user data (in real app, you'd decode the token or fetch user data)
      login({ token, user: { name: 'Google User', email: 'user@example.com' } });
      navigate('/');
    } else {
      navigate('/login');
    }
  }, [searchParams, login, navigate]);

  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="text-center">
        <LoadingSpinner size="xl"/>
        <p className="text-gray-600">Completing authentication...</p>
      </div>
    </div>
  );
};

export default AuthSuccess;

// Register.js
const Register = () => {

  const handleGoogleLogin = () => {
    window.location.href = `${process.env.REACT_APP_API_URL || 'https://yepper-backend.onrender.com'}/api/auth/google`;
  };

  return (
    // codes
  );
};

export default Register;

