import { useState } from 'react';
import { Button, Col, Container, Form, FormText, Image, Row } from 'react-bootstrap';
import { Google, Github } from 'react-bootstrap-icons';
import { GoogleLogin } from 'react-google-login';

const clientId = 'YOUR_GOOGLE_CLIENT_ID'; // Replace with your Google Client ID

export default function Signin() {
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    const responseGoogle = (response) => {
        console.log(response);
        setIsLoggedIn(true); // Handle your login logic here
        // You can send the Google ID token to your backend for further verification and session management
    };

    const onFailure = (error) => {
        console.error('Google login failed:', error);
        // Handle failure scenario if needed
    };

    return (
        <Container className="items-center justify-center">
            <Row xs={1} md={2}>
                <Col style={{ height: '100vh', width: 'fit-content' }}>
                    <Image style={{ objectFit: 'contain', height: '100%', width: 'auto' }} src="/luffy_bg.png" />
                </Col>
                <Col>
                    <Form style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', height: '100%' }}>
                        <FormText as="h1" style={{ color: 'white', fontSize: 30 }} className="mb-4">
                            Connect to LTP Marketplace
                        </FormText>
                        <GoogleLogin
                            clientId={clientId}
                            buttonText={<><Google /> Continue with Google</>}
                            onSuccess={responseGoogle}
                            onFailure={onFailure}
                            cookiePolicy={'single_host_origin'}
                            render={renderProps => (
                                <Button variant="outline-light" style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '100%', justifyContent: 'center' }} onClick={renderProps.onClick} disabled={renderProps.disabled}>
                                    <Google /> Continue with Google
                                </Button>
                            )}
                        />
                        <Form.Group className="mb-4">
                            <Button variant="outline-light" style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '100%', justifyContent: 'center' }}>
                                <Github /> Continue with Github
                            </Button>
                        </Form.Group>
                        <Form.Text className="mb-4" style={{ textAlign: 'center', display: 'block' }}>
                            Or
                        </Form.Text>
                        <Form.Group className="mb-3" controlId="exampleForm.ControlInput1">
                            <Form.Control type="email" placeholder="email" />
                        </Form.Group>
                        <Form.Group className="mb-4" controlId="exampleForm.ControlInput1">
                            <Form.Control type="password" placeholder="password" />
                        </Form.Group>
                        <Button variant="dark" style={{ display: 'block', width: '100%' }} type="submit">
                            Sign in
                        </Button>
                    </Form>
                </Col>
            </Row>
        </Container>
    );
}
