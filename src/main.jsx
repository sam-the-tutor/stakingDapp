import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.scss';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
         refetchOnWindowFocus: false,  
      },
    },
  });

ReactDOM.createRoot(document.getElementById('root') ).render(
    <QueryClientProvider client={queryClient}>
         <BrowserRouter>
        <App />
         </BrowserRouter>
    </QueryClientProvider>
);
