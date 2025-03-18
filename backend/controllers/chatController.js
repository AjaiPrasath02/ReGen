const { OpenAI } = require('openai');
const { searchCPUs } = require('./helpers/semanticSearch');

// Initialize OpenAI client
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

// Define tools for the agent
const tools = [
    {
        type: "function",
        function: {
            name: "searchCPUs",
            description: "Search for CPU information based on a query",
            parameters: {
                type: "object",
                properties: {
                    query: {
                        type: "string",
                        description: "The search query for CPUs"
                    }
                },
                required: ["query"]
            }
        }
    }
];

// Recursive agent function with streaming
async function runAgent(messages, socket, iteration = 0) {
    const MAX_ITERATIONS = 5;

    // Check recursion limit
    if (iteration >= MAX_ITERATIONS) {
        const errorMessage = "I apologize, but I'm having trouble processing your request. Please try again later.";
        socket.emit('llm-response-chunk', errorMessage);
        return [{ role: "assistant", content: errorMessage }];
    }

    // Create a streaming completion with OpenAI
    const stream = await openai.chat.completions.create({
        model: 'gpt-4o', // Ensure the model supports streaming and tools
        messages: messages,
        tools: tools,
        tool_choice: "auto", // Let the model decide when to use tools
        stream: true
    });

    let assistantMessageContent = '';
    let toolCalls = [];
    let currentToolCall = null;

    // Process the streaming response
    for await (const chunk of stream) {
        const delta = chunk.choices[0]?.delta;

        // Handle content chunks
        if (delta?.content) {
            assistantMessageContent += delta.content;
            socket.emit('llm-response-chunk', delta.content);
        }

        // Handle tool calls (streaming tool calls come in pieces)
        if (delta?.tool_calls) {
            const toolCallDelta = delta.tool_calls[0];
            if (toolCallDelta?.index !== undefined) {
                if (!currentToolCall || currentToolCall.index !== toolCallDelta.index) {
                    currentToolCall = { index: toolCallDelta.index, function: { name: '', arguments: '' } };
                    toolCalls.push(currentToolCall);
                }
                if (toolCallDelta.function?.name) {
                    currentToolCall.function.name += toolCallDelta.function.name;
                }
                if (toolCallDelta.function?.arguments) {
                    currentToolCall.function.arguments += toolCallDelta.function.arguments;
                }
            }
        }
    }

    // Construct the assistant message
    const assistantMessage = {
        role: "assistant",
        content: assistantMessageContent || null
    };
    if (toolCalls.length > 0) {
        assistantMessage.tool_calls = toolCalls.map(tc => ({
            id: `call_${Date.now()}_${tc.index}`, // Generate a unique ID
            type: "function",
            function: {
                name: tc.function.name,
                arguments: tc.function.arguments
            }
        }));
    }

    // Handle tool calls if present
    if (assistantMessage.tool_calls) {
        const toolMessages = [];
        for (const toolCall of assistantMessage.tool_calls) {
            if (toolCall.function.name === "searchCPUs") {
                const args = JSON.parse(toolCall.function.arguments);
                const query = args.query;
                try {
                    socket.emit('llm-response-chunk', `\nSearching for CPUs matching "${query}"...`);
                    const searchResults = await searchCPUs(query,5, socket);
                    toolMessages.push({
                        role: "tool",
                        content: JSON.stringify(searchResults),
                        tool_call_id: toolCall.id
                    });
                } catch (error) {
                    toolMessages.push({
                        role: "tool",
                        content: JSON.stringify({ error: error.message }),
                        tool_call_id: toolCall.id
                    });
                }
            }
        }
        // Recurse with updated conversation history
        const updatedMessages = [...messages, assistantMessage, ...toolMessages];
        const recursiveMessages = await runAgent(updatedMessages, socket, iteration + 1);
        return [assistantMessage, ...toolMessages, ...recursiveMessages];
    } else {
        // No tool calls; this is the final response
        return [assistantMessage];
    }
}

// Setup Socket.io handlers
const setupSocketHandlers = (io) => {
    io.on('connection', (socket) => {
        console.log('Client connected:', socket.id);

        // Initialize conversation history with a system message
        socket.conversationHistory = [
            { role: "system", content: "You are a helpful assistant that can search for CPU information. If asked about a CPU, you can search for it using the searchCPUs tool." }
        ];

        socket.on('user-message', async ({ message }) => {
            try {
                // Add user message to history
                socket.conversationHistory.push({ role: "user", content: message });

                // Signal response start
                socket.emit('llm-response-start');

                // Run the recursive agent with streaming
                const agentMessages = await runAgent(socket.conversationHistory, socket);

                // Update conversation history with agent responses
                socket.conversationHistory.push(...agentMessages);

                // Signal response completion
                socket.emit('llm-response-complete');

                // Trim history to keep last 10 messages + system message
                if (socket.conversationHistory.length > 11) {
                    socket.conversationHistory = [
                        socket.conversationHistory[0], // System message
                        ...socket.conversationHistory.slice(-10)
                    ];
                }
            } catch (error) {
                console.error('Error in agent run:', error);
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

module.exports = {
    setupSocketHandlers
};