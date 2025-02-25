import React from 'react';
import { Form, Input, Button, Header } from 'semantic-ui-react';

const CPUDetails = ({
    cpuModel,
    cpuSerial,
    cpuStatus,
    cpuLabNumber,
    productionDate,
    components,
    errorMessage,
    onBack,
    onReportIssue,
}) => {
    return (
        <>
            <div style={{ marginBottom: '1em', display: 'flex', justifyContent: 'space-between' }}>
                <Button
                    icon="arrow left"
                    content="Back to Scanner"
                    color="blue"
                    onClick={onBack}
                    style={{ marginRight: '1em' }}
                />
                <Button
                    icon="warning circle"
                    content="Report Issue"
                    color="red"
                    onClick={onReportIssue}
                />
            </div>

            <Form>
                <Form.Group widths="equal">
                    <Form.Field>
                        <label>Lab Number</label>
                        <Input readOnly value={cpuLabNumber} />
                    </Form.Field>
                    <Form.Field>
                        <label>Model</label>
                        <Input readOnly value={cpuModel} />
                    </Form.Field>
                    <Form.Field>
                        <label>Serial</label>
                        <Input readOnly value={cpuSerial} />
                    </Form.Field>
                    <Form.Field>
                        <label>Status</label>
                        <Input readOnly value={cpuStatus} />
                    </Form.Field>
                    <Form.Field>
                        <label>Production Date</label>
                        <Input readOnly value={productionDate} />
                    </Form.Field>
                </Form.Group>
            </Form>

            <div style={{ width: '100%' }}>
                <Header as="h2" textAlign="center" style={{ marginTop: '10px', marginBottom: '10px' }}>
                    Components
                </Header>

                <Form error={!!errorMessage} style={{ marginTop: '1em', width: '100%' }}>
                    {components.map((component, idx) => (
                        <Form.Group
                            key={idx}
                            style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}
                        >
                            <Form.Field width="100%" style={{ flex: '1' }}>
                                <label>{component.componentType}</label>
                                <Input
                                    readOnly
                                    value={component.details}
                                    style={{ backgroundColor: '#f9f9f9' }}
                                />
                            </Form.Field>
                            <Form.Field style={{ marginLeft: '1em' }}>
                                <Button color="orange" style={{ cursor: 'default' }}>
                                    {component.status}
                                </Button>
                            </Form.Field>
                        </Form.Group>
                    ))}
                </Form>
            </div>
        </>
    );
};

export default CPUDetails;