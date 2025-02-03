import React, { useEffect, useState } from "react";
import Relatorios from "../componentes/Relatorios/Relatorios";
import { api } from "../servicos/api";

const RelatoriosPage = () => {
  const [dados, setDados] = useState([]);

  useEffect(() => {
    const carregarDados = async () => {
      const recursos = await api.getResources();
      setDados(
        recursos.map((recurso) => ({
          nome: recurso.name,
          status: recurso.status,
          ultimaAtualizacao: new Date().toLocaleDateString(),
        }))
      );
    };

    carregarDados();
  }, []);

  return (
    <div>
      <h1>Relatórios</h1>
      <Relatorios dados={dados} />
    </div>
  );
};

export default RelatoriosPage;
