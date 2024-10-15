/*
This is the index page which will be the first page of the dapp to run
To run the app, use the command npm run dev
*/

import React, { Component } from 'react';
import { Grid, Menu, Segment, Icon, Divider, Form, Button } from 'semantic-ui-react';
import Layout from '../components/Layout';
import Image from 'next/image';
import { Pie } from 'react-chartjs-2';
import trackingContract from '../ethereum/tracking';
import Footer from '../components/Footer';
import img1 from "../public/10.webp"

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
                            style={{
                                fontSize: '1.3rem',
                                textDecoration: activeItem === 'about' ? 'underline' : 'none',
                                textDecorationColor: 'black',
                            }}
                        >
                            About
                        </Menu.Item>


                        <Menu.Item
                            name='contact'
                            active={activeItem === 'contact'}
                            onClick={this.handleItemClick}
                            style={{
                                fontSize: '1.3rem',
                                textDecoration: activeItem === 'contact' ? 'underline' : 'none',
                                textDecorationColor: 'black',
                            }}
                        >
                            Contact Us
                        </Menu.Item>
                    </Menu>

                    {(activeItem === 'about') && (
                        <div className="about-section" style={{ padding: '40px', backgroundColor: '#f4f4f4' }}>
                            <div className="app-container" style={{ maxWidth: '900px', margin: '0 auto', textAlign: 'center' }}>
                                <h1 style={{ fontSize: '2.5rem', color: '#333', marginBottom: '20px' }}>ReGen: Sustainable Reverse Logistics</h1>

                                <div className="logo-container" style={{ display: 'flex', justifyContent: 'center', marginBottom: '30px' }}>
                                    <Image className="logo" src='/11.jpg' alt="Blockchain" width="700" height="300" />
                                </div>

                                <p className="app-description" style={{ fontSize: '1.3rem', lineHeight: '1.8', color: '#555' }}>
                                    Industrialization and the rapid increase in the world population have led to the generation of a large amount of plastic waste. Efficient recycling of such waste and fairly rewarding the general public for their services and efforts are two challenging problems. A large portion of today’s systems and technologies that are leveraged for managing plastic waste disposal processes and rewarding people for their services fall short of providing transparency, traceability, reliability, security, and trust features.
                                </p>

                                <p className="app-description" style={{ fontSize: '1.3rem', lineHeight: '1.8', color: '#555' }}>
                                    In this paper, we propose a blockchain-based solution for managing and tracking recyclable plastic waste using the Ethereum blockchain, along with decentralized storage technology to handle massive volumes of data. Our proposed solution also introduces a reward scheme for people to honor their efforts.
                                </p>

                                <p className="app-description" style={{ fontSize: '1.3rem', lineHeight: '1.8', color: '#555' }}>
                                    Furthermore, our solution establishes trust and accountability among stakeholders who participate in the waste management system, ensuring fair reward practices. We present the system architecture along with full implementation and testing details, deploying a decentralized application (DApp) on top of smart contracts.
                                </p>

                                <p className="app-description" style={{ fontSize: '1.3rem', lineHeight: '1.8', color: '#555', marginBottom: '20px' }}>
                                    We evaluate the solution’s functionality and performance through security and cost analyses, comparing it with existing solutions. Our results demonstrate that a blockchain-based approach reduces inefficiencies and is a commercially viable solution.
                                </p>
                                <img src={img1.src} alt="" width="700" height="1000" />
                            </div>
                        </div>
                    )}


                    {(activeItem === 'contact') && (
                        <div className="contactSection" style={{ padding: '20px', backgroundColor: '#f9f9f9', borderRadius: '8px' }}>
                            <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>Contact Us</h2>
                            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                                <div style={{ display: 'table', margin: '20px 0', borderCollapse: 'collapse' }}>
                                    <div style={{ display: 'table-row' }}>
                                        <div style={{ display: 'table-cell', padding: '10px', verticalAlign: 'middle' }}>
                                            <Icon circular inverted name='pin' color='teal' />
                                        </div>
                                        <div style={{ display: 'table-cell', padding: '10px', verticalAlign: 'middle' }}>
                                            <p><strong>CIT Coimbatore</strong></p>
                                            <p>Coimbatore Institute of Technology, Coimbatore, Tamil Nadu, India</p>
                                        </div>
                                    </div>

                                    <div style={{ display: 'table-row' }}>
                                        <div style={{ display: 'table-cell', padding: '10px', verticalAlign: 'middle' }}>
                                            <Icon circular inverted name='mail' color='teal' />
                                        </div>
                                        <div style={{ display: 'table-cell', padding: '10px', verticalAlign: 'middle' }}>
                                            <p><strong>Email:</strong> <a href="mailto:info@cit.ac.in">info@cit.ac.in</a></p>
                                        </div>
                                    </div>

                                    <div style={{ display: 'table-row' }}>
                                        <div style={{ display: 'table-cell', padding: '10px', verticalAlign: 'middle' }}>
                                            <Icon circular inverted name='phone' color='teal' />
                                        </div>
                                        <div style={{ display: 'table-cell', padding: '10px', verticalAlign: 'middle' }}>
                                            <p><strong>Phone:</strong> +91 123 456 7890</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <h2 style={{ textAlign: 'center' }}>Get in Touch</h2>
                            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                                <Form style={{ maxWidth: '400px', width: '100%' }}>
                                    <Form.Field>
                                        <label>Name</label>
                                        <input placeholder='Your Name' />
                                    </Form.Field>
                                    <Form.Field>
                                        <label>Email</label>
                                        <input placeholder='Your Email' />
                                    </Form.Field>
                                    <Form.Field>
                                        <label>Message</label>
                                        <textarea placeholder='Your Message' />
                                    </Form.Field>
                                    <Button type='submit' color='teal' fluid>Submit</Button>
                                </Form>
                            </div>
                        </div>
                    )}

                </div>

            </ Layout>

        )
    }
}