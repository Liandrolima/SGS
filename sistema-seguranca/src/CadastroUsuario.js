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
    <Paper sx={{ padding: 2, margin: "20px", textAlign: "center" }}>
      <Typography variant="h5">Cadastrar Novo Usuário</Typography>
      <TextField
        fullWidth
        label="E-mail"
        value={novoUsuario.email}
        onChange={(e) => setNovoUsuario({ ...novoUsuario, email: e.target.value })}
        sx={{ marginBottom: 2 }}
      />
      <TextField
        fullWidth
        label="password"
        type="password"
        value={novoUsuario.password}
        onChange={(e) => setNovoUsuario({ ...novoUsuario, password: e.target.value })}
        sx={{ marginBottom: 2 }}
      />
      <TextField
        fullWidth
        label="Função (admin, gerente, usuário)"
        value={novoUsuario.role}
        onChange={(e) => setNovoUsuario({ ...novoUsuario, role: e.target.value })}
        sx={{ marginBottom: 2 }}
      />
      <Button variant="contained" color="success" onClick={handleCadastro}>
        Cadastrar
      </Button>
    </Paper>
  );
};

export default CadastroUsuario;
