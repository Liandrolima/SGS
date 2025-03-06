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
import {
  ResponsiveContainer,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const StatusRecursos = () => {
  const [resources, setResources] = useState([]);
  const [, setLoading] = useState(true);
  const [, setUserRole] = useState(null);
  const [editingResource] = useState(null);
  const [, setAccessStats] = useState({
    approved: 0,
    denied: 0, // Inicialmente 0 negados
  });
  const navigate = useNavigate();

  useEffect(() => {
    const deniedCount = parseInt(localStorage.getItem("deniedCount"), 10) || 0;
    const approvedCount = 10 - deniedCount; // Ajuste conforme necessário
    setAccessStats({
      approved: approvedCount,
      denied: deniedCount,
    });
  }, []);

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

  return (
    <Paper
      sx={{
        padding: 3,
        margin: "20px",
        textAlign: "center",
        backgroundColor: "#121212",
        color: "#FFD700",
        boxShadow: "0px 4px 10px rgba(255, 215, 0, 0.5)",
        borderRadius: "10px",
      }}
    >
      {/* Grid container para o gráfico */}
      <Grid
        container
        justifyContent="center"
        alignItems="center"
        sx={{
          padding: 5,
          margin: "1px",
          backgroundColor: "#1c1c1c",
          color: "#f5f5f5",
          borderRadius: 2,
          boxShadow: "0px 0px 10px #ffcc00",
        }}
      >
        <Typography
          variant="h6"
          align="center"
          sx={{
            color: "#FFD700",
            fontSize: "2.0rem",
            fontFamily: '"Bangers", sans-serif', // Fonte inspirada no Batman
          }}
        >
          Status dos Recursos
        </Typography>
        {/* Grid item para o gráfico */}
        <Grid
          item
          xs={12}
          md={9}
          sx={{ display: "flex", justifyContent: "center" }}
        >
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={pieData}
                dataKey="count"
                nameKey="status"
                cx="50%"
                cy="50%"
                outerRadius={100}
              >
                {pieData.map((item, index) => {
                  let fillColor = "#ccc";
                  if (item.status === "Em manutenção") {
                    fillColor = "yellow";
                  } else if (item.status === "Disponível") {
                    fillColor = "green";
                  } else if (item.status === "Fora de uso") {
                    fillColor = "red";
                  }
                  return <Cell key={index} fill={fillColor} />;
                })}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </Grid>

        {/* Tabela de Recursos por Status */}
        <Grid
          item
          xs={12}
          md={9}
          sx={{ display: "flex", justifyContent: "center" }}
        >
          <Paper
            sx={{
              maxHeight: "220px",
              margin: 2,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              padding: 2,
              width: { xs: "100%", sm: "80%", md: "70%" }, // 100% em celulares, 500px em telas maiores
              backgroundColor: "#1C1C1C",
              color: "#FFFFFF",
              boxShadow: "0px 4px 10px rgba(255, 215, 0, 0.5)",
              borderRadius: "10px",
            }}
          >
            <Typography
              variant="h6"
              align="center"
              sx={{
                fontSize: { xs: "0.7rem", sm: "0.9rem", md: "1rem" },
                maxHeight: "40px",
                marginRight: 1,
                marginTop: -2,
                color: "#FFD700",
                fontWeight: "bold",
              }}
            >
              Meta dos Recursos
            </Typography>
            <TableContainer
              component="div"
              sx={{ minWidth: "100px", overflowX: "auto" }}
            ></TableContainer>
            <TableContainer
              component="div"
              sx={{ minWidth: "100px", overflowX: "auto" }}
            >
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell
                      sx={{
                        color: "#FFD700",
                        fontWeight: "bold",
                        textAlign: "center",
                        fontSize: { xs: "0.8rem", sm: "1rem" },
                      }}
                    >
                      Status
                    </TableCell>
                    <TableCell
                      sx={{
                        color: "#FFD700",
                        fontWeight: "bold",
                        textAlign: "center",
                        fontSize: { xs: "0.8rem", sm: "1rem" },
                      }}
                    >
                      Quantidade
                    </TableCell>
                    <TableCell
                      sx={{
                        color: "#FFD700",
                        fontWeight: "bold",
                        textAlign: "center",
                        fontSize: { xs: "0.8rem", sm: "1rem" },
                      }}
                    >
                      Porcentagem
                    </TableCell>
                    <TableCell
                      sx={{
                        color: "#FFD700",
                        fontWeight: "bold",
                        textAlign: "center",
                        fontSize: { xs: "0.8rem", sm: "1rem" },
                      }}
                    >
                      Meta(%)
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {pieData.map((item, index) => {
                    const total = pieData.reduce(
                      (sum, data) => sum + data.count,
                      0
                    );
                    const percentage =
                      total > 0 ? ((item.count / total) * 100).toFixed(2) : 0;
                    const percentageText = `${percentage}%`;

                    let textColor = "#FFFFFF";
                    if (item.status === "Em manutenção") textColor = "#FFD700";
                    else if (item.status === "Disponível")
                      textColor = "#32CD32";
                    else if (item.status === "Fora de uso")
                      textColor = "#FF4500";

                    let metaText = "";
                    let metaColor = "#FFFFFF";
                    if (item.status === "Disponível") {
                      if (percentage >= 80) {
                        metaText = ">= 80 Na meta";
                        metaColor = "#32CD32"; // Verde
                      } else {
                        metaText = "< 80 Fora da meta";
                        metaColor = "#FF4500"; // Vermelho
                      }
                    }

                    if (item.status === "Em manutenção") {
                      if (percentage <= 10) {
                        metaText = "<= 10 Na meta";
                        metaColor = "#32CD32"; // Verde
                      } else {
                        metaText = "> 10 Fora da meta";
                        metaColor = "#FF4500"; // Vermelho
                      }
                    }

                    if (item.status === "Fora de uso") {
                      if (percentage <= 10) {
                        metaText = " <= 10 Na meta";
                        metaColor = "#32CD32"; // Verde
                      } else {
                        metaText = ">10 Fora da meta";
                        metaColor = "#FF4500"; // Vermelho
                      }
                    }

                    return (
                      <TableRow
                        key={index}
                        sx={{ backgroundColor: "#2B2B2B", height: "25px" }}
                      >
                        <TableCell
                          sx={{
                            color: textColor,
                            textAlign: "center",
                            fontSize: { xs: "0.75rem", sm: "1rem" },
                            padding: "5px",
                          }}
                        >
                          {item.status}
                        </TableCell>
                        <TableCell
                          sx={{
                            color: "#FFF",
                            textAlign: "center",
                            fontSize: { xs: "0.75rem", sm: "1rem" },
                            padding: "5px",
                          }}
                        >
                          {item.count}
                        </TableCell>
                        <TableCell
                          sx={{
                            color: "#FFF",
                            textAlign: "center",
                            fontSize: { xs: "0.75rem", sm: "1rem" },
                            padding: "5px",
                          }}
                        >
                          {percentageText}
                        </TableCell>
                        <TableCell
                          sx={{
                            color: metaColor,
                            textAlign: "center",
                            fontSize: { xs: "0.75rem", sm: "1rem" },
                            fontWeight: "bold",
                            padding: "5px",
                          }}
                        >
                          {metaText}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>
      </Grid>
    </Paper>
  );
};

export default StatusRecursos;
