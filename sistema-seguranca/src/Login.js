import React, { useState } from "react";
import { api } from "./servicos/api";
import { useNavigate } from "react-router-dom";
import imagemLogin from './imagens/imagem-login.png'; // Importando a imagem
import './Login.css'; // Certifique-se de importar o CSS

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const data = await api.login(email, password);
      localStorage.setItem("token", data.token); // Salva o token

      console.log("Login bem-sucedido, token salvo:", data.token);
      
      navigate("/dashboard"); // Redireciona para a tela principal
    } catch (err) {
      setError("Credenciais inválidas. Tente novamente.");
    }
  };

  return (
    <div className="login-container">
      <h2></h2>
      <h2></h2>
      
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
