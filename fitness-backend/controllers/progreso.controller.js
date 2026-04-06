const pool = require('../config/db');

const registrarSesion = async (req, res) => {
  const { id_usuario, dia_nombre } = req.body;

  try {
    await pool.query(
      'INSERT INTO historial_entrenamientos (id_usuario, dia_nombre) VALUES ($1, $2)',
      [id_usuario, dia_nombre]
    );
    res.status(201).json({ mensaje: '¡Entrenamiento registrado! Sigue así.' });
  } catch (error) {
    if (error.code === '23505') { // Error de duplicado en Postgres
      return res.status(400).json({ mensaje: 'Ya registraste tu entrenamiento de hoy.' });
    }
    res.status(500).json({ mensaje: 'Error al registrar progreso.' });
  }
};

const obtenerEstadisticas = async (req, res) => {
  const { id } = req.params;
  try {
    // Obtenemos el total y la racha actual (simplificada para este ejemplo)
    const stats = await pool.query(
      `SELECT COUNT(*) as total, 
       (SELECT COUNT(*) FROM historial_entrenamientos WHERE id_usuario = $1 AND fecha > CURRENT_DATE - INTERVAL '7 days') as racha_semanal
       FROM historial_entrenamientos WHERE id_usuario = $1`,
      [id]
    );
    res.status(200).json(stats.rows[0]);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener estadísticas.' });
  }
};

module.exports = { registrarSesion, obtenerEstadisticas };