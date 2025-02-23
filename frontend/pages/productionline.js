import React, { Component } from "react";
import {
    Button,
    Message,
    Form,
    Container,
    Grid,
    Input,
    Label,
} from "semantic-ui-react";
import web3 from "../ethereum/web3";
import cpuContract from "../ethereum/cpuProduction"; // Updated contract
// import dynamic from "next/dynamic";
// const QrCode = dynamic(() => import("react.qrcode.generator"), { ssr: false });
import { QRCodeSVG } from "qrcode.react";
import Layout from "../components/Layout";
import { withRouter } from "next/router";

// Component Types
const componentTypeOptions = [
    { key: 1, text: "Processor", value: "Processor" },
    { key: 2, text: "RAM", value: "RAM" },
    { key: 3, text: "Hard Disk", value: "Hard Disk" },
    { key: 4, text: "Motherboard", value: "Motherboard" },
    { key: 5, text: "PSU", value: "PSU" },
];

class ManufacturingMachinePage extends Component {
    constructor(props) {
        super(props);
        this.state = {
            // registerSCAddress: "0x55cC96dDBE947f14bd3472eDa1ce70aDF32A9322" ,//old
            // registerSCAddress: "0xF804b9f3b3cf54738C435F9055A4B09423C61c81", //old
            registerSCAddress: "0x6b2e6052d10fc6865F0504d94C18fF41970E7C23", //new
            modelName: "",
            serialNumber: "",
            productionDate: "",
            labNumber: "",
            componentDetails: {
                Processor: "",
                RAM: "",
                "Hard Disk": "",
                Motherboard: "",
                PSU: "",
            },
            cpuQR: "",
            errorMessage: "",
            successMessage: "",
            loading: false,
            QRcodePic: false,
            isAuthenticated: false,
            userRole: null,
            userAddress: "",
            formErrors: {},
        };
        this.qrContainerRef = React.createRef();
    }

    componentDidMount = async () => {
        try {
            const token = localStorage.getItem("token");
            const role = localStorage.getItem("role");
            const userAddress = localStorage.getItem("userAddress");
            const accounts = await web3.eth.getAccounts();

            console.log("=== Debug Information ===");
            console.log("Token:", token);
            console.log("Role:", role);
            console.log("User Address:", userAddress);
            console.log("Connected Account:", accounts[0]);
            console.log("All Accounts:", accounts);
            console.log("=====================");

            // Check basic auth
            if (!token || !role || !userAddress) {
                console.log("Missing authentication data");
                this.props.router.push("/login");
                return;
            }

            // Check role - only manufacturer can access this page
            if (role !== "manufacturer") {
                console.log("User is not a manufacturer");
                this.props.router.push("/unauthorized");
                return;
            }

            // Check wallet connection
            if (!accounts || !accounts[0]) {
                console.log("No wallet connected");
                this.props.router.push("/connect-wallet");
                return;
            }

            // Check if connected wallet matches userAddress
            if (accounts[0].toLowerCase() !== userAddress.toLowerCase()) {
                console.log(
                    "Connected wallet does not match registered manufacturer address"
                );
                this.props.router.push("/connect-wallet");
                return;
            }

            // Set authenticated state
            this.setState({
                isAuthenticated: true,
                userRole: role,
                userAddress: userAddress,
            });
        } catch (error) {
            console.error("Error in componentDidMount:", error);
            this.props.router.push("/unauthorized");
            return;
        }
    };

    // Handle component details input
    handleComponentDetailsChange = (componentType, value) => {
        this.setState((prevState) => ({
            componentDetails: {
                ...prevState.componentDetails,
                [componentType]: value,
            },
        }));
    };

    // Add validation method
    validateForm = () => {
        const errors = {};
        const { modelName, serialNumber, labNumber, productionDate, componentDetails } = this.state;

        // Model Name validation
        if (!modelName.trim()) {
            errors.modelName = 'Model name is required';
        }

        // Serial Number validation
        if (!serialNumber.trim()) {
            errors.serialNumber = 'Serial number is required';
        }

        // Lab Number validation
        if (!labNumber.trim()) {
            errors.labNumber = 'Lab number is required';
        }

        // Production Date validation
        if (!productionDate) {
            errors.productionDate = 'Production date is required';
        }

        // Component Details validation
        Object.entries(componentDetails).forEach(([key, value]) => {
            if (!value.trim()) {
                errors[`component_${key}`] = `${key} details are required`;
            }
        });

        return errors;
    };

