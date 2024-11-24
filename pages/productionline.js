import React, { Component } from 'react';
import { Button, Message, Input, Form, Dropdown, Container, Grid } from 'semantic-ui-react';
import web3 from '../ethereum/web3';
import cpuContract from '../ethereum/bottleProduction';
import dynamic from 'next/dynamic';
const QrCode = dynamic(() => import('react.qrcode.generator'), { ssr: false });
import { withRouter } from 'next/router';

//Dropdownmenu selections
const cpuModelOptions = [
    { key: 1, text: 'Intel Core i3', value: 0 },
    { key: 2, text: 'Intel Core i5', value: 1 },
    { key: 3, text: 'Intel Core i7', value: 2 },
    { key: 4, text: 'AMD Ryzen 3', value: 3 },
    { key: 5, text: 'AMD Ryzen 5', value: 4 },
];

const cpuFrequencyOptions = [
    { key: 1, text: '2.5 GHz', value: 0 },
    { key: 2, text: '3.0 GHz', value: 1 },
    { key: 3, text: '3.5 GHz', value: 2 },
    { key: 4, text: '4.0 GHz', value: 3 },
];

const ramSizeOptions = [
    { key: 1, text: '4 GB', value: 0 },
    { key: 2, text: '8 GB', value: 1 },
    { key: 3, text: '16 GB', value: 2 },
    { key: 4, text: '32 GB', value: 3 },
];

const storageSizeOptions = [
    { key: 1, text: '256 GB', value: 0 },
    { key: 2, text: '500 GB', value: 1 },
    { key: 3, text: '1 TB', value: 2 },
    { key: 4, text: '2 TB', value: 3 },
];

class ManufacturingMachinePage extends Component {
    state = {
        registerSCAddress: '0x8a8C4a9E8D9E8252B7f3Ac8ffF87E7dC84CD05cB',
        cpuModel: '',
        cpuFrequency: '',
        ramSize: '',
        storageSize: '',
        modelName: '',
        serialNumber: '',
        cpuQR: '',
        errorMessage: '',
        hasNoError: false,
        loading: false,
        pageLoading: true,
        QRcodePic: false,
        isAuthenticated: false,
        userRole: null,
        stats: {
            totalProduced: 0,
            recycledCPUs: 0,
            pendingCPUs: 0
        },
        productionHistory: [],
        activeItem: 'production'
    };

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

            if (!token || role !== 'manufacturer' || !accounts[0]) {
                this.props.router.push('/unauthorized');
                return;
            }

