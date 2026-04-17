const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/auth_route');
const ejerciciosRoutes = require('./routes/ejercicios_route');
const RutinasRoutes = require('./routes/rutinas_route');
const nutricionRoutes = require('./routes/nutricion_route');
const progresoRoutes = require('./routes/progreso_route');
const biometriaRoutes = require('./routes/biometria_route');
const usuarioRoutes = require('./routes/usuario_route');

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Rutas
app.use('/api', authRoutes);
app.use('/api', ejerciciosRoutes);
app.use('/api', RutinasRoutes);
app.use('/api', nutricionRoutes);
app.use('/api', progresoRoutes);
app.use('/api', biometriaRoutes);
app.use('/api', usuarioRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor de FitnessAhora corriendo en puerto ${PORT}`);
});