import React, { useState, useEffect } from "react";
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
import cpuContract from "../ethereum/cpuProduction";
import { QRCodeSVG } from "qrcode.react";
import { useRouter } from 'next/router';
import { useAuth } from '../context/AuthContext';

// Component Types
const componentTypeOptions = [
    { key: 1, text: "Processor", value: "Processor" },
    { key: 2, text: "RAM", value: "RAM" },
    { key: 3, text: "Hard Disk", value: "Hard Disk" },
    { key: 4, text: "Motherboard", value: "Motherboard" },
    { key: 5, text: "PSU", value: "PSU" },
];

const ManufacturingMachinePage = () => {
    const router = useRouter();
    const { isAuthenticated, userRole, walletAddress } = useAuth();
    const [state, setState] = useState({
        modelName: "",
        serialNumber: "",
        labNumber: "",
        productionDate: "",
        componentDetails: {},
        loading: false,
        errorMessage: "",
        successMessage: "",
        cpuQR: "",
        registerSCAddress: "",
        formErrors: {}
    });

    useEffect(() => {
        const checkAuth = async () => {
            try {
                const accounts = await web3.eth.getAccounts();

                if (!isAuthenticated || userRole !== 'manufacturer') {
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
                console.error("Error checking authentication:", error);
                router.push('/unauthorized');
            }
        };

        checkAuth();
    }, [isAuthenticated, userRole, walletAddress]);

    // Handle component details input
    const handleComponentDetailsChange = (componentType, value) => {
        setState(prev => ({
            ...prev,
            componentDetails: {
                ...prev.componentDetails,
                [componentType]: value,
            },
        }));
    };

    // Add validation method
    const validateForm = () => {
        const errors = {};
        const { modelName, serialNumber, labNumber, productionDate, componentDetails } = state;

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
    const registerCPUWithComponents = async (event) => {
        event.preventDefault();
        const formErrors = validateForm();

        if (Object.keys(formErrors).length > 0) {
            setState(prev => ({ ...prev, formErrors }));
            return;
        }

        setState(prev => ({
            ...prev,
            loading: true,
            errorMessage: "",
            successMessage: "",
            cpuQR: ""
        }));

        try {
            const accounts = await web3.eth.getAccounts();
            const { modelName, serialNumber, productionDate, componentDetails, registerSCAddress, labNumber } = state;

            const componentTypes = Object.keys(componentDetails);
            const componentDetailsArray = Object.values(componentDetails);
            const dateTimestamp = Math.floor(new Date(productionDate).getTime() / 1000);

            const cpuDetails = {
                modelName,
                serialNumber,
                productionDate: dateTimestamp,
                labNumber,
            };

            const components = componentTypes.map((type, index) => ({
                componentType: type,
                details: componentDetailsArray[index],
            }));

            const result = await cpuContract.methods
                .registerCPUWithComponents(registerSCAddress, cpuDetails, components)
                .send({ from: accounts[0] });

            const cpuRegisteredEvent = result.events.CPURegistered;
            const cpuQR = cpuRegisteredEvent.returnValues.cpuAddress;

            setState(prev => ({
                ...prev,
                cpuQR,
                successMessage: "CPU registered successfully!"
            }));

        } catch (err) {
            setState(prev => ({
                ...prev,
                errorMessage: err.message
            }));
        } finally {
            setState(prev => ({
                ...prev,
                loading: false
            }));
        }
    };

    // Add method to handle input changes and clear errors
    const handleInputChange = (field, value) => {
        setState(prev => ({
            ...prev,
            [field]: value,
            formErrors: {
                ...prev.formErrors,
                [field]: ''
            }
        }));
    };

    const handleDownload = () => {
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
            downloadLink.download = `CPU-QR-${state.serialNumber || "code"}.png`;
            downloadLink.href = pngFile;
            downloadLink.click();
        };

        img.src = "data:image/svg+xml;base64," + btoa(svgData);
    };

    return (
        <Container>
            <Grid centered>
                <Grid.Column width={12}>
                    <h2 style={{ textAlign: "center" }} >Register CPU with Components</h2>
                    <Form
                        onSubmit={registerCPUWithComponents}
                        error={!!state.errorMessage || Object.keys(state.formErrors).length > 0}
                        success={!!state.successMessage}
                    >
                        <Form.Field error={!!state.formErrors.modelName}>
                            <label>Model Name:</label>
                            <Input
                                placeholder="Enter Model Name"
                                value={state.modelName}
                                onChange={(e) => handleInputChange('modelName', e.target.value)}
                                required
                            />
                            {state.formErrors.modelName && (
                                <Label basic color='red' pointing>
                                    {state.formErrors.modelName}
                                </Label>
                            )}
                        </Form.Field>

                        <Form.Field error={!!state.formErrors.serialNumber}>
                            <label>Serial Number:</label>
                            <Input
                                placeholder="Enter Serial Number"
                                value={state.serialNumber}
                                onChange={(e) => handleInputChange('serialNumber', e.target.value)}
                                required
                            />
                            {state.formErrors.serialNumber && (
                                <Label basic color='red' pointing>
                                    {state.formErrors.serialNumber}
                                </Label>
                            )}
                        </Form.Field>

                        <Form.Field error={!!state.formErrors.labNumber}>
                            <label>Lab Number:</label>
                            <Input
                                placeholder="Enter Lab Number"
                                value={state.labNumber}
                                onChange={(e) => handleInputChange('labNumber', e.target.value)}
                                required
                            />
                            {state.formErrors.labNumber && (
                                <Label basic color='red' pointing>
                                    {state.formErrors.labNumber}
                                </Label>
                            )}
                        </Form.Field>

                        <Form.Field error={!!state.formErrors.productionDate}>
                            <label>Production Date:</label>
                            <Input
                                type="date"
                                value={state.productionDate}
                                onChange={(e) => handleInputChange('productionDate', e.target.value)}
                                placeholder="Select Production Date"
                                required
                            />
                            {state.formErrors.productionDate && (
                                <Label basic color='red' pointing>
                                    {state.formErrors.productionDate}
                                </Label>
                            )}
                        </Form.Field>

                        <h2 style={{ textAlign: "center" }} >Component Details</h2>
                        {componentTypeOptions.map((option) => (
                            <Form.Field
                                key={option.key}
                                error={!!state.formErrors[`component_${option.value}`]}
                            >
                                <label>{option.text} Details:</label>
                                <Input
                                    placeholder={`Enter ${option.text} Details`}
                                    value={state.componentDetails[option.value]}
                                    onChange={(e) => {
                                        handleComponentDetailsChange(option.value, e.target.value);
                                        // Clear component error
                                        setState(prev => ({
                                            ...prev,
                                            formErrors: {
                                                ...prev.formErrors,
                                                [`component_${option.value}`]: ''
                                            }
                                        }));
                                    }}
                                    required
                                />
                                {state.formErrors[`component_${option.value}`] && (
                                    <Label basic color='red' pointing>
                                        {state.formErrors[`component_${option.value}`]}
                                    </Label>
                                )}
                            </Form.Field>
                        ))}

                        <Message
                            error
                            header="Error!"
                            content={state.errorMessage}
                        />
                        <Message
                            success
                            header="Success!"
                            content={state.successMessage}
                        />
                        <center>
                            <Button
                                color="green"
                                loading={state.loading}
                                type="submit"
                                disabled={state.loading || Object.keys(state.formErrors).length > 0}
                            >
                                Register CPU
                            </Button>
                        </center>
                    </Form>

                    {state.cpuQR && (
                        <div
                            style={{
                                marginTop: "20px",
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "center",
                            }}
                        >
                            <h2>{state.cpuQR}</h2>
                            <h4>CPU QR Code:</h4>
                            <div ref={this.qrContainerRef}>
                                <QRCodeSVG
                                    id="qr-code"
                                    value={state.cpuQR}
                                    size={256}
                                    level="H"
                                />
                            </div>
                            <div style={{ marginTop: "10px" }}>
                                <Button color="green" onClick={handleDownload}>
                                    Download QR Code
                                </Button>
                            </div>
                        </div>
                    )}

                </Grid.Column>
            </Grid>
        </Container>
    );
};

export default ManufacturingMachinePage;
