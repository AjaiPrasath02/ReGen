import React, { useState, useEffect } from "react";
import { Table, Container, Header, Input, Message, Button } from "semantic-ui-react";
import web3 from "../ethereum/web3";
import cpuContract from "../ethereum/cpuProduction";
import { useAuth } from '../context/AuthContext';

const AllCPUs = ({ cpuLabNumber }) => {
    const { isAuthenticated, userRole, walletAddress } = useAuth();

    const [state, setState] = useState({
        cpus: [],
        loading: false,
        errorMessage: "",
        searchTerm: "",
    });

    useEffect(() => {
        fetchCPUs();
    }, [cpuLabNumber]);

    const fetchCPUs = async () => {
        try {
            setState(prev => ({ ...prev, loading: true, errorMessage: "" }));

            const accounts = await web3.eth.getAccounts();
            if (!accounts || !accounts[0]) {
                throw new Error("No MetaMask or Web3 account found. Please connect your wallet.");
            }

            // Call the contract method to retrieve CPU details
            const cpus = await cpuContract.methods.getAllCPUDetails().call({
                from: accounts[0],
            });

            // Only filter if cpuLabNumber is provided
            const filteredCpus = cpuLabNumber
                ? cpus.filter(cpu => cpu.labNumber === cpuLabNumber)
                : cpus;

            setState(prev => ({ ...prev, cpus: filteredCpus }));

        } catch (err) {
            console.error("Error fetching CPU details:", err);
            setState(prev => ({
                ...prev,
                errorMessage: err.message || "Error fetching CPU data."
            }));
        } finally {
            setState(prev => ({ ...prev, loading: false }));
        }
    };

    // Handle changes in the search box
    const handleSearchChange = (e) => {
        setState(prev => ({ ...prev, searchTerm: e.target.value }));
    };

    // Return the filtered list based on searchTerm
    const getFilteredCPUs = () => {
        const { cpus, searchTerm } = state;
        const lowerTerm = searchTerm.toLowerCase().trim();

        // If no search term, show all CPUs (already filtered by lab number)
        if (!lowerTerm) return cpus;

        // Filter by modelName, serialNumber, or status
        return cpus.filter((cpu) => {
            const { modelName, serialNumber, status } = cpu;
            return (
                modelName?.toLowerCase().includes(lowerTerm) ||
                serialNumber?.toLowerCase().includes(lowerTerm) ||
                status?.toLowerCase().startsWith(lowerTerm)
            );
        });
    };

    const renderRows = (filteredCPUs) => {
        return filteredCPUs.map((cpu, index) => (
            <Table.Row key={index}>
                <Table.Cell>{cpu.modelName}</Table.Cell>
                <Table.Cell>{cpu.serialNumber}</Table.Cell>
                <Table.Cell>{cpu.status}</Table.Cell>
            </Table.Row>
        ));
    };

    const { loading, errorMessage, searchTerm } = state;
    const filteredCPUs = getFilteredCPUs();

    return (
        <Container style={{ marginTop: "2em" }}>
            {cpuLabNumber ? <Header as="h2" textAlign="center">
                Lab {cpuLabNumber} CPU Details
            </Header> : <Header as="h2" textAlign="center">
                All CPUs
            </Header>}

            {errorMessage && (
                <Message error header="Error" content={errorMessage} />
            )}

            <div style={{ width: "100%" }}>
                <Button
                    color="grey"
                    style={{
                        marginBottom: "1em",
                        float: "right",
                        cursor: "default"
                    }}
                >
                    <strong>Records Found:</strong> {filteredCPUs.length}
                </Button>

                <Input
                    icon="search"
                    placeholder="Search by model, serial, or status..."
                    value={searchTerm}
                    onChange={handleSearchChange}
                    style={{ width: "100%", marginBottom: "1em" }}
                />

                <div style={{
                    maxHeight: "300px",
                    minHeight: "280px",
                    overflowY: "auto"
                }}>
                    <Table
                        celled
                        striped
                        style={{ width: "100%" }}
                        loading={loading.toString()}
                    >
                        <Table.Header>
                            <Table.Row>
                                <Table.HeaderCell>Model</Table.HeaderCell>
                                <Table.HeaderCell>Serial Number</Table.HeaderCell>
                                <Table.HeaderCell>Status</Table.HeaderCell>
                            </Table.Row>
                        </Table.Header>

                        <Table.Body>
                            {renderRows(filteredCPUs)}
                        </Table.Body>
                    </Table>
                </div>
            </div>
        </Container>
    );
};

export default AllCPUs;
