// Login.js
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ArrowLeft } from 'lucide-react';
import { Button, Input, Container } from '../components/components';
import { authAPI } from '../utils/api';

const GoogleIcon = () => (
  <svg className="w-5 h-5 mr-3 flex-shrink-0" viewBox="0 0 24 24">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
  </svg>
);

const Login = () => {
    const navigate = useNavigate();
    const { login } = useAuth();
    const [showPasswordForm, setShowPasswordForm] = useState(false);
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isGoogleLoading, setIsGoogleLoading] = useState(false);
    const [emailError, setEmailError] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const [loginError, setLoginError] = useState('');

    const validateEmail = (email) => {
        if (!email) return 'Email is required';
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return 'Please enter a valid email address';
        return '';
    };

    const validatePassword = (password) => {
        if (!password) return 'Password is required';
        return '';
    };

    const handleInputChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        if (field === 'email' && emailError) setEmailError('');
        if (field === 'password' && passwordError) setPasswordError('');
        if (loginError) setLoginError('');
    };

    const handleInputBlur = (field, value) => {
        if (field === 'email') setEmailError(validateEmail(value));
        if (field === 'password') setPasswordError(validatePassword(value));
    };

    const handleGoogleLogin = () => {
        setIsGoogleLoading(true);
        window.location.href = authAPI.googleRedirect();
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setLoginError('');

        const emailErr = validateEmail(formData.email);
        const passErr = validatePassword(formData.password);
        setEmailError(emailErr);
        setPasswordError(passErr);

        if (emailErr || passErr) { setIsLoading(false); return; }

        try {
            const success = await login(formData.email, formData.password);
            if (success) {
                navigate('/');
            } else {
                setLoginError('Invalid email or password. Please try again.');
            }
        } catch {
            setLoginError('Invalid email or password. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            <header className="border-b border-gray-200 bg-white">
                <Container>
                    <div className="h-16 flex items-center justify-between">
                        <Link to='/'>
                            <button className="flex items-center text-gray-600 hover:text-black transition-colors">
                                <ArrowLeft size={18} className="mr-2" />
                                <span className="font-medium">Back</span>
                            </button>
                        </Link>
                    </div>
                </Container>
            </header>

            <div className="min-h-screen bg-white flex items-center justify-center px-4">
                <div className="w-full max-w-md">
                    <div className="mb-10 text-center">
                        <h2 className="text-3xl font-bold text-black">Sign in to Yepper</h2>
                        <p className="text-gray-500 mt-2 text-sm">
                            Sign in with Google to access your account and Search Console data automatically.
                        </p>
                    </div>

                    {loginError && (
                        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                            <p className="text-red-600 text-sm text-center">{loginError}</p>
                        </div>
                    )}

                    {/* Google — primary CTA */}
                    <button
                        type="button"
                        onClick={handleGoogleLogin}
                        disabled={isGoogleLoading}
                        className="w-full flex items-center justify-center px-4 py-3.5 border-2 border-gray-200 rounded-xl bg-white hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 font-semibold text-gray-700 text-base shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                        {isGoogleLoading ? (
                            <svg className="animate-spin w-5 h-5 mr-3 text-gray-500" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                            </svg>
                        ) : (
                            <GoogleIcon />
                        )}
                        {isGoogleLoading ? 'Redirecting...' : 'Continue with Google'}
                    </button>

                    <p className="text-center text-xs text-gray-400 mt-3 px-4">
                        This also connects your Google Search Console — no extra step needed.
                    </p>

                    {/* Divider + password toggle */}
                    <div className="mt-6 mb-2">
                        <div className="relative flex items-center">
                            <div className="flex-1 border-t border-gray-200" />
                            <span className="px-3 text-xs text-gray-400 bg-white">or</span>
                            <div className="flex-1 border-t border-gray-200" />
                        </div>
                    </div>

                    {!showPasswordForm ? (
                        <div className="text-center">
                            <button
                                type="button"
                                onClick={() => setShowPasswordForm(true)}
                                className="text-sm text-gray-500 hover:text-black underline underline-offset-2 transition-colors"
                            >
                                Sign in with email & password
                            </button>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
                            <div className="space-y-2">
                                <label htmlFor="email" className="text-black text-sm font-medium">Email</label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="you@example.com"
                                    value={formData.email}
                                    onChange={(e) => handleInputChange('email', e.target.value)}
                                    onBlur={(e) => handleInputBlur('email', e.target.value)}
                                    className={`w-full px-4 py-3 border border-black bg-white text-black placeholder-gray-500 focus:outline-none focus:ring-0 ${emailError ? 'border-red-500' : ''}`}
                                />
                                {emailError && <p className="text-sm text-red-500">{emailError}</p>}
                            </div>

                            <div className="space-y-2">
                                <label htmlFor="password" className="text-black text-sm font-medium">Password</label>
                                <div className="relative">
                                    <Input
                                        id="password"
                                        type={showPassword ? 'text' : 'password'}
                                        placeholder="••••••••"
                                        value={formData.password}
                                        onChange={(e) => handleInputChange('password', e.target.value)}
                                        onBlur={(e) => handleInputBlur('password', e.target.value)}
                                        className={`w-full px-4 py-3 border border-black bg-white text-black placeholder-gray-500 focus:outline-none focus:ring-0 pr-10 ${passwordError ? 'border-red-500' : ''}`}
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
                                {passwordError && <p className="text-sm text-red-500">{passwordError}</p>}
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
                    )}

                    <div className="text-center mt-6">
                        <p className="text-gray-600">
                            Don't have an account?{' '}
                            <Link to="/register" className="text-black hover:underline">Sign up</Link>
                        </p>
                    </div>

                    <p className="text-xs text-gray-500 mt-8 text-center">
                        By signing in, you agree to Yepper's Terms of Service and Privacy Policy.
                    </p>
                </div>
            </div>
        </>
    );
};

export default Login;