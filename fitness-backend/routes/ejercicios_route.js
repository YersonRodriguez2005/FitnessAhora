// Ruta para el controlador de ejercicios
const express = require('express');
const { getEjercicios } = require('../controllers/ejercicios.controller');

const router = express.Router();

// Ruta para obtener ejercicios, con opción de filtrar por grupo muscular o equipamiento
router.get('/ejercicios', getEjercicios);

module.exports = router;