import React, { StrictMode } from 'react';
import {createRoot} from 'react-dom/client';
import './index.css';
import App from './App';

import {
  BrowserRouter,
  Routes,
  Route,
  Link
} from "react-router-dom";
import HowToPlay from './Pages/HowToPlay/HowToPlay';

const root = createRoot(document.getElementById('root') as HTMLElement)

root.render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path='/' element={<App />} />
        <Route path='/how-to-play' element={<HowToPlay />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>
)