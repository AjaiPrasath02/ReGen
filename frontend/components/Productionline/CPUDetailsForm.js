import React from 'react';
import { Form, Input, Label } from 'semantic-ui-react';

const CPUDetailsForm = ({ state, handleInputChange, formErrors }) => {
    return (
        <>
            <Form.Field error={!!formErrors.modelName}>
                <label>Model Name:</label>
                <Input
                    placeholder="Enter Model Name"
                    value={state.modelName}
                    onChange={(e) => handleInputChange('modelName', e.target.value)}
                    required
                />
                {formErrors.modelName && (
                    <Label basic color='red' pointing>
                        {formErrors.modelName}
                    </Label>
                )}
            </Form.Field>

            <Form.Field error={!!formErrors.serialNumber}>
                <label>Serial Number:</label>
                <Input
                    placeholder="Enter Serial Number"
                    value={state.serialNumber}
                    onChange={(e) => handleInputChange('serialNumber', e.target.value)}
                    required
                />
                {formErrors.serialNumber && (
                    <Label basic color='red' pointing>
                        {formErrors.serialNumber}
                    </Label>
                )}
            </Form.Field>

            <Form.Field error={!!formErrors.labNumber}>
                <label>Lab Number:</label>
                <Input
                    placeholder="Enter Lab Number"
                    value={state.labNumber}
                    onChange={(e) => handleInputChange('labNumber', e.target.value)}
                    required
                />
                {formErrors.labNumber && (
                    <Label basic color='red' pointing>
                        {formErrors.labNumber}
                    </Label>
                )}
            </Form.Field>

            <Form.Field error={!!formErrors.productionDate}>
                <label>Production Date:</label>
                <Input
                    type="date"
                    value={state.productionDate}
                    onChange={(e) => handleInputChange('productionDate', e.target.value)}
                    placeholder="Select Production Date"
                    required
                />
                {formErrors.productionDate && (
                    <Label basic color='red' pointing>
                        {formErrors.productionDate}
                    </Label>
                )}
            </Form.Field>
        </>
    );
};

export default CPUDetailsForm;