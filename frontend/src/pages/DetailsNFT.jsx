import { useParams, Link } from 'react-router-dom';
import '../styles/DetailsNFT.css';
import mockdata from '../utils/MockData';
import { Heart } from 'react-bootstrap-icons';
import { Button } from 'react-bootstrap';

const DetailsNFT = () => {
  const { nftId } = useParams();
  const tokenId = parseInt(nftId, 10);
  const nft = mockdata.find(item => item.tokenId === tokenId);

  const handleBuyNow = (nft) => {
    console.log(`Buying NFT: ${nft.name}`);
  };

  if (!nft) {
    return (
      <div className="errorContainer">
        <h2>NFT not found.</h2>
        <p>The NFT you are looking for does not exist.</p>
        <Link to="/explore" className="backButton">Go back to Explore</Link> 
      </div>
    );
  }

  return (
    <div className="detailsNFTContainer">
      <img src={nft.image} alt={nft.name} className="nftImage" />
      <div className="detailsContent">
      <div className="nftInfo">
                    <div className="nftDetails1">
                      <p className="nftTitle">{nft.name}</p>
                      <p className="nftAuthor">Author: {nft.creator}</p>
                      <p className="nftDate">{nft.date}</p>
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
        <div className="nftDescription">
          <h3>Description</h3>
          <p>{nft.description}</p>
        </div>
        <Button className="buyButton" onClick={() => handleBuyNow(nft)}>Buy now</Button>
      </div>
    </div>
  );
};

export default DetailsNFT;
