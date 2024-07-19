import React, { createContext, useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
import addressContractNFT from '../contract-api/addressContractNFT'
import newNFT from '../contract-api/newNFT.json';

export const WalletContext = createContext();

export const WalletProvider = ({ children }) => {
    const contractAddress = addressContractNFT
    const [walletAddress, setWalletAddress] = useState('');
    const [isConnected, setIsConnected] = useState(false);
    const [isConnecting, setIsConnecting] = useState(false);

    const connectWallet = async () => {
        setIsConnecting(true);
        if (window.ethereum) {
            try {
                // Yêu cầu quyền truy cập vào tài khoản Ethereum
                await window.ethereum.request({ method: 'wallet_requestPermissions', params: [{ eth_accounts: {} }] });

                const provider = new ethers.providers.Web3Provider(window.ethereum);
                await provider.send('eth_requestAccounts', []);
                const signer = provider.getSigner();
                const address = await signer.getAddress();
                setWalletAddress(address);
                setIsConnected(true);

                // Lưu địa chỉ ví vào localStorage
                localStorage.setItem('walletAddress', address);
            } catch (error) {
                console.error('Error connecting wallet:', error);
            } finally {
                setIsConnecting(false);
            }
        } else {
            console.error('MetaMask is not installed');
            setIsConnecting(false);
        }
    };

    const [winner, setWinner] = useState('')
    const callWinner = useCallback((tokenId) => {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        if (signer) {
            const contract = new ethers.Contract(contractAddress, newNFT.abi, signer)

            setInterval(async () => {
                const winner = await contract.getWinner(tokenId);
                if (winner[0] > 0) setWinner(winner)
            }
                , 1000)
        }
    }, [])

    const disconnectWallet = async () => {
        if (window.ethereum && window.ethereum.isMetaMask) {
            try {
                // Ngắt kết nối ví MetaMask ngay lập tức
                await window.ethereum.request({ method: 'wallet_disconnect' });

                setWalletAddress('');
                setIsConnected(false);
                // Xử lý bổ sung nếu cần sau khi ngắt kết nối
            } catch (error) {
                console.error('Error disconnecting wallet:', error);
            }
        } else {
            console.error('MetaMask không được phát hiện trong trình duyệt của bạn.');
        }
    };

    useEffect(() => {
        // Kiểm tra và cập nhật địa chỉ ví từ localStorage khi component mount
        const storedAddress = localStorage.getItem('walletAddress');
        if (storedAddress) {
            setWalletAddress(storedAddress);
            setIsConnected(true);
        }
    }, []);

    return (
        <WalletContext.Provider value={{ walletAddress, isConnected, isConnecting, connectWallet, disconnectWallet, winner, callWinner }}>
            {children}
        </WalletContext.Provider>
    );
};
