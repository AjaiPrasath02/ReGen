import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { Menu, Form, Button, Message, Grid, Dropdown } from 'semantic-ui-react';
import { useAuth } from '../context/AuthContext';

const roleOptions = [
    { key: 'm', text: 'Municipality', value: 'municipality' },
    { key: 'mf', text: 'Manufacturer', value: 'manufacturer' },
    { key: 't', text: 'Technician', value: 'technician' },
    { key: 'l', text: 'Lab Assistant', value: 'labassistant' }
];

const styles = {
    container: {
        padding: '20px 20px',
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        background: 'white',
        boxSizing: 'border-box',
        minHeight: '522px',
        width: '45%'
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

const LoginPage = () => {
    const router = useRouter();
    const { login } = useAuth();
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        role: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const { email, password, role } = formData;
            await login(email, password, role);
            setSuccess(true);

            // Redirect based on role
            setTimeout(() => {
                if (role === 'technician') {
                    router.push('/recycler');
                } else {
                    router.push('/connect-wallet');
                }
            }, 1500);
        } catch (err) {
            setError(err.message);
            setSuccess(false);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e, data) => {
        const { name, value } = data || e.target;
        setFormData({ ...formData, [name]: value });
    }

    const handleRoleChange = (e, { value }) => {
        setFormData({ ...formData, role: value });
    }

    return (
        <>
            <div className='ui container' style={styles.container}>
                <Grid textAlign='center' verticalAlign='middle' style={{ flex: 1 }}>
                    <Grid.Column style={styles.gridColumn}>
                        <h2 style={styles.header}>
                            Login to ReGen Platform
                        </h2>
                        <Form size='large' onSubmit={handleSubmit} error={!!error} success={success} style={styles.form}>
                            <Form.Input
                                fluid
                                icon='user'
                                iconPosition='left'
                                placeholder='E-mail address'
                                name='email'
                                value={formData.email}
                                onChange={handleChange}
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
                                value={formData.password}
                                onChange={handleChange}
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
                                    value={formData.role}
                                    onChange={handleRoleChange}
                                    style={{ fontSize: '0.8em', color: 'black' }}
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

                            {error && (
                                <Message
                                    error
                                    header='Error'
                                    content={error}
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
                                <Message warning style={styles.message}>
                                    Note: Please ensure you have MetaMask extension installed and enabled.
                                </Message>
                            </>
                        )}
                    </Grid.Column>
                </Grid>
            </div>
        </>
    );
}

export default LoginPage;
