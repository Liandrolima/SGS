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
                {/* Nome do recurso */}
                <TextField 
                    fullWidth 
                    label="Nome" 
                    value={editingResource.name} 
                    onChange={(e) => setEditingResource({ ...editingResource, name: e.target.value })} 
                />    
                {/* Status do recurso */}
                <TextField
                    fullWidth
                    label="Status"
                    select
                    value={editingResource.status}
                    onChange={(e) => {
                        const newStatus = e.target.value;
                        let newResource = { ...editingResource, status: newStatus };
                    
                        if (newStatus === "Em manutenção") {
                            if (!newResource.maintenanceDate) {
                                newResource.maintenanceDate = new Date().toISOString(); // Salva a data da manutenção apenas se ainda não estiver definida
                            }
                        } else {
                            if (!newResource.maintenanceDate) { 
                                newResource.maintenanceDate = new Date().toISOString(); // Apenas define a data se ainda não houver uma
                            }
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
                {/* Exibe a data em que o recurso ficou disponível */}  
                {editingResource.status === "Disponível" && (
                    <TextField
                        fullWidth
                        label="Data em que o recurso ficou disponível"
                        value={editingResource?.maintenanceDate ? new Date(editingResource.maintenanceDate).toLocaleString() : ''}
                        InputProps={{
                            readOnly: true,
                        }}
                        sx={{ marginTop: 2, backgroundColor: 'green'}}
                    />
                )}              
                {/* Exibe a data de início da manutenção e o status */}
                {editingResource.status === "Em manutenção" && (
                    <Box sx={{
                        display: 'flex',
                        alignItems: 'center',
                        width: 'fixo', 
                        backgroundColor: maintenanceStatus.color, // Cor de fundo
                        padding: 2, // Padding para dar o espaçamento
                        borderRadius: 1, // Bordas arredondadas
                      }}>
                        <TextField
                          label="Data de Início da Manutenção"
                          value={editingResource?.maintenanceDate ? new Date(editingResource.maintenanceDate).toLocaleString() : ''}
                          InputProps={{
                            readOnly: true, // Campo de leitura
                          }}
                          sx={{
                            backgroundColor: 'transparent', // Fundo transparente
                            color: 'black', // Cor do texto
                            flexGrow: 1, // Ocupa o máximo de espaço possível
                            border: 'none', // Remove borda
                            '& .MuiOutlinedInput-root': {
                              '& fieldset': {
                                border: 'none', // Remove a borda
                              },
                            },
                          }}
                        />                        
                        <Typography variant="body2" sx={{
                          color: 'black', // Cor do texto
                          marginLeft: 0.5, // Menor margem à esquerda para deixar a data mais próxima do texto
                          whiteSpace: 'nowrap', // Para garantir que o texto não quebre em várias linhas
                          textAlign: 'left', // Alinha o texto à esquerda
                        }}>
                          {maintenanceStatus.text}
                        </Typography>
                      </Box>                   
                )}  
                 {/* Exibe a data em que o recurso ficou Fora de uso */}  
                 {editingResource.status === "Fora de uso" && (
                    <TextField
                        fullWidth
                        label="Data em que o recurso Fora de uso"
                        value={editingResource?.maintenanceDate ? new Date(editingResource.maintenanceDate).toLocaleString() : ''}
                        InputProps={{
                            readOnly: true,
                        }}
                        sx={{ marginTop: 2, backgroundColor: 'red'}}
                    />
                )}              
                {/* Botão para salvar as alterações */}
                <Button variant="contained" color="primary" onClick={handleSaveEdit}>Salvar Alterações</Button>
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
                            {pieData.map((item, index) => {
                                let fillColor = "#ccc"; // Cor padrão
                                // Alterando cores conforme o status
                                if (item.status === "Em manutenção") {
                                    fillColor = "yellow"; // Amarelo para "Em manutenção"
                                } else if (item.status === "Disponível") {
                                    fillColor = "green"; // Verde para "Disponível"
                                }else if (item.status === "Fora de uso") {
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
            {/* Lista de Recursos ao Lado */}
            <Grid item xs={12} md={6}>
            <Typography variant="h6">Recursos por Status</Typography>
            <Paper sx={{ padding: 2 }}>
                <Table sx={{ minWidth: 650 }} aria-label="Tabela de Recursos">
                    <TableHead>
                        <TableRow>
                            <TableCell><strong>Nome do Recurso</strong></TableCell>
                            <TableCell><strong>Status</strong></TableCell>
                            <TableCell><strong>Última Atualização</strong></TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
  {processedData.map((item, index) => {
    let textColor = "#000000"; // Cor padrão para o texto
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
