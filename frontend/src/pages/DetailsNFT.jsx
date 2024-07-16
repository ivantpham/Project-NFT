import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ethers } from 'ethers';
import newNFT from '../contract-api/newNFT.json';
import { Heart } from 'react-bootstrap-icons';
import { Button, Container, Row, Col, Card } from 'react-bootstrap';
import '../styles/DetailsNFT.css';
import addressContract from '../contract-api/addressContract';

const CONTRACT_ADDRESS = addressContract;

const truncateAddress = (address) => {
  return `${address.slice(0, 7)}...${address.slice(-5)}`;
};

const DetailsNFT = () => {
  const { nftId } = useParams();
  const [nft, setNft] = useState(null);

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
        const contract = new ethers.Contract(CONTRACT_ADDRESS, newNFT.abi, signer);

        const [name, description, creator, owner, price, likes, imageURL, ownerHistory] = await contract.getNFTInfo(nftId);

        setNft({
          name,
          description,
          creator: truncateAddress(creator),
          owner: truncateAddress(owner.toLowerCase()),
          price: ethers.utils.formatEther(price),
          likes: parseInt(likes._hex),
          imageURL,
          ownerHistory
        });
      } catch (error) {
        console.error("Error fetching NFT:", error);
      }
    };

    fetchNFT();
  }, [nftId]);

  const handleLikeNFT = async () => {
    try {
      if (!window.ethereum) {
        console.error('MetaMask not detected');
        return;
      }
      await window.ethereum.request({ method: 'eth_requestAccounts' });

      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, newNFT.abi, signer);

      const owner = await contract.ownerOf(nftId);
      if (owner.toLowerCase() === nft.owner.toLowerCase()) {
        alert("You cannot like your own NFT");
        return;
      }

      await contract.likeNFT(nftId);
      setNft(prevNft => ({
        ...prevNft,
        likes: prevNft.likes + 1
      }));
    } catch (error) {
      console.error("Error liking NFT:", error);
    }
  };

  if (!nft) {
    return (
      <Container className="mt-5">
        <div className="errorContainer">
          <h2>NFT not found.</h2>
          <p>The NFT you are looking for does not exist.</p>
          <Link to="/explore" className="btn btn-primary">Go back to Explore</Link>
        </div>
      </Container>
    );
  }

  return (
    <Container className="detailsNFTContainer mt-5">
      <Row className="align-items-center">
        <Col md={6}>
          <Card.Img src={nft.imageURL} alt={nft.name} className="nftImage" />
        </Col>
        <Col md={6}>
          <div className="detailsContent">
            <div className="nftInfo">
              <h2 className="nftTitle">{nft.name}</h2>
              <h2 className="nftLTP">{nft.price} LTP</h2>
            </div>
            <div className="nftDetails1">
              <p className="nftAuthor">Author: {nft.creator}</p>
              <p className="nftOwner">Owner: {nft.owner}</p>
              <div className="ownerHistory">
                <h3>Owner History</h3>
                <ul>
                  {nft.ownerHistory.map((address, index) => (
                    <li key={index}>{truncateAddress(address)}</li>
                  ))}
                </ul>
              </div>
              <div className="likeContainer">
                <Heart className="heartIcon" />
                <span className="likeCount">{nft.likes}</span>
                <Button onClick={() => handleLikeNFT()} className="likeButton">Like this NFT</Button>
              </div>
            </div>
            <div className="nftDescription">
              <h3>Description</h3>
              <p>{nft.description}</p>
            </div>
            <Button className="buyButton" onClick={() => handleBuyNow(nft)}>Buy now</Button>
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default DetailsNFT;
