











const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

// Modelo para Cursos
const Course = sequelize.define('Course', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT
  },
  price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  producerId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('active', 'inactive', 'draft'),
    defaultValue: 'active'
  }
}, {
  tableName: 'courses',
  timestamps: true
});

// Modelo para Productores
const Producer = sequelize.define('Producer', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  status: {
    type: DataTypes.ENUM('active', 'inactive'),
    defaultValue: 'active'
  }
}, {
  tableName: 'producers',
  timestamps: true
});

// Modelo para Usuarios
const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  status: {
    type: DataTypes.ENUM('active', 'inactive', 'suspended'),
    defaultValue: 'active'
  },
  lastActivity: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'users',
  timestamps: true
});

// Modelo para Ventas
const Sale = sequelize.define('Sale', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  courseId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('pending', 'completed', 'refunded'),
    defaultValue: 'pending'
  },
  saleDate: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'sales',
  timestamps: true
});

// Modelo para Progreso de Cursos
const CourseProgress = sequelize.define('CourseProgress', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  courseId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  progress: {
    type: DataTypes.DECIMAL(5, 2),
    defaultValue: 0,
    validate: {
      min: 0,
      max: 100
    }
  },
  completed: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  completedAt: {
    type: DataTypes.DATE
  }
}, {
  tableName: 'course_progress',
  timestamps: true
});

// Definir relaciones
Course.belongsTo(Producer, { foreignKey: 'producerId', as: 'producer' });
Producer.hasMany(Course, { foreignKey: 'producerId', as: 'courses' });

Sale.belongsTo(User, { foreignKey: 'userId', as: 'user' });
Sale.belongsTo(Course, { foreignKey: 'courseId', as: 'course' });

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
  CourseProgress
};