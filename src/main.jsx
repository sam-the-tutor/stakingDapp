import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.scss';
import { idlFactory, canisterId } from './declarations/backend';

ReactDOM.createRoot(document.getElementById('root')).render(
        <App />
);
