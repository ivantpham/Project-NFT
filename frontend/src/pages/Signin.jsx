import React, { useState, useEffect } from 'react';
import { Button, Col, Container, Form, FormText, Image, Row, Alert, Modal } from "react-bootstrap";
import { Google } from "react-bootstrap-icons";
import { useNavigate } from "react-router-dom";
import { auth, provider } from './firebase';
import { signInWithPopup, signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import Home from './Home';

export default function Signin() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [loadingGoogle, setLoadingGoogle] = useState(false);
    const [showAlert, setShowAlert] = useState(false);
    const [alertVariant, setAlertVariant] = useState('success');
    const [alertMessage, setAlertMessage] = useState('');
    const [showSignupModal, setShowSignupModal] = useState(false);
    const [signupEmail, setSignupEmail] = useState('');
    const [signupPassword, setSignupPassword] = useState('');
    const [signupConfirmPassword, setSignupConfirmPassword] = useState('');
    const [signupError, setSignupError] = useState('');
    const [valueGoogle, setValueGoogle] = useState('');

    const navigate = useNavigate();

    const handleEmailPasswordSignIn = async (e) => {
        e.preventDefault();

        try {
            setLoading(true);
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            localStorage.setItem('email', email); // Lưu email vào localStorage
            setShowAlert(true);
            setAlertVariant('success');
            setAlertMessage('Signed in successfully!');

            // Reload the page after 0.5 seconds
            setTimeout(() => {
                window.location.reload();
            }, 500);
        } catch (error) {
            setLoading(false);
            setShowAlert(true);
            setAlertVariant('danger');
            setAlertMessage(`Failed to sign in: ${error.message}`);
        }
    };

    const handleGoogleSignIn = () => {
        signInWithPopup(auth, provider).then((data) => {
            const userEmail = data.user.email;
            localStorage.setItem('email', userEmail); // Lưu email vào localStorage
            setValueGoogle(userEmail);
            setShowAlert(true);
            setAlertVariant('success');
            setAlertMessage(`Welcome, ${data.user.displayName}!`);

            // Reload the page after 0.5 seconds
            setTimeout(() => {
                window.location.reload();
            }, 500);
        }).catch(error => {
            setShowAlert(true);
            setAlertVariant('danger');
            setAlertMessage(`Failed to sign in with Google: ${error.message}`);
        });
    };

    useEffect(() => {
        // Function to navigate to /profile/edit after 2 seconds of reload
        const navigateToProfileEdit = () => {
            navigate('/profile/edit');
        };

        // Check if localStorage has email (user is logged in)
        const userEmail = localStorage.getItem('email');
        if (userEmail) {
            // Wait for 2 seconds after reload to navigate to /profile/edit
            setTimeout(navigateToProfileEdit, 2000);
        }
    }, [navigate]);

    useEffect(() => {
        setValueGoogle(localStorage.getItem('email'));
    }, []);

    const handleGithubSignIn = () => {
        // Implement Github sign-in logic here
        console.log('Github sign-in logic to be implemented');
    };

    const handleSignup = async (e) => {
        e.preventDefault();

        if (signupPassword !== signupConfirmPassword) {
            setSignupError('Passwords do not match');
            return;
        }

        try {
            setLoading(true);
            const userCredential = await createUserWithEmailAndPassword(auth, signupEmail, signupPassword);
            setShowSignupModal(false);
            setEmail('');
            setPassword('');
            setSignupEmail('');
            setSignupPassword('');
            setSignupConfirmPassword('');
            setSignupError('');
            setShowAlert(true);
            setAlertVariant('success');
            setAlertMessage('Account created successfully!');

            // Reload the page after 0.5 seconds
            setTimeout(() => {
                window.location.reload();
            }, 500);
        } catch (error) {
            setLoading(false);
            setSignupError(error.message);
        }
    };

    return (
        <Container className="items-center justify-center" style={{ marginTop: "70px", position: "relative" }}>
            <Row xs={1} md={2} className="align-items-center justify-content-center">
                <Col xs={6} style={{ paddingRight: "10px" }}>
                    <Image style={{ objectFit: "contain", maxHeight: "50vh", maxWidth: "100%" }} src="/600x600.webp" />
                </Col>
                <Col xs={6}>
                    <Form data-bs-theme="dark" onSubmit={handleEmailPasswordSignIn} style={{ display: "flex", flexDirection: "column", justifyContent: "center", height: "100%" }}>
                        {showAlert && (
                            <Alert variant={alertVariant} onClose={() => setShowAlert(false)} dismissible>
                                {alertMessage}
                            </Alert>
                        )}

                        {valueGoogle ? (
                            <div style={{ textAlign: "center", color: "white" }}>
                                <h1>Successfully logged in as {valueGoogle}</h1>
                                <Button variant="outline-light" onClick={() => navigate('/')}>Back to Home</Button>
                            </div>
                        ) :
                            <>
                                <FormText as="h1" style={{ color: "white", fontSize: 30 }} className="mb-4">
                                    Connect to LTP Marketplace
                                </FormText>
                                <Form.Group className="mb-3">
                                    <Button id="btnGoogle" variant="outline-light" style={{ display: "flex", alignItems: "center", gap: "8px", width: "100%", justifyContent: "center" }} onClick={handleGoogleSignIn}>
                                        <Google /> Continue with Google
                                    </Button>
                                </Form.Group>


                                <Form.Text className="mb-4" style={{ textAlign: "center", display: "block" }}>
                                    Or
                                </Form.Text>

                                {/* Email and password input */}
                                <Form.Group className="mb-3" controlId="email">
                                    <Form.Control type="email" placeholder="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                                </Form.Group>

                                <Form.Group className="mb-4" controlId="password">
                                    <Form.Control type="password" placeholder="password" value={password} onChange={(e) => setPassword(e.target.value)} />
                                </Form.Group>

                                {/* Sign-in button */}
                                <Button variant="dark" style={{ display: "block", width: "100%" }} type="submit" disabled={loading || loadingGoogle}>
                                    {(loading || loadingGoogle) ? 'Signing in...' : 'Sign in'}
                                </Button>

                                <Form.Text className="mb-4" style={{ textAlign: "center", display: "block", margin: "3rem 0" }}>
                                    Do not have an account?
                                </Form.Text>
                                <Button
                                    variant="dark"
                                    style={{ display: "block", width: "100%", borderColor: "white", color: "white" }}
                                    onClick={() => setShowSignupModal(true)}
                                >
                                    Create New Account
                                </Button>

                                {/* Sign-up modal */}
                                <Modal
                                    show={showSignupModal}
                                    onHide={() => setShowSignupModal(false)}
                                    centered // Set centered to true to center the modal
                                >
                                    <Modal.Header closeButton>
                                        <Modal.Title>SIGN UP</Modal.Title>
                                    </Modal.Header>
                                    <Modal.Body>
                                        <Form onSubmit={handleSignup}>
                                            <Form.Group controlId="signupEmail">
                                                <Form.Label>Email address</Form.Label>
                                                <Form.Control
                                                    type="email"
                                                    placeholder="Enter email"
                                                    value={signupEmail}
                                                    onChange={(e) => setSignupEmail(e.target.value)}
                                                />
                                            </Form.Group>

                                            <Form.Group controlId="signupPassword">
                                                <Form.Label>Password</Form.Label>
                                                <Form.Control
                                                    type="password"
                                                    placeholder="Password"
                                                    value={signupPassword}
                                                    onChange={(e) => setSignupPassword(e.target.value)}
                                                />
                                            </Form.Group>

                                            <Form.Group controlId="signupConfirmPassword">
                                                <Form.Label>Confirm Password</Form.Label>
                                                <Form.Control
                                                    type="password"
                                                    placeholder="Confirm Password"
                                                    value={signupConfirmPassword}
                                                    onChange={(e) => setSignupConfirmPassword(e.target.value)}
                                                />
                                            </Form.Group>

                                            {signupError && <Alert variant="danger">{signupError}</Alert>}

                                            <Button variant="dark" type="submit" style={{ width: "100%" }}>
                                                Sign up
                                            </Button>
                                        </Form>
                                    </Modal.Body>
                                </Modal>

                                {/* White overlay */}
                                {showSignupModal && (
                                    <div
                                        style={{
                                            position: "fixed",
                                            top: 0,
                                            left: 0,
                                            width: "100%",
                                            height: "100%",
                                            backgroundColor: "rgba(255, 255, 255, 0.5)", // Màu trắng mờ
                                            zIndex: 999, // Đảm bảo nằm trên modal
                                        }}
                                    />
                                )}
                            </>
                        }
                    </Form>
                </Col>
            </Row>
        </Container>
    );
}
