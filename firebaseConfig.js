import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';


const firebaseConfig = {
  apiKey: "AIzaSyDVKxoJOQFz7Q7HA_D71SY041qHXajVmYU", 
  authDomain: "social-media-ab0cc.firebaseapp.com", 
  projectId: "social-media-ab0cc", 
  storageBucket: "social-media-ab0cc.firebasestorage.app", 
  messagingSenderId: "557196817320", 
  appId: "1:557196817320:web:cf4b573aa3c5298fb4e39d", 
  measurementId: "G-7DHHMQF6V0", 
};


const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);

