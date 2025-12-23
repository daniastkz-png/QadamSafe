import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { firebaseAuthAPI, auth } from '../services/firebase';
import type { User } from '../types';
import { useTranslation } from 'react-i18next';
import { onAuthStateChanged } from 'firebase/auth';

interface AuthContextType {
    user: User | null;
    loading: boolean;
    login: (email: string, password: string) => Promise<void>;
    register: (email: string, password: string, name?: string) => Promise<void>;
    loginWithGoogle: () => Promise<void>;
    logout: () => void;
    updateUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const { i18n } = useTranslation();

    useEffect(() => {
        // Listen to Firebase auth state changes
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            if (firebaseUser) {
                try {
                    const userData = await firebaseAuthAPI.getMe();
                    setUser(userData as User);
                    // Sync language with user preference
                    if (userData.language && userData.language !== i18n.language) {
                        i18n.changeLanguage(userData.language);
                        localStorage.setItem('language', userData.language);
                    }
                } catch (error) {
                    console.error('Error fetching user data:', error);
                    setUser(null);
                }
            } else {
                setUser(null);
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, [i18n]);

    const login = async (email: string, password: string) => {
        const { user: userData } = await firebaseAuthAPI.login(email, password);
        setUser(userData as User);

        // Save last account for quick login feature
        localStorage.setItem('lastAccount', JSON.stringify({
            email: userData.email,
            name: userData.name || '',
        }));

        // Sync language
        if (userData.language) {
            i18n.changeLanguage(userData.language);
            localStorage.setItem('language', userData.language);
        }

        // Always redirect to welcome page (About Platform section)
        navigate('/welcome');
    };

    const register = async (email: string, password: string, name?: string) => {
        const currentLanguage = i18n.language;
        const { user: userData } = await firebaseAuthAPI.register({
            email,
            password,
            name,
            language: currentLanguage,
        });
        setUser(userData as User);

        // Save last account for quick login feature
        localStorage.setItem('lastAccount', JSON.stringify({
            email: userData.email,
            name: userData.name || '',
        }));

        // Always show welcome page on first registration
        navigate('/welcome');
    };

    const loginWithGoogle = async () => {
        const currentLanguage = i18n.language;
        const { user: userData } = await firebaseAuthAPI.loginWithGoogle(currentLanguage);
        setUser(userData as User);

        // Save last account for quick login feature
        localStorage.setItem('lastAccount', JSON.stringify({
            email: userData.email,
            name: userData.name || '',
        }));

        // Sync language
        if (userData.language) {
            i18n.changeLanguage(userData.language);
            localStorage.setItem('language', userData.language);
        }

        // Redirect based on whether new or existing user
        navigate('/welcome');
    };

    const logout = async () => {
        await firebaseAuthAPI.logout();
        setUser(null);
        navigate('/');
    };

    const updateUser = (updatedUser: User) => {
        setUser(updatedUser);
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, register, loginWithGoogle, logout, updateUser }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
