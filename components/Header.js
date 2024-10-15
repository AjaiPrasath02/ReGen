import React from 'react';
import { Link } from '../routes';

const Header = () => {
    const headerStyle = {
        backgroundColor: '#289672',
        marginBottom: '15px',
        height: '100px',
        display: 'flex',
        alignItems: 'center',
        padding: '0 20px',
        color: 'white',
        fontFamily: 'Lato, "Helvetica Neue", Arial, Helvetica, sans-serif',
        justifyContent: 'space-between',
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
