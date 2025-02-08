import React, { useEffect, useState } from "react"; 
import { useNavigate } from "react-router-dom";
import { api } from "./servicos/api";

import { 
  Button, Typography, Paper, Table, TableBody, TableCell, 
  TableContainer, TableHead, TableRow, CircularProgress, TextField 
} from "@mui/material";
import { jwtDecode } from "jwt-decode";
console.log("🛠️ API importada:", api);

const Dashboard = () => {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState(null);
  const [editingResource, setEditingResource] = useState(null);
  const [newResource, setNewResource] = useState({ name: "", status: "" });
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/");
      return;
    }

    try {
      const decodedToken = jwtDecode(token);
      setUserRole(decodedToken.role);
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

  // Simula salvar um recurso editado
  const handleSaveEdit = () => {
    setResources((prev) => 
      prev.map((res) => (res.id === editingResource.id ? editingResource : res))
    );
    setEditingResource(null);
  };

  // Simula salvar um novo recurso
  const handleSaveNewResource = () => {
    setResources((prev) => [...prev, { id: Date.now(), ...newResource }]);
    setNewResource({ name: "", status: "" });
  };

  return (
    <Paper sx={{ padding: 2, margin: "20px", textAlign: "center" }}>
      <Typography variant="h4" gutterBottom>Painel de Controle</Typography>

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
                      <Button 
                        variant="contained" 
                        color="primary" 
                        sx={{ marginRight: 1 }} 
                        onClick={() => setEditingResource(resource)}
                      >
                        Editar
                      </Button>
                      <Button 
                        variant="contained" 
                        color="secondary" 
                        onClick={() => setResources(resources.filter(res => res.id !== resource.id))}
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
        <Typography variant="h6">Nenhum recurso encontrado.</Typography>
      )}

      {/* Formulário para Editar Recurso */}
      {editingResource && (
        <Paper sx={{ padding: 2, margin: "20px", textAlign: "center" }}>
          <Typography variant="h5">Editar Recurso</Typography>
          <TextField 
            fullWidth 
            label="Nome" 
            value={editingResource.name} 
            onChange={(e) => setEditingResource({ ...editingResource, name: e.target.value })}
            sx={{ marginBottom: 2 }}
          />
          <TextField 
            fullWidth 
            label="Status" 
            value={editingResource.status} 
            onChange={(e) => setEditingResource({ ...editingResource, status: e.target.value })}
            sx={{ marginBottom: 2 }}
          />
          <Button variant="contained" color="primary" onClick={handleSaveEdit}>
            Salvar Alterações
          </Button>
        </Paper>
      )}

      {/* Formulário para Adicionar Novo Recurso */}
      {userRole === "admin" && (
        <Paper sx={{ padding: 2, margin: "20px", textAlign: "center" }}>
          <Typography variant="h5">Adicionar Novo Recurso</Typography>
          <TextField 
            fullWidth 
            label="Nome" 
            value={newResource.name} 
            onChange={(e) => setNewResource({ ...newResource, name: e.target.value })}
            sx={{ marginBottom: 2 }}
          />
          <TextField 
            fullWidth 
            label="Status" 
            value={newResource.status} 
            onChange={(e) => setNewResource({ ...newResource, status: e.target.value })}
            sx={{ marginBottom: 2 }}
          />
          <Button variant="contained" color="success" onClick={handleSaveNewResource}>
            Adicionar Recurso
          </Button>
        </Paper>
      )}

      <Button 
        variant="contained" 
        color="primary" 
        sx={{ marginTop: 2, marginLeft: 2 }} 
        onClick={() => navigate("/relatorios")}
      >
        Ver Relatórios
      </Button>
    </Paper>
  );
};

export default Dashboard;
