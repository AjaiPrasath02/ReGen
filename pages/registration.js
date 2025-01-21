/*
This is the registration page where the goverment entity registers stakeholders 
Contact used here: an instance of register.sol 
To run the app, use the command npm run dev
*/

import React, { Component } from 'react';
import { Menu, Form, Button, Input, Message, Container, Grid } from 'semantic-ui-react';
import web3 from '../ethereum/web3';
import registerContract from '../ethereum/register'; // import SC instance
import { withRouter } from 'next/router';


class RegistrationPage extends Component {

    constructor(props) {
        super(props);
        this.state = {
            selectManufacturer: true,
            selectTechnician: false,
            selectLabAssistant: false,
            manufacturerName: '',
            manufacturerAddr: '',
            manufacturerLocation: '',
            manufacturerEmail: '',
            manufacturerPassword: '',
            technicianName: '',
            technicianAddr: '',
            technicianLocation: '',
            technicianEmail: '',
            technicianPassword: '',
            errorMessage: '',
            loading: false,
            // Add authentication check
            isAuthenticated: false,
            userRole: null,
            userAddress: '',
            // Consolidate error messages
            errors: {
                manufacturer: '',
                technician: '',
                labAssistant: ''
            },
            // Consolidate success states
            success: {
                manufacturer: false,
                technician: false,
                labAssistant: false
            },
            labAssistantName: '',
            labAssistantAddr: '',
            labAssistantLocation: '',
            labAssistantEmail: '',
            labAssistantPassword: '',
        };
    }

    componentDidMount = async () => {
        try {
            const token = localStorage.getItem('token');
            const role = localStorage.getItem('role');
            const userAddress = localStorage.getItem('userAddress');
            const accounts = await web3.eth.getAccounts();

            console.log('=== Debug Information ===');
            console.log('Token:', token);
            console.log('Role:', role);
            console.log('User Address:', userAddress);
            console.log('Connected Account:', accounts[0]);
            console.log('All Accounts:', accounts);
            console.log('=====================');

            // First check basic auth
            if (!token || !role || !userAddress) {
                console.log('Missing authentication data');
                this.props.router.push('/login');
                return;
            }

            // Then check role
            if (role !== 'municipality') {
                console.log('User is not a municipality');
                this.props.router.push('/unauthorized');
                return;
            }

            // Then check if wallet is connected
            if (!accounts || !accounts[0]) {
                console.log('No wallet connected');
                this.props.router.push('/connect-wallet');
                return;
            }

            // Finally check if connected wallet matches userAddress
            if (accounts[0].toLowerCase() !== userAddress.toLowerCase()) {
                console.log('Connected wallet does not match registered municipality address');
                this.props.router.push('/connect-wallet');
                return;
            }

            // Set authenticated state
            this.setState({
                isAuthenticated: true,
                userRole: role,
                userAddress: userAddress
            });

        } catch (error) {
            console.error('Error in componentDidMount:', error);
            this.props.router.push('/unauthorized');
            return;
        }
    };

    // Modified registration functions for municipality approval
    onApproveManufacturer = async (event) => {
        event.preventDefault();
        const accounts = await web3.eth.getAccounts();
        this.setState({ loading: true, errorMessage: '' });

        try {
            await registerContract.methods
                .approveManufacturer(
                    this.state.manufacturerAddr,
                    this.state.manufacturerLocation,
                    this.state.manufacturerName
                )
                .send({ from: accounts[0] });
            this.setState({ hasNoError: true });
        } catch (err) {
            this.setState({
                errorMessage: err.message,
                hasNoError: false
            });
        }

        this.setState({ loading: false });
    };

    // Dynamic fields appear based on number of sorting machines 
    handleOnChange(value) { this.setState({ inputSize: value.target.value }); }
    handleDismiss = () => { this.setState({ visible: false }) }

