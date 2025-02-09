console.log("🔥 api.js foi carregado!");
export const api = {
    // Login do usuário
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
            console.error("Erro no login:", error.message);
            return null;
        }
    },
  
    // Obter lista de recursos
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
            console.error("Erro ao buscar recursos:", error.message);
            return null;
        }
    },
  
    // Adicionar um novo recurso
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
            console.error("Erro ao adicionar recurso:", error.message);
            return null;
        }
    },
  
    // Editar um recurso existente
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
            console.error("Erro ao editar recurso:", error.message);
            return null;
        }
    },
  
    // Remover um recurso
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
            console.error("Erro ao remover recurso:", error.message);
            return null;
        }
    },
  };
  