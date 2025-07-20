const express = require('express');
const AdminUser = require('../models/AdminUser');
const StaffUser = require('../models/StaffUser');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const router = express.Router();

// Middleware to authenticate the token
const verifyToken = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1]; // Token comes in the Authorization header as "Bearer <token>"

  if (!token) {
    return res.status(401).json({ message: 'Token is required' });
  }

  try {
    // Verify the token using the JWT secret
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.adminId = decoded.id;  // Store the admin ID in the request object
    next();  // Proceed to the next middleware or route handler
  } catch (error) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};

// Registration (Admin or Staff)
router.post('/register', async (req, res) => {
  const { email, userID, password, confirmPassword, role } = req.body;

  try {
    if (role === 'staff') {
      if (!userID) return res.status(400).json({ message: 'UserID is required for staff' });
      if (password !== confirmPassword) {
        return res.status(400).json({ message: 'Passwords do not match' });
      }
      // Check for duplicate staff userID
      const existingStaff = await StaffUser.findOne({ userID });
      if (existingStaff) {
        return res.status(400).json({ message: 'Staff userID already exists' });
      }
      const hashedPassword = await bcrypt.hash(password, 10);
      const staffUser = new StaffUser({
        userID,
        password: hashedPassword,
        role: 'staff'
      });
      await staffUser.save();
      res.status(201).json({
        message: 'Staff created successfully',
        user: {
          userID: staffUser.userID,
          role: staffUser.role,
          createdAt: staffUser.createdAt,
          updatedAt: staffUser.updatedAt
        }
      });
    } else {
      if (!email) return res.status(400).json({ message: 'Email is required for admin' });
      if (password !== confirmPassword) {
        return res.status(400).json({ message: 'Passwords do not match' });
      }
      // Check for duplicate admin email
      const existingAdmin = await AdminUser.findOne({ email });
      if (existingAdmin) {
        return res.status(400).json({ message: 'Admin email already exists' });
      }
      const hashedPassword = await bcrypt.hash(password, 10);
      const adminUser = new AdminUser({
        email,
        password: hashedPassword,
        role: role || 'admin'
      });
      await adminUser.save();
      res.status(201).json({
        message: 'Admin created successfully',
        user: {
          email: adminUser.email,
          role: adminUser.role,
          createdAt: adminUser.createdAt,
          updatedAt: adminUser.updatedAt
        }
      });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error registering user', error });
  }
});

// Login (Admin or Staff)
router.post('/login', async (req, res) => {
  const { email, userID, password, role } = req.body;
  try {
    let user;
    if (role === 'staff') {
      if (!userID) return res.status(400).json({ message: 'UserID is required for staff login' });
      user = await StaffUser.findOne({ userID });
    } else if (role === 'admin' || role === 'superadmin') {
      if (!email) return res.status(400).json({ message: 'Email is required for admin login' });
      user = await AdminUser.findOne({ email });
    } else {
      return res.status(400).json({ message: 'Role is required (admin, superadmin, staff)' });
    }
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.json({ token, role: user.role });
  } catch (error) {
    res.status(500).json({ message: 'Error logging in', error });
  }
});

// Admin GET Route (Get All Admins) - Protected Route
router.get('/admins', verifyToken, async (req, res) => {
  try {
    const admins = await AdminUser.find();
    if (!admins.length) {
      return res.status(404).json({ message: 'No admins found' });
    }
    res.json(admins);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching admins', error });
  }
});

// Staff GET Route (Get All Staff Users) - Protected Route
router.get('/staff', verifyToken, async (req, res) => {
  try {
    const staff = await StaffUser.find();
    if (!staff.length) {
      return res.status(404).json({ message: 'No staff users found' });
    }
    res.json(staff);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching staff users', error });
  }
});

// Admin DELETE Route (Delete Admin) - Protected Route
router.delete('/admin', verifyToken, async (req, res) => {
  const { adminId } = req.body; // Get the adminId from the request body
  try {
    const admin = await AdminUser.findByIdAndDelete(adminId); // Find and delete the admin by ID
    if (!admin) {
      return res.status(404).json({ message: 'Admin not found' });
    }
    res.json({ message: 'Admin deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting admin', error });
  }
});

// Common DELETE Route (Delete Admin or Staff) - Protected Route
router.delete('/user', verifyToken, async (req, res) => {
  const { userId, role } = req.body; // userId: _id of user, role: 'admin' or 'staff'
  try {
    let deletedUser;
    if (role === 'admin') {
      deletedUser = await AdminUser.findByIdAndDelete(userId);
    } else if (role === 'staff') {
      deletedUser = await StaffUser.findByIdAndDelete(userId);
    } else {
      return res.status(400).json({ message: 'Invalid role specified' });
    }
    if (!deletedUser) {
      return res.status(404).json({ message: `${role.charAt(0).toUpperCase() + role.slice(1)} not found` });
    }
    res.json({ message: `${role.charAt(0).toUpperCase() + role.slice(1)} deleted successfully` });
  } catch (error) {
    res.status(500).json({ message: `Error deleting ${role}`, error });
  }
});

// Admin Logout
router.post('/logout', (req, res) => {
  try {
    // Since JWT is stateless, we can simply tell the client to remove the token
    // The client should handle removing the token from storage (localStorage, sessionStorage, or cookies)

    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error logging out', error });
  }
});

module.exports = router;
