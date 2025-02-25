import React, { useState, useEffect } from 'react';
import { Menu, Container } from 'semantic-ui-react';
import { useRouter } from 'next/router';
import web3 from '../ethereum/web3';
import registerContract from '../ethereum/register';
import { useAuth } from '../context/AuthContext';
import StakeholderForm from '../components/Registration/StakeHolderForm';

// Main registration page component
const RegistrationPage = () => {
    const router = useRouter();
    const { isAuthenticated, userRole, walletAddress } = useAuth();
    const [selectedRole, setSelectedRole] = useState('manufacturer');

    // Check authentication and wallet connection on mount
    useEffect(() => {
        const checkAuth = async () => {
            try {
                const accounts = await web3.eth.getAccounts();

                if (!isAuthenticated || userRole !== 'municipality') {
                    router.push('/unauthorized');
                    return;
                }

                if (!accounts || !accounts[0]) {
                    router.push('/connect-wallet');
                    return;
                }

                if (accounts[0].toLowerCase() !== walletAddress?.toLowerCase()) {
                    router.push('/connect-wallet');
                    return;
                }
            } catch (error) {
                console.error('Error checking authentication:', error);
                router.push('/unauthorized');
            }
        };

        checkAuth();
    }, [isAuthenticated, userRole, walletAddress]);

    // Generate form fields based on role
    const getFields = (role) => {
        const roleName = role.charAt(0).toUpperCase() + role.slice(1);
        const baseFields = [
            { name: 'email', label: `${roleName} Email`, type: 'email' },
            { name: 'password', label: 'Password', type: 'password' },
            { name: 'name', label: `${roleName} Name`, type: 'text' },
            { name: 'walletAddress', label: 'Wallet Address', type: 'text' },
            { name: 'location', label: 'Location', type: 'text' },
        ];

        if (role === 'labassistant') {
            baseFields.push({ name: 'labNumber', label: 'Lab Number', type: 'text' });
        }

        return baseFields;
    };

    // Configuration for each stakeholder role
    const roleConfigs = {
        manufacturer: {
            roleName: 'Manufacturer',
            fields: getFields('manufacturer'),
            registrationFunction: registerContract.methods.registerManufacturer,
            argOrder: ['walletAddress', 'location', 'name'],
        },
        technician: {
            roleName: 'Technician',
            fields: getFields('technician'),
            registrationFunction: registerContract.methods.registerTechnician,
            argOrder: ['walletAddress', 'location', 'name'],
        },
        labassistant: {
            roleName: 'Lab Assistant',
            fields: getFields('labassistant'),
            registrationFunction: registerContract.methods.registerLabAssistant,
            argOrder: ['walletAddress', 'location', 'name', 'labNumber'],
        },
    };

    return (
        <div className="Registration" style={{ minHeight: '500px' }}>
            <h2>Select a stakeholder to register</h2>
            <Menu widths={3}>
                <Menu.Item
                    name="Manufacturer"
                    active={selectedRole === 'manufacturer'}
                    onClick={() => setSelectedRole('manufacturer')}
                />
                <Menu.Item
                    name="Technician"
                    active={selectedRole === 'technician'}
                    onClick={() => setSelectedRole('technician')}
                />
                <Menu.Item
                    name="Lab Assistant"
                    active={selectedRole === 'labassistant'}
                    onClick={() => setSelectedRole('labassistant')}
                />
            </Menu>
            <Container>
                <StakeholderForm {...roleConfigs[selectedRole]} role={selectedRole} />
            </Container>
        </div>
    );
};

export default RegistrationPage;