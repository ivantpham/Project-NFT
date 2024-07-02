import React, { useState } from 'react';
import '../styles/MintLTP.css';
import { Modal, Button, Form, Alert } from 'react-bootstrap';
import Web3 from 'web3';
import LTPCoin from '../contract-api/LTPCoin.json';

const MintLTP = ({ show, handleClose, updateBalances }) => {
    const [amount, setAmount] = useState('');
    const [isMinting, setIsMinting] = useState(false);
    const [mintSuccess, setMintSuccess] = useState(false);
    const [mintError, setMintError] = useState('');

    const handleMint = async (e) => {
        e.preventDefault();

        if (!amount) {
            setMintError("Please enter the amount of LTP to mint.");
            return;
        }

        setIsMinting(true);
        setMintError('');

        try {
            const web3 = new Web3(window.ethereum);
            await window.ethereum.request({ method: 'eth_requestAccounts' }); // Yêu cầu kết nối MetaMask

            const ltpContract = new web3.eth.Contract(LTPCoin.abi, '0x0005BA5281CEB65A1E99de9a08798F93063E557D');
            const amountInWei = web3.utils.toWei(amount, 'ether');

            await ltpContract.methods.mintToOwner(amountInWei).send({ from: window.ethereum.selectedAddress });

            setMintSuccess(true);
            updateBalances();

            // Tự động đóng modal sau 1 giây
            setTimeout(() => {
                setMintSuccess(false);
                handleClose();
            }, 1000);
        } catch (error) {
            console.error('Minting failed:', error);
            setMintError(`Minting failed: ${error.message}`);
        } finally {
            setIsMinting(false);
        }
    };

    return (
        <Modal show={show} onHide={handleClose} centered>
            <Modal.Header closeButton>
                <Modal.Title>Mint LTP</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {mintSuccess && (
                    <Alert variant="success" dismissible>
                        Minting successful!
                    </Alert>
                )}
                {mintError && (
                    <Alert variant="danger" onClose={() => setMintError('')} dismissible>
                        {mintError}
                    </Alert>
                )}
                <Form onSubmit={handleMint}>
                    <Form.Group className="mb-3" controlId="formLTPAmount">
                        <Form.Label>Amount of LTP</Form.Label>
                        <Form.Control
                            type="number"
                            placeholder="Enter amount"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                        />
                    </Form.Group>
                    <Button variant="warning" type="submit" disabled={isMinting}>
                        {isMinting ? 'Processing...' : 'Mint'}
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

export default MintLTP;
