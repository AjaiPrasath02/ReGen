import React, { useState, useEffect, useRef } from "react";
import { Button, Input, Card, Container, Header, Form, Segment, Message, Dimmer, Loader } from "semantic-ui-react";
import io from "socket.io-client";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:4000";

const Chat = () => {
  const [socket, setSocket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const [currentAssistantResponse, setCurrentAssistantResponse] = useState(""); // Track current response

  // Initialize socket connection
  useEffect(() => {
    const newSocket = io(BACKEND_URL);
    setSocket(newSocket);

    // Clean up the socket connection when component unmounts
    return () => {
      newSocket.disconnect();
    };
  }, []);

  // Set up socket event listeners
  useEffect(() => {
    if (!socket) return;

    // Listen for when a new response starts
    socket.on("llm-response-start", () => {
      // Create a new assistant message with empty content
      setMessages((prevMessages) => [
        ...prevMessages,
        { role: "assistant", content: "" }
      ]);
      // Reset the current response
      setCurrentAssistantResponse("");
    });

    // Listen for response chunks from the streaming API
    socket.on("llm-response-chunk", (chunk) => {
      // Update the current response with the new chunk
      setCurrentAssistantResponse((prev) => prev + chunk);
    });

    // Listen for when the response is complete
    socket.on("llm-response-complete", () => {
      // Update the last message with the complete response
      setMessages((prevMessages) => {
        const updatedMessages = [...prevMessages];
        const lastMessage = updatedMessages[updatedMessages.length - 1];
        
        if (lastMessage && lastMessage.role === "assistant") {
          // Set the complete response
          lastMessage.content = currentAssistantResponse;
        }
        
        return updatedMessages;
      });
      setIsLoading(false);
    });

    socket.on("llm-error", (error) => {
      setMessages((prevMessages) => [
        ...prevMessages,
        { role: "system", content: `Error: ${error.message || "An error occurred"}` }
      ]);
      setIsLoading(false);
    });

    return () => {
      socket.off("llm-response-start");
      socket.off("llm-response-chunk");
      socket.off("llm-response-complete");
      socket.off("llm-error");
    };
  }, [socket, currentAssistantResponse]);

  // Update the last message with the current response as it streams
  useEffect(() => {
    if (currentAssistantResponse) {
      setMessages((prevMessages) => {
        const updatedMessages = [...prevMessages];
        const lastMessage = updatedMessages[updatedMessages.length - 1];
        
        if (lastMessage && lastMessage.role === "assistant") {
          lastMessage.content = currentAssistantResponse;
        }
        
        return updatedMessages;
      });
    }
  }, [currentAssistantResponse]);

  // Auto-scroll to the most recent message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading || !socket) return;

    const userMessage = { role: "user", content: input };
    setMessages((prevMessages) => [...prevMessages, userMessage]);
    setIsLoading(true);
    
    // Send the message to the backend
    socket.emit("user-message", { message: input });
    setInput("");
  };

  return (
    <Segment raised style={{ maxWidth: '700px', margin: '0 auto', height: '600px', display: 'flex', flexDirection: 'column' }}>
      <Header as="h2">AI Chat</Header>
      
      <Segment 
        style={{ 
          flexGrow: 1, 
          overflowY: 'auto', 
          display: 'flex', 
          flexDirection: 'column', 
          padding: '1rem' 
        }}
      >
        {messages.length === 0 ? (
          <Message
            info
            content="Send a message to start the conversation"
            style={{ textAlign: 'center' }}
          />
        ) : (
          messages.map((message, index) => (
            <div
              key={index}
              style={{
                display: 'flex',
                justifyContent: message.role === "user" ? "flex-end" : "flex-start",
                marginBottom: '0.75rem'
              }}
            >
              <Message
                style={{
                  maxWidth: '80%',
                  marginBottom: '0.25rem'
                }}
                color={
                  message.role === "user"
                    ? "blue"
                    : message.role === "system"
                    ? "red"
                    : "grey"
                }
              >
                <div style={{ whiteSpace: 'pre-wrap' }}>{message.content}</div>
              </Message>
            </div>
          ))
        )}
        {isLoading && (
          <div style={{ textAlign: 'center', margin: '1rem 0' }}>
            <Dimmer active inverted>
              <Loader size="small">Loading</Loader>
            </Dimmer>
          </div>
        )}
        <div ref={messagesEndRef} />
      </Segment>
      
      <Segment secondary>
        <Form onSubmit={handleSubmit}>
          <Form.Group>
            <Form.Field width={13}>
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type your message..."
                disabled={isLoading}
                fluid
              />
            </Form.Field>
            <Form.Field width={3}>
              <Button 
                primary 
                type="submit" 
                disabled={isLoading || !input.trim()}
                fluid
              >
                Send
              </Button>
            </Form.Field>
          </Form.Group>
        </Form>
      </Segment>
    </Segment>
  );
};

export default Chat; 