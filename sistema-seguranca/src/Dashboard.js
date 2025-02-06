import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "./servicos/api";
import { Button, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, CircularProgress } from "@mui/material";
import { jwtDecode } from "jwt-decode";
 // Importar para decodificar o token

const Dashboard = () => {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState(null); // Estado para armazenar a role do usuário
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/");
      return;
    }

    try {
      const decodedToken = jwtDecode(token); // Decodificar o token
      setUserRole(decodedToken.role); // Armazena a role do usuário no estado
    } catch (error) {
      console.error("Erro ao decodificar token:", error);
      navigate("/");
      return;
    }

    const fetchData = async () => {
      try {
        const data = await api.getResources();
        if (data) {
          setResources(data);
        }
      } catch (err) {
        console.error("Erro ao carregar recursos:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate]);

  return (
    <Paper sx={{ padding: 2, margin: "20px", textAlign: "center" }}>
      <Typography variant="h4" gutterBottom>
        Painel de Controle
      </Typography>
      {loading ? (
        <CircularProgress />
      ) : resources.length > 0 ? (
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell><strong>Nome</strong></TableCell>
                <TableCell><strong>Status</strong></TableCell>
                {userRole === "admin" && <TableCell><strong>Ações</strong></TableCell>}
              </TableRow>
            </TableHead>
            <TableBody>
              {resources.map((resource) => (
                <TableRow key={resource.id}>
                  <TableCell>{resource.name}</TableCell>
                  <TableCell>{resource.status}</TableCell>
                  {userRole === "admin" && (
                    <TableCell>
                      <Button variant="contained" color="primary" sx={{ marginRight: 1 }}>
                        Editar
                      </Button>
                      <Button variant="contained" color="secondary">
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
        <Typography variant="h6">Nenhum recurso encontrado.</Typography>
      )}
      {userRole === "admin" && (
        <Button variant="contained" color="success" sx={{ marginTop: 2 }}>
          Adicionar Recurso
        </Button>
      )}
      <Button variant="contained" color="primary" sx={{ marginTop: 2, marginLeft: 2 }} onClick={() => navigate("/relatorios")}>
        Ver Relatórios
      </Button>
    </Paper>
  );
};

export default Dashboard;
