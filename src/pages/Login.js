// Login.js
import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ArrowLeft } from 'lucide-react';
import { Button, Input, Container} from '../components/components';

const Login = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { login } = useAuth();
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [emailError, setEmailError] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const [emailTouched, setEmailTouched] = useState(false);
    const [passwordTouched, setPasswordTouched] = useState(false);
    const [loginError, setLoginError] = useState(''); // New state for login failure

    const validateEmail = (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!email) {
            return 'Email is required';
        }
        if (!emailRegex.test(email)) {
            return 'Please enter a valid email address';
        }
        return '';
    };

    const validatePassword = (password) => {
        if (!password) {
            return 'Password is required';
        }
        return '';
    };

    const handleInputChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        
        // Clear errors when user starts typing
        if (field === 'email' && emailError) {
            setEmailError('');
        }
        if (field === 'password' && passwordError) {
            setPasswordError('');
        }
        // Clear login error when user starts typing
        if (loginError) {
            setLoginError('');
        }
    };

    const handleInputBlur = (field, value) => {
        if (field === 'email') {
            setEmailTouched(true);
            const error = validateEmail(value);
            setEmailError(error);
        }
        if (field === 'password') {
            setPasswordTouched(true);
            const error = validatePassword(value);
            setPasswordError(error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setLoginError(''); // Clear previous login errors
        
        // Mark all fields as touched
        setEmailTouched(true);
        setPasswordTouched(true);
        
        // Validate both fields before submission
        const emailValidationError = validateEmail(formData.email);
        const passwordValidationError = validatePassword(formData.password);
        
        setEmailError(emailValidationError);
        setPasswordError(passwordValidationError);
        
        if (emailValidationError || passwordValidationError) {
            setIsLoading(false);
            return;
        }

        try {
            const success = await login(formData.email, formData.password);
            
            if (success) {
                navigate('/');
            } else {
                // Show failure message when credentials don't match
                setLoginError('Invalid email or password. Please try again.');
            }
        } catch (error) {
            // Show failure message for any login errors
            setLoginError('Invalid email or password. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleGoogleLogin = () => {
        window.location.href = `${process.env.REACT_APP_BACKEND_URL || 'https://localhost:5000'}/api/auth/google`;
    };

    return (
        <>
            <header className="border-b border-gray-200 bg-white">
                <Container>
                    <div className="h-16 flex items-center justify-between">
                        <Link to='/'>
                            <button 
                                className="flex items-center text-gray-600 hover:text-black transition-colors"
                            >
                                <ArrowLeft size={18} className="mr-2" />
                                <span className="font-medium">Back</span>
                            </button>
                        </Link>
                    </div>
                </Container>
            </header>
            <div className="min-h-screen bg-white flex items-center justify-center px-4">
                <div className="w-full max-w-md">
                    <div className="mb-12 flex justify-center items-center">
                        <h2 className="text-3xl font-bold text-black">Sign in to your account</h2>
                    </div>

                    {/* Display login error message */}
                    {loginError && (
                        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                            <p className="text-red-600 text-sm text-center">{loginError}</p>
                        </div>
                    )}

                    {/* <Button
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

                    <div className="mb-6">
                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-black" />
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-2 bg-white text-gray-600">or</span>
                            </div>
                        </div>
                    </div> */}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <label htmlFor="email" className="text-black">Email</label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="you@example.com"
                                value={formData.email}
                                onChange={(e) => handleInputChange('email', e.target.value)}
                                onBlur={(e) => handleInputBlur('email', e.target.value)}
                                className={`w-full px-4 py-3 border border-black bg-white text-black placeholder-gray-500 focus:outline-none focus:ring-0 ${
                                    emailError ? 'border-red-500 focus:border-red-500' : ''
                                }`}
                            />
                            {emailError && (
                                <p className="text-sm text-red-500">{emailError}</p>
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
                                    onBlur={(e) => handleInputBlur('password', e.target.value)}
                                    className={`w-full px-4 py-3 border border-black bg-white text-black placeholder-gray-500 focus:outline-none focus:ring-0 pr-10 ${
                                        passwordError ? 'border-red-500 focus:border-red-500' : ''
                                    }`}
                                />
                                <button
                                    type="button"
                                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? (
                                        <svg className="h-4 w-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L9.878 9.878zm4.242 4.242L9.878 9.878m4.242 4.242L14.12 14.12M21 12c0 .485-.018.963-.053 1.436M19.547 10.015A10.05 10.05 0 0112 5c-4.478 0-8.268 2.943-9.543 7a9.97 9.97 0 011.563 3.029" />
                                        </svg>
                                    ) : (
                                        <svg className="h-4 w-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                        </svg>
                                    )}
                                </button>
                            </div>
                            {passwordError && (
                                <p className="text-sm text-red-500">{passwordError}</p>
                            )}
                        </div>

                        <div className="text-right">
                            <Link to="/forgot-password" className="text-sm text-black hover:underline">
                                Forgot password?
                            </Link>
                        </div>

                        <Button
                            type="submit"
                            variant="secondary"
                            size="lg"
                            className="w-full"
                            disabled={isLoading}
                            loading={isLoading}
                        >
                            {isLoading ? 'Signing In...' : 'Sign In'}
                        </Button>
                    </form>

                    {/* Signup Link */}
                    <div className="text-center mt-6">
                        <p className="text-gray-600">
                            Don't have an account?{' '}
                            <Link to="/register" className="text-black hover:underline">
                                Sign up
                            </Link>
                        </p>
                    </div>

                    {/* Legal Text */}
                    <p className="text-xs text-gray-500 mt-8 text-center">
                        By signing in, you agree to Yepper's Terms of Service and Privacy Policy.
                    </p>
                </div>
            </div>
        </>
    );
};

export default Login;