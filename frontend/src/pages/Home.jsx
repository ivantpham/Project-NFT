import { useState, useEffect } from 'react';
import mockdata from '../utils/MockData';
import { Container, Row, Col, Button } from 'react-bootstrap';
import '../styles/Home.css';
import { Link } from 'react-router-dom';
import { Heart } from 'react-bootstrap-icons';

const Home = () => {
  const [nfts, setNfts] = useState([]);
  const [hoveredNFT, setHoveredNFT] = useState(null);

  useEffect(() => {
    setNfts(mockdata);
  }, []);

  const handleMouseEnter = (nftId) => {
    setHoveredNFT(nftId);
  };

  const handleMouseLeave = () => {
    setHoveredNFT(null);
  };

  const handleBuyNow = (nft) => {
    console.log(`Buying NFT: ${nft.name}`);
  };

  return (
    <Container className="home-container">
      <div className="homeContainer">
        <div className="hero">
          <p className="ltp">LTP</p>
          <h1 className="title">NFT MARKETPLACE</h1>
          <h2 className="subtitle">Where Masterpieces become digital</h2>
          <div className="heroButtons">
            <Link to="/explore">
              <Button variant="primary" className="exploreButton">Explore</Button>
            </Link>
            <Link to="/mint-nft">
              <Button variant="outline-light" className="createButton">Create</Button>
            </Link>
          </div>
        </div>

        <h3 className="whatsNew">What is new?</h3>
        <Row className="g-4">
          {nfts.map((nft) => (
            <Col key={nft.tokenId} xs={12} sm={6} md={3}>
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
      </div>
    </Container>
  );
};

export default Home;
