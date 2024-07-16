import React, { useState, useEffect, useMemo, useCallback, useContext } from 'react';
import { ethers } from 'ethers';
import { Container, Row, Col, Button, Modal, Spinner, Image } from 'react-bootstrap';
import { Heart } from 'react-bootstrap-icons';
import { Link } from 'react-router-dom';
import { WalletContext } from '../context/WalletContext';
import newNFT from '../contract-api/newNFT.json'; // Adjust path if necessary
import addressContract from '../contract-api/addressContract'; // Adjust path if necessary
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

  const initContract = useCallback(async () => {
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(addressContract, newNFT.abi, signer);

      const allTokenIds = await contract.getAllTokenIds();
      const nftDetails = await Promise.all(
        allTokenIds.map(async (tokenId) => {
          try {
            const [name, description, creator, ownerHex, price, likesHex, imageUrl] = await contract.getNFTInfo(tokenId);
            const owner = ethers.utils.getAddress(ownerHex);
            const likes = parseInt(likesHex._hex);

            return { tokenId, name, description, creator, owner, price, likes, imageUrl };
          } catch (error) {
            console.error(`Error fetching details for tokenId ${tokenId}:`, error);
            return { tokenId, name: 'N/A', description: 'N/A', creator: 'N/A', owner: 'N/A', price: ethers.BigNumber.from(0), likes: 0, imageUrl: '' };
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
      const contract = new ethers.Contract(addressContract, newNFT.abi, signer);

      await contract.deleteNFT(deleteNFTId);

      // Xóa NFT thành công, cập nhật state và hiển thị thông báo thành công
      setNfts(nfts.filter(nft => nft.tokenId !== deleteNFTId));
      setDeleteSuccess(true);

      // Đợi 2 giây trước khi đóng modal và reset trạng thái
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

  return (
    <Container className="home-container">
      <div className="homeContainer">
        <div className="hero">
          <h1 className="title">Your NFT</h1>
          <h2 className="subtitle">Set up your NFT as you wish.</h2>
        </div>

        <Row xs={1} md={4} className="g-4">
          {loading && <p>Loading NFTs...</p>}
          {error && <p className="text-danger">{error}</p>}
          {!loading && !error && filteredNFTs.map((nft, index) => (
            <Col key={nft.tokenId}>
              <div className="nftCard">
                <img src={nft.imageUrl} alt={nft.name} className="nftImage" />
                <div className="nftInfo">
                  <div className="nftDetails1">
                    <p className="nftTitle">{nft.name}</p>
                    <p className="nftAuthor">Creator: {formatAddress(nft.creator)}</p>
                    <p className="nftAuthor">Owner: {formatAddress(nft.owner)}</p>
                    <Link to={`/details-nft/${nft.tokenId}`}>
                      <Button className="editButton">
                        Edit NFT
                      </Button>
                    </Link>
                    <Button variant="danger" className="deleteButton" onClick={() => handleShowConfirmDeleteModal(nft.tokenId, nft.imageUrl)}>
                      Delete NFT
                    </Button>
                  </div>
                  <div className="nftDetails2">
                    <p className="nftPrice">{ethers.utils.formatEther(nft.price)} LTP</p>
                    <div className="likeContainer">
                      <Heart className="heartIcon" />
                      <span className="likeCount">{nft.likes}</span>
                    </div>
                  </div>
                </div>
              </div>
              <Modal show={showConfirmDeleteModal} onHide={handleCloseConfirmDeleteModal} centered>
                <Modal.Body className="text-center custom-modal-body">
                  <Image src={deleteNFTImageUrl} alt="NFT Image" fluid className="mb-3" />
                  {deleteInProgress ? (
                    <>
                      <Spinner animation="border" role="status" />
                      <p className="mt-2">In processing...</p>
                    </>
                  ) : deleteSuccess ? (
                    <p>Successfully deleted NFT!</p>
                  ) : (
                    <>
                      <p>Are you sure you want to delete this NFT?</p>
                      <Button variant="secondary" onClick={handleCloseConfirmDeleteModal}>
                        Cancel
                      </Button>
                      <Button variant="danger" onClick={handleDeleteNFT}>
                        Confirm Delete
                      </Button>
                    </>
                  )}
                </Modal.Body>
              </Modal>
            </Col>
          ))}
        </Row>
      </div>
    </Container>
  );
};

export default MyNFT;
