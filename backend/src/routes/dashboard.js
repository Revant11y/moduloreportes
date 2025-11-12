





const express = require('express');
const router = express.Router();
const { Op } = require('sequelize');
const { sequelize } = require('../config/database');
const { Course, Producer, User, Sale, CourseProgress } = require('../models');
const { SALE_STATUS } = require('../utils/constants');

// Obtener KPIs principales del dashboard
router.get('/kpis', async (req, res) => {
  try {
    const { period = '30' } = req.query;
    
    const daysAgo = new Date();
    daysAgo.setDate(daysAgo.getDate() - parseInt(period));

    // Ventas totales en el período
    const totalSales = await Sale.sum('amount', {
      where: {
        saleDate: {
          [Op.gte]: daysAgo
        },
        status: SALE_STATUS.COMPLETED
      }
    });

    // Número de ventas en el período
    const salesCount = await Sale.count({
      where: {
        saleDate: {
          [Op.gte]: daysAgo
        },
        status: SALE_STATUS.COMPLETED
      }
    });

    // Usuarios activos
    const activeUsers = await User.count({
      where: {
        lastActivity: {
          [Op.gte]: daysAgo
        }
      }
    });

    // Total de usuarios
    const totalUsers = await User.count();

    // Tasa promedio de finalización
    const avgCompletionRate = await CourseProgress.findOne({
      attributes: [
        [sequelize.fn('AVG', sequelize.col('CourseProgress.progreso')), 'avgProgress']
      ]
    });

    // Cursos completados en el período
    const completedCourses = await CourseProgress.count({
      where: {
        completedAt: {
          [Op.ne]: null,
          [Op.gte]: daysAgo
        }
      }
    });

    // Obtener datos para gráfico de ventas por día
    const salesByDay = await Sale.findAll({
      attributes: [
        [sequelize.fn('DATE', sequelize.col('Sale.fecha_venta')), 'date'],
        [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
        [sequelize.fn('SUM', sequelize.col('Sale.monto')), 'total']
      ],
      where: {
        saleDate: {
          [Op.gte]: daysAgo
        },
        status: SALE_STATUS.COMPLETED
      },
      group: [sequelize.fn('DATE', sequelize.col('Sale.fecha_venta'))],
      order: [[sequelize.fn('DATE', sequelize.col('Sale.fecha_venta')), 'ASC']]
    });

    // Top 5 cursos más vendidos
    const topCourses = await Sale.findAll({
      attributes: [
        'courseId',
        [sequelize.fn('COUNT', sequelize.col('Sale.id')), 'salesCount'],
        [sequelize.fn('SUM', sequelize.col('Sale.monto')), 'totalRevenue']
      ],
      include: [
        {
          model: Course,
          as: 'course',
          attributes: ['title']
        }
      ],
      where: {
        saleDate: {
          [Op.gte]: daysAgo
        },
        status: SALE_STATUS.COMPLETED
      },
      group: ['courseId', 'course.id', 'course.titulo'],
      order: [[sequelize.fn('COUNT', sequelize.col('Sale.id')), 'DESC']],
      limit: 5
    });

    res.json({
      success: true,
      data: {
        kpis: {
          totalRevenue: totalSales || 0,
          salesCount: salesCount,
          activeUsers: activeUsers,
          totalUsers: totalUsers,
          completionRate: avgCompletionRate?.getDataValue('avgProgress') || 0,
          completedCourses: completedCourses,
          period: period
        },
        charts: {
          salesByDay: salesByDay,
          topCourses: topCourses.map(item => ({
            courseTitle: item.course.title,
            salesCount: parseInt(item.getDataValue('salesCount')),
            totalRevenue: parseFloat(item.getDataValue('totalRevenue'))
          }))
        }
      }
    });

  } catch (error) {
    console.error('Error obteniendo KPIs del dashboard:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
});

// Obtener estadísticas en tiempo real
router.get('/realtime', async (req, res) => {
  try {
    // Obtener datos de las últimas 24 horas
    const last24Hours = new Date();
    last24Hours.setHours(last24Hours.getHours() - 24);

    const realtimeStats = await Promise.all([
      // Ventas de las últimas 24 horas
        Sale.count({
          where: {
            saleDate: { [Op.gte]: last24Hours },
            status: SALE_STATUS.COMPLETED
          }
        }),
      
      // Usuarios conectados (simulado - en un caso real usarías websockets)
      User.count({
        where: {
          lastActivity: { [Op.gte]: last24Hours }
        }
      }),
      
      // Nuevos registros de usuarios
      User.count({
        where: sequelize.where(
          sequelize.col('User.created_at'),
          { [Op.gte]: last24Hours }
        )
      }),
      
      // Cursos completados hoy
      CourseProgress.count({
        where: {
          completedAt: {
            [Op.ne]: null,
            [Op.gte]: last24Hours
          }
        }
      })
    ]);

    res.json({
      success: true,
      data: {
        sales24h: realtimeStats[0],
        activeUsers: realtimeStats[1],
        newUsers24h: realtimeStats[2],
        completions24h: realtimeStats[3],
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Error obteniendo datos en tiempo real:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
});

// Obtener datos para gráfico de ingresos
router.get('/revenue-chart', async (req, res) => {
  try {
    const { period = '30', groupBy = 'day' } = req.query;
    
    const daysAgo = new Date();
    daysAgo.setDate(daysAgo.getDate() - parseInt(period));

    let dateFormat;
    switch(groupBy) {
      case 'hour':
        dateFormat = '%Y-%m-%d %H:00:00';
        break;
      case 'day':
        dateFormat = '%Y-%m-%d';
        break;
      case 'week':
        dateFormat = '%Y-%u';
        break;
      case 'month':
        dateFormat = '%Y-%m';
        break;
      default:
        dateFormat = '%Y-%m-%d';
    }

    const revenueData = await Sale.findAll({
      attributes: [
        [sequelize.fn('DATE_FORMAT', sequelize.col('Sale.fecha_venta'), dateFormat), 'period'],
        [sequelize.fn('SUM', sequelize.col('Sale.monto')), 'revenue'],
        [sequelize.fn('COUNT', sequelize.col('id')), 'salesCount']
      ],
      where: {
        saleDate: { [Op.gte]: daysAgo },
        status: SALE_STATUS.COMPLETED
      },
      group: [sequelize.fn('DATE_FORMAT', sequelize.col('Sale.fecha_venta'), dateFormat)],
      order: [[sequelize.fn('DATE_FORMAT', sequelize.col('Sale.fecha_venta'), dateFormat), 'ASC']]
    });

    res.json({
      success: true,
      data: revenueData.map(item => ({
        period: item.getDataValue('period'),
        revenue: parseFloat(item.getDataValue('revenue')),
        salesCount: parseInt(item.getDataValue('salesCount'))
      }))
    });

  } catch (error) {
    console.error('Error obteniendo datos de ingresos:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
});

module.exports = router;
