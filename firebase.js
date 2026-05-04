import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// Replace these values with your actual Firebase project config
const firebaseConfig = {
  apiKey: "AIzaSyC9zggpm6Zz1dBu1YUcJyDERY9r58H3lRQ",
  authDomain: "food-hub-bd716.firebaseapp.com",
  projectId: "food-hub-bd716"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
