import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey:            'AIzaSyDHi7nL2hMSVl-vbdrXNNSQro0yqfK_EL0',
  authDomain:        'suriname-quest.firebaseapp.com',
  projectId:         'suriname-quest',
  storageBucket:     'suriname-quest.firebasestorage.app',
  messagingSenderId: '235613739866',
  appId:             '1:235613739866:web:87e5761aafe895ee40b163',
  measurementId:     'G-0JRHG2D59S',
}

const app = initializeApp(firebaseConfig)

export const auth = getAuth(app)
export const db   = getFirestore(app)
export default app