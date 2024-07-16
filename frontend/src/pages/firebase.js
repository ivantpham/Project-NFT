import { initializeApp } from 'firebase/app';
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { getFirestore, collection, addDoc, doc, getDoc } from 'firebase/firestore';

const firebaseConfig = {
    apiKey: "AIzaSyATpCr_Pv2DGbeJiP9GZvhyt2JHHm1nck4",
    authDomain: "balbala-21141.firebaseapp.com",
    projectId: "balbala-21141",
    storageBucket: "balbala-21141.appspot.com",
    messagingSenderId: "10407076481",
    appId: "1:10407076481:web:d168268b13eca2a6a0e380",
    measurementId: "G-99JC45XFYS"
};

const app = initializeApp(firebaseConfig);
const storage = getStorage(app);
const db = getFirestore(app);

export { storage, ref, uploadBytesResumable, getDownloadURL, collection, addDoc, db, doc, getDoc };



// import { initializeApp } from 'firebase/app';
// import { getStorage, ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
// import { getFirestore, collection, addDoc } from 'firebase/firestore';

// const firebaseConfig = {
//     apiKey: "AIzaSyATpCr_Pv2DGbeJiP9GZvhyt2JHHm1nck4",
//     authDomain: "balbala-21141.firebaseapp.com",
//     projectId: "balbala-21141",
//     storageBucket: "balbala-21141.appspot.com",
//     messagingSenderId: "10407076481",
//     appId: "1:10407076481:web:d168268b13eca2a6a0e380",
//     measurementId: "G-99JC45XFYS"
// };

// const app = initializeApp(firebaseConfig);
// const storage = getStorage(app);
// const db = getFirestore(app);

// export { storage, ref, uploadBytesResumable, getDownloadURL, collection, addDoc, db };