    // Register CPU with components
    registerCPUWithComponents = async (event) => {
        event.preventDefault();

        // Validate form
        const formErrors = this.validateForm();
        if (Object.keys(formErrors).length > 0) {
            this.setState({ formErrors });
            return;
        }

        // Check authentication before proceeding
        if (!this.state.isAuthenticated) {
            this.setState({ errorMessage: "Not authenticated" });
            return;
        }

        this.setState({
            loading: true,
            errorMessage: "",
            successMessage: "",
            cpuQR: ""
        });

        const {
            modelName,
            serialNumber,
            productionDate,
            componentDetails,
            registerSCAddress,
            labNumber,
        } = this.state;

        try {
            const accounts = await web3.eth.getAccounts();

            // Convert component details into arrays
            const componentTypes = Object.keys(componentDetails);
            const componentDetailsArray = Object.values(componentDetails);

            // Convert date string to Unix timestamp (seconds since epoch)
            const dateTimestamp = Math.floor(new Date(productionDate).getTime() / 1000);

            const cpuDetails = {
                modelName: modelName,
                serialNumber: serialNumber,
                productionDate: dateTimestamp, // Assuming this represents the production date
                labNumber: labNumber, // Add this variable if you have it
            };

            const components = componentTypes.map((type, index) => ({
                componentType: type,
                details: componentDetailsArray[index],
            }));
            const result = await cpuContract.methods
                .registerCPUWithComponents(
                    registerSCAddress,
                    cpuDetails,
                    components
                )
                .send({ from: accounts[0] });
            // Extract the `cpuAddress` from the emitted event
            const cpuRegisteredEvent = result.events.CPURegistered;
            const cpuQR = cpuRegisteredEvent.returnValues.cpuAddress;

            console.log("CPU Address:", cpuQR);

            this.setState({
                cpuQR,
                successMessage: "CPU registered successfully!",
            });


        } catch (err) {
            this.setState({ errorMessage: err.message });
        } finally {
            this.setState({ loading: false });
        }
    };

    // Add method to handle input changes and clear errors
    handleInputChange = (field, value) => {
        this.setState(prevState => ({
            [field]: value,
            formErrors: {
                ...prevState.formErrors,
                [field]: ''
            }
        }));
    };

    handleDownload = () => {
        // Get the SVG element by its id from the container
        const svg = document.getElementById("qr-code");
        if (!svg) return;

        const svgData = new XMLSerializer().serializeToString(svg);
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        // Set canvas dimensions to SVG dimensions
        canvas.width = svg.width.baseVal.value;
        canvas.height = svg.height.baseVal.value;

        const img = new Image();
        img.onload = () => {
            ctx.drawImage(img, 0, 0);
            const pngFile = canvas.toDataURL("image/png");
            const downloadLink = document.createElement("a");
            downloadLink.download = `CPU-QR-${this.state.serialNumber || "code"}.png`;
            downloadLink.href = pngFile;
            downloadLink.click();
        };

        img.src = "data:image/svg+xml;base64," + btoa(svgData);
    };

