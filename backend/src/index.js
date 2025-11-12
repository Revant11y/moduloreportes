
























require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const { createServer } = require('http');
const { Server } = require('socket.io');

// Importar rutas
const reportsRoutes = require('./routes/reports');
const dashboardRoutes = require('./routes/dashboard');
const exportRoutes = require('./routes/export');
const testExportRoutes = require('./routes/test-export');

// Importar configuración de base de datos
const { sequelize } = require('./config/database');

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: ["http://localhost:3000", "http://localhost:3001"],
    methods: ["GET", "POST"]
  }
});

const PORT = process.env.PORT || 5000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan('combined'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rutas
app.use('/api/reports', reportsRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/export', exportRoutes);
app.use('/api/test', testExportRoutes);

// Ruta de prueba
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Servidor de reportes funcionando correctamente',
    timestamp: new Date().toISOString()
  });
});

// Socket.io para actualizaciones en tiempo real
io.on('connection', (socket) => {
  console.log('Cliente conectado:', socket.id);

  socket.on('disconnect', () => {
    console.log('Cliente desconectado:', socket.id);
  });
});

// Función para emitir actualizaciones de KPIs
const emitKPIUpdates = () => {
  // Esta función se ejecutará periódicamente para enviar actualizaciones en tiempo real
  setInterval(async () => {
    try {
      // Aquí llamarías a tu servicio para obtener los KPIs actualizados
      const kpis = {
        totalSales: Math.floor(Math.random() * 100000),
        activeUsers: Math.floor(Math.random() * 1000),
        completionRate: Math.floor(Math.random() * 100),
        timestamp: new Date().toISOString()
      };
      
      io.emit('kpi-update', kpis);
    } catch (error) {
      console.error('Error enviando actualización de KPIs:', error);
    }
  }, 30000); // Actualizar cada 30 segundos
};

// Inicializar servidor
const startServer = async () => {
  try {
    // Intentar conectar a la base de datos (opcional para pruebas)
    try {
      await sequelize.authenticate();
      console.log('✓ Conexión a la base de datos establecida');
      await sequelize.sync();
      console.log('✓ Modelos sincronizados');
    } catch (dbError) {
      console.log('⚠️ Base de datos no disponible, modo desarrollo con datos mock');
    }

    // Iniciar actualizaciones en tiempo real
    emitKPIUpdates();

    // Iniciar servidor
    httpServer.listen(PORT, () => {
      console.log(`🚀 Servidor iniciado en puerto ${PORT}`);
      console.log(`📊 Dashboard disponible en http://localhost:${PORT}`);
      console.log(`🔧 Modo desarrollo - Exportaciones disponibles en /api/test/`);
    });

  } catch (error) {
    console.error('❌ Error iniciando el servidor:', error);
    process.exit(1);
  }
};

startServer();