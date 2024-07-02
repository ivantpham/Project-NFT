import { useState, useEffect, useCallback, useContext } from 'react';
import '../styles/Wallet.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import { ethers } from 'ethers'; // Import ethers
import { WalletContext } from '../context/WalletContext'; // Import the context hook
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import LTPCoin from '../contract-api/LTPCoin.json';
import BuyLTP from './BuyLTP';
import SellLTP from './SellLTP';
import Transfer from './Transfer';
import MintLTP from './MintLTP'; // Import MintLTP component
import Withdraw from './Withdraw'; // Import Withdraw component

const OWNER_ADDRESS = '0xC7c3c90Ed29e05a4fE6cF23570506453D32c0829';
const LTP_CONTRACT_ADDRESS = '0x0005BA5281CEB65A1E99de9a08798F93063E557D';

const Wallet = () => {
    const useWallet = useContext(WalletContext); // Use the context hook
    const { walletAddress, isConnected, isLoading } = useWallet;
    const [ethBalance, setEthBalance] = useState('');
    const [ltpBalance, setLtpBalance] = useState('0');
    const [contractEthBalance, setContractEthBalance] = useState(''); // State for contract ETH balance
    const [showFullAddress, setShowFullAddress] = useState(false);
    const [isBalanceLoading, setIsBalanceLoading] = useState(false);
    const [showBuyModal, setShowBuyModal] = useState(false);
    const [showSellModal, setShowSellModal] = useState(false);
    const [showTransferModal, setShowTransferModal] = useState(false);
    const [showMintModal, setShowMintModal] = useState(false); // State for MintLTP modal
    const [showWithdrawModal, setShowWithdrawModal] = useState(false); // State for Withdraw modal

    const fetchBalances = useCallback(async () => {
        if (isConnected && walletAddress && window.ethereum) {
            setIsBalanceLoading(true);
            try {
                const provider = new ethers.providers.Web3Provider(window.ethereum);
                const signer = provider.getSigner();

                // Get ETH balance
                const balanceInWei = await signer.getBalance();
                const balanceInEth = ethers.utils.formatEther(balanceInWei);
                setEthBalance(balanceInEth);

                // Get LTP balance
                const ltpContract = new ethers.Contract(LTP_CONTRACT_ADDRESS, LTPCoin.abi, signer);
                const balanceInLTP = await ltpContract.balanceOf(walletAddress);
                setLtpBalance(balanceInLTP.toString());

                // Get contract ETH balance if owner
                if (walletAddress.toLowerCase() === OWNER_ADDRESS.toLowerCase()) {
                    const contractBalanceInWei = await provider.getBalance(LTP_CONTRACT_ADDRESS);
                    const contractBalanceInEth = ethers.utils.formatEther(contractBalanceInWei);
                    setContractEthBalance(contractBalanceInEth);
                }
            } catch (error) {
                console.error('Error fetching balances:', error);
            } finally {
                setIsBalanceLoading(false);
            }
        }
    }, [isConnected, walletAddress]);

    useEffect(() => {
        fetchBalances();
    }, [isConnected, walletAddress, fetchBalances]);

    const formatWalletAddress = (address) => {
        if (address) {
            return `${address.slice(0, 7)}...${address.slice(-5)}`;
        }
        return '';
    };

    const handleTransferLTP = () => {
        setShowTransferModal(true);
    };

    const handleBuyLTP = () => {
        setShowBuyModal(true);
    };

    const handleSellLTP = () => {
        setShowSellModal(true);
    };

    const handleCloseBuyModal = () => {
        setShowBuyModal(false);
        fetchBalances(); // Refresh balances when modal is closed
    };

    const handleCloseSellModal = () => {
        setShowSellModal(false);
        fetchBalances(); // Refresh balances when modal is closed
    };

    const handleCloseTransferModal = () => {
        setShowTransferModal(false);
        fetchBalances(); // Refresh balances when modal is closed
    };

    const handleMintLTP = () => {
        setShowMintModal(true); // Show MintLTP modal
    };

    const handleWithdraw = () => {
        setShowWithdrawModal(true); // Show Withdraw modal
    };

    const handleCloseMintModal = () => {
        setShowMintModal(false);
        fetchBalances(); // Refresh balances when modal is closed
    };

    const handleCloseWithdrawModal = () => {
        setShowWithdrawModal(false);
        fetchBalances(); // Refresh balances when modal is closed
    };

    return (
        <div className="container my-5">
            <div className="card bg-dark text-white">
                <div className="card-header bg-dark d-flex justify-content-between align-items-center">
                    <h3 className="card-title bg-dark text-white">
                        {isConnected ? `Hello - ${formatWalletAddress(walletAddress)}` : 'User Wallet'}
                    </h3>
                    {walletAddress && walletAddress.toLowerCase() === OWNER_ADDRESS.toLowerCase() ? (
                        <div className="badge bg-primary text-white">Contract Owner</div>
                    ) : null}
                </div>

                <div className="card-body">
                    {isLoading ? (
                        <p>Loading...</p>
                    ) : isConnected ? (
                        isBalanceLoading ? (
                            <p>Fetching balances...</p>
                        ) : (
                            <>
                                <WalletDetails
                                    walletAddress={walletAddress}
                                    showFullAddress={showFullAddress}
                                    setShowFullAddress={setShowFullAddress}
                                    ethBalance={ethBalance}
                                    ltpBalance={ltpBalance}
                                    contractEthBalance={contractEthBalance} // Pass contract balance
                                    formatWalletAddress={formatWalletAddress}
                                />
                                {walletAddress && walletAddress.toLowerCase() === OWNER_ADDRESS.toLowerCase() ? (
                                    <OwnerActions
                                        handleMintLTP={handleMintLTP}
                                        handleWithdraw={handleWithdraw}
                                    />
                                ) : (
                                    <WalletActions
                                        handleBuyLTP={handleBuyLTP}
                                        handleSellLTP={handleSellLTP}
                                        handleTransferLTP={handleTransferLTP}
                                    />
                                )}
                            </>
                        )
                    ) : (
                        <p>Please connect your wallet.</p>
                    )}
                </div>
            </div>

            <BuyLTP show={showBuyModal} handleClose={handleCloseBuyModal} updateBalances={fetchBalances} />
            <SellLTP show={showSellModal} handleClose={handleCloseSellModal} updateBalances={fetchBalances} />
            <Transfer show={showTransferModal} handleClose={handleCloseTransferModal} walletAddress={walletAddress} updateBalances={fetchBalances} />
            <MintLTP show={showMintModal} handleClose={handleCloseMintModal} updateBalances={fetchBalances} />
            <Withdraw show={showWithdrawModal} handleClose={handleCloseWithdrawModal} walletAddress={walletAddress} updateBalances={fetchBalances} />


        </div>
    );
};

