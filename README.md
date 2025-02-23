# Projeto de Sistema de Gerenciamento de Segurança para as Indústrias Wayne

## Visão Geral
O **Projeto de Sistema de Gerenciamento de Segurança** foi desenvolvido com o objetivo de otimizar os processos internos das **Indústrias Wayne**, além de aumentar a segurança dos recursos e operações dentro de Gotham City. Este sistema foi projetado para monitorar, gerenciar e visualizar recursos, atividades, acessos e alertas de segurança de forma eficiente, com a segurança em primeiro plano.

Este é um **projeto full stack**, utilizando **React no frontend** e **Node.js (Express) no backend**, com **armazenamento em memória** para as tentativas de acesso, alertas e atividades (sem banco de dados).

## Tecnologias Utilizadas
- **Frontend**:  
  - **React**: Framework utilizado para a criação da interface web interativa.
  - **Material-UI**: Biblioteca de componentes React para estilização e design responsivo.
  - **Recharts**: Para a criação de gráficos interativos (ex: gráfico de pizza, gráficos de barras).
  
- **Backend**:  
  - **Node.js**: Ambiente de execução JavaScript no servidor.
  - **Express**: Framework para construção de APIs RESTful.
  - **Axios**: Para realizar requisições HTTP entre o frontend e o backend.
  - **dotenv**: Para gerenciar variáveis de ambiente.

- **Outros**:  
  - **JWT (JSON Web Token)**: Para autenticação de usuários.

## Funcionalidades Principais
### 1. Dashboard de Controle
A principal interface para os administradores e gerentes visualizarem o status dos recursos, acessos e atividades da organização. A página do **Dashboard** inclui as seguintes seções:

- **Gráfico de Acessos Restritos Aprovados/Reprovados**
- **Gráfico de Pizza para Status dos Recursos Internos**
- **Tabela de Recursos mais utilizados**
- **Tabela de Recursos por Status**
- **Tabela de Recursos Mais Utilizados**
- **Alertas de Segurança**


### 2. Autenticação de Usuário
O sistema permite que os usuários façam login utilizando um **e-mail** e **senha**. O processo de autenticação é realizado com **JSON Web Tokens (JWT)**. O sistema valida as credenciais, emite um token JWT para o usuário e mantém as informações seguras.

**Restrições de Acesso**:  
- **Admin**: Acesso completo, podendo editar, remover recursos e visualizar todas as informações.
- **Gerente**: Pode editar, remover recursos, Pode adicionar novos recursos, não tem permissão para resetar, não tem permissão para adicionar novos usuários, tem acesso as telas: acessos restritos, status dos recursos, recursos por status, recursos mais utilizados e alertas de segurança.
- **Usuário comum**: Tem acesso as telas: painel de recursos, recursos mais utilizados. Não tem permissão para resetar, não tem permissão para adicionar novos usuários, não tem permisão para editar recursos, remover recursos.

### 3. Tentativas de Login e Alertas
- **Tentativas de login**: O sistema registra todas as tentativas de login, sejam bem-sucedidas ou falhas. Após várias tentativas falhas, são gerados alertas de segurança para monitoramento.
  
- **Alertas de segurança**: Alertas críticos, como tentativas de login falhas repetidas ou manutenção pendente, são gerados e mostrados na interface de alertas.

## Estrutura de Arquivos
### Frontend
```bash
src/
├── components/
│   ├── Dashboard.js        # Componente principal do painel
│   ├── Login.js            # Componente de login
│   └── CadastroUsuario.js  # Componente para cadastro de usuários (admin)
├── servicos/
│   └── api.js             # Arquivo para gerenciar chamadas API
└── App.js                  # Componente principal que renderiza os componentes

## Estrutura de Arquivos
### Beckend

server.js                    # Arquivo principal do servidor
├── routes/
│   ├── auth.js              # Roteador de autenticação
│   ├── resources.js         # Roteador de recursos
│   └── users.js             # Roteador de usuários
├── middlewares/
│   └── errorHandler.js      # Middleware para tratamento de erros
├── models/
│   └── resource.js          # Modelo de recurso
└── config/
    └── dotenv.js            # Configurações do ambiente

Fluxo do Sistema

1. Autenticação:

O usuário envia um e-mail e senha.
O servidor verifica as credenciais. Se válidas, um token JWT é enviado de volta para o frontend.
O token é usado para autenticação nas próximas requisições.

2.Acessos e Alertas:

Sempre que um usuário tenta acessar com credenciais inválidas, o sistema registra a tentativa e, após múltiplas falhas, gera alertas.
O painel de controle exibe alertas de segurança com base nessas falhas ou em eventos críticos relacionados aos recursos (ex: falhas de manutenção).

3. Gerenciamento de Recursos:

O administrador pode adicionar, editar e remover recursos internos.
A visualização de recursos inclui a quantidade de acessos feitos, se estão disponíveis, em manutenção ou fora de uso.

4. Exibição de Atividades:

O painel de controle exibe todas as atividades relevantes realizadas no sistema (login/logout, edições, alterações de status de recursos).