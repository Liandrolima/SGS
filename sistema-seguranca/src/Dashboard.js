import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "./servicos/api";

const Dashboard = () => {
  const [resources, setResources] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/");
      return;
    }

    const fetchData = async () => {
      try {
        const data = await api.getResources(); // 🔥 Removido o argumento 'token'
        if (data) {
          setResources(data);
        }
      } catch (err) {
        console.error("Erro ao carregar recursos:", err);
      }
    };

    fetchData();
  }, [navigate]);

  return (
    <div>
      <h2>Dashboard</h2>
      <ul>
        {resources.length > 0 ? (
          resources.map((resource) => (
            <li key={resource.id}>
              <strong>{resource.name}</strong> ({resource.serialNumber}) <br />
              📍 Local: {resource.location} | 🏷️ Status: {resource.status}
            </li>
          ))
        ) : (
          <p>Nenhum recurso encontrado.</p>
        )}
      </ul>

    </div>
  );
};

export default Dashboard;
