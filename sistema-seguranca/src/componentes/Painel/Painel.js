import React from "react";
import "./Painel.css";
import { Card, CardContent, Typography } from "@mui/material";

const Painel = ({ titulo, conteudo }) => {
  return (
    <Card className="painel-card">
      <CardContent>
        <Typography variant="h6" className="painel-titulo">
          {titulo}
        </Typography>
        <Typography variant="body1" className="painel-conteudo">
          {conteudo}
        </Typography>
      </CardContent>
    </Card>
  );
};

export default Painel;
