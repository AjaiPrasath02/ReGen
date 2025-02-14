import Web3 from 'web3';

let web3;

if (typeof window !== 'undefined' && typeof window.ethereum !== 'undefined') {
    // We are in the browser and MetaMask is running
    web3 = new Web3(window.ethereum);
} else {
    // We are on the server or the user is not running MetaMask
    const provider = new Web3.providers.HttpProvider(
        'https://sepolia.infura.io/v3/a5dc022ed8df4754b509e1f289d10b05'
    );
    web3 = new Web3(provider);
}

export const connectWallet = async () => {
    if (typeof window !== 'undefined' && typeof window.ethereum !== 'undefined') {
        try {
            // Simply request account access
            const accounts = await window.ethereum.request({
                method: 'eth_requestAccounts'
            });
            
            console.log('Connected accounts:', accounts);
            return accounts.length > 0;
        } catch (error) {
            console.error('Wallet connection error:', error);
            throw error;
        }
    }
    return false;
};

export default web3;