import React from 'react';
import { Icon } from 'semantic-ui-react';

export default () => {
    return (
        <div style={{ position: 'relative', bottom: '0', marginTop: '0px', padding: '20px 10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#289672' }}>
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
                        <strong>EECS14</strong><br />
                        @ku.ac.ae
                    </p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                    <Icon circular inverted name='phone' />
                    <p style={{ marginLeft: '10px' }}>
                        <strong>+971 (2)</strong><br />
                        312 3333
                    </p>
                </div>
            </div>
        </div>
    );
}
