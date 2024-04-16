import { useEffect, useState } from 'react';
import './App.css';
import Login from './components/Login';
import {Route,Routes} from "react-router-dom"
import Dashboard from './components/Dashboard';
import SharedLayout from './components/SharedLayout';
function App() {

  return (
    <>
      <Routes>
        <Route path="/" element={<SharedLayout />}>
          <Route index element={<Login/>}/>
          <Route path="/dashboard" element={<Dashboard />} />
        </Route>
      </Routes>
    </>
  );
}

export default App;
