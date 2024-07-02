import { Button, Col, Container, Form, Image, Row } from "react-bootstrap";

export default function EditProfile() {
    return (
        <Container className="mt-4">
            <Form data-bs-theme="dark">
                <h1 style={{color: "white"}}>Edit Profile</h1>
                <Row xs={1} md={2}>
                    <Col>
                        <Form.Group className="mb-3" controlId="exampleForm.ControlInput1">
                            <Form.Label style={{color: "white"}}>Display name</Form.Label>
                            <Form.Control type="text" placeholder="Something nice" />
                        </Form.Group>
                        <Form.Group className="mb-3" controlId="exampleForm.ControlInput2">
                            <Form.Label style={{color: "white"}}>Full name</Form.Label>
                            <Form.Control type="text" placeholder="Your fullname" />
                        </Form.Group>
                        <Form.Group className="mb-3" controlId="exampleForm.ControlInput3">
                            <Form.Label style={{color: "white"}}>Bio</Form.Label>
                            <Form.Control type="text" placeholder="Bio." />
                        </Form.Group>
                        <Form.Group className="mb-3" controlId="exampleForm.ControlInput4">
                            <Form.Label style={{color: "white"}}>Default wallet adress to receive money</Form.Label>
                            <Form.Control type="text" placeholder="Address here" />
                        </Form.Group>
                    </Col>
                    <Col>
                        <Form.Group className="mb-3" style={{width: "100%"}} controlId="exampleForm.ControlInput5">
                            <Image src="https://static.vecteezy.com/system/resources/previews/036/280/650/original/default-avatar-profile-icon-social-media-user-image-gray-avatar-icon-blank-profile-silhouette-illustration-vector.jpg" style={{width: 200, height: 200, margin: "0 auto", display: "block"}} roundedCircle />
                            <Form.Text muted style={{width: 200, textAlign: "center", display: "block", margin: "4px auto"}}>
                                We recommend an image of at least 400x400. Gift work too.
                            </Form.Text>
                            <Form.Control type="file" style={{width: 300, textAlign: "center", display: "block", margin: "4px auto"}} />
                        </Form.Group>
                    </Col>
                </Row>
                <Button variant="outline-light" type="submit">Update</Button>
            </Form>
        </Container>
    );
}