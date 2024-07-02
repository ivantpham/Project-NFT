import { Button, Col, Container, Form, FormText, Image, Row } from "react-bootstrap";
import { Google, Github } from "react-bootstrap-icons";

export default function Signin() {
    return (
        <Container class="items-center justify-center">
            <Row xs={1} md={2}>
                <Col style={{height: "100vh", width: "fit-content"}}>
                    <Image style={{objectFit: "contain", height: "100%", width: "auto"}} src="/luffy_bg.png"/>
                </Col>
                <Col>
                    <Form data-bs-theme="dark" style={{display: "flex", flexDirection: "column", justifyContent: "center", height: "100%"}}>
                        <FormText as="h1" style={{color: "white", fontSize: 30}} className="mb-4">Connect to LTP Marketplace</FormText>
                        <Form.Group className="mb-3">
                            <Button variant="outline-light" style={{display: "flex", alignItems: "center", gap: "8px", width: "100%", justifyContent: "center"}}><Google/> Continue with Google</Button>
                        </Form.Group>
                        <Form.Group className="mb-4">
                            <Button variant="outline-light" style={{display: "flex", alignItems: "center", gap: "8px", width: "100%", justifyContent: "center"}}><Github/> Continue with Github</Button>
                        </Form.Group>
                        <Form.Text className="mb-4" style={{textAlign: "center", display: "block"}}>
                            Or
                        </Form.Text>
                        <Form.Group className="mb-3" controlId="exampleForm.ControlInput1">
                            <Form.Control type="email" placeholder="email" />
                        </Form.Group>
                        <Form.Group className="mb-4" controlId="exampleForm.ControlInput1">
                            <Form.Control type="password" placeholder="password" />
                        </Form.Group>
                        <Button variant="dark" style={{display: "block", width: "100%"}} type="submit">Sign in</Button>
                    </Form>
                </Col>
            </Row>
        </Container>
    )
}