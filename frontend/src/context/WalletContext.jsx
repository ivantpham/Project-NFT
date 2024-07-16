// context/WalletContext.js
import React, { createContext, useState } from 'react';
import { ethers } from 'ethers';

export const WalletContext = createContext();

export const WalletProvider = ({ children }) => {
    const [walletAddress, setWalletAddress] = useState('');
    const [isConnected, setIsConnected] = useState(false);

    const connectWallet = async () => {
        if (window.ethereum) {
            try {
                const provider = new ethers.providers.Web3Provider(window.ethereum);
                await provider.send('eth_requestAccounts', []);
                const signer = provider.getSigner();
                const address = await signer.getAddress();
                setWalletAddress(address);
                setIsConnected(true);
            } catch (error) {
                console.error('Error connecting wallet:', error);
            }
        } else {
            console.error('MetaMask is not installed');
        }
    };

    const disconnectWallet = async () => {
        if (window.ethereum && window.ethereum.isMetaMask) {
            try {
                await window.ethereum.request({ method: 'wallet_requestPermissions', params: [{ eth_accounts: {} }] });
                setWalletAddress('');
                setIsConnected(false);
                // Additional handling if needed after disconnecting
            } catch (error) {
                console.error('Error disconnecting wallet:', error);
            }
        } else {
            console.error('MetaMask không được phát hiện trong trình duyệt của bạn.');
        }
    };

    return (
        <WalletContext.Provider value={{ walletAddress, isConnected, connectWallet, disconnectWallet }}>
            {children}
        </WalletContext.Provider>
    );
};