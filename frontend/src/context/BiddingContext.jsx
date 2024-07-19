import { createContext, useState, useFallback } from 'react'
import { ethers } from 'ethers'; // Import ethers library
import newNFT from '../contract-api/newNFT.json';
import addressContractNFT from '../contract-api/addressContractNFT'

export const BiddingContext = createContext()

export const BiddingProvider = ({ children }) => {
    const contractAddress = addressContractNFT
    const [winner, setWinner] = useState('')
    const callWinner = useFallback((tokenId) => {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const contract = new ethers.Contract(contractAddress, LTPCoin.abi, signer)

        setInterval(async () => {
            const winner = await contract.getWinner(tokenId);
            setWinner(winner)
        }
            , 1000)
    })
    return (
        <BiddingContext.Provider value={{ winner, callWinner }}>
            {children}
        </BiddingContext.Provider>
    )
}