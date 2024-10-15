import React, { useEffect } from 'react';
import { Container } from 'semantic-ui-react';
import Header from './Header';
import Footer from './Footer';
import Carousel from "./Carousel";
import HomePage from "../pages/index";

export default (props) => {
    const isHomePage = props.children && props.children._source && props.children._source.fileName.includes('index.js');    
    useEffect(()=> {
        console.log(isHomePage);
    }, [])
    return (
        <>
            <Header />
            {isHomePage &&
                <>
                    <Carousel />
                    <hr style={{ margin: "50px 20px" }} />
                </>
            }
            <Container style={{ 'min-height': '100vh', 'position': 'relative' }}>
                {props.children}
            </Container>
            <hr style={{ margin: "10px 20px" }} />
            <Footer />
        </>
    );
};