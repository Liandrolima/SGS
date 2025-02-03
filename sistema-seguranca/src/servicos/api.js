const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

export const api = {
  login: async (email, password) => {
    const response = await fetch(`${API_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      throw new Error("Erro de autenticação");
    }

    return response.json();
  },

  getResources: async () => {
    const response = await fetch(`${API_URL}/api/resources`);

    if (!response.ok) {
      throw new Error("Erro ao carregar recursos");
    }

    return response.json();
  },
};
