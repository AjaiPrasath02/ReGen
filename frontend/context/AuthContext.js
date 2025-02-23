import { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import web3 from '../ethereum/web3';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const router = useRouter();
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [userRole, setUserRole] = useState(null);
    const [walletAddress, setWalletAddress] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = () => {
        const token = localStorage.getItem('token');
        const role = localStorage.getItem('role');
        const sessionExpiry = localStorage.getItem('sessionExpiry');

        if (token && role && sessionExpiry && new Date().getTime() < parseInt(sessionExpiry)) {
            setIsAuthenticated(true);
            setUserRole(role);
            setWalletAddress(localStorage.getItem('userAddress'));
        } else {
            localStorage.clear();
            setIsAuthenticated(false);
            setUserRole(null);
            setWalletAddress(null);
        }
        setLoading(false);
    };

    const login = async (email, password, role) => {
        try {
            const response = await fetch('http://localhost:4000/api/user/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password, role })
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.error);

            localStorage.setItem('token', data.token);
            localStorage.setItem('role', data.role);
            localStorage.setItem('userAddress', data.walletAddress);
            localStorage.setItem('userName', data.name);
            localStorage.setItem('sessionExpiry', (new Date().getTime() + (24 * 60 * 60 * 1000)).toString());

            setIsAuthenticated(true);
            setUserRole(data.role);
            setWalletAddress(data.walletAddress);

            return data;
        } catch (error) {
            throw error;
        }
    };

    const logout = () => {
        localStorage.clear();
        setIsAuthenticated(false);
        setUserRole(null);
        setWalletAddress(null);
        router.push('/login');
    };

    const connectWallet = async () => {
        try {
            if (!window.ethereum) {
                throw new Error('MetaMask is not installed');
            }

            const accounts = await window.ethereum.request({
                method: 'eth_requestAccounts'
            });

            if (!accounts[0]) {
                throw new Error('No accounts found');
            }

            if (accounts[0].toLowerCase() !== walletAddress?.toLowerCase()) {
                throw new Error(`Please connect with wallet address: ${walletAddress}`);
            }

            return accounts[0];
        } catch (error) {
            throw error;
        }
    };

    return (
        <AuthContext.Provider value={{
            isAuthenticated,
            userRole,
            walletAddress,
            loading,
            login,
            logout,
            connectWallet,
            checkAuth
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