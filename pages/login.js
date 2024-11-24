import React, { Component } from 'react';
import { withRouter } from 'next/router';
import { Menu, Form, Button, Message, Grid, Dropdown } from 'semantic-ui-react';

const roleOptions = [
    { key: 'municipality', text: 'Local Municipality', value: 'municipality' },
    { key: 'manufacturer', text: 'Manufacturer', value: 'manufacturer' }
];

// Static user database
const STATIC_USERS = {
    'municipality@regen.com': {
        password: 'municipality123',
        role: 'municipality',
        name: 'City Municipality',
        walletAddress: '0xc1A3F0e3Ca985A639cf624b2bbc07c2a9B18B845'
    },
    'manufacturer1@regen.com': {
        password: 'manufacturer123',
        role: 'manufacturer',
        name: 'Manufacturer 1',
        walletAddress: '0xc1A3F0e3Ca985A639cf624b2bbc07c2a9B18B845'
    },
    'manufacturer2@regen.com': {
        password: 'manufacturer123',
        role: 'manufacturer',
        name: 'Manufacturer 2',
        walletAddress: '0x789B52f8F5E41d44591C7dE7F2c830fEAfC3F3Fb'
    }
};

const styles = {
    pageWrapper: {
        width: '100%',
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '0 20px',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        boxSizing: 'border-box'
    },
    container: {
        padding: '20px 20px',
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #f5f7fa 0%, #e4e8eb 100%)',
        boxSizing: 'border-box',
        minWidth: '500px',
        minHeight: '600px'
    },
    form: {
        width: '70%',
        maxWidth: '500px',
        margin: '0 auto',
        display: 'flex',
        flexDirection: 'column',
        gap: '1.2rem',
        boxSizing: 'border-box'
    },
    header: {
        textAlign: 'center',
        marginBottom: '1rem',
        color: '#0ea432',
        textShadow: '1px 1px 1px rgba(0,0,0,0.1)'
    },
    input: {
        width: '100%',
        marginBottom: '0',
        boxSizing: 'border-box'
    },
    message: {
        width: '100%',
        maxWidth: '500px',
        margin: '1rem auto 0',
        borderRadius: '8px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
    }
};

class LoginPage extends Component {
    state = {
        email: '',
        password: '',
        role: '',
        loading: false,
        errorMessage: '',
        success: null
    };

    componentDidMount() {
        // Check if already logged in and session is valid
        const token = localStorage.getItem('token');
        const role = localStorage.getItem('role');
        const sessionExpiry = localStorage.getItem('sessionExpiry');

        if (token && role && sessionExpiry && new Date().getTime() < parseInt(sessionExpiry)) {
            this.props.router.push(`/${role.toLowerCase()}`);
        } else {
            // Clear expired session
            localStorage.clear();
        }
    }

    handleChange = (e, data) => {
        const { name, value } = data || e.target;
        this.setState({ [name]: value });
    }

    handleRoleChange = (e, { value }) => {
        this.setState({ role: value });
    }

    validateCredentials = (email, password, role) => {
        const user = STATIC_USERS[email];
        if (!user) {
            throw new Error('User not found');
        }
        if (user.password !== password) {
            throw new Error('Invalid password');
        }
        if (user.role !== role) {
            throw new Error('Selected role does not match user role');
        }
        return user;
    }

    handleSubmit = async (event) => {
        event.preventDefault();
        const { email, password, role } = this.state;

        this.setState({ loading: true, errorMessage: '' });

        try {
            if (!email || !password || !role) {
                throw new Error('Please fill in all fields');
            }

            // Validate credentials against static database
            const user = this.validateCredentials(email, password, role);

            // Create authentication token (in real app, this would be JWT)
            const authToken = btoa(`${email}:${role}:${Date.now()}`);
            const sessionExpiry = new Date().getTime() + (24 * 60 * 60 * 1000);

            // Store user data in localStorage
            localStorage.setItem('token', authToken);
            localStorage.setItem('role', role);
            localStorage.setItem('userAddress', user.walletAddress);
            localStorage.setItem('userName', user.name);
            localStorage.setItem('sessionExpiry', sessionExpiry.toString());

            this.setState({ success: true });

            // Add a small delay before redirect
            setTimeout(() => {
                this.props.router.push('/connect-wallet');
            }, 1500);

        } catch (error) {
            this.setState({
                errorMessage: error.message,
                success: false
            });
        } finally {
            this.setState({ loading: false });
        }
    }

    render() {
        const { email, password, role, loading, errorMessage, success } = this.state;

        return (
            <div style={styles.pageWrapper}>
                <link rel="stylesheet"
                    href="//cdn.jsdelivr.net/npm/semantic-ui@2.4.1/dist/semantic.min.css"
                />
                <div style={styles.container}>
                    <Grid textAlign='center' verticalAlign='middle' style={{ flex: 1 }}>
                        <Grid.Column style={styles.gridColumn}>
                            <h2 style={styles.header}>
                                Login to ReGen Platform
                            </h2>
                            <Form size='large' onSubmit={this.handleSubmit} error={!!errorMessage} success={success} style={styles.form}>
                                <Form.Input
                                    fluid
                                    icon='user'
                                    iconPosition='left'
                                    placeholder='E-mail address'
                                    name='email'
                                    value={email}
                                    onChange={this.handleChange}
                                    required
                                    style={styles.input}
                                />
                                <Form.Input
                                    fluid
                                    icon='lock'
                                    iconPosition='left'
                                    placeholder='Password'
                                    type='password'
                                    name='password'
                                    value={password}
                                    onChange={this.handleChange}
                                    required
                                    style={styles.input}
                                />
                                <Form.Field required>
                                    <Dropdown
                                        placeholder='Select Role'
                                        fluid
                                        selection
                                        options={roleOptions}
                                        name="role"
                                        value={role}
                                        onChange={this.handleRoleChange}
                                        style={{fontSize: '0.8em'}}
                                        required
                                    />
                                </Form.Field>

                                <Button
                                    color='green'
                                    loading={loading}
                                    disabled={loading}
                                >
                                    Log In
                                </Button>

                                {success === false && (
                                    <Message
                                        error
                                        header='Error'
                                        content={errorMessage}
                                        style={styles.message}
                                    />
                                )}

                                {success && (
                                    <Message
                                        success
                                        header='Success'
                                        content="Login successful! Redirecting..."
                                        style={styles.message}
                                    />
                                )}
                            </Form>

                            {!success && (
                                <>
                                    <Message info style={styles.message}>
                                        <Message.Header style={{ color: '#0ea432' }}>Demo Credentials</Message.Header>
                                        <Message.List>
                                            <Message.Item>
                                                Municipality: municipality@regen.com / municipality123
                                            </Message.Item>
                                            <Message.Item>
                                                Manufacturer: manufacturer1@regen.com / manufacturer123
                                            </Message.Item>
                                        </Message.List>
                                    </Message>

                                    <Message warning style={styles.message}>
                                        Note: Please ensure you have MetaMask extension installed and enabled.
                                    </Message>
                                </>
                            )}
                        </Grid.Column>
                    </Grid>
                </div>
            </div>
        );
    }
}

LoginPage.getLayout = (page) => {
    return page; // Use default layout from _app.js
};

export default withRouter(LoginPage);