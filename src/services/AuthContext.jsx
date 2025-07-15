import React, { createContext, useContext, useState, useEffect } from 'react';
import AuthService from './authservice.jsx'; // Added .js extension for explicit import

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
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check if user is already logged in on app start
        const validateAndSetUser = async () => {
            const currentUser = AuthService.getCurrentUser();
            if (currentUser && currentUser.token) {
                // Validate token by trying to fetch user ads (which requires authentication)
                try {
                    console.log('🔐 Validating stored authentication token...');
                    const response = await fetch(`http://localhost:8080/ad/user/${currentUser.username}`, {
                        headers: {
                            'Authorization': `Bearer ${currentUser.token}`
                        }
                    });
                    
                    if (response.ok) {
                        // Token is valid, keep user logged in
                        console.log('✅ Token validation successful, user remains logged in');
                        setUser(currentUser);
                    } else if (response.status === 401 || response.status === 403) {
                        // Token is invalid, clear localStorage and logout
                        console.log('❌ Token validation failed (401/403), logging out user');
                        AuthService.logout();
                        setUser(null);
                    } else {
                        // Other error, but keep user logged in (might be server issue)
                        console.log('⚠️ Token validation error, but keeping user logged in:', response.status);
                        setUser(currentUser);
                    }
                } catch (error) {
                    // Network error or backend down, check if backend is reachable
                    try {
                        console.log('🔍 Checking if backend is reachable...');
                        const healthResponse = await fetch('http://localhost:8080/ad/getAll?page=0');
                        if (healthResponse.ok) {
                            // Backend is up but our token failed, log out
                            console.log('❌ Backend is reachable but token failed, logging out user');
                            AuthService.logout();
                            setUser(null);
                        } else {
                            // Backend might be down, keep user logged in
                            console.log('⚠️ Backend seems down, keeping user logged in');
                            setUser(currentUser);
                        }
                    } catch (healthError) {
                        // Backend is definitely down, keep user logged in
                        console.log('⚠️ Backend is down, keeping user logged in');
                        setUser(currentUser);
                    }
                }
            } else {
                setUser(currentUser);
            }
            setLoading(false);
        };
        
        validateAndSetUser();
    }, []);

    const login = async (username, password) => {
        try {
            const result = await AuthService.login(username, password);
            setUser(result.user);
            return result;
        } catch (error) {
            throw error;
        }
    };

    const register = async (username, password, phoneNumber) => {
        try {
            const result = await AuthService.register(username, password, phoneNumber);
            return result;
        } catch (error) {
            throw error;
        }
    };

    const logout = () => {
        AuthService.logout();
        setUser(null);
    };

    // Method to handle authentication failures (401 errors)
    const handleAuthFailure = () => {
        console.log('Authentication failed - logging out user');
        logout();
    };

    // Method to clear authentication (for backend restarts)
    const clearAuth = () => {
        AuthService.clearAuth();
        setUser(null);
    };

    const value = {
        user,
        login,
        register,
        logout,
        handleAuthFailure,
        clearAuth,
        loading,
        isAuthenticated: user !== null
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};