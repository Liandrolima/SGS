import React, { useEffect, useState } from "react";
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Typography,
  Modal,
  Box,
  TextField,
} from "@mui/material";
import { api } from "./servicos/api"; // Certifique-se de que o caminho está correto

const ListarUsuario = ({ userRole }) => {
  const [usuarios, setUsuarios] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const [usuarioEditando, setUsuarioEditando] = useState({
    email: "",
    password: "",
    role: "",
  });
  const [senhaAtual, setSenhaAtual] = useState("");

  useEffect(() => {
    const carregarUsuarios = async () => {
      try {
        const data = await api.listarUsuarios();
        setUsuarios(data);
        console.log("📥 Usuários carregados:", data);
      } catch (error) {
        console.error("Erro ao carregar usuários:", error);
      }
    };
    carregarUsuarios();
  }, []);

  
  const handleAbrirModal = (usuario) => {
    setUsuarioEditando(usuario); // Atualiza o usuário que será editado
    setOpenModal(true); // Abre o modal
  };

  const handleCloseModal = () => {
    setOpenModal(false); // Fecha o modal
  };

  const handleSalvarAlteracoes = async () => {
    try {
      const { email, password, role } = usuarioEditando;

      const usuarioAtualizado = { password, role }; // Remove email

      await api.editarUsuario(email, usuarioAtualizado);

      setUsuarios(
        usuarios.map((usuario) =>
          usuario.email === email
            ? { ...usuario, ...usuarioAtualizado }
            : usuario
        )
      );

      handleCloseModal();
      console.log("✅ Usuário editado com sucesso!");
    } catch (error) {
      console.error("Erro ao editar usuário:", error);
    }
  };

  const removerUsuario = async (email) => {
    console.log("🗑️ Tentando remover usuário:", email);

    if (!window.confirm("Tem certeza que deseja remover este usuário?")) {
      return;
    }

    try {
      await api.removerUsuario(email); // Corrigido para usar `api`
      setUsuarios(usuarios.filter((usuario) => usuario.email !== email));
      console.log("✅ Usuário removido com sucesso!");
    } catch (error) {
      console.error("Erro ao remover usuário:", error);
    }
  };

  return (
    <>
      <Paper
        sx={{
          padding: 3,
          marginTop: 4,
          backgroundColor: "#1c1c1c",
          color: "#f5f5f5",
          borderRadius: 2,
          boxShadow: "0px 0px 10px #ffcc00",
        }}
      >
        <Typography variant="h5" sx={{ fontWeight: "bold", marginBottom: 2 }}>
          Lista de Usuários
        </Typography>
        <TableContainer component={Paper} sx={{ backgroundColor: "#333" }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ color: "#fdd835", fontWeight: "bold" }}>
                  Nome
                </TableCell>
                <TableCell sx={{ color: "#fdd835", fontWeight: "bold" }}>
                  E-mail
                </TableCell>
                <TableCell sx={{ color: "#fdd835", fontWeight: "bold" }}>
                  Função
                </TableCell>
                <TableCell sx={{ color: "#fdd835", fontWeight: "bold" }}>
                  Data de Criação
                </TableCell>
                <TableCell sx={{ color: "#fdd835", fontWeight: "bold" }}>
                  Ações
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {usuarios.map((usuario) => (
                <TableRow key={usuario.email}>
                  <TableCell sx={{ color: "#fff" }}>
                    {usuario.nome || "N/A"}
                  </TableCell>
                  <TableCell sx={{ color: "#fff" }}>{usuario.email}</TableCell>
                  <TableCell sx={{ color: "#fff" }}>{usuario.role}</TableCell>
                  <TableCell sx={{ color: "#fff" }}>
                    {usuario.createdAt
                      ? new Date(usuario.createdAt).toLocaleDateString()
                      : "N/A"}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="contained"
                      color="warning"
                      sx={{ marginRight: 1 }}
                      onClick={() => handleAbrirModal(usuario)}
                    >
                      Editar
                    </Button>

                    <Button
                      variant="contained"
                      color="error"
                      onClick={() => removerUsuario(usuario.email)}
                    >
                      Remover
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Modal de edição */}
      <Modal open={openModal} onClose={handleCloseModal}>
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            backgroundColor: "#121212",
            padding: 4,
            borderRadius: 2,
            boxShadow: 3,
            width: 400,
          }}
        >
          <Typography variant="h5" sx={{ color: "#F8D210", fontWeight: "bold", marginBottom: 2 }}>
            Editar Usuário
          </Typography>

          <TextField
            fullWidth
            label="Senha Atual"
            type="password"
            value={senhaAtual}
            onChange={(e) => setSenhaAtual(e.target.value)}
            sx={{
              marginBottom: 2,
              backgroundColor: "#333",
              borderRadius: 1,
              input: { color: "#fdd835" },
              label: { color: "#fdd835" },
            }}
          />
          <TextField
            fullWidth
            label="Nova Senha"
            type="password"
            value={usuarioEditando.password}
            onChange={(e) =>
              setUsuarioEditando({
                ...usuarioEditando,
                password: e.target.value,
              })
            }
            sx={{
              marginBottom: 2,
              backgroundColor: "#333",
              borderRadius: 1,
              input: { color: "#fdd835" },
              label: { color: "#fdd835" },
            }}
          />

          <TextField
            fullWidth
            label="Password"
            type="password"
            value={usuarioEditando.password}
            onChange={(e) =>
              setUsuarioEditando({
                ...usuarioEditando,
                password: e.target.value,
              })
            }
            sx={{
              marginBottom: 2,
              backgroundColor: "#333",
              borderRadius: 1,
              input: { color: "#fdd835" },
              label: { color: "#fdd835" },
            }}
          />
          <TextField
            fullWidth
            label="Função (admin, gerente, usuário)"
            value={usuarioEditando.role}
            onChange={(e) =>
              setUsuarioEditando({ ...usuarioEditando, role: e.target.value })
            }
            select
            SelectProps={{
              native: true,
            }}
            sx={{
              marginBottom: 2,
              backgroundColor: "#333",
              borderRadius: 1,
              select: { color: "#fdd835" },
              label: { color: "#fdd835" },
            }}
          >
            <option value="admin">Administrador(a)</option>
            <option value="gerente">Gerente</option>
            <option value="Funcionario">Funcionário(a)</option>
          </TextField>
          <Button
            variant="contained"
            color="primary"
            sx={{ backgroundColor: "#F8D210", color: "#000", marginTop: 2 }}
            onClick={handleSalvarAlteracoes}
            fullWidth
          >
            Salvar Alterações
          </Button>
        </Box>
      </Modal>
    </>
  );
};

export default ListarUsuario;
