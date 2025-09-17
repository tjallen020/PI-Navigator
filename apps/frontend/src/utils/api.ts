import axios from 'axios';

class ApiClient {
  client = axios.create({
    baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:4000',
  });

  constructor() {
    this.client.interceptors.request.use((config) => {
      if (this.token) {
        config.headers = {
          ...config.headers,
          Authorization: `Bearer ${this.token}`,
        };
      }
      return config;
    });
  }

  private token: string | null = null;

  setToken(token: string | null) {
    this.token = token;
  }
}

export const api = new ApiClient();
