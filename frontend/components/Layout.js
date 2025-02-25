import React from 'react';
import { Container } from 'semantic-ui-react';
import { useRouter } from 'next/router';
import { useAuth } from '../context/AuthContext';
import Header from './Header';
import Footer from './Footer';
import Carousel from "./Carousel";

const Layout = ({ children }) => {
    const router = useRouter();
    const { loading, isAuthenticated } = useAuth();

    const publicPages = ['/login', '/about', '/'];
    const isHomePage = router.pathname === '/' || router.pathname === '/about';
    const requiresAuth = !publicPages.includes(router.pathname);

    if (loading) {
        return (
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100vh'
            }}>
                Loading...
            </div>
        );
    }

    // Only redirect if not on a public page and not authenticated
    if (requiresAuth && !isAuthenticated) {
        router.push('/login');
        return null;
    }

    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            minHeight: '100vh',
        }}>
            <Header />
            <main style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                backgroundColor: '#f5f5f5'
            }}>
                {isHomePage && (<><br /><br /> <Carousel /></>)}
                <Container style={{
                    padding: '20px 0',
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column'
                }}>
                    {children}
                </Container>
            </main>
            <Footer />
        </div>
    );
};

export default Layout;