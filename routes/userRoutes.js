const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// User routes
router.post('/create', userController.createUser);
router.post('/login', userController.loginUser);
router.get('/profile/:id', userController.getUserProfile);
router.put('/profile/:id', userController.updateUserProfile);
router.delete('/:id', userController.deleteUser);
router.get('/all', userController.getAllUsers);  // New route to get all users

module.exports = router;