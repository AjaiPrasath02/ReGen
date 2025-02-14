import React, { Component } from "react";
import { Table, Container, Header, Input, Message, Button } from "semantic-ui-react";
import web3 from "../ethereum/web3";
import cpuContract from "../ethereum/cpuProduction"; // Adjust to your contract path

class AllCPUs extends Component {
  state = {
    cpus: [],
    loading: false,
    errorMessage: "",
    searchTerm: "", // track the current search
  };

  async componentDidMount() {
    try {
      this.setState({ loading: true, errorMessage: "" });

      const accounts = await web3.eth.getAccounts();
      if (!accounts || !accounts.length) {
        throw new Error("No MetaMask or Web3 account found. Please connect your wallet.");
      }

      // Call the contract method to retrieve CPU details
      const cpus = await cpuContract.methods.getAllCPUDetails().call({
        from: accounts[0],
      });


      

      console.log("Fetched CPU array:", cpus);
      this.setState({ cpus });
    } catch (err) {
      console.error("Error fetching CPU details:", err);
      this.setState({ errorMessage: err.message || "Error fetching CPU data." });
    } finally {
      this.setState({ loading: false });
    }
  }

  // Handle changes in the search box
  handleSearchChange = (e) => {
    this.setState({ searchTerm: e.target.value });
  };

  // Return the filtered list based on searchTerm
  getFilteredCPUs() {
    const { cpus, searchTerm } = this.state;
    const lowerTerm = searchTerm.toLowerCase().trim();

    // If no search term, show all
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
  }

  renderRows(filteredCPUs) {
    return filteredCPUs.map((cpu, index) => (
      <Table.Row key={index}>
        <Table.Cell>{cpu.modelName}</Table.Cell>
        <Table.Cell>{cpu.serialNumber}</Table.Cell>
        <Table.Cell>{cpu.status}</Table.Cell>
      </Table.Row>
    ));
  }

  render() {
    const { loading, errorMessage, searchTerm } = this.state;
    const filteredCPUs = this.getFilteredCPUs();

    return (
      <Container style={{ marginTop: "2em" }}>
        <Header as="h2" textAlign="center">
          All CPU Details
        </Header>

        {errorMessage && (
          <Message error header="Error" content={errorMessage} />
        )}

        <div style={{ width: "100%" }}>
          {/* Number of matched records */}
          <Button color="grey" style={{ marginBottom: "1em", float: "right", cursor: "default" }}>
            <strong>Records Found:</strong> {filteredCPUs.length}
          </Button>

          {/* Search bar */}
          <Input
            icon="search"
            placeholder="Search by model, serial, or status..."
            value={searchTerm}
            onChange={this.handleSearchChange}
            style={{ width: "100%", marginBottom: "1em" }}
          />


          {/* Table */}
          <div style={{ maxHeight: "300px", minHeight: "280px", overflowY: "auto" }}>
          <Table celled striped style={{ width: "100%" }} loading={loading.toString()}>
            <Table.Header>
              <Table.Row>
                <Table.HeaderCell>Model</Table.HeaderCell>
                <Table.HeaderCell>Serial Number</Table.HeaderCell>
                <Table.HeaderCell>Status</Table.HeaderCell>
              </Table.Row>
            </Table.Header>

            <Table.Body>{this.renderRows(filteredCPUs)}</Table.Body>
          </Table>
          </div>
        </div>
      </Container>
    );
  }
}

export default AllCPUs;
