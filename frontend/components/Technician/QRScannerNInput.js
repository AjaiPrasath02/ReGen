import React from 'react';
import { Button, Segment, Header, Form, Input } from 'semantic-ui-react';
import dynamic from 'next/dynamic';
import QrScanner from 'qr-scanner';

const QrReader = dynamic(() => import('react-qr-reader'), { ssr: false });

const QRScannerNInput = ({ onScan, onError, onFileUpload, cpuAddress, setCpuAddress }) => {
    return (
        <>
            <Header as="h2" style={{ marginTop: '10px' }} textAlign="center">
                Scan or Upload QR Code
            </Header>

            <QrReader
                delay={1000}
                style={{ width: '100%', maxWidth: '400px', margin: '0 auto' }}
                onScan={onScan}
                onError={onError}
            />

            <div style={{ marginTop: '1.5em', textAlign: 'center' }}>
                <Button
                    as="label"
                    htmlFor="file"
                    type="button"
                    color="green"
                    style={{ backgroundColor: '#21ba45', color: '#fff' }}
                >
                    Upload QR Image
                </Button>
                <input
                    type="file"
                    id="file"
                    accept="image/*"
                    style={{ display: 'none' }}
                    onChange={onFileUpload}
                />
            </div>

            <Segment basic style={{ marginTop: '2em' }}>
                <Header as="h3" textAlign="center">
                    Or Enter CPU Address Manually
                </Header>
                <Form
                    onSubmit={(e) => {
                        e.preventDefault();
                        onScan(cpuAddress);
                    }}
                    style={{ display: 'flex', justifyContent: 'space-between' }}
                >
                    <Form.Field style={{ width: '77%' }}>
                        <Input
                            placeholder="Enter CPU Address..."
                            value={cpuAddress}
                            onChange={(e) => setCpuAddress(e.target.value)}
                            fluid
                        />
                    </Form.Field>
                    <Form.Field style={{ width: '20%' }}>
                        <Button color="blue" type="submit">
                            Search
                        </Button>
                    </Form.Field>
                </Form>
            </Segment>
        </>
    );
};

export default QRScannerNInput;