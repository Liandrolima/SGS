import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "./servicos/api";
import { jwtDecode } from "jwt-decode";

const AlertaSeguranca = () => {
  const [, setResources] = useState([]);
  const [, setLoading] = useState(true);
  const [userRole, setUserRole] = useState(null);
  const [alertTable, setAlertTable] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    /* localStorage.removeItem("alerts");*/
    // Ou, se você quiser limpar apenas a parte dos alertas/*
    /*  localStorage.setItem("alerts", JSON.stringify([])); // Limpa os alertas do localStorage
            // Ou, se você quiser limpar apenas a parte dos alertas 
        */
    // Carregar alertas do localStorage
    const alertsFromStorage = JSON.parse(localStorage.getItem("alerts"));
    console.log("Alertas carregados:", alertsFromStorage);

    if (alertsFromStorage) {
      setAlertTable(alertsFromStorage); // Atualizar o estado com os alertas carregados
    }
  }, []);

  useEffect(() => {
    const role = localStorage.getItem("userRole");
    setUserRole(role); // Atualiza o estado com o valor salvo no localStorage
  }, []);

  // Verifica se o usuário é um administrador
  const resetAlerts = () => {
    if (userRole === "admin") {
      localStorage.setItem("alerts", JSON.stringify([])); // Limpa todos os alertas
      setAlertTable([]); // Atualiza o estado da tabela para vazio
      console.log("Alertas resetados");
    } else {
      // Caso o usuário não seja admin, exibe um aviso
      console.log("Você não tem permissão para resetar os Alertas.");
      alert("Apenas administradores podem resetar os Alertas.");
    }
  };

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

  return (
    <div
      style={{
        background: "#1c1c1c",
        color: "white",
        padding: "20px",
        borderRadius: "12px",
        boxShadow: "0px 0px 10px rgba(255, 215, 0, 0.3)",
        maxWidth: "100%",
        overflowX: "auto", // Permite que a tabela role horizontalmente se necessário
      }}
    >
      <button
        onClick={resetAlerts}
        style={{
          background: "#FFD700",
          color: "#1c1c1c",
          border: "none",
          padding: "10px 15px",
          borderRadius: "6px",
          fontWeight: "bold",
          cursor: "pointer",
          transition: "0.3s",
          marginBottom: "15px",
          width: "100%", // Em telas menores, botão ocupa toda a largura
          maxWidth: "300px", // Evita ficar muito largo
        }}
      >
        Resetar Alertas
      </button>

      <h2
        style={{
          color: "#FFD700",
          marginBottom: "15px",
          textAlign: "center",
        }}
      >
        ⚠️ Alertas de Segurança
      </h2>

      <div style={{ width: "100%", overflowX: "auto" }}>
        <table
          style={{
            width: "100%",
            minWidth: "500px", // Garante que a tabela não fique muito pequena
            borderCollapse: "collapse",
            background: "#333",
            borderRadius: "8px",
          }}
        >
          <thead>
            <tr style={{ background: "#222" }}>
              {["Data e Hora", "Email", "Mensagem", "Nível de Risco"].map(
                (title) => (
                  <th
                    key={title}
                    style={{
                      padding: "10px",
                      color: "#FFD700",
                      borderBottom: "2px solid #FFD700",
                      fontSize: "0.9rem",
                      textAlign: "center",
                    }}
                  >
                    {title}
                  </th>
                )
              )}
            </tr>
          </thead>
          <tbody>
            {alertTable && alertTable.length > 0 ? (
              alertTable.map((alert, index) => (
                <tr
                  key={index}
                  style={{
                    background: index % 2 === 0 ? "#2a2a2a" : "#1c1c1c",
                  }}
                >
                  <td
                    style={{
                      padding: "10px",
                      color: "white",
                      textAlign: "center",
                      fontSize: "0.85rem",
                    }}
                  >
                    {alert.timestamp}
                  </td>
                  <td
                    style={{
                      padding: "10px",
                      color: "white",
                      textAlign: "center",
                      fontSize: "0.85rem",
                    }}
                  >
                    {alert.email}
                  </td>
                  <td
                    style={{
                      padding: "10px",
                      color: "white",
                      textAlign: "center",
                      fontSize: "0.85rem",
                    }}
                  >
                    {alert.alertMessage}
                  </td>
                  <td
                    style={{
                      padding: "10px",
                      fontWeight: "bold",
                      textAlign: "center",
                      fontSize: "0.85rem",
                      color:
                        alert.riskLevel === "Alto"
                          ? "red"
                          : alert.riskLevel === "Médio"
                          ? "orange"
                          : "green",
                    }}
                  >
                    {alert.riskLevel}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan="4"
                  style={{
                    textAlign: "center",
                    padding: "10px",
                    color: "gray",
                  }}
                >
                  Nenhum alerta encontrado
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AlertaSeguranca;
