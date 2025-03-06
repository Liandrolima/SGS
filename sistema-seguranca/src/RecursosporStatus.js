import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "./servicos/api";
import {
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Grid,
} from "@mui/material";
import { jwtDecode } from "jwt-decode";

const RecursosporStatus = () => {
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

  // Agrupa recursos por status
  const statusCounts = resources.reduce((acc, resource) => {
    if (!acc[resource.status]) acc[resource.status] = [];
    acc[resource.status].push(resource.name);
    return acc;
  }, {});
  // Prepara os dados para o gráfico (status e os nomes dos recursos)
  const pieData = Object.entries(statusCounts).map(([status, names]) => ({
    status,
    count: names.length,
    resources: names.join(", "), // Lista de recursos com esse status
  }));

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

  const preprocessData = (pieData, resources) => {
    return pieData.map((item) => {
      const processedResources = item.resources
        .split(",")
        .map((resourceName) => {
          const trimmedResourceName = resourceName.trim(); // Remover espaços extras
          const resource = resources.find(
            (r) => r.name === trimmedResourceName
          );
          return {
            name: trimmedResourceName,
            status: item.status,
            maintenanceDate:
              resource && resource.maintenanceDate
                ? new Date(resource.maintenanceDate).toLocaleString()
                : "N/A",
          };
        });

      return {
        ...item,
        processedResources,
      };
    });
  };

  // Chamando o pré-processamento e gerando o processedData
  const processedData = preprocessData(pieData, resources);

  return (
    <Paper>
      {/* Lista de Recursos */}
      <Grid
        container
        justifyContent="center"
        alignItems="center"
        sx={{
          padding: -4,
          margin: "20px",
          marginLeft: "1px",
          textAlign: "center",
          backgroundColor: "#121212",
          color: "#FFD700",
          boxShadow: "0px 4px 10px rgba(255, 215, 0, 0.5)",
          borderRadius: "10px",
        }}
      >
        <Grid
          item
          xs={12}
          sx={{ display: "flex", justifyContent: "center", width: "100%" }}
        >
          <Typography
            variant="h6"
            align="center"
            sx={{ marginTop: 4, color: "#FFD700", fontWeight: "bold" }}
          >
            Recursos por Status
          </Typography>
        </Grid>
        <Grid
          item
          xs={12}
          sx={{ display: "flex", justifyContent: "center", width: "80%" }}
        >
          <Paper
            sx={{
              padding: 2,
              width: "100%",
              overflow: "auto",
              backgroundColor: "#1C1C1C",
              color: "#FFFFFF",
            }}
          >
            <Table
              sx={{
                backgroundColor: "#1C1C1C",
                color: "#FFFFFF",
                padding: 2,
              }}
            >
              <TableHead>
                <TableRow>
                  <TableCell sx={{ color: "#FFD700", fontWeight: "bold" }}>
                    Nome do Recurso
                  </TableCell>
                  <TableCell sx={{ color: "#FFD700", fontWeight: "bold" }}>
                    Status
                  </TableCell>
                  <TableCell sx={{ color: "#FFD700", fontWeight: "bold" }}>
                    Última Atualização
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {processedData.map((item, index) => {
                  let textColor = "#FFFFFF";
                  if (item.status === "Em manutenção") {
                    textColor = "#FFD700";
                  } else if (item.status === "Disponível") {
                    textColor = "#32CD32";
                  } else if (item.status === "Fora de uso") {
                    textColor = "#FF4500";
                  }
                  return item.processedResources.map((resource, i) => (
                    <TableRow key={i} sx={{ backgroundColor: "#2B2B2B" }}>
                      <TableCell sx={{ color: "#FFF" }}>
                        {resource.name}
                      </TableCell>
                      <TableCell sx={{ color: textColor }}>
                        {item.status}
                      </TableCell>
                      <TableCell sx={{ color: "#FFF" }}>
                        {resource.maintenanceDate}
                      </TableCell>
                    </TableRow>
                  ));
                })}
              </TableBody>
            </Table>
          </Paper>
        </Grid>
      </Grid>
    </Paper>
  );
};

export default RecursosporStatus;
