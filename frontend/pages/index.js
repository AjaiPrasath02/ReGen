import { useEffect } from 'react';
import { useRouter } from 'next/router';

export default function Home() {
    const router = useRouter();

    useEffect(() => {
        // Check authentication status
        const token = localStorage.getItem('token');
        const role = localStorage.getItem('role');
        
        if (token && role) {
            // Check if wallet is connected
            if (typeof window.ethereum !== 'undefined') {
                window.ethereum.request({ method: 'eth_accounts' })
                    .then(accounts => {
                        if (accounts.length > 0) {
                            // If authenticated and wallet connected, redirect to role-specific dashboard
                            router.replace(`/${role.toLowerCase()}`);
                        } else {
                            // If authenticated but wallet not connected, redirect to wallet connection
                            router.replace('/connect-wallet');
                        }
                    })
                    .catch(error => {
                        console.error('Error checking wallet:', error);
                        router.replace('/about');
                    });
            } else {
                // MetaMask not installed
                router.replace('/about');
            }
        } else {
            // Not authenticated, redirect to about page
            router.replace('/about');
        }
    }, []);

    // Show loading state or splash screen while checking
    return (
        <div style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            height: '100vh',
            backgroundColor: '#f5f5f5'
        }}>
            <div style={{ textAlign: 'center' }}>
                <h1 style={{ color: '#2c974b' }}>ReGen</h1>
                <p>Loading...</p>
            </div>
        </div>
    );
}