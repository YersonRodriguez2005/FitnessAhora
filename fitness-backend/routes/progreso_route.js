// ruta para el controlador de progreso
const express = require('express');
const router = express.Router();
const { registrarSesion, obtenerEstadisticas } = require('../controllers/progreso.controller');

// Ruta para registrar una sesión de entrenamiento
router.post('/registrar', registrarSesion);

// Ruta para obtener estadísticas de progreso
router.get('/estadisticas/:id', obtenerEstadisticas);

module.exports = router;