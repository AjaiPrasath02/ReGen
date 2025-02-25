import React, { useState, useEffect } from 'react';
import { Container, Segment, Header, Grid, Button, Modal, Message } from 'semantic-ui-react';
import { useRouter } from 'next/router';
import web3 from '../ethereum/web3';
import cpuContract from '../ethereum/cpuProduction';
import { useAuth } from '../context/AuthContext';
import QRScannerNInput from '../components/Technician/QRScannerNInput';
import CPUDetails from '../components/Technician/CPUDetails';
import ComplaintsModal from '../components/Technician/ComplaintsModal';
import AllCPUs from '../components/CPUsTable';
import QrScanner from 'qr-scanner';
import Visualization from './visualization';

const TechnicianPage = () => {
    const router = useRouter();
    const { isAuthenticated, userRole, walletAddress } = useAuth();

    const [state, setState] = useState({
        cpuAddress: '',
        components: [],
        loading: false,
        loadingButton: null,
        componentDetails: {
            Processor: '',
            RAM: '',
            'Hard Disk': '',
            Motherboard: '',
            PSU: '',
        },
        errorMessage: '',
        successMessage: '',
        qrScanned: false,
        cpuModel: '',
        cpuSerial: '',
        cpuStatus: '',
        cpuLabNumber: '',
        productionDate: '',
        complaints: [],
        showVisualization: false,
        cpuData: [],
        loadingComplaints: false,
        showComplaintsModal: false,
        resolvingComplaint: false,
        showMessage: false,
        messageTimeout: null,
        statusFilter: 'all',
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
        setState((prev) => ({ ...prev, errorMessage: err.message }));
    };

    const handleFileUpload = async (event) => {
        try {
            const file = event.target.files[0];
            if (!file) return;

            const result = await QrScanner.scanImage(file, { returnDetailedScanResult: false });
            console.log('QR code content from uploaded image:', result);

            if (result) {
                await fetchCPUDetails(result.data.trim());
            }
        } catch (error) {
            console.error('Error scanning uploaded image:', error);
            setState((prev) => ({
                ...prev,
                errorMessage: 'Could not detect a valid QR code in the image.',
            }));
        }
    };

    const fetchCPUDetails = async (cpuAddress) => {
        try {
            if (!cpuAddress) {
                setState((prev) => ({
                    ...prev,
                    showMessage: true,
                    errorMessage: 'Please enter a valid CPU address.',
                }));
                return;
            }

            setState((prev) => ({ ...prev, cpuAddress, qrScanned: true }));

            const cpuDetails = await cpuContract.methods.getCPU(cpuAddress).call();
            console.log('Fetched CPU Details:', cpuDetails);

            if (cpuDetails) {
                setState((prev) => ({
                    ...prev,
                    cpuModel: cpuDetails.modelName,
                    cpuSerial: cpuDetails.serialNumber,
                    cpuStatus: cpuDetails.status,
                    cpuLabNumber: cpuDetails.labNumber,
                    components: cpuDetails.components,
                    productionDate: new Date(parseInt(cpuDetails.productionDate) * 1000).toLocaleDateString(),
                }));
            }
        } catch (err) {
            console.error('Error fetching CPU details:', err);
            setState((prev) => ({ ...prev, errorMessage: 'Error fetching CPU details.' }));
        }
    };

    const handleComponentDetailChange = (index, value) => {
        setState((prev) => ({
            ...prev,
            components: prev.components.map((comp, idx) =>
                idx === index ? { ...comp, details: value } : comp
            ),
        }));
    };

    const handleComponentAction = async (componentIndex, action) => {
        // Determine the loading key for the button
        let loadingKey;
        if (action === 'updateLabNumber') {
            loadingKey = 'updateLabNumber';
        } else {
            loadingKey = `${action}-${componentIndex}`;
        }

        // Set loading state
        setState((prev) => ({
            ...prev,
            loading: true,
            loadingButton: loadingKey,
            errorMessage: '',
            successMessage: '',
        }));

        try {
            const accounts = await web3.eth.getAccounts();

            if (action === 'update') {
                // Get updated details from state
                const updatedDetails = state.components[componentIndex].details;
                // Call smart contract method to update component
                await cpuContract.methods
                    .updateComponent(state.cpuAddress, componentIndex, "Working", updatedDetails)
                    .send({ from: accounts[0] });
                // Set success message
                setState((prev) => ({
                    ...prev,
                    successMessage: `${state.components[componentIndex].componentType} updated successfully!`,
                    showMessage: true,
                }));
            } else if (action === 'remove') {
                // Call smart contract method to remove component
                await cpuContract.methods
                    .removeComponent(state.cpuAddress, componentIndex)
                    .send({ from: accounts[0] });
                // Set success message
                setState((prev) => ({
                    ...prev,
                    successMessage: `${state.components[componentIndex].componentType} removed successfully!`,
                    showMessage: true,
                }));
            } else if (action === 'updateLabNumber') {
                // Call smart contract method to update lab number
                await cpuContract.methods
                    .updateLabNumber(state.cpuAddress, state.cpuLabNumber)
                    .send({ from: accounts[0] });
                // Set success message
                setState((prev) => ({
                    ...prev,
                    successMessage: 'Lab number updated successfully!',
                    showMessage: true,
                }));
            }

            // Re-fetch CPU details after any action to update state
            await fetchCPUDetails(state.cpuAddress);

            // Set timeout to clear success message and close modal
            const timeout = setTimeout(() => {
                setState((prev) => ({ ...prev, successMessage: '', showMessage: false }));
            }, 3000);

            setState((prev) => ({ ...prev, messageTimeout: timeout }));
        } catch (err) {
            // Set error message and show modal
            setState((prev) => ({ ...prev, errorMessage: err.message, showMessage: true }));
        } finally {
            // Clear loading state
            setState((prev) => ({ ...prev, loading: false, loadingButton: null }));
        }
    };

    const fetchComplaints = async () => {
        try {
            setState((prev) => ({ ...prev, loadingComplaints: true }));

            const response = await fetch('http://localhost:4000/api/complaints/getComplaints', {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                },
            });

            if (!response.ok) {
                throw new Error('Failed to fetch complaints');
            }

            const complaints = await response.json();
            setState((prev) => ({ ...prev, complaints }));
        } catch (error) {
            console.error('Error fetching complaints:', error);
        } finally {
            setState((prev) => ({ ...prev, loadingComplaints: false }));
        }
    };

    const handleResolveComplaint = async (complaintId) => {
        try {
            setState((prev) => ({ ...prev, resolvingComplaint: true }));

            const response = await fetch(`http://localhost:4000/api/complaints/resolve/${complaintId}`, {
                method: 'PATCH',
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                },
            });

            if (!response.ok) {
                throw new Error('Failed to resolve complaint');
            }

            await fetchComplaints();
        } catch (error) {
            console.error('Error resolving complaint:', error);
        } finally {
            setState((prev) => ({ ...prev, resolvingComplaint: false }));
        }
    };

    // const handleVisualization = async () => {
    //     try {
    //         const accounts = await web3.eth.getAccounts();
    //         const allCPUs = await cpuContract.methods.getAllCPUDetails().call({
    //             from: accounts[0],
    //         });

    //         const formattedCPUs = allCPUs.map(cpu => ({
    //             modelName: cpu.modelName,
    //             serialNumber: cpu.serialNumber,
    //             status: cpu.status,
    //             productionDate: cpu.productionDate.toString(), // Convert BigInt to string
    //             cpuAddress: cpu.cpuAddress,
    //             manufacturerID: cpu.manufacturerID.toString(), // Convert BigInt to string
    //             components: cpu.components.map(comp => ({
    //                 componentID: comp.componentID.toString(), // Convert BigInt to string
    //                 componentType: comp.componentType,
    //                 details: comp.details,
    //                 status: comp.status,
    //                 cpuAddress: comp.cpuAddress
    //             }))
    //         }));
    //     } catch (error) {
    //         console.error("Error fetching CPU data:", error);
    //         this.setState({ errorMessage: "Error fetching CPU data for visualization" });
    //     }
    // }

    const handleVisualization = async () => {
        try {
            const response = await fetch('/cpuData.json');
            const formattedCPUs = await response.json();
            setState((prev) => ({
                ...prev,
                cpuData: formattedCPUs,
                showVisualization: true,
            }));
        } catch (error) {
            console.error('Error fetching CPU data:', error);
            setState((prev) => ({
                ...prev,
                errorMessage: 'Error fetching CPU data for visualization',
            }));
        }
    }

    return (
        <>
            {state.showMessage && (
                <Modal
                    basic
                    open={true}
                    onClose={() => setState((prev) => ({ ...prev, showMessage: false }))}
                    size="small"
                    style={{
                        position: 'fixed',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        width: '300px',
                    }}
                >
                    <Modal.Content>
                        <Message
                            success={!!state.successMessage}
                            error={!!state.errorMessage}
                            onDismiss={() => setState((prev) => ({ ...prev, showMessage: false }))}
                        >
                            <Message.Header>{state.successMessage ? 'Success' : 'Error'}</Message.Header>
                            <p>{state.successMessage || state.errorMessage}</p>
                        </Message>
                    </Modal.Content>
                </Modal>
            )}

            <Container>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Header as="h1" textAlign="center" style={{ marginTop: '1em', flex: 1 }}>
                        Technician - Update/Remove Components
                    </Header>
                    <Button
                        style={{ marginRight: '2em' }}
                        icon="warning circle"
                        content="View Reported Issues"
                        color="orange"
                        onClick={() => {
                            setState((prev) => ({ ...prev, showComplaintsModal: true }));
                            fetchComplaints();
                        }}
                    />
                    <Button
                        color="blue"
                        style={{ marginTop: '2em', marginBottom: '2em' }}
                        onClick={handleVisualization}
                    >
                        View All CPUs Visualization
                    </Button>
                </div>

                {state.qrScanned && (
                    <Button
                        icon="arrow left"
                        content="Back to Scanner"
                        color="blue"
                        onClick={() =>
                            setState((prev) => ({
                                ...prev,
                                qrScanned: false,
                                cpuAddress: '',
                                cpuModel: '',
                                cpuSerial: '',
                                cpuStatus: '',
                                components: [],
                                productionDate: '',
                                errorMessage: '',
                                successMessage: '',
                                cpuLabNumber: '',
                            }))
                        }
                        style={{ marginBottom: '1em', marginTop: '1em' }}
                    />
                )}

                <Grid centered style={{ marginTop: '1em', marginBottom: '1em' }}>
                    <Grid.Column width="100%">
                        {!state.qrScanned ? (
                            <Segment>
                                <Grid stackable columns={2}>
                                    <Grid.Row style={{ paddingRight: '3em' }}>
                                        <Grid.Column>
                                            <QRScannerNInput
                                                onScan={handleScan}
                                                onError={handleError}
                                                onFileUpload={handleFileUpload}
                                                cpuAddress={state.cpuAddress}
                                                setCpuAddress={(value) =>
                                                    setState((prev) => ({ ...prev, cpuAddress: value }))
                                                }
                                            />
                                        </Grid.Column>
                                        <Grid.Column>
                                            <AllCPUs />
                                        </Grid.Column>
                                    </Grid.Row>
                                </Grid>
                            </Segment>
                        ) : (
                            <CPUDetails
                                cpuModel={state.cpuModel}
                                cpuSerial={state.cpuSerial}
                                cpuStatus={state.cpuStatus}
                                productionDate={state.productionDate}
                                cpuLabNumber={state.cpuLabNumber}
                                components={state.components}
                                onLabNumberChange={(value) => setState((prev) => ({ ...prev, cpuLabNumber: value }))}
                                onComponentAction={handleComponentAction}
                                onComponentDetailChange={handleComponentDetailChange}
                                loadingButton={state.loadingButton}
                            />
                        )}
                    </Grid.Column>
                </Grid>

                <ComplaintsModal
                    showComplaintsModal={state.showComplaintsModal}
                    onClose={() => setState((prev) => ({ ...prev, showComplaintsModal: false }))}
                    complaints={state.complaints}
                    statusFilter={state.statusFilter}
                    setStatusFilter={(filter) => setState((prev) => ({ ...prev, statusFilter: filter }))}
                    onResolveComplaint={handleResolveComplaint}
                    resolvingComplaint={state.resolvingComplaint}
                />

                {/* Add Visualization Modal */}
                <Modal
                    open={state.showVisualization}
                    onClose={() => setState((prev) => ({ ...prev, showVisualization: false }))}
                    size="large"
                >
                    <Modal.Content>
                        <Visualization
                            cpuArray={state.cpuData}
                            onBack={() => setState((prev) => ({ ...prev, showVisualization: false }))}
                        />
                    </Modal.Content>
                </Modal>
            </Container>
        </>
    );
};

export default TechnicianPage;