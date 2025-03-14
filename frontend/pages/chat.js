import React from "react";
import Chat from "../components/Chat";
import { Container, Header } from 'semantic-ui-react';

const ChatPage = () => {
  return (
    <Container style={{ padding: '2rem 0' }}>
      <Header as="h1" textAlign="center" style={{ marginBottom: '2rem' }}>AI Chat Assistant</Header>
      <Chat />
    </Container>
  );
};

export default ChatPage; 