import React, { Component } from 'react';
import { Container, Header, Form, Input, Button, Message, Segment, Grid } from 'semantic-ui-react';
import { withRouter } from 'next/router';
import web3 from "../ethereum/web3";
import cpuContract from "../ethereum/cpuProduction";
import dynamic from "next/dynamic";
import QrScanner from "qr-scanner";
import AllCPUs from "../components/CPUsTable";

const QrReader = dynamic(() => import("react-qr-reader"), { ssr: false });

class LabPage extends Component {
    constructor(props) {
        super(props);
        this.state = {
            cpuAddress: "",
            components: [],
            errorMessage: "",
            successMessage: "",
            isAuthenticated: false,
            userRole: null,
            userAddress: "",
            qrScanned: false,
            cpuModel: "",
            cpuSerial: "",
            cpuStatus: "",
            productionDate: "",
        };
    }

    componentDidMount = async () => {
        try {
            const token = localStorage.getItem('token');
            const role = localStorage.getItem('role');
            const userAddress = localStorage.getItem('userAddress');
            const accounts = await web3.eth.getAccounts();

            if (!token || !role || !userAddress) {
                this.props.router.push('/login');
                return;
            }

            if (role !== 'labassistant') {
                this.props.router.push('/unauthorized');
                return;
            }

            if (!accounts || !accounts[0]) {
                this.props.router.push('/connect-wallet');
                return;
            }

            if (accounts[0].toLowerCase() !== userAddress.toLowerCase()) {
                this.props.router.push('/connect-wallet');
                return;
            }

            this.setState({
                isAuthenticated: true,
                userRole: role,
                userAddress: userAddress,
            });
        } catch (error) {
            this.props.router.push('/unauthorized');
        }
    };

    handleScan = async (data) => {
        if (data) {
            await this.fetchCPUDetails(data.trim());
        }
    };

    handleError = (err) => {
        this.setState({ errorMessage: err.message });
    };

    handleFileUpload = async (event) => {
        try {
            const file = event.target.files[0];
            if (!file) return;

            const result = await QrScanner.scanImage(file, {
                returnDetailedScanResult: false,
            });
            console.log("QR code content from uploaded image:", result);

            if (result) {
                await this.fetchCPUDetails(result.data.trim());
            }
        } catch (error) {
            console.error("Error scanning uploaded image:", error);
            this.setState({
                errorMessage: "Could not detect a valid QR code in the image.",
            });
        }
    };

    fetchCPUDetails = async (cpuAddress) => {
        try {
            this.setState({ cpuAddress, qrScanned: true });

            const cpuDetails = await cpuContract.methods.getCPU(cpuAddress).call();
            console.log("Fetched CPU Details:", cpuDetails);

            if (cpuDetails) {
                this.setState({
                    cpuModel: cpuDetails.modelName,
                    cpuSerial: cpuDetails.serialNumber,
                    cpuStatus: cpuDetails.status,
                    components: cpuDetails.components,
                    productionDate: new Date(parseInt(cpuDetails.productionDate) * 1000).toLocaleDateString()
                });
            } else {
                console.log("No CPU details found or invalid data format.");
            }
        } catch (err) {
            console.error("Error fetching CPU details:", err);
            this.setState({ errorMessage: "Error fetching CPU details." });
        }
    };

    handleBack = () => {
        this.setState({
            qrScanned: false,
            cpuAddress: "",
            cpuModel: "",
            cpuSerial: "",
            cpuStatus: "",
            components: [],
            productionDate: "",
            errorMessage: ""
        });
    };

    render() {
        const {
            components,
            qrScanned,
            cpuModel,
            cpuSerial,
            cpuStatus,
            errorMessage,
        } = this.state;

        return (
            <Container>
                <link
                    rel="stylesheet"
                    href="//cdn.jsdelivr.net/npm/semantic-ui@2.4.1/dist/semantic.min.css"
                />

                <Header as="h1" textAlign="center" style={{ marginTop: "1em" }}>
                    Lab Assistant - View Components
                </Header>

                {qrScanned && (
                    <Button
                        icon="arrow left"
                        content="Back to Scanner"
                        color="blue"
                        onClick={this.handleBack}
                        style={{ marginBottom: "1em" }}
                    />
                )}

                <Grid centered style={{ marginTop: "2em" }}>
                    <Grid.Column width="100%">
                        {!qrScanned ? (
                            <Segment>
                                <Grid stackable columns={2}>
                                    <Grid.Row style={{ paddingRight: "3em" }}>
                                        <Grid.Column>
                                            <Header as="h2" style={{ marginTop: "10px" }} textAlign="center">
                                                Scan or Upload QR Code
                                            </Header>

                                            <QrReader
                                                delay={1000}
                                                style={{ width: "100%", maxWidth: "400px", margin: "0 auto" }}
                                                onScan={this.handleScan}
                                                onError={this.handleError}
                                            />

                                            <div style={{ marginTop: "1.5em", textAlign: "center" }}>
                                                <Button as="label" htmlFor="file" type="button" color="green">
                                                    Upload QR Image
                                                </Button>
                                                <input
                                                    type="file"
                                                    id="file"
                                                    accept="image/*"
                                                    style={{ display: "none" }}
                                                    onChange={this.handleFileUpload}
                                                />
                                            </div>
                                        </Grid.Column>

                                        <Grid.Column>
                                            <AllCPUs />
                                        </Grid.Column>
                                    </Grid.Row>
                                </Grid>
                            </Segment>
                        ) : (
                            <>
                                <Form>
                                    <Form.Group widths="equal">
                                        <Form.Field>
                                            <label>Model</label>
                                            <Input readOnly value={cpuModel} />
                                        </Form.Field>
                                        <Form.Field>
                                            <label>Serial</label>
                                            <Input readOnly value={cpuSerial} />
                                        </Form.Field>
                                        <Form.Field>
                                            <label>Status</label>
                                            <Input readOnly value={cpuStatus} />
                                        </Form.Field>
                                        <Form.Field>
                                            <label>Production Date</label>
                                            <Input readOnly value={this.state.productionDate} />
                                        </Form.Field>
                                    </Form.Group>
                                </Form>

                                <div style={{ width: "100%" }}>
                                    <Header
                                        as="h2"
                                        textAlign="center"
                                        style={{ marginTop: "10px", marginBottom: "10px" }}
                                    >
                                        Components
                                    </Header>

                                    <Form error={!!errorMessage} style={{ marginTop: "1em", width: "100%" }}>
                                        {components.map((component, idx) => (
                                            <Form.Group key={idx} style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between" }}>
                                                <Form.Field width={"100%"} style={{ flex: "1" }}>
                                                    <label>{component.componentType}</label>
                                                    <Input
                                                        readOnly
                                                        value={component.details}
                                                        style={{ backgroundColor: '#f9f9f9' }}
                                                    />
                                                </Form.Field>
                                                <Form.Field style={{ marginLeft: '1em' }}>
                                                    <Button color="orange" style={{ cursor: "default" }}>
                                                        {component.status}
                                                    </Button>
                                                </Form.Field>
                                            </Form.Group>
                                        ))}

                                        <Message
                                            error
                                            header="Error"
                                            content={errorMessage}
                                        />
                                    </Form>
                                </div>
                            </>
                        )}
                    </Grid.Column>
                </Grid>
            </Container>
        );
    }
}

export default withRouter(LabPage); 