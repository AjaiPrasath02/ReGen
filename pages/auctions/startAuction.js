import React, { Component } from 'react';
import { Form, Button, Input, Message, Statistic, Icon, Grid, Container } from 'semantic-ui-react';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import web3 from '../../ethereum/web3';
import registerContract from '../../ethereum/register';
import plasticBaleContract from '../../ethereum/plasticBale';
import Layout from '../../components/Layout';

class startAuction extends Component {
    constructor(props) {
        super(props);
        this.state = {
            startingPrice: '',
            errorMessage: '',
            hasNoError: false,
            startDate: new Date(),
            loading: false

        };

        this.handleChange = this.handleChange.bind(this);
    }

    static async getInitialProps(props) {

        //fetches address of the bottle from the URL
        const { address } = props.query;

        return { address };
    }

    handleChange(date) {
        this.setState({
            startDate: date
        });
        console.log(date);
    }



    onStartAuction = async (event) => {
        event.preventDefault();

        //1. Extract time from date
        //2. Conver to Milliseconds
        let closingTime = Math.ceil((this.state.startDate).getTime() / 1000);
        console.log(closingTime);

        this.setState({ loading: true, errorMessage: '' });


        try {
            const accounts = await web3.eth.getAccounts();
            const plasticBaleSC = plasticBaleContract(this.props.address);
            await plasticBaleSC.methods.startAuction(closingTime, this.state.startingPrice)
                .send({ from: accounts[0] });
            this.setState({ open: true });
        } catch (err) {
            this.setState({ errorMessage: err.message });
            this.setState({ hasError: false });
        }

        // if errorMsg is empty, registration is successful
        if (!this.state.errorMessage)
            this.setState({ hasNoError: true });

        this.setState({ loading: false });

    };





    render() {

        return (
            <Layout>
                <link rel="stylesheet"
                    href="//cdn.jsdelivr.net/npm/semantic-ui@2.4.1/dist/semantic.min.css"
                />

                

                    <div className='setAuction'>

                        <h2>Set Bale's Auction Parameters: </h2>

                        <Container>
                            <Grid>
                                <Grid.Row centered>
                                    <Grid.Column width={12} textAlign="center">
                                        <Form onSubmit={this.onStartAuction} error={!!this.state.errorMessage} success={this.state.hasNoError}>
                                            <Form.Field>
                                                <label >Auction Closing Date and Time</label>
                                                <DatePicker
                                                    selected={this.state.startDate}
                                                    onChange={this.handleChange}
                                                    showTimeSelect
                                                    timeFormat="HH:mm"
                                                    timeIntervals={20}
                                                    timeCaption="time"
                                                    dateFormat="MM/dd/yyyy h:mm aa"
                                                
                                                />
                                            </Form.Field>

                                            <Form.Field>
                                                <label>Starting Price</label>
                                                <Input value={this.state.startingPrice}
                                                    label={{ basic: true, content: 'Ether' }}
                                                    labelPosition='right'
                                                    onChange={event => this.setState({ startingPrice: event.target.value })} />
                                            </Form.Field>

                                            <Message error header="Error!" content={this.state.errorMessage} />


                                            <Message success header="Success!" content="Auction is Open!" />


                                            <Button color='olive' loading={this.state.loading} type='submit'>Start Auction</Button>
                                        </Form>
                                    </Grid.Column>
                                </Grid.Row>
                            </Grid>
                        </Container>

                    </div>
            



            </Layout>
        );
    }

}

export default startAuction; 