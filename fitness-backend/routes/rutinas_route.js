// Ruta para el controlador de rutinas
const express = require('express');
const router = express.Router();
const { generarRutinaSemanal } = require('../controllers/rutinas.controller');

router.get('/generar', generarRutinaSemanal);

module.exports = router;