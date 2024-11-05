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
                                    At ReGen, we are committed to addressing two of the most pressing issues of our time—plastic waste management and the fair recognition of individuals contributing to a cleaner environment. With industrialization and rapid population growth leading to unprecedented levels of plastic waste, there is an urgent need for innovative solutions that ensure efficiency, transparency, and trust.
                                </p>

                                <p className="app-description" style={{ fontSize: '1.3rem', lineHeight: '1.8', color: '#555' }}>
                                    We leverage cutting-edge blockchain technology to revolutionize how recyclable plastic waste is managed and tracked. Using the Ethereum blockchain and decentralized storage solutions, our platform offers unparalleled transparency, security, and reliability. By integrating smart contracts, we ensure that every individual contributing to waste recycling is fairly rewarded, establishing trust and accountability across all stakeholders.
                                </p>

                                <p className="app-description" style={{ fontSize: '1.3rem', lineHeight: '1.8', color: '#555' }}>
                                    Our decentralized application (DApp) simplifies the waste tracking process while providing a clear reward system to honor the efforts of everyone involved. This innovation not only promotes environmental sustainability but also ensures that people are compensated fairly for their contributions.
                                </p>

                                <p className="app-description" style={{ fontSize: '1.3rem', lineHeight: '1.8', color: '#555', marginBottom: '20px' }}>
                                    At ReGen, we are building a more transparent and efficient waste management ecosystem, one that aligns environmental responsibility with commercial viability.
                                </p>
                                <h2 style={{ fontSize: '2.5rem', color: '#333', marginBottom: '20px' }}>Know about recycling</h2>
                                <img src={img1.src} alt="" width="700" height="1000" />
                            </div>
                        </div>
                    )}


                    {(activeItem === 'contact') && (
                        <div className="contactSection" style={{ padding: '20px', backgroundColor: '#f9f9f9', borderRadius: '8px' }}>
                            <br />
                            <h1 style={{ textAlign: 'center', marginBottom: '20px' }}>Contact Us</h1>
                            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                                <div style={{ display: 'table', margin: '20px 0', borderCollapse: 'collapse' }}>
                                    <div style={{ display: 'table-row' }}>
                                        <div style={{ display: 'table-cell', padding: '10px', verticalAlign: 'middle' }}>
                                            <Icon circular inverted name='pin' color='green' />
                                        </div>
                                        <div style={{ display: 'table-cell', padding: '10px', verticalAlign: 'middle' }}>
                                            <p><strong>CIT Coimbatore</strong></p>
                                            <p>Coimbatore Institute of Technology, Coimbatore, Tamil Nadu, India</p>
                                        </div>
                                    </div>

                                    <div style={{ display: 'table-row' }}>
                                        <div style={{ display: 'table-cell', padding: '10px', verticalAlign: 'middle' }}>
                                            <Icon circular inverted name='mail' color='green' />
                                        </div>
                                        <div style={{ display: 'table-cell', padding: '10px', verticalAlign: 'middle' }}>
                                            <p><strong>Email:</strong> <a href="mailto:info@cit.ac.in">info@cit.ac.in</a></p>
                                        </div>
                                    </div>

                                    <div style={{ display: 'table-row' }}>
                                        <div style={{ display: 'table-cell', padding: '10px', verticalAlign: 'middle' }}>
                                            <Icon circular inverted name='phone' color='green' />
                                        </div>
                                        <div style={{ display: 'table-cell', padding: '10px', verticalAlign: 'middle' }}>
                                            <p><strong>Phone:</strong> +91 123 456 7890</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <h1 style={{ textAlign: 'center' }}>Get in Touch</h1>
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
                                    <Button type='submit' color='green' fluid>Submit</Button>
                                    <br />
                                </Form>
                            </div>
                        </div>
                    )}

                </div>

            </ Layout>

        )
    }
}