import { ethers } from 'ethers';
import LTPCoin from './LTPCoin.json';

const provider = new ethers.providers.Web3Provider(window.ethereum);
const contractAddress = '0x0005BA5281CEB65A1E99de9a08798F93063E557D';
const ltpContract = new ethers.Contract(contractAddress, LTPCoin.abi, provider);

const getUserBalance = async (account) => {
    const balance = await ltpContract.balanceOf(account);
    return balance.toString();
};

export { provider, ltpContract, getUserBalance };
