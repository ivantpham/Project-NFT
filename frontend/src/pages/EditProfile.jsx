import { useEffect, useState } from "react";
import { Button, Col, Container, Form, Image, Row } from "react-bootstrap";
import { storage, ref, uploadBytesResumable, getDownloadURL, db, collection, addDoc, getDocs, query, where, doc, deleteDoc } from "./firebase"; // Adjust path to firebase.js

export default function EditProfile() {
    const [displayName, setDisplayName] = useState("");
    const [fullName, setFullName] = useState("");
    const [bio, setBio] = useState("");
    const [walletAddress, setWalletAddress] = useState("");
    const [imageUrl, setImageUrl] = useState("");
    const [initialLoad, setInitialLoad] = useState(true);

    useEffect(() => {
        const fetchProfileData = async () => {
            const email = localStorage.getItem("email");
            if (email) {
                const q = query(collection(db, "profiles"), where("email", "==", email));
                const querySnapshot = await getDocs(q);
                if (!querySnapshot.empty) {
                    const userProfile = querySnapshot.docs[0].data();
                    setDisplayName(userProfile.displayName);
                    setFullName(userProfile.fullName);
                    setBio(userProfile.bio);
                    setWalletAddress(userProfile.walletAddress);

                    // Set addressCheck in localStorage
                    localStorage.setItem("addressCheck", userProfile.walletAddress);
                    setImageUrl(userProfile.imageUrl); // Set imageUrl if email matches
                }
                if (!localStorage.getItem("addressCheck")) {
                    setWalletAddress("");
                }
            }
            setInitialLoad(false);
        };

        if (initialLoad) {
            fetchProfileData();
        }
    }, [initialLoad]);

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        const storageRef = ref(storage, `profile-images/${file.name}`);
        const uploadTask = uploadBytesResumable(storageRef, file);

        uploadTask.on(
            "state_changed",
            (snapshot) => {
                // progress function (optional)
            },
            (error) => {
                // error function (optional)
                console.error("Upload error:", error);
            },
            async () => {
                // complete function
                const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
                setImageUrl(downloadURL); // Update imageUrl state with the download URL
                console.log("Image uploaded successfully and URL set:", downloadURL);
            }
        );
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Save the profile information to Firestore
        try {
            const email = localStorage.getItem("email");
            const profilesRef = collection(db, "profiles");
            const q = query(profilesRef, where("email", "==", email));
            const querySnapshot = await getDocs(q);

            if (!querySnapshot.empty) {
                const docId = querySnapshot.docs[0].id; // Get the id of the existing document
                await addDoc(profilesRef, {
                    email,
                    displayName,
                    fullName,
                    bio,
                    walletAddress,
                    imageUrl
                });
                console.log("Profile updated successfully!");

                // Delete the old document
                await deleteDoc(doc(db, "profiles", docId));
                console.log("Old profile document deleted successfully!");
            } else {
                // If no existing document found, just add the new one
                await addDoc(profilesRef, {
                    email,
                    displayName,
                    fullName,
                    bio,
                    walletAddress,
                    imageUrl
                });
                console.log("New profile document added successfully!");
            }
        } catch (error) {
            console.error("Error updating profile:", error);
        }
    };

    const renderProfileImage = () => {
        if (imageUrl) {
            return <Image src={imageUrl} style={{ width: 200, height: 200, margin: "0 auto", display: "block" }} roundedCircle />;
        } else {
            return (
                <Image
                    src="https://static.vecteezy.com/system/resources/previews/036/280/650/original/default-avatar-profile-icon-social-media-user-image-gray-avatar-icon-blank-profile-silhouette-illustration-vector.jpg"
                    style={{ width: 200, height: 200, margin: "0 auto", display: "block" }}
                    roundedCircle
                />
            );
        }
    };

    return (
        <Container className="mt-4">
            <Form data-bs-theme="dark" onSubmit={handleSubmit}>
                <h1 style={{ color: "white" }}>Edit Profile</h1>
                <Row xs={1} md={2}>
                    <Col>
                        <Form.Group className="mb-3" controlId="exampleForm.ControlInput1">
                            <Form.Label style={{ color: "white" }}>Display name</Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="Something nice"
                                value={displayName}
                                onChange={(e) => setDisplayName(e.target.value)}
                            />
                        </Form.Group>
                        <Form.Group className="mb-3" controlId="exampleForm.ControlInput2">
                            <Form.Label style={{ color: "white" }}>Full name</Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="Your fullname"
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                            />
                        </Form.Group>
                        <Form.Group className="mb-3" controlId="exampleForm.ControlInput3">
                            <Form.Label style={{ color: "white" }}>Bio</Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="Bio."
                                value={bio}
                                onChange={(e) => setBio(e.target.value)}
                            />
                        </Form.Group>
                        <Form.Group className="mb-3" controlId="exampleForm.ControlInput4">
                            <Form.Label style={{ color: "white" }}>Default wallet address to receive money</Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="Address here"
                                value={walletAddress}
                                onChange={(e) => setWalletAddress(e.target.value)}
                            />
                        </Form.Group>
                    </Col>
                    <Col>
                        <Form.Group className="mb-3" style={{ width: "100%" }} controlId="exampleForm.ControlInput5">
                            {renderProfileImage()}
                            <Form.Text
                                muted
                                style={{ width: 200, textAlign: "center", display: "block", margin: "4px auto" }}
                            >
                                We recommend an image of at least 400x400. Gift work too.
                            </Form.Text>
                            <Form.Control
                                type="file"
                                style={{ width: 300, textAlign: "center", display: "block", margin: "4px auto" }}
                                onChange={handleImageUpload}
                            />
                        </Form.Group>
                    </Col>
                </Row>
                <Button variant="outline-light" type="submit">Update</Button>
            </Form>
        </Container>
    );
}
