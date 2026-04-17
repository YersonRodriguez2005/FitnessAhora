const pool = require("../config/db");

// Obtener todos los ejercicios, con opción de filtrar
const getEjercicios = async (req, res) => {
  const { grupo, equipamiento } = req.query;

  try {
    let query = `
      SELECT 
        e.id_ejercicio, 
        e.nombre, 
        e.equipamiento, 
        e.imagen_url,
        e.descripcion, 
        e.consejos, 
        g.nombre AS grupo_muscular 
      FROM ejercicios e
      JOIN grupos_musculares g ON e.id_grupo = g.id_grupo
      WHERE 1=1
    `;
    const values = [];
    let count = 1;

    if (grupo) {
      query += ` AND g.nombre = $${count}`;
      values.push(grupo);
      count++;
    }

    // Si el usuario filtra por equipamiento
    if (equipamiento) {
      // Separamos el string en un array de JS
      const equipamientoArray = equipamiento.split(',');
      
      // Usamos el casteo ::text[]
      query += ` AND e.equipamiento = ANY($${count}::text[])`;
      values.push(equipamientoArray); // Pasamos el array
      count++;
    }

    const { rows } = await pool.query(query, values);

    res.status(200).json({
      mensaje: "Ejercicios obtenidos con éxito",
      total: rows.length,
      ejercicios: rows,
    });
  } catch (error) {
    console.error("Error al obtener ejercicios:", error);
    res.status(500).json({ mensaje: "Error interno del servidor" });
  }
};

module.exports = { getEjercicios };
