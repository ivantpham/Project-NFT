import React, { useState, useEffect, useContext } from 'react';
import { Button, Container, Nav, NavDropdown, Navbar } from 'react-bootstrap';
import { PersonCircle } from 'react-bootstrap-icons';
import { WalletContext } from '../context/WalletContext';
import { NavLink, useLocation } from 'react-router-dom';
import { auth, db, getDocs, collection, query, where } from '../pages/firebase'; // Import Firestore functions
import { signOut } from 'firebase/auth'; // Import the signOut function

function Header() {
    const { walletAddress, isConnected, connectWallet, disconnectWallet, callWinner } = useContext(WalletContext);
    const [isConnecting, setIsConnecting] = useState(false);
    const [isGoogleConnected, setIsGoogleConnected] = useState(false);
    const [profileImageUrl, setProfileImageUrl] = useState(null);
    const location = useLocation();

    useEffect(() => {
        // Effect to trigger re-render on location change
    }, [location]);

    const handleConnectWallet = async () => {
        setIsConnecting(true);

        // Check if there's an email in localStorage
        const googleEmail = localStorage.getItem('email');
        if (!googleEmail) {
            alert('You need to sign in to connect your MetaMask wallet.');
            setIsConnecting(false);
            return;
        }

        // Check if addressCheck exists in localStorage
        const addressCheck = localStorage.getItem('addressCheck');
        if (!addressCheck) {
            alert('Update wallet address for the account or log in again.');
            setIsConnecting(false);
            return;
        }

        try {
            await connectWallet();

            // After connecting wallet, check and update realAddress if addressCheck matches walletAddress
            const walletAddress = localStorage.getItem('walletAddress');
            if (addressCheck === walletAddress) {
                localStorage.setItem('realAddress', walletAddress);
            } else {
                // If addressCheck does not match walletAddress, alert user and wait for dismissal
                alert('Wallet MetaMask does not match the account. Please dismiss this alert to sign out.');
                await new Promise(resolve => {
                    // Wait for alert to be dismissed
                    setTimeout(resolve, 2000); // Wait for 2 seconds
                });
                await handleSignOut(); // Now perform sign out
                return;
            }

        } catch (error) {
            console.error('Error connecting wallet:', error);
        } finally {
            setIsConnecting(false);
        }
    };

    const handleSignOut = async () => {
        try {
            await signOut(auth); // Sign out from Firebase
            localStorage.removeItem('email'); // Remove email from local storage
            setIsGoogleConnected(false); // Update state to reflect that Google is disconnected

            // Disconnect wallet and remove walletAddress from localStorage
            await disconnectWallet();
            localStorage.removeItem('walletAddress');
            localStorage.removeItem('addressCheck');
            localStorage.removeItem('realAddress');

            // Wait for 2 seconds before reloading the page
            setTimeout(() => {
                window.location.reload();
            }, 2000); // Wait for 2 seconds
        } catch (error) {
            console.error('Error disconnecting Google or wallet:', error);
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
                console.log('MetaMask accounts:', accounts);
            } catch (error) {
                console.error('Error querying MetaMask accounts:', error);
            }
        } else {
            console.error('MetaMask not detected in your browser.');
        }
    };

    const fetchProfileImageUrl = async (email) => {
        try {
            const q = query(collection(db, 'users'), where('email', '==', email));
            const querySnapshot = await getDocs(q);
            if (!querySnapshot.empty) {
                querySnapshot.forEach((doc) => {
                    console.log('Profile document found:', doc.data());
                    setProfileImageUrl(doc.data().imageUrl);
                });
            } else {
                console.log('No matching document found for email:', email);
            }
        } catch (error) {
            console.error('Error fetching profile image URL:', error);
        }
    };

    // Check if Google is connected by looking at local storage
    useEffect(() => {
        const googleEmail = localStorage.getItem('email');
        setIsGoogleConnected(!!googleEmail);
        if (googleEmail) {
            fetchProfileImageUrl(googleEmail);
        }
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
                        {isConnected && (
                            <Nav.Link as={NavLink} to="/mint-nft" activeClassName="active">Create</Nav.Link>
                        )}
                        {!isGoogleConnected && (
                            <Nav.Link as={NavLink} to="/auth/signin" activeClassName="active">Sign In</Nav.Link>
                        )}
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
                        {isGoogleConnected && (
                            <NavDropdown
                                title={
                                    profileImageUrl ? (
                                        <img src={profileImageUrl} alt="Profile" style={{ width: 30, height: 30, borderRadius: '50%' }} />
                                    ) : (
                                        <PersonCircle />
                                    )
                                }
                                id="basic-nav-dropdown"
                                aria-label="User Profile"
                                style={{ fontSize: 22, marginLeft: 8 }}
                            >
                                <NavDropdown.Item as={NavLink} to="/profile/edit">Edit profile</NavDropdown.Item>
                                <NavDropdown.Item href="/" onClick={handleSignOut}>Sign out</NavDropdown.Item>
                            </NavDropdown>
                        )}
                    </Nav>
                </Navbar.Collapse>
            </Container>
        </Navbar>
    );
}

export default Header;
