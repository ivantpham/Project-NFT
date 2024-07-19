import { useState, useEffect, useMemo, useCallback } from 'react';
import { ethers } from 'ethers';
import { Container, Row, Col, Form, Dropdown, Button } from 'react-bootstrap';
import { Search, Heart } from 'react-bootstrap-icons';
import { Link } from 'react-router-dom';
import '../styles/Explore.css';
import newNFT from '../contract-api/newNFT.json';
import addressContractNFT from '../contract-api/addressContractNFT';

const Explore = () => {
  const [nfts, setNfts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedFileType, setSelectedFileType] = useState('');
  const [selectedPriceRange, setSelectedPriceRange] = useState('');
  const [hoveredNFT, setHoveredNFT] = useState(null);
  const [hoveredNFTDetails, setHoveredNFTDetails] = useState(null); // New state for hovered NFT details
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const initContract = useCallback(async () => {
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(addressContractNFT, newNFT.abi, signer);

      const allTokenIds = await contract.getAllTokenIds();
      const nftDetails = await Promise.all(
        allTokenIds.map(async (tokenId) => {
          try {
            const [name, description, creator, ownerHex, price, likesHex, imageUrl, historyOwner, isAuction] = await contract.getNFTInfo(tokenId);
            const owner = ethers.utils.getAddress(ownerHex);
            const likes = parseInt(likesHex._hex);

            return { tokenId, name, description, creator, owner, price, likes, imageUrl, historyOwner, isAuction };
          } catch (error) {
            console.error(`Error fetching details for tokenId ${tokenId}:`, error);
            return { tokenId, name: 'N/A', description: 'N/A', creator: 'N/A', owner: 'N/A', price: parseInt(price.toString()), likes: 0, imageUrl: '', historyOwner: [], isAuction: false };
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

  const handleMouseEnter = useCallback(async (tokenId) => {
    setHoveredNFT(tokenId);
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(addressContractNFT, newNFT.abi, signer);
      const [, , , , , , , , isAuction] = await contract.getNFTInfo(tokenId);
      setHoveredNFTDetails({ tokenId, isAuction });
    } catch (error) {
      console.error(`Error fetching details for tokenId ${tokenId}:`, error);
      setHoveredNFTDetails(null);
    }
  }, []);

  const handleMouseLeave = useCallback(() => {
    setHoveredNFT(null);
    setHoveredNFTDetails(null);
  }, []);

  const handleBuyNow = useCallback((nft) => {
    console.log(`Buying NFT: ${nft.name}`);
  }, []);

  return (
    <div className="explore">
      <div className="exploreContainer">
        <Container>
          <Row className="mb-4 searchFilterContainer">
            <Col md={7}>
              <div className="searchBar">
                <Form.Control
                  type="text"
                  placeholder="Find anything..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <Search size={20} className="searchIcon" />
              </div>
            </Col>
            <Col md={3} className="filterButtonsContainer">
              <Dropdown className="dropdown">
                <Dropdown.Toggle variant="outline-light" id="category-dropdown">
                  {selectedCategory || 'Category'}
                </Dropdown.Toggle>
                <Dropdown.Menu className="dropdown-menu">
                  <Dropdown.Item onClick={() => setSelectedCategory('')}>All Categories</Dropdown.Item>
                  {categories.map(category => (
                    <Dropdown.Item key={category} onClick={() => setSelectedCategory(category)}>
                      {category}
                    </Dropdown.Item>
                  ))}
                </Dropdown.Menu>
              </Dropdown>
              <Dropdown className="dropdown">
                <Dropdown.Toggle variant="outline-light" id="filetype-dropdown">
                  {selectedFileType || 'File Type'}
                </Dropdown.Toggle>
                <Dropdown.Menu className="dropdown-menu">
                  <Dropdown.Item onClick={() => setSelectedFileType('')}>All File Types</Dropdown.Item>
                  {filetypes.map(filetype => (
                    <Dropdown.Item key={filetype} onClick={() => setSelectedFileType(filetype)}>
                      {filetype}
                    </Dropdown.Item>
                  ))}
                </Dropdown.Menu>
              </Dropdown>
              <Dropdown className="dropdown">
                <Dropdown.Toggle variant="outline-light" id="price-dropdown">
                  {selectedPriceRange || 'Price'}
                </Dropdown.Toggle>
                <Dropdown.Menu className="dropdown-menu">
                  <Dropdown.Item onClick={() => setSelectedPriceRange('')}>All Prices</Dropdown.Item>
                  {priceRanges.map(priceRange => (
                    <Dropdown.Item key={priceRange} onClick={() => setSelectedPriceRange(priceRange)}>
                      {priceRange} LTP
                    </Dropdown.Item>
                  ))}
                </Dropdown.Menu>
              </Dropdown>
            </Col>
          </Row>

          <Row>
            {loading && <p>Loading NFTs...</p>}
            {error && <p className="text-danger">{error}</p>}
            {!loading && !error && filteredNFTs.map((nft, index) => (
              <Col key={nft.tokenId} xs={12} sm={6} md={3} className={`g-4 ${index >= 4 ? 'mt-4' : ''}`}>
                <Link
                  to={nft.isAuction ? `/auction/english/${nft.tokenId}` : `/details-nft/${nft.tokenId}`}
                  className="nftCardLink"
                >
                  <div
                    className={`nftCard ${hoveredNFT === nft.tokenId ? 'hovered' : ''}`}
                    onMouseEnter={() => handleMouseEnter(nft.tokenId)}
                    onMouseLeave={handleMouseLeave}
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
                </Link>
              </Col>
            ))}
          </Row>
        </Container>
      </div>
    </div>
  );
};

export default Explore;
