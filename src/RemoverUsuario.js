import React, { useState, useEffect } from "react";
import { TextField, Button, Typography, Paper } from "@mui/material";
import { jwtDecode } from "jwt-decode";
import { api } from "./servicos/api"; // 🔥 Certifique-se de que o caminho da importação está correto!
import { useNavigate } from "react-router-dom";

const RemoverUsuario = () => {
  const [usuarioParaRemover, setUsuarioParaRemover] = useState({ email: "" });
  const [userRole, setUserRole] = useState(null);
  const navigate = useNavigate();
  const [message, setMessage] = useState("");


  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return navigate("/");

    try {
      const decoded = jwtDecode(token);
      setUserRole(decoded.role);
    } catch {
      return navigate("/");
    }
  }, [navigate]);

  const handleRemocao = async () => {
    if (!usuarioParaRemover.email) {
      console.error("Erro: O campo de e-mail é obrigatório!");
      setMessage("❌ O campo de e-mail é obrigatório!");
      return;
    }
  
    try {
      console.log("📤 Enviando dados para remoção de usuário:", usuarioParaRemover);
      const response = await api.RemoverUsuario(usuarioParaRemover.email);
      console.log("Resposta da API:", response);  // Isso pode ajudar a entender o que está sendo retornado
  
      // Verifique se a resposta contém a chave message
      if (response && response.message) {
        console.log("✅ Usuário removido com sucesso:", response.message);
        
        
      } else {        
        console.error("❌ Erro ao remover usuário! Resposta inválida da API.");
      }
    } catch (error) {
      console.error("❌ Erro ao remover usuário:", error);
      setMessage("❌ Erro ao remover usuário.");
    }
  };
  

  // 🔥 Bloqueia o acesso para usuários que não sejam admin ou gerente
  if (userRole !== "admin" && userRole !== "gerente") {
    return <Typography variant="h6">❌ Acesso negado! Apenas administradores e gerentes podem remover usuários.</Typography>;
  }

  return (
    <Paper sx={{
      padding: 3,
      margin: "20px",
      backgroundColor: "#1c1c1c",
      color: "#f5f5f5",
      borderRadius: 2,
      boxShadow: "0px 0px 10px #ffcc00"
    }}>
      <Typography variant="h5" sx={{ fontWeight: "bold", marginBottom: 2 }}>
        Remover Usuário
      </Typography>
      <TextField
        fullWidth
        label="E-mail do Usuário"
        value={usuarioParaRemover.email}
        onChange={(e) => setUsuarioParaRemover({ ...usuarioParaRemover, email: e.target.value })}
        sx={{
          marginBottom: 2,
          backgroundColor: "#333",
          borderRadius: 1,
          input: { color: "#fdd835" },
          label: { color: "#fdd835" }
        }}
      />
      <Button
        variant="contained"
        onClick={handleRemocao}
        sx={{
          backgroundColor: "#fdd835",
          color: "#1c1c1c",
          fontWeight: "bold",
          '&:hover': { backgroundColor: "#ffeb3b" }
        }}
      >
        Remover
      </Button>
    </Paper>
  );
};

export default RemoverUsuario;
