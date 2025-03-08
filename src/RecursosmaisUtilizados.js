import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "./servicos/api";
import {
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Grid,
} from "@mui/material";
import { jwtDecode } from "jwt-decode";

const RecursosmaisUtilizados = () => {
  const [resources, setResources] = useState([]);
  const [, setLoading] = useState(true);
  const [, setUserRole] = useState(null);
  const [editingResource] = useState(null);
  const navigate = useNavigate();


  useEffect(() => {
    const role = localStorage.getItem("userRole");
    setUserRole(role); // Atualiza o estado com o valor salvo no localStorage
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return navigate("/");
    try {
      setUserRole(jwtDecode(token).role);
    } catch {
      return navigate("/");
    }
    (async () => {
      try {
        const data = await api.getResources();
        setResources(data || []);
      } catch (err) {
        console.error("Erro ao carregar recursos:", err);
      } finally {
        setLoading(false);
      }
    })();
  }, [navigate]);

  const getMaintenanceDateStatus = (maintenanceDate) => {
    if (!maintenanceDate) return { color: "white", text: "Sem manutenção" }; // Se não houver data, retorna 'Sem manutenção' e cor branca
    const currentDate = new Date();
    const maintenanceDateObj = new Date(maintenanceDate);
    const timeDifference = currentDate - maintenanceDateObj;
    const oneWeekInMillis = 7 * 24 * 60 * 60 * 1000;
    // Lógica invertida: se for até 1 semana, cor amarela, caso contrário, cor vermelha
    if (timeDifference <= oneWeekInMillis) {
      return {
        color: "yellow",
        text: "Prazo de manutenção acabando em sete dias",
      };
    } else {
      return { color: "red", text: "Prazo esgotado" };
    }
  };
  
  // Dentro do componente
  const maintenanceStatus = getMaintenanceDateStatus(
    editingResource?.maintenanceDate
  ); // Usa optional chaining para evitar erro se editingResource for null

  console.log(maintenanceStatus?.color);

  return (
    <Grid
      container
      justifyContent="center"
      alignItems="center"
      sx={{
        padding: -4,
        margin: "20px",
        marginLeft: "-1px",
        textAlign: "center",
        backgroundColor: "#121212",
        color: "#FFD700",
        boxShadow: "0px 4px 10px rgba(255, 215, 0, 0.5)",
        borderRadius: "10px",
      }}
    >
      <Typography
        variant="h5"
        sx={{ marginTop: 4, color: "#FFD700", fontWeight: "bold" }}
      >
        Recursos Mais Utilizados
      </Typography>
      <TableContainer
        component={Paper}
        sx={{ backgroundColor: "#1C1C1C", color: "#FFFFFF", padding: 2 }}
      >
        <Table>
          <TableHead>
            <TableRow>
              <TableCell sx={{ color: "#FFD700", fontWeight: "bold" }}>
                Recurso
              </TableCell>
              <TableCell sx={{ color: "#FFD700", fontWeight: "bold" }}>
                Disponibilidade
              </TableCell>
              <TableCell sx={{ color: "#FFD700", fontWeight: "bold" }}>
                Tempo de Disponibilidade
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {resources
              .filter((item) => item.status === "Disponível")
              .map((item, index) => {
                const disponibilidade = item.maintenanceDate
                  ? new Date(item.maintenanceDate).toLocaleString("pt-BR", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                      second: "2-digit",
                    })
                  : "N/A";

                const agora = new Date();
                const manutencaoData = item.maintenanceDate
                  ? new Date(item.maintenanceDate)
                  : null;
                let tempoDisponibilidade = "N/A";

                if (manutencaoData) {
                  const diff = Math.floor((agora - manutencaoData) / 1000);
                  const dias = Math.floor(diff / 86400);
                  const horas = Math.floor((diff % 86400) / 3600);
                  const minutos = Math.floor((diff % 3600) / 60);
                  const segundos = diff % 60;

                  tempoDisponibilidade = `${dias}d ${horas}h ${minutos}m ${segundos}s`;
                }

                return (
                  <TableRow key={index} sx={{ backgroundColor: "#2B2B2B" }}>
                    <TableCell sx={{ color: "#FFF" }}>{item.name}</TableCell>
                    <TableCell sx={{ color: "green" }}>
                      {disponibilidade}
                    </TableCell>
                    <TableCell sx={{ color: "green" }}>
                      {tempoDisponibilidade}
                    </TableCell>
                  </TableRow>
                );
              })}
          </TableBody>
        </Table>
      </TableContainer>
    </Grid>
  );
};

export default RecursosmaisUtilizados;
