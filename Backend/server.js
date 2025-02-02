const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const dotenv = require("dotenv");

dotenv.config();

const authRoutes = require("./routes/auth");
const resourceRoutes = require("./routes/resources");
const errorHandler = require("./middlewares/errorHandler");

const app = express();

// Middlewares globais
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

// Rotas
app.use("/api/auth", authRoutes);
app.use("/api/resources", resourceRoutes);

// Middleware global para erros
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
