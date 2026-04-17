const pool = require('../config/db');

const generarRutinaSemanal = async (req, res) => {
  const { objetivo, equipamiento, dias } = req.query; 

  // 1. Convertimos los strings separados por comas en Arrays reales de JavaScript
  const diasArray = dias ? dias.split(',') : ['lunes', 'martes', 'jueves', 'viernes'];
  const equipamientoArray = equipamiento ? equipamiento.split(',') : ['Bandas'];

  // DEBUG: Esto se imprimirá en la consola de tu backend
  console.log("=== NUEVA PETICIÓN DE RUTINA ===");
  console.log("Equipamiento recibido (String):", equipamiento);
  console.log("Equipamiento convertido (Array):", equipamientoArray);

  try {
    let rangoReps = '10-12';
    let series = '4';
    let notaCoach = '';

    if (objetivo === 'Aumento de Masa Muscular' || objetivo === 'Volumen') {
      rangoReps = '8-12'; 
      notaCoach = 'Prioriza la técnica y el tiempo bajo tensión.';
    } else if (objetivo === 'Bajar de peso' || objetivo === 'Definición') {
      rangoReps = '15-20'; 
      series = '3';
      notaCoach = 'Mantén descansos cortos (45s) entre series.';
    }

    // 2. Usamos el Array nativo de JS con la sintaxis $1::text[] de Postgres
    const { rows: ejercicios } = await pool.query(
      `SELECT e.id_ejercicio, e.imagen_url, e.nombre, e.descripcion, e.consejos, g.nombre as grupo 
       FROM ejercicios e 
       JOIN grupos_musculares g ON e.id_grupo = g.id_grupo 
       WHERE e.equipamiento = ANY($1::text[])`,
      [equipamientoArray] // Pasamos el array directamente
    );

    console.log("Total de ejercicios encontrados:", ejercicios.length);

    if (ejercicios.length === 0) {
      console.log("❌ Error: No se encontraron ejercicios en la BD.");
      return res.status(404).json({ mensaje: 'No hay ejercicios registrados para este equipamiento.' });
    }

    // 3. Agrupamos los ejercicios por patrón de movimiento
    const ejerciciosPush = ejercicios.filter(e => ['Pecho', 'Hombros', 'Tríceps'].includes(e.grupo));
    const ejerciciosPull = ejercicios.filter(e => ['Espalda', 'Bíceps'].includes(e.grupo));
    const ejerciciosPierna = ejercicios.filter(e => ['Piernas', 'Glúteos', 'Abdomen'].includes(e.grupo));

    // 4. Creamos los bloques de entrenamiento (4 ejercicios por bloque)
    const bloquePush = ejerciciosPush.map(e => ({ ...e, series, reps: rangoReps, tip: notaCoach })).slice(0, 4);
    const bloquePull = ejerciciosPull.map(e => ({ ...e, series, reps: rangoReps, tip: notaCoach })).slice(0, 4);
    const bloquePierna = ejerciciosPierna.map(e => ({ ...e, series, reps: rangoReps, tip: notaCoach })).slice(0, 4);
    
    // Creamos un bloque "Full Body" por si el usuario entrena 4 o más días
    const bloqueFullBody = [...ejerciciosPush.slice(4, 6), ...ejerciciosPull.slice(4, 6)]
      .map(e => ({ ...e, series, reps: rangoReps, tip: 'Día full body / Repaso general' }));

    // Arreglo maestro con el orden lógico de hipertrofia
    const bloquesDisponibles = [bloquePush, bloquePull, bloquePierna, bloqueFullBody];

    // 5. Asignación Dinámica
    // Iteramos sobre los días que el usuario seleccionó y le repartimos los bloques
    const rutinaArmada = {};
    
    diasArray.forEach((dia, index) => {
      // Usamos el operador módulo (%) para que, si el usuario elige 5 o 6 días, 
      // el ciclo de entrenamiento se repita ordenadamente (Push, Pull, Legs, Full, Push, Pull...)
      rutinaArmada[dia] = bloquesDisponibles[index % bloquesDisponibles.length];
    });

    res.status(200).json({
      mensaje: 'Rutina generada con éxito',
      rutina: rutinaArmada
    });

  } catch (error) {
    console.error('Error al generar rutina dinámica:', error);
    res.status(500).json({ mensaje: 'Error interno del servidor' });
  }
};

const obtenerEjerciciosDisponibles = async (req, res) => {
  const { equipamiento } = req.query;

  try {
    const { rows: ejercicios } = await pool.query(
      `SELECT e.id_ejercicio, e.imagen_url, e.nombre, e.descripcion, e.consejos, g.nombre as grupo 
       FROM ejercicios e 
       JOIN grupos_musculares g ON e.id_grupo = g.id_grupo 
       WHERE e.equipamiento = ANY(string_to_array($1, ','))`,
      [equipamiento]
    );

    if (ejercicios.length === 0) {
      return res.status(404).json({ mensaje: 'No hay ejercicios registrados para este equipamiento.' });
    }

    res.status(200).json({ ejercicios });
  } catch (error) {
    console.error('Error al obtener ejercicios disponibles:', error);
    res.status(500).json({ mensaje: 'Error interno del servidor' });
  }
};

module.exports = { generarRutinaSemanal, obtenerEjerciciosDisponibles };