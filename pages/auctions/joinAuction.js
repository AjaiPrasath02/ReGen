import React, { Component } from 'react';
import { Form, Button, Input, Message, Icon, Container, Grid, Statistic } from 'semantic-ui-react';
import web3 from '../../ethereum/web3';
import plasticBaleContract from '../../ethereum/plasticBale';
import registerContract from '../../ethereum/register';
import Layout from '../../components/Layout';
import dynamic from 'next/dynamic';
const DateCountdown = dynamic(() => import('react-date-countdown-timer'), { ssr: false })
import axios from 'axios';

class joinAuction extends Component {
    constructor(props) {
        super(props);
        this.state = {
            join: false,
            registrationSCAddr: '0xe1E62A4956A0aAD7ff4bBb08d881dF80CdeBA229',
            errorMessage: '',
            loading: false,
            totalBidders: 0,
            highestBid: 0,
            closingTime: 0,
            highestBidder: 'No bids placed',
            highestBidderAddress: '',
            bid: '',
            loading2: false,
            loading3: false,
            cryptos: [],
            dollarValue: 0,
            dollars: false,
            eth: true,
        };

        this.componentDidMount = this.componentDidMount.bind(this);
        this.getTimeRemaining = this.getTimeRemaining.bind(this);
        
    }


    static async getInitialProps(props) {
        //fetches address of the bale from URL
        const { address } = props.query;

        return { address };
    }

    componentDidMount = async () => {

        const accounts = await web3.eth.getAccounts();
        const plasticBaleSC = plasticBaleContract(this.props.address);

        var biddersnumber = 0;
        var highestbid = 0;
        var isJoin = false;
        var time = ''; //closing time
       

        plasticBaleSC.getPastEvents("allEvents", { fromBlock: 0, toBlock: 'latest' }, (error, events) => {

            const myfunction = (item) => {

                if (item.event === 'bidderRegistered') {
                    biddersnumber++;
                    item.returnValues['bidderAddress'] === accounts[0] ? isJoin = true : null;


                } else if (item.event === 'auctionStarted') {
                    highestbid = item.returnValues['startingAmount'];

                    //1. Get closing time from event
                    time = new Date(item.returnValues['closingTime'] * 1000);
                    console.log(time);
                    this.initializeClock('clockdiv', time);
                

                } else if (item.event === 'bidderExited') {
                    //console.log(item);
                    item.returnValues['bidderAddress'] === accounts[0] ? isJoin = false : null;
                    biddersnumber--;

                } else if (item.event === 'bidPlaced') {
                    highestbid = item.returnValues['amount'];
                    this.findHighestBidder(item.returnValues['biddeAddress']);

                }

            };

            events.forEach(myfunction);

            this.setState({
                totalBidders: biddersnumber,
                highestBid: highestbid,
                join: isJoin,
                closingTime: time
            });


        });


        axios.get('https://min-api.cryptocompare.com/data/pricemulti?fsyms=ETH&tsyms=USD')
            .then(res => {
                const cryptos = res.data;
                console.log(cryptos);
                this.setState({ cryptos: cryptos });
            })

    };



    // Returns a reusable object
    getTimeRemaining = (endtime) => {

        const total = Date.parse(endtime) - Date.parse(new Date());
        const seconds = Math.floor((total / 1000) % 60);
        const minutes = Math.floor((total / 1000 / 60) % 60);
        const hours = Math.floor((total / (1000 * 60 * 60)) % 24);
        const days = Math.floor(total / (1000 * 60 * 60 * 24));

        return {
            total,
            days,
            hours,
            minutes,
            seconds
        };
    };



      initializeClock(id, endtime) {
        const clock = document.getElementById(id);
        const daysSpan = clock.querySelector('.days');
        const hoursSpan = clock.querySelector('.hours');
        const minutesSpan = clock.querySelector('.minutes');
        const secondsSpan = clock.querySelector('.seconds');
      
         const updateClock = () => {
          const t = this.getTimeRemaining(endtime);
      
          daysSpan.innerHTML = t.days;
          hoursSpan.innerHTML = ('0' + t.hours).slice(-2);
          minutesSpan.innerHTML = ('0' + t.minutes).slice(-2);
          secondsSpan.innerHTML = ('0' + t.seconds).slice(-2);
      
          if (t.total <= 0) {
            clearInterval(timeinterval);
            this.onEndAuction();
          }
        };
    
        updateClock();
        const timeinterval = setInterval(updateClock, 1000);
      }
      



