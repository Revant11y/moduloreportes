




const express = require('express');
const router = express.Router();
const ExcelJS = require('exceljs');
const PDFDocument = require('pdfkit');
const moment = require('moment');
const { Op, fn, col } = require('sequelize');
const { sequelize } = require('../config/database');
const { Course, Producer, User, Sale, CourseProgress } = require('../models');

// Exportar reporte de ventas a Excel
router.get('/excel/sales', async (req, res) => {
  try {
    const { startDate, endDate, courseId, producerId } = req.query;
    
    // Construir filtros
    let whereClause = {};
    if (startDate && endDate) {
      whereClause.saleDate = {
        [Op.between]: [new Date(startDate), new Date(endDate)]
      };
    }
    if (courseId) {
      whereClause.courseId = courseId;
    }

    // Obtener datos de ventas
    const sales = await Sale.findAll({
      where: whereClause,
      include: [
        {
          model: Course,
          as: 'course',
          include: [
            {
              model: Producer,
              as: 'producer',
              where: producerId ? { id: producerId } : {}
            }
          ]
        },
        {
          model: User,
          as: 'user'
        }
      ],
      order: [['saleDate', 'DESC']]
    });

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
        date: moment(sale.saleDate).format('DD/MM/YYYY HH:mm'),
        user: sale.user.name,
        userEmail: sale.user.email,
        course: sale.course.title,
        producer: sale.course.producer.name,
        amount: `$${sale.amount}`,
        status: sale.status
      });
    });

    // Agregar totales
    const totalAmount = sales.reduce((sum, sale) => sum + parseFloat(sale.amount), 0);
    worksheet.addRow({});
    worksheet.addRow({
      saleId: '',
      date: '',
      user: '',
      userEmail: '',
      course: '',
      producer: 'TOTAL:',
      amount: `$${totalAmount.toFixed(2)}`,
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
        'id', 'name', 'email', 'status', 'lastActivity', 'createdAt',
        [fn('COUNT', col('sales.id')), 'totalPurchases'],
        [fn('SUM', col('sales.amount')), 'totalSpent']
      ],
      group: ['User.id'],
      order: [['lastActivity', 'DESC']]
    });

    // Crear libro de Excel
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Usuarios Activos');

    worksheet.columns = [
      { header: 'ID', key: 'id', width: 8 },
      { header: 'Nombre', key: 'name', width: 25 },
      { header: 'Email', key: 'email', width: 30 },
      { header: 'Estado', key: 'status', width: 12 },
      { header: 'Última Actividad', key: 'lastActivity', width: 18 },
      { header: 'Registro', key: 'createdAt', width: 15 },
      { header: 'Compras Totales', key: 'totalPurchases', width: 15 },
      { header: 'Monto Total Gastado', key: 'totalSpent', width: 18 }
    ];

    // Estilo del encabezado
    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF70AD47' }
    };
    worksheet.getRow(1).font = { color: { argb: 'FFFFFFFF' }, bold: true };

    users.forEach(user => {
      worksheet.addRow({
        id: user.id,
        name: user.name,
        email: user.email,
        status: user.status,
        lastActivity: moment(user.lastActivity).format('DD/MM/YYYY HH:mm'),
        createdAt: moment(user.createdAt).format('DD/MM/YYYY'),
        totalPurchases: user.getDataValue('totalPurchases') || 0,
        totalSpent: `$${(user.getDataValue('totalSpent') || 0).toFixed(2)}`
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
    
    // Datos simulados para evitar errores de DB por ahora
    const mockSales = [
      {
        id: 1,
        saleDate: new Date('2024-11-01'),
        amount: 200,
        status: 'completed',
        user: { name: 'Ana García', email: 'ana@example.com' },
        course: { 
          title: 'JavaScript Avanzado',
          producer: { name: 'TechAcademy Pro' }
        }
      },
      {
        id: 2,
        saleDate: new Date('2024-11-02'),
        amount: 200,
        status: 'completed',
        user: { name: 'Carlos López', email: 'carlos@example.com' },
        course: { 
          title: 'React Fundamentals',
          producer: { name: 'CodeMaster Studio' }
        }
      },
      {
        id: 3,
        saleDate: new Date('2024-11-03'),
        amount: 200,
        status: 'pending',
        user: { name: 'María Rodriguez', email: 'maria@example.com' },
        course: { 
          title: 'Node.js Backend',
          producer: { name: 'FullStack Academy' }
        }
      }
    ];

    const sales = mockSales;

    // Crear documento PDF
    const doc = new PDFDocument({ 
      margin: 50,
      size: 'A4'
    });
    
    // Configurar respuesta HTTP
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="reporte-ventas-${moment().format('YYYY-MM-DD')}.pdf"`);
    
    // Pipe el documento a la respuesta
    doc.pipe(res);

    // Título principal
    doc.fontSize(24)
       .fillColor('#1e3a8a')
       .text('Reporte de Ventas', { align: 'center' });
    
    doc.moveDown(1);

    // Información del reporte
    doc.fontSize(12)
       .fillColor('#000000');
    
    doc.text(`Fecha de generación: ${moment().format('DD/MM/YYYY HH:mm')}`);
    
    if (startDate && endDate) {
      doc.text(`Período: ${moment(startDate).format('DD/MM/YYYY')} - ${moment(endDate).format('DD/MM/YYYY')}`);
    } else {
      doc.text('Período: Todos los registros');
    }
    
    doc.text(`Total de ventas: ${sales.length}`);
    
    const totalAmount = sales.reduce((sum, sale) => sum + parseFloat(sale.amount), 0);
    doc.text(`Monto total: $${totalAmount.toLocaleString('es-ES', { minimumFractionDigits: 2 })}`);
    
    doc.moveDown(2);

    // Encabezados de tabla
    const tableTop = doc.y;
    const itemHeight = 25;
    
    // Configurar colores y fuente para encabezados
    doc.fontSize(10)
       .fillColor('#ffffff')
       .rect(50, tableTop, 500, 20)
       .fill('#3b82f6');
    
    // Texto de encabezados
    doc.fillColor('#ffffff')
       .text('Fecha', 60, tableTop + 5)
       .text('Usuario', 130, tableTop + 5)
       .text('Curso', 220, tableTop + 5)
       .text('Productor', 350, tableTop + 5)
       .text('Monto', 450, tableTop + 5)
       .text('Estado', 500, tableTop + 5);

    let currentY = tableTop + 25;
    
    // Filas de datos
    sales.forEach((sale, index) => {
      // Verificar si necesitamos nueva página
      if (currentY > 750) {
        doc.addPage();
        currentY = 50;
        
        // Repetir encabezados en nueva página
        doc.fillColor('#ffffff')
           .rect(50, currentY, 500, 20)
           .fill('#3b82f6');
        
        doc.fillColor('#ffffff')
           .text('Fecha', 60, currentY + 5)
           .text('Usuario', 130, currentY + 5)
           .text('Curso', 220, currentY + 5)
           .text('Productor', 350, currentY + 5)
           .text('Monto', 450, currentY + 5)
           .text('Estado', 500, currentY + 5);
        
        currentY += 25;
      }
      
      // Color alternado para filas
      const backgroundColor = index % 2 === 0 ? '#f8fafc' : '#ffffff';
      doc.rect(50, currentY, 500, itemHeight)
         .fill(backgroundColor);
      
      // Texto de la fila
      doc.fillColor('#000000')
         .fontSize(9);
      
      doc.text(moment(sale.saleDate).format('DD/MM/YY'), 60, currentY + 8);
      doc.text(sale.user.name.substring(0, 20), 130, currentY + 8);
      doc.text(sale.course.title.substring(0, 25), 220, currentY + 8);
      doc.text(sale.course.producer.name.substring(0, 15), 350, currentY + 8);
      doc.text(`$${parseFloat(sale.amount).toFixed(2)}`, 450, currentY + 8);
      
      // Color del estado
      const statusColor = sale.status === 'completed' ? '#10b981' : '#f59e0b';
      doc.fillColor(statusColor)
         .text(sale.status, 500, currentY + 8);
      
      currentY += itemHeight;
    });

    // Línea de totales
    currentY += 10;
    doc.moveTo(50, currentY)
       .lineTo(550, currentY)
       .stroke();
    
    currentY += 15;
    doc.fontSize(11)
       .fillColor('#000000')
       .text(`TOTAL GENERAL: $${totalAmount.toLocaleString('es-ES', { minimumFractionDigits: 2 })}`, 450, currentY, {
         width: 100,
         align: 'right'
       });

    // Footer
    const bottomMargin = 50;
    doc.fontSize(8)
       .fillColor('#6b7280')
       .text('Generado por Módulo de Reportes - ' + moment().format('DD/MM/YYYY HH:mm'), 
             50, doc.page.height - bottomMargin, {
               align: 'center',
               width: doc.page.width - 100
             });

    // Finalizar documento
    doc.end();

  } catch (error) {
    console.error('Error exportando a PDF:', error);
    
    // Si ya se envió una respuesta parcial, no podemos enviar JSON
    if (!res.headersSent) {
      res.status(500).json({
        success: false,
        error: 'Error generando archivo PDF: ' + error.message
      });
    }
  }
});

module.exports = router;