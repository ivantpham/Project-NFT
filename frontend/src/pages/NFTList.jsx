// NFTList.jsx
import React, { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import newNFTABI from '../contract-api/newNFT.json';

const NFTList = () => {
    const [nfts, setNfts] = useState([]);

    useEffect(() => {
        const fetchNFTs = async () => {
            // Kết nối tới MetaMask
            if (typeof window.ethereum !== 'undefined') {
                const provider = new ethers.providers.Web3Provider(window.ethereum);
                const signer = provider.getSigner();
                const contractAddress = '0x9dD2aA1745D53aCed8AfAeB5452767313816DecC';
                const contract = new ethers.Contract(contractAddress, newNFTABI, signer);

                // Lấy tổng số lượng NFTs đã mint
                const totalSupply = await contract.totalSupply();

                // Lấy thông tin của từng NFT
                const nftData = [];
                for (let tokenId = 0; tokenId < totalSupply; tokenId++) {
                    const [description, creator, price] = await contract.getNFTInfo(tokenId);
                    nftData.push({
                        tokenId,
                        description,
                        creator,
                        price: ethers.utils.formatEther(price)
                    });
                }

                setNfts(nftData);
            } else {
                console.error('MetaMask is not installed');
            }
        };

        fetchNFTs();
    }, []);

    return (
        <div>
            <h1>Minted NFTs</h1>
            {nfts.map((nft) => (
                <div key={nft.tokenId}>
                    <p>Token ID: {nft.tokenId}</p>
                    <p>Description: {nft.description}</p>
                    <p>Creator: {nft.creator}</p>
                    <p>Price: {nft.price} ETH</p>
                </div>
            ))}
        </div>
    );
};

export default NFTList;
