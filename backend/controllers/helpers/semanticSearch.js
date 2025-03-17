const { generateEmbeddings } = require('./embeddings');
const Cpu = require('../../models/cpuModel');

let requestIdCounter = 0; // Counter for unique request IDs
const requestMap = new Map(); // Map to store resolve functions by request ID

/**
 * Perform semantic search on CPU collection
 * @param {string} query - The search query
 * @param {number} limit - Maximum number of results to return
 * @param {object} socket - The socket instance for communication
 * @returns {Promise<Array>} Matching CPU documents with their histories
 */
async function searchCPUs(query, limit = 5, socket) {
    try {
        // Attach the listener if not already attached
        if (!socket._cpuHistoryListenerAttached) {
            socket.on('cpu_history_result', (data) => {
                const { requestId, history } = data;
                if (requestMap.has(requestId)) {
                    const resolve = requestMap.get(requestId);
                    resolve({ history });
                    requestMap.delete(requestId); // Clean up to prevent memory leaks
                }
            });
            socket._cpuHistoryListenerAttached = true; // Set flag to prevent re-attachment
        }

        // Generate embedding for the search query
        const embedding = await generateEmbeddings(query);

        // Perform vector search using MongoDB's $vectorSearch
        const cpuCollection = await Cpu.aggregate([
            {
                $vectorSearch: {
                    index: "default",
                    queryVector: embedding,
                    path: "embeddings",
                    numCandidates: limit * 10,
                    limit: limit
                }
            },
            {
                $project: {
                    _id: 1,
                    cpuAddress: 1,
                    score: { $meta: "vectorSearchScore" }
                }
            }
        ]).exec();

        // Fetch history for each CPU using socket events
        const results = await Promise.all(
            cpuCollection.map(cpu => {
                return new Promise((resolve) => {
                    const requestId = requestIdCounter++; // Generate unique request ID
                    requestMap.set(requestId, resolve); // Store resolve function
                    socket.emit('cpu_history_fetching', { requestId, cpuAddress: cpu.cpuAddress });
                });
            })
        );

        console.log('Search results:', JSON.stringify(results, null, 4));
        return results;
    } catch (error) {
        console.error('Error performing semantic search:', error);
        throw error;
    }
}

module.exports = { searchCPUs };