const pool = require('../config/db');

const actualizarDiasEntrenamiento = async (req, res) => {
  const { id } = req.params;
  const { dias_entrenamiento } = req.body; // Esto ya es un array válido de JS

  try {
    await pool.query(
      `UPDATE usuarios SET dias_entrenamiento = $1::text[] WHERE id_usuario = $2`,
      [dias_entrenamiento, id]
    );

    res.status(200).json({ mensaje: 'Días actualizados correctamente' });
  } catch (error) {
    console.error('Error al actualizar días:', error);
    res.status(500).json({ mensaje: 'Error interno del servidor' });
  }
};

module.exports = { actualizarDiasEntrenamiento };