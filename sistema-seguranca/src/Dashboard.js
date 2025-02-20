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
import './dashboardStyles.js';

import CadastroUsuario from "./CadastroUsuario";

const COLORS = ["#ff0000", "#00ff00", "#0000ff", "#ff00ff"]; 

const Dashboard = () => {
    
    const [resources, setResources] = useState([]);
    const [loading, setLoading] = useState(true);
    const [userRole, setUserRole] = useState(null);
    const [editingResource, setEditingResource] = useState({
        name: '',
        status: '',
        serialNumber: '',
        id: null,
        maintenanceDate: null,  // Garantir que maintenanceDate seja null inicialmente
    });
    const [newResource, setNewResource] = useState({ name: "", status: "" });
    const [accessStats, setAccessStats] = useState({ approved: 100, denied: 250 });
    const [latestActivities, setLatestActivities] = useState([]);
    const [alerts, setAlerts] = useState([]);
    const [usageStats] = useState([]);
    const [userActivityStats] = useState([]);
    const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });
    const navigate = useNavigate();
    const token = localStorage.getItem('token');
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
        if (!maintenanceDate) return { color: 'white', text: 'Sem manutenção' }; // Se não houver data, retorna 'Sem manutenção' e cor branca    
        const currentDate = new Date();
        const maintenanceDateObj = new Date(maintenanceDate);     
        const timeDifference = currentDate - maintenanceDateObj;
        const oneWeekInMillis = 7 * 24 * 60 * 60 * 1000;    
        // Lógica invertida: se for até 1 semana, cor amarela, caso contrário, cor vermelha
        if (timeDifference <= oneWeekInMillis) {
            return { color: 'yellow', text: 'Prazo de manutenção acabando em sete dias' };
        } else {
            return { color: 'red', text: 'Prazo esgotado' };
        }
    };    
    // Dentro do componente
    const maintenanceStatus = getMaintenanceDateStatus(editingResource?.maintenanceDate); // Usa optional chaining para evitar erro se editingResource for null
    const maintenancenewStatus = getMaintenanceDateStatus(newResource?.maintenanceDate);
    console.log(maintenanceStatus?.color);
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
    
    const preprocessData = (pieData, resources) => {
        return pieData.map(item => {
          const processedResources = item.resources.split(",").map(resourceName => {
            const trimmedResourceName = resourceName.trim(); // Remover espaços extras
            const resource = resources.find(r => r.name === trimmedResourceName);
            return {
              name: trimmedResourceName,
              status: item.status,
              maintenanceDate: resource && resource.maintenanceDate ? new Date(resource.maintenanceDate).toLocaleString() : 'N/A'
            };
          });
      
          return {
            ...item,
            processedResources
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
    <Typography variant="h4" sx={{ fontWeight: "bold", textTransform: "uppercase" }}>
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

    <Snackbar open={snackbar.open} autoHideDuration={3000} onClose={handleCloseSnackbar}>
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: "100%" }}>
            {snackbar.message}
        </Alert>
    </Snackbar>

    {loading ? (
        <CircularProgress sx={{ color: "#FFD700" }} />
    ) : resources.length > 0 ? (
        <TableContainer sx={{ marginTop: 3 }}>
            <Table sx={{ backgroundColor: "#1E1E1E", borderRadius: "10px" }}>
                <TableHead>
                    <TableRow sx={{ backgroundColor: "#333", color: "#FFD700" }}>
                        <TableCell sx={{ fontWeight: "bold", color: "#FFD700" }}>Nome</TableCell>
                        <TableCell sx={{ fontWeight: "bold", color: "#FFD700" }}>Status</TableCell>
                        {userRole === "admin" && (
                            <TableCell sx={{ fontWeight: "bold", color: "#FFD700" }}>Ações</TableCell>
                        )}
                    </TableRow>
                </TableHead>
                <TableBody>
                    {resources.map((resource) => (
                        <TableRow key={resource.id || resource.serialNumber} sx={{ "&:hover": { backgroundColor: "#292929" } }}>
                            <TableCell sx={{ color: "#FFF" }}>{resource.name}</TableCell>
                            <TableCell sx={{ color: resource.status === "Disponível" ? "#00FF00" : resource.status === "Em manutenção" ? "#FFA500" : "#FF0000" }}>
                                {resource.status}
                            </TableCell>
                            {userRole === "admin" && (
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
        <Typography variant="h6" sx={{ marginTop: 2, color: "#FFD700" }}>Nenhum recurso encontrado.</Typography>
    )}
            {editingResource && (
    <Paper sx={{
        padding: 2,
        margin: "20px",
        backgroundColor: "#1C1C1C",
        color: "#F8D210",
        borderRadius: "8px"
    }}>
        <Typography variant="h5" sx={{ color: "#F8D210" }}>Editar Recurso</Typography>
        
        <TextField
            fullWidth
            label="Nome"
            value={editingResource.name}
            onChange={(e) => setEditingResource({ ...editingResource, name: e.target.value })}
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
            sx={{ backgroundColor: "#333", color: "#FFF", borderRadius: "4px", marginTop: 2 }}
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
                value={editingResource?.maintenanceDate ? new Date(editingResource.maintenanceDate).toLocaleString() : ''}
                InputProps={{ readOnly: true }}
                sx={{ marginTop: 2, backgroundColor: "#008000", color: "#FFF", borderRadius: "4px" }}
                InputLabelProps={{ style: { color: "#FFF" } }}
            />
        )}
        
        {editingResource.status === "Em manutenção" && (
            <Box sx={{
                display: 'flex',
                alignItems: 'center',
                backgroundColor: "#FFD700",
                padding: 2,
                borderRadius: 1
            }}>
                <TextField
                    label="Data de Início da Manutenção"
                    value={editingResource?.maintenanceDate ? new Date(editingResource.maintenanceDate).toLocaleString() : ''}
                    InputProps={{ readOnly: true }}
                    sx={{ flexGrow: 1, border: 'none', backgroundColor: "transparent", color: "#000" }}
                    InputLabelProps={{ style: { color: "#000" } }}
                />
                <Typography variant="body2" sx={{ color: "#000", marginLeft: 1 }}>Em manutenção</Typography>
            </Box>
        )}
        
        {editingResource.status === "Fora de uso" && (
            <TextField
                fullWidth
                label="Data de Inatividade"
                value={editingResource?.maintenanceDate ? new Date(editingResource.maintenanceDate).toLocaleString() : ''}
                InputProps={{ readOnly: true }}
                sx={{ marginTop: 2, backgroundColor: "#B22222", color: "#FFF", borderRadius: "4px" }}
                InputLabelProps={{ style: { color: "#FFF" } }}
            />
        )}
        
        <Button variant="contained" sx={{ backgroundColor: "#F8D210", color: "#000", marginTop: 2 }} onClick={handleSaveEdit}>
            Salvar Alterações
        </Button>
    </Paper>
)}

                    {userRole === "admin" && ( 
    <Paper sx={{ padding: 2, margin: "20px" }}>
        <Typography variant="h5">Adicionar Novo Recurso</Typography>                    

        {/* Nome do recurso */}
        <TextField 
            fullWidth 
            label="Nome" 
            value={newResource.name} 
            onChange={(e) => setNewResource({ ...newResource, name: e.target.value })} 
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

                // Se o status for "Em manutenção", define a data de início
                if (newStatus === "Em manutenção") {
                    if (!newResourceCopy.maintenanceDate) {
                        newResourceCopy.maintenanceDate = new Date().toISOString(); // Apenas define se não houver uma
                    }
                } else {
                    if (!newResourceCopy.availabilityDate) { 
                        newResourceCopy.availabilityDate = new Date().toISOString(); // Apenas define se não houver uma
                    }
                }

                setNewResource(newResourceCopy); // CORREÇÃO: Agora estamos atualizando corretamente newResource
            }}
            SelectProps={{
                native: true,
            }}
        >
            <option value="Disponível">Disponível</option>
            <option value="Em manutenção">Em manutenção</option>
            <option value="Fora de uso">Fora de uso</option>
        </TextField>

        {/* Exibe a data em que o novo recurso ficou disponível */}  
{newResource.status === "Disponível" && (
    <TextField
        fullWidth
        label="Data em que o novo recurso ficou disponível"
        value={newResource.availabilityDate 
            ? new Date(newResource.availabilityDate).toLocaleString('pt-BR', { 
                day: '2-digit', 
                month: '2-digit', 
                year: 'numeric', 
                hour: '2-digit', 
                minute: '2-digit',
                second: '2-digit' // Adiciona os segundos
            }) 
            : new Date().toLocaleString('pt-BR', { 
                day: '2-digit', 
                month: '2-digit', 
                year: 'numeric', 
                hour: '2-digit', 
                minute: '2-digit',
                second: '2-digit' // Adiciona os segundos
            })
        }
        InputProps={{ readOnly: true }}
        sx={{ marginTop: 2, backgroundColor: 'green' }}
    />
)}

{/* Exibe a data de início da manutenção e o status */}
{newResource.status === "Em manutenção" && (
    <Box sx={{
        display: 'flex',
        alignItems: 'center',
       
        backgroundColor: 'yellow', 
        padding: 2, 
        borderRadius: 1, 
    }}>
        <TextField
            label="Data de Início da Manutenção"
            value={newResource.maintenanceDate 
                ? new Date(newResource.maintenanceDate).toLocaleString('pt-BR', { 
                    day: '2-digit', 
                    month: '2-digit', 
                    year: 'numeric', 
                    hour: '2-digit', 
                    minute: '2-digit',
                    second: '2-digit' // Adiciona os segundos
                }) 
                : ''
            }
            InputProps={{ readOnly: true }}
            sx={{
                backgroundColor: 'transparent', 
                color: 'black', 
                flexGrow: 1, 
                border: 'none', 
                '& .MuiOutlinedInput-root fieldset': { border: 'none' }
            }}
        />                    
        <Typography variant="body2" sx={{
            color: 'black', 
            marginLeft: 1, 
            whiteSpace: 'nowrap', 
            textAlign: 'left', 
        }}>
            Após adicionar manutenção vencerá em sete dias
        </Typography>
    </Box>
)}

{/* Exibe a data em que o novo recurso ficou Fora de uso */}  
{newResource.status === "Fora de uso" && (
    <TextField
        fullWidth
        label="Data em que o novo recurso ficou Fora de uso"
        value={newResource.availabilityDate 
            ? new Date(newResource.availabilityDate).toLocaleString('pt-BR', { 
                day: '2-digit', 
                month: '2-digit', 
                year: 'numeric', 
                hour: '2-digit', 
                minute: '2-digit',
                second: '2-digit' // Adiciona os segundos
            }) 
            : new Date().toLocaleString('pt-BR', { 
                day: '2-digit', 
                month: '2-digit', 
                year: 'numeric', 
                hour: '2-digit', 
                minute: '2-digit',
                second: '2-digit' // Adiciona os segundos
            })
        }
        InputProps={{ readOnly: true }}
        sx={{ marginTop: 2, backgroundColor: 'red' }}
                            />
                        )}                              
                        {/* Botão para adicionar o novo recurso */}
                        <Button variant="contained" color="success" onClick={handleSaveNewResource}>Adicionar</Button>
                    </Paper>                
            )}
            {(userRole === "admin" || userRole === "gerente") && <CadastroUsuario />}
            <Grid container spacing={2} sx={{ marginTop: 2 }}>
                <Grid item xs={12}>
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
                </Grid>
                <Grid container spacing={2} sx={{ marginTop: 2 }}>
                <Grid item xs={12} md={12}>
                    <Card>
                    <CardContent>
                    <Typography variant="h6" align="center">Status dos Recursos</Typography>
                    <Paper 
                        sx={{ 
                            padding: 2, 
                            display: "flex", 
                            flexDirection: "column", 
                            alignItems: "center", 
                            justifyContent: "center", 
                            width: "100%" 
                        }}
                        >
                    {/* Gráfico de Pizza */}
                    <Grid 
                        container 
                        
                        justifyContent="center" 
                        alignItems="center" 
                        sx={{ width: "100%", display: "flex" }}
                    >
                        <Grid item xs={12} sx={{ display: "flex", justifyContent: "center", width: "100%" }}>
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
                                let fillColor = "#ccc"; // Cor padrão
                                // Alterando cores conforme o status
                                if (item.status === "Em manutenção") {
                                    fillColor = "yellow"; // Amarelo para "Em manutenção"
                                } else if (item.status === "Disponível") {
                                    fillColor = "green"; // Verde para "Disponível"
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
               {/* Lista de Recursos */}
  <Grid 
    container 
    justifyContent="center" 
    alignItems="center" 
    sx={{ width: "100%", display: "flex", marginTop: 3 }}
  >
    <Grid item xs={12} sx={{ display: "flex", justifyContent: "center", width: "100%" }}>
      <Typography variant="h6" align="center"><strong>Recursos por Status</strong></Typography>
    </Grid>
    <Grid item xs={12} sx={{ display: "flex", justifyContent: "center", width: "80%" }}>
      <Paper sx={{ padding: 2, width: "100%", overflow: "auto" }}>
      <Table stickyHeader sx={{ minWidth: 650 }} aria-label="Tabela de Recursos">
          <TableHead>
            <TableRow>
              <TableCell><strong>Nome do Recurso</strong></TableCell>
              <TableCell><strong>Status</strong></TableCell>
              <TableCell><strong>Última Atualização</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {processedData.map((item, index) => {
              let textColor = "#000000"; 
              if (item.status === "Em manutenção") {
                textColor = "yellow";
              } else if (item.status === "Disponível") {
                textColor = "green";
              } else if (item.status === "Fora de uso") {
                textColor = "red";
              }

              return item.processedResources.map((resource, i) => (
                <TableRow key={i}>
                  <TableCell>{resource.name}</TableCell>
                  <TableCell sx={{ color: textColor }}>{item.status}</TableCell>
                  <TableCell>{resource.maintenanceDate}</TableCell>
                </TableRow>
              ));
            })}
          </TableBody>
        </Table>
      </Paper>
    </Grid>
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
        <TableCell>Disponibilidade</TableCell>
        <TableCell>Tempo de Disponibilidade</TableCell>
      </TableRow>
    </TableHead>
    <TableBody>
      {resources
        .filter(item => item.status === "Disponível") // Apenas recursos disponíveis
        .map((item, index) => {
          // Se maintenanceDate for válido, mostra a data
          const disponibilidade = item.maintenanceDate 
            ? new Date(item.maintenanceDate).toLocaleString('pt-BR', { 
                day: '2-digit', 
                month: '2-digit', 
                year: 'numeric', 
                hour: '2-digit', 
                minute: '2-digit',
                second: '2-digit'
            }) 
            : "N/A"; // Se não tiver maintenanceDate, exibe "N/A"
          
          // Calculando o tempo de disponibilidade
          const agora = new Date();
          const manutencaoData = item.maintenanceDate ? new Date(item.maintenanceDate) : null;
          let tempoDisponibilidade = "N/A"; // Default

          if (manutencaoData) {
            const diff = Math.floor((agora - manutencaoData) / 1000); // tempo em segundos
            const dias = Math.floor(diff / 86400); // 86400 segundos por dia
            const horas = Math.floor((diff % 86400) / 3600); // 3600 segundos por hora
            const minutos = Math.floor((diff % 3600) / 60); // 60 segundos por minuto
            const segundos = diff % 60;

            tempoDisponibilidade = `${dias}d ${horas}h ${minutos}m ${segundos}s`; // Formato de tempo
          }

          return (
            <TableRow key={index}>
              <TableCell>{item.name}</TableCell>
              <TableCell>{disponibilidade}</TableCell>
              <TableCell>{tempoDisponibilidade}</TableCell>
            </TableRow>
          );
        })}
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
