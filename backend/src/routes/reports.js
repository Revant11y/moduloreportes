




const express = require('express');
const router = express.Router();
const { Op } = require('sequelize');
const { Course, Producer, User, Sale, CourseProgress } = require('../models');

// Obtener reportes de ventas por curso
router.get('/sales-by-course', async (req, res) => {
  try {
    const { startDate, endDate, courseId, producerId } = req.query;
    
    let whereClause = {};
    
    if (startDate && endDate) {
      whereClause.saleDate = {
        [Op.between]: [new Date(startDate), new Date(endDate)]
      };
    }
    
    if (courseId) {
      whereClause.courseId = courseId;
    }

    const producerInclude = {
      model: Producer,
      as: 'producer',
      required: false
    };

    if (producerId) {
      producerInclude.where = { id: producerId };
      producerInclude.required = true;
    }

    const salesReport = await Sale.findAll({
      where: whereClause,
      include: [
        {
          model: Course,
          as: 'course',
          include: [producerInclude]
        },
        {
          model: User,
          as: 'user'
        }
      ],
      order: [['saleDate', 'DESC']]
    });

    // Agrupar ventas por curso
    const salesByCourse = {};
    
    salesReport.forEach(sale => {
      const courseIdValue = sale.course?.id || sale.courseId;
      const courseTitle = sale.course?.title || 'Curso sin titulo';
      const producerName = sale.course?.producer?.name || 'Instructor no asignado';
      const courseKey = `${courseIdValue}-${courseTitle}`;
      const amountValue = parseFloat(sale.amount) || 0;
      
      if (!salesByCourse[courseKey]) {
        salesByCourse[courseKey] = {
          courseId: courseIdValue,
          courseTitle: courseTitle,
          producer: producerName,
          totalSales: 0,
          totalRevenue: 0,
          sales: []
        };
      }
      
      salesByCourse[courseKey].totalSales += 1;
      salesByCourse[courseKey].totalRevenue += amountValue;
      salesByCourse[courseKey].sales.push({
        id: sale.id,
        user: sale.user?.name || 'Sin usuario',
        amount: amountValue,
        date: sale.saleDate,
        status: sale.status
      });
    });

    res.json({
      success: true,
      data: Object.values(salesByCourse),
      summary: {
        totalCourses: Object.keys(salesByCourse).length,
        totalSales: salesReport.length,
        totalRevenue: salesReport.reduce((sum, sale) => sum + (parseFloat(sale.amount) || 0), 0)
      }
    });

  } catch (error) {
    console.error('Error obteniendo reporte de ventas por curso:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
});

// Obtener reportes de ventas por productor
router.get('/sales-by-producer', async (req, res) => {
  try {
    const { startDate, endDate, producerId } = req.query;
    
    let whereClause = {};
    
    if (startDate && endDate) {
      whereClause.saleDate = {
        [Op.between]: [new Date(startDate), new Date(endDate)]
      };
    }

    const producerInclude = {
      model: Producer,
      as: 'producer',
      required: false
    };

    if (producerId) {
      producerInclude.where = { id: producerId };
      producerInclude.required = true;
    }

    const salesReport = await Sale.findAll({
      where: whereClause,
      include: [
        {
          model: Course,
          as: 'course',
          include: [producerInclude]
        }
      ],
      order: [['saleDate', 'DESC']]
    });

    // Agrupar ventas por productor
    const salesByProducer = {};
    
    salesReport.forEach(sale => {
      const producerIdValue = sale.course?.producer?.id || sale.instructorId || 0;
      const producerName = sale.course?.producer?.name || 'Instructor no asignado';
      const producerKey = `${producerIdValue}-${producerName}`;
      const amountValue = parseFloat(sale.amount) || 0;
      const courseKey = sale.course?.id || sale.courseId;
      const courseTitle = sale.course?.title || 'Curso sin titulo';
      
      if (!salesByProducer[producerKey]) {
        salesByProducer[producerKey] = {
          producerId: producerIdValue,
          producerName: producerName,
          totalSales: 0,
          totalRevenue: 0,
          courses: {}
        };
      }
      
      if (!salesByProducer[producerKey].courses[courseKey]) {
        salesByProducer[producerKey].courses[courseKey] = {
          courseTitle: courseTitle,
          sales: 0,
          revenue: 0
        };
      }
      
      salesByProducer[producerKey].totalSales += 1;
      salesByProducer[producerKey].totalRevenue += amountValue;
      salesByProducer[producerKey].courses[courseKey].sales += 1;
      salesByProducer[producerKey].courses[courseKey].revenue += amountValue;
    });

    // Convertir cursos de objeto a array
    Object.values(salesByProducer).forEach(producer => {
      producer.courses = Object.values(producer.courses);
    });

    res.json({
      success: true,
      data: Object.values(salesByProducer)
    });

  } catch (error) {
    console.error('Error obteniendo reporte de ventas por productor:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
});

// Obtener métricas de usuarios activos
router.get('/active-users', async (req, res) => {
  try {
    const { period = '30' } = req.query; // días
    
    const daysAgo = new Date();
    daysAgo.setDate(daysAgo.getDate() - parseInt(period));

    const activeUsers = await User.findAll({
      where: {
        lastActivity: {
          [Op.gte]: daysAgo
        }
      },
      attributes: ['id', 'name', 'email', 'lastActivity', 'status'],
      order: [['lastActivity', 'DESC']]
    });

    const totalUsers = await User.count();
    const activeCount = activeUsers.length;

    res.json({
      success: true,
      data: {
        activeUsers: activeUsers,
        metrics: {
          totalUsers: totalUsers,
          activeUsers: activeCount,
          inactiveUsers: totalUsers - activeCount,
          activityRate: totalUsers > 0 ? (activeCount / totalUsers * 100).toFixed(2) : 0
        }
      }
    });

  } catch (error) {
    console.error('Error obteniendo usuarios activos:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
});

// Obtener tasa de finalización de cursos
router.get('/completion-rate', async (req, res) => {
  try {
    const { courseId, producerId } = req.query;

    const producerInclude = {
      model: Producer,
      as: 'producer',
      required: false
    };

    if (producerId) {
      producerInclude.where = { id: producerId };
      producerInclude.required = true;
    }

    const includeClause = [
      {
        model: Course,
        as: 'course',
        required: true,
        include: [producerInclude],
        ...(courseId ? { where: { id: courseId } } : {})
      }
    ];

    const progressData = await CourseProgress.findAll({
      include: includeClause
    });

    // Agrupar por curso
    const completionByCourse = {};
    
    progressData.forEach(progress => {
      const courseKey = progress.course.id;
      
      if (!completionByCourse[courseKey]) {
        completionByCourse[courseKey] = {
          courseId: progress.course.id,
          courseTitle: progress.course.title,
          producer: progress.course.producer.name,
          totalEnrolled: 0,
          completed: 0,
          inProgress: 0,
          averageProgress: 0
        };
      }
      
      completionByCourse[courseKey].totalEnrolled += 1;
      
      if (progress.completed) {
        completionByCourse[courseKey].completed += 1;
      } else {
        completionByCourse[courseKey].inProgress += 1;
      }
      
      completionByCourse[courseKey].averageProgress += parseFloat(progress.progress);
    });

    // Calcular tasas de finalización
    Object.values(completionByCourse).forEach(course => {
      if (course.totalEnrolled > 0) {
        course.completionRate = (course.completed / course.totalEnrolled * 100).toFixed(2);
        course.averageProgress = (course.averageProgress / course.totalEnrolled).toFixed(2);
      }
    });

    res.json({
      success: true,
      data: Object.values(completionByCourse)
    });

  } catch (error) {
    console.error('Error obteniendo tasa de finalización:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
});

module.exports = router;
