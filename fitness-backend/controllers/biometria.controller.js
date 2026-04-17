const pool = require('../config/db');

// ─────────────────────────────────────────────────────────────────────────────
// RANGOS DE IMC IDEAL POR SOMATOTIPO
// Usados para calcular la "meta de peso" sugerida al usuario
// ─────────────────────────────────────────────────────────────────────────────
const IMC_META_POR_SOMATOTIPO = {
  Ectomorfo: { min: 18.5, max: 22.0, ideal: 20.0 },
  Mesomorfo: { min: 21.0, max: 24.0, ideal: 22.5 },
  Endomorfo: { min: 22.0, max: 25.0, ideal: 23.5 },
};

/**
 * Calcula el IMC
 */
const calcularIMC = (pesoKg, alturaCm) => {
  const alturaM = alturaCm / 100;
  return parseFloat((pesoKg / (alturaM * alturaM)).toFixed(2));
};

/**
 * Dado un somatotipo y una altura, devuelve el peso ideal (en kg)
 * que coloca al usuario en el IMC ideal para su biotipo.
 */
const calcularPesoMeta = (somatotipo, alturaCm) => {
  const rango = IMC_META_POR_SOMATOTIPO[somatotipo];
  if (!rango || !alturaCm) return null;
  const alturaM = alturaCm / 100;
  return parseFloat((rango.ideal * alturaM * alturaM).toFixed(2));
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /biometria/:id
// Devuelve: medición actual del usuario + historial de los últimos 30 registros
// ─────────────────────────────────────────────────────────────────────────────
const getBiometria = async (req, res) => {
  const { id } = req.params;

  try {
    // Datos actuales del usuario
    const userRes = await pool.query(
      `SELECT peso_kg, altura_cm, peso_meta_kg, somatotipo
       FROM usuarios
       WHERE id_usuario = $1`,
      [id],
    );

    if (userRes.rowCount === 0) {
      return res.status(404).json({ mensaje: 'Usuario no encontrado' });
    }

    const { peso_kg, altura_cm, peso_meta_kg, somatotipo } = userRes.rows[0];

    // Historial de las últimas 30 mediciones (más recientes al final para la gráfica)
    const historialRes = await pool.query(
      `SELECT
         id,
         peso_kg,
         altura_cm,
         imc,
         TO_CHAR(registrado_en, 'DD/MM') AS fecha_corta,
         registrado_en
       FROM historial_biometria
       WHERE id_usuario = $1
       ORDER BY registrado_en ASC
       LIMIT 30`,
      [id],
    );

    // IMC actual
    const imcActual = peso_kg && altura_cm ? calcularIMC(peso_kg, altura_cm) : null;

    // Peso meta: usa el guardado en BD o lo calcula según somatotipo
    const pesoMeta = peso_meta_kg || calcularPesoMeta(somatotipo, altura_cm);

    // Rango IMC del somatotipo para mostrar en frontend
    const rangoSomatotipo = IMC_META_POR_SOMATOTIPO[somatotipo] || null;

    res.status(200).json({
      actual: {
        peso_kg: peso_kg ? parseFloat(peso_kg) : null,
        altura_cm: altura_cm ? parseInt(altura_cm) : null,
        imc: imcActual,
        peso_meta_kg: pesoMeta,
      },
      somatotipo,
      rango_imc: rangoSomatotipo,
      historial: historialRes.rows.map((r) => ({
        id: r.id,
        peso_kg: parseFloat(r.peso_kg),
        altura_cm: parseInt(r.altura_cm),
        imc: parseFloat(r.imc),
        fecha: r.fecha_corta,
        fecha_completa: r.registrado_en,
      })),
    });
  } catch (error) {
    console.error('Error al obtener biometría:', error);
    res.status(500).json({ mensaje: 'Error interno del servidor' });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// POST /biometria/:id
// Body: { peso_kg, altura_cm, peso_meta_kg? }
// Guarda una nueva medición en el historial y actualiza el perfil del usuario
// ─────────────────────────────────────────────────────────────────────────────
const registrarBiometria = async (req, res) => {
  const { id } = req.params;
  const { peso_kg, altura_cm, peso_meta_kg } = req.body;

  // Validaciones básicas
  if (!peso_kg || !altura_cm) {
    return res.status(400).json({ mensaje: 'Peso y altura son obligatorios.' });
  }
  if (peso_kg < 20 || peso_kg > 300) {
    return res.status(400).json({ mensaje: 'El peso debe estar entre 20 y 300 kg.' });
  }
  if (altura_cm < 100 || altura_cm > 250) {
    return res.status(400).json({ mensaje: 'La altura debe estar entre 100 y 250 cm.' });
  }

  try {
    // Verificar que el usuario existe y obtener su somatotipo para calcular la meta
    const userRes = await pool.query(
      'SELECT somatotipo FROM usuarios WHERE id_usuario = $1',
      [id],
    );
    if (userRes.rowCount === 0) {
      return res.status(404).json({ mensaje: 'Usuario no encontrado' });
    }

    const { somatotipo } = userRes.rows[0];

    // Calcular peso meta (prioridad: el que envía el usuario > el calculado por somatotipo)
    const pesoMeta = peso_meta_kg || calcularPesoMeta(somatotipo, altura_cm);
    const imcActual = calcularIMC(peso_kg, altura_cm);

    // 1. Actualizar perfil del usuario con los valores actuales
    await pool.query(
      `UPDATE usuarios
       SET peso_kg = $1, altura_cm = $2, peso_meta_kg = $3
       WHERE id_usuario = $4`,
      [peso_kg, altura_cm, pesoMeta, id],
    );

    // 2. Insertar registro en el historial
    const historialRes = await pool.query(
      `INSERT INTO historial_biometria (id_usuario, peso_kg, altura_cm)
       VALUES ($1, $2, $3)
       RETURNING id, peso_kg, altura_cm, imc, registrado_en`,
      [id, peso_kg, altura_cm],
    );

    const nuevo = historialRes.rows[0];

    res.status(201).json({
      mensaje: 'Medición registrada con éxito',
      medicion: {
        id: nuevo.id,
        peso_kg: parseFloat(nuevo.peso_kg),
        altura_cm: parseInt(nuevo.altura_cm),
        imc: parseFloat(nuevo.imc),
        peso_meta_kg: pesoMeta,
        registrado_en: nuevo.registrado_en,
      },
      imc_actual: imcActual,
    });
  } catch (error) {
    console.error('Error al registrar biometría:', error);
    res.status(500).json({ mensaje: 'Error interno del servidor' });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// DELETE /biometria/:id/registro/:registroId
// Elimina un registro puntual del historial (por si el usuario se equivocó)
// ─────────────────────────────────────────────────────────────────────────────
const eliminarRegistroBiometria = async (req, res) => {
  const { id, registroId } = req.params;

  try {
    const result = await pool.query(
      'DELETE FROM historial_biometria WHERE id = $1 AND id_usuario = $2 RETURNING id',
      [registroId, id],
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ mensaje: 'Registro no encontrado.' });
    }

    res.status(200).json({ mensaje: 'Registro eliminado correctamente.' });
  } catch (error) {
    console.error('Error al eliminar registro:', error);
    res.status(500).json({ mensaje: 'Error interno del servidor' });
  }
};

module.exports = {
  getBiometria,
  registrarBiometria,
  eliminarRegistroBiometria,
};