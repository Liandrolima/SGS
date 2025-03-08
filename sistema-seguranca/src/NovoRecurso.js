import React, { useState } from "react";
import { api } from "./servicos/api";
import { Button, Typography, Paper, TextField } from "@mui/material";
import { Box } from "@mui/material";

const NovoRecurso = () => {
  const [, setResources] = useState([]);
  const [editingResource] = useState(null);
  const [newResource, setNewResource] = useState({ name: "", status: "" });

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

  // Agrupa recursos por status
  // Prepara os dados para o gráfico (status e os nomes dos recursos)

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
              ? new Date(newResource.availabilityDate).toLocaleString("pt-BR")
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
                ? new Date(newResource.maintenanceDate).toLocaleString("pt-BR")
                : ""
            }
            InputProps={{ readOnly: true }}
            sx={{
              backgroundColor: "transparent",
              color: "black",
              flexGrow: 1,
            }}
          />
          <Typography variant="body2" sx={{ color: "black", marginLeft: 1 }}>
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
              ? new Date(newResource.availabilityDate).toLocaleString("pt-BR")
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
  );
};
export default NovoRecurso;
