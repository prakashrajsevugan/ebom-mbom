import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/bom';

export const bomApi = {
  // Convert eBOM to mBOM
  convert: async (ebomInput) => {
    try {
      const response = await axios.post(`${API_URL}/convert`, { ebomInput });
      return response.data;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  },

  // Save BOM to database
  save: async (name, type, data, metadata) => {
    try {
      const response = await axios.post(`${API_URL}/save`, {
        name,
        type,
        data,
        metadata,
      });
      return response.data;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  },

  // Get all BOMs (optionally filter by type)
  getAll: async (type = null) => {
    try {
      const url = type ? `${API_URL}?type=${type}` : API_URL;
      const response = await axios.get(url);
      return response.data;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  },

  // Get BOM by ID and type
  getById: async (type, id) => {
    try {
      const response = await axios.get(`${API_URL}/${type}/${id}`);
      return response.data;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  },

  // Delete BOM by type and ID
  delete: async (type, id) => {
    try {
      const response = await axios.delete(`${API_URL}/${type}/${id}`);
      return response.data;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  },
};
