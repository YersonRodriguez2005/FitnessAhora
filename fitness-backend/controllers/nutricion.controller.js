const pool = require('../config/db');

const obtenerPlanNutricional = async (req, res) => {
  const { objetivo, somatotipo } = req.query;

  try {
    const { rows } = await pool.query(
      `SELECT * FROM planes_nutricionales 
       WHERE objetivo = $1 AND somatotipo = $2`,
      [objetivo, somatotipo]
    );

    if (rows.length === 0) {
      return res.status(404).json({ 
        mensaje: 'Aún no tenemos un plan específico para este perfil, pero estamos trabajando en ello.' 
      });
    }

    res.status(200).json({
      mensaje: 'Plan nutricional obtenido',
      plan: rows[0]
    });

  } catch (error) {
    console.error('Error al obtener nutrición:', error);
    res.status(500).json({ mensaje: 'Error interno del servidor' });
  }
};

module.exports = { obtenerPlanNutricional };