    render() {
        const { formErrors, componentDetails, productionDate } = this.state;

        return (
            <Container>
                <link
                    rel="stylesheet"
                    href="//cdn.jsdelivr.net/npm/semantic-ui@2.4.1/dist/semantic.min.css"
                />
                <Grid centered>
                    <Grid.Column width={12}>
                        <h2 style={{ textAlign: "center" }} >Register CPU with Components</h2>
                        <Form
                            onSubmit={this.registerCPUWithComponents}
                            error={!!this.state.errorMessage || Object.keys(formErrors).length > 0}
                            success={!!this.state.successMessage}
                        >
                            <Form.Field error={!!formErrors.modelName}>
                                <label>Model Name:</label>
                                <Input
                                    placeholder="Enter Model Name"
                                    value={this.state.modelName}
                                    onChange={(e) => this.handleInputChange('modelName', e.target.value)}
                                    required
                                />
                                {formErrors.modelName && (
                                    <Label basic color='red' pointing>
                                        {formErrors.modelName}
                                    </Label>
                                )}
                            </Form.Field>

                            <Form.Field error={!!formErrors.serialNumber}>
                                <label>Serial Number:</label>
                                <Input
                                    placeholder="Enter Serial Number"
                                    value={this.state.serialNumber}
                                    onChange={(e) => this.handleInputChange('serialNumber', e.target.value)}
                                    required
                                />
                                {formErrors.serialNumber && (
                                    <Label basic color='red' pointing>
                                        {formErrors.serialNumber}
                                    </Label>
                                )}
                            </Form.Field>

                            <Form.Field error={!!formErrors.labNumber}>
                                <label>Lab Number:</label>
                                <Input
                                    placeholder="Enter Lab Number"
                                    value={this.state.labNumber}
                                    onChange={(e) => this.handleInputChange('labNumber', e.target.value)}
                                    required
                                />
                                {formErrors.labNumber && (
                                    <Label basic color='red' pointing>
                                        {formErrors.labNumber}
                                    </Label>
                                )}
                            </Form.Field>

                            <Form.Field error={!!formErrors.productionDate}>
                                <label>Production Date:</label>
                                <Input
                                    type="date"
                                    value={productionDate}
                                    onChange={(e) => this.handleInputChange('productionDate', e.target.value)}
                                    placeholder="Select Production Date"
                                    required
                                />
                                {formErrors.productionDate && (
                                    <Label basic color='red' pointing>
                                        {formErrors.productionDate}
                                    </Label>
                                )}
                            </Form.Field>

                            <h2 style={{ textAlign: "center" }} >Component Details</h2>
                            {componentTypeOptions.map((option) => (
                                <Form.Field
                                    key={option.key}
                                    error={!!formErrors[`component_${option.value}`]}
                                >
                                    <label>{option.text} Details:</label>
                                    <Input
                                        placeholder={`Enter ${option.text} Details`}
                                        value={componentDetails[option.value]}
                                        onChange={(e) => {
                                            this.handleComponentDetailsChange(option.value, e.target.value);
                                            // Clear component error
                                            this.setState(prevState => ({
                                                formErrors: {
                                                    ...prevState.formErrors,
                                                    [`component_${option.value}`]: ''
                                                }
                                            }));
                                        }}
                                        required
                                    />
                                    {formErrors[`component_${option.value}`] && (
                                        <Label basic color='red' pointing>
                                            {formErrors[`component_${option.value}`]}
                                        </Label>
                                    )}
                                </Form.Field>
                            ))}

                            <Message
                                error
                                header="Error!"
                                content={this.state.errorMessage}
                            />
                            <Message
                                success
                                header="Success!"
                                content={this.state.successMessage}
                            />
                            <center>
                                <Button
                                    color="green"
                                    loading={this.state.loading}
                                    type="submit"
                                    disabled={this.state.loading || Object.keys(formErrors).length > 0}
                                >
                                    Register CPU
                                </Button>
                            </center>
                        </Form>

                        {this.state.cpuQR && (
                            <div
                                style={{
                                    marginTop: "20px",
                                    display: "flex",
                                    flexDirection: "column",
                                    alignItems: "center",
                                }}
                            >
                                <h2>{this.state.cpuQR}</h2>
                                <h4>CPU QR Code:</h4>
                                <div ref={this.qrContainerRef}>
                                    <QRCodeSVG
                                        id="qr-code"
                                        value={this.state.cpuQR}
                                        size={256}
                                        level="H"
                                    />
                                </div>
                                <div style={{ marginTop: "10px" }}>
                                    <Button color="green" onClick={this.handleDownload}>
                                        Download QR Code
                                    </Button>
                                </div>
                            </div>
                        )}

                    </Grid.Column>
                </Grid>
            </Container>
        );
    }
}

export default withRouter(ManufacturingMachinePage);
