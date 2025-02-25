import React, { useState, useEffect } from 'react';
import { Container, Header, Segment, Grid, Button, Message, Icon } from 'semantic-ui-react';
import { useRouter } from 'next/router';
import web3 from '../ethereum/web3';
import cpuContract from '../ethereum/cpuProduction';
import registerContract from '../ethereum/register';
import { useAuth } from '../context/AuthContext';
import QRScannerNInput from '../components/Lab/QRScannerNInput';
import CPUDetails from '../components/Lab/CPUDetails';
import ComplaintModal from '../components/Lab/ComplaintModal';
import ComplaintsTableModal from '../components/Lab/ComplaintsTableModal';
import AllCPUs from '../components/CPUsTable';
import QrScanner from 'qr-scanner';

const LabPage = () => {
    const router = useRouter();
    const { isAuthenticated, userRole, walletAddress } = useAuth();

    const [state, setState] = useState({
        cpuAddress: '',
        components: [],
        errorMessage: '',
        successMessage: '',
        qrScanned: false,
        cpuModel: '',
        cpuSerial: '',
        cpuStatus: '',
        cpuLabNumber: '',
        labAssistantLabNumber: '',
        productionDate: '',
        isModalOpen: false,
        complaintMessage: '',
        submittingComplaint: false,
        showComplaintsModal: false,
        complaints: [],
        loadingComplaints: false,
        statusFilter: 'all',
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
                setState((prev) => ({ ...prev, labAssistantLabNumber: labDetails[3] }));
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
        setState((prev) => ({ ...prev, errorMessage: err.message }));
    };

    const handleFileUpload = async (event) => {
        try {
            const file = event.target.files[0];
            if (!file) return;

            const result = await QrScanner.scanImage(file, { returnDetailedScanResult: false });
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
                    errorMessage: 'Please enter a valid CPU address.',
                }));
                return;
            }
            setState((prev) => ({ ...prev, cpuAddress, qrScanned: true }));

            const cpuDetails = await cpuContract.methods.getCPU(cpuAddress).call();
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
            } else {
                console.log('No CPU details found or invalid data format.');
            }
        } catch (err) {
            console.error('Error fetching CPU details:', err);
            setState((prev) => ({ ...prev, errorMessage: 'Error fetching CPU details.' }));
        }
    };

    const handleBack = () => {
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
            cpuLabNumber: '',
        }));
    };

    const handleOpenModal = () => {
        setState((prev) => ({ ...prev, isModalOpen: true }));
    };

    const handleCloseModal = () => {
        setState((prev) => ({ ...prev, isModalOpen: false, complaintMessage: '', errorMessage: '' }));
    };

    const handleSubmitComplaint = async () => {
        const { cpuAddress, cpuModel, cpuSerial, complaintMessage, cpuLabNumber } = state;

        try {
            if (!cpuAddress || !cpuModel || !cpuSerial || !complaintMessage || !cpuLabNumber) {
                throw new Error('All fields are required');
            }

            setState((prev) => ({ ...prev, submittingComplaint: true }));

            const labAssistantName = localStorage.getItem('userName');

            const response = await fetch('http://localhost:4000/api/complaints/submit', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                },
                body: JSON.stringify({
                    cpuAddress,
                    modelName: cpuModel,
                    serialNumber: cpuSerial,
                    message: complaintMessage,
                    labAssistantName: labAssistantName,
                    labNumber: cpuLabNumber,
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to submit complaint');
            }

            setState((prev) => ({
                ...prev,
                successMessage: 'Complaint submitted successfully',
                isModalOpen: false,
                complaintMessage: '',
            }));
        } catch (error) {
            console.error('Error submitting complaint:', error);
            setState((prev) => ({
                ...prev,
                errorMessage: error.message || 'Error submitting the issue',
            }));
        } finally {
            setState((prev) => ({ ...prev, submittingComplaint: false }));
        }
    };

    const fetchComplaints = async () => {
        try {
            setState((prev) => ({ ...prev, loadingComplaints: true }));
            const { labAssistantLabNumber } = state;

            const response = await fetch('http://localhost:4000/api/complaints/getComplaints', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                },
            });

            if (!response.ok) {
                throw new Error('Failed to fetch complaints');
            }

            const allComplaints = await response.json();
            const filteredComplaints = Array.isArray(allComplaints)
                ? allComplaints.filter((complaint) => complaint.labNumber === labAssistantLabNumber)
                : [];

            setState((prev) => ({
                ...prev,
                complaints: filteredComplaints,
                loadingComplaints: false,
            }));
        } catch (error) {
            console.error('Error fetching complaints:', error);
            setState((prev) => ({
                ...prev,
                complaints: [],
                loadingComplaints: false,
                errorMessage: 'Failed to fetch complaints',
            }));
        }
    };

    const handleOpenComplaintsModal = async () => {
        setState((prev) => ({ ...prev, showComplaintsModal: true }));
        await fetchComplaints();
    };

    return (
        <Container>
            {!state.qrScanned && (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Header as="h1" textAlign="center" style={{ marginTop: '1em', flex: 1 }}>
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

            <Grid centered style={{ marginTop: '2em' }}>
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
                                        <AllCPUs cpuLabNumber={state.labAssistantLabNumber} />
                                    </Grid.Column>
                                </Grid.Row>
                            </Grid>
                        </Segment>
                    ) : (
                        <>
                            {state.cpuLabNumber && state.labAssistantLabNumber !== state.cpuLabNumber ? (
                                <>
                                    <Button
                                        icon="arrow left"
                                        content="Back to Scanner"
                                        color="blue"
                                        onClick={handleBack}
                                        style={{ marginBottom: '1em' }}
                                    />
                                    <Segment placeholder basic>
                                        <Message
                                            error
                                            icon
                                            size="large"
                                            style={{ maxWidth: '500px', margin: '0 auto' }}
                                        >
                                            <Icon name="warning circle" />
                                            <Message.Content>
                                                <Message.Header>Access Denied</Message.Header>
                                                <p>
                                                    This CPU belongs to Lab #{state.cpuLabNumber} and cannot be
                                                    accessed from Lab #{state.labAssistantLabNumber}.
                                                </p>
                                                <p>Please scan a CPU that belongs to your assigned laboratory.</p>
                                            </Message.Content>
                                        </Message>
                                    </Segment>
                                </>
                            ) : (
                                <CPUDetails
                                    cpuModel={state.cpuModel}
                                    cpuSerial={state.cpuSerial}
                                    cpuStatus={state.cpuStatus}
                                    cpuLabNumber={state.cpuLabNumber}
                                    productionDate={state.productionDate}
                                    components={state.components}
                                    errorMessage={state.errorMessage}
                                    onBack={handleBack}
                                    onReportIssue={handleOpenModal}
                                />
                            )}
                        </>
                    )}
                </Grid.Column>
            </Grid>

            <ComplaintModal
                isOpen={state.isModalOpen}
                onClose={handleCloseModal}
                complaintMessage={state.complaintMessage}
                setComplaintMessage={(value) => setState((prev) => ({ ...prev, complaintMessage: value }))}
                errorMessage={state.errorMessage}
                cpuModel={state.cpuModel}
                cpuSerial={state.cpuSerial}
                cpuLabNumber={state.cpuLabNumber}
                onSubmit={handleSubmitComplaint}
                submitting={state.submittingComplaint}
            />

            <ComplaintsTableModal
                isOpen={state.showComplaintsModal}
                onClose={() => setState((prev) => ({ ...prev, showComplaintsModal: false }))}
                complaints={state.complaints}
                statusFilter={state.statusFilter}
                setStatusFilter={(filter) => setState((prev) => ({ ...prev, statusFilter: filter }))}
            />
        </Container>
    );
};

export default LabPage;