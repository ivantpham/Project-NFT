import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ethers } from 'ethers';
import newNFT from '../contract-api/newNFT.json';
import LTPCoin from '../contract-api/LTPCoin.json';
import { Heart } from 'react-bootstrap-icons';
import { Button, Container, Row, Col, Card, Modal, Form } from 'react-bootstrap';
import '../styles/DetailsNFT.css'; // Importing Less file for styling
import addressContractNFT from '../contract-api/addressContractNFT';
import addressContractLTPCoin from '../contract-api/addressContractLTPCoin';

const CONTRACT_ADDRESS_NFT = addressContractNFT;
const CONTRACT_ADDRESS_LTP = addressContractLTPCoin;

const truncateAddress = (address) => {
  return `${address.slice(0, 7)}...${address.slice(-5)}`;
};

const DetailsNFT = () => {
  const { nftId } = useParams();
  const [nft, setNft] = useState(null);
  const [userAddress, setUserAddress] = useState(null);
  const [showInProgressModal, setShowInProgressModal] = useState(false); // State for in-progress modal
  const [showEditModal, setShowEditModal] = useState(false); // State for edit modal
  const navigate = useNavigate();

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
        const [name, description, creator, owner, price, likes, imageURL, ownerHistory] = await contract.getNFTInfo(nftId);

        setNft({
          name,
          description,
          creator: truncateAddress(creator),
          owner: owner.toLowerCase(),
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
      const userAddress = await signer.getAddress();
      const contract = new ethers.Contract(CONTRACT_ADDRESS_NFT, newNFT.abi, signer);

      const owner = await contract.ownerOf(nftId);
      if (userAddress.toLowerCase() === nft.owner.toLowerCase()) {
        alert("You cannot like your own NFT");
        return;
      }

      // Show in-progress modal
      setShowInProgressModal(true);

      // Send the like transaction
      const tx = await contract.likeNFT(nftId);
      await tx.wait(); // Wait for transaction to be mined

      // Close in-progress modal after successful like
      setShowInProgressModal(false);

      // Update likes count locally
      setNft(prevNft => ({
        ...prevNft,
        likes: prevNft.likes + 1
      }));
    } catch (error) {
      console.error("Error liking NFT:", error);
    }
  };

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
        navigate(-1);
      }, 2000);
    } catch (error) {
      console.error("Error buying NFT:", error);
    }
  };

  const handleEditNFT = () => {
    // Show edit modal
    setShowEditModal(true);
  };

  const handleSaveChanges = async (formData) => {
    try {
      if (!window.ethereum) {
        console.error('MetaMask not detected');
        return;
      }
      await window.ethereum.request({ method: 'eth_requestAccounts' });

      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(CONTRACT_ADDRESS_NFT, newNFT.abi, signer);

      // Call editNFT function
      const tx = await contract.editNFT(nftId, formData.name, formData.description, ethers.utils.parseEther(formData.price));
      await tx.wait(); // Wait for transaction to be mined

      // Close edit modal after successful edit
      setShowEditModal(false);

      // Update local state with edited NFT data
      setNft(prevNft => ({
        ...prevNft,
        name: formData.name,
        description: formData.description,
        price: formData.price
      }));
    } catch (error) {
      console.error("Error editing NFT:", error);
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

  // Trước hàm return của DetailsNFT
  const realAddress = localStorage.getItem('realAddress');
  const email = localStorage.getItem('email');

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
              <p className="nftOwner">Owner: {truncateAddress(nft.owner)}</p>
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
                {realAddress && (
                  <Button onClick={() => handleLikeNFT()} className="likeButton">Like this NFT</Button>
                )}
              </div>
            </div>
            <div className="nftDescription">
              <h3>Description</h3>
              <p>{nft.description}</p>
            </div>
            <Row className="mt-3 justify-content-center">
              {realAddress && userAddress && userAddress === nft.owner && (
                <Col md={4} className="editNFTButton">
                  <Button onClick={handleEditNFT} variant="primary">Edit NFT</Button>
                </Col>
              )}
              {realAddress && userAddress && userAddress !== nft.owner && (
                <Col md={4} className="buyNFTButton">
                  <Button onClick={handleBuyNow} variant="success">Buy Now</Button>
                </Col>
              )}
            </Row>
          </div>
        </Col>
      </Row>

      {/* In-progress modal */}
      <Modal show={showInProgressModal} onHide={() => setShowInProgressModal(false)} centered>
        <Modal.Body className="text-center">
          <h4>Transaction in Progress</h4>
          <p>Please wait while the transaction is being processed...</p>
        </Modal.Body>
      </Modal>

      {/* Edit modal */}
      <Modal show={showEditModal} onHide={() => setShowEditModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Edit NFT</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSaveChanges}>
            <Form.Group className="mb-3">
              <Form.Label>Name</Form.Label>
              <Form.Control type="text" name="name" defaultValue={nft.name} required />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control as="textarea" name="description" defaultValue={nft.description} rows={3} required />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Price (LTP)</Form.Label>
              <Form.Control type="text" name="price" defaultValue={nft.price} required />
            </Form.Group>
            <Button variant="primary" type="submit">Save Changes</Button>
          </Form>
        </Modal.Body>
      </Modal>
    </Container>
  );
};

export default DetailsNFT;
