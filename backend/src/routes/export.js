




const express = require('express');
const router = express.Router();
const ExcelJS = require('exceljs');
const PDFDocument = require('pdfkit');
const moment = require('moment');
const { Op, fn, col } = require('sequelize');
const { Course, Producer, User, Sale } = require('../models');
const { SALE_STATUS } = require('../utils/constants');

const buildSalesWhereClause = ({ startDate, endDate, courseId }) => {
  const whereClause = {};

  if (startDate && endDate) {
    whereClause.saleDate = {
      [Op.between]: [new Date(startDate), new Date(endDate)]
    };
  } else if (startDate) {
    whereClause.saleDate = { [Op.gte]: new Date(startDate) };
  } else if (endDate) {
    whereClause.saleDate = { [Op.lte]: new Date(endDate) };
  }

  if (courseId) {
    whereClause.courseId = courseId;
  }

  return whereClause;
};

const getSalesInclude = (producerId) => {
  const producerInclude = {
    model: Producer,
    as: 'producer',
    required: false
  };

  if (producerId) {
    producerInclude.where = { id: producerId };
    producerInclude.required = true;
  }

  return [
    {
      model: Course,
      as: 'course',
      required: true,
      include: [producerInclude]
    },
    {
      model: User,
      as: 'user',
      required: true
    }
  ];
};

const fetchSalesWithRelations = async (filters = {}) => {
  const whereClause = buildSalesWhereClause(filters);
  return Sale.findAll({
    where: whereClause,
    include: getSalesInclude(filters.producerId),
    order: [['saleDate', 'DESC']]
  });
};

const formatCurrency = (value) => `$${Number(value || 0).toFixed(2)}`;

const formatStatusLabel = (status) => {
  switch (status) {
    case SALE_STATUS.COMPLETED:
      return 'Completada';
    case SALE_STATUS.PENDING:
      return 'Pendiente';
    case SALE_STATUS.CANCELLED:
      return 'Cancelada';
    default:
      return status || 'Sin estado';
  }
};

const getStatusColor = (status) => {
  switch (status) {
    case SALE_STATUS.COMPLETED:
      return '#10b981';
    case SALE_STATUS.CANCELLED:
      return '#ef4444';
    default:
      return '#f59e0b';
  }
};

const formatDateTime = (value, format = 'DD/MM/YYYY HH:mm', fallback = 'Sin registro') => {
  if (!value) return fallback;
  return moment(value).format(format);
};

