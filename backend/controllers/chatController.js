const { OpenAI } = require('openai');

// Initialize OpenAI client
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

// Setup Socket.io handlers
const setupSocketHandlers = (io) => {
    io.on('connection', (socket) => {
        console.log('Client connected:', socket.id);

        socket.on('user-message', async ({ message }) => {
            try {
                console.log('Received message:', message);
                
                // Signal that a new response is starting
                socket.emit('llm-response-start');
                
                // Create a streaming completion with OpenAI
                const stream = await openai.chat.completions.create({
                    model: 'gpt-4o-mini',
                    messages: [{ role: 'user', content: message }],
                    stream: true,
                });
                
                // Process each chunk of the stream
                for await (const chunk of stream) {
                    const content = chunk.choices[0]?.delta?.content || '';
                    if (content) {
                        // Send each chunk to the client
                        socket.emit('llm-response-chunk', content);
                    }
                }
                
                // Signal that the response is complete
                socket.emit('llm-response-complete');
                
            } catch (error) {
                console.error('OpenAI API error:', error);
                socket.emit('llm-error', { 
                    message: error.message || 'An error occurred while processing your request' 
                });
            }
        });

        socket.on('disconnect', () => {
            console.log('Client disconnected:', socket.id);
        });
    });
};

// This could be a standard REST API endpoint for chatting (non-streaming)
const chatWithAI = async (req, res) => {
    try {
        const { message } = req.body;
        
        if (!message) {
            return res.status(400).json({ error: 'Message is required' });
        }
        
        const response = await openai.chat.completions.create({
            model: 'gpt-3.5-turbo',
            messages: [{ role: 'user', content: message }],
        });
        
        return res.json({ 
            response: response.choices[0].message.content 
        });
    } catch (error) {
        console.error('Error in chat endpoint:', error);
        return res.status(500).json({ 
            error: error.message || 'An error occurred while processing your request' 
        });
    }
};

module.exports = {
    setupSocketHandlers,
    chatWithAI
}; 