import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "./servicos/api";
import { 
    Button, Typography, Paper, Table, TableBody, TableCell, 
    TableContainer, TableHead, TableRow, CircularProgress, TextField, 
    Grid, Card, CardContent 
} from "@mui/material";
import { jwtDecode } from "jwt-decode";
import { 
    ResponsiveContainer, BarChart, XAxis, YAxis, Tooltip, Legend, Bar, 
    PieChart, Pie, Cell 
} from "recharts";

import CadastroUsuario from "./CadastroUsuario";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

const Dashboard = () => {
    const [resources, setResources] = useState([]);
    const [loading, setLoading] = useState(true);
    const [userRole, setUserRole] = useState(null);
    const [editingResource, setEditingResource] = useState(null);
    const [newResource, setNewResource] = useState({ name: "", status: "" });
    const [accessStats, setAccessStats] = useState({ approved: 0, denied: 0 });
    const [alerts, setAlerts] = useState([]);
    const navigate = useNavigate();


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

    const handleSaveEdit = async () => {
        if (!editingResource || !editingResource.id) {
            console.error("Erro: ID do recurso inválido!");
            return;
        }

        try {
            await api.editResource(editingResource.id, editingResource);
            setResources((prev) =>
                prev.map((res) => (res.id === editingResource.id ? editingResource : res))
            );
            setEditingResource(null);
        } catch (error) {
            console.error("Erro ao salvar edição:", error);
        }
    };

    const generateSerialNumber = () => "SN-" + Math.floor(Math.random() * 1000000);

    const handleSaveNewResource = async () => {
        if (!newResource.name || !newResource.status) {
            console.error("Erro: Preencha todos os campos!");
            return;
        }

        const resourceToAdd = { 
            ...newResource, 
            serialNumber: newResource.serialNumber || generateSerialNumber() 
        };

        console.log("📤 Enviando novo recurso:", JSON.stringify(resourceToAdd));

        try {
            const response = await api.addResource(resourceToAdd);
            if (!response || !response.resource) throw new Error("Erro ao adicionar recurso.");

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

    return (
        <Paper sx={{ padding: 2, margin: "20px", textAlign: "center" }}>
            <Typography variant="h4">Painel de Controle</Typography>

            {/* Botão para voltar para a tela de login */}
            <Button 
                variant="outlined" 
                color="secondary" 
                onClick={handleLogout} 
                sx={{ marginTop: 2 }}
            >
                Voltar ao Login
            </Button>

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
                                <TableRow key={resource.id || resource.serialNumber}> 
                                    <TableCell>{resource.name}</TableCell>
                                    <TableCell>{resource.status}</TableCell>
                                    {userRole === "admin" && (
                                        <TableCell>
                                            <Button variant="contained" color="primary" onClick={() => setEditingResource(resource)}>Editar</Button>
                                            <Button variant="contained" color="secondary" onClick={() => handleDeleteResource(resource.id)}>Remover</Button>
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

            {editingResource && (
                <Paper sx={{ padding: 2, margin: "20px" }}>
                    <Typography variant="h5">Editar Recurso</Typography>
                    <TextField 
                        fullWidth 
                        label="Nome" 
                        value={editingResource.name} 
                        onChange={(e) => setEditingResource({ ...editingResource, name: e.target.value })} 
                    />
                    <TextField 
                        fullWidth 
                        label="Status" 
                        value={editingResource.status} 
                        onChange={(e) => setEditingResource({ ...editingResource, status: e.target.value })} 
                    />
                    <Button variant="contained" color="primary" onClick={handleSaveEdit}>Salvar Alterações</Button>
                </Paper>
            )}

            {userRole === "admin" && (
                <Paper sx={{ padding: 2, margin: "20px" }}>
                    <Typography variant="h5">Adicionar Novo Recurso</Typography>
                    <TextField 
                        fullWidth 
                        label="Nome" 
                        value={newResource.name} 
                        onChange={(e) => setNewResource({ ...newResource, name: e.target.value })} 
                    />
                    <TextField 
                        fullWidth 
                        label="Status" 
                        value={newResource.status} 
                        onChange={(e) => setNewResource({ ...newResource, status: e.target.value })} 
                    />
                    <Button variant="contained" color="success" onClick={handleSaveNewResource}>Adicionar</Button>
                </Paper>
            )}
            {(userRole === "admin" || userRole === "gerente") && <CadastroUsuario />}
            <Grid container spacing={2} sx={{ marginTop: 2 }}>
                <Grid item xs={12} md={6}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6">Acessos Restritos</Typography>
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
                <Grid item xs={12} md={6}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6">Status dos Recursos</Typography>
                            <ResponsiveContainer width="100%" height={250}>
                                <PieChart>
                                    <Pie data={resources} dataKey="count" nameKey="status" cx="50%" cy="50%" outerRadius={80} label>
                                        {resources.map((_, index) => (
                                            <Cell key={index} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
            {/* Botão "Voltar ao Login" visível para TODOS os usuários */}
            <Button 
                variant="outlined" 
                color="secondary" 
                onClick={handleLogout} 
                sx={{ marginTop: 2 }}
            >
                Voltar ao Login
            </Button>
        </Paper>
    );
};

export default Dashboard;
