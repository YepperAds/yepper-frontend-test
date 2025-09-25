// // Register.js
// import React, { useState } from 'react';
// import { Link, useNavigate } from 'react-router-dom';
// import { useForm } from 'react-hook-form';
// import axios from 'axios';
// import toast from 'react-hot-toast';
// import { Button, Input } from '../components/components';

// const Register = () => {
//     const [loading, setLoading] = useState(false);
//     const navigate = useNavigate();
//     const { register, handleSubmit, watch, formState: { errors } } = useForm();

//     const password = watch('password');

//     const onSubmit = async (data) => {
//         setLoading(true);
//         try {
//             await axios.post('https://yepper-backend.onrender.com/api/auth/register', data);
//             toast.success('Registration successful! Please check your email to verify your account.');
//             navigate('/');
//         } catch (error) {
//             toast.error(error.response?.data?.message || 'Registration failed');
//         } finally {
//             setLoading(false);
//         }
//     };

//     const handleGoogleLogin = () => {
//         window.location.href = 'https://yepper-backend.onrender.com/api/auth/google';
//     };

//     return (
//         <div className="min-h-screen bg-white flex items-center justify-center px-4">
//             <div className="w-full max-w-md">
//                 <div className="mb-12">
//                     <h2 className="text-3xl font-bold text-black">Create your account</h2>
//                 </div>
                
//                 <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
//                     <Input
//                         {...register('name', { required: 'Name is required' })}
//                         type="text"
//                         placeholder="Full Name"
//                         error={errors.name?.message}
//                         className="w-full px-4 py-3 border border-black bg-white text-black placeholder-gray-500 focus:outline-none focus:ring-0"
//                     />

//                     <Input
//                         {...register('email', { 
//                             required: 'Email is required',
//                             pattern: {
//                                 value: /^\S+@\S+$/i,
//                                 message: 'Email is invalid'
//                             }
//                         })}
//                         type="email"
//                         placeholder="Email address"
//                         error={errors.email?.message}
//                         className="w-full px-4 py-3 border border-black bg-white text-black placeholder-gray-500 focus:outline-none focus:ring-0"
//                     />

//                     <Input
//                         {...register('password', { 
//                             required: 'Password is required',
//                             minLength: {
//                                 value: 6,
//                                 message: 'Password must be at least 6 characters'
//                             }
//                         })}
//                         type="password"
//                         placeholder="Password"
//                         error={errors.password?.message}
//                         className="w-full px-4 py-3 border border-black bg-white text-black placeholder-gray-500 focus:outline-none focus:ring-0"
//                     />

//                     <Input
//                         {...register('confirmPassword', { 
//                             required: 'Please confirm your password',
//                             validate: value => value === password || 'Passwords do not match'
//                         })}
//                         type="password"
//                         placeholder="Confirm Password"
//                         error={errors.confirmPassword?.message}
//                         className="w-full px-4 py-3 border border-black bg-white text-black placeholder-gray-500 focus:outline-none focus:ring-0"
//                     />

//                     <Button
//                         type="submit"
//                         variant="secondary"
//                         size="lg"
//                         className="w-full"
//                         disabled={loading}
//                         loading={loading}
//                     >
//                         {loading ? 'Creating account...' : 'Create account'}
//                     </Button>
//                 </form>

//                 <div className="mt-8">
//                     <div className="relative">
//                         <div className="absolute inset-0 flex items-center">
//                             <div className="w-full border-t border-black" />
//                         </div>
//                         <div className="relative flex justify-center text-sm">
//                             <span className="px-2 bg-white text-gray-600">Or continue with</span>
//                         </div>
//                     </div>

//                     <div className="mt-6">
//                         <Button
//                             type="button"
//                             onClick={handleGoogleLogin}
//                             variant="primary"
//                             size="lg"
//                             className="w-full"
//                         >
//                             <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
//                                 <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
//                                 <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
//                                 <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
//                                 <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
//                             </svg>
//                             Continue with Google
//                         </Button>
//                     </div>
//                 </div>

