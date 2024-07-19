import { useState, useEffect, useMemo, useCallback } from 'react';
import { ethers } from 'ethers';
import { Container, Row, Col, Button, Alert } from 'react-bootstrap';
import { Heart } from 'react-bootstrap-icons';
import { Link, useNavigate } from 'react-router-dom'; // Import useNavigate
import '../styles/Home.css';
import newNFT from '../contract-api/newNFT.json';
import addressContractNFT from '../contract-api/addressContractNFT';

const Home = () => {
  const [nfts, setNfts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedFileType, setSelectedFileType] = useState('');
  const [selectedPriceRange, setSelectedPriceRange] = useState('');
  const [hoveredNFT, setHoveredNFT] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAlert, setShowAlert] = useState(false); // State for alert visibility

  const navigate = useNavigate(); // Hook to programmatically navigate

  const initContract = useCallback(async () => {
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(addressContractNFT, newNFT.abi, signer);

      const allTokenIds = await contract.getAllTokenIds();
      const nftDetails = await Promise.all(
        allTokenIds.map(async (tokenId) => {
          try {
            // Update here to match your request
            const [name, description, creator, ownerHex, price, likesHex, imageUrl, historyOwner, isAuction] = await contract.getNFTInfo(tokenId);
            const owner = ethers.utils.getAddress(ownerHex);
            const likes = parseInt(likesHex._hex);

            return { tokenId, name, description, creator, owner, price, likes, imageUrl, historyOwner, isAuction };
          } catch (error) {
            console.error(`Error fetching details for tokenId ${tokenId}:`, error);
            return { tokenId, name: 'N/A', description: 'N/A', creator: 'N/A', owner: 'N/A', price: ethers.BigNumber.from(0), likes: 0, imageUrl: '', historyOwner: [], isAuction: false };
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

      return matchesSearch && matchesCategory && matchesFileType && matchesPriceRange;
    });
  }, [nfts, searchTerm, selectedCategory, selectedFileType, selectedPriceRange]);

  const handleMouseEnter = useCallback((tokenId) => {
    setHoveredNFT(tokenId);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setHoveredNFT(null);
  }, []);

  const handleBuyNow = useCallback((nft) => {
    console.log(`Buying NFT: ${nft.name}`);
  }, []);

  const handleCreateClick = () => {
    const realAddress = localStorage.getItem('realAddress');
    if (!realAddress) {
      setShowAlert(true);
      setTimeout(() => setShowAlert(false), 3000); // Hide alert after 3 seconds
    } else {
      window.location.href = '/mint-nft'; // Redirect to mint-nft page if realAddress exists
    }
  };

  const handleNFTClick = async (nft) => {
    try {
      console.log(`Fetching NFT info for tokenId ${nft.tokenId}`);

      // Fetch the NFT info from the smart contract
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(addressContractNFT, newNFT.abi, signer);

      // Update here to match your request
      const [name, description, creator, ownerHex, price, likesHex, imageUrl, historyOwner, isAuction] = await contract.getNFTInfo(nft.tokenId);
      const owner = ethers.utils.getAddress(ownerHex);
      const likes = parseInt(likesHex._hex);

      console.log(`NFT Auction Status for tokenId ${nft.tokenId}: ${isAuction}`);

      // Navigate to the appropriate page based on auction status
      if (isAuction) {
        navigate(`/auction/english/${nft.tokenId}`);
      } else {
        navigate(`/details-nft/${nft.tokenId}`);
      }
    } catch (error) {
      console.error(`Error handling NFT click for tokenId ${nft.tokenId}:`, error);
    }
  };

  return (
    <Container className="home-container">
      {showAlert && <Alert variant="danger">Please log in and connect your MetaMask wallet.</Alert>}
      <div className="homeContainer">
        <div className="hero">
          <p className="ltp">LTP</p>
          <h1 className="title">NFT MARKETPLACE</h1>
          <h2 className="subtitle">Where Masterpieces become digital</h2>
          <div className="heroButtons">
            <Link to="/explore">
              <Button variant="primary" className="exploreButton">Explore</Button>
            </Link>
            <Button variant="outline-light" className="createButton" onClick={handleCreateClick}>Create</Button>
          </div>
        </div>

        <h3 className="whatsNew">What is new?</h3>
        {!showAlert &&
          <Row className="g-4">
            {loading && <p>Loading NFTs...</p>}
            {error && <p className="text-danger">{error}</p>}
            {!loading && !error && filteredNFTs.map((nft, index) => (
              <Col key={nft.tokenId} xs={12} sm={6} md={3} className={`g-4 ${index >= 4 ? 'mt-4' : ''}`}>
                <div
                  className={`nftCard ${hoveredNFT === nft.tokenId ? 'hovered' : ''}`}
                  onMouseEnter={() => handleMouseEnter(nft.tokenId)}
                  onMouseLeave={handleMouseLeave}
                  onClick={() => handleNFTClick(nft)} // Handle click event
                >
                  <img src={nft.imageUrl} alt={nft.name} className="nftImage" />
                  {hoveredNFT === nft.tokenId && (
                    <div className="nftInfo">
                      <div className="nftDetails1">
                        <p className="nftTitle">{nft.name}</p>
                        <p className="nftAuthor">Creator: {formatAddress(nft.creator)}</p>
                        <p className="nftAuthor">Owner: {formatAddress(nft.owner)}</p>
                        <Button className="buyButton" onClick={() => handleBuyNow(nft)}>
                          {nft.isAuction ? 'Bidding now' : 'Buy now'}
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
                  )}
                </div>
              </Col>
            ))}
          </Row>
        }
      </div>
    </Container>
  );
};

export default Home;
