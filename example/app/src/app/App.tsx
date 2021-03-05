import React from 'react';
import './App.css';
import ClientConnector from '../components/OidcClient';

function App() {
  return (
    <div className="App">
      <ClientConnector></ClientConnector>
    </div>
  );
}

export default App;
