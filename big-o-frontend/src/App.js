import React from 'react';
import Document from "./Document";
import './App.css';

function App() {
  window.sessionStorage.getItem("username")
  return (
    <Document/>
  );
}

export default App;