            this.setState({
                isAuthenticated: true,
                userRole: role
            });

        } catch (error) {
            console.error('Error in componentDidMount:', error);
            this.props.router.push('/unauthorized');
        } finally {
            this.setState({ pageLoading: false });
        }
    };

    onSubmit = async (event) => {
        event.preventDefault();
        this.setState({ loading: true, errorMessage: '', hasNoError: false });
    
        try {
            // Log all input values
            console.log('=== Form Input Values ===');
            console.log('CPU Model:', this.state.cpuModel);
            console.log('CPU Frequency:', this.state.cpuFrequency);
            console.log('RAM Size:', this.state.ramSize);
            console.log('Storage Size:', this.state.storageSize);
            console.log('Model Name:', this.state.modelName);
            console.log('Serial Number:', this.state.serialNumber);
            console.log('Register SC Address:', this.state.registerSCAddress);
            console.log('=====================');
    
            const accounts = await web3.eth.getAccounts();
            console.log('Connected Account:', accounts[0]);
    
            await cpuContract.methods
                .registerCPU(
                    this.state.registerSCAddress,
                    this.state.cpuModel,
                    this.state.cpuFrequency,
                    this.state.ramSize,
                    this.state.storageSize,
                    this.state.modelName,
                    this.state.serialNumber
                )
                .send({ from: accounts[0] });
    
            const cpuQR = await cpuContract.methods.getCPUAddress().call();
            console.log('Generated CPU QR:', cpuQR);
            
            this.setState({
                cpuQR,
                QRcodePic: true,
                hasNoError: true
            });
    
        } catch (err) {
            console.error('Error details:', err);
            this.setState({
                errorMessage: err.message || 'Transaction failed. Please try again.',
                hasNoError: false
            });
        } finally {
            this.setState({ loading: false });
        }
    };

    handleItemClick = (e, { name }) => this.setState({ activeItem: name });
    handleChangeModel = (e, { value }) => this.setState({ cpuModel: value });
    handleChangeFrequency = (e, { value }) => this.setState({ cpuFrequency: value });
    handleChangeRamSize = (e, { value }) => this.setState({ ramSize: value });
    handleChangeStorageSize = (e, { value }) => this.setState({ storageSize: value });
    handleChangeModelName = (e) => this.setState({ modelName: e.target.value });
    handleChangeSerialNumber = (e) => this.setState({ serialNumber: e.target.value });

    render() {
        return (
                <div className='ProductionLine'>
                    <h2>CPU E-Waste Registration</h2>
                    <br />
                    <link rel="stylesheet" href="//cdn.jsdelivr.net/npm/semantic-ui@2.4.1/dist/semantic.min.css" />
                    <Container>
                        <Grid>
                            <Grid.Row centered>
                                <Grid.Column width={12} textAlign="center">
                                    <Form onSubmit={this.onSubmit} error={!!this.state.errorMessage} success={this.state.hasNoError}>
                                        <Form.Field>
                                            <label>CPU Model:</label>
                                            <Dropdown
                                                placeholder='Choose CPU Model'
                                                clearable
                                                options={cpuModelOptions}
                                                selection
                                                onChange={this.handleChangeModel}
                                            />
                                        </Form.Field>

                                        <Form.Field>
                                            <label>CPU Frequency:</label>
                                            <Dropdown
                                                placeholder='Choose CPU Frequency'
                                                clearable
                                                options={cpuFrequencyOptions}
                                                selection
                                                onChange={this.handleChangeFrequency}
                                            />
                                        </Form.Field>

                                        <Form.Field>
                                            <label>RAM Size:</label>
                                            <Dropdown
                                                placeholder='Choose RAM Size'
                                                clearable
                                                options={ramSizeOptions}
                                                selection
                                                onChange={this.handleChangeRamSize}
                                            />
                                        </Form.Field>

                                        <Form.Field>
                                            <label>Storage Capacity:</label>
                                            <Dropdown
                                                placeholder='Choose Storage Size'
                                                clearable
                                                options={storageSizeOptions}
                                                selection
                                                onChange={this.handleChangeStorageSize}
                                            />
                                        </Form.Field>

                                        <Form.Field>
                                            <label>Model Name:</label>
                                            <Input
                                                placeholder='Enter Model Name'
                                                value={this.state.modelName}
                                                onChange={this.handleChangeModelName}
                                            />
                                        </Form.Field>

                                        <Form.Field>
                                            <label>Serial Number:</label>
                                            <Input
                                                placeholder='Enter Serial Number'
                                                value={this.state.serialNumber}
                                                onChange={this.handleChangeSerialNumber}
                                            />
                                        </Form.Field>

                                        <Message error header="Error!" content={this.state.errorMessage} />
                                        <Message success header="Success!" content="QR code generated successfully!" />

                                        <Button loading={this.state.loading} type='submit'>Submit</Button>
                                    </Form>

                                    <label>{this.state.cpuQR}</label>
                                    <h1>{this.state.QRcodePic ? 
                                    <QrCode value={this.state.cpuQR} QrCode size={'400'} /> : ''}</h1>
                                </Grid.Column>
                            </Grid.Row>
                        </Grid>
                    </Container>
                </div>
        );
    }
}
export default withRouter(ManufacturingMachinePage);/*
//<Button type='submit'>Submit</Button> 
    onGenerate = async (event) => {
        this.state.bottleQR = await bottleContract.methods.getBottleAddress().call();
        console.log(this.state.bottleQR);
        this.setState({ QRcodePic: true });

    }
                                        <Form onSubmit={this.onGenerate}>
                                        <Button type='submit'>Generate QR Code</Button>
                                    </Form>
    */ //(old)
