import React, { useState, useEffect } from "react";
import { TextField, Button, Typography, Paper } from "@mui/material";
import { jwtDecode } from "jwt-decode";
import { api } from "./servicos/api"; // 🔥 Certifique-se de que o caminho da importação está correto!
import { useNavigate } from "react-router-dom";

const CadastroUsuario = () => {
  const [novoUsuario, setNovoUsuario] = useState({ email: "", password: "", role: "" });
  const [userRole, setUserRole] = useState(null);
  const navigate = useNavigate();

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

  const handleCadastro = async () => {
    if (!novoUsuario.email || !novoUsuario.password || !novoUsuario.role) {
      console.error("Erro: Todos os campos são obrigatórios!");
      return;
    }

    try {
      console.log("📤 Enviando dados para cadastro:", novoUsuario);
      const response = await api.cadastrarUsuario(novoUsuario);

      if (response) {
        console.log("✅ Usuário cadastrado com sucesso:", response);
        setNovoUsuario({ email: "", password: "", role: "" });
      } else {
        console.error("❌ Erro ao cadastrar usuário! Resposta inválida da API.");
      }
    } catch (error) {
      console.error("❌ Erro ao cadastrar usuário:", error);
    }
  };

  // 🔥 Bloqueia o acesso para usuários que não sejam admin ou gerente
  if (userRole !== "admin" && userRole !== "gerente") {
    return <Typography variant="h6">❌ Acesso negado! Apenas administradores e gerentes podem cadastrar usuários.</Typography>;
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
          Cadastrar Novo Usuário
      </Typography>
      <TextField
          fullWidth
          label="E-mail"
          value={novoUsuario.email}
          onChange={(e) => setNovoUsuario({ ...novoUsuario, email: e.target.value })}
          sx={{
              marginBottom: 2,
              backgroundColor: "#333",
              borderRadius: 1,
              input: { color: "#fdd835" },
              label: { color: "#fdd835" }
          }}
      />
      <TextField
          fullWidth
          label="Password"
          type="password"
          value={novoUsuario.password}
          onChange={(e) => setNovoUsuario({ ...novoUsuario, password: e.target.value })}
          sx={{
              marginBottom: 2,
              backgroundColor: "#333",
              borderRadius: 1,
              input: { color: "#fdd835" },
              label: { color: "#fdd835" }
          }}
      />
      <TextField
          fullWidth
          label="Função (admin, gerente, usuário)"
          value={novoUsuario.role}
          onChange={(e) => setNovoUsuario({ ...novoUsuario, role: e.target.value })}
          select
          SelectProps={{
              native: true,
          }}
          sx={{
              marginBottom: 2,
              backgroundColor: "#333",
              borderRadius: 1,
              select: { color: "#fdd835" },
              label: { color: "#fdd835" }
          }}
      >
          <option value="admin">Administrador(a)</option>
          <option value="Gerente">Gerente</option>
          <option value="Funcionario">Funcionário(a)</option>
      </TextField>
      <Button 
          variant="contained" 
          onClick={handleCadastro} 
          sx={{
              backgroundColor: "#fdd835",
              color: "#1c1c1c",
              fontWeight: "bold",
              '&:hover': { backgroundColor: "#ffeb3b" }
          }}
      >
          Cadastrar
      </Button>
  </Paper>
  );
};

export default CadastroUsuario;
