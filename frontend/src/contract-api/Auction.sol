// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract MyNFT is ERC721URIStorage, ReentrancyGuard {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIdCounter;

    address public contractCreator;

    struct NFTInfo {
        string name;
        string description;
        address creator;
        address owner;
        uint256 price;
        uint256 likes;
        string imageURL;
        address[] ownerHistory;
    }

    struct Auction {
        address payable seller;
        uint256 startingPrice;
        uint256 highestBid;
        address payable highestBidder;
        bool active;
        uint256 endTime;
    }

    mapping(uint256 => NFTInfo) private _nftInfo;
    mapping(address => uint256[]) private _creatorNFTs;
    mapping(uint256 => mapping(address => bool)) private _likes;
    mapping(uint256 => Auction) private _auctions;

    event NFTMinted(
        uint256 tokenId,
        address creator,
        string name,
        string tokenURI
    );
    event NFTTransferred(uint256 tokenId, address from, address to);
    event NFTLiked(uint256 tokenId, address liker, bool liked);
    event NFTDeleted(uint256 tokenId, address owner);
    event NFTEdited(
        uint256 tokenId,
        address editor,
        string name,
        string description,
        uint256 price
    );
    event AuctionCreated(uint256 tokenId, address seller, uint256 startingPrice, uint256 endTime);
    event BidPlaced(uint256 tokenId, address bidder, uint256 bidAmount);
    event AuctionEnded(uint256 tokenId, address winner, uint256 winningBid);

    constructor() ERC721("MyNFT", "MYNFT") {
        contractCreator = msg.sender;
    }

    function mintNFT(
        string memory _name,
        string memory _tokenURI,
        string memory _description,
        uint256 _price,
        string memory _imageURL
    ) external {
        uint256 tokenId = _tokenIdCounter.current();
        _tokenIdCounter.increment();

        _mint(msg.sender, tokenId);
        _setTokenURI(tokenId, _tokenURI);

        address[] memory ownerHistory = new address[](1);
        ownerHistory[0] = msg.sender;

        _nftInfo[tokenId] = NFTInfo({
            name: _name,
            description: _description,
            creator: msg.sender,
            owner: msg.sender,
            price: _price,
            likes: 0,
            imageURL: _imageURL,
            ownerHistory: ownerHistory
        });

        _creatorNFTs[msg.sender].push(tokenId);

        emit NFTMinted(tokenId, msg.sender, _name, _tokenURI);
    }

    function getNFTInfo(
        uint256 tokenId
    )
        external
        view
        returns (
            string memory,
            string memory,
            address,
            address,
            uint256,
            uint256,
            string memory,
            address[] memory
        )
    {
        require(_tokenIdExists(tokenId), "NFT does not exist");
        NFTInfo memory info = _nftInfo[tokenId];
        return (
            info.name,
            info.description,
            info.creator,
            info.owner,
            info.price,
            info.likes,
            info.imageURL,
            info.ownerHistory
        );
    }

    function getCreatorNFTs(
        address creator
    ) external view returns (uint256[] memory) {
        return _creatorNFTs[creator];
    }

    function getAllTokenIds() external view returns (uint256[] memory) {
        uint256 totalTokens = _tokenIdCounter.current();
        uint256[] memory tokenIds = new uint256[](totalTokens);
        for (uint256 i = 0; i < totalTokens; i++) {
            tokenIds[i] = i;
        }
        return tokenIds;
    }

    function likeNFT(uint256 tokenId) external {
        require(_tokenIdExists(tokenId), "NFT does not exist");
        require(
            msg.sender != ownerOf(tokenId),
            "Owner cannot like their own NFT"
        );

        if (_likes[tokenId][msg.sender]) {
            _nftInfo[tokenId].likes -= 1;
            _likes[tokenId][msg.sender] = false;
            emit NFTLiked(tokenId, msg.sender, false);
        } else {
            _nftInfo[tokenId].likes += 1;
            _likes[tokenId][msg.sender] = true;
            emit NFTLiked(tokenId, msg.sender, true);
        }
    }

    function transferNFT(
        uint256 tokenId,
        address newOwner
    ) external nonReentrant {
        require(_tokenIdExists(tokenId), "NFT does not exist");
        require(newOwner != address(0), "New owner address cannot be zero");

        address currentOwner = ownerOf(tokenId);
        _transfer(currentOwner, newOwner, tokenId);

        _nftInfo[tokenId].owner = newOwner;
        _nftInfo[tokenId].ownerHistory.push(newOwner);

        emit NFTTransferred(tokenId, currentOwner, newOwner);
    }

    function deleteNFT(uint256 tokenId) external {
        require(_tokenIdExists(tokenId), "NFT does not exist");
        require(
            msg.sender == ownerOf(tokenId) &&
                msg.sender == _nftInfo[tokenId].creator,
            "Only the creator and owner can delete the NFT"
        );

        delete _nftInfo[tokenId];

        uint256[] storage creatorNFTs = _creatorNFTs[msg.sender];
        for (uint256 i = 0; i < creatorNFTs.length; i++) {
            if (creatorNFTs[i] == tokenId) {
                creatorNFTs[i] = creatorNFTs[creatorNFTs.length - 1];
                creatorNFTs.pop();
                break;
            }
        }

        _burn(tokenId);

        emit NFTDeleted(tokenId, msg.sender);
    }

    function editNFT(
        uint256 tokenId,
        string memory _name,
        string memory _description,
        uint256 _price
    ) external {
        require(_tokenIdExists(tokenId), "NFT does not exist");
        require(
            msg.sender == ownerOf(tokenId),
            "Only the owner can edit the NFT"
        );

        _nftInfo[tokenId].name = _name;
        _nftInfo[tokenId].description = _description;
        _nftInfo[tokenId].price = _price;

        emit NFTEdited(tokenId, msg.sender, _name, _description, _price);
    }

    function createAuction(uint256 tokenId, uint256 startingPrice, uint256 duration) external {
        require(_tokenIdExists(tokenId), "NFT does not exist");
        require(msg.sender == ownerOf(tokenId), "Only the owner can create an auction");

        _auctions[tokenId] = Auction({
            seller: payable(msg.sender),
            startingPrice: startingPrice,
            highestBid: 0,
            highestBidder: payable(address(0)),
            active: true,
            endTime: block.timestamp + duration
        });

        emit AuctionCreated(tokenId, msg.sender, startingPrice, block.timestamp + duration);
    }

    function placeBid(uint256 tokenId) external payable {
        Auction storage auction = _auctions[tokenId];
        require(auction.active, "Auction is not active");
        require(block.timestamp < auction.endTime, "Auction has ended");
        require(msg.value > auction.highestBid, "Bid must be higher than current highest bid");

        if (auction.highestBid > 0) {
            auction.highestBidder.transfer(auction.highestBid); // Refund the previous highest bidder
        }

        auction.highestBid = msg.value;
        auction.highestBidder = payable(msg.sender);

        emit BidPlaced(tokenId, msg.sender, msg.value);
    }

    function endAuction(uint256 tokenId) external nonReentrant {
        Auction storage auction = _auctions[tokenId];
        require(auction.active, "Auction is not active");
        require(block.timestamp >= auction.endTime, "Auction has not ended yet");
        require(msg.sender == auction.seller, "Only the seller can end the auction");

        auction.active = false;

        if (auction.highestBid > 0) {
            _transfer(auction.seller, auction.highestBidder, tokenId);
            auction.seller.transfer(auction.highestBid);
            _nftInfo[tokenId].owner = auction.highestBidder;
            _nftInfo[tokenId].ownerHistory.push(auction.highestBidder);

            emit AuctionEnded(tokenId, auction.highestBidder, auction.highestBid);
        }
    }

    function _tokenIdExists(uint256 tokenId) internal view returns (bool) {
        return tokenId < _tokenIdCounter.current();
    }
}