const WalletDetails = ({ walletAddress, showFullAddress, setShowFullAddress, ethBalance, ltpBalance, contractEthBalance, formatWalletAddress }) => (
    <>
        <div className="mb-3">
            <label htmlFor="walletAddress" className="form-label">Wallet Address</label>
            <div className="input-group">
                <input
                    type="text"
                    className="form-control bg-dark text-white"
                    id="walletAddress"
                    placeholder="0x123456789ABCDEF"
                    readOnly
                    value={showFullAddress ? walletAddress : formatWalletAddress(walletAddress)}
                />
                <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={() => setShowFullAddress(!showFullAddress)}
                >
                    {showFullAddress ? <FaEyeSlash /> : <FaEye />}
                </button>
            </div>
        </div>
        <div className="mb-3">
            <label htmlFor="walletBalance" className="form-label">Metamask Balance</label>
            <input
                type="text"
                className="form-control bg-dark text-white"
                id="walletBalance"
                placeholder="0.00 ETH"
                readOnly
                value={`${ethBalance} ETH`}
            />
        </div>
        <div className="mb-3">
            <label htmlFor="ltpBalance" className="form-label">LTP Balance</label>
            <div className="form-control bg-dark text-white" id="ltpBalance">
                {`${ethers.utils.formatEther(ltpBalance)} LTP`}
            </div>
        </div>
        {contractEthBalance && (
            <div className="mb-3">
                <label htmlFor="contractBalance" className="form-label">Contract ETH Balance</label>
                <input
                    type="text"
                    className="form-control bg-dark text-white"
                    id="contractBalance"
                    placeholder="0.00 ETH"
                    readOnly
                    value={`${contractEthBalance} ETH`}
                />
            </div>
        )}
    </>
);

const WalletActions = ({ handleBuyLTP, handleSellLTP, handleTransferLTP }) => (
    <div className="d-flex justify-content-between">
        <button type="button" className="btn btn-success" onClick={handleBuyLTP}>Buy LTP</button>
        <button type="button" className="btn btn-danger" onClick={handleSellLTP}>Sell LTP</button>
        <button type="button" className="btn btn-primary" onClick={handleTransferLTP}>Transfer LTP</button>
    </div>
);

const OwnerActions = ({ handleMintLTP, handleWithdraw }) => (
    <div className="d-flex justify-content-between">
        <button type="button" className="btn btn-warning" onClick={handleMintLTP}>Mint LTP</button>
        <button type="button" className="btn btn-info" onClick={handleWithdraw}>Withdraw</button>
    </div>
);

export default Wallet;
