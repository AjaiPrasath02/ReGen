/*
This is the recycler page where a recycler scans the QR codes and view rewards
Contact used here: an instance of tracking.sol 
To run the app, use the command npm run dev
*/

import React, { Component } from 'react';
import { Card, Table, Button, Grid, Container, Menu } from 'semantic-ui-react';
import dynamic from 'next/dynamic';
const QRReader = dynamic(() => import('react-qr-reader'), { ssr: false });
import web3 from '../ethereum/web3';
import trackingContract from '../ethereum/tracking';
import plasticBaleContract from '../ethereum/plasticBale';
import { Link } from '../routes';
// import { Link } from 'react-router-dom'; 

// Inside your component

import Layout from '../components/Layout';

class recyclerPage extends Component {

    constructor(props) {
        super(props);
        this.state = {
            rewards: 0,
            result: '',
            status: '',
            qr: false,
            rows: [],
            bottlesLogged: [],
            activeItem: 'scan'
        };
    }

    // retrieve all bottled logged by user from ropsten network 
    componentDidMount = async () => {
        const accounts = await web3.eth.getAccounts();


        trackingContract.events.updateStatusRecycler({
            filter: { recycler: accounts[0] }, fromBlock: 0
        }, function (error, event) {

            this.setState({ result: event.returnValues['plasticBottleAddress'], status: event.returnValues['status'] });
            this.setState(prevState => ({ bottlesLogged: [...prevState.bottlesLogged, this.state.result] }));
            this.addRow();
        }.bind(this))
            .on('error', console.error);

        // Update status as sorted 
        trackingContract.events.updateStatusMachine({
            filter: { plasticBottleAddress: this.state.bottlesLogged }, fromBlock: 0
        }, function (error, event) {
            let index = this.state.bottlesLogged.indexOf(event.returnValues['plasticBottleAddress']);
            this.updateRow(index, event.returnValues['status']);
        }.bind(this))
            .on('error', console.error);

        // Get all deployed plastic bales SC addresses 
        trackingContract.events.plasticBaleCompleted({
            fromBlock: 0
        }, function (error, event) {
            console.log(event);
            const plasticbaleAddr = event.returnValues['plasticbale'];
            console.log(plasticbaleAddr);
            const plasticBaleSC = plasticBaleContract(plasticbaleAddr);

            // Fetch recycler rewards 
            plasticBaleSC.events.recyclerRewarded({
                filter: { recycler: accounts[0] },
                fromBlock: 0
            }, function (error, event) {
                console.log(event);

                this.setState({
                    rewards: this.state.rewards + event.returnValues['etherReward'],
                });

            }.bind(this))
                .on('error', console.error);

            //Update status purchases
            plasticBaleSC.events.updateStatusBuyer({
                filter: { plasticBottleAddress: this.state.bottlesLogged },
                fromBlock: 0
            }, function (error, event) {
                let index = this.state.bottlesLogged.indexOf(event.returnValues['plasticBottleAddress']);
                this.updateRow(index, event.returnValues['status']);

            }.bind(this))
                .on('error', console.error);


        }.bind(this))
            .on('error', console.error);


    };