//                 <div className="mt-8 text-center">
//                     <p className="text-sm text-gray-600">
//                         Already have an account?{' '}
//                         <Link to="/login" className="text-black hover:underline">
//                             Sign in
//                         </Link>
//                     </p>
//                 </div>
//             </div>
//         </div>
//     );
// };

// export default Register;

// Register.js
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { Button, Input } from '../components/components';

const Register = () => {
  const navigate = useNavigate();
  const { signup } = useAuth();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({
    fullName: '',
    email: '',
    password: ''
  });
  const [touched, setTouched] = useState({
    fullName: false,
    email: false,
    password: false
  });

  // Validation functions
  const validateFullName = (name) => {
    if (!name.trim()) return 'Full name is required';
    if (name.trim().length < 2) return 'Full name must be at least 2 characters';
    if (name.trim().length > 50) return 'Full name must be less than 50 characters';
    if (!/^[a-zA-Z\s'-]+$/.test(name.trim())) return 'Full name can only contain letters, spaces, hyphens, and apostrophes';
    return '';
  };

  const validateEmail = (email) => {
    if (!email.trim()) return 'Email is required';
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) return 'Please enter a valid email address';
    return '';
  };

  const validatePassword = (password) => {
    if (!password) return 'Password is required';
    if (password.length < 8) return 'Password must be at least 8 characters';
    if (password.length > 128) return 'Password must be less than 128 characters';
    if (!/(?=.*[a-z])/.test(password)) return 'Password must contain at least one lowercase letter';
    if (!/(?=.*[A-Z])/.test(password)) return 'Password must contain at least one uppercase letter';
    if (!/(?=.*\d)/.test(password)) return 'Password must contain at least one number';
    if (!/(?=.*[@$!%*?&])/.test(password)) return 'Password must contain at least one special character (@$!%*?&)';
    return '';
  };

  const getPasswordStrength = (password) => {
    if (!password) return 'basic';
    
    let score = 0;
    
    // Length check
    if (password.length >= 8) score++;
    if (password.length >= 12) score++;
    
    // Character type checks
    if (/(?=.*[a-z])/.test(password)) score++;
    if (/(?=.*[A-Z])/.test(password)) score++;
    if (/(?=.*\d)/.test(password)) score++;
    if (/(?=.*[@$!%*?&])/.test(password)) score++;
    
    if (score <= 2) return 'basic';
    if (score <= 4) return 'good';
    return 'strong';
  };

  const getPasswordStrengthColor = (strength, password) => {
    if (!password) return 'text-gray-500';
    switch (strength) {
      case 'basic': return 'text-red-500';
      case 'good': return 'text-yellow-500';
      case 'strong': return 'text-green-500';
      default: return 'text-gray-500';
    }
  };

  const validateField = (field, value) => {
    switch (field) {
      case 'fullName':
        return validateFullName(value);
      case 'email':
        return validateEmail(value);
      case 'password':
        return validatePassword(value);
      default:
        return '';
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleInputBlur = (field) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    const error = validateField(field, formData[field]);
    setErrors(prev => ({ ...prev, [field]: error }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    // Mark all fields as touched
    setTouched({
      fullName: true,
      email: true,
      password: true
    });

    // Validate all fields
    const newErrors = {
      fullName: validateFullName(formData.fullName),
      email: validateEmail(formData.email),
      password: validatePassword(formData.password)
    };

    setErrors(newErrors);

    // Check if there are any errors
    const hasErrors = Object.values(newErrors).some(error => error !== '');
    
    if (hasErrors) {
      toast.error('Please fix the errors below');
      setIsLoading(false);
      return;
    }

    try {
      // Pass the name parameter correctly (fullName from form becomes name for backend)
      const success = await signup(formData.email, formData.password, formData.fullName);
      
      if (success) {
        toast.success('Account created successfully! Please login to continue.');
        navigate('/login');
      }
    } catch (error) {
      console.error('Signup error:', error);
      // Show the specific error message from the backend
      toast.error(error.message || 'Failed to create account. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/auth/google`;
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-black">Create your account</h2>
        </div>

        {/* Google Button */}
        <Button
          type="button"
          onClick={handleGoogleLogin}
          variant="primary"
          size="lg"
          className="w-full mb-6"
          disabled={isLoading}
        >
          <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Continue with Google
        </Button>

        {/* Separator */}
        <div className="mb-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-black" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-600">or</span>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="fullName" className="text-black">Full Name</label>
            <Input
              id="fullName"
              type="text"
              placeholder="Enter your full name"
              value={formData.fullName}
              onChange={(e) => handleInputChange('fullName', e.target.value)}
              onBlur={() => handleInputBlur('fullName')}
              className={`w-full px-4 py-3 border border-black bg-white text-black placeholder-gray-500 focus:outline-none focus:ring-0 ${
                touched.fullName && errors.fullName ? 'border-red-500' : ''
              }`}
            />
            {touched.fullName && errors.fullName && (
              <p className="text-sm text-red-500">{errors.fullName}</p>
            )}
          </div>

          <div className="space-y-2">
            <label htmlFor="email" className="text-black">Email</label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              onBlur={() => handleInputBlur('email')}
              className={`w-full px-4 py-3 border border-black bg-white text-black placeholder-gray-500 focus:outline-none focus:ring-0 ${
                touched.email && errors.email ? 'border-red-500' : ''
              }`}
            />
            {touched.email && errors.email && (
              <p className="text-sm text-red-500">{errors.email}</p>
            )}
          </div>

          <div className="space-y-2">
            <label htmlFor="password" className="text-black">Password</label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                onBlur={() => handleInputBlur('password')}
                minLength={8}
                className={`w-full px-4 py-3 border border-black bg-white text-black placeholder-gray-500 focus:outline-none focus:ring-0 pr-10 ${
                  touched.password && errors.password ? 'border-red-500' : ''
                }`}
              />
              <button
                type="button"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <svg className={`h-4 w-4 ${getPasswordStrengthColor(getPasswordStrength(formData.password), formData.password)}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L9.878 9.878zm4.242 4.242L9.878 9.878m4.242 4.242L14.12 14.12M21 12c0 .485-.018.963-.053 1.436M19.547 10.015A10.05 10.05 0 0112 5c-4.478 0-8.268 2.943-9.543 7a9.97 9.97 0 011.563 3.029" />
                  </svg>
                ) : (
                  <svg className={`h-4 w-4 ${getPasswordStrengthColor(getPasswordStrength(formData.password), formData.password)}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
            {touched.password && errors.password && (
              <p className="text-sm text-red-500">{errors.password}</p>
            )}
            {formData.password && (
              <div className="text-xs">
                Password strength: <span className={getPasswordStrengthColor(getPasswordStrength(formData.password), formData.password)}>
                  {getPasswordStrength(formData.password)}
                </span>
              </div>
            )}
          </div>

          <Button
            type="submit"
            variant="secondary"
            size="lg"
            className="w-full"
            disabled={isLoading}
            loading={isLoading}
          >
            {isLoading ? 'Creating Account...' : 'Create Account'}
          </Button>
        </form>

        {/* Login Link */}
        <div className="text-center mt-6">
          <p className="text-gray-600">
            Already have an account?{' '}
            <Link to="/login" className="text-black hover:underline">
              Sign in
            </Link>
          </p>
        </div>

        {/* Legal Text */}
        <p className="text-xs text-gray-500 mt-8 text-center">
          By signing up, you agree to Yepper's Terms of Service and Privacy Policy. 
          You may receive emails from us and can opt out at any time.
        </p>
      </div>
    </div>
  );
};

export default Register;