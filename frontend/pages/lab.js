import React, { Component } from 'react';
import { Container, Header, Form, Input, Button, Message, Segment, Grid, Modal, TextArea, Label, Table } from 'semantic-ui-react';
import { withRouter } from 'next/router';
import web3 from "../ethereum/web3";
import cpuContract from "../ethereum/cpuProduction";
import dynamic from "next/dynamic";
import QrScanner from "qr-scanner";
import AllCPUs from "../components/CPUsTable";
import registerContract from "../ethereum/register";

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
            cpuLabNumber: "",
            labAssistantLabNumber: "",
            productionDate: "",
            isModalOpen: false,
            complaintMessage: "",
            submittingComplaint: false,
            showComplaintsModal: false,
            complaints: [],
            loadingComplaints: false,
            statusFilter: 'all'
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
            const labDetails = await registerContract.methods.getLabAssistantDetails(accounts[0]).call();
            console.log("Lab Details:", labDetails);
            this.setState({
                labAssistantLabNumber: labDetails[3],
            });


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
                    cpuLabNumber: cpuDetails.labNumber,
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
            errorMessage: "",
            cpuLabNumber: ""
        });
    };

    handleOpenModal = () => {
        this.setState({ isModalOpen: true });
    }

    handleCloseModal = () => {
        this.setState({ isModalOpen: false, complaintMessage: "", errorMessage: "" });
    }

    handleSubmitComplaint = async () => {
        const { cpuAddress, cpuModel, cpuSerial, complaintMessage, cpuLabNumber } = this.state;

        try {
            if (!cpuAddress || !cpuModel || !cpuSerial || !complaintMessage || !cpuLabNumber) {
                throw new Error('All fields are required');
            }

            this.setState({ submittingComplaint: true });

            const labAssistantName = localStorage.getItem('userName');

            console.log('Sending complaint data:', {
                cpuAddress,
                modelName: cpuModel,
                serialNumber: cpuSerial,
                message: complaintMessage,
                labAssistantName: labAssistantName,
                labNumber: cpuLabNumber
            });

            const response = await fetch('http://localhost:4000/api/complaints/submit', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({
                    cpuAddress,
                    modelName: cpuModel,
                    serialNumber: cpuSerial,
                    message: complaintMessage,
                    labAssistantName: labAssistantName,
                    labNumber: cpuLabNumber
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to submit complaint');
            }

            const data = await response.json();
            console.log('Response:', data);

            this.setState({
                successMessage: "Complaint submitted successfully",
                isModalOpen: false,
                complaintMessage: ""
            });

        } catch (error) {
            console.error('Error submitting complaint:', error);
            this.setState({
                errorMessage: error.message || 'Error submitting the issue, check if resubmitted issue (not allowed)'
            });
        } finally {
            this.setState({ submittingComplaint: false });
        }
    }

    fetchComplaints = async () => {
        try {
            this.setState({ loadingComplaints: true });
            const { labAssistantLabNumber } = this.state;

            const response = await fetch('http://localhost:4000/api/complaints/getComplaints', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch complaints');
            }

            const allComplaints = await response.json();
            // Filter complaints by lab assistant's lab number
            const filteredComplaints = allComplaints.filter(
                complaint => complaint.labNumber === labAssistantLabNumber
            );

            this.setState({ complaints: filteredComplaints });
        } catch (error) {
            console.error('Error fetching complaints:', error);
        } finally {
            this.setState({ loadingComplaints: false });
        }
    };

    handleOpenComplaintsModal = async () => {
        await this.fetchComplaints();
        this.setState({ showComplaintsModal: true });
    };

    getFilteredComplaints = () => {
        const { complaints, statusFilter } = this.state;
        if (statusFilter === 'all') return complaints;
        return complaints.filter(complaint => complaint.status === statusFilter);
    };

    render() {
        const {
            components,
            qrScanned,
            cpuModel,
            cpuSerial,
            cpuStatus,
            errorMessage,
            cpuLabNumber,
            labAssistantLabNumber,
            showComplaintsModal,
            complaints,
            loadingComplaints
        } = this.state;

        return (
            <Container>
                <link
                    rel="stylesheet"
                    href="//cdn.jsdelivr.net/npm/semantic-ui@2.4.1/dist/semantic.min.css"
                />

                {!qrScanned && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Header as="h1" textAlign="center" style={{ marginTop: "1em", flex: 1 }}>
                            Lab Assistant Dashboard
                        </Header>
                        <Button
                            icon="warning circle"
                            content="View Reported Issues"
                            color="orange"
                            onClick={this.handleOpenComplaintsModal}
                        />
                    </div>
                )}

                {qrScanned && (
                    <>
                        <Header as="h1" textAlign="center" style={{ marginTop: "1em" }}>
                            Lab Assistant - View Components
                        </Header>
                        <div style={{ marginBottom: "1em" }}>
                            <Button
                                icon="arrow left"
                                content="Back to Scanner"
                                color="blue"
                                onClick={this.handleBack}
                                style={{ marginRight: "1em" }}
                            />
                            <Button
                                icon="warning circle"
                                content="Report Issue"
                                color="red"
                                onClick={this.handleOpenModal}
                            />
                        </div>
                    </>)}

                <Grid centered style={{ marginTop: "2em" }}>
                    <Grid.Column width="100%">
                        {!qrScanned ? (
                            <>
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
                                                <AllCPUs cpuLabNumber={labAssistantLabNumber} />
                                            </Grid.Column>
                                        </Grid.Row>
                                    </Grid>
                                </Segment>
                            </>
                        ) : (
                            <>

                                <Form>
                                    <Form.Group widths="equal">
                                        <Form.Field>
                                            <label>Lab Number</label>
                                            <Input readOnly value={cpuLabNumber} />
                                        </Form.Field>
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

                <Modal
                    open={this.state.isModalOpen}
                    onClose={this.handleCloseModal}
                    size="small"
                >
                    <Modal.Header>Report CPU Issue</Modal.Header>
                    <Modal.Content>
                        {this.state.errorMessage && (
                            <Message error>
                                {this.state.errorMessage}
                            </Message>
                        )}
                        <Form>
                            <Form.Field>
                                <label>CPU Model</label>
                                <Input value={cpuModel} readOnly />
                            </Form.Field>
                            <Form.Field>
                                <label>Serial Number</label>
                                <Input value={cpuSerial} readOnly />
                            </Form.Field>
                            <Form.Field>
                                <label>Lab Number</label>
                                <Input value={cpuLabNumber} readOnly />
                            </Form.Field>
                            <Form.Field>
                                <label>Issue Description</label>
                                <TextArea
                                    placeholder="Describe the issue..."
                                    value={this.state.complaintMessage}
                                    onChange={(e) => this.setState({ complaintMessage: e.target.value })}
                                    style={{ minHeight: 100 }}
                                />
                            </Form.Field>
                        </Form>
                    </Modal.Content>
                    <Modal.Actions>
                        <Button color='black' onClick={this.handleCloseModal}>
                            Cancel
                        </Button>
                        <Button
                            positive
                            icon='checkmark'
                            labelPosition='right'
                            content='Submit'
                            onClick={this.handleSubmitComplaint}
                            loading={this.state.submittingComplaint}
                            disabled={!this.state.complaintMessage.trim()}
                        />
                    </Modal.Actions>
                </Modal>

                <Modal
                    open={showComplaintsModal}
                    onClose={() => this.setState({ showComplaintsModal: false })}
                    size="large"
                >
                    <Modal.Header>Reported CPU Issues</Modal.Header>
                    <Modal.Content>
                        <div style={{ marginBottom: '1em' }}>
                            <Button.Group>
                                <Button
                                    active={this.state.statusFilter === 'all'}
                                    onClick={() => this.setState({ statusFilter: 'all' })}
                                >
                                    All
                                </Button>
                                <Button
                                    active={this.state.statusFilter === 'pending'}
                                    onClick={() => this.setState({ statusFilter: 'pending' })}
                                    color="yellow"
                                >
                                    Pending
                                </Button>
                                <Button
                                    active={this.state.statusFilter === 'resolved'}
                                    onClick={() => this.setState({ statusFilter: 'resolved' })}
                                    color="green"
                                >
                                    Resolved
                                </Button>
                            </Button.Group>
                        </div>

                        {loadingComplaints ? (
                            <div>Loading complaints...</div>
                        ) : this.getFilteredComplaints().length === 0 ? (
                            <div>No {this.state.statusFilter !== 'all' ? this.state.statusFilter : ''} issues reported</div>
                        ) : (
                            <div style={{ maxHeight: "400px", minHeight: "350px", overflowY: "auto" }}>
                                <Table celled>
                                    <Table.Header>
                                        <Table.Row>
                                            <Table.HeaderCell>CPU Model</Table.HeaderCell>
                                            <Table.HeaderCell>Serial Number</Table.HeaderCell>
                                            <Table.HeaderCell>Issue Description</Table.HeaderCell>
                                            {/* <Table.HeaderCell>Reported By</Table.HeaderCell> */}
                                            <Table.HeaderCell>Date</Table.HeaderCell>
                                            <Table.HeaderCell>Status</Table.HeaderCell>
                                        </Table.Row>
                                    </Table.Header>

                                    <Table.Body>
                                        {this.getFilteredComplaints().map(complaint => (
                                            <Table.Row key={complaint._id}>
                                                <Table.Cell>{complaint.modelName}</Table.Cell>
                                                <Table.Cell>{complaint.serialNumber}</Table.Cell>
                                                <Table.Cell>{complaint.message}</Table.Cell>
                                                {/* <Table.Cell>{complaint.labAssistantName}</Table.Cell> */}
                                                <Table.Cell>
                                                    {new Date(complaint.createdAt).toLocaleDateString()}
                                                </Table.Cell>
                                                <Table.Cell>
                                                    <Label
                                                        color={complaint.status === 'pending' ? 'yellow' : 'green'}
                                                        style={{ textTransform: 'capitalize', width: '100%', height: '35px', alignContent: 'center', textAlign: 'center' }}
                                                    >
                                                        {complaint.status}
                                                    </Label>
                                                </Table.Cell>
                                            </Table.Row>
                                        ))}
                                    </Table.Body>
                                </Table>
                            </div>
                        )}
                    </Modal.Content>
                    <Modal.Actions>
                        <Button
                            color="black"
                            onClick={() => this.setState({ showComplaintsModal: false })}
                        >
                            Close
                        </Button>
                    </Modal.Actions>
                </Modal>
            </Container>
        );
    }
}

export default withRouter(LabPage);