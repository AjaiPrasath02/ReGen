import React, { useState } from 'react';
import { Form, Button, Input, Message, Grid } from 'semantic-ui-react';
import web3 from '../../ethereum/web3';

// Reusable form component for registering stakeholders
const StakeholderForm = ({ roleName, fields, registrationFunction, role, argOrder }) => {
    // Initialize form state based on provided fields
    const initialState = fields.reduce((acc, field) => {
        acc[field.name] = '';
        return acc;
    }, {});
    const [formData, setFormData] = useState(initialState);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const handleChange = (e, { name, value }) => {
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    // Handle form submission
    const handleSubmit = async (event) => {
        event.preventDefault();
        setLoading(true);
        setError('');
        setSuccess(false);

        try {
            const accounts = await web3.eth.getAccounts();
            if (!accounts[0]) {
                throw new Error('No wallet connected');
            }

            // Use the registrationFunction prop directly
            await registrationFunction(
                formData.walletAddress,
                formData.location,
                formData.name,
                ...(role.toLowerCase() === 'labassistant' ? [formData.labNumber] : [])
            ).send({ from: accounts[0] });

            // Make API call to signup endpoint
            const response = await fetch('http://localhost:4000/api/user/signup', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ...formData,
                    role: role.toLowerCase(),
                    walletAddress: formData.walletAddress
                }),
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error);
            }

            // On success, show success message and reset form
            setSuccess(true);
            setFormData(initialState);
        } catch (err) {
            setError(err.message || 'Registration failed');
            setSuccess(false);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Grid>
            <Grid.Row centered>
                <Grid.Column width={10} textAlign="center">
                    <Form onSubmit={handleSubmit} error={!!error} success={success}>
                        {fields.map((field, index) => (
                            <Form.Field key={index} required>
                                <label className="left-aligned-label">{field.label}</label>
                                <Input
                                    name={field.name}
                                    type={field.type}
                                    value={formData[field.name] || ''}
                                    onChange={handleChange}
                                    placeholder={`Enter ${field.label.toLowerCase()}`}
                                    required
                                />
                            </Form.Field>
                        ))}
                        <Message error content={error} />
                        <Message success content={`${roleName} registered successfully!`} />
                        <Button loading={loading} color="green" type="submit">
                            Register {roleName}
                        </Button>
                    </Form>
                </Grid.Column>
            </Grid.Row>
        </Grid>
    );
};

export default StakeholderForm;