    //Register a Manufacturer & interact with the register SC
    onRegisterManu = async (event) => {
        event.preventDefault();
        this.setState({ loading: true });

        try {
            const accounts = await web3.eth.getAccounts();
            if (!accounts[0]) {
                throw new Error('No wallet connected');
            }

            // First register on blockchain
            await registerContract.methods
                .registerManufacturer(
                    this.state.manufacturerAddr,
                    this.state.manufacturerLocation,
                    this.state.manufacturerName
                )
                .send({ from: accounts[0] });

            // Then register in MongoDB
            const response = await fetch('http://localhost:4000/api/user/signup', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    email: this.state.manufacturerEmail,
                    password: this.state.manufacturerPassword,
                    name: this.state.manufacturerName,
                    role: 'manufacturer',
                    walletAddress: this.state.manufacturerAddr,
                    location: this.state.manufacturerLocation
                })
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error);
            }


            this.setState({
                success: { ...this.state.success, manufacturer: true },
                errors: { ...this.state.errors, manufacturer: '' }
            });

            // Reset form
            this.setState({
                manufacturerName: '',
                manufacturerAddr: '',
                manufacturerLocation: '',
                manufacturerEmail: '',
                manufacturerPassword: ''
            });

        } catch (err) {
            this.setState({
                errors: {
                    ...this.state.errors,
                    manufacturer: err.message || 'Registration failed'
                },
                success: { ...this.state.success, manufacturer: false }
            });
        } finally {
            this.setState({ loading: false });
        }
    };

    // Add form validation
    validateForm = (type) => {
        switch (type) {
            case 'manufacturer':
                return !!(this.state.manufacturerName &&
                    this.state.manufacturerAddr &&
                    this.state.manufacturerLocation);
            case 'buyer':
                return !!(this.state.buyerName &&
                    this.state.buyerAddr &&
                    this.state.buyerLocation &&
                    this.state.buyerBusiness);
            case 'sortingFacility':
                return !!(this.state.sellerName &&
                    this.state.sellerAddr &&
                    this.state.sellerLocation);
            default:
                return false;
        }
    };

    //Register a technician & interact with the register SC
    onRegisterTechnician = async (event) => {
        event.preventDefault();
        this.setState({ loading: true });

        try {
            const accounts = await web3.eth.getAccounts();
            if (!accounts[0]) {
                throw new Error('No wallet connected');
            }

            // First register on blockchain
            await registerContract.methods
                .registerTechnician(
                    this.state.technicianAddr,
                    this.state.technicianLocation,
                    this.state.technicianName
                )
                .send({ from: accounts[0] });

            // Then register in MongoDB
            const response = await fetch('http://localhost:4000/api/user/signup', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    email: this.state.technicianEmail,
                    password: this.state.technicianPassword,
                    name: this.state.technicianName,
                    role: 'technician',
                    walletAddress: this.state.technicianAddr,
                    location: this.state.technicianLocation
                })
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error);
            }


            this.setState({
                success: { ...this.state.success, technician: true },
                errors: { ...this.state.errors, technician: '' }
            });

            // Reset form
            this.setState({
                technicianName: '',
                technicianAddr: '',
                technicianLocation: '',
                technicianEmail: '',
                technicianPassword: ''
            });

        } catch (err) {
            this.setState({
                errors: {
                    ...this.state.errors,
                    technician: err.message || 'Registration failed'
                },
                success: { ...this.state.success, technician: false }
            });
        } finally {
            this.setState({ loading: false });
        }
    };

    // Add new registration function
    onRegisterLabAssistant = async (event) => {
        event.preventDefault();
        this.setState({ loading: true });

        try {
            // Skip blockchain registration and only register in MongoDB
            const response = await fetch('http://localhost:4000/api/user/signup', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    email: this.state.labAssistantEmail,
                    password: this.state.labAssistantPassword,
                    name: this.state.labAssistantName,
                    role: 'labassistant',
                    walletAddress: this.state.labAssistantAddr,
                    location: this.state.labAssistantLocation
                })
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error);
            }

            this.setState({
                success: { ...this.state.success, labAssistant: true },
                errors: { ...this.state.errors, labAssistant: '' }
            });

            // Reset form
            this.setState({
                labAssistantName: '',
                labAssistantAddr: '',
                labAssistantLocation: '',
                labAssistantEmail: '',
                labAssistantPassword: ''
            });

        } catch (err) {
            this.setState({
                errors: {
                    ...this.state.errors,
                    labAssistant: err.message || 'Registration failed'
                },
                success: { ...this.state.success, labAssistant: false }
            });
        } finally {
            this.setState({ loading: false });
        }
    };

    render() {
        const {
            selectManufacturer,
            selectTechnician,
            selectLabAssistant,
            manufacturerName,
            manufacturerAddr,
            manufacturerLocation,
            manufacturerEmail,
            manufacturerPassword,
            technicianName,
            technicianAddr,
            technicianLocation,
            technicianEmail,
            technicianPassword,
            labAssistantName,
            labAssistantAddr,
            labAssistantLocation,
            labAssistantEmail,
            labAssistantPassword
        } = this.state;

        return (
            <div className="Registration" style={{ minHeight: '500px' }}>
                <link rel="stylesheet"
                    href="//cdn.jsdelivr.net/npm/semantic-ui@2.4.1/dist/semantic.min.css"
                />
                <h2>Select a stakeholder to register</h2>
                <Menu widths={3}>
                    <Menu.Item
                        name='Manufacturer'
                        active={selectManufacturer}
                        onClick={() => this.setState({
                            selectManufacturer: true,
                            selectTechnician: false,
                            selectLabAssistant: false
                        })}
                    >
                        Manufacturer
                    </Menu.Item>
                    <Menu.Item
                        name='Technician'
                        active={selectTechnician}
                        onClick={() => this.setState({
                            selectTechnician: true,
                            selectManufacturer: false,
                            selectLabAssistant: false
                        })}
                    >
                        Technician
                    </Menu.Item>
                    <Menu.Item
                        name='Lab Assistant'
                        active={selectLabAssistant}
                        onClick={() => this.setState({
                            selectLabAssistant: true,
                            selectManufacturer: false,
                            selectTechnician: false
                        })}
                    >
                        Lab Assistant
                    </Menu.Item>
                </Menu>
                <br />
                <br />

                {selectManufacturer && (
                    <div className='Manufacturer'>
                        <Container>
                            <Grid>
                                <Grid.Row centered>
                                    <Grid.Column width={10} textAlign="center">
                                        <Form onSubmit={this.onRegisterManu} error={!!this.state.errors.manufacturer} success={this.state.success.manufacturer}>
                                            <Form.Field>
                                                <label className="left-aligned-label">Manufacturer Email</label>
                                                <Input
                                                    value={manufacturerEmail}
                                                    type="email"
                                                    icon="mail"
                                                    onChange={event => this.setState({ manufacturerEmail: event.target.value })}
                                                />
                                            </Form.Field>
                                            <Form.Field>
                                                <label className="left-aligned-label">Password</label>
                                                <Input
                                                    value={manufacturerPassword}
                                                    type="password"
                                                    icon="lock"
                                                    onChange={event => this.setState({ manufacturerPassword: event.target.value })}
                                                />
                                            </Form.Field>
                                            <Form.Field>
                                                <label className="left-aligned-label">Manufacturer Name</label>
                                                <Input
                                                    value={manufacturerName}
                                                    onChange={event => this.setState({ manufacturerName: event.target.value })}
                                                />
                                            </Form.Field>
                                            <Form.Field>
                                                <label className="left-aligned-label">Manufacturer Ethereum Address</label>
                                                <Input
                                                    value={manufacturerAddr}
                                                    icon="ethereum"
                                                    onChange={event => this.setState({ manufacturerAddr: event.target.value })}
                                                />
                                            </Form.Field>
                                            <Form.Field>
                                                <label className="left-aligned-label">Manufacturer Location</label>
                                                <Input
                                                    value={manufacturerLocation}
                                                    onChange={event => this.setState({ manufacturerLocation: event.target.value })}
                                                />
                                            </Form.Field>

                                            <Message
                                                error
                                                header="Error!"
                                                content={this.state.errors.manufacturer}
                                            />

                                            <Message
                                                success
                                                header="Success!"
                                                content="Manufacturer registered successfully!"
                                            />

                                            <Button
                                                color='green'
                                                loading={this.state.loading}
                                                type='submit'
                                            >
                                                Register
                                            </Button>
                                        </Form>
                                    </Grid.Column>
                                </Grid.Row>
                            </Grid>
                        </Container>
                    </div>
                )}

                {selectTechnician && (
                    <div className='Technician'>
                        <Container>
                            <Grid>
                                <Grid.Row centered>
                                    <Grid.Column width={10} textAlign="center">
                                        <Form onSubmit={this.onRegisterTechnician} error={!!this.state.errors.technician} success={this.state.success.technician}>
                                            <Form.Field>
                                                <label className="left-aligned-label">Technician Email</label>
                                                <Input
                                                    value={technicianEmail}
                                                    type="email"
                                                    icon="mail"
                                                    onChange={event => this.setState({ technicianEmail: event.target.value })}
                                                />
                                            </Form.Field>
                                            <Form.Field>
                                                <label className="left-aligned-label">Password</label>
                                                <Input
                                                    value={technicianPassword}
                                                    type="password"
                                                    icon="lock"
                                                    onChange={event => this.setState({ technicianPassword: event.target.value })}
                                                />
                                            </Form.Field>
                                            <Form.Field>
                                                <label className="left-aligned-label">Technician Name</label>
                                                <Input
                                                    value={technicianName}
                                                    onChange={event => this.setState({ technicianName: event.target.value })}
                                                />
                                            </Form.Field>
                                            <Form.Field>
                                                <label className="left-aligned-label">Technician Ethereum Address</label>
                                                <Input
                                                    value={technicianAddr}
                                                    icon="ethereum"
                                                    onChange={event => this.setState({ technicianAddr: event.target.value })}
                                                />
                                            </Form.Field>
                                            <Form.Field>
                                                <label className="left-aligned-label">Technician Location</label>
                                                <Input
                                                    value={technicianLocation}
                                                    onChange={event => this.setState({ technicianLocation: event.target.value })}
                                                />
                                            </Form.Field>

                                            <Message
                                                error
                                                header="Error!"
                                                content={this.state.errors.technician}
                                            />

                                            <Message
                                                success
                                                header="Success!"
                                                content="Technician registered successfully!"
                                            />

                                            <Button
                                                color='green'
                                                loading={this.state.loading}
                                                type='submit'
                                            >
                                                Register
                                            </Button>
                                        </Form>
                                    </Grid.Column>
                                </Grid.Row>
                            </Grid>
                        </Container>
                    </div>
                )}

                {selectLabAssistant && (
                    <div className='LabAssistant'>
                        <Container>
                            <Grid>
                                <Grid.Row centered>
                                    <Grid.Column width={10} textAlign="center">
                                        <Form onSubmit={this.onRegisterLabAssistant} error={!!this.state.errors.labAssistant} success={this.state.success.labAssistant}>
                                            <Form.Field>
                                                <label className="left-aligned-label">Lab Assistant Email</label>
                                                <Input
                                                    value={labAssistantEmail}
                                                    type="email"
                                                    icon="mail"
                                                    onChange={event => this.setState({ labAssistantEmail: event.target.value })}
                                                />
                                            </Form.Field>
                                            <Form.Field>
                                                <label className="left-aligned-label">Password</label>
                                                <Input
                                                    value={labAssistantPassword}
                                                    type="password"
                                                    icon="lock"
                                                    onChange={event => this.setState({ labAssistantPassword: event.target.value })}
                                                />
                                            </Form.Field>
                                            <Form.Field>
                                                <label className="left-aligned-label">Lab Assistant Name</label>
                                                <Input
                                                    value={labAssistantName}
                                                    onChange={event => this.setState({ labAssistantName: event.target.value })}
                                                />
                                            </Form.Field>
                                            <Form.Field>
                                                <label className="left-aligned-label">Lab Assistant Ethereum Address</label>
                                                <Input
                                                    value={labAssistantAddr}
                                                    icon="ethereum"
                                                    onChange={event => this.setState({ labAssistantAddr: event.target.value })}
                                                />
                                            </Form.Field>
                                            <Form.Field>
                                                <label className="left-aligned-label">Lab Assistant Location</label>
                                                <Input
                                                    value={labAssistantLocation}
                                                    onChange={event => this.setState({ labAssistantLocation: event.target.value })}
                                                />
                                            </Form.Field>

                                            <Message
                                                error
                                                header="Error!"
                                                content={this.state.errors.labAssistant}
                                            />

                                            <Message
                                                success
                                                header="Success!"
                                                content="Lab Assistant registered successfully!"
                                            />

                                            <Button
                                                color='green'
                                                loading={this.state.loading}
                                                type='submit'
                                            >
                                                Register
                                            </Button>
                                        </Form>
                                    </Grid.Column>
                                </Grid.Row>
                            </Grid>
                        </Container>
                    </div>
                )}
            </div>
        );
    }

}

//At the end of each page, a component is expected to be returned 
// If not, Next.js throws an error 
export default withRouter(RegistrationPage);