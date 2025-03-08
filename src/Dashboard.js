import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Paper } from "@mui/material";
import { jwtDecode } from "jwt-decode";
import CadastroUsuario from "./CadastroUsuario";
import ListarUsuario from "./ListarUsuario";
import NovoRecurso from "./NovoRecurso";
import AlertaSeguranca from "./AlertaSeguranca";
import StatusRecursos from "./StatusRecursos";
import RecursosporStatus from "./RecursosporStatus";
import RecursosmaisUtilizados from "./RecursosmaisUtilizados";
import AcessosRestritos from "./AcessosRestritos";
import AlterarRecursos from "./AlterarRecursos";

const Dashboard = () => {
  const [userRole, setUserRole] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/");
      return;
    }
    try {
      setUserRole(jwtDecode(token).role);
    } catch {
      navigate("/");
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

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
      <AlterarRecursos />

      {(userRole === "admin" || userRole === "gerente") && <NovoRecurso />}
      {(userRole === "admin" || userRole === "gerente") && <StatusRecursos />}
      <RecursosporStatus />
      {(userRole === "admin" || userRole === "gerente") && (
        <RecursosmaisUtilizados />
      )}
      {userRole === "admin" && <CadastroUsuario />}
      {userRole === "admin" && <ListarUsuario />}
      {userRole === "admin" && <AcessosRestritos />}
      {userRole === "admin" && <AlertaSeguranca />}

      <Button
        variant="outlined"
        color="secondary"
        onClick={handleLogout}
        sx={{ marginTop: 2, color: "white", borderColor: "#FFD700" }}
      >
        Voltar ao Login
      </Button>
    </Paper>
  );
};

export default Dashboard;
