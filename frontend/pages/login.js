import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { Menu, Form, Button, Message, Grid, Dropdown } from 'semantic-ui-react';
import { useAuth } from '../context/AuthContext';

const roleOptions = [
    { key: 'm', text: 'Municipality', value: 'municipality' },
    { key: 'mf', text: 'Manufacturer', value: 'manufacturer' },
    { key: 't', text: 'Technician', value: 'technician' },
    { key: 'l', text: 'Lab Assistant', value: 'labassistant' },
];

const LoginPage = () => {
    const router = useRouter();
    const { login } = useAuth();
    const [formData, setFormData] = useState({ email: '', password: '', role: '' });
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

            // Redirect based on role after a short delay
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

    const handleChange = (e, { name, value }) => {
        setFormData({ ...formData, [name]: value });
    };

    const handleRoleChange = (e, { value }) => {
        setFormData({ ...formData, role: value });
    };

    return (
        <div className="ui container" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100%', alignSelf: 'center' }}>
            <div className="login-container">
                <Grid textAlign="center" verticalAlign="middle" className="login-grid">
                    <Grid.Column className="login-grid-column">
                        <h2 className="login-header">Login to ReGen Platform</h2>
                        <Form
                            size="large"
                            onSubmit={handleSubmit}
                            error={!!error}
                            success={success}
                            className="login-form"
                        >
                            <Form.Input
                                fluid
                                icon="user"
                                iconPosition="left"
                                placeholder="E-mail address"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                required
                                className="login-input"
                            />
                            <Form.Input
                                fluid
                                icon="lock"
                                iconPosition="left"
                                placeholder="Password"
                                type="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                required
                                className="login-input"
                            />
                            <Form.Field required>
                                <Dropdown
                                    placeholder="Select Role"
                                    fluid
                                    selection
                                    options={roleOptions}
                                    name="role"
                                    value={formData.role}
                                    onChange={handleRoleChange}
                                    className="login-dropdown"
                                    required
                                />
                            </Form.Field>

                            <Button
                                color="green"
                                loading={loading}
                                disabled={loading}
                                className="login-button"
                            >
                                Log In
                            </Button>

                            {error && (
                                <Message
                                    error
                                    header="Error"
                                    content={error}
                                    className="login-message"
                                />
                            )}

                            {success && (
                                <Message
                                    success
                                    header="Success"
                                    content="Login successful! Redirecting..."
                                    className="login-message"
                                />
                            )}
                        </Form>

                        {!success && (
                            <Message
                                warning
                                className="login-message"
                                content="Note: Please ensure you have MetaMask extension installed and enabled."
                            />
                        )}
                    </Grid.Column>
                </Grid>
            </div>
        </div>
    );
};

export default LoginPage;