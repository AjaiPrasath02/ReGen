import React, { Component } from 'react';
import { Icon, Step } from 'semantic-ui-react';
import { VerticalTimeline, VerticalTimelineElement } from 'react-vertical-timeline-component';
import 'react-vertical-timeline-component/style.min.css';
import web3 from '../../ethereum/web3';
import trackingContract from '../../ethereum/tracking';
import registerContract from '../../ethereum/register';
import plasticBaleContract from '../../ethereum/plasticBale';
import Layout from '../../components/Layout';

class show extends Component {

    constructor(props) {
        super(props);
        this.state = {
            sortingFacilityAddr: '',
            disposeDate: '',
            recyclerAddr: '',
            sortedActive: false,
            sortDate: '',
            sortingFacilityName: '',
            sortingFacilityLoc: '',
            sortingFacilityAddr: '',
            producedBales: [],
            purchaseDate: '',
            buyerAddr: '',
            buyerName: '',
            buyerLocation: '',
            buyerBusiness: '',
            purchaseActive: false,
           
        };
    }

    static async getInitialProps(props) {

        //1. fetches address of the bottle from the URL
        //Perfomed at the server before html is loaded
        const { address } = props.query;

        return { address };
    }

    //2. fetches data from events 
    componentDidMount = async () => {

        const accounts = await web3.eth.getAccounts();
        this.setState({ recyclerAddr: accounts[0] });

        console.log(this.props.address);
        //Step: Disposed
        //Fetch time of disposing 
        trackingContract.events.updateStatusRecycler({
            filter: { plasticBottleAddress: this.props.address }, fromBlock: 0
        }, function (error, event) {
            //console.log(event.returnValues['time']);
            //var date = time.toUTCString();
            var time = new Date(event.returnValues['time'] * 1000);
            var date = time.toString();
            this.setState({ disposeDate: date });
        }.bind(this))
            .on('error', console.error);

        //*********************************************************** 
        //Step: Sorted
        // Fetch sorting facility address
        trackingContract.events.updateStatusMachine({
            filter: { plasticBottleAddress: this.props.address }, fromBlock: 0
        }, function (error, event) {
            this.setState({ sellerAddress: event.returnValues['sellerAddress'] });
            var time = new Date(event.returnValues['time'] * 1000);
            var date = time.toString();
            this.setState({ sortDate: date });
            this.FetchSellerDetails();
            this.setState({ sortedActive: true });
        }.bind(this))
            .on('error', console.error);

        //************************************************************ 
        // Step: Purchased 
        // Checking the event happens inside 
        this.FetchDeployedBales();

    };


    componentWillUnmount() {
        this.setState({
            sortingFacilityAddr: '',
            disposeDate: '',
            recyclerAddr: '',
            buyerAddr: '',
            sortedActive: false,
            sortedDisabled: true,
            sortDate: '',
            sortingFacilityName: '',
            sortingFacilityLoc: '',
            sortingFacilityAddr: ''
        });
    }

    // Get seller detail

    FetchSellerDetails = async () => {
        const accounts = await web3.eth.getAccounts();
        await registerContract.methods
            .getSellerDetails(this.state.sellerAddress)
            .call(function (error, result) {
                this.setState({
                    sortingFacilityAddr: result[0],
                    sortingFacilityLoc: result[1],
                    sortingFacilityName: result[2]
                });

            }.bind(this));
    };

    FetchDeployedBales = async () => {

        //1. Find produced bales 
        this.state.producedBales = await trackingContract.methods.getDeployedBales().call();
        console.log(this.state.producedBales);

        let count = 0;
        console.log(this.state.producedBales.length);
        //2. Loop through all produced bales
        while (Array.isArray(this.state.producedBales) && count != this.state.producedBales.length) {
            console.log("tehe");
            const plasticBaleSC = plasticBaleContract(this.state.producedBales[count]);
            //3. Filter events in each plasticbaleSC that is related to the bottle 
            plasticBaleSC.events.updateStatusBuyer({
                filter: { plasticBottleAddress: this.props.address }, fromBlock: 0
            }, function (error, event) {
                console.log(event);
                count = 0;
                //4. Fetch details 
                this.setState({ buyerAddr: event.returnValues['buyer'] });
                var time = new Date(event.returnValues['time'] * 1000);
                var date = time.toString();
                this.setState({ purchaseDate: date });
                this.FetchBuyerDetails();
                this.setState({ purchaseActive: true });

            }.bind(this))
                .on('error', console.error);

            count++;

        }
    };


    FetchBuyerDetails = async () => {
        const accounts = await web3.eth.getAccounts();
        await registerContract.methods
            .getBuyerDetails(this.state.buyerAddr)
            .call(function (error, result) {
                this.setState({
                    buyerName: result[1],
                    buyerLocation: result[2],
                    buyerBusiness: result[3]
                });

            }.bind(this));
    };


