// src/App.jsx
import React from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Landing from "./pages/Landing.jsx";
import Demo from "./pages/Demo.jsx";
import Discussion from "./pages/Discussion.jsx";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/demo" element={<Demo />} />
        <Route path="/discussion" element={<Discussion />} />
      </Routes>
    </BrowserRouter>
  );
}
