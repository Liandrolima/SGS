import axios from "axios";
console.log("🔥 api.js foi carregado!");



export const api = {
    // 🟢 Login do usuário
    login: async (email, password) => {
        try {
            const response = await fetch("http://localhost:5000/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Erro ao fazer login");
            }

            // 🔥 Salvar token no localStorage
            localStorage.setItem("token", data.token);
            console.log("Token armazenado:", data.token);

            return data;
        } catch (error) {
            console.error("❌ Erro no login:", error.message);
            return null;
        }
    },

    // 🟢 Obter lista de recursos
    getResources: async () => {
        const token = localStorage.getItem("token");
        if (!token) {
            console.error("❌ Nenhum token encontrado no localStorage!");
            return null;
        }

        try {
            const response = await fetch("http://localhost:5000/api/resources", {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                throw new Error("Erro ao carregar recursos");
            }

            return response.json();
        } catch (error) {
            console.error("❌ Erro ao buscar recursos:", error.message);
            return null;
        }
    },

    // 🟢 Adicionar um novo recurso
    addResource: async (newResource) => {
        const token = localStorage.getItem("token");
        if (!token) {
            console.error("❌ Nenhum token encontrado para adicionar recurso!");
            return null;
        }

        console.log("📤 Tentando adicionar recurso:", JSON.stringify(newResource));

        try {
            const response = await fetch("http://localhost:5000/api/resources", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`,
                },
                body: JSON.stringify(newResource),
            });

            const responseData = await response.json();
            console.log("📥 Resposta do servidor:", response.status, responseData);

            if (!response.ok) {
                throw new Error("Erro ao adicionar recurso");
            }

            return responseData;
        } catch (error) {
            console.error("❌ Erro ao adicionar recurso:", error.message);
            return null;
        }
    },

    // 🟢 Editar um recurso existente
    editResource: async (id, updatedResource) => {
        const token = localStorage.getItem("token");
        if (!token) {
            console.error("❌ Nenhum token encontrado para editar recurso!");
            return null;
        }

        try {
            const response = await fetch(`http://localhost:5000/api/resources/${id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`,
                },
                body: JSON.stringify(updatedResource),
            });

            if (!response.ok) {
                throw new Error("Erro ao editar recurso");
            }

            return response.json();
        } catch (error) {
            console.error("❌ Erro ao editar recurso:", error.message);
            return null;
        }
    },

    // 🟢 Remover um recurso
    deleteResource: async (id) => {
        const token = localStorage.getItem("token");
        if (!token) {
            console.error("❌ Nenhum token encontrado para excluir recurso!");
            return null;
        }

        try {
            const response = await fetch(`http://localhost:5000/api/resources/${id}`, {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                throw new Error("Erro ao remover recurso");
            }

            return response.json();
        } catch (error) {
            console.error("❌ Erro ao remover recurso:", error.message);
            return null;
        }
    },

    getUsuarios: async () => {
        const response = await fetch("http://localhost:5000/api/users");
        return response.json();
      },

    // 🟢 Cadastrar novo usuário
    cadastrarUsuario: async ({ email, password, role }) => {
        const usuarioFormatado = { email, password, role };
        
        console.log("📤 Tentando cadastrar usuário:", JSON.stringify(usuarioFormatado));

        try {
            const response = await fetch("http://localhost:5000/api/users", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(usuarioFormatado),
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Erro ao cadastrar usuário: ${response.statusText} - ${errorText}`);
            }

            const data = await response.json();
            console.log("✅ Usuário cadastrado com sucesso:", data);
            return data;
        } catch (error) {
            console.error("❌ Erro ao cadastrar usuário:", error);
            return null;
        }
    },

    listarUsuarios: async () => {
        try {
            const response = await fetch("http://localhost:5000/api/users");
            if (!response.ok) {
                throw new Error("Erro ao listar usuários");
            }
            return response.json();
        } catch (error) {
            console.error("Erro ao listar usuários:", error);
            throw error;
        }
    },
    
    editarUsuario: async (email, usuarioAtualizado) => {
        try {
          const response = await axios.put(`http://localhost:5000/api/users/${email}`, usuarioAtualizado);
          return response.data;
        } catch (error) {
          console.error("Erro ao editar usuário:", error);
          throw new Error("Erro ao editar usuário");
        }
      },
      
    
    removerUsuario: async (email) => {
        try {
            const response = await fetch(`http://localhost:5000/api/users/${email}`, {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                },
            });
            if (!response.ok) {
                throw new Error("Erro ao remover usuário");
            }
            console.log("Usuário removido com sucesso!");
        } catch (error) {
            console.error("Erro ao remover usuário:", error);
            throw error;
        }
    },
    
    

    // 🟢 Obter atividades recentes
    getActivities: async () => {
        const token = localStorage.getItem("token");
        if (!token) {
            console.error("❌ Nenhum token encontrado no localStorage!");
            return null;
        }

        try {
            const response = await fetch("http://localhost:5000/api/activities", {
                method: "GET",
                headers: {
                    "Cache-Control": "no-cache",
                    "Authorization": `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                throw new Error("Erro ao carregar atividades");
            }

            return response.json();
        } catch (error) {
            console.error("Erro ao obter atividades:", error);
            return [];
        }
    },

    // 🟢 Obter alertas de segurança
    getSecurityAlerts: async () => {
        const token = localStorage.getItem("token");
        if (!token) {
            console.error("❌ Nenhum token encontrado no localStorage!");
            return null;
        }

        try {
            const response = await fetch("http://localhost:5000/api/alerts", {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                throw new Error("Erro ao carregar alertas de segurança");
            }

            return response.json(); // Retorna os alertas de segurança
        } catch (error) {
            console.error("❌ Erro ao buscar alertas de segurança:", error.message);
            return [];
        }
    },
};