    render() {

        const { disposeDate, purchaseActive, sortedActive} = this.state;

        return (
            <Layout>

                <link rel="stylesheet"
                    href="//cdn.jsdelivr.net/npm/semantic-ui@2.4.1/dist/semantic.min.css"
                />
                <div className='Tracking'>
                    <h1 style={{'white-space': 'nowrap',
                                'overflow': 'hidden',
                                'text-overflow': 'ellipsis'}}
                                >You are currently tracking <br/> {this.props.address}</h1>
                    <br/>
               

                <VerticalTimeline layout='1-column-left'>
                    <VerticalTimelineElement
                        className="vertical-timeline-element--work"
                        iconStyle={{ background: 'rgb(66, 195, 99)', color: '#fff' }}
                        icon= {<svg width="22" height="22" viewBox="0 0 32 32">
                       <path d="M10 2h-8v8h8v-8zM12 0v0 12h-12v-12h12zM4 4h4v4h-4zM30 2h-8v8h8v-8zM32 0v0 12h-12v-12h12zM24 4h4v4h-4zM10 22h-8v8h8v-8zM12 20v0 12h-12v-12h12zM4 24h4v4h-4zM14 0h2v2h-2zM16 2h2v2h-2zM14 4h2v2h-2zM16 6h2v2h-2zM14 8h2v2h-2zM16 10h2v2h-2zM14 12h2v2h-2zM14 16h2v2h-2zM16 18h2v2h-2zM14 20h2v2h-2zM16 22h2v2h-2zM14 24h2v2h-2zM16 26h2v2h-2zM14 28h2v2h-2zM16 30h2v2h-2zM30 16h2v2h-2zM2 16h2v2h-2zM4 14h2v2h-2zM0 14h2v2h-2zM8 14h2v2h-2zM10 16h2v2h-2zM12 14h2v2h-2zM18 16h2v2h-2zM20 14h2v2h-2zM22 16h2v2h-2zM24 14h2v2h-2zM26 16h2v2h-2zM28 14h2v2h-2zM30 20h2v2h-2zM18 20h2v2h-2zM20 18h2v2h-2zM22 20h2v2h-2zM26 20h2v2h-2zM28 18h2v2h-2zM30 24h2v2h-2zM18 24h2v2h-2zM20 22h2v2h-2zM24 22h2v2h-2zM26 24h2v2h-2zM28 22h2v2h-2zM30 28h2v2h-2zM20 26h2v2h-2zM22 28h2v2h-2zM24 26h2v2h-2zM26 28h2v2h-2zM20 30h2v2h-2zM24 30h2v2h-2zM28 30h2v2h-2z"></path>

                      </svg>}

                    >
                        <h3 className="vertical-timeline-element-title">Disposed</h3>
                        <h4 className="vertical-timeline-element-subtitle" style={{'white-space': 'nowrap',
                                'overflow': 'hidden',
                                'text-overflow': 'ellipsis'}}>Recycler: {this.state.recyclerAddr}</h4>
                        <p>
                        <b>Date:</b> {this.state.disposeDate}
    </p>
                    </VerticalTimelineElement>

                    {sortedActive == true ? (
                        <div>
                            <VerticalTimelineElement
                                className="vertical-timeline-element--work"
                                iconStyle={{ background: 'rgb(66, 195, 99)', color: '#fff' }}
                                icon={<svg width="22" height="22" viewBox="0 0 20 20">
                                    <path d="M10.5 20h-10.5v-13l5 3.33v-3.33l5 3.33v-3.33l5 3.33v-10.33h5v20h-9.5z"></path>
                                </svg>}
                                visible={this.state.sortedActive}

                            >
                                <h3 className="vertical-timeline-element-title">Sorted</h3>
                                <h4 className="vertical-timeline-element-subtitle" style={{'white-space': 'nowrap',
                                'overflow': 'hidden',
                                'text-overflow': 'ellipsis'}}>Sorting Facility: {this.state.sortingFacilityAddr}</h4>
                                <p>
                                    <b>Sorting Facility: </b> {this.state.sortingFacilityName} <br />
                        <b>Location:</b> {this.state.sortingFacilityLoc} <br />
                        <b>Date:</b> {this.state.sortDate}
                                </p>
                            </VerticalTimelineElement>

                        </div>) : null}


                        {purchaseActive == true ? (<div>
                            <VerticalTimelineElement
                                className="vertical-timeline-element--work"
                                iconStyle={{ background: 'rgb(66, 195, 99)', color: '#fff' }}
                                icon={<svg width="22" height="22" viewBox="0 0 32 32 ">
                                    <path d="M15.925 23.96l-9.819-5.8 9.817 13.84 9.827-13.84-9.829 5.8zM16.075 0l-9.821 16.297 9.82 5.805 9.82-5.8z"></path>
                                </svg>}
                                visible={this.state.purchaseActive}

                            >
                                <h3 className="vertical-timeline-element-title">Purchased</h3>
                                <h4 className="vertical-timeline-element-subtitle" style={{'white-space': 'nowrap',
                                'overflow': 'hidden',
                                'text-overflow': 'ellipsis'}}>Buyer: {this.state.buyerAddr}</h4>
                                <p>
                                    <b>Buyer:</b> {this.state.buyerName} <br />
                        <b>Location:</b> {this.state.buyerLocation} <br />
                        <b>Recycled to:</b> {this.state.buyerBusiness} <br />
                        <b>Date:</b> {this.state.purchaseDate}
                                </p>
                            </VerticalTimelineElement>

                        </div>) : null}

        
                    </VerticalTimeline>
                    </div>

  
            </Layout>

        );
    }

}

//At the end of each page, a component is expected to be returned 
// If not, Next.js throws an error 
export default show; 