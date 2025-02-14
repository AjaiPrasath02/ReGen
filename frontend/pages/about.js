import React, { Component } from 'react';
import { withRouter } from 'next/router';
import { Menu, Icon, Form, Button, Message } from 'semantic-ui-react';
import Image from 'next/image';
import trackingContract from '../ethereum/tracking';
import { useRouter } from 'next/router';
import img1 from "../public/10.webp"

class Index extends Component {

    constructor(props) {
        super(props);
        this.state = {
            activeItem: 'about',
            recycledBottles: 0,
            notRecycledBottles: 0,
            isAuthenticated: false,
            userRole: null,
            name: '',
            email: '',
            message: '',
            loading: false,
            error: '',
            success: ''
        }
    }

    handleLogout = () => {
        const router = useRouter();
        localStorage.clear();
        router.push('/login');
    };

    componentDidMount = async () => {
        // Check if user is already authenticated
        const token = localStorage.getItem('token');
        const role = localStorage.getItem('role');
        if (token && role) {
            this.setState({ isAuthenticated: true, userRole: role });
        }

        // Your existing componentDidMount code
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

    handleItemClick = (e, { name }) => this.setState({ activeItem: name });

    handleLogin = () => {
        this.props.router.push('/login');
    };

    handleDashboard = () => {
        const { userRole } = this.state;
        if (userRole) {
            this.props.router.push(`/logout`);
        }
    };

    handleSubmit = async (event) => {
        event.preventDefault();
        const { name, email, message } = this.state;

        try {
            this.setState({ loading: true, error: '', success: '' });

            const response = await fetch('http://localhost:4000/api/feedback/submit', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    name,
                    email,
                    message
                })
            });

            const data = await response.json();
            console.log(data)
            if (!response.ok) {
                throw new Error(data.error || 'Something went wrong');
            }

            // Clear form and show success message
            this.setState({
                name: '',
                email: '',
                message: '',
                success: 'Thank you for your feedback!',
                loading: false
            });

        } catch (error) {
            this.setState({
                error: error.message,
                loading: false
            });
        }
    };

    render() {
        const { activeItem, isAuthenticated, userRole } = this.state;

        return (
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

                    {/* Add Login/Dashboard Button */}
                    <Menu.Menu position='right'>
                        {!isAuthenticated ? (
                            <Menu.Item>
                                <Button
                                    color='green'
                                    onClick={this.handleLogin}
                                >
                                    Login
                                </Button>
                            </Menu.Item>
                        ) : (
                            <Menu.Item>
                                <Button
                                    color='blue'
                                    onClick={this.handleLogout}
                                >
                                    Log Out
                                </Button>
                            </Menu.Item>
                        )}
                    </Menu.Menu>
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
                            <Form 
                                style={{ maxWidth: '400px', width: '100%' }}
                                onSubmit={this.handleSubmit}
                                error={!!this.state.error}
                                success={!!this.state.success}
                                loading={this.state.loading}
                            >
                                <Form.Field>
                                    <label>Name</label>
                                    <input 
                                        placeholder='Your Name' 
                                        value={this.state.name}
                                        onChange={e => this.setState({ name: e.target.value })}
                                    />
                                </Form.Field>
                                <Form.Field>
                                    <label>Email</label>
                                    <input 
                                        placeholder='Your Email' 
                                        type="email"
                                        value={this.state.email}
                                        onChange={e => this.setState({ email: e.target.value })}
                                    />
                                </Form.Field>
                                <Form.Field>
                                    <label>Message</label>
                                    <textarea 
                                        placeholder='Your Message'
                                        value={this.state.message}
                                        onChange={e => this.setState({ message: e.target.value })}
                                    />
                                </Form.Field>

                                <Message
                                    error
                                    header='Error'
                                    content={this.state.error}
                                />

                                <Message
                                    success
                                    header='Success'
                                    content={this.state.success}
                                />

                                <Button type='submit' color='green' fluid>
                                    Submit
                                </Button>
                                <br />
                            </Form>
                        </div>
                    </div>
                )}

            </div>

        )
    }
}

export default withRouter(Index);