// Controlador para las rutas de nutrición
const express = require('express');
const router = express.Router();
const { obtenerPlanNutricional } = require('../controllers/nutricion.controller');

// Ruta para obtener el plan de nutrición del usuario
router.get('/plan', obtenerPlanNutricional);

module.exports = router;