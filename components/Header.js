import React from 'react';
import { Link } from '../routes';

const Header = () => {
    const headerStyle = {
        backgroundColor: 'rgba(40, 150, 114, 0.8)', // Transparent green background at the top
        height: '100px',
        display: 'flex',
        alignItems: 'center',
        padding: '0 20px',
        color: 'white',
        fontFamily: 'Lato, "Helvetica Neue", Arial, Helvetica, sans-serif',
        justifyContent: 'space-between',
        background: 'linear-gradient(to bottom, rgba(40, 150, 114, 1), rgba(40, 150, 114, 0.9), rgba(40, 150, 114, 0.6))', // Glass effect gradient
        backdropFilter: 'blur(10px)', // Frosted glass effect
        boxShadow: '0 4px 10px rgba(0, 0, 0, 0.3)', // Subtle shadow for depth
        // borderRadius: '8px', // Rounded edges (optional)
        border: '1px solid rgba(255, 255, 255, 0.3)', // Light border for glass feel
    };
    

    const logoStyle = {
        fontSize: '24px',
        fontWeight: 'bold',
    };

    const navStyle = {
        display: 'flex',
        gap: '20px', // Space between items
    };

    const linkStyle = {
        color: 'white',
        fontWeight: 'bold',
        textDecoration: 'none',
    };

    return (
        <div style={headerStyle}>
            <div style={logoStyle}>ReGen</div>
            <div style={navStyle}>
                <Link route='/' legacyBehavior>
                    <a style={linkStyle}>About</a>
                </Link>
                <Link route='/registration' legacyBehavior>
                    <a style={linkStyle}>Local Municipality</a>
                </Link>
                <Link route='/productionline' legacyBehavior>
                    <a style={linkStyle}>Production Line Machine</a>
                </Link>
                <Link route='/recycler' legacyBehavior>
                    <a style={linkStyle}>Recycler</a>
                </Link>
                <Link route='/auctions/viewbales' legacyBehavior>
                    <a style={linkStyle}>Seller</a>
                </Link>
                <Link route='/sortingmachine' legacyBehavior>
                    <a style={linkStyle}>Sorting Machine</a>
                </Link>
                <Link route='/auctions/viewauctions' legacyBehavior>
                    <a style={linkStyle}>Buyer</a>
                </Link>
            </div>
        </div>
    );
}

export default Header;
