import { Button, Container, Form, Image } from "react-bootstrap";

export default function MintNFT() {
    return (
        <Container className="mt-4">
            <Form data-bs-theme="dark">
                <h1 style={{color: "white"}}>Create New Item</h1>
                <Form.Group className="mb-3" style={{width: "100%"}} controlId="exampleForm.ControlInput5">
                    <Form.Label style={{color: "white"}}>Your Masterpiece</Form.Label>
                    <Image src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQlqsyY5rh2kAACkIXtTDO97F5_Hsa7bCYDEg&s" style={{width: 200, height: 200, display: "block"}} />
                    <Form.Text muted>
                        Only accept .jpeg, .jpg, .png, .gif
                    </Form.Text>
                    <Form.Control type="file" style={{width: 300, textAlign: "center", display: "block", margin: "4px 0"}} />
                </Form.Group>
                <Form.Group className="mb-3" controlId="exampleForm.ControlInput1">
                    <Form.Label style={{color: "white"}}>Name</Form.Label>
                    <Form.Control type="text" placeholder="Item name" />
                </Form.Group>
                <Form.Group className="mb-3" controlId="exampleForm.ControlInput2">
                    <Form.Label style={{color: "white"}}>External link</Form.Label>
                    <Form.Control type="text" placeholder="https://yoursite.io/item/123" />
                    <Form.Text muted>
                        LTP NFT Marketplace will include a link to this URL on this item’s detail page, so that users can click to learn more about it. You are welcome to link to your own web page with more details.
                    </Form.Text>
                </Form.Group>
                <Form.Group className="mb-3" controlId="exampleForm.ControlInput3">
                    <Form.Label style={{color: "white"}}>Description</Form.Label>
                    <Form.Control as="textarea" rows={3} placeholder="Provide a detailed description of your item"/>
                    <Form.Text muted>
                        The description will be included on the item’s detail page underneath its image. Markdown syntax is supported.
                    </Form.Text>
                </Form.Group>
                <Button variant="outline-light" type="submit">Create</Button>
            </Form>
        </Container>
    )
}