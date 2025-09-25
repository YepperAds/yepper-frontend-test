import React, { createContext, useContext, useReducer, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

const authReducer = (state, action) => {
  switch (action.type) {
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        loading: false
      };
    case 'LOGOUT':
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        loading: false
      };
    case 'SET_LOADING':
      return {
        ...state,
        loading: action.payload
      };
    case 'SIGNUP_SUCCESS':
      return {
        ...state,
        loading: false
      };
    default:
      return state;
  }
};

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, {
    user: null,
    token: localStorage.getItem('token'),
    isAuthenticated: false,
    loading: true
  });

  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      loadUser();
    } else {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);

  const loadUser = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/auth/profile`);
      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: {
          user: response.data.user,
          token: localStorage.getItem('token')
        }
      });
    } catch (error) {
      console.error('Load user error:', error);
      localStorage.removeItem('token');
      delete axios.defaults.headers.common['Authorization'];
      dispatch({ type: 'LOGOUT' });
    }
  };

  const login = async (email, password) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      const response = await axios.post(`${API_URL}/api/auth/login`, {
        email,
        password
      });

      const userData = response.data;
      localStorage.setItem('token', userData.token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${userData.token}`;
      
      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: userData
      });
      
      return true;
    } catch (error) {
      console.error('Login error:', error);
      dispatch({ type: 'SET_LOADING', payload: false });
      throw error;
    }
  };

  // ADD THIS MISSING SIGNUP FUNCTION
  const signup = async (email, password, name) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      const response = await axios.post(`${API_URL}/api/auth/register`, {
        email,
        password,
        name // Changed from fullName to name to match backend
      });

      dispatch({ type: 'SIGNUP_SUCCESS' });
      return true;
    } catch (error) {
      console.error('Signup error:', error);
      dispatch({ type: 'SET_LOADING', payload: false });
      
      // Throw a more specific error message
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      } else {
        throw new Error('Registration failed. Please try again.');
      }
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
    dispatch({ type: 'LOGOUT' });
  };

  return (
    <AuthContext.Provider value={{
      ...state,
      login,
      signup, // ADD THIS
      logout,
      loadUser
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// // AuthContext.js
// import React, { createContext, useContext, useReducer, useEffect } from 'react';
// import axios from 'axios';

// const AuthContext = createContext();

// const authReducer = (state, action) => {
//   switch (action.type) {
//     case 'LOGIN_SUCCESS':
//       return {
//         ...state,
//         user: action.payload.user,
//         token: action.payload.token,
//         isAuthenticated: true,
//         loading: false
//       };
//     case 'LOGOUT':
//       return {
//         ...state,
//         user: null,
//         token: null,
//         isAuthenticated: false,
//         loading: false
//       };
//     case 'SET_LOADING':
//       return {
//         ...state,
//         loading: action.payload
//       };
//     default:
//       return state;
//   }
// };

// export const AuthProvider = ({ children }) => {
//   const [state, dispatch] = useReducer(authReducer, {
//     user: null,
//     token: localStorage.getItem('token'),
//     isAuthenticated: false,
//     loading: true
//   });

//   useEffect(() => {
//     const token = localStorage.getItem('token');
//     if (token) {
//       axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
//       loadUser();
//     } else {
//       dispatch({ type: 'SET_LOADING', payload: false });
//     }
//   }, []);

//   const loadUser = async () => {
//     try {
//       const response = await axios.get('http://localhost:5000/api/auth/profile');
//       dispatch({
//         type: 'LOGIN_SUCCESS',
//         payload: {
//           user: response.data.user,
//           token: localStorage.getItem('token')
//         }
//       });
//     } catch (error) {
//       localStorage.removeItem('token');
//       delete axios.defaults.headers.common['Authorization'];
//       dispatch({ type: 'LOGOUT' });
//     }
//   };

//   const login = (userData) => {
//     localStorage.setItem('token', userData.token);
//     axios.defaults.headers.common['Authorization'] = `Bearer ${userData.token}`;
//     dispatch({
//       type: 'LOGIN_SUCCESS',
//       payload: userData
//     });
//   };

//   const logout = () => {
//     localStorage.removeItem('token');
//     delete axios.defaults.headers.common['Authorization'];
//     dispatch({ type: 'LOGOUT' });
//   };

//   return (
//     <AuthContext.Provider value={{
//       ...state,
//       login,
//       logout,
//       loadUser
//     }}>
//       {children}
//     </AuthContext.Provider>
//   );
// };

// export const useAuth = () => {
//   const context = useContext(AuthContext);
//   if (!context) {
//     throw new Error('useAuth must be used within an AuthProvider');
//   }
//   return context;
// };