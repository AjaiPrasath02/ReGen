import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { Menu, Icon, Form, Button, Message } from 'semantic-ui-react';
import Image from 'next/image';
import trackingContract from '../ethereum/tracking';
import img1 from '../public/10.webp';
import { Container } from 'semantic-ui-react';
import img1 from '../public/10.webp';
import { Container } from 'semantic-ui-react';

const About = () => {
    const router = useRouter();

    // Split state into individual useState hooks for better clarity
    const [activeItem, setActiveItem] = useState('about');
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [formErrors, setFormErrors] = useState({});

    useEffect(() => {
        // Check authentication status
        // Check authentication status
        const token = localStorage.getItem('token');
        const role = localStorage.getItem('role');
        if (token && role) {
            setIsAuthenticated(true);
            setUserRole(role);
            setIsAuthenticated(true);
            setUserRole(role);
        }

        // Fetch tracking data
        // Fetch tracking data
        const fetchTrackingData = async () => {
            let disposed = 0;
            let sorted = 0;
            let disposed = 0;
            let sorted = 0;

            trackingContract.getPastEvents(
                'allEvents',
                { fromBlock: 0, toBlock: 'latest' },
                (err, events) => {
                    events.forEach((item) => {
                        if (item.event === 'updateStatusRecycler') disposed++;
                        else if (item.event === 'updateStatusMachine') sorted++;
                    });
                    setRecycledBottles(sorted);
                    setNotRecycledBottles(disposed);
                }
            );
            trackingContract.getPastEvents(
                'allEvents',
                { fromBlock: 0, toBlock: 'latest' },
                (err, events) => {
                    events.forEach((item) => {
                        if (item.event === 'updateStatusRecycler') disposed++;
                        else if (item.event === 'updateStatusMachine') sorted++;
                    });
                    setRecycledBottles(sorted);
                    setNotRecycledBottles(disposed);
                }
            );
        };

        fetchTrackingData();
    }, []);

    const handleLogout = () => {
        localStorage.clear();
        router.push('/login');
    };

    const handleItemClick = (e, { name }) => setActiveItem(name);
    const handleItemClick = (e, { name }) => setActiveItem(name);

    const handleLogin = () => router.push('/login');
    const handleLogin = () => router.push('/login');

    const validateForm = () => {
        const errors = {};
        if (!name.trim()) errors.name = 'Name is required';
        if (!email.trim()) errors.email = 'Email is required';
        else if (!/\S+@\S+\.\S+/.test(email)) errors.email = 'Please enter a valid email address';
        if (!message.trim()) errors.message = 'Message is required';
        if (!name.trim()) errors.name = 'Name is required';
        if (!email.trim()) errors.email = 'Email is required';
        else if (!/\S+@\S+\.\S+/.test(email)) errors.email = 'Please enter a valid email address';
        if (!message.trim()) errors.message = 'Message is required';
        return errors;
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        const errors = validateForm();
        if (Object.keys(errors).length > 0) {
            setFormErrors(errors);
        const errors = validateForm();
        if (Object.keys(errors).length > 0) {
            setFormErrors(errors);
            return;
        }

        try {
            setLoading(true);
            setError('');
            setSuccess('');
            setFormErrors({});
        try {
            setLoading(true);
            setError('');
            setSuccess('');
            setFormErrors({});

            const response = await fetch('http://localhost:4000/api/feedback/submit', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, message }),
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, message }),
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.error || 'Something went wrong');

            setName('');
            setEmail('');
            setMessage('');
            setSuccess('Thank you for your feedback!');
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };
            if (!response.ok) throw new Error(data.error || 'Something went wrong');

            setName('');
            setEmail('');
            setMessage('');
            setSuccess('Thank you for your feedback!');
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <Menu text>
                <Menu.Item
                    name="about"
                    name="about"
                    active={activeItem === 'about'}
                    onClick={handleItemClick}
                    style={{
                        fontSize: '1.3rem',
                        textDecoration: activeItem === 'about' ? 'underline' : 'none',
                        textDecorationColor: 'black',
                    }}
                >
                    About
                </Menu.Item>
                <Menu.Item
                    name="contact"
                    name="contact"
                    active={activeItem === 'contact'}
                    onClick={handleItemClick}
                    style={{
                        fontSize: '1.3rem',
                        textDecoration: activeItem === 'contact' ? 'underline' : 'none',
                        textDecorationColor: 'black',
                    }}
                >
                    Contact Us
                </Menu.Item>
                <Menu.Menu position="right">
                <Menu.Menu position="right">
                    {!isAuthenticated ? (
                        <Menu.Item>
                            <Button color="green" onClick={handleLogin}>
                            <Button color="green" onClick={handleLogin}>
                                Login
                            </Button>
                        </Menu.Item>
                    ) : (
                        <Menu.Item>
                            <Button color="blue" onClick={handleLogout}>
                            <Button color="blue" onClick={handleLogout}>
                                Log Out
                            </Button>
                        </Menu.Item>
                    )}
                </Menu.Menu>
            </Menu>

            {activeItem === 'about' && (
                <div className="about-section">
                    <div className="app-container">
                        <h1>ReGen: Sustainable Reverse Logistics</h1>
                        <div className="logo-container">
                            <Image src="/11.jpg" alt="Blockchain" layout="responsive" width={700} height={300} />
            {activeItem === 'about' && (
                <div className="about-section">
                    <div className="app-container">
                        <h1>ReGen: Sustainable Reverse Logistics</h1>
                        <div className="logo-container">
                            <Image src="/11.jpg" alt="Blockchain" layout="responsive" width={700} height={300} />
                        </div>
                        <p className="app-description">
                        <p className="app-description">
                            At ReGen, we are committed to addressing two of the most pressing issues of our time—plastic waste management and the fair recognition of individuals contributing to a cleaner environment. With industrialization and rapid population growth leading to unprecedented levels of plastic waste, there is an urgent need for innovative solutions that ensure efficiency, transparency, and trust.
                        </p>
                        <p className="app-description">
                        <p className="app-description">
                            We leverage cutting-edge blockchain technology to revolutionize how recyclable plastic waste is managed and tracked. Using the Ethereum blockchain and decentralized storage solutions, our platform offers unparalleled transparency, security, and reliability. By integrating smart contracts, we ensure that every individual contributing to waste recycling is fairly rewarded, establishing trust and accountability across all stakeholders.
                        </p>
                        <p className="app-description">
                        <p className="app-description">
                            Our decentralized application (DApp) simplifies the waste tracking process while providing a clear reward system to honor the efforts of everyone involved. This innovation not only promotes environmental sustainability but also ensures that people are compensated fairly for their contributions.
                        </p>
                        <p className="app-description">
                        <p className="app-description">
                            At ReGen, we are building a more transparent and efficient waste management ecosystem, one that aligns environmental responsibility with commercial viability.
                        </p>
                        <h2>Know about recycling</h2>
                        <Image src={img1} alt="Recycling" layout="responsive" width={700} height={1000} />
                        <h2>Know about recycling</h2>
                        <Image src={img1} alt="Recycling" layout="responsive" width={700} height={1000} />
                    </div>
                </div>
            )}

            {activeItem === 'contact' && (
                <div className="contact-section">
                    <h1>Contact Us</h1>
                    <div className="contact-info">
                        <div className="contact-info-row">
                            <div className="contact-info-cell">
                                <Icon circular inverted name="pin" color="green" />
                            </div>
                            <div className="contact-info-cell">
                                <p><strong>CIT Coimbatore</strong></p>
                                <p>Coimbatore Institute of Technology, Coimbatore, Tamil Nadu, India</p>
                            </div>
                        </div>
                        <div className="contact-info-row">
                            <div className="contact-info-cell">
                                <Icon circular inverted name="mail" color="green" />
                            </div>
                            <div className="contact-info-cell">
                                <p><strong>Email:</strong> <a href="mailto:info@cit.ac.in">info@cit.ac.in</a></p>
                            </div>
                        </div>
                        <div className="contact-info-row">
                            <div className="contact-info-cell">
                                <Icon circular inverted name="phone" color="green" />
            {activeItem === 'contact' && (
                <div className="contact-section">
                    <h1>Contact Us</h1>
                    <div className="contact-info">
                        <div className="contact-info-row">
                            <div className="contact-info-cell">
                                <Icon circular inverted name="pin" color="green" />
                            </div>
                            <div className="contact-info-cell">
                                <p><strong>CIT Coimbatore</strong></p>
                                <p>Coimbatore Institute of Technology, Coimbatore, Tamil Nadu, India</p>
                            </div>
                        </div>
                        <div className="contact-info-row">
                            <div className="contact-info-cell">
                                <Icon circular inverted name="mail" color="green" />
                            </div>
                            <div className="contact-info-cell">
                                <p><strong>Email:</strong> <a href="mailto:info@cit.ac.in">info@cit.ac.in</a></p>
                            </div>
                        </div>
                        <div className="contact-info-row">
                            <div className="contact-info-cell">
                                <Icon circular inverted name="phone" color="green" />
                            </div>
                            <div className="contact-info-cell">
                                <p><strong>Phone:</strong> +91 123 456 7890</p>
                            <div className="contact-info-cell">
                                <p><strong>Phone:</strong> +91 123 456 7890</p>
                            </div>
                        </div>
                    </div>
                    <h1>Get in Touch</h1>
                    {/* <div className="form-container"> */}
                    <Container style={{ width: '50%' }}>
                    <h1>Get in Touch</h1>
                    {/* <div className="form-container"> */}
                    <Container style={{ width: '50%' }}>
                        <Form
                            className="form"
                            className="form"
                            onSubmit={handleSubmit}
                            error={!!error || Object.keys(formErrors).length > 0}
                            success={!!success}
                            error={!!error || Object.keys(formErrors).length > 0}
                            success={!!success}
                        >
                            <Form.Input
                                label="Name"
                                placeholder="Your Name"
                                value={name}
                                onChange={(e, { value }) => setName(value)}
                                error={formErrors.name ? { content: formErrors.name, pointing: 'below' } : null}
                                required
                            />
                            <Form.Input
                                label="Email"
                                placeholder="Your Email"
                                type="email"
                                value={email}
                                onChange={(e, { value }) => setEmail(value)}
                                error={formErrors.email ? { content: formErrors.email, pointing: 'below' } : null}
                                required
                            />
                            <Form.TextArea
                                label="Message"
                                placeholder="Your Message"
                                value={message}
                                onChange={(e, { value }) => setMessage(value)}
                                error={formErrors.message ? { content: formErrors.message, pointing: 'below' } : null}
                                required
                            />
                            <Message error header="Error" content={error} />
                            <Message success header="Success" content={success} />
                            <Button type="submit" color="green" fluid loading={loading} disabled={loading}>
                            <Form.Input
                                label="Name"
                                placeholder="Your Name"
                                value={name}
                                onChange={(e, { value }) => setName(value)}
                                error={formErrors.name ? { content: formErrors.name, pointing: 'below' } : null}
                                required
                            />
                            <Form.Input
                                label="Email"
                                placeholder="Your Email"
                                type="email"
                                value={email}
                                onChange={(e, { value }) => setEmail(value)}
                                error={formErrors.email ? { content: formErrors.email, pointing: 'below' } : null}
                                required
                            />
                            <Form.TextArea
                                label="Message"
                                placeholder="Your Message"
                                value={message}
                                onChange={(e, { value }) => setMessage(value)}
                                error={formErrors.message ? { content: formErrors.message, pointing: 'below' } : null}
                                required
                            />
                            <Message error header="Error" content={error} />
                            <Message success header="Success" content={success} />
                            <Button type="submit" color="green" fluid loading={loading} disabled={loading}>
                                Submit
                            </Button>
                        </Form>
                    </Container>
                    {/* </div> */}
                    </Container>
                    {/* </div> */}
                </div>
            )}
        </div>
    );
};

export default About;