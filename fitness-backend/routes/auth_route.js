//Ruta para el contorlador de auth
const express = require('express');
const { login, register, updateProfile, updateDias, updateAccount, changePassword} = require('../controllers/auth.controller');
const router = express.Router();

router.post('/login', login);
router.post('/register', register);
router.put('/update-profile/:id', updateProfile);
router.put('/update-dias/:id', updateDias);
router.put('/update-account/:id', updateAccount);
router.put('/change-password/:id', changePassword);

module.exports = router;