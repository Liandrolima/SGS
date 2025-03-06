import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "./servicos/api";
import {
  Typography,
  Grid,
  Card,
  CardContent,
} from "@mui/material";
import { jwtDecode } from "jwt-decode";
import {
  ResponsiveContainer,
  BarChart,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  Bar,
} from "recharts";

const AcessosRestritos = () => {
  const [userRole, setUserRole] = useState(null);
  const [accessStats, setAccessStats] = useState({
    approved: 0,
    denied: 0,
  });
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return navigate("/");

    try {
      const decoded = jwtDecode(token);
      setUserRole(decoded.role);
    } catch {
      navigate("/");
    }

    const deniedCount = parseInt(localStorage.getItem("deniedCount"), 10) || 0;
    const approvedCount = parseInt(localStorage.getItem("approvedCount"), 10) || 0;
    setAccessStats({ approved: approvedCount, denied: deniedCount });

    (async () => {
      try {
        const data = await api.getResources();
        console.log("Recursos carregados:", data);
      } catch (err) {
        console.error("Erro ao carregar recursos:", err);
      }
    })();
  }, [navigate]);

  const resetAccessCounts = () => {
    if (userRole === "admin") {
      localStorage.setItem("deniedCount", "0");
      localStorage.setItem("approvedCount", "0");
      setAccessStats({ approved: 0, denied: 0 });
      console.log("Contadores de acessos resetados");
    } else {
      alert("Apenas administradores podem resetar os contadores de acessos.");
    }
  };

  return (
    <Grid container spacing={2} sx={{ marginTop: 2 }}>
      <Grid item xs={12}>
        <Card
          sx={{
            backgroundColor: "#1c1c1c",
            color: "white",
            borderRadius: "12px",
            boxShadow: "0px 0px 10px rgba(255, 215, 0, 0.3)",
          }}
        >
          <CardContent>
            <button
              onClick={resetAccessCounts}
              style={{
                background: "#FFD700",
                color: "#1c1c1c",
                border: "none",
                padding: "10px 15px",
                borderRadius: "6px",
                fontWeight: "bold",
                cursor: "pointer",
                transition: "0.3s",
                marginBottom: "15px",
              }}
            >
              Resetar Contagem de Acessos
            </button>
            <Typography variant="h6" sx={{ color: "#FFD700", marginBottom: "15px" }}>
              Acessos Restritos
            </Typography>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={[{ name: "Acessos", ...accessStats }]}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="approved" fill="#4CAF50" name="Aprovados" />
                <Bar dataKey="denied" fill="#F44336" name="Negados" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
};

export default AcessosRestritos;