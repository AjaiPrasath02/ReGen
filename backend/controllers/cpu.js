const Cpu = require('../models/cpuModel')
const { generateEmbeddings } = require('./helpers/embeddings')

// Register a new CPU
const registerCPU = async (req, res) => {
    const { cpuData } = req.body

    try {
        if (!cpuData?.cpuAddress) {
            throw Error('All fields must be filled')
        }

        const embeddings = await generateEmbeddings(cpuData)
        const cpuAddress = cpuData.cpuAddress

        const cpu = await Cpu.create({ cpuAddress, embeddings })
        res.status(200).json(cpu)
    } catch (error) {
        res.status(400).json({ error: error.message })
    }
}

// Update an existing CPU
const updateCPU = async (req, res) => {
    const { cpuData } = req.body

    try {
        if (!cpuData[0].data.cpuAddress) {
            throw Error('CPU address is required for update')
        }

        const cpuAddress = cpuData[0].data.cpuAddress

        // Find the existing CPU by cpuAddress
        const existingCpu = await Cpu.findOne({ cpuAddress })
        
        if (!existingCpu) {
            throw Error('CPU not found')
        }

        // Generate new embeddings if cpuData contains update information
        let embeddings;
        if (cpuData) {
            embeddings = await generateEmbeddings(cpuData)
        }

        // Update the CPU with new data
        const updatedCpu = await Cpu.findOneAndUpdate(
            { cpuAddress },
            { 
                cpuAddress,
                embeddings 
            }
        )

        res.status(200).json(updatedCpu)
    } catch (error) {
        res.status(400).json({ error: error.message })
    }
}

module.exports = { registerCPU, updateCPU }