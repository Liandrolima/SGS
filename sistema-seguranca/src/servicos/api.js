export const api = {
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
                  "Authorization": `Bearer ${token}`, // 🔥 Agora envia o token corretamente
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
};
