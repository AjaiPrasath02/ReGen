import React from "react";
import Chat from "../components/Chat";
import { Container, Header } from 'semantic-ui-react';

const ChatPage = () => {
  return (
    <Container style={{ padding: '2rem 0' }}>
      <Chat />
    </Container>
  );
};

export default ChatPage; 