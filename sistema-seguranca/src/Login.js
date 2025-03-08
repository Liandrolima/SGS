import React, { useState } from "react";
import { api } from "./servicos/api"; // Seu arquivo API
import { useNavigate } from "react-router-dom";
import imagemLogin from "./imagens/imagem-login.png"; // Importando a imagem
import "./Login.css"; // Certifique-se de importar o CSS

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [, setFailedAttempts] = useState(0); // Estado para o número de tentativas falhadas
  const navigate = useNavigate();

  // Função que fala o texto, garantindo que não se repita e evitando problemas de sobreposição
  const speakOnHover = (text) => {
    window.speechSynthesis.cancel(); // Cancela qualquer fala em andamento
    setTimeout(() => {
      const utterance = new SpeechSynthesisUtterance(text);
      window.speechSynthesis.speak(utterance);
    }, 100); // Pequeno atraso para garantir que a fala seja processada corretamente
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const data = await api.login(email, password); // Tentativa de login via API
      localStorage.setItem("token", data.token); // Salva o token
      console.log("Login bem-sucedido, token salvo:", data.token);

      let approvedCount =
        parseInt(localStorage.getItem("approvedCount"), 10) || 0;
      approvedCount += 1;
      localStorage.setItem("approvedCount", approvedCount);

      if (data.alerts && data.alerts.length > 0) {
        localStorage.setItem("alerts", JSON.stringify(data.alerts));
      }

      speakOnHover("Bem-vindo as induuustrias Liandro!"); // Fala a mensagem de sucesso após login bem-sucedido
      navigate("/dashboard"); // Redireciona para o dashboard
    } catch (err) {
      setError("Credenciais inválidas. Tente novamente.");
      speakOnHover("Credenciais inválidas. Tente novamente."); // Fala quando o login falha

      setFailedAttempts((prev) => {
        const newAttempts = prev + 1;
        let alertMessage = "Tentativa de acesso negada";
        let riskLevel = "Baixo";

        if (newAttempts === 2) {
          alertMessage = "Múltiplas tentativas de acesso negadas";
          riskLevel = "Médio";
        } else if (newAttempts >= 3) {
          alertMessage = "Múltiplas tentativas de acesso negadas";
          riskLevel = "Alto";
        }

        const currentAlerts = JSON.parse(localStorage.getItem("alerts")) || [];
        const newAlert = {
          timestamp: new Date().toLocaleString(),
          email: email,
          alertMessage: alertMessage,
          riskLevel: riskLevel,
        };
        currentAlerts.push(newAlert);

        localStorage.setItem("alerts", JSON.stringify(currentAlerts));

        let deniedCount =
          parseInt(localStorage.getItem("deniedCount"), 10) || 0;
        deniedCount += 1;
        localStorage.setItem("deniedCount", deniedCount);

        return newAttempts;
      });
    }
  };

  return (
    <div className="login-container">
      {error && (
        <p role="alert" aria-live="assertive">
          {error}
        </p>
      )}
      <form onSubmit={handleLogin} aria-labelledby="login-form">
        <input
          id="email"
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          aria-label="Digite seu email"
          onMouseEnter={() => speakOnHover("Digite seu email")}
        />
        <input
          id="password"
          type="password"
          placeholder="Senha"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          aria-label="Digite sua senha"
          onMouseEnter={() => speakOnHover("Digite sua senha")}
        />
        <button
          type="submit"
          aria-label="Entrar"
          onMouseEnter={() => speakOnHover("Clique para entrar")}
        >
          Entrar
        </button>
      </form>
      <img
        src={imagemLogin}
        alt="Imagem ilustrativa de login com fundo escuro"
        className="login-image"
        aria-hidden="true" // A imagem é decorativa, então ela é ignorada por leitores de tela
      />
    </div>
  );
};

export default Login;
