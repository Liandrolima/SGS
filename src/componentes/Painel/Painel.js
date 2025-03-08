import React, { useEffect, useState } from "react";
import "./Painel.css";
import { Card, CardContent, Typography } from "@mui/material";
import { api } from "../servicos/api"; // Importando a API

const Painel = () => {
  const [resources, setResources] = useState([]); // Estado para armazenar os recursos

  useEffect(() => {
    api.getResources()
      .then((data) => {
        console.log("Dados recebidos da API:", data); // Debug no console
        setResources(data);
      })
      .catch((error) => console.error("Erro ao buscar recursos:", error));
  }, []);

  return (
    <div className="painel-container">
      <Typography variant="h4" className="painel-titulo">Painel de Recursos</Typography>
      {resources.length === 0 ? (
        <Typography variant="body1">Nenhum recurso disponível.</Typography>
      ) : (
        resources.map((res) => (
          <Card key={res.id} className="painel-card">
            <CardContent>
              <Typography variant="h6" className="painel-titulo">{res.nome}</Typography>
              <Typography variant="body1" className="painel-conteudo">Status: {res.status}</Typography>
              <Typography variant="body1" className="painel-conteudo">Localização: {res.location}</Typography>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
};

export default Painel;
