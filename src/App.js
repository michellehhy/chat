import React, { useRef, useState } from 'react';
import './App.css';

import firebase from 'firebase/compat/app'
import 'firebase/compat/auth';
import 'firebase/compat/firestore';

import {useAuthState} from 'react-firebase-hooks/auth';
import {useCollectionData} from 'react-firebase-hooks/firestore';

firebase.initializeApp({
  apiKey: "AIzaSyCN7sod_DQljexsw24LDTRlUWUyM6kjc1Y",
  authDomain: "chat-d4019.firebaseapp.com",
  projectId: "chat-d4019",
  storageBucket: "chat-d4019.appspot.com",
  messagingSenderId: "586987416350",
  appId: "1:586987416350:web:51b651f1f34381af4f770f"
})

const auth = firebase.auth();
const firestore = firebase.firestore();

function App() {

  const [user] = useAuthState(auth);

  return (
    <div className="App">
      <header >
        
      </header>

      <section>
        {user ? <ChatRoom /> : <SignIn />}
      </section>
    </div>
  );
}

function SignIn(){

  const signInWithGoogle = () => {
    const provider = new firebase.auth.GoogleAuthProvider();
    auth.signInWithPopup(provider);
  }

  return(
    <button className="signIn" onClick={signInWithGoogle}>Sign in with Google</button>
  )
}

function SignOut(){
  //check if there is current user
  return auth.currentUser && (
    <button className ="signOut" onClick={() => auth.signOut()}>Sign Out</button>
  )
}

function ChatRoom (){
  const dummy = useRef();
  const messagesRef = firestore.collection('messages');
  const query = messagesRef.orderBy('createdAt').limit(25);

  //listen to data in real time with use Collection Data hook 
  //return an array of objects of messages 
  const [messages] = useCollectionData(query, { idField: 'id' });

  const [formValue, setFormValue] = useState('');

  const sendMessage = async (e) => {
    e.preventDefault();

  const { uid, photoURL } = auth.currentUser;

    //write new doc to database
  await messagesRef.add({
    text: formValue,
    createdAt: firebase.firestore.FieldValue.serverTimestamp(),
    uid,
    photoURL
  });

    setFormValue('');
    dummy.current.scrollIntoView({ behavior: 'smooth' });
  }


  return(
    <>
    <main>

      {/* use chat component with key property to map to message property */}
      {messages && messages.map(msg => <ChatMessage key = {msg.id} message = {msg}/> )}
      
      {/* to automatically scroll to bottom */}
      <div ref={dummy}></div>

    </main>

    
      <form onSubmit={sendMessage}>

      {/* bind state to form input  */}
      <input value={formValue} onChange={(e) => setFormValue(e.target.value)} placeholder="say something" />

      <button type="submit" disabled={!formValue}>🕊️</button>

    </form>
        

    </>
  )
}

function ChatMessage(props) {
  const {text, uid, photoURL} = props.message;

  //check who send the message
  const messageClass = uid === auth.currentUser.uid ? 'sent' : 'received';


  return (
    <div className={`message ${messageClass}`}>
      <img src={photoURL}/>
      <p>{text}</p>
    </div>
  )
}

export default App;
