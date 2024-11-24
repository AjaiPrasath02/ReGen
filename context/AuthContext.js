import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [userRole, setUserRole] = useState(null);
    const [account, setAccount] = useState(null);

    const login = (token, role) => {
        localStorage.setItem('token', token);
        localStorage.setItem('role', role);
        setIsAuthenticated(true);
        setUserRole(role);
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        setIsAuthenticated(false);
        setUserRole(null);
        setAccount(null);
    };

    const connectWallet = async () => {
        if (window.ethereum) {
            try {
                const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
                setAccount(accounts[0]);
            } catch (error) {
                console.error('Error connecting wallet:', error);
            }
        }
    };

    useEffect(() => {
        const token = localStorage.getItem('token');
        const role = localStorage.getItem('role');
        if (token && role) {
            setIsAuthenticated(true);
            setUserRole(role);
        }
    }, []);

    return (
        <AuthContext.Provider value={{ isAuthenticated, userRole, account, login, logout, connectWallet }}>
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