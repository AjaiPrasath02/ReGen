import React from 'react';
import { Icon } from 'semantic-ui-react';

export default () => {
    return (
        <div style={{
            position: 'relative',
            height: "100px",
            bottom: '0',
            marginTop: '0px',
            padding: '20px 10px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            background: 'linear-gradient(to top, #289672, rgba(40, 150, 114, 0.8), rgba(40, 150, 114, 0.6))', // Bottom to top gradient
            color: '#ffffff'
        }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
                <Icon circular inverted name='pin' />
                <p style={{ marginLeft: '10px' }}>
                    <strong>Coimbatore Institute of Technology</strong><br />
                    Coimbatore, Tamil Nadu, India
                </p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center' }}>
                <div style={{ marginRight: '30px', display: 'flex', alignItems: 'center' }}>
                    <Icon circular inverted name='mail' />
                    <p style={{ marginLeft: '10px' }}>
                        <strong>EMAIL</strong><br />
                        info@cit.ac.in
                    </p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                    <Icon circular inverted name='phone' />
                    <p style={{ marginLeft: '10px' }}>
                        <strong>+91</strong><br />
                        12312 33335
                    </p>
                </div>
            </div>
        </div>
    );
}
