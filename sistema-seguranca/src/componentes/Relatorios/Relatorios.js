import React from "react";
import "./Relatorios.css";
import { Table, TableBody, TableCell, TableHead, TableRow, Paper } from "@mui/material";

const Relatorios = ({ dados }) => {
  return (
    <Paper className="relatorios-tabela">
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Nome</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Última Atualização</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {dados.map((item, index) => (
            <TableRow key={index}>
              <TableCell>{item.nome}</TableCell>
              <TableCell>{item.status}</TableCell>
              <TableCell>{item.ultimaAtualizacao}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Paper>
  );
};

export default Relatorios;