// Exportar reporte de ventas a Excel
router.get('/excel/sales', async (req, res) => {
  try {
    const { startDate, endDate, courseId, producerId } = req.query;
    const sales = await fetchSalesWithRelations({ startDate, endDate, courseId, producerId });

    // Crear libro de Excel
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Reporte de Ventas');

    // Configurar encabezados
    worksheet.columns = [
      { header: 'ID Venta', key: 'saleId', width: 10 },
      { header: 'Fecha', key: 'date', width: 15 },
      { header: 'Usuario', key: 'user', width: 25 },
      { header: 'Email Usuario', key: 'userEmail', width: 30 },
      { header: 'Curso', key: 'course', width: 30 },
      { header: 'Productor', key: 'producer', width: 25 },
      { header: 'Monto', key: 'amount', width: 12 },
      { header: 'Estado', key: 'status', width: 12 }
    ];

    // Estilo del encabezado
    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF4472C4' }
    };
    worksheet.getRow(1).font = { color: { argb: 'FFFFFFFF' }, bold: true };

    // Agregar datos
    sales.forEach(sale => {
      worksheet.addRow({
        saleId: sale.id,
        date: formatDateTime(sale.saleDate),
        user: sale.user?.name || 'Sin usuario',
        userEmail: sale.user?.email || 'Sin email',
        course: sale.course?.title || 'Curso sin titulo',
        producer: sale.course?.producer?.name || 'Instructor no asignado',
        amount: formatCurrency(sale.amount),
        status: formatStatusLabel(sale.status)
      });
    });

    // Agregar totales
    const totalAmount = sales.reduce((sum, sale) => sum + Number(sale.amount || 0), 0);
    worksheet.addRow({});
    worksheet.addRow({
      saleId: '',
      date: '',
      user: '',
      userEmail: '',
      course: '',
      producer: 'TOTAL:',
      amount: formatCurrency(totalAmount),
      status: ''
    });

    // Estilo de la fila de totales
    const totalRow = worksheet.lastRow;
    totalRow.font = { bold: true };
    totalRow.getCell('amount').fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFFF00' }
    };

    // Configurar respuesta
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=reporte-ventas-${moment().format('YYYY-MM-DD')}.xlsx`);

    // Enviar archivo
    await workbook.xlsx.write(res);
    res.end();

  } catch (error) {
    console.error('Error exportando a Excel:', error);
    res.status(500).json({
      success: false,
      error: 'Error generando archivo Excel'
    });
  }
});

// Exportar reporte de usuarios activos a Excel
router.get('/excel/users', async (req, res) => {
  try {
    const { period = '30' } = req.query;
    
    const daysAgo = new Date();
    daysAgo.setDate(daysAgo.getDate() - parseInt(period));

    const users = await User.findAll({
      where: {
        lastActivity: { [Op.gte]: daysAgo }
      },
      include: [
        {
          model: Sale,
          as: 'sales',
          attributes: [],
          required: false
        }
      ],
      attributes: [
        'id',
        'name',
        'email',
        'status',
        'lastActivity',
        'createdAt',
        [fn('COUNT', col('sales.id')), 'totalPurchases'],
        [fn('SUM', col('sales.monto')), 'totalSpent']
      ],
      group: ['User.id'],
      order: [['lastActivity', 'DESC']]
    });

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Usuarios Activos');

    worksheet.columns = [
      { header: 'ID', key: 'id', width: 8 },
      { header: 'Nombre', key: 'name', width: 25 },
      { header: 'Email', key: 'email', width: 30 },
      { header: 'Estado', key: 'status', width: 12 },
      { header: 'Ultima Actividad', key: 'lastActivity', width: 18 },
      { header: 'Registro', key: 'createdAt', width: 15 },
      { header: 'Compras Totales', key: 'totalPurchases', width: 15 },
      { header: 'Monto Total Gastado', key: 'totalSpent', width: 18 }
    ];

    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF70AD47' }
    };
    worksheet.getRow(1).font = { color: { argb: 'FFFFFFFF' }, bold: true };

    users.forEach(user => {
      const totalPurchases = parseInt(user.getDataValue('totalPurchases'), 10) || 0;
      const totalSpent = Number(user.getDataValue('totalSpent') || 0);

      worksheet.addRow({
        id: user.id,
        name: user.name,
        email: user.email,
        status: user.status ? 'Activo' : 'Inactivo',
        lastActivity: formatDateTime(user.lastActivity),
        createdAt: formatDateTime(user.createdAt, 'DD/MM/YYYY'),
        totalPurchases,
        totalSpent: formatCurrency(totalSpent)
      });
    });

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=usuarios-activos-${moment().format('YYYY-MM-DD')}.xlsx`);

    await workbook.xlsx.write(res);
    res.end();

  } catch (error) {
    console.error('Error exportando usuarios a Excel:', error);
    res.status(500).json({
      success: false,
      error: 'Error generando archivo Excel'
    });
  }
});

