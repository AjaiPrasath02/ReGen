import React, { useState, useEffect } from 'react';
import { Menu, Form, Button, Input, Message, Container, Grid } from 'semantic-ui-react';
import { useRouter } from 'next/router';
import web3 from '../ethereum/web3';
import registerContract from '../ethereum/register';
import { useAuth } from '../context/AuthContext';

const RegistrationPage = () => {
    const router = useRouter();
    const { isAuthenticated, userRole, walletAddress } = useAuth();

    const [state, setState] = useState({
        // Manufacturer fields
        manufacturerName: '',
        manufacturerAddr: '',
        manufacturerLocation: '',
        manufacturerEmail: '',
        manufacturerPassword: '',

        // Technician fields
        technicianName: '',
        technicianAddr: '',
        technicianLocation: '',
        technicianEmail: '',
        technicianPassword: '',

        // Lab Assistant fields
        labAssistantName: '',
        labAssistantAddr: '',
        labAssistantLocation: '',
        labAssistantEmail: '',
        labAssistantPassword: '',
        labNumber: '',

        // UI state
        loading: false,
        selectManufacturer: true,
        selectTechnician: false,
        selectLabAssistant: false,

        // Error and success states
        errors: {
            manufacturer: '',
            technician: '',
            labAssistant: ''
        },
        success: {
            manufacturer: false,
            technician: false,
            labAssistant: false
        }
    });

    useEffect(() => {
        const checkAuth = async () => {
            try {
                const accounts = await web3.eth.getAccounts();

                if (!isAuthenticated || userRole !== 'municipality') {
                    router.push('/unauthorized');
                    return;
                }

                if (!accounts || !accounts[0]) {
                    router.push('/connect-wallet');
                    return;
                }

                if (accounts[0].toLowerCase() !== walletAddress?.toLowerCase()) {
                    router.push('/connect-wallet');
                    return;
                }
            } catch (error) {
                console.error('Error checking authentication:', error);
                router.push('/unauthorized');
            }
        };

        checkAuth();
    }, [isAuthenticated, userRole, walletAddress]);

    const onRegisterManu = async (event) => {
        event.preventDefault();
        setState(prev => ({ ...prev, loading: true }));

        try {
            const accounts = await web3.eth.getAccounts();
            if (!accounts[0]) {
                throw new Error('No wallet connected');
            }

            const response = await fetch('http://localhost:4000/api/user/signup', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    email: state.manufacturerEmail,
                    password: state.manufacturerPassword,
                    name: state.manufacturerName,
                    role: 'manufacturer',
                    walletAddress: state.manufacturerAddr,
                    location: state.manufacturerLocation
                })
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error);
            }

            await registerContract.methods
                .registerManufacturer(
                    state.manufacturerAddr,
                    state.manufacturerLocation,
                    state.manufacturerName
                )
                .send({ from: accounts[0] });

            setState(prev => ({
                ...prev,
                success: { ...prev.success, manufacturer: true },
                errors: { ...prev.errors, manufacturer: '' },
                manufacturerName: '',
                manufacturerAddr: '',
                manufacturerLocation: '',
                manufacturerEmail: '',
                manufacturerPassword: ''
            }));

        } catch (err) {
            setState(prev => ({
                ...prev,
                errors: { ...prev.errors, manufacturer: err.message || 'Registration failed' },
                success: { ...prev.success, manufacturer: false }
            }));
        } finally {
            setState(prev => ({ ...prev, loading: false }));
        }
    };

    const onRegisterTechnician = async (event) => {
        event.preventDefault();
        setState(prev => ({ ...prev, loading: true }));

        try {
            const accounts = await web3.eth.getAccounts();
            if (!accounts[0]) {
                throw new Error('No wallet connected');
            }

            const response = await fetch('http://localhost:4000/api/user/signup', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    email: state.technicianEmail,
                    password: state.technicianPassword,
                    name: state.technicianName,
                    role: 'technician',
                    walletAddress: state.technicianAddr,
                    location: state.technicianLocation
                })
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error);
            }

            await registerContract.methods
                .registerTechnician(
                    state.technicianAddr,
                    state.technicianLocation,
                    state.technicianName
                )
                .send({ from: accounts[0] });

            setState(prev => ({
                ...prev,
                success: { ...prev.success, technician: true },
                errors: { ...prev.errors, technician: '' },
                technicianName: '',
                technicianAddr: '',
                technicianLocation: '',
                technicianEmail: '',
                technicianPassword: ''
            }));

        } catch (err) {
            setState(prev => ({
                ...prev,
                errors: { ...prev.errors, technician: err.message || 'Registration failed' },
                success: { ...prev.success, technician: false }
            }));
        } finally {
            setState(prev => ({ ...prev, loading: false }));
        }
    };

    const onRegisterLabAssistant = async (event) => {
        event.preventDefault();
        setState(prev => ({ ...prev, loading: true }));

        try {
            const accounts = await web3.eth.getAccounts();
            if (!accounts[0]) {
                throw new Error('No wallet connected');
            }

            const response = await fetch('http://localhost:4000/api/user/signup', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    email: state.labAssistantEmail,
                    password: state.labAssistantPassword,
                    name: state.labAssistantName,
                    role: 'labassistant',
                    walletAddress: state.labAssistantAddr,
                    location: state.labAssistantLocation,
                    labNumber: state.labNumber
                })
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error);
            }

            await registerContract.methods
                .registerLabAssistant(
                    state.labAssistantAddr,
                    state.labAssistantLocation,
                    state.labAssistantName,
                    state.labNumber
                )
                .send({ from: accounts[0] });

            setState(prev => ({
                ...prev,
                success: { ...prev.success, labAssistant: true },
                errors: { ...prev.errors, labAssistant: '' },
                labAssistantName: '',
                labAssistantAddr: '',
                labAssistantLocation: '',
                labAssistantEmail: '',
                labAssistantPassword: '',
                labNumber: ''
            }));

        } catch (err) {
            setState(prev => ({
                ...prev,
                errors: { ...prev.errors, labAssistant: err.message || 'Registration failed' },
                success: { ...prev.success, labAssistant: false }
            }));
        } finally {
            setState(prev => ({ ...prev, loading: false }));
        }
    };

    const handleMenuClick = (type) => {
        setState(prev => ({
            ...prev,
            selectManufacturer: type === 'manufacturer',
            selectTechnician: type === 'technician',
            selectLabAssistant: type === 'labAssistant',
            // Reset errors and success when switching tabs
            errors: {
                manufacturer: '',
                technician: '',
                labAssistant: ''
            },
            success: {
                manufacturer: false,
                technician: false,
                labAssistant: false
            }
        }));
    };

    return (
        <div className="Registration" style={{ minHeight: '500px' }}>
            <h2>Select a stakeholder to register</h2>
            <Menu widths={3}>
                <Menu.Item
                    name='Manufacturer'
                    active={state.selectManufacturer}
                    onClick={() => handleMenuClick('manufacturer')}
                >
                    Manufacturer
                </Menu.Item>
                <Menu.Item
                    name='Technician'
                    active={state.selectTechnician}
                    onClick={() => handleMenuClick('technician')}
                >
                    Technician
                </Menu.Item>
                <Menu.Item
                    name='Lab Assistant'
                    active={state.selectLabAssistant}
                    onClick={() => handleMenuClick('labAssistant')}
                >
                    Lab Assistant
                </Menu.Item>
            </Menu>

            <Container>
                {/* Manufacturer Form */}
                {state.selectManufacturer && (
                    <Grid>
                        <Grid.Row centered>
                            <Grid.Column width={10} textAlign="center">
                                <Form onSubmit={onRegisterManu} error={!!state.errors.manufacturer} success={state.success.manufacturer}>
                                    <Form.Field required>
                                        <label className="left-aligned-label">Manufacturer Email</label>
                                        <Input
                                            value={state.manufacturerEmail}
                                            onChange={e => setState(prev => ({ ...prev, manufacturerEmail: e.target.value }))}
                                            type="email"
                                            placeholder="Enter email"
                                            required
                                        />
                                    </Form.Field>
                                    <Form.Field required>
                                        <label className="left-aligned-label">Password</label>
                                        <Input
                                            value={state.manufacturerPassword}
                                            onChange={e => setState(prev => ({ ...prev, manufacturerPassword: e.target.value }))}
                                            type="password"
                                            placeholder="Enter password"
                                            required
                                            minLength="6"
                                        />
                                    </Form.Field>
                                    <Form.Field required>
                                        <label className="left-aligned-label">Manufacturer Name</label>
                                        <Input
                                            value={state.manufacturerName}
                                            onChange={e => setState(prev => ({ ...prev, manufacturerName: e.target.value }))}
                                            placeholder="Enter name"
                                            required
                                        />
                                    </Form.Field>
                                    <Form.Field required>
                                        <label className="left-aligned-label">Wallet Address</label>
                                        <Input
                                            value={state.manufacturerAddr}
                                            onChange={e => setState(prev => ({ ...prev, manufacturerAddr: e.target.value }))}
                                            placeholder="Enter wallet address"
                                            required
                                        />
                                    </Form.Field>
                                    <Form.Field required>
                                        <label className="left-aligned-label">Location</label>
                                        <Input
                                            value={state.manufacturerLocation}
                                            onChange={e => setState(prev => ({ ...prev, manufacturerLocation: e.target.value }))}
                                            placeholder="Enter location"
                                            required
                                        />
                                    </Form.Field>
                                    <Message error content={state.errors.manufacturer} />
                                    <Message success content="Manufacturer registered successfully!" />
                                    <Button loading={state.loading} color={"green"} type="submit">
                                        Register Manufacturer
                                    </Button>
                                </Form>
                            </Grid.Column>
                        </Grid.Row>
                    </Grid>
                )}

                {/* Technician Form */}
                {state.selectTechnician && (
                    <Grid>
                        <Grid.Row centered>
                            <Grid.Column width={10} textAlign="center">
                                <Form onSubmit={onRegisterTechnician} error={!!state.errors.technician} success={state.success.technician}>
                                    <Form.Field required>
                                        <label className="left-aligned-label">Technician Email</label>
                                        <Input
                                            value={state.technicianEmail}
                                            onChange={e => setState(prev => ({ ...prev, technicianEmail: e.target.value }))}
                                            type="email"
                                            placeholder="Enter email"
                                            required
                                        />
                                    </Form.Field>
                                    <Form.Field required>
                                        <label className="left-aligned-label">Password</label>
                                        <Input
                                            value={state.technicianPassword}
                                            onChange={e => setState(prev => ({ ...prev, technicianPassword: e.target.value }))}
                                            type="password"
                                            placeholder="Enter password"
                                            required
                                            minLength="6"
                                        />
                                    </Form.Field>
                                    <Form.Field required>
                                        <label className="left-aligned-label">Technician Name</label>
                                        <Input
                                            value={state.technicianName}
                                            onChange={e => setState(prev => ({ ...prev, technicianName: e.target.value }))}
                                            placeholder="Enter name"
                                            required
                                        />
                                    </Form.Field>
                                    <Form.Field required>
                                        <label className="left-aligned-label">Wallet Address</label>
                                        <Input
                                            value={state.technicianAddr}
                                            onChange={e => setState(prev => ({ ...prev, technicianAddr: e.target.value }))}
                                            placeholder="Enter wallet address"
                                            required
                                        />
                                    </Form.Field>
                                    <Form.Field required>
                                        <label className="left-aligned-label">Location</label>
                                        <Input
                                            value={state.technicianLocation}
                                            onChange={e => setState(prev => ({ ...prev, technicianLocation: e.target.value }))}
                                            placeholder="Enter location"
                                            required
                                        />
                                    </Form.Field>
                                    <Message error content={state.errors.technician} />
                                    <Message success content="Technician registered successfully!" />
                                    <Button loading={state.loading} color={"green"} type="submit">
                                        Register Technician
                                    </Button>
                                </Form>
                            </Grid.Column>
                        </Grid.Row>
                    </Grid>
                )}

                {/* Lab Assistant Form */}
                {state.selectLabAssistant && (
                    <Grid>
                        <Grid.Row centered>
                            <Grid.Column width={10} textAlign="center">
                                <Form onSubmit={onRegisterLabAssistant} error={!!state.errors.labAssistant} success={state.success.labAssistant}>
                                    <Form.Field required>
                                        <label className="left-aligned-label">Lab Assistant Email</label>
                                        <Input
                                            value={state.labAssistantEmail}
                                            onChange={e => setState(prev => ({ ...prev, labAssistantEmail: e.target.value }))}
                                            type="email"
                                            placeholder="Enter email"
                                            required
                                        />
                                    </Form.Field>
                                    <Form.Field required>
                                        <label className="left-aligned-label">Password</label>
                                        <Input
                                            value={state.labAssistantPassword}
                                            onChange={e => setState(prev => ({ ...prev, labAssistantPassword: e.target.value }))}
                                            type="password"
                                            placeholder="Enter password"
                                            required
                                            minLength="6"
                                        />
                                    </Form.Field>
                                    <Form.Field required>
                                        <label className="left-aligned-label">Lab Assistant Name</label>
                                        <Input
                                            value={state.labAssistantName}
                                            onChange={e => setState(prev => ({ ...prev, labAssistantName: e.target.value }))}
                                            placeholder="Enter name"
                                            required
                                        />
                                    </Form.Field>
                                    <Form.Field required>
                                        <label className="left-aligned-label">Wallet Address</label>
                                        <Input
                                            value={state.labAssistantAddr}
                                            onChange={e => setState(prev => ({ ...prev, labAssistantAddr: e.target.value }))}
                                            placeholder="Enter wallet address"
                                            required
                                        />
                                    </Form.Field>
                                    <Form.Field required>
                                        <label className="left-aligned-label">Location</label>
                                        <Input
                                            value={state.labAssistantLocation}
                                            onChange={e => setState(prev => ({ ...prev, labAssistantLocation: e.target.value }))}
                                            placeholder="Enter location"
                                            required
                                        />
                                    </Form.Field>
                                    <Form.Field required>
                                        <label className="left-aligned-label">Lab Number</label>
                                        <Input
                                            value={state.labNumber}
                                            onChange={e => setState(prev => ({ ...prev, labNumber: e.target.value }))}
                                            placeholder="Enter lab number"
                                            required
                                        />
                                    </Form.Field>
                                    <Message error content={state.errors.labAssistant} />
                                    <Message success content="Lab Assistant registered successfully!" />
                                    <Button loading={state.loading} color={"green"} type="submit">
                                        Register Lab Assistant
                                    </Button>
                                </Form>
                            </Grid.Column>
                        </Grid.Row>
                    </Grid>
                )}
            </Container>
        </div>
    );
};

export default RegistrationPage;