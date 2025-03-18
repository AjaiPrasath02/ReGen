import React, { useState, useEffect, useRef } from "react";
import { Button, Input, Card, Container, Header, Form, Segment, Message, Dimmer, Loader } from "semantic-ui-react";
import io from "socket.io-client";
const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:4000";
import web3 from "../ethereum/web3";
import contractInstance from "../ethereum/cpuProduction";

const Chat = () => {
  const [socket, setSocket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const [currentAssistantResponse, setCurrentAssistantResponse] = useState(""); // Track current response


  const getCPUHistory = async (cpuAddress) => {
    console.log(`Fetching history for CPU: ${cpuAddress}...`);

    const events = await Promise.all([
        contractInstance.getPastEvents("CPURegistered", { filter: { cpuAddress }, fromBlock: 0, toBlock: "latest" }),
        contractInstance.getPastEvents("ComponentAdded", { filter: { cpuAddress }, fromBlock: 0, toBlock: "latest" }),
        contractInstance.getPastEvents("ComponentRemoved", { filter: { cpuAddress }, fromBlock: 0, toBlock: "latest" }),
        contractInstance.getPastEvents("ComponentUpdated", { filter: { cpuAddress }, fromBlock: 0, toBlock: "latest" }),
        contractInstance.getPastEvents("LabNumberUpdated", { filter: { cpuAddress }, fromBlock: 0, toBlock: "latest" })
    ]);

    const sortedEvents = events.flat().sort((a, b) => {
        if (Number(a.blockNumber) === Number(b.blockNumber)) {
            return Number(a.logIndex) - Number(b.logIndex);
        }
        return Number(a.blockNumber) - Number(b.blockNumber);
    });

    let cpuState = { components: [] };
    let history = [];
    const registeredIndex = sortedEvents.findIndex(event => event.event === "CPURegistered");

    for (let [index, event] of sortedEvents.entries()) {
        const eventType = event.event;
        const eventData = event.returnValues;
        const block = await web3.eth.getBlock(Number(event.blockNumber));
        const timestamp = new Date(Number(block.timestamp) * 1000).toISOString();

        if (eventType === "CPURegistered") {
            cpuState = {
                cpuAddress: eventData.cpuAddress,
                manufacturerID: eventData.manufacturerID.toString(),
                modelName: eventData.modelName,
                serialNumber: eventData.serialNumber,
                productionDate: new Date(Number(eventData.productionDate) * 1000).toISOString(),
                labNumber: eventData.labNumber.toString(),
                status: "Working",
                components: cpuState.components.length > 0 ? cpuState.components : eventData.components,
                time: new Date(Number(eventData.time) * 1000).toISOString()
            };
        } else if (eventType === "ComponentAdded") {
            cpuState.components.push({
                componentID: eventData.componentID.toString(),
                componentType: eventData.componentType,
                status: eventData.status,
                details: eventData.details
            });
        } else if (eventType === "ComponentRemoved") {
            const componentIndex = Number(eventData.componentID);
            if (cpuState.components[componentIndex]) {
                cpuState.components[componentIndex].status = "Removed";
            }
        } else if (eventType === "ComponentUpdated") {
            const componentIndex = Number(eventData.componentID);
            if (cpuState.components[componentIndex]) {
                cpuState.components[componentIndex].status = eventData.newStatus;
                cpuState.components[componentIndex].details = eventData.newDetails;
            }
        } else if (eventType === "LabNumberUpdated") {
            cpuState.labNumber = eventData.newLabNumber.toString();
        }

        if (index >= registeredIndex) {
            history.push({
                event: eventType,
                time: timestamp,
                data: {
                    ...cpuState,
                    components: cpuState.components.map(c => ({ ...c }))
                }
            });
        }
    }
    console.log(history);
    return history;
};

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

    socket.on("cpu_history_fetching", async (data) => {
      const { requestId, cpuAddress } = data;
      const history = await getCPUHistory(cpuAddress);
      socket.emit("cpu_history_result", {
          requestId,
          history
      });
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
    <Segment raised style={{ maxWidth: '100vw', margin: '0 0', height: '80vh', display: 'flex', flexDirection: 'column' }}>
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