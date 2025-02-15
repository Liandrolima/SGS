import React, { useEffect, useState } from "react";
import axios from 'axios';  // Adicione esta linha no início do seu arquivo
import { useNavigate } from "react-router-dom";
import { api } from "./servicos/api";
import { 
    Button, Typography, Paper, Table, TableBody, TableCell, 
    TableContainer, TableHead, TableRow, CircularProgress, TextField, 
    Grid, Card, CardContent, Snackbar, Alert 
} from "@mui/material";
import { jwtDecode } from "jwt-decode";
import { 
    ResponsiveContainer, BarChart, XAxis, YAxis, Tooltip, Legend, Bar, 
    PieChart, Pie, Cell 
} from "recharts";

import CadastroUsuario from "./CadastroUsuario";

const COLORS = ["#ff0000", "#00ff00", "#0000ff", "#ff00ff"]; 

const Dashboard = () => {
    const [resources, setResources] = useState([]);
    const [loading, setLoading] = useState(true);
    const [userRole, setUserRole] = useState(null);
    const [editingResource, setEditingResource] = useState(null);
    const [newResource, setNewResource] = useState({ name: "", status: "" });
    const [accessStats, setAccessStats] = useState({ approved: 0, denied: 0 });
    const [latestActivities, setLatestActivities] = useState([]);
    const [alerts, setAlerts] = useState([]);
    const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });
    const navigate = useNavigate();


    useEffect(() => {
        const token = localStorage.getItem("token");
        console.log("Token encontrado:", token);
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

    useEffect(() => {
        const fetchData = async () => {
          try {
            // Obtém as atividades
            const activitiesRes = await axios.get('/api/activities');
            console.log("Atividades recebidas:", activitiesRes.data); // Adicione esse log para verificar os dados
            setLatestActivities(activitiesRes.data); // Armazena as atividades
    
            // Obtém os alertas
            const alertsRes = await axios.get('/api/alerts');
            console.log("Alertas recebidos:", alertsRes.data); // Verifica se os alertas estão sendo retornados
            setAlerts(alertsRes.data); // Armazena os alertas
          } catch (error) {
            console.error('Error fetching activities and alerts', error);
          }
        };
    
        fetchData();
      }, []); // Carregar apenas uma vez quando o componente for montado
    
    

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

    const statusCounts = resources.reduce((acc, resource) => {
        acc[resource.status] = (acc[resource.status] || 0) + 1;
        return acc;
    }, {});
    const pieData = Object.entries(statusCounts).map(([status, count]) => ({ status, count }));

    const handleCloseSnackbar = () => setSnackbar({ ...snackbar, open: false });

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

            <Snackbar open={snackbar.open} autoHideDuration={3000} onClose={handleCloseSnackbar}>
                <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: "100%" }}>
                    {snackbar.message}
                </Alert>
            </Snackbar>

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
                                <BarChart data={[{ name: "Acessos", ...accessStats, ...setAccessStats }]}> 
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
                                    <Pie data={pieData} dataKey="count" nameKey="status" cx="50%" cy="50%" outerRadius={80} label>
                                        {pieData.map((_, index) => (
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
            {/* Gráficos */}
           
           {/* Últimas Atividades */}
            <Typography variant="h5" sx={{ marginTop: 4 }}>
            Últimas Atividades
            </Typography>
            <ul>
            {latestActivities.map((activity) => (
                <li key={activity.id}>
                {activity.message} - <span style={{ fontStyle: 'italic', color: 'gray' }}>
                    {activity.timestamp ? new Date(activity.timestamp).toLocaleString('pt-BR', { timeZoneName: 'short' }) : "Sem horário"}
                </span>
                </li>
            ))}
            </ul>

            {/* Alertas de Segurança */}
            <Typography variant="h5" sx={{ marginTop: 4 }}>
            🚨 Alertas de Segurança
            </Typography>
            {alerts.length === 0 ? (
            <Typography color="gray">Nenhum alerta no momento.</Typography>
            ) : (
            <div style={{ border: '1px solid #ccc', padding: '10px', borderRadius: '8px', marginBottom: '20px' }}>
                {alerts.map((alert) => {
                let alertColor = "green"; // Default (sem gravidade)
                if (alert.level === "Alta") alertColor = "red";
                if (alert.level === "Média") alertColor = "orange";

                return (
                    <Typography
                    key={alert.id}
                    sx={{
                        backgroundColor: alertColor,
                        color: 'white',
                        padding: '8px',
                        borderRadius: '5px',
                        marginBottom: '5px'
                    }}
                    >
                    {alert.message} - <strong>{alert.level}</strong>
                    - <span style={{ fontStyle: 'italic' }}>
                        {alert.timestamp ? new Date(alert.timestamp).toLocaleString('pt-BR', { timeZoneName: 'short' }) : "Sem horário"}
                    </span>
                    </Typography>
                );
                })}
            </div>
            )}
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
