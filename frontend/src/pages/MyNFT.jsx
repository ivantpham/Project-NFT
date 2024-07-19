import React, { useState, useEffect, useMemo, useCallback, useContext } from 'react';
import { ethers } from 'ethers';
import { Container, Row, Col, Button, Modal, Spinner, Image } from 'react-bootstrap';
import { Heart } from 'react-bootstrap-icons';
import { Link } from 'react-router-dom';
import { WalletContext } from '../context/WalletContext';
import newNFT from '../contract-api/newNFT.json'; // Adjust path if necessary
import addressContractNFT from '../contract-api/addressContractNFT'; // Adjust path if necessary
import '../styles/MyNFT.css';

const MyNFT = () => {
  const { walletAddress } = useContext(WalletContext);

  const [nfts, setNfts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedFileType, setSelectedFileType] = useState('');
  const [selectedPriceRange, setSelectedPriceRange] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showConfirmDeleteModal, setShowConfirmDeleteModal] = useState(false);
  const [deleteInProgress, setDeleteInProgress] = useState(false);
  const [deleteNFTId, setDeleteNFTId] = useState(null);
  const [deleteNFTImageUrl, setDeleteNFTImageUrl] = useState('');
  const [deleteSuccess, setDeleteSuccess] = useState(false);

  // Added state for auction/buy confirmation
  const [showConfirmActionModal, setShowConfirmActionModal] = useState(false);
  const [actionType, setActionType] = useState('');
  const [actionNFTId, setActionNFTId] = useState(null);
  const [auctionDuration, setAuctionDuration] = useState(0); // Auction duration in seconds
  const [countdown, setCountdown] = useState(null); // State for countdown
  const [intervalId, setIntervalId] = useState(null); // Store interval ID for cleanup

  useEffect(() => {
    // Cleanup on component unmount
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [intervalId]);

  const initContract = useCallback(async () => {
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(addressContractNFT, newNFT.abi, signer);

      const allTokenIds = await contract.getAllTokenIds();
      const nftDetails = await Promise.all(
        allTokenIds.map(async (tokenId) => {
          try {
            const [name, description, creator, ownerHex, price, likesHex, imageUrl, historyOwner, isAuction, endTime] = await contract.getNFTInfo(tokenId);
            const owner = ethers.utils.getAddress(ownerHex);
            const likes = parseInt(likesHex._hex);

            return { tokenId, name, description, creator, owner, price, likes, imageUrl, historyOwner, isAuction, endTime };
          } catch (error) {
            console.error(`Error fetching details for tokenId ${tokenId}:`, error);
            return { tokenId, name: 'N/A', description: 'N/A', creator: 'N/A', owner: 'N/A', price: ethers.BigNumber.from(0), likes: 0, imageUrl: '', auctionStatus: false };
          }
        })
      );

      const filteredNfts = nftDetails.filter(nft => nft.creator !== '0x0000000000000000000000000000000000000000');
      setNfts(filteredNfts);
    } catch (error) {
      console.error('Error fetching NFTs:', error);
      setError('An error occurred while fetching NFTs. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (window.ethereum) {
      initContract();
    } else {
      console.warn('MetaMask not detected');
      setError('MetaMask not detected. Please install MetaMask and refresh the page.');
      setLoading(false);
    }
  }, [initContract]);

  const formatAddress = (address) => {
    if (!address) return '';
    return `${address.slice(0, 7)}...${address.slice(-5)}`;
  };

  const categories = useMemo(() => [...new Set(nfts.map(nft => nft.category))], [nfts]);
  const filetypes = useMemo(() => [...new Set(nfts.map(nft => nft.filetype))], [nfts]);
  const priceRanges = useMemo(() => ['1-5', '6-10', '11-15', '16-20', '>20'], []);

  const filteredNFTs = useMemo(() => {
    const lowerSearchTerm = searchTerm.toLowerCase();
    return nfts.filter(nft => {
      const matchesSearch = nft.name.toLowerCase().includes(lowerSearchTerm);
      const matchesCategory = !selectedCategory || nft.category === selectedCategory;
      const matchesFileType = !selectedFileType || nft.filetype === selectedFileType;

      const matchesPriceRange = !selectedPriceRange || (
        selectedPriceRange === '1-5' && nft.price >= 1 && nft.price <= 5 ||
        selectedPriceRange === '6-10' && nft.price >= 6 && nft.price <= 10 ||
        selectedPriceRange === '11-15' && nft.price >= 11 && nft.price <= 15 ||
        selectedPriceRange === '16-20' && nft.price >= 16 && nft.price <= 20 ||
        selectedPriceRange === '>20' && nft.price > 20
      );

      const isOwner = walletAddress.toLowerCase() === nft.owner.toLowerCase();

      return matchesSearch && matchesCategory && matchesFileType && matchesPriceRange && isOwner;
    });
  }, [nfts, searchTerm, selectedCategory, selectedFileType, selectedPriceRange, walletAddress]);

  const handleDeleteNFT = useCallback(async () => {
    try {
      setDeleteInProgress(true);
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(addressContractNFT, newNFT.abi, signer);

      await contract.deleteNFT(deleteNFTId);

      setNfts(nfts.filter(nft => nft.tokenId !== deleteNFTId));
      setDeleteSuccess(true);

      setTimeout(() => {
        setShowConfirmDeleteModal(false);
        setDeleteSuccess(false);
      }, 2000);
    } catch (error) {
      console.error('Error deleting NFT:', error);
    } finally {
      setDeleteInProgress(false);
    }
  }, [deleteNFTId, nfts]);

  const handleCloseConfirmDeleteModal = useCallback(() => {
    setShowConfirmDeleteModal(false);
  }, []);

  const handleShowConfirmDeleteModal = useCallback((nftId, imageUrl) => {
    setDeleteNFTId(nftId);
    setDeleteNFTImageUrl(imageUrl);
    setShowConfirmDeleteModal(true);
  }, []);

  const handleCloseConfirmActionModal = useCallback(() => {
    setShowConfirmActionModal(false);
  }, []);

  const handleShowConfirmActionModal = useCallback((nftId, action) => {
    setActionType(action);
    setActionNFTId(nftId);
    setShowConfirmActionModal(true);
  }, []);

  const handleAuctionOrBuy = useCallback(async () => {
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(addressContractNFT, newNFT.abi, signer);

      const nftInfo = await contract.getNFTInfo(actionNFTId);
      const auction = nftInfo[8];

      if (actionType === 'Auction') {
        if (!auction) {
          if (auctionDuration > 0) {
            startCountdown(auctionDuration);
            await contract.setAuction(actionNFTId, auctionDuration);
            alert('NFT is now set to auction.');
          } else {
            alert('Please enter a valid duration.');
          }
        } else {
          alert('NFT is already set to auction.');
        }
      } else if (actionType === 'Buy') {
        if (auction) {
          await contract.setAuction(actionNFTId, 0);
          alert('NFT is now set to buy.');
        } else {
          alert('NFT is already set to buy.');
        }
      }

      window.location.reload();
    } catch (error) {
      console.error('Error updating NFT auction status:', error);
      alert('An error occurred while updating the NFT status.');
    } finally {
      handleCloseConfirmActionModal();
    }
  }, [actionNFTId, actionType, auctionDuration, handleCloseConfirmActionModal]);

  const startCountdown = (duration) => {
    const endTime = Date.now() + duration * 1000;
    const id = setInterval(() => {
      const timeLeft = Math.max(0, Math.ceil((endTime - Date.now()) / 1000));
      if (timeLeft <= 0) {
        clearInterval(id);
        alert('Auction time has ended!');
      }
      setCountdown(timeLeft);
    }, 1000);
    setIntervalId(id);
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}m ${secs}s`;
  };

  return (
    <Container className="home-container">
      <div className="homeContainer">
        <div className="hero">
          <h1 className="title">Your NFT</h1>
          <h2 className="subtitle">Set up your NFT as you wish.</h2>
        </div>
        <Row xs={1} md={3} className="g-4">
          {loading && <Spinner animation="border" />}
          {error && <p className="text-danger">{error}</p>}
          {!loading && !error && filteredNFTs.map((nft) => (
            <Col key={nft.tokenId}>
              <div className="nftCard">
                <Image src={nft.imageUrl} alt={nft.name} className="nftImage" />
                <div className="nftInfo">
                  <div className="nftDetails1">
                    <p className="nftTitle">{nft.name}</p>
                    <p className="nftAuthor">Creator: {formatAddress(nft.creator)}</p>
                    <p className="nftAuthor">Owner: {formatAddress(nft.owner)}</p>
                    <Link to={`/details-nft/${nft.tokenId}`}>
                      <Button className="editButton">Edit</Button>
                    </Link>
                  </div>
                  <div className="nftDetails2">
                    <p className="nftPrice">Price: {ethers.utils.formatEther(nft.price)} ETH</p>
                    <p className="nftLikes">Likes: {nft.likes}</p>
                  </div>
                  <div className="nftActions">
                    <Button onClick={() => handleShowConfirmActionModal(nft.tokenId, 'Auction')} variant="primary">
                      Set Auction
                    </Button>
                    <Button onClick={() => handleShowConfirmActionModal(nft.tokenId, 'Buy')} variant="success">
                      Set Buy
                    </Button>
                    <Button onClick={() => handleShowConfirmDeleteModal(nft.tokenId, nft.imageUrl)} variant="danger">
                      Delete
                    </Button>
                  </div>
                </div>
              </div>
            </Col>
          ))}
        </Row>
        {countdown !== null && <div className="countdown">Time left: {formatTime(countdown)}</div>}
        {/* Confirmation Modal */}
        <Modal show={showConfirmActionModal} onHide={handleCloseConfirmActionModal}>
          <Modal.Header closeButton>
            <Modal.Title>Confirm Action</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <p>Are you sure you want to set this NFT to {actionType}?</p>
            {actionType === 'Auction' && (
              <div>
                <label htmlFor="auctionDuration">Auction Duration (seconds):</label>
                <input
                  type="number"
                  id="auctionDuration"
                  value={auctionDuration}
                  onChange={(e) => setAuctionDuration(parseInt(e.target.value, 10))}
                />
              </div>
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleCloseConfirmActionModal}>
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleAuctionOrBuy}
            >
              Confirm
            </Button>
          </Modal.Footer>
        </Modal>
        {/* Confirmation Modal for Deletion */}
        <Modal show={showConfirmDeleteModal} onHide={handleCloseConfirmDeleteModal}>
          <Modal.Header closeButton>
            <Modal.Title>Confirm Deletion</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <p>Are you sure you want to delete this NFT?</p>
            <img src={deleteNFTImageUrl} alt="NFT" style={{ width: '100%' }} />
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleCloseConfirmDeleteModal}>
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={handleDeleteNFT}
              disabled={deleteInProgress}
            >
              {deleteInProgress ? <Spinner as="span" animation="border" size="sm" /> : 'Delete'}
            </Button>
          </Modal.Footer>
        </Modal>
      </div>
    </Container>
  );
};

export default MyNFT;
