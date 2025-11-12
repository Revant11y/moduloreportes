# 📊 Módulo de Reportes - Base de Datos Local

## 🎯 Configuración Actual

El módulo de reportes ahora usa **datos directamente de la base de datos local SQLite** sin necesidad de API. Los datos se extraen automáticamente y se convierten a formato JSON para el frontend.

## 📁 Estructura de Datos

```
backend/
├── database/
│   └── reportes.db          # Base de datos SQLite
├── scripts/
│   └── generate-frontend-data.js  # Extrae datos de BD a JSON

frontend/
├── src/
│   ├── data/
│   │   └── database-data.json     # Datos extraídos de la BD
│   └── services/
│       └── database.ts            # Servicio para usar datos locales
```

## 💾 Datos Actuales en la Base

```
📊 Total ingresos: $1,529.88
👥 Usuarios activos: 6
📈 Ventas: 12
🎓 Cursos: 6
👨‍🏫 Productores: 3
```

## 🔄 Actualizar Datos

Para actualizar los datos del frontend desde la base de datos:

```bash
# Desde la carpeta frontend
npm run update-data

# O directamente desde backend
cd backend
node scripts/generate-frontend-data.js
```

## 🛠️ Modificar Datos en la Base

### Opción 1: Script de Seedeo
```bash
cd backend
npm run seed
```

### Opción 2: Editar datos específicos
```bash
cd backend
node scripts/check-database.js  # Ver contenido actual
```

### Opción 3: SQL directo (requiere herramientas SQLite)
```sql
-- Agregar nueva venta
INSERT INTO sales (userId, courseId, amount, status, saleDate) 
VALUES (1, 2, 199.99, 'completed', '2025-11-12');

-- Actualizar fecha de última actividad de usuario
UPDATE users SET lastActivity = '2025-11-12T10:00:00.000Z' WHERE id = 1;
```

## 📈 Datos Incluidos

### KPIs Dashboard
- ✅ Ingresos totales (suma de todas las ventas)
- ✅ Número de ventas completadas
- ✅ Usuarios activos y totales
- ✅ Tasa de finalización de cursos
- ✅ Cursos completados

### Gráficos
- ✅ Ventas por día (últimos registros)
- ✅ Top cursos por ingresos
- ✅ Estadísticas de usuarios

### Reportes
- ✅ Usuarios activos con métricas
- ✅ Ventas por curso
- ✅ Ventas por productor
- ✅ Tasas de finalización

## 🚀 Ventajas de este Enfoque

1. **Sin dependencias de API**: El frontend funciona sin backend activo
2. **Datos reales**: Usa información actual de la base de datos
3. **Rápido**: No hay latencia de red
4. **Flexible**: Fácil de modificar y actualizar
5. **Portable**: Toda la información está en archivos locales

## 🔧 Personalización

Para agregar nuevos datos o métricas:

1. Edita `backend/scripts/generate-frontend-data.js`
2. Agrega nuevas consultas SQL
3. Actualiza `frontend/src/services/database.ts`
4. Ejecuta `npm run update-data`

## 📋 Comandos Útiles

```bash
# Ver logs de generación de datos
cd backend && node scripts/generate-frontend-data.js

# Verificar estructura de BD
cd backend && node scripts/check-database.js

# Reiniciar datos de prueba
cd backend && npm run seed

# Iniciar solo frontend (datos locales)
cd frontend && npm start
```

## 🎯 Valor Total de Ingresos

El **valor total de ingresos ($1,529.88)** se calcula automáticamente como:
- Suma de todas las ventas completadas en la tabla `sales`
- Se actualiza cada vez que ejecutas `npm run update-data`
- Para modificarlo: agrega/edita ventas en la base de datos y regenera

¡El sistema está completamente funcional con datos locales! 🎉