// Exportar reporte a PDF
router.get('/pdf/sales', async (req, res) => {
  try {
    const { startDate, endDate, courseId, producerId } = req.query;

    const sales = await fetchSalesWithRelations({ startDate, endDate, courseId, producerId });

    const doc = new PDFDocument({
      margin: 50,
      size: 'A4'
    });
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="reporte-ventas-${moment().format('YYYY-MM-DD')}.pdf"`);
    
    doc.pipe(res);

    doc.fontSize(24)
       .fillColor('#1e3a8a')
       .text('Reporte de Ventas', { align: 'center' });
    
    doc.moveDown(1);

    doc.fontSize(12)
       .fillColor('#000000');
    
    doc.text(`Fecha de generacion: ${moment().format('DD/MM/YYYY HH:mm')}`);
    
    if (startDate && endDate) {
      doc.text(`Periodo: ${moment(startDate).format('DD/MM/YYYY')} - ${moment(endDate).format('DD/MM/YYYY')}`);
    } else {
      doc.text('Periodo: Todos los registros');
    }
    
    doc.text(`Total de ventas: ${sales.length}`);
    
    const totalAmount = sales.reduce((sum, sale) => sum + Number(sale.amount || 0), 0);
    doc.text(`Monto total: ${formatCurrency(totalAmount)}`);
    
    doc.moveDown(2);

    if (!sales.length) {
      doc.fontSize(12)
         .fillColor('#ef4444')
         .text('No se encontraron ventas para los filtros seleccionados.', { align: 'center' });
      doc.end();
      return;
    }

    const tableTop = doc.y;
    const rowHeight = 25;
    
    doc.fontSize(10)
       .fillColor('#ffffff')
       .rect(50, tableTop, 500, 20)
       .fill('#3b82f6');
    
    doc.fillColor('#ffffff')
       .text('Fecha', 60, tableTop + 5)
       .text('Usuario', 130, tableTop + 5)
       .text('Curso', 220, tableTop + 5)
       .text('Instructor', 350, tableTop + 5)
       .text('Monto', 450, tableTop + 5)
       .text('Estado', 500, tableTop + 5);

    let currentY = tableTop + 25;
    
    sales.forEach((sale, index) => {
      if (currentY > 750) {
        doc.addPage();
        currentY = 50;
        
        doc.fillColor('#ffffff')
           .rect(50, currentY, 500, 20)
           .fill('#3b82f6');
        
        doc.fillColor('#ffffff')
           .text('Fecha', 60, currentY + 5)
           .text('Usuario', 130, currentY + 5)
           .text('Curso', 220, currentY + 5)
           .text('Instructor', 350, currentY + 5)
           .text('Monto', 450, currentY + 5)
           .text('Estado', 500, currentY + 5);
        
        currentY += 25;
      }
      
      const backgroundColor = index % 2 === 0 ? '#f8fafc' : '#ffffff';
      doc.rect(50, currentY, 500, rowHeight)
         .fill(backgroundColor);
      
      doc.fillColor('#000000')
         .fontSize(9);
      
      doc.text(formatDateTime(sale.saleDate, 'DD/MM/YY'), 60, currentY + 8);
      doc.text((sale.user?.name || 'Sin usuario').substring(0, 20), 130, currentY + 8);
      doc.text((sale.course?.title || 'Sin curso').substring(0, 25), 220, currentY + 8);
      doc.text((sale.course?.producer?.name || 'Instructor no asignado').substring(0, 20), 350, currentY + 8);
      doc.text(formatCurrency(sale.amount), 450, currentY + 8);
      
      const statusColor = getStatusColor(sale.status);
      doc.fillColor(statusColor)
         .text(formatStatusLabel(sale.status), 500, currentY + 8);
      
      currentY += rowHeight;
    });

    currentY += 10;
    doc.moveTo(50, currentY)
       .lineTo(550, currentY)
       .stroke();
    
    currentY += 15;
    doc.fontSize(11)
       .fillColor('#000000')
       .text(`TOTAL GENERAL: ${formatCurrency(totalAmount)}`, 450, currentY, {
         width: 100,
         align: 'right'
       });

    const bottomMargin = 50;
    doc.fontSize(8)
       .fillColor('#6b7280')
       .text('Generado por Modulo de Reportes - ' + moment().format('DD/MM/YYYY HH:mm'), 
             50, doc.page.height - bottomMargin, {
               align: 'center',
               width: doc.page.width - 100
             });

    doc.end();

  } catch (error) {
    console.error('Error exportando a PDF:', error);
    
    if (!res.headersSent) {
      res.status(500).json({
        success: false,
        error: 'Error generando archivo PDF: ' + error.message
      });
    }
  }
});



module.exports = router;
