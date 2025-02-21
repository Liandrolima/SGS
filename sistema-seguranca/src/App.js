import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./Login";
import Dashboard from "./Dashboard";
import Relatorios from "./páginas/Relatorios"; 

function App() {
  const [alerts, setAlerts] = useState([]);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login setAlerts={setAlerts} />} />
        <Route path="/dashboard" element={<Dashboard alerts={alerts} />} />
        <Route path="/relatorios" element={<Relatorios />} />
      </Routes>
    </Router>
  );
}

export default App;
