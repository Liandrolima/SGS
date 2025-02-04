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
        const data = await api.getResources(token);
        setResources(data);
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
        {resources.map((resource, index) => (
          <li key={index}>{resource.nome}</li>
        ))}
      </ul>
    </div>
  );
};

export default Dashboard;
