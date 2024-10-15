import React, { Component } from 'react';
import { Button, Message, Form, Dropdown, Container, Grid } from 'semantic-ui-react';
import web3 from '../ethereum/web3';
import bottleContract from '../ethereum/bottleProduction';
import dynamic from 'next/dynamic';
const QrCode = dynamic(() => import('react.qrcode.generator'), { ssr: false });
import Layout from '../components/Layout';

//Dropdownmenu selections
const bottleTypesOptions = [
    { key: 1, text: 'PET (Polyethylene Terephthalate)', value: 0 },
    { key: 2, text: 'LDPE/HDPE (Low- and High-Density Polyethylene)', value: 1 },
    { key: 3, text: 'PP (Polypropylene)', value: 2 },
    { key: 4, text: 'PC (Polycarbonate)', value: 3 },
]

const bottleColorOptions = [
    { key: 1, text: 'Clear', value: 0 },
    { key: 2, text: 'White', value: 1 },
    { key: 3, text: 'Red', value: 2 },
    { key: 4, text: 'Blue', value: 3 },
    { key: 4, text: 'Black', value: 4 },
]

const bottleSizeOptions = [
    { key: 1, text: '100 mL', value: 0 },
    { key: 2, text: '200 mL', value: 1 },
    { key: 3, text: '330 mL', value: 2 },
    { key: 4, text: '500 mL', value: 3 },
    { key: 4, text: '1.5L', value: 4 },
]

class manufacturingMachinePage extends Component {
    constructor(props) {
        super(props);
        this.state = {
            registerSCAddress: '0xe1E62A4956A0aAD7ff4bBb08d881dF80CdeBA229',
            bottleType: '',
            bottleColor: '',
            bottleSize: '',
            bottleQR: '',
            errorMessage: '',
            hasNoError: false,
            loading: false, 
            QRcodePic: false
        };
    }


    //produce bottle QR code

    onSubmit = async (event) => {
        event.preventDefault(); // prevents the browser from submitting the form immediately
        this.setState({ loading: true, errorMessage: '' });
    
        try {
            const accounts = await web3.eth.getAccounts();
            await bottleContract.methods
                // .registerBottle(this.state.bottleType, this.state.bottleColor, this.state.bottleSize)
                .registerBottle(this.state.registerSCAddress, this.state.bottleType, this.state.bottleColor, this.state.bottleSize)
                .send({ from: accounts[0] });
    
            const bottleQR = await bottleContract.methods.getBottleAddress().call(); 
            console.log(bottleQR);
            this.setState({ bottleQR, QRcodePic: true, hasNoError: true });
        } catch (err) {
            console.error(err);
            this.setState({ errorMessage: err.message, hasNoError: false });
        } finally {
            this.setState({ loading: false });
        }
    };
    

    handleChangeType = (e, { value }) => this.setState({ bottleType: value })
    handleChangeColor = (e, { value }) => this.setState({ bottleColor: value })
    handleChangeSize = (e, { value }) => this.setState({ bottleSize: value })

    render() {
        const { value } = this.state

        return (
            <Layout>
                <div className='ProductionLine'>
                    <h2>Production Line</h2>
                    <br />
                    <link rel="stylesheet" href="//cdn.jsdelivr.net/npm/semantic-ui@2.4.1/dist/semantic.min.css" />
                    <Container>
                        <Grid>
                            <Grid.Row centered>
                                <Grid.Column width={12} textAlign="center">
                                    <Form onSubmit={this.onSubmit} error={!!this.state.errorMessage} success={this.state.hasNoError}>
                                        <Form.Field><label>Bottle Material:   </label>
                                            <Dropdown
                                                placeholder='Choose Bottle Material'
                                                clearable
                                                options={bottleTypesOptions}
                                                selection
                                                onChange={this.handleChangeType} />
                                        </Form.Field>

                                        <Form.Field><label>Bottle Color:   </label>
                                            <Dropdown
                                                placeholder='Choose Bottle Color'
                                                clearable
                                                options={bottleColorOptions}
                                                selection
                                                onChange={this.handleChangeColor} />
                                        </Form.Field>

                                        <Form.Field><label>Bottle Size:   </label>
                                            <Dropdown
                                                placeholder='Choose Bottle Size'
                                                clearable
                                                options={bottleSizeOptions}
                                                selection
                                                onChange={this.handleChangeSize} />
                                        </Form.Field>

                                        <Message error header="Error!" content={this.state.errorMessage} />


                                        <Message success header="Success!" content="QR code generated successfully!" />

                                        <Button loading={this.state.loading} type='submit'>Submit</Button>
                                    </Form>

                                    <label>{this.state.bottleQR}</label>
                                    <h1>{this.state.QRcodePic == true ? 
                                    <QrCode value={this.state.bottleQR} QrCode size={'400'} /> : ''} </h1>

                                </Grid.Column>
                            </Grid.Row>
                        </Grid>
                    </Container>
                </div>
            </Layout>
        );
    }
}
export default manufacturingMachinePage; 

/*
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
