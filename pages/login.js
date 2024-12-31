import React, { Component } from 'react';
import { withRouter } from 'next/router';
import { Menu, Form, Button, Message, Grid, Dropdown } from 'semantic-ui-react';

const roleOptions = [
    { key: 'm', text: 'Municipality', value: 'municipality' },
    { key: 'mf', text: 'Manufacturer', value: 'manufacturer' },
    { key: 't', text: 'Technician', value: 'technician' }
];

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
        const token = localStorage.getItem('token');
        const role = localStorage.getItem('role');
        const sessionExpiry = localStorage.getItem('sessionExpiry');

        if (token && role && sessionExpiry && new Date().getTime() < parseInt(sessionExpiry)) {
            this.props.router.push(`/${role.toLowerCase()}`);
        } else {
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

    handleSubmit = async (event) => {
        event.preventDefault();
        const { email, password, role } = this.state;

        this.setState({ loading: true, errorMessage: '' });

        try {
            if (!email || !password || !role) {
                throw new Error('Please fill in all fields');
            }

            // Call backend API
            const response = await fetch('http://localhost:4000/api/user/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password, role })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error);
            }

            // Store user data in localStorage
            localStorage.setItem('token', data.token);
            localStorage.setItem('role', data.role);
            localStorage.setItem('userAddress', data.walletAddress);
            localStorage.setItem('userName', data.name);
            localStorage.setItem('sessionExpiry', (new Date().getTime() + (24 * 60 * 60 * 1000)).toString());

            this.setState({ success: true });

            // Redirect based on role
            setTimeout(() => {
                if (role === 'technician') {
                    this.props.router.push('/recycler');
                } else {
                    this.props.router.push('/connect-wallet');
                }
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
                                        style={{fontSize: '0.8em', color: 'black'}}
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
                                                Manufacturer: manufacturer@regen.com / manufacturer123
                                            </Message.Item>
                                            <Message.Item>
                                                Technician: technician@regen.com / technician123
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
    return page;
};

export default withRouter(LoginPage);
