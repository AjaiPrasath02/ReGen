import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { Button, Message, Grid, Icon } from 'semantic-ui-react';
import { useAuth } from '../context/AuthContext';

const ConnectWalletPage = () => {
    const router = useRouter();
    const { userRole, walletAddress, connectWallet } = useAuth();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [connected, setConnected] = useState(false);
    const [isMetaMaskInstalled, setIsMetaMaskInstalled] = useState(false);

    useEffect(() => {
        checkMetaMask();
    }, []);

    const checkMetaMask = async () => {
        if (typeof window !== 'undefined' && typeof window.ethereum !== 'undefined') {
            setIsMetaMaskInstalled(true);
            // Check if already connected
            try {
                const accounts = await window.ethereum.request({
                    method: 'eth_accounts'
                });
                if (accounts[0]?.toLowerCase() === walletAddress?.toLowerCase()) {
                    setConnected(true);
                    redirectToDashboard();
                }
            } catch (error) {
                console.error('Initial connection check failed:', error);
            }
        }
    };

    const handleConnect = async () => {
        setLoading(true);
        setError('');

        try {
            const account = await connectWallet();
            setConnected(true);
            redirectToDashboard();
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const redirectToDashboard = () => {
        switch (userRole?.toLowerCase()) {
            case 'municipality':
                router.push('/registration');
                break;
            case 'manufacturer':
                router.push('/productionline');
                break;
            case 'labassistant':
                router.push('/lab');
                break;
            case 'technician':
                router.push('/recycler');
                break;
            default:
                console.error('Unknown role:', userRole);
                break;
        }
    };

    return (
        <div className="connect-wallet-container">
            <Grid textAlign='center' className="connect-wallet-grid" verticalAlign='middle' style={{ minWidth: '600px' }}>
                <Grid.Column style={{ margin: '50px' }}>
                    <h2 className="connect-wallet-header">
                        <Icon name='plug' style={{ color: '#0ea432' }} />
                        Connect Your Wallet
                    </h2>

                    {!isMetaMaskInstalled ? (
                        <Message warning className="message">
                            <Message.Header>MetaMask Not Detected</Message.Header>
                            <p>
                                Please install MetaMask to continue.{' '}
                                <a
                                    href="https://metamask.io/download/"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    Download MetaMask
                                </a>
                            </p>
                        </Message>
                    ) : (
                        <>
                            {connected ? (
                                <Message success className="message">
                                    <Message.Header style={{ color: '#0ea432' }}>Wallet Connected</Message.Header>
                                    <p>Account: {walletAddress?.substring(0, 6)}...{walletAddress?.substring(38)}</p>
                                    <p>Redirecting to dashboard...</p>
                                </Message>
                            ) : (
                                <Button
                                    onClick={handleConnect}
                                    loading={loading}
                                    disabled={loading}
                                    color='green'
                                >
                                    <Icon name='ethereum' />
                                    Connect MetaMask
                                </Button>
                            )}

                            {error && (
                                <Message error className="message">
                                    <Message.Header>Error</Message.Header>
                                    <p>{error}</p>
                                </Message>
                            )}
                        </>
                    )}

                    <Message info className="message">
                        <Message.Header>Why connect wallet?</Message.Header>
                        <p>
                            Connecting your wallet allows you to interact with the blockchain
                            and participate in waste management transactions securely.
                        </p>
                    </Message>
                </Grid.Column>
            </Grid>
        </div>
    );
};

ConnectWalletPage.getLayout = (page) => page;

export default ConnectWalletPage;