    // QR reader functions 
    handleScan = async (data) => {
        if (data) {
            this.setState({ result: data });
            this.disposeBottle();

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

    // Adds a new row dynamically to the table 
    addRow = () => {
        this.setState((prevState) => {
            let bottle = { addr: this.state.result, status: this.state.status };
            return { rows: [...prevState.rows, bottle] };
        });

    };

    // Log bottle as disposed 
    disposeBottle = async () => {
        const accounts = await web3.eth.getAccounts();

        //Add try and catch block here 
        await trackingContract.methods
            .updateStatusDisposed(this.state.result)
            .send({ from: accounts[0] });

    };

    updateRow(index, status) {
        // 1. Make a shallow copy of rows
        let rows = [...this.state.rows];
        // 2. Make a shallow copy of the row you want to mutate
        let row = { ...rows[index] };
        // 3. Replace the property you're intested in
        row.status = status;
        // 4. Put it back into our array. N.B. we *are* mutating the array here, but that's why we made a copy first
        rows[index] = row;
        // 5. Set the state to our new copy
        this.setState({ rows });
    }

    handleItemClick = (e, { name }) => this.setState({ activeItem: name })


    render() {

        const { qr, rows, activeItem } = this.state

        return (
            <Layout>
                <div className='Recycler'>
                    <h2>Recycler Page</h2>
                    <link rel="stylesheet"
                        href="//cdn.jsdelivr.net/npm/semantic-ui@2.4.1/dist/semantic.min.css"
                    />

                    <Menu widths={3}>
                        <Menu.Item
                            name='scan'
                            active={activeItem === 'about'}
                            onClick={this.handleItemClick}
                        >
                            Scan
                </Menu.Item>

                        <Menu.Item
                            name='history'
                            active={activeItem === 'features'}
                            onClick={this.handleItemClick}
                        >
                            History
                </Menu.Item>

                        <Menu.Item
                            name='rewards'
                            active={activeItem === 'stats'}
                            onClick={this.handleItemClick}
                        >
                            Rewards
                </Menu.Item>
                    </Menu>



                    {(activeItem === 'scan') && (
                        <div>
                            <Grid>
                                <Grid.Row centered>
                                    <Grid.Column textAlign="center">
                                        <div className="Scanner">
                                            <h2 style={{ 'text-align': 'center',  'padding-top': '45px'}} >Aim at QR code to dispose water bottle </h2>
                                            <Button className="QrReader" onClick={this.onScan} > Scan</Button>
                                            <br />
                                            <br />
                                            <div style={{  'margin': 'auto', 'display': 'block',  'padding-left': '400px' }} > {this.state.qr === true ? (
                                                <QRReader
                                                    delay={300}
                                                    onError={this.handleError}
                                                    onScan={this.handleScan}
                                                    style={{ width: "50%" }}
                                                />
                                            )
                                                : ''} </div>

                                        </div>
                                    </Grid.Column>
                                </Grid.Row>
                            </Grid>

                        </div>
                    )}


                    {(activeItem === 'history') && (
                        <div style={{'padding-top': '45px'}}>
                            <h3 style={{ textAlign: 'center' }}>Bottle history</h3>

                            <div className='BottleTable' style={{ 'width': '90%', 'margin-left': 'auto', 'margin-right': 'auto' }}>
                                <Table unstackable size='small' fixed singleLine>
                                    <Table.Header>
                                        <Table.Row>
                                            <Table.HeaderCell width={16}>Plasitc Bottle Address</Table.HeaderCell>
                                            <Table.HeaderCell width={6}>Status</Table.HeaderCell>
                                        </Table.Row>
                                    </Table.Header>
                                    <Table.Body>
                                        {this.state.rows.map(bottle => (
                                            
                                            <Link href={`/track/${bottle.addr}`}>

                                                <Table.Row id={this.state.rows.length} key={this.state.rows.length}>
                                                    <Table.Cell selectable style={{ 'overflow': 'hidden' }}>
                                                        <a>
                                                            {bottle.addr}
                                                        </a>
                                                    </Table.Cell>
                                                    <Table.Cell>{bottle.status}</Table.Cell>
                                                </Table.Row>
                                            </Link>
                                        ))}
                                    </Table.Body>

                                </Table>
                            </div>

                        </div>
                    )}
            {/* {(activeItem === 'history') && (
            <div style={{ 'padding-top': '45px' }}>
                <h3 style={{ textAlign: 'center' }}>Bottle history</h3>

                <div className='BottleTable' style={{ 'width': '90%', 'margin-left': 'auto', 'margin-right': 'auto' }}>
                    <Table unstackable size='small' fixed singleLine>
                        <Table.Header>
                            <Table.Row>
                                <Table.HeaderCell width={16}>Plastic Bottle Address</Table.HeaderCell>
                                <Table.HeaderCell width={6}>Status</Table.HeaderCell>
                            </Table.Row>
                        </Table.Header>
                        console.log(this.state.rows)
                        <Table.Body>
                            {this.state.rows.map((bottle, index) => (
                                <Table.Row key={index}>
                                    <Table.Cell selectable style={{ 'overflow': 'hidden' }}>
                                        <a href={`/track/${bottle.addr}`}>
                                            {bottle.addr}
                                        </a>
                                    </Table.Cell>
                                    <Table.Cell>{bottle.status}</Table.Cell>
                                </Table.Row>
                            ))}
                        </Table.Body>
                    </Table>
                </div>
            </div>
        )}

 */}


                    {(activeItem === 'rewards') && (
                        <div>
                            <h3 style={{ textAlign: 'center', 'padding-top': '45px' }}>Total rewards</h3>

                            <Card header='Rewards' description={this.state.rewards - 0 } meta='ETH' centered='true' />

                        </div>
                    )}


                </div>
            </Layout>

        );
    }

}

//At the end of each page, a component is expected to be returned 
// If not, Next.js throws an error 
export default recyclerPage;



// import React, { Component } from 'react';
// import { Card, Table, Button, Grid, Container, Menu } from 'semantic-ui-react';
// import dynamic from 'next/dynamic';
// const QRReader = dynamic(() => import('react-qr-reader'), { ssr: false });
// import web3 from '../ethereum/web3';
// import trackingContract from '../ethereum/tracking';
// import plasticBaleContract from '../ethereum/plasticBale';
// import { Link } from '../routes';
// import Layout from '../components/Layout';

// class recyclerPage extends Component {
//     constructor(props) {
//         super(props);
//         this.state = {
//             rewards: 0,
//             result: '',
//             status: '',
//             qr: false,
//             rows: [],
//             bottlesLogged: [],
//             activeItem: 'scan'
//         };
//     }

//     componentDidMount = async () => {
//         const accounts = await web3.eth.getAccounts();

//         trackingContract.events.updateStatusRecycler({
//             filter: { recycler: accounts[0] }, fromBlock: 0
//         }, function (error, event) {
//             this.setState({ result: event.returnValues['plasticBottleAddress'], status: event.returnValues['status'] });
//             this.setState(prevState => ({ bottlesLogged: [...prevState.bottlesLogged, this.state.result] }));
//             this.addRow();
//         }.bind(this))
//         .on('error', console.error);

//         trackingContract.events.updateStatusMachine({
//             filter: { plasticBottleAddress: this.state.bottlesLogged }, fromBlock: 0
//         }, function (error, event) {
//             let index = this.state.bottlesLogged.indexOf(event.returnValues['plasticBottleAddress']);
//             this.updateRow(index, event.returnValues['status']);
//         }.bind(this))
//         .on('error', console.error);

//         trackingContract.events.plasticBaleCompleted({
//             fromBlock: 0
//         }, function (error, event) {
//             console.log(event);
//             const plasticbaleAddr = event.returnValues['plasticbale'];
//             console.log(plasticbaleAddr);
//             const plasticBaleSC = plasticBaleContract(plasticbaleAddr);

//             plasticBaleSC.events.recyclerRewarded({
//                 filter: { recycler: accounts[0] },
//                 fromBlock: 0
//             }, function (error, event) {
//                 console.log(event);
//                 this.setState({
//                     rewards: this.state.rewards + event.returnValues['etherReward'],
//                 });
//             }.bind(this))
//             .on('error', console.error);

//             plasticBaleSC.events.updateStatusBuyer({
//                 filter: { plasticBottleAddress: this.state.bottlesLogged },
//                 fromBlock: 0
//             }, function (error, event) {
//                 let index = this.state.bottlesLogged.indexOf(event.returnValues['plasticBottleAddress']);
//                 this.updateRow(index, event.returnValues['status']);
//             }.bind(this))
//             .on('error', console.error);
//         }.bind(this))
//         .on('error', console.error);
//     };

//     handleScan = async (data) => {
//         if (data) {
//             this.setState({ result: data });
//             this.disposeBottle();
//         }
//     };

//     handleError = err => {
//         console.error(err)
//     };

//     onScan = async (event) => {
//         event.preventDefault();
//         this.setState(prevState => ({ qr: !prevState.qr }));
//     };

//     addRow = () => {
//         this.setState(prevState => {
//             let bottle = { addr: this.state.result, status: this.state.status };
//             return { rows: [...prevState.rows, bottle] };
//         });
//     };

//     disposeBottle = async () => {
//         const accounts = await web3.eth.getAccounts();
//         await trackingContract.methods
//             .updateStatusDisposed(this.state.result)
//             .send({ from: accounts[0] });
//     };

//     updateRow(index, status) {
//         let rows = [...this.state.rows];
//         let row = { ...rows[index] };
//         row.status = status;
//         rows[index] = row;
//         this.setState({ rows });
//     }

//     handleItemClick = (e, { name }) => this.setState({ activeItem: name });

//     render() {
//         const { qr, rows, activeItem } = this.state;

//         return (
//             <Layout>
//                 <div className='Recycler'>
//                     <h2>Recycler Page</h2>
//                     <link rel="stylesheet"
//                         href="//cdn.jsdelivr.net/npm/semantic-ui@2.4.1/dist/semantic.min.css"
//                     />
//                     <Menu widths={3}>
//                         <Menu.Item
//                             name='scan'
//                             active={activeItem === 'about'}
//                             onClick={this.handleItemClick}
//                         >
//                             Scan
//                         </Menu.Item>

//                         <Menu.Item
//                             name='history'
//                             active={activeItem === 'features'}
//                             onClick={this.handleItemClick}
//                         >
//                             History
//                         </Menu.Item>

//                         <Menu.Item
//                             name='rewards'
//                             active={activeItem === 'stats'}
//                             onClick={this.handleItemClick}
//                         >
//                             Rewards
//                         </Menu.Item>
//                     </Menu>

//                     {(activeItem === 'scan') && (
//                         <div>
//                             <Grid>
//                                 <Grid.Row centered>
//                                     <Grid.Column textAlign="center">
//                                         <div className="Scanner">
//                                             <h2 style={{ 'text-align': 'center', 'padding-top': '45px' }}>Aim at QR code to dispose water bottle </h2>
//                                             <Button className="QrReader" onClick={this.onScan} > Scan</Button>
//                                             <br />
//                                             <br />
//                                             <div style={{ 'margin': 'auto', 'display': 'block', 'padding-left': '400px' }} > {qr && (
//                                                 <QRReader
//                                                     delay={300}
//                                                     onError={this.handleError}
//                                                     onScan={this.handleScan}
//                                                     style={{ width: "25%" }}
//                                                 />
//                                             )}
//                                             </div>
//                                         </div>
//                                     </Grid.Column>
//                                 </Grid.Row>
//                             </Grid>
//                         </div>
//                     )}

//                     {(activeItem === 'history') && (
//                         <div style={{ 'padding-top': '45px' }}>
//                             <h3 style={{ textAlign: 'center' }}>Bottle history</h3>
//                             <div className='BottleTable' style={{ 'width': '90%', 'margin-left': 'auto', 'margin-right': 'auto' }}>
//                                 <Table unstackable size='small' fixed singleLine>
//                                     <Table.Header>
//                                         <Table.Row>
//                                             <Table.HeaderCell width={16}>Plastic Bottle Address</Table.HeaderCell>
//                                             <Table.HeaderCell width={6}>Status</Table.HeaderCell>
//                                         </Table.Row>
//                                     </Table.Header>
//                                     <Table.Body>
//                                         {rows.map((bottle, index) => (
//                                             <Table.Row key={index}>
//                                                 <Table.Cell>{bottle.addr}</Table.Cell>
//                                                 <Table.Cell>{bottle.status}</Table.Cell>
//                                             </Table.Row>
//                                         ))}
//                                     </Table.Body>
//                                 </Table>
//                             </div>
//                         </div>
//                     )}

//                     {(activeItem === 'rewards') && (
//                         <div>
//                             <h3 style={{ textAlign: 'center', 'padding-top': '45px' }}>Total rewards</h3>
//                             <Card header='Rewards' description={this.state.rewards - 0} meta='ETH' centered='true' />
//                         </div>
//                     )}
//                 </div>
//             </Layout>
//         );
//     }
// }

// export default recyclerPage;
