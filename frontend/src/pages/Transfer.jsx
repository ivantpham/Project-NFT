import React, { useState, useEffect } from 'react';
import '../styles/Transfer.css';
import { Modal, Button, Form, Alert } from 'react-bootstrap';
import { ethers } from 'ethers';
import LTPCoin from '../contract-api/LTPCoin.json';

const Transfer = ({ show, handleClose, walletAddress, updateBalances }) => {
    const [amount, setAmount] = useState('');
    const [recipient, setRecipient] = useState('');
    const [isTransferring, setIsTransferring] = useState(false);
    const [transferSuccess, setTransferSuccess] = useState(false);
    const [transferError, setTransferError] = useState('');
    const [balance, setBalance] = useState('');

    useEffect(() => {
        const fetchBalance = async () => {
            try {
                if (window.ethereum) {
                    const provider = new ethers.providers.Web3Provider(window.ethereum);
                    const ltpContract = new ethers.Contract('0x0005BA5281CEB65A1E99de9a08798F93063E557D', LTPCoin.abi, provider);
                    const balanceInWei = await ltpContract.balanceOf(walletAddress);
                    const balanceInEther = ethers.utils.formatEther(balanceInWei);
                    setBalance(balanceInEther);
                }
            } catch (error) {
                console.error('Error fetching balance:', error);
            }
        };

        if (walletAddress) {
            fetchBalance();
        }
    }, [walletAddress]);

    useEffect(() => {
        if (transferSuccess) {
            const timer = setTimeout(() => {
                setTransferSuccess(false);
                handleClose();
            }, 1000);

            return () => clearTimeout(timer);
        }
    }, [transferSuccess, handleClose]);

    const handleTransfer = async (e) => {
        e.preventDefault();

        if (!amount || !recipient) {
            setTransferError("Please fill in all fields.");
            return;
        }

        const inputAmount = parseFloat(amount);
        const availableBalance = parseFloat(balance);

        if (inputAmount > availableBalance) {
            setTransferError('Insufficient LTP. Enter a valid amount.');
            return;
        }

        setIsTransferring(true);
        setTransferError('');

        try {
            if (window.ethereum) {
                await window.ethereum.request({ method: 'eth_requestAccounts' });
                const provider = new ethers.providers.Web3Provider(window.ethereum);
                const signer = provider.getSigner();
                const ltpContract = new ethers.Contract('0x0005BA5281CEB65A1E99de9a08798F93063E557D', LTPCoin.abi, signer);
                const amountInWei = ethers.utils.parseEther(amount);

                const tx = await ltpContract.transfer(recipient, amountInWei);
                await tx.wait();

                setTransferSuccess(true);
                updateBalances();
            }
        } catch (error) {
            console.error('Transfer failed:', error);
            setTransferError('Transfer failed. Please try again.');
        } finally {
            setIsTransferring(false);
        }
    };

    const handleAlertClose = () => {
        setTransferSuccess(false);
    };

    return (
        <Modal show={show} onHide={handleClose} centered>
            <Modal.Header closeButton>
                <Modal.Title>Transfer LTP</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {transferSuccess && (
                    <Alert variant="success" onClose={handleAlertClose} dismissible>
                        Transfer successful!
                    </Alert>
                )}
                {transferError && (
                    <Alert variant="danger" onClose={() => setTransferError('')} dismissible>
                        {transferError}
                    </Alert>
                )}
                <Form onSubmit={handleTransfer}>
                    <Form.Group className="mb-3" controlId="formLTPAmount">
                        <Form.Label>Amount of LTP</Form.Label>
                        <Form.Control
                            type="number"
                            placeholder="Enter amount"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            isInvalid={!!transferError}
                        />
                        <Form.Control.Feedback type="invalid">
                            {transferError}
                        </Form.Control.Feedback>
                        <Form.Text className="white-text">
                            Available LTP: <span style={{ color: transferError ? 'red' : 'inherit' }}>{balance}</span>
                        </Form.Text>
                    </Form.Group>
                    <Form.Group className="mb-3" controlId="formWalletAddress">
                        <Form.Label>Wallet Address</Form.Label>
                        <Form.Control
                            type="text"
                            placeholder="Enter wallet address"
                            value={recipient}
                            onChange={(e) => setRecipient(e.target.value)}
                        />
                    </Form.Group>
                    <Button variant="primary" type="submit" disabled={isTransferring}>
                        {isTransferring ? 'Processing...' : 'Transfer'}
                    </Button>
                </Form>
            </Modal.Body>
            <Modal.Footer className="custom-modal-footer">
                <Button variant="secondary" onClick={handleClose} className="custom-close-button">
                    Close
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default Transfer;
