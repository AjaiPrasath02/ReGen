import React, { Component } from 'react';
import { withRouter } from 'next/router';
import { Button, Icon, Grid, Header, Message, Segment } from 'semantic-ui-react';

class Unauthorized extends Component {
    handleBackToHome = () => {
        this.props.router.push('/about');
    };

    handleBackToLogin = () => {
        this.props.router.push('/login');
    };

    render() {
        return (
                <div style={{ padding: '20px' }}>
                    <Grid textAlign='center' style={{ height: '80vh' }} verticalAlign='middle'>
                        <Grid.Column style={{ maxWidth: 600 }}>
                            <Segment padded='very' style={{ backgroundColor: '#f9f9f9' }}>
                                <Icon 
                                    name='ban' 
                                    size='huge' 
                                    color='red' 
                                    style={{ marginBottom: '1rem' }}
                                />
                                
                                <Header as='h1' color='red'>
                                    Access Denied
                                    <Header.Subheader style={{ marginTop: '1rem' }}>
                                        You don't have permission to access this page
                                    </Header.Subheader>
                                </Header>

                                <Message warning style={{ marginTop: '2rem' }}>
                                    <Message.Header>
                                        Possible reasons for this error:
                                    </Message.Header>
                                    <Message.List>
                                        <Message.Item>
                                            You're not logged in
                                        </Message.Item>
                                        <Message.Item>
                                            Your role doesn't have access to this resource
                                        </Message.Item>
                                        <Message.Item>
                                            Your wallet is not connected
                                        </Message.Item>
                                    </Message.List>
                                </Message>

                                <div style={{ marginTop: '2rem' }}>
                                    <Button
                                        icon
                                        labelPosition='left'
                                        color='green'
                                        onClick={this.handleBackToHome}
                                        style={{ marginRight: '1rem' }}
                                    >
                                        <Icon name='home' />
                                        Back to Home
                                    </Button>
                                    <Button
                                        icon
                                        labelPosition='left'
                                        color='blue'
                                        onClick={this.handleBackToLogin}
                                    >
                                        <Icon name='sign in' />
                                        Login
                                    </Button>
                                </div>
                            </Segment>
                        </Grid.Column>
                    </Grid>

                    <style jsx global>{`
                        .ui.segment {
                            border: none;
                            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                            text-align: center;
                        }

                        .ui.red.header {
                            margin-bottom: 1rem;
                        }

                        .ui.header .sub.header {
                            color: #666;
                            font-size: 1.1rem;
                            margin-top: 0.5rem;
                        }

                        .ui.warning.message {
                            background-color: #fff;
                            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
                        }

                        .ui.warning.message .header {
                            color: #794b02;
                        }

                        .ui.message .list .item {
                            line-height: 1.5em;
                            padding: 0.3em 0;
                        }

                        .ui.button {
                            padding: 1em 2em;
                        }

                        @media (max-width: 768px) {
                            .ui.button {
                                margin: 0.5rem 0;
                                width: 100%;
                            }
                        }
                    `}</style>
                </div>
        );
    }
}

export default withRouter(Unauthorized);