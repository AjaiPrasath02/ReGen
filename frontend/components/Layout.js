import React, { useEffect, useState } from 'react';
import { Container } from 'semantic-ui-react';
import { useRouter } from 'next/router';
import Header from './Header';
import Footer from './Footer';
import Carousel from "./Carousel";

const Layout = ({ children }) => {  // Changed props to { children }
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(true);
    
    const publicPages = ['/login', '/about', '/'];
    const isHomePage = router.pathname === '/' || router.pathname === '/about';

    useEffect(() => {
        const checkAuth = () => {
            const token = localStorage.getItem('token');
            const currentPath = router.pathname;

            if (!token && !publicPages.includes(currentPath)) {
                router.push('/login');
                return;
            }
            setIsLoading(false);
        };

        checkAuth();
        console.log(router.pathname)
    }, [router.pathname]);

    if (isLoading) {
        return <div>Loading...</div>;
    }

    return (
        <div style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            minHeight: '100vh',
            // position: 'relative'  // Added position relative
        }}>
            <Header />
            <main style={{ flex: 1 }}>
                {isHomePage && <Carousel />}
                <Container style={{ padding: '20px 0' }}>
                    {children}
                </Container>
            </main>
            <Footer />
        </div>
    );
};

export default Layout;