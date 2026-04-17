//ruta para el controlador de usuarios
const express = require('express');
const router = express.Router();
const { actualizarDiasEntrenamiento } = require('../controllers/usuario.controller');

// Ruta para actualizar los días de entrenamiento del usuario
router.put('/usuarios/:id/dias', actualizarDiasEntrenamiento);

module.exports = router;