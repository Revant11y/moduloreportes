# 📊 Módulo de Reportes Administrativo

Sistema completo de reportes con React + Node.js, dashboard interactivo, métricas en tiempo real y exportación de datos locales.

![Dashboard](https://img.shields.io/badge/Dashboard-Interactive-green)
![Reports](https://img.shields.io/badge/Reports-Excel%2FPDF-blue)
![Database](https://img.shields.io/badge/Database-SQLite-orange)
![Status](https://img.shields.io/badge/Status-Active-success)

## � Características

- ✅ **Dashboard Interactivo** con KPIs en tiempo real
- ✅ **Reportes de Ventas** por curso y productor  
- ✅ **Métricas de Usuarios** activos e inactivos
- ✅ **Tasas de Finalización** de cursos
- ✅ **Exportación Excel y PDF** con datos reales
- ✅ **Interface Responsive** moderna con tema verde
- ✅ **Base de datos local SQLite** 
- ✅ **Arquitectura modular** para fácil integración

## 🛠️ Tecnologías

### Frontend
- **React 19** + TypeScript
- **CSS personalizado** con glassmorphism verde
- **Recharts** para gráficos interactivos
- **Lucide React** para iconos
- **jsPDF** + **jsPDF-autoTable** para PDFs
- **Exportación Excel** nativa con HTML/Blob

### Backend
- **Node.js** + Express
- **Sequelize ORM** con **SQLite local**
- **Socket.io** preparado para tiempo real
- **Scripts automatizados** para datos

## 📊 Datos Actuales

El proyecto incluye datos realistas:
- **7 cursos** con precios actualizados ($69.99 - $349.99)
- **6 usuarios** activos con actividad reciente  
- **22 ventas** distribuidas en 2024
- **Ingresos totales**: **$3,889.78**

### Top Cursos por Ventas:
1. **React Fundamentals** - 5 ventas • $649.95
2. **Python para Data Science** - 4 ventas • $1,199.96
3. **Node.js Avanzado** - 3 ventas • $539.97
4. **JavaScript Moderno** - 3 ventas • $269.97
5. **CSS Grid y Flexbox** - 3 ventas • $209.97

## 🚀 Instalación y Configuración

### Prerrequisitos
- **Node.js** 18+ 
- **npm** o **yarn**

### 1. Clonar el repositorio
```bash
git clone https://github.com/TU_USUARIO/moduloreportes.git
cd moduloreportes
```

### 2. Instalar dependencias
```bash
# Instalar dependencias del frontend
cd frontend
npm install

# Instalar dependencias del backend
cd ../backend
npm install
```

### 3. Configurar base de datos local
```bash
# Desde la carpeta backend
npm run seed        # Crear y poblar SQLite con datos
npm run update-data # Generar JSON para frontend
```

### 4. Ejecutar el proyecto

#### ✨ Solo Frontend (Recomendado)
```bash
cd frontend
npm start           # http://localhost:3000
```

#### 🔧 Con Backend completo
```bash
# Terminal 1 - Backend
cd backend
npm start           # http://localhost:5000

# Terminal 2 - Frontend  
cd frontend
npm start           # http://localhost:3000
```

## 📁 Estructura del Proyecto

```
moduloreportes/
├── frontend/                 # React App
│   ├── src/
│   │   ├── components/      # Sidebar, Header, ExportButtons
│   │   ├── pages/           # Dashboard, Reports
│   │   ├── services/        # database.ts, export-local.ts
│   │   ├── data/            # database-data.json
│   │   └── types/           # TypeScript definitions
│   └── package.json
├── backend/                  # Node.js Server
│   ├── src/
│   │   ├── config/          # database.js
│   │   ├── models/          # Sequelize models
│   │   ├── routes/          # API routes (preparado)
│   │   └── scripts/         # seedDatabase.js
│   ├── database/            # reportes.db (SQLite)
│   └── package.json
├── .gitignore               # Archivos ignorados
└── README.md
```

## � Scripts Disponibles

### Frontend
```bash
npm start               # Servidor desarrollo (puerto 3000)
npm build               # Build producción
npm test                # Ejecutar tests
```

### Backend  
```bash
npm start              # Servidor Express (puerto 5000)
npm run seed           # Poblar base de datos SQLite
npm run update-data    # Actualizar datos JSON frontend
```

## 🔐 Seguridad

- **Helmet**: Protección de headers HTTP
- **CORS**: Configuración de origen cruzado
- **Variables de entorno**: Configuración sensible
- **Validación**: Entrada de datos
- **Rate limiting**: (Recomendado para producción)

## 🚀 Próximos Pasos

### Funcionalidades Recomendadas
1. **Autenticación JWT**: Sistema de login seguro
2. **Cache Redis**: Optimización de consultas
3. **Tests**: Unitarios e integración  
4. **Docker**: Contenedorización
5. **CI/CD**: Pipeline automatizado
6. **Monitoreo**: Logs y métricas
7. **Notificaciones**: Alertas en tiempo real

### Optimizaciones
- **Paginación**: Para grandes conjuntos de datos
- **Indexación**: Optimización de base de datos
- **Compresión**: Gzip para respuestas
- **CDN**: Assets estáticos
- **Service Workers**: Cache offline

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📝 Licencia

Este proyecto está bajo la Licencia MIT. Ver `LICENSE` para más detalles.

## 📞 Soporte

Para soporte técnico:
- **Issues**: [GitHub Issues](https://github.com/tu-usuario/moduloreportes/issues)
- **Email**: tu-email@domain.com
- **Docs**: [Documentación completa](https://docs.tu-proyecto.com)

---

⚡ **Desarrollado con pasión para análisis de datos eficientes** 📊