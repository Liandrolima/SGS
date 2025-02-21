import React, { useState } from "react"; 
import { api } from "./servicos/api"; // Seu arquivo API
import { useNavigate } from "react-router-dom";
import imagemLogin from './imagens/imagem-login.png'; // Importando a imagem
import './Login.css'; // Certifique-se de importar o CSS

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [failedAttempts, setFailedAttempts] = useState(0); // Estado para o número de tentativas falhadas
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const data = await api.login(email, password); // Tentativa de login via API
      localStorage.setItem("token", data.token); // Salva o token
      console.log("Login bem-sucedido, token salvo:", data.token);

      // Recuperar a quantidade de acessos aprovados do localStorage ou definir como 0
      let approvedCount = parseInt(localStorage.getItem("approvedCount"), 10) || 0;

      // Atualiza a quantidade de acessos aprovados
      approvedCount += 1;
      localStorage.setItem("approvedCount", approvedCount);

      // Se houver alertas, armazená-los no localStorage
      if (data.alerts && data.alerts.length > 0) {
        localStorage.setItem("alerts", JSON.stringify(data.alerts)); // Salva os alertas
      }

      navigate("/dashboard"); // Redireciona para a tela principal
    } catch (err) {
      setError("Credenciais inválidas. Tente novamente.");

      // Atualizando o contador de tentativas falhadas com base no valor anterior
      setFailedAttempts((prev) => {
        const newAttempts = prev + 1;

        // Define a mensagem e o nível de risco conforme o número de tentativas falhadas
        let alertMessage = "Tentativa de acesso negada";
        let riskLevel = "Baixo";

        if (newAttempts === 2) {
          alertMessage = "Múltiplas tentativas de acesso negadas";
          riskLevel = "Médio";
        } else if (newAttempts >= 3) {
          alertMessage = "Múltiplas tentativas de acesso negadas";
          riskLevel = "Alto";
        }

        // Adiciona o alerta ao localStorage
        const currentAlerts = JSON.parse(localStorage.getItem("alerts")) || []; // Recupera alertas existentes
        const newAlert = {
          timestamp: new Date().toLocaleString(),
          email: email,
          alertMessage: alertMessage,
          riskLevel: riskLevel,
        };
        currentAlerts.push(newAlert); // Adiciona o novo alerta

        // Salva o alerta atualizado no localStorage
        localStorage.setItem("alerts", JSON.stringify(currentAlerts));

        // Recuperar a quantidade de acessos negados do localStorage ou definir como 0
        let deniedCount = parseInt(localStorage.getItem("deniedCount"), 10) || 0;

        // Atualiza a quantidade de acessos negados
        deniedCount += 1;
        localStorage.setItem("deniedCount", deniedCount);

        return newAttempts; // Retorna o novo valor de tentativas falhadas
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
