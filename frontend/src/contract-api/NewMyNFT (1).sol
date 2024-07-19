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

    string private WINNER = "Winner";

    struct NFTInfo {
        string name;
        string description;
        address creator;
        address owner;
        uint256 price;
        uint256 likes;
        string imageURL;
        address[] ownerHistory;
        bool auction; // Add auction field to NFTInfo
        uint256 auctionEndTime; // Add auction end time field
        address auctionWinner;
    }

    mapping(uint256 => NFTInfo) private _nftInfo;
    mapping(address => uint256[]) private _creatorNFTs;
    mapping(uint256 => mapping(address => bool)) private _likes;

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
    event AuctionStatusUpdated(
        uint256 tokenId,
        bool auctionStatus,
        uint256 auctionEndTime
    ); // Updated event
    event AuctionEnded(uint256 tokenId, bool auctionStatus); // New event for auction end

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
            ownerHistory: ownerHistory,
            auction: false, // Default auction status to false
            auctionEndTime: 0, // Default auction end time to 0
            auctionWinner: msg.sender
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
            address[] memory,
            bool, // Add auction to return values
            uint256 // Add auction end time to return values
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
            info.ownerHistory,
            info.auction,
            info.auctionEndTime
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
        _nftInfo[tokenId].ownerHistory.push(newOwner); // Add new owner to the history

        // Set auction status to false upon successful transfer
        _nftInfo[tokenId].auction = false;
        _nftInfo[tokenId].auctionEndTime = 0; // Reset auction end time

        emit NFTTransferred(tokenId, currentOwner, newOwner);
        emit AuctionStatusUpdated(tokenId, false, 0); // Emit event for auction status update
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

    function setAuction(uint256 tokenId, uint256 durationInSeconds) external {
        require(_tokenIdExists(tokenId), "NFT does not exist");
        require(
            msg.sender == ownerOf(tokenId),
            "Only the owner can set auction status"
        );

        // Set auction status and end time
        _nftInfo[tokenId].auction = true;
        _nftInfo[tokenId].auctionEndTime = block.timestamp + durationInSeconds;

        emit AuctionStatusUpdated(
            tokenId,
            true,
            _nftInfo[tokenId].auctionEndTime
        ); // Emit event for auction status update
    }

    function bidding(uint256 tokenId, uint256 amount) public {
        require(_tokenIdExists(tokenId), "NFT does not exist");
        require(_nftInfo[tokenId].auction == true, "NFT is not bidding");
        require(_nftInfo[tokenId].auctionEndTime > block.timestamp, "Auction is endded");
        require(_nftInfo[tokenId].price < amount, "Bidding amount must larger than the current price");

        _nftInfo[tokenId].price = amount;
        _nftInfo[tokenId].auctionWinner = msg.sender;
    }

    function checkAndUpdateAuction(uint256 tokenId) external {
        require(_tokenIdExists(tokenId), "NFT does not exist");

        NFTInfo storage info = _nftInfo[tokenId];

        if (info.auction && block.timestamp >= info.auctionEndTime) {
            info.auction = false; // End auction
            info.auctionEndTime = 0; // Reset auction end time

            emit AuctionEnded(tokenId, false); // Emit event for auction end
        }
    }

    function getWinner(uint256 tokenId) public returns (bool, address) {
        if (_nftInfo[tokenId].owner == _nftInfo[tokenId].auctionWinner
        || block.timestamp < _nftInfo[tokenId].auctionEndTime) {
            return (false, _nftInfo[tokenId].auctionWinner);
        }
        if (block.timestamp >= _nftInfo[tokenId].auctionEndTime && _nftInfo[tokenId].auction == true) {
            _nftInfo[tokenId].auction = false;
            emit AuctionEnded(tokenId, false);

        }
        return (true, _nftInfo[tokenId].auctionWinner);
    }

    function _tokenIdExists(uint256 tokenId) internal view returns (bool) {
        return tokenId < _tokenIdCounter.current();
    }
}
