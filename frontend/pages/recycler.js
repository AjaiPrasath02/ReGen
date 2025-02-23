import React, { useState, useEffect } from "react";
import {
    Button,
    Message,
    Form,
    Container,
    Grid,
    Input,
    Segment,
    Header,
    Table,
    Modal,
    Label
} from "semantic-ui-react";
import { useRouter } from "next/router";
import web3 from "../ethereum/web3";
import cpuContract from "../ethereum/cpuProduction";
import dynamic from "next/dynamic";
import AllCPUs from "../components/CPUsTable";
import QrScanner from "qr-scanner";
import { useAuth } from '../context/AuthContext';

const QrReader = dynamic(() => import("react-qr-reader"), { ssr: false });

const TechnicianPage = () => {
    const router = useRouter();
    const { isAuthenticated, userRole, walletAddress } = useAuth();

    const [state, setState] = useState({
        cpuAddress: "",
        components: [],
        loading: false,
        loadingButton: null,
        componentDetails: {
            Processor: "",
            RAM: "",
            "Hard Disk": "",
            Motherboard: "",
            PSU: "",
        },
        errorMessage: "",
        successMessage: "",
        qrScanned: false,
        cpuModel: "",
        cpuSerial: "",
        cpuStatus: "",
        cpuLabNumber: "",
        productionDate: "",
        complaints: [],
        loadingComplaints: false,
        showComplaintsModal: false,
        resolvingComplaint: false,
        showMessage: false,
        messageTimeout: null,
        statusFilter: 'all'
    });

    useEffect(() => {
        const checkAuth = async () => {
            try {
                const accounts = await web3.eth.getAccounts();

                if (!isAuthenticated || userRole !== 'technician') {
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
            } catch (error) {
                console.error('Error checking authentication:', error);
                router.push('/unauthorized');
            }
        };

        checkAuth();
        return () => {
            if (state.messageTimeout) {
                clearTimeout(state.messageTimeout);
            }
        };
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
                errorMessage: "Could not detect a valid QR code in the image."
            }));
        }
    };

    const fetchCPUDetails = async (cpuAddress) => {
        try {
            if (!cpuAddress) {
                setState(prev => ({
                    ...prev,
                    showMessage: true,
                    errorMessage: "Please enter a valid CPU address."
                }));
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
            }
        } catch (err) {
            console.error("Error fetching CPU details:", err);
            setState(prev => ({ ...prev, errorMessage: "Error fetching CPU details." }));
        }
    };

    const handleComponentAction = async (componentIndex, action) => {
        setState(prev => ({
            ...prev,
            loading: true,
            loadingButton: `${action}-${componentIndex}`,
            errorMessage: "",
            successMessage: ""
        }));

        try {
            const accounts = await web3.eth.getAccounts();
            await cpuContract.methods
                .updateComponentStatus(state.cpuAddress, componentIndex, action)
                .send({ from: accounts[0] });

            // Refresh CPU details
            await fetchCPUDetails(state.cpuAddress);

            setState(prev => ({
                ...prev,
                successMessage: `Component ${action} successfully!`
            }));

            // Clear success message after 3 seconds
            const timeout = setTimeout(() => {
                setState(prev => ({ ...prev, successMessage: "" }));
            }, 3000);

            setState(prev => ({ ...prev, messageTimeout: timeout }));

        } catch (err) {
            setState(prev => ({
                ...prev,
                errorMessage: err.message
            }));
        } finally {
            setState(prev => ({
                ...prev,
                loading: false,
                loadingButton: null
            }));
        }
    };

    const fetchComplaints = async () => {
        try {
            setState(prev => ({ ...prev, loadingComplaints: true }));

            const response = await fetch('http://localhost:4000/api/complaints/getComplaints', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch complaints');
            }

            const complaints = await response.json();
            setState(prev => ({ ...prev, complaints }));
        } catch (error) {
            console.error('Error fetching complaints:', error);
        } finally {
            setState(prev => ({ ...prev, loadingComplaints: false }));
        }
    };

    const handleResolveComplaint = async (complaintId) => {
        try {
            setState(prev => ({ ...prev, resolvingComplaint: true }));

            const response = await fetch(`http://localhost:4000/api/complaints/resolve/${complaintId}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (!response.ok) {
                throw new Error('Failed to resolve complaint');
            }

            // Refresh complaints list
            await fetchComplaints();
        } catch (error) {
            console.error('Error resolving complaint:', error);
        } finally {
            setState(prev => ({ ...prev, resolvingComplaint: false }));
        }
    };

    const getFilteredComplaints = () => {
        const { complaints, statusFilter } = state;
        if (statusFilter === 'all') return complaints;
        return complaints.filter(complaint => complaint.status === statusFilter);
    };

    return (
        <>
            {state.showMessage && (
                <Modal
                    basic
                    open={true}
                    onClose={() => setState(prev => ({ ...prev, showMessage: false }))}
                    size='small'
                    style={{
                        position: 'fixed',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        width: '300px'
                    }}
                >
                    <Modal.Content>
                        <Message
                            success={!!state.successMessage}
                            error={!!state.errorMessage}
                            onDismiss={() => setState(prev => ({ ...prev, showMessage: false }))}
                        >
                            <Message.Header>
                                {state.successMessage ? 'Success' : 'Error'}
                            </Message.Header>
                            <p>{state.successMessage || state.errorMessage}</p>
                        </Message>
                    </Modal.Content>
                </Modal>
            )}

            <Container>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Header as="h1" textAlign="center" style={{ marginTop: "1em", flex: 1 }}>
                        Technician - Update/Remove Components
                    </Header>
                    <Button
                        icon="warning circle"
                        content="View Reported Issues"
                        color="orange"
                        onClick={() => {
                            setState(prev => ({ ...prev, showComplaintsModal: true }));
                            fetchComplaints();
                        }}
                    />
                </div>

                {/* Add Back Button when QR is scanned */}
                {state.qrScanned && (
                    <Button
                        icon="arrow left"
                        content="Back to Scanner"
                        color="blue"
                        onClick={() => setState(prev => ({
                            ...prev,
                            qrScanned: false,
                            cpuAddress: "",
                            cpuModel: "",
                            cpuSerial: "",
                            cpuStatus: "",
                            components: [],
                            productionDate: "",
                            errorMessage: "",
                            successMessage: "",
                            cpuLabNumber: ""
                        }))}
                        style={{ marginBottom: "1em", marginTop: "1em" }}
                    />
                )}

                <Grid centered style={{ marginTop: "1em", marginBottom: "1em" }}>
                    <Grid.Column width="100%">
                        {/* If not scanned yet, show QR Reader + Upload option */}
                        {!state.qrScanned ? (
                            <Segment>
                                <Grid stackable columns={2}>
                                    <Grid.Row style={{ paddingRight: "3em" }}>
                                        {/* LEFT COLUMN: QR scanning + upload */}
                                        <Grid.Column>
                                            <Header as="h2" style={{ marginTop: "10px" }} textAlign="center">
                                                Scan or Upload QR Code
                                            </Header>

                                            {/* 1) Camera-based scanning */}
                                            <QrReader
                                                delay={1000}
                                                style={{ width: "100%", maxWidth: "400px", margin: "0 auto" }}
                                                onScan={handleScan}
                                                onError={handleError}
                                            />

                                            <div style={{ marginTop: "1.5em", textAlign: "center" }}>
                                                <Button as="label" htmlFor="file" type="button" color="green"
                                                    style={{
                                                        backgroundColor: "#21ba45", // the 'green' shade
                                                        color: "#fff"               // white text
                                                    }}
                                                >
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
                                                            onChange={(e) => setState(prev => ({ ...prev, cpuAddress: e.target.value }))}
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

                                        {/* RIGHT COLUMN: AllCPUs component */}
                                        <Grid.Column>
                                            <AllCPUs />
                                            <center>
                                                <Button
                                                    color="blue"
                                                    style={{ marginTop: '2em', marginBottom: '2em' }}
                                                    // onClick={async () => {
                                                    //     try {
                                                    //         const accounts = await web3.eth.getAccounts();
                                                    //         const allCPUs = await cpuContract.methods.getAllCPUDetails().call({
                                                    //           from: accounts[0],
                                                    //         });

                                                    //         const formattedCPUs = allCPUs.map(cpu => ({
                                                    //           modelName: cpu.modelName,
                                                    //           serialNumber: cpu.serialNumber,
                                                    //           status: cpu.status,
                                                    //           productionDate: cpu.productionDate.toString(), // Convert BigInt to string
                                                    //           cpuAddress: cpu.cpuAddress,
                                                    //           manufacturerID: cpu.manufacturerID.toString(), // Convert BigInt to string
                                                    //           components: cpu.components.map(comp => ({
                                                    //             componentID: comp.componentID.toString(), // Convert BigInt to string
                                                    //             componentType: comp.componentType,
                                                    //             details: comp.details,
                                                    //             status: comp.status,
                                                    //             cpuAddress: comp.cpuAddress
                                                    //           }))
                                                    //         }));
                                                    //     } catch (error) {
                                                    //         console.error("Error fetching CPU data:", error);
                                                    //         this.setState({ errorMessage: "Error fetching CPU data for visualization" });
                                                    //     }
                                                    // }}
                                                    onClick={async () => {
                                                        try {
                                                            const response = await fetch('/cpuData.json');
                                                            const formattedCPUs = await response.json();
                                                            router.push({
                                                                pathname: '/visualization',
                                                                query: { cpuArray: JSON.stringify(formattedCPUs) }
                                                            });
                                                        } catch (error) {
                                                            console.error("Error fetching CPU data:", error);
                                                            setState(prev => ({ ...prev, errorMessage: "Error fetching CPU data for visualization" }));
                                                        }
                                                    }}
                                                >
                                                    View All CPUs Visualization
                                                </Button>
                                            </center>
                                        </Grid.Column>
                                    </Grid.Row>
                                </Grid>
                            </Segment>
                        ) : (
                            <>
                                {/* Top row: Model, Serial, Status */}
                                <Form>
                                    <Form.Group widths="equal">
                                        <Form.Field>
                                            <label>Model</label>
                                            <Input readOnly placeholder="Model" value={state.cpuModel} />
                                        </Form.Field>
                                        <Form.Field>
                                            <label>Serial</label>
                                            <Input readOnly placeholder="Serial" value={state.cpuSerial} />
                                        </Form.Field>
                                        <Form.Field>
                                            <label>Status</label>
                                            <Input readOnly placeholder="Status" value={state.cpuStatus} />
                                        </Form.Field>
                                        <Form.Field>
                                            <label>Production Date</label>
                                            <Input readOnly placeholder="Production Date" value={state.productionDate} />
                                        </Form.Field>
                                    </Form.Group>
                                </Form>

                                <Form>
                                    <Form.Group style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between" }}>
                                        <Form.Field width={"100%"} style={{ flex: "1" }}>
                                            <label>Lab Number</label>
                                            <Input placeholder="Lab Number" value={state.cpuLabNumber} onChange={(e) => setState(prev => ({ ...prev, cpuLabNumber: e.target.value }))} />
                                        </Form.Field>
                                        <Form.Field style={{
                                            display: "flex",
                                            alignItems: "flex-end",
                                            gap: "0.5em",
                                        }}>
                                            <Button
                                                color="green"
                                                onClick={() => handleComponentAction(null, "updateLabNumber")}
                                                loading={state.loadingButton === "updateLabNumber"}
                                            >
                                                Change Lab Number
                                            </Button>
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

                                    <Form
                                        error={!!state.errorMessage}
                                        success={!!state.successMessage}
                                        style={{ marginTop: "1em", width: "100%" }}
                                    >
                                        {state.components.map((component, idx) => (
                                            <Form.Group key={idx} style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between" }}>
                                                {/* Label & Input */}
                                                <Form.Field width={"100%"} style={{ flex: "1" }}>
                                                    <label>{component.componentType}</label>
                                                    <Input
                                                        placeholder={`Enter ${component.componentType} Details`}
                                                        value={component.details}
                                                        onChange={(e) =>
                                                            handleComponentAction(idx, e.target.value)
                                                        }
                                                    />
                                                </Form.Field>

                                                {/* Update / Remove / Status */}
                                                <Form.Field
                                                    style={{
                                                        display: "flex",
                                                        alignItems: "flex-end",
                                                        gap: "0.5em",
                                                    }}
                                                >
                                                    <Button
                                                        color="green"
                                                        onClick={() => handleComponentAction(idx, "update")}
                                                        loading={state.loadingButton === `update-${idx}`}
                                                    >
                                                        Update
                                                    </Button>

                                                    <Button
                                                        color="red"
                                                        disabled={component.status === "Removed"}
                                                        onClick={() => handleComponentAction(idx, "remove")}
                                                        loading={state.loadingButton === `remove-${idx}`}
                                                    >
                                                        Remove
                                                    </Button>

                                                    <Button color="orange" style={{ cursor: "default" }}>
                                                        {component.status}
                                                    </Button>
                                                </Form.Field>
                                            </Form.Group>
                                        ))}
                                    </Form>
                                </div>
                            </>
                        )}
                    </Grid.Column>
                </Grid>

                {/* Add Complaints Modal */}
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
                                            <Table.HeaderCell>Lab Number</Table.HeaderCell>
                                            <Table.HeaderCell>Issue Description</Table.HeaderCell>
                                            <Table.HeaderCell>Reported By</Table.HeaderCell>
                                            <Table.HeaderCell>Date</Table.HeaderCell>
                                            <Table.HeaderCell>Status</Table.HeaderCell>
                                            {state.statusFilter !== 'resolved' && state.statusFilter !== 'all' && (
                                                <Table.HeaderCell>Action</Table.HeaderCell>
                                            )}
                                        </Table.Row>
                                    </Table.Header>

                                    <Table.Body>
                                        {getFilteredComplaints().map(complaint => (
                                            <Table.Row key={complaint._id}>
                                                <Table.Cell>{complaint.modelName}</Table.Cell>
                                                <Table.Cell>{complaint.serialNumber}</Table.Cell>
                                                <Table.Cell>{complaint.labNumber}</Table.Cell>
                                                <Table.Cell>{complaint.message}</Table.Cell>
                                                <Table.Cell>{complaint.labAssistantName}</Table.Cell>
                                                <Table.Cell>
                                                    {new Date(complaint.createdAt).toLocaleDateString()}
                                                </Table.Cell>
                                                <Table.Cell>
                                                    <Label
                                                        color={complaint.status === 'pending' ? 'yellow' : 'green'}
                                                        style={{
                                                            textTransform: 'capitalize',
                                                            width: '100%',
                                                            height: '100%',
                                                            alignContent: 'center',
                                                            textAlign: 'center'
                                                        }}
                                                    >
                                                        {complaint.status}
                                                    </Label>
                                                </Table.Cell>
                                                {complaint.status === 'pending' && state.statusFilter !== 'all' && (
                                                    <Table.Cell>
                                                        <Button
                                                            color="green"
                                                            size="small"
                                                            onClick={() => handleResolveComplaint(complaint._id)}
                                                            loading={state.resolvingComplaint}
                                                            style={{ height: "100%", alignContent: "center", textAlign: "center" }}
                                                        >
                                                            Mark as Resolved
                                                        </Button>
                                                    </Table.Cell>
                                                )}
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
        </>
    );
};

export default TechnicianPage;
