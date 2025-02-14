const User = require('../models/userModel')
const jwt = require('jsonwebtoken')

const createToken = (_id) => {
    return jwt.sign({ _id }, 'hcbkscsdcuosdcoopscind', { expiresIn: '3d' }) // {_id: _id, SECRET. options}
}

// login user
const loginUser = async (req, res) => {
    const { email, password, role } = req.body;
    
    try {
        const user = await User.login(email, password, role);
        const token = createToken(user._id);
        
        res.status(200).json({
            email,
            token,
            role: user.role,
            name: user.name,
            walletAddress: user.walletAddress
        });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
}


// signup user
const signupUser = async (req, res) => {
    const { email, password, name, role, walletAddress, location, labNumber } = req.body;

    try {
        const user = await User.signup(email, password, name, role, walletAddress, location, labNumber);
        const token = createToken(user._id);
        
        res.status(200).json({
            email,
            token,
            role: user.role,
            name: user.name,
            walletAddress: user.walletAddress,
            location: user.location,
            labNumber: user.labNumber
        });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
}

module.exports = { loginUser, signupUser }