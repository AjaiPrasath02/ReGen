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
      // qrKey: "",
      // qrReady: false,
      errorMessage: "",
      successMessage: "",
      loading: false,
      QRcodePic: false,
      isAuthenticated: false,
      userRole: null,
      userAddress: "",
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





  // Register CPU with components
  registerCPUWithComponents = async (event) => {
    event.preventDefault();

    // Check authentication before proceeding
    if (!this.state.isAuthenticated) {
      this.setState({ errorMessage: "Not authenticated" });
      return;
    }

    this.setState({
      loading: true,
      errorMessage: "",
      successMessage: "",
      cpuQR: "" // Clear the previous QR code before new registration
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

      // Update state with new QR code and success message
      // this.setState({
      //   cpuQR,
      //   successMessage: "CPU registered successfully!"
      // });
      this.setState({
        cpuQR,
        successMessage: "CPU registered successfully!",
        // qrKey: Date.now(), // or any other unique value generator
        // qrReady: false,
      });


    } catch (err) {
      this.setState({ errorMessage: err.message });
    } finally {
      this.setState({ loading: false });
    }
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
    const { componentDetails, productionDate } = this.state;

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
              error={!!this.state.errorMessage}
              success={!!this.state.successMessage}
            >
              <Form.Field>
                <label>Model Name:</label>
                <Input
                  placeholder="Enter Model Name"
                  value={this.state.modelName}
                  onChange={(e) => this.setState({ modelName: e.target.value })}
                />
              </Form.Field>

              <Form.Field>
                <label>Serial Number:</label>
                <Input
                  placeholder="Enter Serial Number"
                  value={this.state.serialNumber}
                  onChange={(e) =>
                    this.setState({ serialNumber: e.target.value })
                  }
                />
              </Form.Field>

              <Form.Field>
                <label>Lab Number:</label>
                <Input
                  placeholder="Enter Lab Number"
                  value={this.state.labNumber}
                  onChange={(e) =>
                    this.setState({ labNumber: e.target.value })
                  }
                />
              </Form.Field>

              <Form.Field>
                <label>Production Date:</label>
                <Input
                  type="date" // Native HTML date picker
                  value={productionDate}
                  onChange={(e) =>
                    this.setState({ productionDate: e.target.value })
                  }
                  placeholder="Select Production Date"
                />
              </Form.Field>

              <h2 style={{ textAlign: "center" }} >Component Details</h2>
              {componentTypeOptions.map((option) => (
                <Form.Field key={option.key}>
                  <label>{option.text} Details:</label>
                  <Input
                    placeholder={`Enter ${option.text} Details`}
                    value={componentDetails[option.value]}
                    onChange={(e) =>
                      this.handleComponentDetailsChange(
                        option.value,
                        e.target.value
                      )
                    }
                  />
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
              <center><Button color="green" loading={this.state.loading} type="submit">
                Register CPU
              </Button></center>
            </Form>

            {/* {this.state.cpuQR && (
              <div style={{ marginTop: "20px", width: "100%", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column" }}>
                <h2>{this.state.cpuQR}</h2>
                <h4>CPU QR Code:</h4>
                {this.state.cpuQR && this.state.qrReady && (
                  <div ref={(ref) => { this.qrRef = ref; }}>
                    <QrCode
                      value={this.state.cpuQR}
                      size={400}
                      // key={this.state.qrKey} // using a unique key to force remount
                    />
                  </div>
                )}

                <Button
                  style={{ marginTop: "10px" }}
                  color="green"
                  onClick={() => {
                    const canvas = this.qrRef.querySelector('canvas');
                    if (canvas) {
                      const link = document.createElement('a');
                      link.download = `CPU-QR-${this.state.serialNumber || 'code'}.png`;
                      link.href = canvas.toDataURL('image/png');
                      link.click();
                    }
                  }}
                >
                  Download QR Code
                </Button>
              </div>
            )} */}

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

// Export with router
export default withRouter(ManufacturingMachinePage);
