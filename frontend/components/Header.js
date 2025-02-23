import React from 'react';
import { Link } from '../routes';
import { useRouter } from 'next/router';

const Header = () => {
    const router = useRouter();
    const isAuthenticated = typeof window !== 'undefined' && localStorage.getItem('token');
    const userRole = typeof window !== 'undefined' && localStorage.getItem('role');

    const handleLogout = () => {
        localStorage.clear();
        router.push('/login');
    };

    const headerStyle = {
        height: '100px',
        display: 'flex',
        alignItems: 'center',
        padding: '0 20px',
        color: 'white',
        fontFamily: '"Poppins", sans-serif',
        justifyContent: 'space-between',
        backgroundColor: '#0ea432',
        backdropFilter: 'blur(10px)',
        boxShadow: '0 4px 10px rgba(0, 0, 0, 0.3)',
    };

    const logoStyle = {
        fontSize: '24px',
    };

    const navStyle = {
        display: 'flex',
        gap: '20px',
    };

    const renderNavLinks = () => {
        if (!isAuthenticated) {
            return (
                <>
                    <Link route='/about' legacyBehavior>
                        <a className="link">About</a>
                    </Link>
                    <span className="divider">|</span>
                    <Link route='/login' legacyBehavior>
                        <a className="link">Login</a>
                    </Link>
                </>
            );
        }

        const roleBasedLinks = {
            municipality: [
                { route: '/registration', text: 'Registration' },
                { route: '/about', text: 'About' }
            ],
            manufacturer: [
                { route: '/productionline', text: 'Production Line' },
                { route: '/about', text: 'About' }
            ],
            technician: [
                { route: '/recycler', text: 'Recycler' },
                { route: '/about', text: 'About' }
            ],
            labassistant: [
                { route: '/lab', text: 'Lab' },
                { route: '/about', text: 'About' }
            ]
        };

        return (
            <>
                {roleBasedLinks[userRole]?.map((link, index) => (
                    <React.Fragment key={link.route}>
                        <Link route={link.route} legacyBehavior>
                            <a className="link">{link.text}</a>
                        </Link>
                        {index < roleBasedLinks[userRole].length - 1 && (
                            <span className="divider">|</span>
                        )}
                    </React.Fragment>
                ))}
                <span className="divider">|</span>
                <a className="link" onClick={handleLogout}>Logout</a>
            </>
        );
    };

    return (
        <div style={headerStyle}>
            <div style={logoStyle}>ReGen</div>
            <div style={navStyle}>
                {renderNavLinks()}
            </div>
        </div>
    );
}

export default Header;
