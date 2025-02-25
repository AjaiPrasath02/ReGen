import React from 'react';
import { Modal, Table, Button, Label } from 'semantic-ui-react';

const ComplaintsTableModal = ({ isOpen, onClose, complaints, statusFilter, setStatusFilter }) => {
    const filteredComplaints = complaints.filter(
        (complaint) => statusFilter === 'all' || complaint.status === statusFilter
    );

    return (
        <Modal open={isOpen} onClose={onClose} size="large">
            <Modal.Header>Reported CPU Issues</Modal.Header>
            <Modal.Content>
                <div style={{ marginBottom: '1em' }}>
                    <Button.Group>
                        <Button active={statusFilter === 'all'} onClick={() => setStatusFilter('all')}>
                            All
                        </Button>
                        <Button
                            active={statusFilter === 'pending'}
                            onClick={() => setStatusFilter('pending')}
                            color="yellow"
                        >
                            Pending
                        </Button>
                        <Button
                            active={statusFilter === 'resolved'}
                            onClick={() => setStatusFilter('resolved')}
                            color="green"
                        >
                            Resolved
                        </Button>
                    </Button.Group>
                </div>

                {filteredComplaints.length === 0 ? (
                    <div>No {statusFilter !== 'all' ? statusFilter : ''} issues reported</div>
                ) : (
                    <div style={{ maxHeight: '400px', minHeight: '350px', overflowY: 'auto' }}>
                        <Table celled>
                            <Table.Header>
                                <Table.Row>
                                    <Table.HeaderCell>CPU Model</Table.HeaderCell>
                                    <Table.HeaderCell>Serial Number</Table.HeaderCell>
                                    <Table.HeaderCell>Issue Description</Table.HeaderCell>
                                    <Table.HeaderCell>Date</Table.HeaderCell>
                                    <Table.HeaderCell>Status</Table.HeaderCell>
                                </Table.Row>
                            </Table.Header>
                            <Table.Body>
                                {filteredComplaints.map((complaint) => (
                                    <Table.Row key={complaint._id}>
                                        <Table.Cell>{complaint.modelName}</Table.Cell>
                                        <Table.Cell>{complaint.serialNumber}</Table.Cell>
                                        <Table.Cell>{complaint.message}</Table.Cell>
                                        <Table.Cell>
                                            {new Date(complaint.createdAt).toLocaleDateString()}
                                        </Table.Cell>
                                        <Table.Cell>
                                            <Label
                                                color={complaint.status === 'pending' ? 'yellow' : 'green'}
                                                style={{
                                                    textTransform: 'capitalize',
                                                    width: '100%',
                                                    height: '35px',
                                                    alignContent: 'center',
                                                    textAlign: 'center',
                                                }}
                                            >
                                                {complaint.status}
                                            </Label>
                                        </Table.Cell>
                                    </Table.Row>
                                ))}
                            </Table.Body>
                        </Table>
                    </div>
                )}
            </Modal.Content>
            <Modal.Actions>
                <Button color="black" onClick={onClose}>
                    Close
                </Button>
            </Modal.Actions>
        </Modal>
    );
};

export default ComplaintsTableModal;