import React, { Component } from "react";
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
    Modal
} from "semantic-ui-react";
import web3 from "../ethereum/web3";
import cpuContract from "../ethereum/cpuProduction";
import { withRouter } from "next/router";
import dynamic from "next/dynamic";
import AllCPUs from "../components/CPUsTable"
// 1) Import QrScanner
import QrScanner from "qr-scanner";

// 2) Dynamically import react-qr-reader (camera-based)
const QrReader = dynamic(() => import("react-qr-reader"), { ssr: false });

class TechnicianPage extends Component {
    constructor(props) {
        super(props);
        this.state = {
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
            isAuthenticated: false,
            userRole: null,
            userAddress: "",
            qrScanned: false,
            cpuModel: "",
            cpuSerial: "",
            cpuStatus: "",
            cpuLabNumber: "",
            productionDate: "",
            complaints: [],
            loadingComplaints: false,
            showComplaintsModal: false,
            resolvingComplaint: false
        };
    }

    componentDidMount = async () => {
        try {
            const token = localStorage.getItem("token");
            const role = localStorage.getItem("role");
            const userAddress = localStorage.getItem("userAddress");
            const accounts = await web3.eth.getAccounts();

            // Basic checks
            if (!token || !role || !userAddress) {
                this.props.router.push("/login");
                return;
            }

            if (role !== "technician") {
                this.props.router.push("/unauthorized");
                return;
            }

            if (!accounts || !accounts[0]) {
                this.props.router.push("/connect-wallet");
                return;
            }

            if (accounts[0].toLowerCase() !== userAddress.toLowerCase()) {
                this.props.router.push("/connect-wallet");
                return;
            }

            this.setState({
                isAuthenticated: true,
                userRole: role,
                userAddress: userAddress,
            });
        } catch (error) {
            this.props.router.push("/unauthorized");
        }
    };

    /**
     * Handle scanning from the camera (react-qr-reader onScan callback)
     */
    handleScan = async (data) => {
        if (data) {
            await this.fetchCPUDetails(data.trim());
        }
    };

    handleError = (err) => {
        this.setState({ errorMessage: err.message });
    };

