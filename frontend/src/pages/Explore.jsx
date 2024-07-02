import { useState, useEffect, useMemo, useCallback } from 'react';
import mockdata from '../utils/MockData';
import { Container, Row, Col, Form, Dropdown, Button } from 'react-bootstrap';
import { Search, Heart } from 'react-bootstrap-icons';
import '../styles/Explore.css';
import { Link } from 'react-router-dom';

const Explore = () => {
  const [nfts, setNfts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedFileType, setSelectedFileType] = useState('');
  const [selectedPriceRange, setSelectedPriceRange] = useState('');
  const [hoveredNFT, setHoveredNFT] = useState(null);

  useEffect(() => {
    setNfts(mockdata);
  }, []);

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
                      {priceRange} ETH
                    </Dropdown.Item>
                  ))}
                </Dropdown.Menu>
              </Dropdown>
            </Col>
          </Row>

          <Row>
            {filteredNFTs.map((nft, index) => (
              <Col key={nft.tokenId} xs={12} sm={6} md={3} className={`g-4 ${index >= 4 ? 'mt-4' : ''}`}>
                <Link to={`/details-nft/${nft.tokenId}`} className="nftCardLink">
                  <div
                    className={`nftCard ${hoveredNFT === nft.tokenId ? 'hovered' : ''}`}
                    onMouseEnter={() => handleMouseEnter(nft.tokenId)}
                    onMouseLeave={handleMouseLeave}
                  >
                    <img src={nft.image} alt={nft.name} className="nftImage" />
                    {hoveredNFT === nft.tokenId && (
                    <div className="nftInfo">
                    <div className="nftDetails1">
                      <p className="nftTitle">{nft.name}</p>
                      <p className="nftAuthor">Author: {nft.creator}</p>
                      <p className="nftDate">{nft.date}</p>
                      <Button className="buyButton" onClick={() => handleBuyNow(nft)}>
                        Buy now
                      </Button>
                    </div>
                    <div className="nftDetails2">
                      <p className="nftLTP">{nft.LTP} LTP</p>
                      <p className="nftPrice">{nft.price} USD</p>
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
