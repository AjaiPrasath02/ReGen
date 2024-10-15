import React from 'react';
import { Grid, Icon } from 'semantic-ui-react';

export default () => {
    return (
        <div style={{ 'position' : 'relative', 'bottom' : '0', 'margin-top':'20px'}}>
            <h4>Contact Us</h4>
            <Grid container columns={3} divided>
                <Grid.Row>
                <Grid.Column>
                    <Icon circular inverted name='pin' floated='left' />
                    <p><strong>Khalifa University</strong> AlSaada St., Abu Dhabi, United Arab Emirates</p>
                </Grid.Column>
                <Grid.Column>
                    <Icon circular inverted name='mail' floated='left' />
                    <p><strong>EECS14</strong> @ku.ac.ae</p>
                </Grid.Column>
                <Grid.Column>
                    <Icon circular inverted name='phone' floated='left' />
                    <p><strong>+971 (2)</strong> 312 3333</p>
                </Grid.Column>
                </Grid.Row>
            </Grid>
        </div>
    );
}