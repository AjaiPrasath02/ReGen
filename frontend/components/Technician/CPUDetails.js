import React from 'react';
import { Form, Input, Button, Header } from 'semantic-ui-react';

const CPUDetails = ({
    cpuModel,
    cpuSerial,
    cpuStatus,
    productionDate,
    cpuLabNumber,
    components,
    onLabNumberChange,
    onComponentAction,
    onComponentDetailChange,
    loadingButton,
}) => {
    return (
        <>
            <Form>
                <Form.Group widths="equal">
                    <Form.Field>
                        <label>Model</label>
                        <Input readOnly placeholder="Model" value={cpuModel} />
                    </Form.Field>
                    <Form.Field>
                        <label>Serial</label>
                        <Input readOnly placeholder="Serial" value={cpuSerial} />
                    </Form.Field>
                    <Form.Field>
                        <label>Status</label>
                        <Input readOnly placeholder="Status" value={cpuStatus} />
                    </Form.Field>
                    <Form.Field>
                        <label>Production Date</label>
                        <Input readOnly placeholder="Production Date" value={productionDate} />
                    </Form.Field>
                </Form.Group>
            </Form>

            <Form>
                <Form.Group style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
                    <Form.Field width="100%" style={{ flex: '1' }}>
                        <label>Lab Number</label>
                        <Input
                            placeholder="Lab Number"
                            value={cpuLabNumber}
                            onChange={(e) => onLabNumberChange(e.target.value)}
                        />
                    </Form.Field>
                    <Form.Field style={{ display: 'flex', alignItems: 'flex-end', gap: '0.5em' }}>
                        <Button
                            color="green"
                            onClick={() => onComponentAction(null, 'updateLabNumber')}
                            loading={loadingButton === 'updateLabNumber'}
                        >
                            Change Lab Number
                        </Button>
                    </Form.Field>
                </Form.Group>
            </Form>

            <div style={{ width: '100%' }}>
                <Header as="h2" textAlign="center" style={{ marginTop: '10px', marginBottom: '10px' }}>
                    Components
                </Header>

                <Form style={{ marginTop: '1em', width: '100%' }}>
                    {components.map((component, idx) => (
                        <Form.Group
                            key={idx}
                            style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}
                        >
                            <Form.Field width="100%" style={{ flex: '1' }}>
                                <label>{component.componentType}</label>
                                <Input
                                    placeholder={`Enter ${component.componentType} Details`}
                                    value={component.details}
                                    onChange={(e) => onComponentDetailChange(idx, e.target.value)}
                                />
                            </Form.Field>
                            <Form.Field style={{ display: 'flex', alignItems: 'flex-end', gap: '0.5em' }}>
                                <Button
                                    color="green"
                                    onClick={() => onComponentAction(idx, 'update')}
                                    loading={loadingButton === `update-${idx}`}
                                >
                                    Update
                                </Button>
                                <Button
                                    color="red"
                                    disabled={component.status === 'Removed'}
                                    onClick={() => onComponentAction(idx, 'remove')}
                                    loading={loadingButton === `remove-${idx}`}
                                >
                                    Remove
                                </Button>
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