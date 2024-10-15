import React from 'react';
import { Container } from 'semantic-ui-react';
import Header from './Header';

export default (props) => {
    return (
        <>
        <Header />

        <Container style={{  'min-height': '100vh', 'position': 'relative' }}>
            {props.children}
            
        </Container>
        </>
    );
};