import { useState, useEffect } from "react";
import { Button, Container, Form, Image, Modal } from "react-bootstrap";
import { ethers } from "ethers";
import { storage, ref, uploadBytesResumable, getDownloadURL, collection, addDoc, db, doc, getDoc } from "./firebase"; // Import Firebase functions for storage and Firestore
import addressContract from '../contract-api/addressContract';
import newNFT from "../contract-api/newNFT.json";

export default function MintNFT() {
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [price, setPrice] = useState("");
    const [selectedImage, setSelectedImage] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [modalMessage, setModalMessage] = useState("In Creating ....!");

    const contractAddress = addressContract;
    const abi = newNFT.abi;

    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const contract = new ethers.Contract(contractAddress, abi, signer);

    const handleCreate = async () => {
        setShowModal(true);
        try {
            const fileInput = document.getElementById("file-input");
            const file = fileInput.files[0];
            const tokenId = Math.floor(Math.random() * 1000000);

            const storageRef = ref(storage, `images/${tokenId}/${file.name}`);
            const uploadTask = uploadBytesResumable(storageRef, file);

            uploadTask.on(
                "state_changed",
                (snapshot) => {
                    // Track progress here if needed
                },
                (error) => {
                    console.error("Error uploading image:", error);
                },
                async () => {
                    const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
                    const docRef = await addDoc(collection(db, "nfts"), {
                        tokenId: tokenId,
                        imageUrl: downloadURL,
                    });

                    const docSnap = await getDoc(doc(db, "nfts", docRef.id));
                    if (docSnap.exists()) {
                        const data = docSnap.data();
                        const imageUrl = data.imageUrl;

                        const tx = await contract.mintNFT(name, imageUrl, description, ethers.utils.parseEther(price), imageUrl);
                        await tx.wait();

                        setModalMessage("You created NFT!");
                        setTimeout(() => {
                            setShowModal(false);
                            setName("");
                            setDescription("");
                            setPrice("");
                            window.location.href = '/explore';
                        }, 3000); // 3000 milliseconds = 3 seconds
                    } else {
                        console.error("No such document!");
                    }
                }
            );
        } catch (error) {
            console.error("Error minting NFT:", error);
            setShowModal(false);
        }
    };

    return (
        <Container className="mt-4">
            <Form data-bs-theme="dark" onSubmit={(e) => { e.preventDefault(); }}>
                <h1 style={{ color: "white" }}>Create New Item</h1>
                <Form.Group className="mb-3" controlId="exampleForm.ControlInput1">
                    <Form.Label style={{ color: "white" }}>Name</Form.Label>
                    <Form.Control
                        type="text"
                        placeholder="Item name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                    />
                </Form.Group>
                <Form.Group className="mb-3" controlId="exampleForm.ControlInput2">
                    <Form.Label style={{ color: "white" }}>Description</Form.Label>
                    <Form.Control
                        as="textarea"
                        rows={3}
                        placeholder="Provide a detailed description of your item"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                    />
                </Form.Group>
                <Form.Group className="mb-3" controlId="exampleForm.ControlInput3">
                    <Form.Label style={{ color: "white" }}>Price</Form.Label>
                    <Form.Control
                        type="text"
                        placeholder="The price of the NFT you desire."
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                    />
                </Form.Group>
                <Form.Group className="mb-3" style={{ width: "100%" }}>
                    <Form.Label style={{ color: "white" }}>Your Masterpiece</Form.Label>
                    <Image src={selectedImage || "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQlqsyY5rh2kAACkIXtTDO97F5_Hsa7bCYDEg&s"} style={{ width: 200, height: 200, display: "block" }} />
                    <Form.Text muted>
                        Only accept .jpeg, .jpg, .png, .gif
                    </Form.Text>
                    <Form.Control id="file-input" type="file" style={{ width: 300, textAlign: "center", display: "block", margin: "4px 0" }} onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                            setSelectedImage(URL.createObjectURL(e.target.files[0]));
                        }
                    }} />
                </Form.Group>
                <Button variant="outline-light" onClick={handleCreate}>Create</Button>
            </Form>

            <Modal show={showModal} onHide={() => setShowModal(false)} centered>
                <Modal.Header closeButton>
                </Modal.Header>
                <Modal.Body className="text-center">
                    <Image src={selectedImage} alt="NFT" style={{ width: '100%', height: 'auto' }} />
                    <h4 className="mt-3">{modalMessage}</h4>
                </Modal.Body>
            </Modal>
        </Container>
    );
}
