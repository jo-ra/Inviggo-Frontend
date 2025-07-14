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
        const currentUser = AuthService.getCurrentUser();
        setUser(currentUser);
        setLoading(false);
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

    const value = {
        user,
        login,
        register,
        logout,
        loading,
        isAuthenticated: user !== null
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};