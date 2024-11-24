import React from 'react';
import { Icon } from 'semantic-ui-react';

const Footer = () => {
    const currentYear = new Date().getFullYear();

    return (
        <footer style={{
            fontSize: '1.2rem',
            marginTop: 'auto',
            padding: '20px 10px',
            background: '#0ea432',
            // background: 'linear-gradient(to top, #289672, rgba(40, 150, 114, 0.8), rgba(40, 150, 114, 0.6))',
            color: '#000000',
            height: 'max-content'
        }}>
            <div style={{
                maxWidth: '1200px',
                margin: '0 auto',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
            }}>
                <div>
                    <Icon circular inverted name='pin' aria-label="Location" />
                    <span>Coimbatore, Tamil Nadu, India</span>
                </div>
                <div>
                    <a href="mailto:info@cit.ac.in" style={{ color: '#000000' }}>
                        <Icon circular inverted name='mail' aria-label="Email" />
                        <span>info@cit.ac.in</span>
                    </a>
                </div>
                <div>
                    <a href="tel:+911231233335" style={{ color: '#000000' }}>
                        <Icon circular inverted name='phone' aria-label="Phone" />
                        <span>+91 12312 33335</span>
                    </a>
                </div>
            </div>
            <div style={{ textAlign: 'center', marginTop: '20px' }}>
                © {currentYear} ReGen. All rights reserved.
            </div>
        </footer>
    );
};

export default Footer;