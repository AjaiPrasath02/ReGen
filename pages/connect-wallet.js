import React, { Component } from 'react';
import { withRouter } from 'next/router';
import { Button, Message, Grid, Header, Icon } from 'semantic-ui-react';
import web3, { connectWallet } from '../ethereum/web3';

class ConnectWalletPage extends Component {
    state = {
        loading: false,
        errorMessage: '',
        account: '',
        isMetaMaskInstalled: false,
        userAddress: '',
    };

    componentDidMount = async () => {
        try {
            // Check authentication
            const token = localStorage.getItem('token');
            const role = localStorage.getItem('role');
            const userAddress = localStorage.getItem('userAddress');

            if (!token || !role || !userAddress) {
                this.props.router.push('/login');
                return;
            }

            this.setState({ userAddress });

            // Check for MetaMask
            if (typeof window !== 'undefined' && typeof window.ethereum !== 'undefined') {
                this.setState({ isMetaMaskInstalled: true });

                // Check if already connected
                try {
                    const accounts = await web3.eth.getAccounts();
                    if (accounts.length > 0) {
                        await this.validateWalletAddress(accounts[0]);
                        // If already connected with correct address, redirect to dashboard
                        this.redirectToDashboard();
                    }
                } catch (error) {
                    console.error('Initial connection check failed:', error);
                }
            } else {
                this.setState({
                    isMetaMaskInstalled: false,
                    errorMessage: 'Please install MetaMask to continue'
                });
            }
        } catch (error) {
            console.error('Initialization error:', error);
            this.setState({
                errorMessage: error.message || 'Failed to initialize wallet connection'
            });
        }
    };

    validateWalletAddress = async (account) => {
        const { userAddress } = this.state;
        console.log('Connected account:', account.toLowerCase());
        console.log('Expected userAddress:', userAddress.toLowerCase());

        if (account.toLowerCase() !== userAddress.toLowerCase()) {
            // Add more descriptive error message
            throw new Error(`Please connect with wallet address: ${userAddress}\nCurrently connected with: ${account}`);
        }
    };

    connectWallet = async () => {
        this.setState({ loading: true, errorMessage: '' });

        try {
            if (!window.ethereum) {
                throw new Error('MetaMask is not installed');
            }

            // Log the expected address before connection
            console.log('Expected address from localStorage:', this.state.userAddress);

            // Try to connect wallet
            const connected = await connectWallet();
            if (!connected) {
                throw new Error('Failed to connect wallet');
            }

            // Get the connected account
            const accounts = await web3.eth.getAccounts();
            if (accounts.length === 0) {
                throw new Error('No accounts found');
            }

            console.log('Connected with account:', accounts[0]);

            // Validate the wallet address
            await this.validateWalletAddress(accounts[0]);

            // Update state with connected account
            this.setState({
                account: accounts[0],
                errorMessage: ''
            });

            // Set up event listeners
            window.ethereum.on('accountsChanged', this.handleAccountsChanged);
            window.ethereum.on('chainChanged', () => window.location.reload());

            // Redirect to dashboard after successful connection
            setTimeout(() => this.redirectToDashboard(), 1000);

        } catch (error) {
            console.error('Connection error:', error);
            // Make the error message more helpful
            const errorMsg = error.message.includes('Please connect with wallet address')
                ? `Wrong wallet address. ${error.message}`
                : error.message || 'Failed to connect wallet';

            this.setState({
                errorMessage: errorMsg,
                account: ''
            });
        } finally {
            this.setState({ loading: false });
        }
    };

    handleAccountsChanged = async (accounts) => {
        try {
            if (accounts.length === 0) {
                this.setState({
                    account: '',
                    errorMessage: 'Please connect your wallet'
                });
            } else {
                await this.validateWalletAddress(accounts[0]);
                this.setState({ account: accounts[0], errorMessage: '' });
            }
        } catch (error) {
            this.setState({
                errorMessage: error.message,
                account: ''
            });
        }
    };

    redirectToDashboard = () => {
        const role = localStorage.getItem('role');
        if (role) {
            console.log('Redirecting to role:', role.toLowerCase()); // Debug log

            if (role.toLowerCase() === 'municipality') {
                this.props.router.push('/registration').catch(err => {
                    console.error('Navigation error:', err);
                });
            } else if (role.toLowerCase() === 'manufacturer') {
                this.props.router.push('/productionline').catch(err => {
                    console.error('Navigation error:', err);
                });
            }
        }
    };

    render() {
        const { loading, errorMessage, account, isMetaMaskInstalled } = this.state;

        return (
            <div className="connect-wallet-container">
                <link rel="stylesheet"
                    href="//cdn.jsdelivr.net/npm/semantic-ui@2.4.1/dist/semantic.min.css"
                />
                <Grid textAlign='center' className="connect-wallet-grid" verticalAlign='middle' horizontalAlign='center' style={{ minWidth: '600px' }}>
                    <Grid.Column style={{ margin: '50px' }}>
                        <h2 className="connect-wallet-header">
                            <Icon name='plug' style={{ color: '#0ea432' }}/>
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
                                {account ? (
                                    <Message success className="message">
                                        <Message.Header style={{ color: '#0ea432' }}>Wallet Connected</Message.Header>
                                        <p>Account: {account.substring(0, 6)}...{account.substring(38)}</p>
                                        <p>Redirecting to dashboard...</p>
                                    </Message>
                                ) : (
                                    <Button
                                        onClick={this.connectWallet}
                                        loading={loading}
                                        disabled={loading}
                                        color='green'
                                    >
                                        <Icon name='ethereum' />
                                        Connect MetaMask
                                    </Button>
                                )}

                                {errorMessage && (
                                    <Message error className="message">
                                        <Message.Header>Error</Message.Header>
                                        <p>{errorMessage}</p>
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
    }
}

ConnectWalletPage.getLayout = (page) => {
    return page;
};

export default withRouter(ConnectWalletPage);