    onJoinAuction = async (event) => {
        event.preventDefault();
        const accounts = await web3.eth.getAccounts();

        this.setState({ loading: true, errorMessage: '' });

        try {
            const accounts = await web3.eth.getAccounts();
            const plasticBaleSC = plasticBaleContract(this.props.address);

            await plasticBaleSC.methods
                .addBidder(this.state.registrationSCAddr, accounts[0])
                .send({ from: accounts[0] });

        } catch (err) {
            this.setState({ errorMessage: err.message });

        }

        // if errorMsg is empty, registration is successful
        if (!this.state.errorMessage) {
            this.setState({ join: true });
        }

        this.setState({ loading: false });
    };



    findHighestBidder = async (address) => {

        const accounts = await web3.eth.getAccounts();
        await registerContract.methods
            .getBuyerDetails(address).call(function (error, result) {
                this.setState({
                    highestBidder: result[1],
                    highestBidderAddress: result[0],
                });

            }.bind(this));

    };


    onPlaceBid = async (event) => {

        event.preventDefault();

        this.setState({ loading2: true, errorMessage: '' });

        try {
            const accounts = await web3.eth.getAccounts();
            const plasticBaleSC = plasticBaleContract(this.props.address);
            await plasticBaleSC.methods
                .placeBid(this.state.registrationSCAddr, this.state.bid)
                .send({ from: accounts[0], value: this.state.bid });
        }
        catch (err) {
            this.setState({ errorMessage: err.message });

        }

        // if errorMsg is empty, registration is successful
        if (!this.state.errorMessage)
            this.setState({ hasNoError: true });


        this.setState({ loading2: false });

    };


    onExitAuction = async (event) => {

        event.preventDefault();

        this.setState({ loading3: true, errorMessage: '' });

        try {
            const accounts = await web3.eth.getAccounts();
            const plasticBaleSC = plasticBaleContract(this.props.address);
            await plasticBaleSC.methods
                .exitAuction(this.state.registrationSCAddr)
                .send({ from: accounts[0] });
            this.setState({ join: false });
        }
        catch (err) {
            this.setState({ errorMessage: err.message });

        }

        // if errorMsg is empty, registration is successful
        if (!this.state.errorMessage)
            this.setState({ hasNoError: true });


        this.setState({ loading3: false });

    };

    onEndAuction = async () => {

       

        this.setState({ loading: true });

        try {
            const accounts = await web3.eth.getAccounts();
            const plasticBaleSC = plasticBaleContract(this.props.address);
            await plasticBaleSC.methods.endAuction().send({ from: accounts[0], gas: 250983 });
            this.setState({ notOver: false });

        } catch (err) {
            // REVERT REASON IS ALMOST SHOWN HERE
            console.log(err);
            this.setState({ errorMessage: err });
            this.setState({ hasError: false });
        }

        this.setState({ loading: false });
    };

    convertToEther = () => {
        this.setState({ dollars: false, eth: true });

    };

    convertToDollars = () => {

        var dollar = this.state.highestBid;
        dollar = (dollar * this.state.cryptos.ETH.USD).toFixed(2);
        console.log(dollar);

        this.setState({ dollarValue: dollar, dollars: true, eth: false });

    };


