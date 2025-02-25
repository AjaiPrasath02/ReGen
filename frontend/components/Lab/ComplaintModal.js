import React from 'react';
import { Modal, Form, Input, Button, Message } from 'semantic-ui-react';

const ComplaintModal = ({
    isOpen,
    onClose,
    complaintMessage,
    setComplaintMessage,
    errorMessage,
    cpuModel,
    cpuSerial,
    cpuLabNumber,
    onSubmit,
    submitting,
}) => {
    return (
        <Modal open={isOpen} onClose={onClose}>
            <Modal.Header>Report CPU Issue</Modal.Header>
            <Modal.Content>
                {errorMessage && <Message error>{errorMessage}</Message>}
                <Form>
                    <Form.Field>
                        <label>CPU Model</label>
                        <Input value={cpuModel} readOnly />
                    </Form.Field>
                    <Form.Field>
                        <label>Serial Number</label>
                        <Input value={cpuSerial} readOnly />
                    </Form.Field>
                    <Form.Field>
                        <label>Lab Number</label>
                        <Input value={cpuLabNumber} readOnly />
                    </Form.Field>
                    <Form.TextArea
                        label="Issue Description"
                        placeholder="Describe the issue..."
                        value={complaintMessage || ''}
                        onChange={(e) => setComplaintMessage(e.target.value)}
                        required
                    />
                </Form>
            </Modal.Content>
            <Modal.Actions>
                <Button color="black" onClick={onClose}>
                    Cancel
                </Button>
                <Button
                    color="green"
                    onClick={onSubmit}
                    loading={submitting}
                    disabled={!(complaintMessage || '').trim()}
                >
                    Submit
                </Button>
            </Modal.Actions>
        </Modal>
    );
};

export default ComplaintModal;