// 0xe2B9aC600FEaB7eF8B802f3c78E556168ED09750
import React, { useState } from "react";
import contractInstance from "../ethereum/cpuProduction";
import web3 from "../ethereum/web3";
import { Table } from "semantic-ui-react";
import dynamic from "next/dynamic";

const QrReader = dynamic(() => import("react-qr-reader"), { ssr: false });

const CPUHistory = () => {
    const [cpuAddress, setCpuAddress] = useState("");
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [showQrReader, setShowQrReader] = useState(false);

    const getCPUHistory = async (cpuAddress) => {
        try {
            console.log(`Fetching history for CPU: ${cpuAddress}...`);

            const events = await Promise.all([
                contractInstance.getPastEvents("CPURegistered", { filter: { cpuAddress }, fromBlock: 0, toBlock: "latest" }),
                contractInstance.getPastEvents("CPUStatusUpdated", { filter: { cpuAddress }, fromBlock: 0, toBlock: "latest" }),
                contractInstance.getPastEvents("ComponentAdded", { filter: { cpuAddress }, fromBlock: 0, toBlock: "latest" }),
                contractInstance.getPastEvents("ComponentRemoved", { filter: { cpuAddress }, fromBlock: 0, toBlock: "latest" }),
                contractInstance.getPastEvents("ComponentUpdated", { filter: { cpuAddress }, fromBlock: 0, toBlock: "latest" }),
                contractInstance.getPastEvents("LabNumberUpdated", { filter: { cpuAddress }, fromBlock: 0, toBlock: "latest" })
            ]);

            const sortedEvents = events.flat().sort((a, b) => {
                const blockNumberA = Number(a.blockNumber);
                const blockNumberB = Number(b.blockNumber);
                const transactionIndexA = Number(a.transactionIndex);
                const transactionIndexB = Number(b.transactionIndex);

                if (blockNumberA === blockNumberB) {
                    return transactionIndexA - transactionIndexB;
                }
                return blockNumberA - blockNumberB;
            });

            let cpuState = {};
            let history = [];

            for (let event of sortedEvents) {
                const eventType = event.event;
                const eventData = event.returnValues;
                const block = await web3.eth.getBlock(Number(event.blockNumber));
                const timestamp = new Date(Number(block.timestamp) * 1000).toISOString();

                if (eventType === "CPURegistered") {
                    cpuState = {
                        cpuAddress: eventData.cpuAddress,
                        manufacturerID: eventData.manufacturerID.toString(),
                        modelName: eventData.modelName,
                        serialNumber: eventData.serialNumber,
                        productionDate: new Date(Number(eventData.productionDate) * 1000).toISOString(),
                        labNumber: eventData.labNumber.toString(),
                        status: "Working",
                        components: [],
                        time: new Date(Number(eventData.time) * 1000).toISOString()
                    };
                } else if (eventType === "ComponentAdded") {
                    cpuState.components.push({
                        componentID: eventData.componentID.toString(),
                        componentType: eventData.componentType,
                        status: eventData.status,
                        details: eventData.details
                    });
                } else if (eventType === "ComponentRemoved") {
                    const componentIndex = Number(eventData.componentID);
                    if (cpuState.components[componentIndex]) {
                        cpuState.components[componentIndex].status = "Removed";
                    }
                } else if (eventType === "ComponentUpdated") {
                    const componentIndex = Number(eventData.componentID);
                    if (cpuState.components[componentIndex]) {
                        cpuState.components[componentIndex].status = eventData.newStatus;
                        cpuState.components[componentIndex].details = eventData.newDetails;
                    }
                } else if (eventType === "CPUStatusUpdated") {
                    cpuState.status = eventData.newStatus;
                } else if (eventType === "LabNumberUpdated") {
                    cpuState.labNumber = eventData.newLabNumber.toString();
                }
                history.push({
                    event: eventType,
                    time: timestamp,
                    data: {
                        ...cpuState,
                        components: cpuState.components.map(c => ({ ...c }))
                    }
                });
            }

            return history;
        } catch (error) {
            console.error("Error fetching CPU history:", error);
            return [];
        }
    };

    const fetchHistory = async (address) => {
        if (!address) {
            setError("Please enter a CPU Address.");
            return;
        }
        setLoading(true);
        setError("");
        try {
            const result = await getCPUHistory(address);
            setHistory(result);
        } catch (err) {
            setError("Failed to fetch history. Check the console for details.");
        } finally {
            setLoading(false);
        }
    };

    const handleScan = async (data) => {
        if (data) {
            const address = data.trim();
            console.log("QR Scan successful, address:", address);
            setCpuAddress(address);
            setShowQrReader(false);
            await fetchHistory(address);
        }
    };

    const handleError = (err) => {
        console.error("QR Scan error:", err);
        setError(err.message || "Error scanning QR code. Please ensure camera permissions are granted.");
    };

    const toggleQrReader = () => {
        setShowQrReader(!showQrReader);
        setError("");
    };

    return (
        <div className="container">
            <h1 className="title">CPU Production History</h1>

        
            <div className="input-section">
                <div class="fetch-input">
                <input
                    type="text"
                    className="cpu-input"
                    placeholder="Enter CPU Address"
                    value={cpuAddress}
                    onChange={(e) => setCpuAddress(e.target.value)}
                />
                <button
                    onClick={() => fetchHistory(cpuAddress)}
                    className="fetch-button"
                >
                    Fetch History
                </button>
                </div>
                <div className="qr-button">
                <button
                    onClick={toggleQrReader}
                >
                    {showQrReader ? "Close QR Scanner" : "Scan QR Code"}
                </button>
                </div>
            </div>

            {/* QR Reader Section (shown conditionally) */}
            {showQrReader && (
                <div className="qr-section">
                    <h2 className="qr-title">Scan QR Code</h2>
                    <QrReader
                        delay={1000}
                        style={{ width: "100%", maxWidth: "400px", margin: "0 auto" }}
                        onScan={handleScan}
                        onError={handleError}
                    />
                </div>
            )}

            {/* Loading and Error Messages */}
            {loading && <p className="loading-message">Fetching history...</p>}
            {error && <p className="error-message">{error}</p>}

            {/* History Table */}
            {history.length > 0 && (
                <div className="history-section">
                    <h2 className="history-title">History</h2>
                    <div className="table-wrapper">
                        <div style={{ maxHeight: "400px", minHeight: "350px", overflowY: "auto" }}>
                            <Table celled className="history-table">
                                <Table.Header>
                                    <Table.Row>
                                        <Table.HeaderCell>Event</Table.HeaderCell>
                                        <Table.HeaderCell>Time</Table.HeaderCell>
                                        <Table.HeaderCell>Details</Table.HeaderCell>
                                    </Table.Row>
                                </Table.Header>
                                <Table.Body>
                                    {history.map((item, index) => (
                                        <Table.Row key={index}>
                                            <Table.Cell>{item.event}</Table.Cell>
                                            <Table.Cell>{item.time}</Table.Cell>
                                            <Table.Cell>
                                                {item.event === "CPURegistered" && (
                                                    <div>
                                                        <p><strong>Model:</strong> {item.data.modelName}</p>
                                                        <p><strong>Serial:</strong> {item.data.serialNumber}</p>
                                                        <p><strong>Manufacturer ID:</strong> {item.data.manufacturerID}</p>
                                                        <p><strong>Lab Number:</strong> {item.data.labNumber}</p>
                                                    </div>
                                                )}
                                                {item.event === "CPUStatusUpdated" && (
                                                    <p><strong>New Status:</strong> {item.data.status}</p>
                                                )}
                                                {item.event === "LabNumberUpdated" && (
                                                    <p><strong>New Lab Number:</strong> {item.data.labNumber}</p>
                                                )}
                                                {item.event === "ComponentAdded" && (
                                                    <div>
                                                        <p><strong>Component Type:</strong> {item.data.components[item.data.components.length - 1]?.componentType}</p>
                                                        <p><strong>Status:</strong> {item.data.components[item.data.components.length - 1]?.status}</p>
                                                    </div>
                                                )}
                                                {item.event === "ComponentRemoved" && (
                                                    <p><strong>Component Removed:</strong> {item.data.components[item.data.components.length - 1]?.componentType}</p>
                                                )}
                                                {item.event === "ComponentUpdated" && (
                                                    <div>
                                                        <p><strong>Updated Component:</strong> {item.data.components[item.data.components.length - 1]?.componentType}</p>
                                                        <p><strong>New Status:</strong> {item.data.components[item.data.components.length - 1]?.status}</p>
                                                    </div>
                                                )}
                                            </Table.Cell>
                                        </Table.Row>
                                    ))}
                                </Table.Body>
                            </Table>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CPUHistory;