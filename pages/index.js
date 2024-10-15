/*
This is the index page which will be the first page of the dapp to run
To run the app, use the command npm run dev
*/

import React, { Component } from 'react';
import { Grid, Menu, Segment, Icon, Divider } from 'semantic-ui-react';
import Layout from '../components/Layout';
import Image from 'next/image'; 
import { Pie } from 'react-chartjs-2';
import trackingContract from '../ethereum/tracking';
import Footer from '../components/Footer';

export default class index extends Component {
    constructor(props) {
        super(props);
        this.state = {
            activeItem: 'about',
            recycledBottles: 0, 
            notRecycledBottles: 0

        }
    }

    componentDidMount = async () => {

        var disposed = 0;
        var sorted = 0;
 
        trackingContract.getPastEvents("allEvents", { fromBlock: 0, toBlock: 'latest' }, (error, events) => {

            const myfunction = (item) => {

                if (item.event === 'updateStatusRecycler') {
                    disposed++;
                    
                } else if (item.event === 'updateStatusMachine') {
                    sorted++;

                } 

            };

            events.forEach(myfunction);

            this.setState({
               recycledBottles: sorted,
               notRecycledBottles: disposed
            });


        });



    };


    handleItemClick = (e, { name }) => this.setState({ activeItem: name })

    render() {
        const { activeItem } = this.state
        const state = {
            labels: ['Recycled', 'Produced'],
            datasets: [
                {
                    label: 'Plastic bottles',
                    backgroundColor: [
                        '#E88B0C',
                        '#0B98E3'
                    ],
                    hoverBackgroundColor: [
                        '#B4701E',
                        '#296B8E'
                    ],
                    data: [this.state.recycledBottles, this.state.notRecycledBottles]
                }
            ]
        }



        return (
            <Layout>
                <div>
                    <link rel="stylesheet"
                        href="//cdn.jsdelivr.net/npm/semantic-ui@2.4.1/dist/semantic.min.css"
                    />
                <style jsx>{`
                           
          @media (max-width: 600px) {
           div {
              }
        }
            .features, .statistics{
                display: grid;
                grid-template-columns: 50% 50%;
                grid-auto-rows: 150px;
                column-gap: 15px;
                row-gap: 15px;
            }
            .feature {
                height:100%;
                padding:5px;
                background-color:rgba(255,255,255, 0.4);
            }

            .feature p {
                padding:0px;
                text-align:justify;
            }

            .statistic p{
                text-align:center;
            }

            .center{
                Display: flex;
                Width: 100%; 
                Align-Items: center;
                Justify-Content: center;
            }

      `}</style>


                    <Menu text>
                        <Menu.Item
                            name='about'
                            active={activeItem === 'about'}
                            onClick={this.handleItemClick}
                        >
                            About
                        </Menu.Item>


                        <Menu.Item
                                    name='contact'
                                    active={activeItem === 'contact'}
                                    onClick={this.handleItemClick}
                                >
                                    Contact Us
                        </Menu.Item>
                    </Menu>

                    {(activeItem === 'about') && (
                        <div>
                            <div className="about" style={{padding:'0'}}>

                                
                                <div className="app-container">
                                <h1>Blockchain-Based Plastic Waste Management System</h1>
                                <div className="center">
                                <Image className="logo" src='/blockchain.png' alt="Blockchain" width="500" height="500" />
                            </div>
                            <br></br>
                                <p className="app-description">
                                  Industrialization and the rapid increase in the world population have led to the generation of a large amount of plastic waste. Efficient recycling of such waste and fairly rewarding the general public for their services and efforts are two challenging problems. A large portion of today’s systems and technologies that are leveraged for managing plastic waste disposal processes and rewarding people for their services fall short of providing transparency, traceability, reliability, security, and trust features. In this paper, we propose a blockchain-based solution for managing and tracking recyclable plastic waste using the Ethereum blockchain, along with decentralized storage technology to handle massive volumes of data. Our proposed solution also introduces a reward scheme for people to honor their efforts. Also, our proposed solution establishes trust and accountability among stakeholders who typically participate in the waste management system and also ensures fair reward practices. We present the system architecture along with full implementation and testing details. For better usability, we deploy a decentralized application (DApp) on top of the smart contracts. We evaluate the proposed solution’s functionality and performance using security and cost analyses and compare it with the existing solutions. Our results demonstrate that adopting a blockchain-based approach reduces inefficiencies and is an economical and commercially viable solution. We also make the smart contracts’ code publicly available on GitHub.
                                </p>
                              </div>
                            </div>

                        </div>
                    )}


                    {(activeItem === 'contact') && (
                        <div className="contactSection">
                            <h2>Contact Us</h2>
                                <Grid container columns={2} relaxed>
                                    <Grid.Row>
                                        <Grid.Column width={1}>
                                            <Icon circular inverted name='pin' color='teal' />
                                        </Grid.Column>
                                        <Grid.Column width={12}>
                                            <p><strong>CIT</strong> Coimbatore</p>
                                        </Grid.Column>
                                    </Grid.Row>
                                </Grid>
                        </div>
                    )}

                </div>
                
            </Layout>
        )
    }
}