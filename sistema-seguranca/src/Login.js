import React, { useState } from "react";
import { api } from "./servicos/api";
import { useNavigate } from "react-router-dom";
import imagemLogin from './imagens/imagem-login.png';
import './Login.css';

const Login = ({ setAlertTable }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [setFailedAttempts] = useState(0);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const data = await api.login(email, password);
      localStorage.setItem("token", data.token);
      console.log("Login bem-sucedido, token salvo:", data.token);
      setFailedAttempts(0); // Reset ao sucesso
      navigate("/dashboard");
    } catch (err) {
      setError("Credenciais inválidas. Tente novamente.");

      setFailedAttempts((prevAttempts) => {
        const newAttempts = prevAttempts + 1;
        let alertMessage = "Tentativa de acesso negada";
        let riskLevel = "Baixo";

        if (newAttempts === 2) {
          alertMessage = "Múltiplas tentativas de acesso negadas";
          riskLevel = "Médio";
        } else if (newAttempts >= 3) {
          alertMessage = "Múltiplas tentativas de acesso negadas";
          riskLevel = "Alto";
        }

        const alertData = {
          timestamp: new Date().toLocaleString(),
          email,
          alertMessage,
          riskLevel,
        };

        setAlertTable((prevAlerts) => [...prevAlerts, alertData]);

        return newAttempts;
      });
    }
  };

  return (
    <div className="login-container">
      {error && <p>{error}</p>}
      <form onSubmit={handleLogin}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Senha"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit">Entrar</button>
      </form>
      <img src={imagemLogin} alt="Imagem de Login" className="login-image" />
    </div>
  );
};

export default Login;
