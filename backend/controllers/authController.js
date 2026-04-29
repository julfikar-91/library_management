const Admin = require('../models/Admin');
const jwt = require('jsonwebtoken');
const Member = require('../models/Member');

exports.register = async (req, res) => {
    const { role, email, password, phone, name, memberId, address, department, semester } = req.body;
    try {
        if (role === 'admin') {
            const existingAdmin = await Admin.findOne({ email });
            if (existingAdmin) return res.status(400).json({ message: 'Admin already exists' });
            
            const admin = new Admin({ email, phone, password });
            await admin.save();
            return res.status(201).json({ message: 'Admin registered successfully' });
        } else if (role === 'student') {
            const existingStudent = await Member.findOne({ email });
            if (existingStudent) return res.status(400).json({ message: 'Student already exists' });
            
            const student = new Member({ memberId, name, email, phone, address, password, department, semester });
            await student.save();
            return res.status(201).json({ message: 'Student registered successfully' });
        } else {
            return res.status(400).json({ message: 'Invalid role specified' });
        }
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.login = async (req, res) => {
    const { email, password, role } = req.body;
    try {
        let user;
        let userRole = role;
        
        if (role === 'admin') {
            user = await Admin.findOne({ email });
        } else if (role === 'student') {
            user = await Member.findOne({ email });
        } else {
            user = await Admin.findOne({ email });
            if (user) {
                userRole = 'admin';
            } else {
                user = await Member.findOne({ email });
                if (user) userRole = 'student';
            }
        }

        if (!user || user.password !== password) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const finalRole = user.role || userRole || (user.memberId ? 'student' : 'admin');

        // Generate 12 Hour Token
        const token = jwt.sign(
            { id: user._id, email: user.email, role: finalRole },
            process.env.JWT_SECRET || 'mrem_library_super_secret_key',
            { expiresIn: '12h' }
        );

        res.status(200).json({ 
            message: 'Login successful', 
            token,
            user: { 
                id: user._id,
                email: user.email, 
                phone: user.phone,
                role: finalRole,
                name: user.name,
                memberId: user.memberId
            } 
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.forgotPassword = async (req, res) => {
    const { email } = req.body;
    try {
        let user = await Admin.findOne({ email });
        let isMember = false;
        if (!user) {
            user = await Member.findOne({ email });
            isMember = true;
        }

        if (!user) {
            return res.status(404).json({ message: 'No registered user with this email address' });
        }
        
        // Generate 4-digit OTP
        const otp = Math.floor(1000 + Math.random() * 9000).toString();
        
        user.resetOtp = otp;
        user.otpExpiry = new Date(Date.now() + 10 * 60000); // 10 minutes
        await user.save();

        console.log(`\n\n=== EMAIL GATEWAY SIMULATION ===`);
        console.log(`Sending Password Reset OTP: ${otp} to Email: ${email}`);
        console.log(`==============================\n\n`);

        res.status(200).json({ message: 'OTP sent to your email successfully' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.resetPassword = async (req, res) => {
    const { email, otp, newPassword } = req.body;
    try {
        let user = await Admin.findOne({ email, resetOtp: otp });
        if (!user) {
            user = await Member.findOne({ email, resetOtp: otp });
        }
        
        if (!user) {
            return res.status(400).json({ message: 'Invalid OTP' });
        }
        
        if (new Date() > user.otpExpiry) {
            return res.status(400).json({ message: 'OTP has expired' });
        }

        user.password = newPassword;
        user.resetOtp = undefined;
        user.otpExpiry = undefined;
        await user.save();

        res.status(200).json({ message: 'Password reset successfully!' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
