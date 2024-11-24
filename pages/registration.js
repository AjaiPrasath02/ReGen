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
            selectSortingFacility: false,
            selectBuyer: false,
            manufacturerName: '',
            manufacturerAddr: '',
            manufacturerLocation: '',
            buyerName: '',
            buyerAddr: '',
            buyerLocation: '',
            buyerBusiness: '',
            sellerName: '',
            sellerAddr: '',
            sellerLocation: '',
            sortingMachines: [],
            inputSize: 0,
            errorMessage: '',
            hasNoError: false,
            errorMessage1: '',
            hasNoError1: false,
            errorMessage2: '',
            hasNoError2: false,
            loading: false,
            visible: '',
            // Add authentication check
            isAuthenticated: false,
            userRole: null,
            userAddress: '',
            // Consolidate error messages
            errors: {
                manufacturer: '',
                buyer: '',
                sortingFacility: ''
            },
            // Consolidate success states
            success: {
                manufacturer: false,
                buyer: false,
                sortingFacility: false
            },
        };
    }

    renderInputs(value) {
        const inputs = [];
        if (value > 0) {
            inputs.push(<label key="label">Sorting Machine Addresses</label>);
        }

        for (let i = 0; i < value; i++) {
            inputs.push(
                <div key={i}>
                    <Input
                        value={this.state.sortingMachines[i] || ''}
                        onChange={(event) => {
                            const newSortingMachines = [...this.state.sortingMachines];
                            newSortingMachines[i] = event.target.value;
                            this.setState({ sortingMachines: newSortingMachines });
                        }}
                        icon="ethereum"
                    />
                </div>
            );
        }
        return inputs;
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

            // Add input validation
            if (!this.state.manufacturerName || !this.state.manufacturerAddr || !this.state.manufacturerLocation) {
                throw new Error('Please fill in all manufacturer details');
            }

            await registerContract.methods
                .registerManufacturer(
                    this.state.manufacturerAddr,
                    this.state.manufacturerLocation,
                    this.state.manufacturerName
                )
                .send({ from: accounts[0] });

            this.setState({
                success: { ...this.state.success, manufacturer: true },
                errors: { ...this.state.errors, manufacturer: '' }
            });

            // Reset form after successful registration
            this.setState({
                manufacturerName: '',
                manufacturerAddr: '',
                manufacturerLocation: ''
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


    //Register a buyer & interact with the register SC
    onRegisterBuyer = async (event) => {

        event.preventDefault();

        const accounts = await web3.eth.getAccounts();

        this.setState({ loading: true, errorMessage1: '' });

        try {
            web3.eth.handleRevert = true;
            //registerContract.handleRevert = true; 
            await registerContract.methods
                .registerBuyer(this.state.buyerAddr, this.state.buyerName, this.state.buyerLocation, this.state.buyerBusiness)
                .send({ from: accounts[0] });
        } catch (err) {
            console.log(err);
            this.setState({ errorMessage1: err });
            this.setState({ hasError1: false });
        }

        // if errorMsg is empty, registration is successful
        if (!this.state.errorMessage1)
            this.setState({ hasNoError1: true });

        this.setState({ loading: false });
    };

    //Register a sorting facility & interact with the register SC
    onRegisterSeller = async (event) => {

        event.preventDefault();

        const accounts = await web3.eth.getAccounts();

        this.setState({ loading: true, errorMessage2: '' });

        try {

            await registerContract.methods
                .registerSeller(this.state.sellerAddr, this.state.sellerLocation, this.state.sellerName, this.state.sortingMachines)
                .send({ from: accounts[0] });
        } catch (err) {
            this.setState({ errorMessage2: err });
            this.setState({ hasError2: false });
        }

        // if errorMsg is empty, registration is successful
        if (!this.state.errorMessage2)
            this.setState({ hasNoError2: true });

        this.setState({ loading: false });
    };



    render() {

        console.log(this.state.inputSize);

        const {
            selectManufacturer,
            selectSortingFacility,
            selectBuyer,
            manufacturerName,
            manufacturerAddr,
            manufacturerLocation,
            buyerName,
            buyerAddr,
            buyerLocation,
            buyerBusiness,
            sellerName,
            sellerAddr,
            sellerLocation,
            sortingMachines } = this.state

        return (
            <div className="Registration " style={{ minHeight: '500px' }}>
                <link rel="stylesheet"
                    href="//cdn.jsdelivr.net/npm/semantic-ui@2.4.1/dist/semantic.min.css"
                />
                <h2>Select a stakeholder to register</h2>
                <Menu widths={3}>
                    <Menu.Item name='Manufacturer' onClick={() => this.setState({ selectManufacturer: true, selectSortingFacility: false, selectBuyer: false })} > Manufacturer</Menu.Item>
                    <Menu.Item name='SortingFacility' onClick={() => this.setState({ selectSortingFacility: true, selectManufacturer: false, selectBuyer: false })} > Sorting Facility</Menu.Item>
                    <Menu.Item name='Buyer' onClick={() => this.setState({ selectBuyer: true, selectSortingFacility: false, selectManufacturer: false })} > Buyer </Menu.Item>
                </Menu>
                <br />
                <br />

                {selectManufacturer && (

                    <div className='Manufacturer' >
                        <Container>
                            <Grid>
                                <Grid.Row centered>
                                    <Grid.Column width={10} textAlign="center">
                                        <Form onSubmit={this.onRegisterManu} error={!!this.state.errorMessage} success={this.state.hasNoError}>
                                            <Form.Field>
                                                <label className="left-aligned-label">Manufacturer Name</label>
                                                <Input value={this.state.manufacturerName}
                                                    onChange={event => this.setState({ manufacturerName: event.target.value })} />
                                            </Form.Field>
                                            <Form.Field>
                                                <label className="left-aligned-label">Manufacturer Ethereum Address</label>
                                                <Input value={this.state.manufacturerAddr}
                                                    icon="ethereum"
                                                    onChange={event => this.setState({ manufacturerAddr: event.target.value })} />
                                            </Form.Field>
                                            <Form.Field>
                                                <label className="left-aligned-label">Manufacturer Location</label>
                                                <Input value={this.state.manufacturerLocation}
                                                    onChange={event => this.setState({ manufacturerLocation: event.target.value })} />
                                            </Form.Field>

                                            <Message error header="Error!"
                                                onDismiss={this.handleDismiss}
                                                content={this.state.errorMessage} />


                                            <Message success header="Success!"
                                                onDismiss={this.handleDismiss}
                                                content="Manufacturer registered successfully!" />


                                            <Button color='green' loading={this.state.loading} type='submit'>Register</Button>
                                        </Form>
                                    </Grid.Column>
                                </Grid.Row>
                            </Grid>
                        </Container>
                    </div>

                )}

                {selectBuyer && (
                    <div>
                        <Container>
                            <Grid>
                                <Grid.Row centered>
                                    <Grid.Column width={10} textAlign="center">
                                        <Form onSubmit={this.onRegisterBuyer} error={!!this.state.errorMessage1} success={this.state.hasNoError1} >
                                            <Form.Field>
                                                <label className="left-aligned-label">Buyer Name</label>
                                                <Input value={this.state.buyerName}
                                                    onChange={event => this.setState({ buyerName: event.target.value })} />
                                            </Form.Field>
                                            <Form.Field>
                                                <label className="left-aligned-label">Buyer Ethereum Address</label>
                                                <Input value={this.state.buyerAddr}
                                                    icon="ethereum"
                                                    onChange={event => this.setState({ buyerAddr: event.target.value })} />
                                            </Form.Field>
                                            <Form.Field >
                                                <label className="left-aligned-label">Buyer Business Type</label>
                                                <Input value={this.state.BuyerBusiness}
                                                    onChange={event => this.setState({ buyerBusiness: event.target.value })} />
                                            </Form.Field>
                                            <Form.Field >
                                                <label className="left-aligned-label">Buyer Location</label>
                                                <Input value={this.state.buyerLocation}
                                                    onChange={event => this.setState({ buyerLocation: event.target.value })} />
                                            </Form.Field>

                                            <Message error header="Error!" content={this.state.errorMessage1} />

                                            <Message success header="Success!" content="Buyer registered successfully!" />

                                            <Button color='green' loading={this.state.loading} type='submit'>Register</Button>
                                        </Form>

                                    </Grid.Column>
                                </Grid.Row>
                            </Grid>
                        </Container>
                    </div>

                )}

                {selectSortingFacility && (
                    <div>
                        <Container>
                            <Grid>
                                <Grid.Row centered>
                                    <Grid.Column width={10} textAlign="center">
                                        <Form onSubmit={this.onRegisterSeller} error={!!this.state.errorMessage2} success={this.state.hasNoError2}>
                                            <Form.Field >
                                                <label className="left-aligned-label">Sorting Facility Name</label>
                                                <Input value={this.state.sellerName}
                                                    onChange={event => this.setState({ sellerName: event.target.value })} />
                                            </Form.Field>
                                            <Form.Field>
                                                <label className="left-aligned-label">Sorting Facility Ethereum Address</label>
                                                <Input value={this.state.sellerAddr}
                                                    icon="ethereum"
                                                    onChange={event => this.setState({ sellerAddr: event.target.value })} />
                                            </Form.Field>
                                            <Form.Field>
                                                <label className="left-aligned-label">Sorting Facility Location</label>
                                                <Input value={this.state.sellerLocation}
                                                    onChange={event => this.setState({ sellerLocation: event.target.value })} />
                                            </Form.Field>

                                            <Form.Field >
                                                <label className="left-aligned-label">Number of Sorting Machines</label>
                                                <input type="number" name="quantity" min="1" max="7" placeholder="Enter a number from 1 to 7" onChange={(value) => this.handleOnChange(value)} />
                                                <div>
                                                    {this.renderInputs(this.state.inputSize)}
                                                </div>
                                            </Form.Field>

                                            <Message error header="Error!" content={this.state.errorMessage2} />

                                            <Message success header="Success!" content="Seller registered successfully!" />

                                            <Button color='green' loading={this.state.loading} type='submit'>Register</Button>
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