const pool = require("../config/db");
const bcrypt = require("bcrypt");

// controlador de login
const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    // 1. Buscamos al usuario en la BD
    const userQuery = await pool.query(
      "SELECT * FROM usuarios WHERE email = $1",
      [email],
    );

    if (userQuery.rows.length === 0) {
      return res.status(404).json({ mensaje: "Usuario no encontrado" });
    }

    const usuario = userQuery.rows[0];

    // 2. Validación REAL de contraseña con bcrypt
    const validPassword = await bcrypt.compare(password, usuario.password_hash);

    if (!validPassword) {
      return res.status(401).json({ mensaje: "Contraseña incorrecta" });
    }

    // 3. Devolvemos los datos estructurados para el Frontend (Ionic)
    res.status(200).json({
      mensaje: "Login exitoso",
      user: {
        id: usuario.id_usuario,
        nombre: usuario.nombre,
        email: usuario.email,
        objetivo: usuario.objetivo,
        somatotipo: usuario.somatotipo,
        dias_entrenamiento: usuario.dias_entrenamiento, // Importante para la rutina
      },
      token: "jwt_token_simulado_para_proteger_rutas",
    });
  } catch (error) {
    console.error("Fallo en el servidor:", error);
    res.status(500).json({ mensaje: "Fallo interno del servidor" });
  }
};

// controlador de register
const register = async (req, res) => {
  const { nombre, email, password } = req.body;

  try {
    // 1. Verificar si el correo ya existe
    const userExists = await pool.query(
      "SELECT * FROM usuarios WHERE email = $1",
      [email],
    );
    if (userExists.rows.length > 0) {
      return res.status(400).json({ mensaje: "El correo ya está registrado" });
    }

    // 2. Encriptar la contraseña
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // 3. Insertar el nuevo usuario en PostgreSQL
    const newUserQuery = await pool.query(
      `INSERT INTO usuarios (nombre, email, password_hash) 
       VALUES ($1, $2, $3) RETURNING id_usuario, nombre, email, somatotipo, objetivo`,
      [nombre, email, passwordHash],
    );

    const newUser = newUserQuery.rows[0];

    // 4. Responder al cliente
    res.status(201).json({
      mensaje: "Usuario registrado con éxito",
      user: {
        id: newUser.id_usuario,
        nombre: newUser.nombre,
        email: newUser.email, // Añadido para que aparezca en Tab4 desde el registro
        objetivo: newUser.objetivo,
        somatotipo: newUser.somatotipo,
      },
      token: "jwt_token_real_proximamente",
    });
  } catch (error) {
    console.error("Error al registrar:", error);
    res.status(500).json({ mensaje: "Error interno del servidor" });
  }
};

// Actualizar perfil tras el Onboarding
const updateProfile = async (req, res) => {
  const { id } = req.params;
  const { somatotipo, objetivo } = req.body;

  try {
    const result = await pool.query(
      "UPDATE usuarios SET somatotipo = $1, objetivo = $2 WHERE id_usuario = $3 RETURNING *",
      [somatotipo, objetivo, id],
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ mensaje: "Usuario no encontrado" });
    }

    res.status(200).json({
      mensaje: "Perfil configurado",
      user: {
        id: result.rows[0].id_usuario,
        nombre: result.rows[0].nombre,
        email: result.rows[0].email,
        somatotipo: result.rows[0].somatotipo,
        objetivo: result.rows[0].objetivo,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: "Error al actualizar el perfil" });
  }
};

const updateDias = async (req, res) => {
  const { id } = req.params;
  const { dias } = req.body;

  if (!dias || dias.length === 0) {
    return res
      .status(400)
      .json({ mensaje: "Debes seleccionar al menos un día de entrenamiento." });
  }

  try {
    const result = await pool.query(
      "UPDATE usuarios SET dias_entrenamiento = $1 WHERE id_usuario = $2 RETURNING dias_entrenamiento",
      [dias, id],
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ mensaje: "Usuario no encontrado" });
    }

    res.status(200).json({
      mensaje: "Calendario de entrenamiento actualizado",
      dias_entrenamiento: result.rows[0].dias_entrenamiento,
    });
  } catch (error) {
    console.error("Error al actualizar los días:", error);
    res
      .status(500)
      .json({ mensaje: "Error interno del servidor al guardar los días." });
  }
};

// Actualizar datos básicos (Nombre)
const updateAccount = async (req, res) => {
  const { id } = req.params;
  const { nombre } = req.body;

  try {
    await pool.query("UPDATE usuarios SET nombre = $1 WHERE id_usuario = $2", [
      nombre,
      id,
    ]);
    res.status(200).json({ mensaje: "Cuenta actualizada" });
  } catch (error) {
    res.status(500).json({ mensaje: "Error al actualizar cuenta" });
  }
};

// Cambiar contraseña (CORREGIDO)
const changePassword = async (req, res) => {
  const { id } = req.params;
  const { oldPassword, newPassword } = req.body;

  try {
    // 1. Buscamos 'password_hash' y no 'password'
    const userResult = await pool.query(
      "SELECT password_hash FROM usuarios WHERE id_usuario = $1",
      [id],
    );

    if (userResult.rowCount === 0) {
      return res.status(404).json({ mensaje: "Usuario no encontrado" });
    }

    // 2. Comparamos con bcrypt
    const validPassword = await bcrypt.compare(
      oldPassword,
      userResult.rows[0].password_hash, // Extraemos el hash correcto
    );

    if (!validPassword) {
      return res
        .status(401)
        .json({ mensaje: "La contraseña actual es incorrecta" });
    }

    // 3. Encriptar y guardar la nueva en la columna 'password_hash'
    const salt = await bcrypt.genSalt(10);
    const hashedNewPassword = await bcrypt.hash(newPassword, salt);

    await pool.query(
      "UPDATE usuarios SET password_hash = $1 WHERE id_usuario = $2",
      [hashedNewPassword, id],
    );

    res.status(200).json({ mensaje: "Contraseña cambiada exitosamente" });
  } catch (error) {
    console.error("Error al cambiar contraseña:", error);
    res.status(500).json({ mensaje: "Error interno del servidor" });
  }
};

module.exports = {
  login,
  register,
  updateProfile,
  updateDias,
  updateAccount,
  changePassword,
};
