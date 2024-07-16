import { useState, useEffect, useContext } from 'react';
import { Button, Container, Nav, NavDropdown, Navbar } from 'react-bootstrap';
import { PersonCircle } from 'react-bootstrap-icons';
import { WalletContext } from '../context/WalletContext';
import { NavLink, useLocation } from 'react-router-dom';

function Header() {
    const { walletAddress, isConnected, connectWallet, disconnectWallet } = useContext(WalletContext);
    const [isConnecting, setIsConnecting] = useState(false);
    const location = useLocation();

    useEffect(() => {
        // Effect to trigger re-render on location change
    }, [location]);

    const handleConnectWallet = async () => {
        setIsConnecting(true);
        try {
            await connectWallet();
        } catch (error) {
            console.error('Error connecting wallet:', error);
        } finally {
            setIsConnecting(false);
        }
    };

    const handleSignOut = async () => {
        try {
            await disconnectWallet(); // Disconnect wallet
        } catch (error) {
            console.error('Error disconnecting wallet:', error);
        }
    };

    const formatWalletAddress = (address) => {
        return `${address.slice(0, 7)}...${address.slice(-5)}`;
    };

    // Function to check MetaMask accounts
    const checkMetaMaskAccounts = async () => {
        if (window.ethereum && window.ethereum.isMetaMask) {
            try {
                const accounts = await window.ethereum.request({ method: 'eth_accounts' });
                console.log('Danh sách tài khoản MetaMask:', accounts);
            } catch (error) {
                console.error('Lỗi khi truy vấn tài khoản MetaMask:', error);
            }
        } else {
            console.error('MetaMask không được phát hiện trong trình duyệt của bạn.');
        }
    };

    useEffect(() => {
        // Call the function to check MetaMask accounts on component mount
        checkMetaMaskAccounts();
    }, []);

    return (
        <Navbar expand="lg" className="bg-body-tertiary" data-bs-theme="dark">
            <Container>
                <Navbar.Brand href="/">NFT MARKETPLACE</Navbar.Brand>
                <Navbar.Toggle aria-controls="basic-navbar-nav" />
                <Navbar.Collapse id="basic-navbar-nav" className="justify-content-end">
                    <Nav>
                        <Nav.Link as={NavLink} to="/" activeClassName="active">Home</Nav.Link>
                        <Nav.Link as={NavLink} to="/explore" activeClassName="active">Explore</Nav.Link>
                        <Nav.Link as={NavLink} to="/mint-nft" activeClassName="active">Create</Nav.Link>
                        {isConnected && (
                            <Nav.Link as={NavLink} to="/mynft" activeClassName="active">My NFT</Nav.Link>
                        )}
                        {isConnected ? (
                            <Nav.Link as={NavLink} to="/wallet">
                                <Button variant="light">{formatWalletAddress(walletAddress)}</Button>
                            </Nav.Link>
                        ) : (
                            <Button variant="light" disabled={isConnecting} onClick={handleConnectWallet}>
                                {isConnecting ? 'Connecting...' : 'Connect Wallet'}
                            </Button>
                        )}
                        <NavDropdown
                            title={<PersonCircle />}
                            id="basic-nav-dropdown"
                            aria-label="User Profile"
                            style={{ fontSize: 22, marginLeft: 8 }}
                        >
                            <NavDropdown.Item as={NavLink} to="/profile/edit">Edit profile</NavDropdown.Item>
                            <NavDropdown.Item href="/" onClick={handleSignOut}>Sign out</NavDropdown.Item>
                        </NavDropdown>
                    </Nav>
                </Navbar.Collapse>
            </Container>
        </Navbar>
    );
}

export default Header;
