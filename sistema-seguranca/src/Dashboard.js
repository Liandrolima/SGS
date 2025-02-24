import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "./servicos/api";
import {
  Button,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  TextField,
  Grid,
  Card,
  CardContent,
  Snackbar,
  Alert,
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
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { Box } from "@mui/material";

import imagemLogin from "./imagens/batmancarro.png"; // Importe corretamente a imagem

import CadastroUsuario from "./CadastroUsuario";
import RemoverUsuario from "./RemoverUsuario";

const Dashboard = () => {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState(null);
  const [editingResource, setEditingResource] = useState(null);
  const [newResource, setNewResource] = useState({ name: "", status: "" });
  const [accessStats, setAccessStats] = useState({
    approved: 0,
    denied: 0, // Inicialmente 0 negados
  });
  const [alertTable, setAlertTable] = useState([]);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const navigate = useNavigate();
  const [usuarios, setUsuarios] = useState([]);

  useEffect(() => {
    const fetchUsuarios = async () => {
      try {
        const data = await api.getUsuarios();
        setUsuarios(data);
      } catch (error) {
        console.error("Erro ao buscar usuários:", error);
      }
    };
    fetchUsuarios();
  }, []);
  usuarios.map((usuario) => (
    <tr key={usuario.email}>
      <td>{usuario.nome || "Nome não disponível"}</td>
      <td>{usuario.email}</td>
      <td>{usuario.role}</td>
      <td>{usuario.dataCriacao || "Data não disponível"}</td>
    </tr>
  ));

  useEffect(() => {
    const deniedCount = parseInt(localStorage.getItem("deniedCount"), 10) || 0;
    const approvedCount = 10 - deniedCount; // Ajuste conforme necessário
    setAccessStats({
      approved: approvedCount,
      denied: deniedCount,
    });
  }, []);

  const resetAccessCounts = () => {
    // Recuperar o perfil do usuário do localStorage
    // Supondo que o perfil esteja armazenado assim

    // Verifica se o usuário é um administrador
    if (userRole === "admin") {
      localStorage.removeItem("deniedCount"); // Remove contagem de acessos negados
      localStorage.removeItem("approvedCount"); // Remove contagem de acessos aprovados

      setAccessStats({
        approved: 0, // Reseta os contadores para 0
        denied: 0,
      });

      console.log("Contadores de acessos resetados");
    } else {
      // Caso o usuário não seja admin, exibe um aviso
      console.log(
        "Você não tem permissão para resetar os contadores de acessos."
      );
      alert("Apenas administradores podem resetar os contadores de acessos.");
    }
  };

  useEffect(() => {
    /* localStorage.removeItem("alerts");*/
    // Ou, se você quiser limpar apenas a parte dos alertas/*
    /*  localStorage.setItem("alerts", JSON.stringify([])); // Limpa os alertas do localStorage
            // Ou, se você quiser limpar apenas a parte dos alertas 
        */
    // Carregar alertas do localStorage
    const alertsFromStorage = JSON.parse(localStorage.getItem("alerts"));
    console.log("Alertas carregados:", alertsFromStorage);

    if (alertsFromStorage) {
      setAlertTable(alertsFromStorage); // Atualizar o estado com os alertas carregados
    }
  }, []);

  useEffect(() => {
    const role = localStorage.getItem("userRole");
    setUserRole(role); // Atualiza o estado com o valor salvo no localStorage
  }, []);

  // Verifica se o usuário é um administrador
  const resetAlerts = () => {
    if (userRole === "admin") {
      localStorage.setItem("alerts", JSON.stringify([])); // Limpa todos os alertas
      setAlertTable([]); // Atualiza o estado da tabela para vazio
      console.log("Alertas resetados");
    } else {
      // Caso o usuário não seja admin, exibe um aviso
      console.log("Você não tem permissão para resetar os Alertas.");
      alert("Apenas administradores podem resetar os Alertas.");
    }
  };

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

  const generateSerialNumber = () =>
    "SN-" + Math.floor(Math.random() * 1000000);
  const handleSaveNewResource = async () => {
    if (!newResource.name || !newResource.status) {
      console.error("Erro: Preencha todos os campos!");
      return;
    }
    const resourceToAdd = {
      ...newResource,
      serialNumber: newResource.serialNumber || generateSerialNumber(),
    };
    console.log("📤 Enviando novo recurso:", JSON.stringify(resourceToAdd));
    try {
      const response = await api.addResource(resourceToAdd);
      if (!response || !response.resource)
        throw new Error("Erro ao adicionar recurso.");
      setResources((prevResources) => [...prevResources, response.resource]);
      setNewResource({ name: "", status: "", serialNumber: "" });
      // 🔥 Recarrega os recursos para garantir que a lista seja atualizada
      const updatedResources = await api.getResources();
      setResources(updatedResources);
    } catch (error) {
      console.error("Erro ao adicionar recurso:", error);
    }
  };
  const handleDeleteResource = async (id) => {
    if (!id) return console.error("Erro: ID inválido!");
    try {
      await api.deleteResource(id);
      setResources((prev) => prev.filter((res) => res.id !== id));
    } catch (error) {
      console.error("Erro ao remover recurso:", error);
    }
  };
  // Função para redirecionar para a tela de login
  const handleLogout = () => {
    localStorage.removeItem("token"); // Remova o token do localStorage
    navigate("/"); // Redireciona para a página de login
  };
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

  const handleCloseSnackbar = () => setSnackbar({ ...snackbar, open: false });

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
  const handleSaveEdit = async () => {
    if (!editingResource || !editingResource.id) {
      console.error("Erro: ID do recurso inválido!");
      return;
    }
    try {
      await api.editResource(editingResource.id, editingResource);
      setResources((prev) =>
        prev.map((res) =>
          res.id === editingResource.id ? editingResource : res
        )
      );
      setEditingResource(null);
    } catch (error) {
      console.error("Erro ao salvar edição:", error);
    }
  };

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
      {/* Grid item para a imagem (lado esquerdo) */}
      <Grid
        item
        xs={12}
        md={3}
        sx={{
          display: "flex",
          justifyContent: "flex-start",
          marginTop: "-10px",
          marginBottom: "-10%",
          marginLeft: "10%",
        }}
      >
        <img
          src={imagemLogin}
          alt="Imagem de Login"
          style={{
            width: "1000px", // Defina o tamanho que deseja para a imagem
            height: "150px", // A altura deve ser igual à largura para garantir que seja um círculo perfeito
            borderRadius: "50%", // Torna a imagem circular
            marginRight: "20px",
            objectFit: "cover", // Garante que a imagem se ajuste ao círculo sem distorções
            animation: "moveLeftRight 2s linear infinite",
          }}
        />
      </Grid>

      <Typography
        variant="h4"
        sx={{ fontWeight: "bold", textTransform: "uppercase" }}
      >
        Painel de Controle
      </Typography>

      {/* Botão para voltar para a tela de login */}
      <Button
        variant="contained"
        sx={{
          backgroundColor: "#FFD700",
          color: "#121212",
          fontWeight: "bold",
          marginTop: 2,
          "&:hover": { backgroundColor: "#C5A200" },
        }}
        onClick={handleLogout}
      >
        Voltar ao Login
      </Button>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>

      {loading ? (
        <CircularProgress sx={{ color: "#FFD700" }} />
      ) : resources.length > 0 ? (
        <TableContainer
          sx={{
            backgroundColor: "#1c1c1c",
            borderRadius: 2,
            boxShadow: "0 4px 10px rgba(255, 223, 0, 0.3)",
            marginTop: 3,
          }}
        >
          <Typography
            variant="h6"
            align="center"
            sx={{ marginTop: -1, color: "#FFD700", fontWeight: "bold" }}
          >
            Painel de Recursos
          </Typography>
          <Table sx={{ backgroundColor: "#1E1E1E", borderRadius: "10px" }}>
            <TableHead>
              <TableRow sx={{ backgroundColor: "#333", color: "#FFD700" }}>
                <TableCell sx={{ fontWeight: "bold", color: "#FFD700" }}>
                  Nome
                </TableCell>
                <TableCell sx={{ fontWeight: "bold", color: "#FFD700" }}>
                  Status
                </TableCell>

                {(userRole === "admin" || userRole === "gerente") && (
                  <TableCell sx={{ fontWeight: "bold", color: "#FFD700" }}>
                    Ações
                  </TableCell>
                )}
              </TableRow>
            </TableHead>
            <TableBody>
              {resources.map((resource) => (
                <TableRow
                  key={resource.id || resource.serialNumber}
                  sx={{ "&:hover": { backgroundColor: "#292929" } }}
                >
                  <TableCell sx={{ color: "#FFF" }}>{resource.name}</TableCell>
                  <TableCell
                    sx={{
                      color:
                        resource.status === "Disponível"
                          ? "#00FF00"
                          : resource.status === "Em manutenção"
                          ? "#FFA500"
                          : "#FF0000",
                    }}
                  >
                    {resource.status}
                  </TableCell>
                  {(userRole === "admin" || userRole === "gerente") && (
                    <TableCell>
                      <Button
                        variant="contained"
                        sx={{
                          backgroundColor: "#1976D2",
                          color: "#FFF",
                          marginRight: 1,
                          "&:hover": { backgroundColor: "#125A9E" },
                        }}
                        onClick={() => setEditingResource(resource)}
                      >
                        Editar
                      </Button>

                      <Button
                        variant="contained"
                        sx={{
                          backgroundColor: "#D32F2F",
                          color: "#FFF",
                          "&:hover": { backgroundColor: "#A52A2A" },
                        }}
                        onClick={() => handleDeleteResource(resource.id)}
                      >
                        Remover
                      </Button>
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      ) : (
        <Typography variant="h6" sx={{ marginTop: 2, color: "#FFD700" }}>
          Nenhum recurso encontrado.
        </Typography>
      )}
      {editingResource && (
        <Paper
          sx={{
            padding: 3,
            margin: "20px",
            backgroundColor: "#1c1c1c",
            color: "#f5f5f5",
            borderRadius: 2,
            boxShadow: "0px 0px 10px #ffcc00",
          }}
        >
          <Typography variant="h5" sx={{ color: "#F8D210" }}>
            Editar Recurso
          </Typography>

          <TextField
            fullWidth
            label="Nome"
            value={editingResource.name}
            onChange={(e) =>
              setEditingResource({ ...editingResource, name: e.target.value })
            }
            sx={{ backgroundColor: "#333", color: "#FFF", borderRadius: "4px" }}
            InputLabelProps={{ style: { color: "#F8D210" } }}
          />

          <TextField
            fullWidth
            label="Status"
            select
            value={editingResource.status}
            onChange={(e) => {
              const newStatus = e.target.value;
              let newResource = { ...editingResource, status: newStatus };
              newResource.maintenanceDate = new Date().toISOString();
              setEditingResource(newResource);
            }}
            SelectProps={{ native: true }}
            sx={{
              backgroundColor: "#333",
              color: "#FFF",
              borderRadius: "4px",
              marginTop: 2,
            }}
            InputLabelProps={{ style: { color: "#F8D210" } }}
          >
            <option value="Disponível">Disponível</option>
            <option value="Em manutenção">Em manutenção</option>
            <option value="Fora de uso">Fora de uso</option>
          </TextField>

          {editingResource.status === "Disponível" && (
            <TextField
              fullWidth
              label="Data de Disponibilidade"
              value={
                editingResource?.maintenanceDate
                  ? new Date(editingResource.maintenanceDate).toLocaleString()
                  : ""
              }
              InputProps={{ readOnly: true }}
              sx={{
                marginTop: 2,
                backgroundColor: "#008000",
                color: "#FFF",
                borderRadius: "4px",
              }}
              InputLabelProps={{ style: { color: "#FFF" } }}
            />
          )}

          {editingResource.status === "Em manutenção" && (
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                backgroundColor: "#FFD700",
                padding: 2,
                borderRadius: 1,
              }}
            >
              <TextField
                label="Data de Início da Manutenção"
                value={
                  editingResource?.maintenanceDate
                    ? new Date(editingResource.maintenanceDate).toLocaleString()
                    : ""
                }
                InputProps={{ readOnly: true }}
                sx={{
                  flexGrow: 1,
                  border: "none",
                  backgroundColor: "transparent",
                  color: "#000",
                }}
                InputLabelProps={{ style: { color: "#000" } }}
              />
              <Typography variant="body2" sx={{ color: "#000", marginLeft: 1 }}>
                {maintenanceStatus.text}
              </Typography>
            </Box>
          )}

          {editingResource.status === "Fora de uso" && (
            <TextField
              fullWidth
              label="Data de Inatividade"
              value={
                editingResource?.maintenanceDate
                  ? new Date(editingResource.maintenanceDate).toLocaleString()
                  : ""
              }
              InputProps={{ readOnly: true }}
              sx={{
                marginTop: 2,
                backgroundColor: "#B22222",
                color: "#FFF",
                borderRadius: "4px",
              }}
              InputLabelProps={{ style: { color: "#FFF" } }}
            />
          )}

          <Button
            variant="contained"
            sx={{ backgroundColor: "#F8D210", color: "#000", marginTop: 2 }}
            onClick={handleSaveEdit}
          >
            Salvar Alterações
          </Button>
        </Paper>
      )}

      {(userRole === "admin" || userRole === "gerente") && (
        <Paper
          sx={{
            padding: 3,
            margin: "20px",
            backgroundColor: "#1c1c1c",
            color: "#f5f5f5",
            borderRadius: 2,
            boxShadow: "0px 0px 10px #ffcc00",
          }}
        >
          <Typography variant="h5" sx={{ color: "#ffcc00" }}>
            Adicionar Novo Recurso
          </Typography>

          {/* Nome do recurso */}
          <TextField
            fullWidth
            label="Nome"
            value={newResource.name}
            onChange={(e) =>
              setNewResource({ ...newResource, name: e.target.value })
            }
            sx={{
              backgroundColor: "#333",
              borderRadius: 1,
              input: { color: "#f5f5f5" },
            }}
            InputLabelProps={{ style: { color: "#F8D210" } }}
          />

          {/* Status do recurso */}
          <TextField
            fullWidth
            label="Status"
            select
            value={newResource.status}
            onChange={(e) => {
              const newStatus = e.target.value;
              let newResourceCopy = { ...newResource, status: newStatus };

              if (newStatus === "Em manutenção") {
                if (!newResourceCopy.maintenanceDate) {
                  newResourceCopy.maintenanceDate = new Date().toISOString();
                }
              } else {
                if (!newResourceCopy.availabilityDate) {
                  newResourceCopy.availabilityDate = new Date().toISOString();
                }
              }

              setNewResource(newResourceCopy);
            }}
            SelectProps={{
              native: true,
            }}
            sx={{
              backgroundColor: "#333",
              color: "#FFF",
              borderRadius: "4px",
              marginTop: 2,
            }}
            InputLabelProps={{ style: { color: "#F8D210" } }}
          >
            <option value="Disponível">Disponível</option>
            <option value="Em manutenção">Em manutenção</option>
            <option value="Fora de uso">Fora de uso</option>
          </TextField>

          {/* Data em que o novo recurso ficou disponível */}
          {newResource.status === "Disponível" && (
            <TextField
              fullWidth
              label="Data de Disponibilidade"
              value={
                newResource.availabilityDate
                  ? new Date(newResource.availabilityDate).toLocaleString(
                      "pt-BR"
                    )
                  : ""
              }
              InputProps={{ readOnly: true }}
              sx={{
                marginTop: 2,
                backgroundColor: "green",
                color: "#f5f5f5",
              }}
            />
          )}

          {/* Data de início da manutenção */}
          {newResource.status === "Em manutenção" && (
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                backgroundColor: "yellow",
                padding: 2,
                borderRadius: 1,
              }}
            >
              <TextField
                label="Data de Início da Manutenção"
                value={
                  newResource.maintenanceDate
                    ? new Date(newResource.maintenanceDate).toLocaleString(
                        "pt-BR"
                      )
                    : ""
                }
                InputProps={{ readOnly: true }}
                sx={{
                  backgroundColor: "transparent",
                  color: "black",
                  flexGrow: 1,
                }}
              />
              <Typography
                variant="body2"
                sx={{ color: "black", marginLeft: 1 }}
              >
                Após adicionar, a manutenção vencerá em sete dias
              </Typography>
            </Box>
          )}

          {/* Data em que o novo recurso ficou Fora de uso */}
          {newResource.status === "Fora de uso" && (
            <TextField
              fullWidth
              label="Data Fora de Uso"
              value={
                newResource.availabilityDate
                  ? new Date(newResource.availabilityDate).toLocaleString(
                      "pt-BR"
                    )
                  : ""
              }
              InputProps={{ readOnly: true }}
              sx={{ marginTop: 2, backgroundColor: "red", color: "#f5f5f5" }}
            />
          )}

          {/* Botão para adicionar o novo recurso */}
          <Button
            variant="contained"
            color="success"
            onClick={handleSaveNewResource}
            sx={{
              marginTop: 2,
              backgroundColor: "#ffcc00",
              color: "#000",
              "&:hover": { backgroundColor: "#e6b800" },
            }}
          >
            Adicionar
          </Button>
        </Paper>
      )}

      {userRole === "admin" && <CadastroUsuario />}
      {userRole === "admin" && <RemoverUsuario />}

      {userRole === "admin" && (
        <Paper
          sx={{
            padding: 3,
            marginTop: 4,
            backgroundColor: "#1c1c1c",
            color: "#f5f5f5",
            borderRadius: 2,
            boxShadow: "0px 0px 10px #ffcc00",
          }}
        >
          <Typography variant="h5" sx={{ fontWeight: "bold", marginBottom: 2 }}>
            Lista de Usuários
          </Typography>
          <TableContainer component={Paper} sx={{ backgroundColor: "#333" }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ color: "#fdd835", fontWeight: "bold" }}>
                    Nome
                  </TableCell>
                  <TableCell sx={{ color: "#fdd835", fontWeight: "bold" }}>
                    E-mail
                  </TableCell>
                  <TableCell sx={{ color: "#fdd835", fontWeight: "bold" }}>
                    Função
                  </TableCell>
                  <TableCell sx={{ color: "#fdd835", fontWeight: "bold" }}>
                    Data de Criação
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {usuarios.map((usuario) => (
                  <TableRow key={usuario.email}>
                    <TableCell sx={{ color: "#fff" }}>{usuario.nome}</TableCell>
                    <TableCell sx={{ color: "#fff" }}>
                      {usuario.email}
                    </TableCell>
                    <TableCell sx={{ color: "#fff" }}>{usuario.role}</TableCell>
                    <TableCell sx={{ color: "#fff" }}>
                      {new Date(usuario.createdAt).toLocaleDateString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}

      {userRole === "admin" && (
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
                <Typography
                  variant="h6"
                  sx={{ color: "#FFD700", marginBottom: "15px" }}
                >
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
      )}

      {(userRole === "admin" || userRole === "gerente") && (
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
                          total > 0
                            ? ((item.count / total) * 100).toFixed(2)
                            : 0;
                        const percentageText = `${percentage}%`;

                        let textColor = "#FFFFFF";
                        if (item.status === "Em manutenção")
                          textColor = "#FFD700";
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
      )}

      {(userRole === "admin" || userRole === "gerente") && (
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
      )}
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

      {(userRole === "admin" || userRole === "gerente") && (
        <div
          style={{
            background: "#1c1c1c",
            color: "white",
            padding: "20px",
            borderRadius: "12px",
            boxShadow: "0px 0px 10px rgba(255, 215, 0, 0.3)",
            maxWidth: "100%",
            overflowX: "auto", // Permite que a tabela role horizontalmente se necessário
          }}
        >
          <button
            onClick={resetAlerts}
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
              width: "100%", // Em telas menores, botão ocupa toda a largura
              maxWidth: "300px", // Evita ficar muito largo
            }}
          >
            Resetar Alertas
          </button>

          <h2
            style={{
              color: "#FFD700",
              marginBottom: "15px",
              textAlign: "center",
            }}
          >
            ⚠️ Alertas de Segurança
          </h2>

          <div style={{ width: "100%", overflowX: "auto" }}>
            <table
              style={{
                width: "100%",
                minWidth: "500px", // Garante que a tabela não fique muito pequena
                borderCollapse: "collapse",
                background: "#333",
                borderRadius: "8px",
              }}
            >
              <thead>
                <tr style={{ background: "#222" }}>
                  {["Data e Hora", "Email", "Mensagem", "Nível de Risco"].map(
                    (title) => (
                      <th
                        key={title}
                        style={{
                          padding: "10px",
                          color: "#FFD700",
                          borderBottom: "2px solid #FFD700",
                          fontSize: "0.9rem",
                          textAlign: "center",
                        }}
                      >
                        {title}
                      </th>
                    )
                  )}
                </tr>
              </thead>
              <tbody>
                {alertTable && alertTable.length > 0 ? (
                  alertTable.map((alert, index) => (
                    <tr
                      key={index}
                      style={{
                        background: index % 2 === 0 ? "#2a2a2a" : "#1c1c1c",
                      }}
                    >
                      <td
                        style={{
                          padding: "10px",
                          color: "white",
                          textAlign: "center",
                          fontSize: "0.85rem",
                        }}
                      >
                        {alert.timestamp}
                      </td>
                      <td
                        style={{
                          padding: "10px",
                          color: "white",
                          textAlign: "center",
                          fontSize: "0.85rem",
                        }}
                      >
                        {alert.email}
                      </td>
                      <td
                        style={{
                          padding: "10px",
                          color: "white",
                          textAlign: "center",
                          fontSize: "0.85rem",
                        }}
                      >
                        {alert.alertMessage}
                      </td>
                      <td
                        style={{
                          padding: "10px",
                          fontWeight: "bold",
                          textAlign: "center",
                          fontSize: "0.85rem",
                          color:
                            alert.riskLevel === "Alto"
                              ? "red"
                              : alert.riskLevel === "Médio"
                              ? "orange"
                              : "green",
                        }}
                      >
                        {alert.riskLevel}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan="4"
                      style={{
                        textAlign: "center",
                        padding: "10px",
                        color: "gray",
                      }}
                    >
                      Nenhum alerta encontrado
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
      {/* Botão "Voltar ao Login" visível para TODOS os usuários */}
      <Button
        variant="outlined"
        color="secondary"
        onClick={handleLogout}
        sx={{ marginTop: 2, color: "white", borderColor: "#FFD700" }}
      >
        Voltar ao Login
      </Button>
    </Paper>
  );
};

export default Dashboard;
