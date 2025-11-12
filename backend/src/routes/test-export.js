const express = require('express');
const router = express.Router();
const PDFDocument = require('pdfkit');
const moment = require('moment');

// Endpoint de prueba PDF simple
router.get('/test/simple-pdf', async (req, res) => {
  try {
    console.log('🔄 Iniciando generación de PDF de prueba...');

    // Crear documento PDF simple
    const doc = new PDFDocument({ margin: 50 });
    
    // Configurar headers de respuesta
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="test-pdf.pdf"');
    res.setHeader('Content-Length', doc._data ? doc._data.length : 0);
    
    // Conectar el documento a la respuesta
    doc.pipe(res);

    // Contenido simple
    doc.fontSize(20).text('PDF Test - Módulo de Reportes', { align: 'center' });
    doc.moveDown();
    doc.fontSize(12).text(`Generado: ${moment().format('DD/MM/YYYY HH:mm:ss')}`);
    doc.text('Este es un PDF de prueba para verificar que la funcionalidad funciona correctamente.');
    
    // Finalizar
    doc.end();
    
    console.log('✅ PDF de prueba generado exitosamente');

  } catch (error) {
    console.error('❌ Error en PDF de prueba:', error);
    
    if (!res.headersSent) {
      res.status(500).json({
        success: false,
        error: 'Error generando PDF de prueba: ' + error.message
      });
    }
  }
});

// Test de conectividad
router.get('/test/health', (req, res) => {
  res.json({
    success: true,
    message: 'Export routes funcionando correctamente',
    timestamp: new Date().toISOString(),
    dependencies: {
      pdfkit: require('pdfkit/package.json').version,
      moment: require('moment/package.json').version,
      exceljs: require('exceljs/package.json').version
    }
  });
});

module.exports = router;