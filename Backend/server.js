const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const dotenv = require("dotenv");
const userRoutes = require("./routes/users");
const authRoutes = require("./routes/auth");
const resourceRoutes = require("./routes/resources");
const errorHandler = require("./middlewares/errorHandler");


dotenv.config();
console.log("JWT_SECRET:", process.env.JWT_SECRET); // Teste se o .env está carregando

const app = express();

// Dados temporários na memória (sem persistência)
let activities = [];
let alerts = [];
let failedLoginAttempts = 0;
let inactiveResources = {};
let pendingMaintenances = {};

// Middlewares globais
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

// Rotas
app.use("/api/auth", authRoutes);
app.use("/api/resources", resourceRoutes);
app.use("/api/users", userRoutes);

// 🟢 Rota para obter atividades
app.get("/api/activities", (req, res) => {
  console.log("Rota de atividades acessada");
  res.json(activities);
});

// 🔴 Rota para obter alertas de segurança
app.get("/api/alerts", (req, res) => {
  console.log("Rota de alertas acessada");
  generateDynamicAlerts(); // Gera alertas atualizados
  res.json(alerts); // Retorna os alertas gerados
});

// 🟡 Rota para simular um login (e registrar tentativas de acesso negadas)
app.post("/api/login", (req, res) => {
  const { email, password } = req.body;

  // Simulação: Se a senha estiver errada, registra a falha
  if (password !== "senhaCorreta") {
    failedLoginAttempts++;
    if (failedLoginAttempts >= 3) { 
      registerAlert("Múltiplas tentativas de acesso negadas", "Alta"); // Registra um alerta de segurança
      failedLoginAttempts = 0; // Zera o contador após gerar um alerta
    }
    return res.status(401).json({ message: "Acesso negado" });
  }

  registerActivity(`${email} fez login no sistema`); // Registra a atividade de login
  res.json({ message: "Login bem-sucedido" });
});

// 🟢 Rota para registrar uma nova atividade
app.post("/api/activities", (req, res) => {
  const { message } = req.body;
  if (!message) {
    return res.status(400).json({ error: "A mensagem da atividade é obrigatória" });
  }
  registerActivity(message); // Registra a atividade
  res.status(201).json({ success: true });
});

// Middleware global para erros
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
