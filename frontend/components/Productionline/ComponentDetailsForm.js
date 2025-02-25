import React from 'react';
import { Form, Input, Label } from 'semantic-ui-react';

const componentTypeOptions = [
    { key: 1, text: "Processor", value: "Processor" },
    { key: 2, text: "RAM", value: "RAM" },
    { key: 3, text: "Hard Disk", value: "Hard Disk" },
    { key: 4, text: "Motherboard", value: "Motherboard" },
    { key: 5, text: "PSU", value: "PSU" },
];

const ComponentDetailsForm = ({ componentDetails, handleComponentDetailsChange, formErrors }) => {
    return (
        <>
            <h2 style={{ textAlign: "center" }}>Component Details</h2>
            {componentTypeOptions.map((option) => (
                <Form.Field
                    key={option.key}
                    error={!!formErrors[`component_${option.value}`]}
                >
                    <label>{option.text} Details:</label>
                    <Input
                        placeholder={`Enter ${option.text} Details`}
                        value={componentDetails[option.value] || ''}
                        onChange={(e) => handleComponentDetailsChange(option.value, e.target.value)}
                        required
                    />
                    {formErrors[`component_${option.value}`] && (
                        <Label basic color='red' pointing>
                            {formErrors[`component_${option.value}`]}
                        </Label>
                    )}
                </Form.Field>
            ))}
        </>
    );
};

export default ComponentDetailsForm;