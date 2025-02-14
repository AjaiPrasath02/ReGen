import React, { Component } from 'react';
import { Menu, Button, Message, Form, Input, Container, Grid } from 'semantic-ui-react';

import dynamic from 'next/dynamic';
const QRReader = dynamic(() => import('react-qr-reader'), { ssr: false });

import web3 from '../ethereum/web3';
import trackingContract from '../ethereum/tracking';
import Layout from '../components/Layout';
//import ipfs from './ipfs';
import ipfs from 'ipfs-http-client';



// Eiman's sorting faciclity 1: 0x334b12DF37984A449b57BAE3F4120f70be177be0
// 71762105002's sorting facility 2: 0x4B8d6dDB4E66436C445c7520566f02aAC47e5C38

class sortingmachine extends Component {
    constructor(props) {
        super(props);
        this.state = {
            selectScan: true,
            selectPicture: false,
            selectSettings: false,
            productionMachine: false,
            sortingMachine: false,
            result: '',
            buffer:'',  //(new)
            ipfsHash: null, //(new)
            qr: false,
            sellerAddress: '0x4B8d6dDB4E66436C445c7520566f02aAC47e5C38', // Hard coded Address
            registerSCAddress: '0xe1E62A4956A0aAD7ff4bBb08d881dF80CdeBA229',
            errorMessage: '',
            hasNoError: false,
            bottlesLimit: '',
            errorMessage1: '',
            loading: false,
            loadingPic:false,
            IPFSPic: false
        };
    }



    // QR reader functions 
    handleScan = async (data) => {
        if (data) {
            this.setState({ result: data });
            this.sortBottle();

        }
    }

    handleError = err => {
        console.error(err)
    }

    onScan = async (event) => {
        event.preventDefault();
        if (this.state.qr === false) {
            this.setState({ qr: true });
        }
        else {
            this.setState({ qr: false });
        }
    };

    // Log bottle as disposed 
    sortBottle = async () => {
        const accounts = await web3.eth.getAccounts();
        this.setState({ errorMessage: '' });

        try {
            await trackingContract.methods
                .updateStatusSorted(this.state.registerSCAddress, this.state.sellerAddress, this.state.result)
                .send({ from: accounts[0] });
        } catch (err) {
            this.setState({ errorMessage: err.message });

        }

        this.setState({ loading: false });

    };

    // Controls the size of the plastic bale 
    onSetBaleLimit = async (event) => {

        event.preventDefault();
        const accounts = await web3.eth.getAccounts();
        this.setState({ loading: true, errorMessage1: '' });


        try {
            await trackingContract.methods
                .setBottlesSortedLimit(this.state.bottlesLimit)
                .send({ from: accounts[0] });
        } catch (err) {
            this.setState({ errorMessage1: err.message });

        }

        this.setState({ loading: false });

    };


    //(new)
    captureFile =(event) => {
        event.stopPropagation()
        event.preventDefault();
        const file = event.target.files[0]
        let reader = new window.FileReader() 
        reader.readAsArrayBuffer(file)
        reader.onloadend = async () => { //file is converted to a buffer for upload to IPFS
            const buffer = await Buffer.from(reader.result);
            this.setState({buffer});
            console.log('buffer', this.state.buffer)}   
      };//Capture File

    onUpload = async(event) =>  {
        event.preventDefault();

        // to upload image to IPFS
        const result = await ipfs.add(this.state.buffer);
        this.setState({ ipfsHash: result.path })
        console.log('ifpsHash', this.state.ipfsHash)
        
        const accounts = await web3.eth.getAccounts();
        this.setState({ loadingPic: true, errorMessage1: '' });

        //to upload image to blockcahin
        try {
            await trackingContract.methods
                .setBaleIPFSHash(this.state.ipfsHash)
                .send({ from: accounts[0] });
            this.setState({ IPFSPic: true });
        } catch (err) {
            this.setState({ errorMessage1: err.message });

        }
        
       this.setState({ loadingPic: false });
    }


    render() {

        const { qr,
            selectScan,
            selectPicture,
            selectSettings
        } = this.state

        return (
            <Layout>

                <link rel="stylesheet"
                    href="//cdn.jsdelivr.net/npm/semantic-ui@2.4.1/dist/semantic.min.css"
                />
                <div className='SortingMachine'>
                    <h2>Sorting Machine</h2>

                    <Menu widths={3}>
                        <Menu.Item name='Scan QR code' onClick={() => this.setState({ selectScan: true, selectPicture: false, selectSettings: false })} > Scan QR code </Menu.Item>
                        <Menu.Item name='Upload picture' onClick={() => this.setState({ selectPicture: true, selectSettings: false, selectScan: false })} >  Upload picture </Menu.Item>
                        <Menu.Item name='Settings' onClick={() => this.setState({ selectSettings: true, selectPicture: false, selectScan: false })} > Set Plastic Bale Size</Menu.Item>
                    </Menu>
                
                    <Container>
                        <Grid>
                            <Grid.Row centered>
                                <Grid.Column width={12} textAlign="center">

                                    {selectSettings && (
                                        <Form onSubmit={this.onSetBaleLimit} error={!!this.state.errorMessage1} >
                                            <Form.Field>
                                                <label>Number of Bottles in a Plastic Bale</label>
                                                <Input value={this.state.bottlesLimit}
                                                    onChange={event => this.setState({ bottlesLimit: event.target.value })} />
                                            </Form.Field>
                                            <Button loading={this.state.loading} type='submit'>Set Limit</Button>
                                        </Form>
                                    )}

                                    {selectPicture && (
                                        <Form onSubmit={this.onUpload }>
                                            <Form.Field>
                                                <label>Upload Plastic Bale Picture</label>
                                                <Input type='file'
                                                    onChange={this.captureFile}/>
                                            </Form.Field>
                                            <Button loading={this.state.loadingPic} type='submit'>Upload Picture</Button>
                                        </Form>

                                    )}

                                    {selectScan && (
                                        <Form error={!!this.state.errorMessage} success={this.state.hasNoError} >
                                            <div className="Scanner" >
                                                <br /> <br />
                                            
                                                <Button className="QrReader" style={{ 'vertical-align': 'middle' }} onClick={this.onScan} > Scan QR Code</Button>
                                                <br />
                                                <br />
                                                
                                                <div style={{  'margin': 'auto', 'display': 'block',  'padding-left': '277px' }} > {this.state.qr === true ? (<QRReader
                                                    delay={300}
                                                    onError={this.handleError}
                                                    onScan={this.handleScan}
                                                    style={{ width: "50%" }}
                                                />
                                                )
                                                    : ''} </div>

                                                <Message error header="Error!" content={this.state.errorMessage} />

                                                <Message success header="Success!" content="Plastic bottle status is updated successfully by sorting machine!" />

                                            </div>

                                        </Form>

                                    )}

                                     {/*             
                                    <label>{this.state.IPFSPic == true ? 
                                    <img src={`https://ipfs.io/ipfs/${this.state.ipfsHash}`} alt="" class="center"/> : ''} 
                                    </label> */}    
                                    
                                </Grid.Column>
                            </Grid.Row>
                        </Grid>
                    </Container>

                </div>




            </Layout>

        );
    }

}

//At the end of each page, a component is expected to be returned 
// If not, Next.js throws an error 
export default sortingmachine;