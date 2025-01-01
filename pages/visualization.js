import React, { useState, useEffect } from "react";
import { useRouter } from 'next/router';
import { Container, Header, Button, Grid } from "semantic-ui-react";
import {
    BarChart,
    Bar,
    PieChart,
    Pie,
    Cell,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer
} from 'recharts';
import Link from 'next/link';

const Visualization = () => {
    const router = useRouter();
    const [cpuArray, setCpuArray] = useState([]);
    const [activeTab, setActiveTab] = useState("status");
    const [selectedCpu, setSelectedCpu] = useState(null);

    useEffect(() => {
        if (router.query.cpuArray) {
            setCpuArray(JSON.parse(router.query.cpuArray));
        }
    }, [router.query]);

    // Tab 1: Aggregate CPU count by status
    const statusCounts = cpuArray.reduce((counts, cpu) => {
        counts[cpu.status] = (counts[cpu.status] || 0) + 1;
        return counts;
    }, {});

    // Transform data for recharts
    const statusData = Object.entries(statusCounts).map(([name, value]) => ({
        name,
        value
    }));

    const componentComparisonData = cpuArray.map(cpu => ({
        name: cpu.serialNumber,
        working: cpu.components.filter(component => component.status === "Working").length,
        removed: cpu.components.filter(component => component.status === "Removed").length
    }));

    // Transform component pie data
    const getComponentPieData = (cpu) => {
        if (!cpu) return [];

        return Object.entries(cpu.components.reduce((counts, component) => {
            counts[component.status] = (counts[component.status] || 0) + 1;
            return counts;
        }, {})).map(([name, value]) => ({
            name,
            value
        }));
    };

    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

    return (
        <Container className="cpu-page">
            <link
                rel="stylesheet"
                href="//cdn.jsdelivr.net/npm/semantic-ui@2.4.1/dist/semantic.min.css"
            />
            <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between',
                alignItems: 'center',
                margin: '1em 0'
            }}>
                <Button color="blue" onClick={() => router.back()}>
                    Back to Dashboard
                </Button>
                {selectedCpu && (
                    <Button
                        color="grey"
                        onClick={() => setSelectedCpu(null)}
                    >
                        Back to All CPUs
                    </Button>
                )}
            </div>

            {selectedCpu ? (
                // Component Details View
                <div className="component-details-container">
                    <div className="component-card">
                        <div className="card-header">
                            <h2>Components of CPU Model: <span style={{ fontWeight: 'bold', color: '#000000' }}>{selectedCpu.modelName}</span></h2>
                        </div>

                        <Grid columns={2} stackable>
                            <Grid.Column>
                                <div className="components-list">
                                    {selectedCpu.components.map((component, compIndex) => (
                                        <div className="component-item" key={compIndex}>
                                            <div className="component-header">
                                                <h3>{component.componentType}</h3>
                                                <Button
                                                    className={component.status === "Working" ? "status-working" : "status-removed"}
                                                    color={component.status === "Working" ? "green" : "red"}
                                                >
                                                    {component.status}
                                                </Button>
                                            </div>
                                            <span className="detail-label">Details:</span>
                                            <span className="detail-value">{component.details}</span>
                                        </div>
                                    ))}
                                </div>
                            </Grid.Column>

                            <Grid.Column>
                                <div className="component-graph">
                                    <h3>Component Status Distribution</h3>
                                    <ResponsiveContainer width="100%" height={400}>
                                        <PieChart>
                                            <Pie
                                                data={getComponentPieData(selectedCpu)}
                                                cx="50%"
                                                cy="50%"
                                                labelLine={false}
                                                outerRadius={150}
                                                fill="#8884d8"
                                                dataKey="value"
                                                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                            >
                                                {getComponentPieData(selectedCpu).map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                ))}
                                            </Pie>
                                            <Tooltip />
                                        </PieChart>
                                    </ResponsiveContainer>
                                    <div className="chart-legend">
                                        {getComponentPieData(selectedCpu).map((entry, index) => (
                                            <div className="legend-item" key={`legend-${index}`}>
                                                <div className="legend-color" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                                                <span>{entry.name}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </Grid.Column>
                        </Grid>
                    </div>
                </div>
            ) : (
                // Main View with CPU List and Graphs
                <>
                    {/* CPU List Section */}
                    <div className="card-header" style={{ marginBottom: '0.5em' }}>
                        <h2>All CPUs</h2>
                    </div>
                    <div className="cpu-list" style={{

                    }}>
                        {cpuArray.map((cpu, index) => (
                            <div
                                className="cpu-card clickable"
                                key={index}
                                onClick={() => setSelectedCpu(cpu)}
                            >
                                <div className="cpu-card-header">
                                    <div className="cpu-info-left">
                                        <div className="info-group">
                                            <span className="info-label" style={{ fontWeight: 'bold' }}>Serial Number: </span>
                                            <span className="info-value">{cpu.serialNumber}</span>
                                        </div>
                                        <div className="info-group">
                                            <span className="info-label" style={{ fontWeight: 'bold' }}>Model Name: </span>
                                            <span className="info-value">{cpu.modelName}</span>
                                        </div>
                                    </div>
                                    <div className="cpu-info-right">
                                        <div className="status-date-group">
                                            <Button
                                                className={cpu.status === "Working" ? "status-working" : "status-not-working"}
                                                color={cpu.status === "Working" ? "green" : "red"}
                                            >
                                                {cpu.status}
                                            </Button>
                                            <Button color="blue">
                                                {cpu.productionDate}
                                            </Button>
                                        </div>
                                        <div className="address-box">
                                            {cpu.cpuAddress}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Graph Section */}
                    <div className="cpu-graph">
                        <div className="tabs">
                            <button
                                className={`tab-button ${activeTab === "status" ? "active" : ""}`}
                                onClick={() => setActiveTab("status")}
                            >
                                CPU Status
                            </button>
                            <button
                                className={`tab-button ${activeTab === "comparison" ? "active" : ""}`}
                                onClick={() => setActiveTab("comparison")}
                            >
                                Compare Components
                            </button>
                        </div>
                        <div className="tab-content">
                            {activeTab === "status" && (
                                <div className="chart-container">
                                    <ResponsiveContainer width="100%" height={350}>
                                        <BarChart
                                            data={statusData}
                                            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                                        >
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="name" />
                                            <YAxis />
                                            <Tooltip />
                                            <Bar
                                                dataKey="value"
                                                fill="#6C9BD1"
                                                name="CPU Count"
                                            />
                                        </BarChart>
                                    </ResponsiveContainer>
                                    <div className="chart-legend">
                                        <div className="legend-item">
                                            <div className="legend-color" style={{ backgroundColor: "#6C9BD1" }}></div>
                                            <span>CPU Count</span>
                                        </div>
                                    </div>
                                </div>
                            )}
                            {activeTab === "comparison" && (
                                <div className="chart-container">
                                    <ResponsiveContainer width="100%" height={350}>
                                        <BarChart
                                            data={componentComparisonData}
                                            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                                        >
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="name" />
                                            <YAxis />
                                            <Tooltip />
                                            <Bar dataKey="working" fill="#2ECC71" name="Working Components" />
                                            <Bar dataKey="removed" fill="#E74C3C" name="Removed Components" />
                                        </BarChart>
                                    </ResponsiveContainer>
                                    <div className="chart-legend">
                                        <div className="legend-item">
                                            <div className="legend-color" style={{ backgroundColor: "#2ECC71" }}></div>
                                            <span>Working Components</span>
                                        </div>
                                        <div className="legend-item">
                                            <div className="legend-color" style={{ backgroundColor: "#E74C3C" }}></div>
                                            <span>Removed Components</span>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </>
            )}
        </Container>
    );
};

export default Visualization; 