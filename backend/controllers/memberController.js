const Member = require('../models/Member');

exports.getAllMembers = async (req, res) => {
    try {
        const members = await Member.find();
        res.status(200).json(members);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getMemberById = async (req, res) => {
    try {
        const member = await Member.findById(req.params.id).populate('borrowedBooks');
        if (!member) return res.status(404).json({ message: 'Member not found' });
        res.status(200).json(member);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.createMember = async (req, res) => {
    const member = new Member(req.body);
    try {
        const newMember = await member.save();
        res.status(201).json(newMember);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

exports.updateMember = async (req, res) => {
    try {
        const updatedMember = await Member.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.status(200).json(updatedMember);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

exports.deleteMember = async (req, res) => {
    try {
        await Member.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: 'Member deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
