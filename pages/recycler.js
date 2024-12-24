import React, { Component } from "react";
import {
  Button,
  Message,
  Form,
  Container,
  Grid,
  Input,
} from "semantic-ui-react";
import web3 from "../ethereum/web3";
import cpuContract from "../ethereum/cpuProduction"; // Updated contract
import registerSC from "../ethereum/register";
import dynamic from "next/dynamic";
import Layout from "../components/Layout";
import { withRouter } from "next/router";
const QrReader = dynamic(() => import("react-qr-reader"), { ssr: false });

class TechnicianPage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      cpuAddress: "",
      components: [], // Store components array
      componentDetails: {
        Processor: "",
        RAM: "",
        "Hard Disk": "",
        Motherboard: "",
        PSU: "",
      },
      errorMessage: "",
      successMessage: "",
      loading: false,
      isAuthenticated: false,
      userRole: null,
      userAddress: "",
      qrScanned: false,
      cpuModel: "",
      cpuSerial: "",
      cpuStatus: "",
    };
  }

  componentDidMount = async () => {
    try {
      const token = localStorage.getItem("token");
      const role = localStorage.getItem("role");
      const userAddress = localStorage.getItem("userAddress");
      const accounts = await web3.eth.getAccounts();

      // Check basic auth
      if (!token || !role || !userAddress) {
        this.props.router.push("/login");
        return;
      }

      // Check role - only technician can access this page
      if (role !== "technician") {
        this.props.router.push("/unauthorized");
        return;
      }

      // Check wallet connection
      if (!accounts || !accounts[0]) {
        this.props.router.push("/connect-wallet");
        return;
      }

      // Check if connected wallet matches userAddress
      if (accounts[0].toLowerCase() !== userAddress.toLowerCase()) {
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
      this.props.router.push("/unauthorized");
    }
  };

  handleScan = async (data) => {
    if (data) {
      console.log("Scanned Data (CPU Address):", data); // Log the scanned CPU address
  
      try {
        const cpuAddress = data.trim(); // The QR code contains the CPU address
        this.setState({ cpuAddress, qrScanned: true });
  
        console.log("Fetching CPU details from contract...");
        const Address = generateUniqueCPUAddress(manufacturerID, modelName, serialNumber);
        console.log("Generated CPU Address: ", cpuAddress);
    
        // Fetch CPU details from the smart contract
        const cpuDetails = await cpuContract.methods.getCPU(cpuAddress).call();
  
        console.log("Fetched CPU Details:", cpuDetails); // Log the result of the getCPU call
  
        // Check the response structure
        if (cpuDetails && cpuDetails.length >= 5) {
          console.log("Model Name:", cpuDetails[0]);
          console.log("Serial Number:", cpuDetails[1]);
          console.log("Status:", cpuDetails[2]);
          console.log("Production Date:", cpuDetails[3]);
          console.log("Component Count:", cpuDetails[4]);
  
          // Update state with fetched CPU details
          this.setState({
            cpuModel: cpuDetails[0],  // Model name
            cpuSerial: cpuDetails[1], // Serial number
            cpuStatus: cpuDetails[2], // Status
            cpuProductionDate: new Date(cpuDetails[3] * 1000).toLocaleDateString(), // Convert Unix timestamp to date string
          });
  
          // Now fetch components for this CPU (if needed)
          const componentCount = parseInt(cpuDetails[4], 10); // Ensure it's a number
          let components = [];
          for (let i = 0; i < componentCount; i++) {
            const component = await cpuContract.methods.getComponent(i).call();
            components.push(component);
          }
  
          // Update state with the list of components
          this.setState({ components });
        } else {
          console.log("No CPU details found or invalid data format.");
        }
  
      } catch (err) {
        console.error("Error fetching CPU details:", err);
        this.setState({ errorMessage: "Error fetching CPU details." });
      }
    }
  };
  
  


  handleError = (err) => {
    this.setState({ errorMessage: err.message });
  };

  // Handle component details change
  handleComponentDetailsChange = (componentType, value) => {
    this.setState((prevState) => ({
      componentDetails: {
        ...prevState.componentDetails,
        [componentType]: value,
      },
    }));
  };

  // Update component details
  updateComponentDetails = async (componentID) => {
    const { cpuAddress, componentDetails } = this.state;
    const updatedValue = componentDetails[componentID];

    try {
      this.setState({ loading: true, errorMessage: "", successMessage: "" });

      const accounts = await web3.eth.getAccounts();

      // Update the component using the contract
      await cpuContract.methods
        .updateComponent(componentID, "Updated", updatedValue) // Pass correct values for status/details
        .send({ from: accounts[0] });

      this.setState({ successMessage: `${componentID} updated successfully!` });
    } catch (err) {
      this.setState({ errorMessage: "Error updating component." });
    } finally {
      this.setState({ loading: false });
    }
  };

  // Remove component
  removeComponent = async (componentID) => {
    const { cpuAddress } = this.state;

    try {
      this.setState({ loading: true, errorMessage: "", successMessage: "" });

      const accounts = await web3.eth.getAccounts();

      // Call contract method to remove component
      await cpuContract.methods.removeComponent(cpuAddress, componentID).send({
        from: accounts[0],
      });

      // Remove the component from state
      this.setState((prevState) => ({
        components: prevState.components.filter(comp => comp.componentID !== componentID)
      }));

      this.setState({ successMessage: `Component ${componentID} removed successfully!` });
    } catch (err) {
      this.setState({ errorMessage: "Error removing component." });
    } finally {
      this.setState({ loading: false });
    }
  };

  render() {
    const { components, cpuAddress, qrScanned, cpuModel, cpuSerial, cpuStatus } = this.state;

    return (
      <Container>
        <link
          rel="stylesheet"
          href="//cdn.jsdelivr.net/npm/semantic-ui@2.4.1/dist/semantic.min.css"
        />
        <Grid centered>
          <Grid.Column width={12}>
            <h2>Technician - Update/Remove Components</h2>

            {/* QR Scanner */}
            {!qrScanned ? (
              <div>
                <h3>Scan CPU QR Code to fetch details</h3>
                <QrReader
                  delay={300}
                  style={{ width: "50%" }}
                  onScan={this.handleScan}
                  onError={this.handleError}
                />
              </div>
            ) : (
              <div>
                <h3>CPU Address: {cpuAddress}</h3>
                <h4>Model: {cpuModel}</h4>
                <h4>Serial Number: {cpuSerial}</h4>
                <h4>Status: {cpuStatus}</h4>
                <Form error={!!this.state.errorMessage} success={!!this.state.successMessage}>
                  {components.map((component, idx) => (
                    <Form.Field key={idx}>
                      <label>{component.componentType} Details:</label>
                      <Input
                        placeholder={`Enter ${component.componentType} Details`}
                        value={component.details}
                        onChange={(e) =>
                          this.handleComponentDetailsChange(component.componentType, e.target.value)
                        }
                      />
                      <Button
                        color="green"
                        onClick={() => this.updateComponentDetails(component.componentID)}
                        loading={this.state.loading}
                      >
                        Update {component.componentType}
                      </Button>
                      <Button
                        color="red"
                        onClick={() => this.removeComponent(component.componentID)}
                        loading={this.state.loading}
                      >
                        Remove {component.componentType}
                      </Button>
                    </Form.Field>
                  ))}

                  <Message error header="Error" content={this.state.errorMessage} />
                  <Message success header="Success" content={this.state.successMessage} />
                </Form>
              </div>
            )}
          </Grid.Column>
        </Grid>
      </Container>
    );
  }
}

export default withRouter(TechnicianPage);
