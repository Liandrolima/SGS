import React, { useEffect, useState } from "react";
import axios from 'axios';
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
import { Box } from '@mui/material';


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
    const [usageStats] = useState([]);
    const [userActivityStats] = useState([]);
    const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });
    const navigate = useNavigate();
    const token = localStorage.getItem('token');

    const fetchData = async () => {
        try {
          const alertasResponse = await axios.get('http://localhost:5000/api/alerts', {
            headers: {
              'Authorization': `Bearer ${token}`,
            }
          });
          console.log('Alertas recebidos:', alertasResponse.data);
          setAlerts(alertasResponse.data);
      
          const atividadesResponse = await axios.get('http://localhost:5000/api/activities', {
            headers: {
              'Authorization': `Bearer ${token}`,
            }
          });
          console.log('Atividades recebidas:', atividadesResponse.data);
          setLatestActivities(atividadesResponse.data);
        } catch (error) {
          console.error('Erro ao buscar alertas ou atividades:', error);
        }
      };
      
      useEffect(() => {
        fetchData(); // Chama a função externa
      }, [token]); // Use 'token' como dependência estável
      
      

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
        if (!maintenanceDate) return { color: 'white', text: 'Sem manutenção' };
    
        const currentDate = new Date();
        const maintenanceDateObj = new Date(maintenanceDate);
    
        // Calcula a diferença em milissegundos
        const timeDifference = currentDate - maintenanceDateObj;
    
        // Uma semana em milissegundos
        const oneWeekInMillis = 7 * 24 * 60 * 60 * 1000; // 7 dias em milissegundos
    
        if (timeDifference <= oneWeekInMillis) {
            return { color: 'yellow', text: 'Prazo de manutenção acabando' }; // Amarelo se a manutenção for até 1 semana
        } else {
            return { color: 'red', text: 'Prazo esgotado' }; // Vermelho se for mais de 1 semana
        }
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
                        select
                        value={editingResource.status}
                        onChange={(e) => {
                            const newStatus = e.target.value;
                            // Se o status for "Em manutenção", preenche a data de início
                            const newResource = { ...editingResource, status: newStatus };
                            if (newStatus === "Em manutenção" && !newResource.maintenanceDate) {
                                newResource.maintenanceDate = new Date().toLocaleString();
                            }
                            setEditingResource(newResource);
                        }}
                        SelectProps={{
                            native: true,
                        }}
                    >
                        <option value="Disponível">Disponível</option>
                        <option value="Em manutenção">Em manutenção</option>
                        <option value="Fora de uso">Fora de uso</option>
                    </TextField>
                
                    {editingResource.status === "Em manutenção" && (
                        <Box sx={{ display: 'flex', alignItems: 'center', marginTop: 2 }}>
                            <TextField
                                fullWidth
                                label="Data de Início da Manutenção"
                                value={editingResource.maintenanceDate || ''}
                                InputProps={{
                                    readOnly: true,
                                }}
                                sx={{
                                    marginRight: 2,
                                    backgroundColor: getMaintenanceDateStatus(editingResource.maintenanceDate).color, // Cor de fundo
                                    flexGrow: 1,
                                }}
                            />
                            <Typography variant="body1" sx={{ color: getMaintenanceDateStatus(editingResource.maintenanceDate).color }}>
                                {getMaintenanceDateStatus(editingResource.maintenanceDate).text} 
                            </Typography>
                        </Box>
                    )}
                
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
                            select
                            value={newResource.status}
                            onChange={(e) => setNewResource({ ...newResource, status: e.target.value })}
                            SelectProps={{
                                native: true,
                            }}
                        >
                            <option value="Disponível">Disponível</option>
                            <option value="Em manutenção">Em manutenção</option>
                            <option value="Fora de uso">Fora de uso</option>
                        </TextField>
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
                            <Paper sx={{ padding: 2 }}>
                        <Grid container spacing={3} sx={{ justifyContent: "center", alignItems: "center" }}>
                            {/* Gráfico de Pizza */}
                            <Grid item xs={12} md={6}>
                                <ResponsiveContainer width="100%" height={250}>
                                    <PieChart>
                                        <Pie 
                                            data={pieData} 
                                            dataKey="count" 
                                            nameKey="status" 
                                            cx="50%" 
                                            cy="50%" 
                                            outerRadius={80} 
                                        >
                                            {pieData.map((_, index) => (
                                                <Cell key={index} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip />
                                        <Legend />
                                    </PieChart>
                                </ResponsiveContainer>
                            </Grid>

                            {/* Lista de Recursos ao Lado */}
                            <Grid item xs={12} md={6}>
                                <Typography variant="h6">Recursos por Status</Typography>
                                <div>
                                    {pieData.map((item, index) => (
                                        <div key={index} style={{ marginBottom: "10px" }}>
                                            <Typography variant="body1" style={{ fontWeight: "bold", color: COLORS[index % COLORS.length] }}>
                                                {item.status}:
                                            </Typography>
                                            <ul style={{ paddingLeft: "20px" }}>
                                                {item.resources.split(", ").map((resourceName, i) => (
                                                    <li key={i} style={{ color: "#000000" }}>
                                                        {resourceName}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    ))}
                                </div>
                            </Grid>
                        </Grid>
                    </Paper>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            <Typography variant="h5" sx={{ marginTop: 4 }}>Recursos Mais Utilizados</Typography>
            <TableContainer>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Recurso</TableCell>
                            <TableCell>Quantidade de Uso</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {usageStats.map((item, index) => (
                            <TableRow key={index}>
                                <TableCell>{item.resource}</TableCell>
                                <TableCell>{item.usageCount}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            <Typography variant="h5" sx={{ marginTop: 4 }}>Atividades por Tipo de Usuário</Typography>
            <ResponsiveContainer width="100%" height={250}>
                <BarChart data={userActivityStats}>
                    <XAxis dataKey="userType" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="activityCount" fill="#8884d8" name="Atividades" />
                </BarChart>
            </ResponsiveContainer>

            {/* Últimas Atividades */}
            <Typography variant="h5" sx={{ marginTop: 4 }}>Últimas Atividades</Typography>
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