    /**
     * Handle file upload for a QR code image.
     */
    handleFileUpload = async (event) => {
        try {
            const file = event.target.files[0];
            if (!file) return;

            // 3) Scan the uploaded image with QrScanner
            const result = await QrScanner.scanImage(file, {
                returnDetailedScanResult: false,
            });
            console.log("QR code content from uploaded image:", result);

            // If successful, fetch CPU details
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

    /**
     * Common method to fetch CPU details from the contract
     * once we have the QR code data (CPU address).
     */
    fetchCPUDetails = async (cpuAddress) => {
        try {
            this.setState({ cpuAddress, qrScanned: true });

            const cpuDetails = await cpuContract.methods.getCPU(cpuAddress).call();
            console.log("Fetched CPU Details:", cpuDetails);
            // console.log("date:", cpuDetails.productionDate);

            if (cpuDetails) {
                this.setState({
                    cpuModel: cpuDetails.modelName,
                    cpuSerial: cpuDetails.serialNumber,
                    cpuStatus: cpuDetails.status,
                    components: cpuDetails.components,
                    cpuLabNumber: cpuDetails.labNumber,
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

    // Update the text in components array
    handleComponentDetailsChange = (index, value) => {
        this.setState((prevState) => {
            const updatedComponents = [...prevState.components];
            updatedComponents[index] = {
                ...updatedComponents[index],
                details: value,
            };
            return { components: updatedComponents };
        });
    };

    changeLabNumber = async () => {
        const { cpuAddress, cpuLabNumber } = this.state;
        try {
          this.setState({
            loadingButton: "updateLabNumber",
            errorMessage: "",
            successMessage: "",
          });
          const accounts = await web3.eth.getAccounts();
      
          await cpuContract.methods
            .updateLabNumber(cpuAddress, cpuLabNumber)
            .send({ from: accounts[0] });
      
          // Optionally, re-fetch CPU details to update state if needed
          const cpuDetails = await cpuContract.methods.getCPU(cpuAddress).call();
          if (cpuDetails) {
            this.setState({
              cpuLabNumber: cpuDetails.labNumber,
              cpuStatus: cpuDetails.status,
            });
          }
      
          this.setState({
            successMessage: "Lab number updated successfully!",
          });
        } catch (err) {
          this.setState({ errorMessage: "Error updating lab number." });
        } finally {
          this.setState({ loadingButton: null });
        }
      };
      

    // Update a component in the contract
    updateComponentDetails = async (componentIndex) => {
        const { cpuAddress, components } = this.state;
        const updatedValue = components[componentIndex].details;
        const updatedComponentType = components[componentIndex].componentType;

        try {
            this.setState({
                loadingButton: `update-${componentIndex}`,
                errorMessage: "",
                successMessage: "",
            });
            const accounts = await web3.eth.getAccounts();

            await cpuContract.methods
                .updateComponent(cpuAddress, componentIndex, "Working", updatedValue)
                .send({ from: accounts[0] });

            // Re-fetch CPU details so state is up to date
            const cpuDetails = await cpuContract.methods.getCPU(cpuAddress).call();
            if (cpuDetails) {
                this.setState({
                    cpuStatus: cpuDetails.status,
                    components: cpuDetails.components,
                });
            }

            this.setState((prevState) => ({
                components: prevState.components.map((comp, idx) =>
                    idx === componentIndex ? { ...comp, status: "Working" } : comp
                ),
                successMessage: `${updatedComponentType} updated successfully!`,
            }));
        } catch (err) {
            this.setState({ errorMessage: "Error updating component." });
        } finally {
            this.setState({ loadingButton: null });
        }
    };

    // Remove a component
    removeComponent = async (componentIndex) => {
        const { cpuAddress, components } = this.state;
        const removedComponentType = components[componentIndex].componentType;

        try {
            this.setState({
                loadingButton: `remove-${componentIndex}`,
                errorMessage: "",
                successMessage: "",
            });
            const accounts = await web3.eth.getAccounts();

            await cpuContract.methods
                .removeComponent(cpuAddress, componentIndex)
                .send({ from: accounts[0] });

            // Re-fetch CPU details
            const cpuDetails = await cpuContract.methods.getCPU(cpuAddress).call();
            if (cpuDetails) {
                this.setState({
                    cpuStatus: cpuDetails.status,
                    components: cpuDetails.components,
                });
            }

            this.setState((prevState) => ({
                components: prevState.components.map((comp, idx) =>
                    idx === componentIndex ? { ...comp, status: "Removed" } : comp
                ),
                successMessage: `${removedComponentType} removed successfully!`,
            }));
        } catch (err) {
            this.setState({ errorMessage: "Error removing component." });
        } finally {
            this.setState({ loadingButton: null });
        }
    };

    // Helper to render the status icon
    renderStatusIcon = (status) => {
        switch (status) {
            case "Working":
                return "Working";
            case "Removed":
                return "Removed";
            default:
                return "Unknown";
        }
    };

    // Add this new method to handle going back
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
            successMessage: "",
            cpuLabNumber: ""
        });
    };

    fetchComplaints = async () => {
        try {
            this.setState({ loadingComplaints: true });
            const response = await fetch('http://localhost:4000/api/complaints/pending', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch complaints');
            }

            const complaints = await response.json();
            this.setState({ complaints });
        } catch (error) {
            console.error('Error fetching complaints:', error);
        } finally {
            this.setState({ loadingComplaints: false });
        }
    };

    handleResolveComplaint = async (complaintId) => {
        try {
            this.setState({ resolvingComplaint: true });
            const response = await fetch(`http://localhost:4000/api/complaints/resolve/${complaintId}`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (!response.ok) {
                throw new Error('Failed to resolve complaint');
            }

            // Refresh complaints list
            await this.fetchComplaints();
            this.setState({ successMessage: 'Complaint resolved successfully' });
        } catch (error) {
            this.setState({ errorMessage: error.message });
        } finally {
            this.setState({ resolvingComplaint: false });
        }
    };

    render() {
        const {
            components,
            qrScanned,
            cpuModel,
            cpuSerial,
            cpuStatus,
            cpuLabNumber,
            errorMessage,
            successMessage,
            loadingButton,
            complaints,
            loadingComplaints,
            showComplaintsModal
        } = this.state;

        return (
            <Container>
                <link
                    rel="stylesheet"
                    href="//cdn.jsdelivr.net/npm/semantic-ui@2.4.1/dist/semantic.min.css"
                />

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1em' }}>
                    <Header as="h1" textAlign="center" style={{ marginTop: "1em", flex: 1 }}>
                        Technician - Update/Remove Components
                    </Header>
                    <Button
                        icon="warning circle"
                        content="View Reported Issues"
                        color="orange"
                        onClick={() => {
                            this.setState({ showComplaintsModal: true });
                            this.fetchComplaints();
                        }}
                    />
                </div>

                {/* Add Back Button when QR is scanned */}
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
                        {/* If not scanned yet, show QR Reader + Upload option */}
                        {!qrScanned ? (
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
                                                onScan={this.handleScan}
                                                onError={this.handleError}

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
                                                    onChange={this.handleFileUpload}
                                                />
                                            </div>
                                        </Grid.Column>

                                        {/* RIGHT COLUMN: AllCPUs component */}
                                        <Grid.Column>
                                            {/* <Header as="h2" textAlign="center" style={{ marginTop: "10px" }}>
					  All CPUs
					</Header> */}
                                            <AllCPUs />

                                            <center>
                                                <Button
                                                    color="blue"
                                                    style={{ marginTop: '2em', marginBottom: '2em' }}
                                                    onClick={async () => {
                                                        try {
                                                            // const accounts = await web3.eth.getAccounts();
                                                            // const allCPUs = await cpuContract.methods.getAllCPUDetails().call({
                                                            //   from: accounts[0],
                                                            // });

                                                            // const formattedCPUs = allCPUs.map(cpu => ({
                                                            //   modelName: cpu.modelName,
                                                            //   serialNumber: cpu.serialNumber,
                                                            //   status: cpu.status,
                                                            //   productionDate: cpu.productionDate.toString(), // Convert BigInt to string
                                                            //   cpuAddress: cpu.cpuAddress,
                                                            //   manufacturerID: cpu.manufacturerID.toString(), // Convert BigInt to string
                                                            //   components: cpu.components.map(comp => ({
                                                            //     componentID: comp.componentID.toString(), // Convert BigInt to string
                                                            //     componentType: comp.componentType,
                                                            //     details: comp.details,
                                                            //     status: comp.status,
                                                            //     cpuAddress: comp.cpuAddress
                                                            //   }))
                                                            // }));
                                                            const response = await fetch('/cpuData.json');
                                                            const formattedCPUs = await response.json();
                                                            this.props.router.push({
                                                                pathname: '/visualization',
                                                                query: { cpuArray: JSON.stringify(formattedCPUs) }
                                                            });
                                                        } catch (error) {
                                                            console.error("Error fetching CPU data:", error);
                                                            this.setState({ errorMessage: "Error fetching CPU data for visualization" });
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
                                            <Input readOnly placeholder="Model" value={cpuModel} />
                                        </Form.Field>
                                        <Form.Field>
                                            <label>Serial</label>
                                            <Input readOnly placeholder="Serial" value={cpuSerial} />
                                        </Form.Field>
                                        <Form.Field>
                                            <label>Status</label>
                                            <Input readOnly placeholder="Status" value={cpuStatus} />
                                        </Form.Field>
                                        <Form.Field>
                                            <label>Production Date</label>
                                            <Input readOnly placeholder="Production Date" value={this.state.productionDate} />
                                        </Form.Field>
                                    </Form.Group>
                                </Form>

                                <Form>
                                    <Form.Field>
                                        <label>Lab Number</label>
                                        <Input placeholder="Lab Number" value={cpuLabNumber} onChange={(e) => this.setState({ cpuLabNumber: e.target.value })} />
                                    </Form.Field>
                                    <Button
                                        color="green"
                                        onClick={() => this.changeLabNumber()}
                                        loading={loadingButton === `updateLabNumber`}
                                    >
                                        Change Lab Number
                                    </Button>

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
                                        error={!!errorMessage}
                                        success={!!successMessage}
                                        style={{ marginTop: "1em", width: "100%" }}
                                    >
                                        {components.map((component, idx) => (
                                            <Form.Group key={idx} style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between" }}>
                                                {/* Label & Input */}
                                                <Form.Field width={"100%"} style={{ flex: "1" }}>
                                                    <label>{component.componentType}</label>
                                                    <Input
                                                        placeholder={`Enter ${component.componentType} Details`}
                                                        value={component.details}
                                                        onChange={(e) =>
                                                            this.handleComponentDetailsChange(
                                                                idx,
                                                                e.target.value
                                                            )
                                                        }
                                                    // width="50%"
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
                                                        onClick={() => this.updateComponentDetails(idx)}
                                                        loading={loadingButton === `update-${idx}`}
                                                    >
                                                        Update
                                                    </Button>

                                                    <Button
                                                        color="red"
                                                        disabled={component.status === "Removed"}
                                                        onClick={() => this.removeComponent(idx)}
                                                        loading={loadingButton === `remove-${idx}`}
                                                    >
                                                        Remove
                                                    </Button>

                                                    <Button color="orange" style={{ cursor: "default" }}>
                                                        {this.renderStatusIcon(component.status)}
                                                    </Button>
                                                </Form.Field>
                                            </Form.Group>
                                        ))}

                                        <Message
                                            error
                                            header="Error"
                                            content={errorMessage}
                                        />
                                        <Message
                                            success
                                            header="Success"
                                            content={successMessage}
                                        />
                                    </Form>
                                </div>
                            </>
                        )}
                    </Grid.Column>
                </Grid>

                {/* Add Complaints Modal */}
                <Modal
                    open={showComplaintsModal}
                    onClose={() => this.setState({ showComplaintsModal: false })}
                    size="large"
                >
                    <Modal.Header>Reported CPU Issues</Modal.Header>
                    <Modal.Content>
                        {loadingComplaints ? (
                            <div>Loading complaints...</div>
                        ) : complaints.length === 0 ? (
                            <div>No pending issues reported</div>
                        ) : (
                            <Table celled>
                                <Table.Header>
                                    <Table.Row>
                                        <Table.HeaderCell>CPU Model</Table.HeaderCell>
                                        <Table.HeaderCell>Serial Number</Table.HeaderCell>
                                        <Table.HeaderCell>Issue Description</Table.HeaderCell>
                                        <Table.HeaderCell>Reported By</Table.HeaderCell>
                                        <Table.HeaderCell>Date</Table.HeaderCell>
                                        <Table.HeaderCell>Action</Table.HeaderCell>
                                    </Table.Row>
                                </Table.Header>

                                <Table.Body>
                                    {complaints.map(complaint => (
                                        <Table.Row key={complaint._id}>
                                            <Table.Cell>{complaint.modelName}</Table.Cell>
                                            <Table.Cell>{complaint.serialNumber}</Table.Cell>
                                            <Table.Cell>{complaint.message}</Table.Cell>
                                            <Table.Cell>{complaint.labAssistantName}</Table.Cell>
                                            <Table.Cell>
                                                {new Date(complaint.createdAt).toLocaleDateString()}
                                            </Table.Cell>
                                            <Table.Cell>
                                                <Button
                                                    color="green"
                                                    onClick={() => this.handleResolveComplaint(complaint._id)}
                                                    loading={this.state.resolvingComplaint}
                                                >
                                                    Mark as Resolved
                                                </Button>
                                            </Table.Cell>
                                        </Table.Row>
                                    ))}
                                </Table.Body>
                            </Table>
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

export default withRouter(TechnicianPage);
