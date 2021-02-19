import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter } from "react-router-dom"
import './index.css';
import CasInteractionsApp from './interactions-app/CasInteractionsApp';

ReactDOM.render(
  <BrowserRouter>
    <React.StrictMode>
      <CasInteractionsApp />
    </React.StrictMode>
  </BrowserRouter>,
  document.getElementById('root')
);