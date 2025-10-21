// components.js
import React from 'react';
import { Loader2 } from 'lucide-react';
import Loading from './LoadingSpinner';

// Button Component with different variants and sizes
export const Button = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  className = '', 
  disabled = false,
  loading = false,
  icon,
  iconPosition = 'right',
  ...props 
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-medium transition-all duration-200 focus:outline-none focus:ring-0 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';
  
  const variants = {
    primary: 'border border-black bg-white text-black hover:bg-gray-100 focus:outline-none focus:ring-0',
    secondary: 'bg-black text-white focus:outline-none focus:ring-0',
    outline: 'bg-transparent text-gray-600 border border-gray-600 hover:bg-gray-50 focus:outline-none focus:ring-0',
    ghost: 'bg-transparent text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-0',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus:outline-none focus:ring-0',
    success: 'bg-green-600 text-white hover:bg-green-700 focus:outline-none focus:ring-0'
  };
  
  const sizes = {
    xs: 'px-2 py-1 text-xs',
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
    xl: 'px-8 py-4 text-lg'
  };

  const IconComponent = loading ? Loader2 : icon;

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {iconPosition === 'left' && IconComponent && (
        <IconComponent 
          size={size === 'xs' ? 12 : size === 'sm' ? 14 : size === 'lg' ? 20 : size === 'xl' ? 24 : 16} 
          className={`${loading ? 'animate-spin' : ''} ${children ? 'mr-2' : ''}`} 
        />
      )}
      {children}
      {iconPosition === 'right' && IconComponent && (
        <IconComponent 
          size={size === 'xs' ? 12 : size === 'sm' ? 14 : size === 'lg' ? 20 : size === 'xl' ? 24 : 16} 
          className={`${loading ? 'animate-spin' : ''} ${children ? 'ml-2' : ''}`} 
        />
      )}
    </button>
  );
};

// Card Component
export const Card = ({ children, className = '', ...props }) => {
  return (
    <div 
      className={`bg-white border border-gray-200 transition-shadow duration-200 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

// Card Header
export const CardHeader = ({ children, className = '', ...props }) => {
  return (
    <div className={`px-6 py-4 border-b border-gray-200 ${className}`} {...props}>
      {children}
    </div>
  );
};

// Card Content
export const CardContent = ({ children, className = '', ...props }) => {
  return (
    <div className={`px-6 py-4 ${className}`} {...props}>
      {children}
    </div>
  );
};

// Typography Components
export const Heading = ({ level = 1, children, className = '', ...props }) => {
  const styles = {
    1: 'text-5xl font-bold text-black',
    2: 'text-3xl font-bold text-black',
    3: 'text-xl font-semibold text-black',
    4: 'text-lg font-semibold text-black',
    5: 'text-base font-semibold text-black',
    6: 'text-sm font-semibold text-black'
  };

  const Component = `h${level}`;
  
  return React.createElement(
    Component,
    {
      className: `${styles[level]} ${className}`,
      ...props
    },
    children
  );
};

export const Text = ({ variant = 'body', children, className = '', ...props }) => {
  const variants = {
    body: 'text-sm text-gray-700',
    small: 'text-xs text-gray-600',
    large: 'text-base text-gray-700',
    muted: 'text-sm text-gray-500',
    error: 'text-sm text-red-700',
    success: 'text-sm text-green-700'
  };

  return (
    <p className={`${variants[variant]} ${className}`} {...props}>
      {children}
    </p>
  );
};

// Input Component
export const Input = ({ 
  label, 
  error, 
  helperText, 
  className = '', 
  required = false,
  ...props 
}) => {
  return (
    <div className="space-y-1">
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <input
        className={`block w-full px-3 py-2 border border-gray-300 bg-white text-sm placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-black focus:border-black disabled:bg-gray-50 disabled:text-gray-500 ${
          error ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : ''
        } ${className}`}
        {...props}
      />
      {error && <Text variant="error">{error}</Text>}
      {helperText && !error && <Text variant="muted">{helperText}</Text>}
    </div>
  );
};

// TextArea Component
export const TextArea = ({ 
  label, 
  error, 
  helperText, 
  className = '', 
  required = false,
  rows = 3,
  ...props 
}) => {
  return (
    <div className="space-y-1">
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <textarea
        rows={rows}
        className={`block w-full px-3 py-2 border border-gray-300 bg-white text-sm placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-black focus:border-black disabled:bg-gray-50 disabled:text-gray-500 resize-vertical ${
          error ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : ''
        } ${className}`}
        {...props}
      />
      {error && <Text variant="error">{error}</Text>}
      {helperText && !error && <Text variant="muted">{helperText}</Text>}
    </div>
  );
};

// Select Component
export const Select = ({ 
  label, 
  error, 
  helperText, 
  className = '', 
  required = false,
  children,
  ...props 
}) => {
  return (
    <div className="space-y-1">
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <select
        className={`block w-full px-3 py-2 border border-gray-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-gray-50 disabled:text-gray-500 ${
          error ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : ''
        } ${className}`}
        {...props}
      >
        {children}
      </select>
      {error && <Text variant="error">{error}</Text>}
      {helperText && !error && <Text variant="muted">{helperText}</Text>}
    </div>
  );
};

// Badge Component
export const Badge = ({ children, variant = 'default', className = '', ...props }) => {
  const variants = {
    default: 'bg-black text-white',
    primary: 'bg-gray-100 text-black border-black',
    success: 'bg-green-100 text-green-900',
    warning: 'bg-yellow-100 text-yellow-800',
    danger: 'bg-red-100 text-red-800',
    info: 'bg-blue-100 text-blue-800'
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 text-xs font-medium ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </span>
  );
};

// Loading Spinner Component
export const LoadingSpinner = ({ size = 'md', className = '' }) => {
  const sizes = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8',
    xl: 'h-12 w-12'
  };

  return (
    <Loading className={`animate-spin text-gray-700 ${sizes[size]} ${className}`} />
  );
};

// Alert Component
export const Alert = ({ children, variant = 'info', className = '', ...props }) => {
  const variants = {
    info: 'bg-black border-blue-200 text-white',
    success: 'bg-green-50 border-green-200 text-green-800',
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
    error: 'bg-red-50 border-red-200 text-red-800'
  };

  return (
    <div
      className={`border px-4 py-3 text-sm ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

// Container Component
export const Container = ({ children, size = 'default', className = '', ...props }) => {
  const sizes = {
    sm: 'max-w-4xl',
    default: 'max-w-7xl',
    lg: 'max-w-full'
  };

  return (
    <div 
      className={`${sizes[size]} mx-auto px-4 sm:px-8 lg:px-8 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

// Grid System
export const Grid = ({ children, cols = 1, gap = 4, className = '', ...props }) => {
  const gridCols = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
    6: 'grid-cols-2 md:grid-cols-3 lg:grid-cols-6'
  };

  const gaps = {
    2: 'gap-2',
    4: 'gap-4',
    6: 'gap-6',
    8: 'gap-8'
  };

  return (
    <div 
      className={`grid ${gridCols[cols]} ${gaps[gap]} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};