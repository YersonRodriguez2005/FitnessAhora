const express = require('express');
const router  = express.Router(); 
const {
  getBiometria,
  registrarBiometria,
  eliminarRegistroBiometria,
} = require('../controllers/biometria.controller');

router.get('/biometria/:id', getBiometria);

router.post('/biometria/:id', registrarBiometria);

router.delete('/biometria/:id/registro/:registroId', eliminarRegistroBiometria);

module.exports = router;