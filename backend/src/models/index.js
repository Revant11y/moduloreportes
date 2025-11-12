const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

// Usuarios (estudiantes, instructores, admins)
const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    field: 'nombre'
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    field: 'email',
    validate: {
      isEmail: true
    }
  },
  role: {
    type: DataTypes.ENUM('estudiante', 'instructor', 'admin'),
    defaultValue: 'estudiante',
    field: 'tipo'
  },
  status: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    field: 'activo'
  },
  lastActivity: {
    type: DataTypes.DATE,
    field: 'fecha_ultimo_acceso'
  },
  registeredAt: {
    type: DataTypes.DATE,
    field: 'fecha_registro'
  }
}, {
  tableName: 'usuarios',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

// Productores (instructores) usan la misma tabla de usuarios, restringiendo al rol instructor
const Producer = sequelize.define('Producer', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    field: 'nombre'
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    field: 'email'
  },
  role: {
    type: DataTypes.ENUM('estudiante', 'instructor', 'admin'),
    defaultValue: 'instructor',
    field: 'tipo'
  },
  status: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    field: 'activo'
  },
  lastActivity: {
    type: DataTypes.DATE,
    field: 'fecha_ultimo_acceso'
  }
}, {
  tableName: 'usuarios',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  defaultScope: {
    where: { role: 'instructor' }
  }
});

// Cursos
const Course = sequelize.define('Course', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
    field: 'titulo'
  },
  description: {
    type: DataTypes.TEXT,
    field: 'descripcion'
  },
  price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    field: 'precio'
  },
  producerId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'instructor_id'
  },
  category: {
    type: DataTypes.STRING,
    field: 'categoria'
  },
  durationHours: {
    type: DataTypes.INTEGER,
    field: 'duracion_horas'
  },
  level: {
    type: DataTypes.ENUM('basico', 'intermedio', 'avanzado'),
    field: 'nivel'
  },
  status: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    field: 'activo'
  }
}, {
  tableName: 'cursos',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

// Ventas
const Sale = sequelize.define('Sale', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  enrollmentId: {
    type: DataTypes.INTEGER,
    field: 'inscripcion_id'
  },
  courseId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'curso_id'
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'usuario_id'
  },
  instructorId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'instructor_id'
  },
  amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    field: 'monto'
  },
  instructorCommission: {
    type: DataTypes.DECIMAL(10, 2),
    field: 'comision_instructor'
  },
  saleDate: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    field: 'fecha_venta'
  },
  paymentMethod: {
    type: DataTypes.STRING,
    field: 'metodo_pago'
  },
  status: {
    type: DataTypes.ENUM('pendiente', 'completada', 'cancelada'),
    defaultValue: 'completada',
    field: 'estado'
  }
}, {
  tableName: 'ventas',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

// Avance de cursos (inscripciones)
const CourseProgress = sequelize.define('CourseProgress', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'usuario_id'
  },
  courseId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'curso_id'
  },
  enrolledAt: {
    type: DataTypes.DATE,
    field: 'fecha_inscripcion'
  },
  completedAt: {
    type: DataTypes.DATE,
    field: 'fecha_completado'
  },
  completed: {
    type: DataTypes.VIRTUAL,
    get() {
      return Boolean(this.getDataValue('completedAt'));
    }
  },
  progress: {
    type: DataTypes.DECIMAL(5, 2),
    defaultValue: 0,
    field: 'progreso'
  },
  active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    field: 'activo'
  },
  pricePaid: {
    type: DataTypes.DECIMAL(10, 2),
    field: 'precio_pagado'
  },
  paymentMethod: {
    type: DataTypes.STRING,
    field: 'metodo_pago'
  }
}, {
  tableName: 'inscripciones',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

// Actividad de usuarios (para futuras mejoras/referencias)
const UserActivity = sequelize.define('UserActivity', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'usuario_id'
  },
  courseId: {
    type: DataTypes.INTEGER,
    field: 'curso_id'
  },
  activityType: {
    type: DataTypes.ENUM('login', 'curso_iniciado', 'leccion_completada', 'curso_completado', 'descarga'),
    allowNull: false,
    field: 'tipo_actividad'
  },
  description: {
    type: DataTypes.TEXT,
    field: 'descripcion'
  },
  activityDate: {
    type: DataTypes.DATE,
    field: 'fecha_actividad'
  }
}, {
  tableName: 'actividad_usuarios',
  timestamps: false
});

// Relaciones
Course.belongsTo(Producer, { foreignKey: 'producerId', as: 'producer' });
Producer.hasMany(Course, { foreignKey: 'producerId', sourceKey: 'id', as: 'courses' });

Sale.belongsTo(User, { foreignKey: 'userId', as: 'user' });
Sale.belongsTo(Course, { foreignKey: 'courseId', as: 'course' });
Sale.belongsTo(Producer, { foreignKey: 'instructorId', as: 'instructor' });

User.hasMany(Sale, { foreignKey: 'userId', as: 'sales' });
Course.hasMany(Sale, { foreignKey: 'courseId', as: 'sales' });

CourseProgress.belongsTo(User, { foreignKey: 'userId', as: 'user' });
CourseProgress.belongsTo(Course, { foreignKey: 'courseId', as: 'course' });

User.hasMany(CourseProgress, { foreignKey: 'userId', as: 'courseProgress' });
Course.hasMany(CourseProgress, { foreignKey: 'courseId', as: 'userProgress' });

module.exports = {
  Course,
  Producer,
  User,
  Sale,
  CourseProgress,
  UserActivity
};
