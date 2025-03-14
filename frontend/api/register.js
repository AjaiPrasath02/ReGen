// src/api/cpuApi.js

// Base URL for your API (you can modify this based on your environment)
const BASE_URL = 'http://localhost:4000/api';

// API service object
const cpuApi = {
  // Register CPU function
  async registerCpu(cpuData) {
    try {
      const response = await fetch(`${BASE_URL}/cpu/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(cpuData),
      });

      // Check if response is ok (status in the range 200-299)
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Parse and return the JSON response
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error registering CPU:', error);
      throw error;
    }
  },
};

// Export the API service
export default cpuApi;