const { OpenAI } = require('openai');
require('dotenv').config()

// Initialize OpenAI client with API key from environment variables
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Generates embeddings from CPU data using OpenAI
 * @param {Object} cpuData - The CPU data to generate embeddings from
 * @returns {Promise<number[]>} - Array of embedding values
 */
async function generateEmbeddings(cpuData) {
    try {
        // Convert cpuData object into a string representation
        const inputText = JSON.stringify(cpuData);
        
        // Call OpenAI API to generate embeddings
        const response = await openai.embeddings.create({
            model: "text-embedding-3-small", // You can change to other models like "text-embedding-ada-002"
            input: inputText,
            encoding_format: "float" // Returns embeddings as floating-point numbers
        });

        console.log(response)

        // Extract the embeddings from the response
        const embeddings = response.data[0].embedding;

        return embeddings.slice(0,256);
    } catch (error) {
        console.error('Error generating embeddings:', error);
        throw new Error('Failed to generate embeddings: ' + error.message);
    }
}

module.exports = { generateEmbeddings } 

