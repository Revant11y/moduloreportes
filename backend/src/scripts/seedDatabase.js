require('dotenv').config();
const { sequelize } = require('../config/database');
const { User, Producer, Course, Sale, CourseProgress } = require('../models');

const seedDatabase = async () => {
  try {
    console.log('🌱 Iniciando población de base de datos...');
    
    // Sincronizar modelos (crear tablas)
    await sequelize.sync({ force: true });
    console.log('✓ Tablas creadas');

    // Crear productores/instructores
    const productores = await Producer.bulkCreate([
      {
        name: 'Ana García',
        email: 'ana.garcia@email.com',
        status: 'active'
      },
      {
        name: 'Carlos López',
        email: 'carlos.lopez@email.com',
        status: 'active'
      },
      {
        name: 'Isabel Torres',
        email: 'isabel.torres@email.com',
        status: 'active'
      }
    ]);
    console.log(`✓ ${productores.length} productores creados`);

    // Crear usuarios/estudiantes
    const usuarios = await User.bulkCreate([
      {
        name: 'María González',
        email: 'maria.gonzalez@email.com',
        status: 'active',
        lastActivity: new Date('2024-11-12')
      },
      {
        name: 'Juan Pérez',
        email: 'juan.perez@email.com',
        status: 'active',
        lastActivity: new Date('2024-11-10')
      },
      {
        name: 'Laura Martín',
        email: 'laura.martin@email.com',
        status: 'active',
        lastActivity: new Date('2024-11-12')
      },
      {
        name: 'Pedro Sánchez',
        email: 'pedro.sanchez@email.com',
        status: 'active',
        lastActivity: new Date('2024-11-09')
      },
      {
        name: 'Miguel Ruiz',
        email: 'miguel.ruiz@email.com',
        status: 'active',
        lastActivity: new Date('2024-11-11')
      },
      {
        name: 'Carmen Díaz',
        email: 'carmen.diaz@email.com',
        status: 'active',
        lastActivity: new Date('2024-11-12')
      }
    ]);
    console.log(`✓ ${usuarios.length} usuarios creados`);

    // Crear cursos
    const cursos = await Course.bulkCreate([
      {
        title: 'React Fundamentals',
        description: 'Curso completo de React desde cero',
        price: 129.99,  // ⬅️ Cambiar precio aquí
        producerId: 1,
        status: 'active'
      },
      {
        title: 'Node.js Avanzado',
        description: 'Desarrollo backend con Node.js',
        price:  700000,  // ⬅️ Cambiar precio aquí
        producerId: 1,
        status: 'active'
      },
      {
        title: 'Python para Data Science',
        description: 'Análisis de datos con Python',
        price: 900000,  // ⬅️ Cambiar precio aquí
        producerId: 2,
        status: 'active'
      },
      {
        title: 'JavaScript Moderno',
        description: 'ES6+ y mejores prácticas',
        price: 1200000,   // ⬅️ Cambiar precio aquí
        producerId: 1,
        status: 'active'
      },
      {
        title: 'Machine Learning Básico',
        description: 'Introducción al ML',
        price: 349.99,  // ⬅️ Cambiar precio aquí
        producerId: 2,
        status: 'active'
      },
      {
        title: 'CSS Grid y Flexbox',
        description: 'Layout moderno en CSS',
        price: 69.99,   // ⬅️ Cambiar precio aquí
        producerId: 3,
        status: 'active'
      },
      {
        title: 'Vue.js Completo',
        description: 'Framework progresivo de JavaScript',
        price: 159.99,  // ⬅️ Nuevo curso
        producerId: 3,
        status: 'active'
      }
    ]);
    console.log(`✓ ${cursos.length} cursos creados`);

    // Crear ventas
    const ventas = await Sale.bulkCreate([
      // React Fundamentals - 5 ventas
      { userId: 1, courseId: 1, amount: 129.99, status: 'completed', saleDate: new Date('2024-07-01') },
      { userId: 2, courseId: 1, amount: 129.99, status: 'completed', saleDate: new Date('2024-07-05') },
      { userId: 5, courseId: 1, amount: 129.99, status: 'completed', saleDate: new Date('2024-08-10') },
      { userId: 3, courseId: 1, amount: 129.99, status: 'completed', saleDate: new Date('2024-09-15') },
      { userId: 6, courseId: 1, amount: 129.99, status: 'completed', saleDate: new Date('2024-10-20') },
      
      // Python para Data Science - 4 ventas  
      { userId: 4, courseId: 3, amount: 299.99, status: 'completed', saleDate: new Date('2024-07-15') },
      { userId: 5, courseId: 3, amount: 299.99, status: 'completed', saleDate: new Date('2024-08-20') },
      { userId: 1, courseId: 3, amount: 299.99, status: 'completed', saleDate: new Date('2024-09-10') },
      { userId: 2, courseId: 3, amount: 299.99, status: 'completed', saleDate: new Date('2024-10-15') },
      
      // Node.js Avanzado - 3 ventas
      { userId: 3, courseId: 2, amount: 179.99, status: 'completed', saleDate: new Date('2024-07-10') },
      { userId: 4, courseId: 2, amount: 179.99, status: 'completed', saleDate: new Date('2024-09-01') },
      { userId: 6, courseId: 2, amount: 179.99, status: 'completed', saleDate: new Date('2024-10-01') },
      
      // JavaScript Moderno - 3 ventas
      { userId: 1, courseId: 4, amount: 89.99, status: 'completed', saleDate: new Date('2024-08-01') },
      { userId: 5, courseId: 4, amount: 89.99, status: 'completed', saleDate: new Date('2024-09-05') },
      { userId: 6, courseId: 4, amount: 89.99, status: 'completed', saleDate: new Date('2024-11-01') },
      
      // Machine Learning Básico - 2 ventas
      { userId: 3, courseId: 5, amount: 349.99, status: 'completed', saleDate: new Date('2024-08-15') },
      { userId: 4, courseId: 5, amount: 349.99, status: 'completed', saleDate: new Date('2024-10-25') },
      
      // CSS Grid y Flexbox - 3 ventas
      { userId: 2, courseId: 6, amount: 69.99, status: 'completed', saleDate: new Date('2024-09-01') },
      { userId: 3, courseId: 6, amount: 69.99, status: 'completed', saleDate: new Date('2024-09-15') },
      { userId: 1, courseId: 6, amount: 69.99, status: 'completed', saleDate: new Date('2024-10-30') },
      
      // Vue.js Completo - 2 ventas
      { userId: 5, courseId: 7, amount: 159.99, status: 'completed', saleDate: new Date('2024-10-05') },
      { userId: 6, courseId: 7, amount: 159.99, status: 'completed', saleDate: new Date('2024-11-10') }
    ]);
    console.log(`✓ ${ventas.length} ventas creadas`);

    // Crear progreso de cursos
    const progreso = await CourseProgress.bulkCreate([
      {
        userId: 1,
        courseId: 1,
        progress: 100.00,
        completed: true,
        completedAt: new Date('2024-08-15')
      },
      {
        userId: 2,
        courseId: 1,
        progress: 75.50,
        completed: false
      },
      {
        userId: 3,
        courseId: 2,
        progress: 100.00,
        completed: true,
        completedAt: new Date('2024-09-20')
      },
      {
        userId: 4,
        courseId: 3,
        progress: 45.25,
        completed: false
      },
      {
        userId: 1,
        courseId: 4,
        progress: 100.00,
        completed: true,
        completedAt: new Date('2024-08-25')
      },
      {
        userId: 5,
        courseId: 1,
        progress: 60.75,
        completed: false
      },
      {
        userId: 6,
        courseId: 5,
        progress: 30.50,
        completed: false
      },
      {
        userId: 2,
        courseId: 6,
        progress: 100.00,
        completed: true,
        completedAt: new Date('2024-09-15')
      },
      {
        userId: 3,
        courseId: 6,
        progress: 80.75,
        completed: false
      }
    ]);
    console.log(`✓ ${progreso.length} registros de progreso creados`);

    console.log('🎉 Base de datos poblada exitosamente!');
    console.log('📊 Resumen:');
    console.log(`   - Productores: ${productores.length}`);
    console.log(`   - Usuarios: ${usuarios.length}`);
    console.log(`   - Cursos: ${cursos.length}`);
    console.log(`   - Ventas: ${ventas.length}`);
    console.log(`   - Progreso: ${progreso.length}`);

  } catch (error) {
    console.error('❌ Error poblando la base de datos:', error);
  } finally {
    await sequelize.close();
  }
};

// Ejecutar si se llama directamente
if (require.main === module) {
  seedDatabase();
}

module.exports = { seedDatabase };