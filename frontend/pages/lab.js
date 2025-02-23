import React, { useState, useEffect } from 'react';
import { Container, Header, Form, Input, Button, Message, Segment, Grid, Modal, TextArea, Label, Table, Icon } from 'semantic-ui-react';
import { useRouter } from 'next/router';
import web3 from "../ethereum/web3";
import cpuContract from "../ethereum/cpuProduction";
import dynamic from "next/dynamic";
import QrScanner from "qr-scanner";
import AllCPUs from "../components/CPUsTable";
import registerContract from "../ethereum/register";
import { useAuth } from '../context/AuthContext';

const QrReader = dynamic(() => import("react-qr-reader"), { ssr: false });

const LabPage = () => {
    const router = useRouter();
    const { isAuthenticated, userRole, walletAddress } = useAuth();

    const [state, setState] = useState({
        cpuAddress: "",
        components: [],
        errorMessage: "",
        successMessage: "",
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
    });

    useEffect(() => {
        const checkAuth = async () => {
            try {
                const accounts = await web3.eth.getAccounts();

                if (!isAuthenticated || userRole !== 'labassistant') {
                    router.push('/unauthorized');
                    return;
                }

                if (!accounts || !accounts[0]) {
                    router.push('/connect-wallet');
                    return;
                }

                if (accounts[0].toLowerCase() !== walletAddress?.toLowerCase()) {
                    router.push('/connect-wallet');
                    return;
                }

                const labDetails = await registerContract.methods.getLabAssistantDetails(accounts[0]).call();
                console.log("Lab Details:", labDetails);

                setState(prev => ({
                    ...prev,
                    labAssistantLabNumber: labDetails[3]
                }));

            } catch (error) {
                console.error('Error checking authentication:', error);
                router.push('/unauthorized');
            }
        };

        checkAuth();
    }, [isAuthenticated, userRole, walletAddress]);

    const handleScan = async (data) => {
        if (data) {
            await fetchCPUDetails(data.trim());
        }
    };

    const handleError = (err) => {
        setState(prev => ({ ...prev, errorMessage: err.message }));
    };

    const handleFileUpload = async (event) => {
        try {
            const file = event.target.files[0];
            if (!file) return;

            const result = await QrScanner.scanImage(file, {
                returnDetailedScanResult: false,
            });
            console.log("QR code content from uploaded image:", result);

            if (result) {
                await fetchCPUDetails(result.data.trim());
            }
        } catch (error) {
            console.error("Error scanning uploaded image:", error);
            setState(prev => ({
                ...prev,
                errorMessage: "Could not detect a valid QR code in the image.",
            }));
        }
    };

    const fetchCPUDetails = async (cpuAddress) => {
        try {
            if (!cpuAddress) {
                setState(prev => ({ ...prev, showMessage: true, errorMessage: "Please enter a valid CPU address." }));
                return;
            }
            setState(prev => ({ ...prev, cpuAddress, qrScanned: true }));

            const cpuDetails = await cpuContract.methods.getCPU(cpuAddress).call();
            console.log("Fetched CPU Details:", cpuDetails);

            if (cpuDetails) {
                setState(prev => ({
                    ...prev,
                    cpuModel: cpuDetails.modelName,
                    cpuSerial: cpuDetails.serialNumber,
                    cpuStatus: cpuDetails.status,
                    cpuLabNumber: cpuDetails.labNumber,
                    components: cpuDetails.components,
                    productionDate: new Date(parseInt(cpuDetails.productionDate) * 1000).toLocaleDateString()
                }));
            } else {
                console.log("No CPU details found or invalid data format.");
            }
        } catch (err) {
            console.error("Error fetching CPU details:", err);
            setState(prev => ({ ...prev, errorMessage: "Error fetching CPU details." }));
        }
    };

    const handleBack = () => {
        setState(prev => ({
            ...prev,
            qrScanned: false,
            cpuAddress: "",
            cpuModel: "",
            cpuSerial: "",
            cpuStatus: "",
            components: [],
            productionDate: "",
            errorMessage: "",
            cpuLabNumber: ""
        }));
    };

    const handleOpenModal = () => {
        setState(prev => ({ ...prev, isModalOpen: true }));
    };

    const handleCloseModal = () => {
        setState(prev => ({
            ...prev,
            isModalOpen: false,
            complaintMessage: "",
            errorMessage: ""
        }));
    };

    const handleSubmitComplaint = async () => {
        const { cpuAddress, cpuModel, cpuSerial, complaintMessage, cpuLabNumber } = state;

        try {
            if (!cpuAddress || !cpuModel || !cpuSerial || !complaintMessage || !cpuLabNumber) {
                throw new Error('All fields are required');
            }

            setState(prev => ({ ...prev, submittingComplaint: true }));

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

            setState(prev => ({
                ...prev,
                successMessage: "Complaint submitted successfully",
                isModalOpen: false,
                complaintMessage: ""
            }));

        } catch (error) {
            console.error('Error submitting complaint:', error);
            setState(prev => ({
                ...prev,
                errorMessage: error.message || 'Error submitting the issue, check if resubmitted issue (not allowed)'
            }));
        } finally {
            setState(prev => ({ ...prev, submittingComplaint: false }));
        }
    };

    const fetchComplaints = async () => {
        try {
            setState(prev => ({ ...prev, loadingComplaints: true }));
            const { labAssistantLabNumber } = state;

            const response = await fetch('http://localhost:4000/api/complaints/getComplaints', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch complaints');
            }

            const allComplaints = await response.json();
            const filteredComplaints = Array.isArray(allComplaints)
                ? allComplaints.filter(complaint => complaint.labNumber === labAssistantLabNumber)
                : [];

            setState(prev => ({
                ...prev,
                complaints: filteredComplaints,
                loadingComplaints: false
            }));
        } catch (error) {
            console.error('Error fetching complaints:', error);
            setState(prev => ({
                ...prev,
                complaints: [],
                loadingComplaints: false,
                errorMessage: 'Failed to fetch complaints'
            }));
        }
    };

    const handleOpenComplaintsModal = async () => {
        setState(prev => ({ ...prev, showComplaintsModal: true }));
        await fetchComplaints();
    };

    const getFilteredComplaints = () => {
        const { complaints = [], statusFilter } = state;
        if (!Array.isArray(complaints)) return [];
        if (statusFilter === 'all') return complaints;
        return complaints.filter(complaint => complaint.status === statusFilter);
    };

    return (
        <Container>

            {!state.qrScanned && (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Header as="h1" textAlign="center" style={{ marginTop: "1em", flex: 1 }}>
                        Lab Assistant Dashboard
                    </Header>
                    <Button
                        icon="warning circle"
                        content="View Reported Issues"
                        color="orange"
                        onClick={handleOpenComplaintsModal}
                    />
                </div>
            )}

            {state.qrScanned && (
                <>
                    {state.labAssistantLabNumber !== state.cpuLabNumber ? (
                        <>
                            <Button
                                icon="arrow left"
                                content="Back to Scanner"
                                color="blue"
                                onClick={handleBack}
                                style={{ marginBottom: "1em" }}
                            />
                            <Segment placeholder basic>
                                <Message
                                    error
                                    icon
                                    size="large"
                                    style={{ maxWidth: "500px", margin: "0 auto" }}
                                >
                                    <Icon name="warning circle" />
                                    <Message.Content>
                                        <Message.Header>Access Denied</Message.Header>
                                        <p>This CPU belongs to Lab #{state.cpuLabNumber} and cannot be accessed from Lab #{state.labAssistantLabNumber}.</p>
                                        <p>Please scan a CPU that belongs to your assigned laboratory.</p>
                                    </Message.Content>
                                </Message>
                            </Segment>
                        </>
                    ) : (
                        <>
                            <Header as="h1" textAlign="center" style={{ marginTop: "1em" }}>
                                Lab Assistant - View Components
                            </Header>
                            <div style={{ marginBottom: "1em", display: "flex", justifyContent: "space-between" }}>
                                <Button
                                    icon="arrow left"
                                    content="Back to Scanner"
                                    color="blue"
                                    onClick={handleBack}
                                    style={{ marginRight: "1em" }}
                                />
                                <Button
                                    icon="warning circle"
                                    content="Report Issue"
                                    color="red"
                                    onClick={handleOpenModal}
                                />
                            </div>
                        </>
                    )}
                </>
            )}

            <Grid centered style={{ marginTop: "2em" }}>
                <Grid.Column width="100%">
                    {!state.qrScanned ? (
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
                                                onScan={handleScan}
                                                onError={handleError}
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
                                                    onChange={handleFileUpload}
                                                />
                                            </div>

                                            <Segment basic style={{ marginTop: "2em" }}>
                                                <Header as="h3" textAlign="center">
                                                    Or Enter CPU Address Manually
                                                </Header>
                                                <Form onSubmit={(e) => {
                                                    e.preventDefault();
                                                    fetchCPUDetails(state.cpuAddress);
                                                }} style={{ display: "flex", justifyContent: "space-between" }}>
                                                    <Form.Field style={{ width: "77%" }}>
                                                        <Input
                                                            placeholder="Enter CPU Address..."
                                                            value={state.cpuAddress}
                                                            onChange={(e) => setState(prev => ({
                                                                ...prev,
                                                                cpuAddress: e.target.value
                                                            }))}
                                                            fluid
                                                        />
                                                    </Form.Field>
                                                    <Form.Field style={{ width: "20%" }}>
                                                        <Button
                                                            color="blue"
                                                            type="submit"
                                                        >
                                                            Search
                                                        </Button>
                                                    </Form.Field>
                                                </Form>
                                            </Segment>
                                        </Grid.Column>

                                        <Grid.Column>
                                            <AllCPUs cpuLabNumber={state.labAssistantLabNumber} />
                                        </Grid.Column>
                                    </Grid.Row>
                                </Grid>
                            </Segment>
                        </>
                    ) : (
                        <>
                            {state.labAssistantLabNumber === state.cpuLabNumber && (
                                <>
                                    <Form>
                                        <Form.Group widths="equal">
                                            <Form.Field>
                                                <label>Lab Number</label>
                                                <Input readOnly value={state.cpuLabNumber} />
                                            </Form.Field>
                                            <Form.Field>
                                                <label>Model</label>
                                                <Input readOnly value={state.cpuModel} />
                                            </Form.Field>
                                            <Form.Field>
                                                <label>Serial</label>
                                                <Input readOnly value={state.cpuSerial} />
                                            </Form.Field>
                                            <Form.Field>
                                                <label>Status</label>
                                                <Input readOnly value={state.cpuStatus} />
                                            </Form.Field>
                                            <Form.Field>
                                                <label>Production Date</label>
                                                <Input readOnly value={state.productionDate} />
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

                                        <Form error={!!state.errorMessage} style={{ marginTop: "1em", width: "100%" }}>
                                            {state.components.map((component, idx) => (
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
                                                content={state.errorMessage}
                                            />
                                        </Form>
                                    </div>
                                </>
                            )}
                        </>
                    )}
                </Grid.Column>
            </Grid>

            <Modal
                open={state.isModalOpen}
                onClose={() => setState(prev => ({ ...prev, isModalOpen: false }))}
            >
                <Modal.Header>Report CPU Issue</Modal.Header>
                <Modal.Content>
                    {state.errorMessage && (
                        <Message error>
                            {state.errorMessage}
                        </Message>
                    )}
                    <Form>

                        <Form.Field>
                            <label>CPU Model</label>
                            <Input value={state.cpuModel} readOnly />
                        </Form.Field>
                        <Form.Field>
                            <label>Serial Number</label>
                            <Input value={state.cpuSerial} readOnly />
                        </Form.Field>
                        <Form.Field>
                            <label>Lab Number</label>
                            <Input value={state.cpuLabNumber} readOnly />
                        </Form.Field>
                        <Form.TextArea
                            label="Issue Description"
                            placeholder="Describe the issue..."
                            value={state.complaintMessage || ''}
                            onChange={(e) => setState(prev => ({
                                ...prev,
                                complaintMessage: e.target.value
                            }))}
                            required
                        />
                    </Form>
                </Modal.Content>
                <Modal.Actions>
                    <Button color="black" onClick={() => setState(prev => ({
                        ...prev,
                        isModalOpen: false,
                        complaintMessage: ''
                    }))}>
                        Cancel
                    </Button>
                    <Button
                        color="green"
                        onClick={handleSubmitComplaint}
                        loading={state.submittingComplaint}
                        disabled={!(state.complaintMessage || '').trim()}
                    >
                        Submit
                    </Button>
                </Modal.Actions>
            </Modal>

            <Modal
                open={state.showComplaintsModal}
                onClose={() => setState(prev => ({ ...prev, showComplaintsModal: false }))}
                size="large"
            >
                <Modal.Header>Reported CPU Issues</Modal.Header>
                <Modal.Content>
                    <div style={{ marginBottom: '1em' }}>
                        <Button.Group>
                            <Button
                                active={state.statusFilter === 'all'}
                                onClick={() => setState(prev => ({ ...prev, statusFilter: 'all' }))}
                            >
                                All
                            </Button>
                            <Button
                                active={state.statusFilter === 'pending'}
                                onClick={() => setState(prev => ({ ...prev, statusFilter: 'pending' }))}
                                color="yellow"
                            >
                                Pending
                            </Button>
                            <Button
                                active={state.statusFilter === 'resolved'}
                                onClick={() => setState(prev => ({ ...prev, statusFilter: 'resolved' }))}
                                color="green"
                            >
                                Resolved
                            </Button>
                        </Button.Group>
                    </div>

                    {state.loadingComplaints ? (
                        <div>Loading complaints...</div>
                    ) : getFilteredComplaints().length === 0 ? (
                        <div>No {state.statusFilter !== 'all' ? state.statusFilter : ''} issues reported</div>
                    ) : (
                        <div style={{ maxHeight: "400px", minHeight: "350px", overflowY: "auto" }}>
                            <Table celled>
                                <Table.Header>
                                    <Table.Row>
                                        <Table.HeaderCell>CPU Model</Table.HeaderCell>
                                        <Table.HeaderCell>Serial Number</Table.HeaderCell>
                                        <Table.HeaderCell>Issue Description</Table.HeaderCell>
                                        <Table.HeaderCell>Date</Table.HeaderCell>
                                        <Table.HeaderCell>Status</Table.HeaderCell>
                                    </Table.Row>
                                </Table.Header>

                                <Table.Body>
                                    {getFilteredComplaints().map(complaint => (
                                        <Table.Row key={complaint._id}>
                                            <Table.Cell>{complaint.modelName}</Table.Cell>
                                            <Table.Cell>{complaint.serialNumber}</Table.Cell>
                                            <Table.Cell>{complaint.message}</Table.Cell>
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
                        onClick={() => setState(prev => ({ ...prev, showComplaintsModal: false }))}
                    >
                        Close
                    </Button>
                </Modal.Actions>
            </Modal>
        </Container>
    );
};

export default LabPage;