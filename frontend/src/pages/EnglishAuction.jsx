import React, { useState, useContext, useEffect } from 'react';
import { Container, Form, Button, Alert } from 'react-bootstrap';
import { useParams } from 'react-router-dom';
import { WalletContext } from '../context/WalletContext';
import newNFT from '../contract-api/newNFT.json';
import { ethers } from 'ethers';
import addressContractNFT from '../contract-api/addressContractNFT'
import addressContractLTPCoin from '../contract-api/addressContractLTPCoin';
import LTPCoin from '../contract-api/LTPCoin.json';
import { useNavigate } from 'react-router-dom';

const CONTRACT_ADDRESS_NFT = addressContractNFT;
const CONTRACT_ADDRESS_LTP = addressContractLTPCoin;

const EnglishAuction = () => {
    const [bidAmount, setBidAmount] = useState('');
    const [currentBid, setCurrentBid] = useState(null);
    const [error, setError] = useState('');
    const { nftId } = useParams()
    const { callWinner, winner, walletAddress } = useContext(WalletContext);
    const navigate = useNavigate()

    const handleBidChange = (e) => {
        setBidAmount(e.target.value);
    };

    useEffect(() => {
        callWinner(nftId)
    }, [])

    const handleConfirmBid = (e) => {
        e.preventDefault()
        if (parseFloat(bidAmount) <= 0 || bidAmount == '') {
            setError('Please enter a valid bid amount.');
            return;
        }
        setCurrentBid(parseFloat(bidAmount));
        setBidAmount('');
        setError('');
    };

    useEffect(() => {
        if (currentBid !== null) {
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            const signer = provider.getSigner();
            const contract = new ethers.Contract(addressContractNFT, newNFT.abi, signer)

            const bidding = async () => {
                const amount = ethers.utils.parseEther(currentBid.toString())
                try {
                    await contract.bidding(nftId, amount.toString(), {
                        gasLimit: 1000000
                    })
                } catch (e) {
                    alert(e);
                } finally {
                    setCurrentBid(null)
                }
            }

            bidding()
        }
    }, [currentBid])

    const [nft, setNft] = useState(null);
    const [userAddress, setUserAddress] = useState(null);
    const [showInProgressModal, setShowInProgressModal] = useState(false); // State for in-progress modal
    const [showEditModal, setShowEditModal] = useState(false); // State for edit modal
    const truncateAddress = (address) => {
        return `${address.slice(0, 7)}...${address.slice(-5)}`;
    };
    const [time, setTime] = useState(0);

    useEffect(() => {
        const fetchNFT = async () => {
            try {
                if (!window.ethereum) {
                    console.error('MetaMask not detected');
                    return;
                }
                await window.ethereum.request({ method: 'eth_requestAccounts' });

                const provider = new ethers.providers.Web3Provider(window.ethereum);
                const signer = provider.getSigner();
                const userAddress = await signer.getAddress();
                setUserAddress(userAddress.toLowerCase());

                const contract = new ethers.Contract(CONTRACT_ADDRESS_NFT, newNFT.abi, signer);
                const [name, description, creator, owner, price, likes, imageURL, ownerHistory, isAuction, ended] = await contract.getNFTInfo(nftId);

                setNft({
                    name,
                    description,
                    creator: truncateAddress(creator),
                    owner: owner.toLowerCase(),
                    price: ethers.utils.formatEther(price),
                    likes: parseInt(likes._hex),
                    imageURL,
                    ownerHistory,
                    isAuction,
                    ended,
                });

                setTime(Math.max(parseInt(ended.toString()) - Math.floor(Date.now() / 1000), 0));
            } catch (error) {
                console.error("Error fetching NFT:", error);
            }
        };

        fetchNFT();
    }, [nftId]);

    useEffect(() => {
        if (time > 0) {
            const ok = setTimeout(() => {
                setTime(time - 1);
            }, 1000)

            return () => {
                clearTimeout(ok);
            }
        }
    }, [time]);

    const handleBuyNow = async () => {
        try {
            if (!window.ethereum) {
                console.error('MetaMask not detected');
                return;
            }
            await window.ethereum.request({ method: 'eth_requestAccounts' });

            const provider = new ethers.providers.Web3Provider(window.ethereum);
            const signer = provider.getSigner();
            const userAddress = await signer.getAddress();
            const contractNFT = new ethers.Contract(CONTRACT_ADDRESS_NFT, newNFT.abi, signer);
            const contractLTP = new ethers.Contract(CONTRACT_ADDRESS_LTP, LTPCoin.abi, signer);

            // Fetch LTP balance of the user
            const userLTPBalance = await contractLTP.balanceOf(userAddress);
            const nftPriceInLTP = ethers.utils.parseEther(nft.price); // Convert NFT price to LTP

            // Check if user has enough LTP to buy the NFT
            if (userLTPBalance.lt(nftPriceInLTP)) {
                alert("Insufficient LTP balance. Please acquire more LTP to complete this transaction.");
                return;
            }

            // Show in-progress modal
            setShowInProgressModal(true);

            // Perform transferLTP and transferNFT transactions
            const txLTP = await contractLTP.transferLTP(nft.owner, nftPriceInLTP);
            await txLTP.wait(); // Wait for LTP transfer to be mined

            const txNFT = await contractNFT.transferNFT(nftId, userAddress);
            await txNFT.wait(); // Wait for NFT transfer to be mined

            // Close in-progress modal after successful transactions
            setShowInProgressModal(false);

            // Display success message and navigate back after 2 seconds
            alert("NFT purchase successful!");
            setTimeout(() => {
                navigate('/mynft');
            }, 2000);
        } catch (error) {
            console.error("Error buying NFT:", error);
        }
    };

    return (
        <Container>
            <h2>English Auction</h2>
            {
                winner &&
                <div style={{ color: "white", display: "flex", gap: '4', alignItems: 'center', width: '100%' }}><span>Highest bidder:</span> {winner[1]}
                    {
                        winner[0] == 2 && walletAddress === winner[1] ?
                            <Button onClick={handleBuyNow}>Confirm NFT</Button> :
                            null
                    }
                </div>
            }
            <div style={{ color: 'white' }}>{time === 0 ? "Auction ended!" : `${time}s left`}</div>
            <Form onSubmit={handleConfirmBid}>
                <Form.Group controlId="bidAmount">
                    <Form.Label>Enter your bid amount</Form.Label>
                    <Form.Control
                        type="number"
                        placeholder="Enter bid amount"
                        value={bidAmount}
                        onChange={handleBidChange}
                    />
                </Form.Group>
                <Button variant="primary" type='submit'>
                    Confirm Bid
                </Button>
            </Form>

            {error && <Alert variant="danger" className="mt-3">{error}</Alert>}
            {currentBid !== null && (
                <div className="mt-3">
                    <h4>Current Bid: ${currentBid.toFixed(2)}</h4>
                </div>
            )}
        </Container>
    );
};

export default EnglishAuction;
