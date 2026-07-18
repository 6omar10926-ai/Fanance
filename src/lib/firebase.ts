import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

// قيم مشروع Firebase الخاص بك — من Project settings > Your apps > SDK setup and configuration
const firebaseConfig = {
  apiKey: 'AIzaSyDPZ5JX4W-k74HRrYX6fzN5fnPw6jBuT0s',
  authDomain: 'finance-d3a13.firebaseapp.com',
  projectId: 'finance-d3a13',
  storageBucket: 'finance-d3a13.firebasestorage.app',
  messagingSenderId: '356513323732',
  appId: '1:356513323732:web:ed9c5ef8d82d56c546f941',
}

export const firebaseApp = initializeApp(firebaseConfig)
export const auth = getAuth(firebaseApp)
export const db = getFirestore(firebaseApp)
export const isFirebaseConfigured = true
