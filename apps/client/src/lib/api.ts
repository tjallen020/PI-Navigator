import axios from 'axios';

export const api = axios.create({
  baseURL: '/'
});

export const setAuthToken = (token?: string) => {
  if (token) {
    api.defaults.headers.common.Authorization = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common.Authorization;
  }
};

export interface RecommendationRequest {
  option: string;
  resourceLevel: '<2h' | '>2h';
  complexity: 'low' | 'high';
  dataAvailability: 'none' | 'some' | 'extensive';
  mode: 'fast' | 'guided' | 'facilitator';
  plainLanguage: boolean;
}

export const fetchNode = async (key: string) => {
  const response = await api.get(`/nodes/${key}`);
  return response.data;
};

export const resolveRecommendation = async (key: string, payload: RecommendationRequest) => {
  const response = await api.post(`/nodes/${key}/resolve`, payload);
  return response.data;
};

export const fetchTools = async () => (await api.get('/tools')).data;
export const fetchPackages = async () => (await api.get('/packages')).data;