    render() {

        const { join, dollars, eth, closingTime } = this.state;

        return (
            <Layout>
                <link rel="stylesheet"
                    href="//cdn.jsdelivr.net/npm/semantic-ui@2.4.1/dist/semantic.min.css"
                />

                <div>

                    <h2> Plastic Bale being auctioned:
                 <h3 style={{'overflow': 'hidden', 'text-overflow': 'ellipsis'}}> {this.props.address} </h3> </h2>
                    <br />

                    <div className='AuctionContainer'>
                        <Grid>
                            <Grid.Row centered>
                                <Grid.Column width={8} textAlign="center">

                                    {dollars == true && eth == false ? (<div>
                                        <Statistic inverted>
                                            <Statistic.Value text>
                                                {this.state.dollarValue}
                                                <br />
                                    USD
                                            </Statistic.Value>
                                            <Statistic.Label>Highest Bid</Statistic.Label>
                                        </Statistic>

                                    </div>)
                                        : (<div>
                                            <Statistic inverted>
                                                <Statistic.Value text>
                                                    {this.state.highestBid}
                                                    <br />
                                        ETH
                                        </Statistic.Value>
                                                <Statistic.Label>Highest Bid</Statistic.Label>
                                            </Statistic>

                                        </div>)}
                                </Grid.Column>
                                <Grid.Column width={8} textAlign="center">

                                    <Statistic inverted>
                                        <Statistic.Value>
                                            <Icon name='users' /> {this.state.totalBidders}
                                        </Statistic.Value>
                                        <Statistic.Label>Total Bidders</Statistic.Label>
                                    </Statistic>

                                </Grid.Column>

                            </Grid.Row>

                            <Grid.Row centered>
                                <Grid.Column width={12} textAlign="center">

                                    <Statistic inverted>
                                        <Statistic.Value text>
                                            <Icon name='user' /> <br/> {this.state.highestBidder}
                                            {/*this.state.highestBidderAddress*/}
                                        </Statistic.Value>
                                        <Statistic.Label>Highest Bidder</Statistic.Label>
                                    </Statistic>

                                </Grid.Column>
                            </Grid.Row>
                        </Grid>

                        
                    </div>
                </div>

                <h4 style={{'text-align': 'center'}}>View bids in:</h4>

                <div className='conversionButtons'>
                    <Button.Group size='large'>
                        <Button onClick={this.convertToEther}> Ether </Button>
                        <Button.Or />
                        <Button onClick={this.convertToDollars}>Dollars</Button>
                    </Button.Group>
                </div>

                <br />

                <h4>Auction closing in:</h4>

                <div className="statistic">
                    <div id="clockdiv">
                        <div>
                            <span class="days"></span>
                            <div class="smalltext">Days</div>
                        </div>
                        <div>
                            <span class="hours"></span>
                            <div class="smalltext">Hours</div>
                        </div>
                        <div>
                            <span class="minutes"></span>
                            <div class="smalltext">Minutes</div>
                        </div>
                        <div>
                            <span class="seconds"></span>
                            <div class="smalltext">Seconds</div>
                        </div>
                    </div>
                </div>

                    <br /><br/>


                {join === false ? (<Grid>
                    <Grid.Row centered>
                        <Grid.Column width={12} textAlign="center">
                            <Button color='olive' loading={this.state.loading} onClick={this.onJoinAuction}>Join Auction </Button>
                        </Grid.Column>
                    </Grid.Row>
                </Grid>
                ) : null}


                {join && (

                    <div className='auctionInput'>
                        <Container>
                            <Grid>
                                <Grid.Row centered>
                                    <Grid.Column width={12} textAlign="center">
                                        <Form onSubmit={this.onPlaceBid} error={!!this.state.errorMessage} success={this.state.hasNoError}>

                                            <Form.Field>
                                                <label>Amount</label>
                                                <Input value={this.state.bid}
                                                    label={{ basic: true, content: 'Ether' }}
                                                    labelPosition='right'
                                                    onChange={event => this.setState({ bid: event.target.value })} />
                                            </Form.Field>

                                            <Message error header="Error!" content={this.state.errorMessage} />


                                            <Message success header="Success!" content="Bid is Placed!" />


                                            <Button color='olive' loading={this.state.loading2} type='submit'>Place Bid</Button>
                                        </Form>

                                        <br />

                                        <Button color='red' loading={this.state.loading3} onClick={this.onExitAuction}>Exit Auction </Button>
                                    </Grid.Column>
                                </Grid.Row>
                            </Grid>
                        </Container>


                    </div>

                )}

            </Layout>
        );
    }



}

export default joinAuction; 
