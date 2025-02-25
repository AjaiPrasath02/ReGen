import React, { useState, useEffect } from "react";
import { Button, Message, Form, Container, Grid } from "semantic-ui-react";
import web3 from "../ethereum/web3";
import cpuContract from "../ethereum/cpuProduction";
import { useRouter } from 'next/router';
import { useAuth } from '../context/AuthContext';
import CPUDetailsForm from '../components/Productionline/CPUDetailsForm';
import ComponentDetailsForm from '../components/Productionline/ComponentDetailsForm';
import QRCodeDisplay from '../components/Productionline/QRCodeDisplay';

const ManufacturingMachinePage = () => {
    const router = useRouter();
    const { isAuthenticated, userRole, walletAddress } = useAuth();
    const [state, setState] = useState({
        modelName: "",
        serialNumber: "",
        labNumber: "",
        productionDate: "",
        componentDetails: {
            Processor: "",
            RAM: "",
            "Hard Disk": "",
            Motherboard: "",
            PSU: "",
        },
        loading: false,
        errorMessage: "",
        successMessage: "",
        cpuQR: "",
        registerSCAddress: "0x6b2e6052d10fc6865F0504d94C18fF41970E7C23",
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

    const handleInputChange = (field, value) => {
        setState(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleComponentDetailsChange = (componentType, value) => {
        setState(prev => ({
            ...prev,
            componentDetails: {
                ...prev.componentDetails,
                [componentType]: value,
            }
        }));
    };

    const validateForm = () => {
        const errors = {};
        const { modelName, serialNumber, labNumber, productionDate, componentDetails } = state;

        if (!modelName.trim()) errors.modelName = 'Model name is required';
        if (!serialNumber.trim()) errors.serialNumber = 'Serial number is required';
        if (!labNumber.trim()) errors.labNumber = 'Lab number is required';
        if (!productionDate) errors.productionDate = 'Production date is required';

        Object.entries(componentDetails).forEach(([key, value]) => {
            if (!value.trim()) {
                errors[`component_${key}`] = `${key} details are required`;
            }
        });

        return errors;
    };

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
            cpuQR: "",
            formErrors: {}
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

    return (
        <Container>
            <Grid centered>
                <Grid.Column width={12}>
                    <h2 style={{ textAlign: "center" }}>Register CPU with Components</h2>
                    <Form
                        onSubmit={registerCPUWithComponents}
                        error={!!state.errorMessage || Object.keys(state.formErrors).length > 0}
                        success={!!state.successMessage}
                    >
                        <CPUDetailsForm
                            state={state}
                            handleInputChange={handleInputChange}
                            formErrors={state.formErrors}
                        />
                        <ComponentDetailsForm
                            componentDetails={state.componentDetails}
                            handleComponentDetailsChange={handleComponentDetailsChange}
                            formErrors={state.formErrors}
                        />
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
                        <QRCodeDisplay cpuQR={state.cpuQR} serialNumber={state.serialNumber} />
                    )}
                </Grid.Column>
            </Grid>
        </Container>
    );
};

export default ManufacturingMachinePage;