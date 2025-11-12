import { databaseService } from './database';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// Función para generar Excel nativo (.xlsx) localmente con datos de la BD
export const generateUsersExcelLocal = async (period?: string) => {
  try {
    // Obtener datos de usuarios desde el servicio local
    const response = databaseService.getActiveUsers(period);
    
    if (!response.success || !response.data) {
      throw new Error('No se pudieron obtener los datos de usuarios');
    }

    const { users, metrics } = response.data;
    
    // Crear estructura de Excel con HTML
    const excelContent = `
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            .header { background-color: #10b981; color: white; font-weight: bold; text-align: center; }
            .summary { background-color: #f3f4f6; font-weight: bold; }
            table { border-collapse: collapse; width: 100%; }
            td, th { border: 1px solid #ddd; padding: 8px; text-align: left; }
          </style>
        </head>
        <body>
          <h1>Reporte de Usuarios Activos</h1>
          <p><strong>Período:</strong> Últimos ${period || 30} días</p>
          <p><strong>Generado:</strong> ${new Date().toLocaleString()}</p>
          
          <h2>Resumen</h2>
          <table>
            <tr class="summary">
              <td><strong>Total de usuarios:</strong></td>
              <td>${metrics.totalUsers}</td>
            </tr>
            <tr class="summary">
              <td><strong>Usuarios activos:</strong></td>
              <td>${metrics.activeUsers}</td>
            </tr>
            <tr class="summary">
              <td><strong>Usuarios inactivos:</strong></td>
              <td>${metrics.inactiveUsers}</td>
            </tr>
            <tr class="summary">
              <td><strong>Tasa de actividad:</strong></td>
              <td>${metrics.activityRate}%</td>
            </tr>
          </table>
          
          <h2>Detalles de Usuarios</h2>
          <table>
            <tr class="header">
              <th>ID</th>
              <th>Nombre</th>
              <th>Email</th>
              <th>Estado</th>
              <th>Última Actividad</th>
            </tr>
            ${users.map(user => `
              <tr>
                <td>${user.id}</td>
                <td>${user.name}</td>
                <td>${user.email}</td>
                <td>${user.status}</td>
                <td>${user.lastActivity ? new Date(user.lastActivity).toLocaleDateString() : 'N/A'}</td>
              </tr>
            `).join('')}
          </table>
        </body>
      </html>
    `;
    
    // Crear blob Excel y descargar
    const blob = new Blob([excelContent], { 
      type: 'application/vnd.ms-excel;charset=utf-8;' 
    });
    
    const link = document.createElement('a');
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `usuarios-activos-${new Date().toISOString().split('T')[0]}.xls`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }
    
    return { success: true };
    
  } catch (error) {
    console.error('Error generando Excel de usuarios:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Error desconocido' };
  }
};

// Función para generar Excel de ventas localmente
export const generateSalesExcelLocal = async (filters?: any) => {
  try {
    // Obtener datos de ventas desde el servicio local
    const response = databaseService.getRevenueChart();
    
    if (!response.success || !response.data) {
      throw new Error('No se pudieron obtener los datos de ventas');
    }

    const { topCourses, salesByDay } = response.data;
    const totalSales = topCourses.reduce((sum, course) => sum + course.salesCount, 0);
    const totalRevenue = topCourses.reduce((sum, course) => sum + course.totalRevenue, 0);
    
    // Crear estructura de Excel con HTML
    const excelContent = `
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            .header { background-color: #10b981; color: white; font-weight: bold; text-align: center; }
            .summary { background-color: #f3f4f6; font-weight: bold; }
            table { border-collapse: collapse; width: 100%; margin-bottom: 20px; }
            td, th { border: 1px solid #ddd; padding: 8px; text-align: left; }
            .currency { text-align: right; }
          </style>
        </head>
        <body>
          <h1>Reporte de Ventas</h1>
          <p><strong>Generado:</strong> ${new Date().toLocaleString()}</p>
          
          <h2>Resumen General</h2>
          <table>
            <tr class="summary">
              <td><strong>Total de ventas:</strong></td>
              <td>${totalSales}</td>
            </tr>
            <tr class="summary">
              <td><strong>Ingresos totales:</strong></td>
              <td class="currency">$${totalRevenue.toLocaleString()}</td>
            </tr>
          </table>
          
          <h2>Ventas por Curso</h2>
          <table>
            <tr class="header">
              <th>Curso</th>
              <th>Ventas</th>
              <th>Ingresos</th>
              <th>Precio Promedio</th>
            </tr>
            ${topCourses.map(course => `
              <tr>
                <td>${course.courseTitle}</td>
                <td>${course.salesCount}</td>
                <td class="currency">$${course.totalRevenue.toLocaleString()}</td>
                <td class="currency">$${Math.round(course.totalRevenue / course.salesCount).toLocaleString()}</td>
              </tr>
            `).join('')}
          </table>
          
          <h2>Ventas por Día</h2>
          <table>
            <tr class="header">
              <th>Fecha</th>
              <th>Cantidad</th>
              <th>Total</th>
            </tr>
            ${salesByDay.map(day => `
              <tr>
                <td>${day.date}</td>
                <td>${day.count}</td>
                <td class="currency">$${day.total.toLocaleString()}</td>
              </tr>
            `).join('')}
          </table>
        </body>
      </html>
    `;

    // Crear blob Excel y descargar
    const blob = new Blob([excelContent], { 
      type: 'application/vnd.ms-excel;charset=utf-8;' 
    });
    
    const link = document.createElement('a');
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `reporte-ventas-${new Date().toISOString().split('T')[0]}.xls`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }
    
    return { success: true };
    
  } catch (error) {
    console.error('Error generando Excel de ventas:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Error desconocido' };
  }
};

// Función para generar PDF de usuarios localmente
export const generateUsersPdfLocal = async (period?: string) => {
  try {
    // Obtener datos de usuarios desde el servicio local
    const response = databaseService.getActiveUsers(period);
    
    if (!response.success || !response.data) {
      throw new Error('No se pudieron obtener los datos de usuarios');
    }

    const { users, metrics } = response.data;
    
    // Crear documento PDF
    const doc = new jsPDF();
    
    // Configurar fuente
    doc.setFont('helvetica');
    
    // Título principal
    doc.setFontSize(20);
    doc.setTextColor(16, 185, 129); // Verde corporativo
    doc.text('Reporte de Usuarios Activos', 20, 25);
    
    // Información del reporte
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Generado: ${new Date().toLocaleString()}`, 20, 35);
    doc.text(`Período: Últimos ${period || 30} días`, 20, 42);
    
    // Sección de resumen
    doc.setFontSize(14);
    doc.setTextColor(0);
    doc.text('Resumen General', 20, 60);
    
    // Crear tabla de resumen
    const summaryTable = autoTable(doc, {
      startY: 65,
      head: [['Métrica', 'Valor']],
      body: [
        ['Total de usuarios', metrics.totalUsers.toString()],
        ['Usuarios activos', metrics.activeUsers.toString()],
        ['Usuarios inactivos', metrics.inactiveUsers.toString()],
        ['Tasa de actividad', `${metrics.activityRate}%`]
      ],
      theme: 'grid',
      headStyles: { 
        fillColor: [16, 185, 129],
        textColor: 255,
        fontStyle: 'bold' 
      },
      margin: { left: 20, right: 20 }
    });
    
    // Sección de usuarios detallados
    const finalY = (doc as any).lastAutoTable.finalY + 20;
    doc.setFontSize(14);
    doc.text('Detalle de Usuarios', 20, finalY);
    
    // Crear tabla de usuarios
    const userData = users.map(user => [
      user.id.toString(),
      user.name,
      user.email,
      user.status,
      user.lastActivity ? new Date(user.lastActivity).toLocaleDateString() : 'N/A'
    ]);
    
    autoTable(doc, {
      startY: finalY + 5,
      head: [['ID', 'Nombre', 'Email', 'Estado', 'Última Actividad']],
      body: userData,
      theme: 'striped',
      headStyles: { 
        fillColor: [16, 185, 129],
        textColor: 255,
        fontStyle: 'bold' 
      },
      alternateRowStyles: { fillColor: [248, 250, 252] },
      margin: { left: 20, right: 20 },
      columnStyles: {
        0: { cellWidth: 15 },
        1: { cellWidth: 40 },
        2: { cellWidth: 50 },
        3: { cellWidth: 25 },
        4: { cellWidth: 30 }
      }
    });
    
    // Guardar PDF
    const fileName = `reporte-usuarios-${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(fileName);
    
    return { success: true };
    
  } catch (error) {
    console.error('Error generando PDF de usuarios:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Error desconocido' };
  }
};

// Función para generar Excel de finalización de cursos localmente
export const generateCompletionExcelLocal = async (filters?: any) => {
  try {
    // Obtener datos de finalización desde el servicio local
    const response = databaseService.getCompletionRate();
    
    if (!response.success || !response.data) {
      throw new Error('No se pudieron obtener los datos de finalización');
    }

    const { courses, summary } = response.data;
    
    // Crear estructura de Excel con HTML
    const excelContent = `
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            .header { background-color: #10b981; color: white; font-weight: bold; text-align: center; }
            .summary { background-color: #f3f4f6; font-weight: bold; }
            table { border-collapse: collapse; width: 100%; margin-bottom: 20px; }
            td, th { border: 1px solid #ddd; padding: 8px; text-align: left; }
            .number { text-align: right; }
            .rate { text-align: right; }
          </style>
        </head>
        <body>
          <h1>Reporte de Finalización de Cursos</h1>
          <p><strong>Generado:</strong> ${new Date().toLocaleString()}</p>
          
          <h2>Resumen General</h2>
          <table>
            <tr class="summary">
              <td><strong>Tasa promedio de finalización:</strong></td>
              <td class="rate">${summary.averageCompletionRate.toFixed(1)}%</td>
            </tr>
            <tr class="summary">
              <td><strong>Total inscritos:</strong></td>
              <td class="number">${summary.totalEnrolled}</td>
            </tr>
            <tr class="summary">
              <td><strong>Total completados:</strong></td>
              <td class="number">${summary.totalCompleted}</td>
            </tr>
          </table>
          
          <h2>Progreso por Curso</h2>
          <table>
            <tr class="header">
              <th>Curso</th>
              <th>Inscritos</th>
              <th>Completados</th>
              <th>Tasa Finalización</th>
            </tr>
            ${courses.map(course => `
              <tr>
                <td>${course.courseTitle}</td>
                <td class="number">${course.enrolled}</td>
                <td class="number">${course.completed}</td>
                <td class="rate">${course.completionRate.toFixed(1)}%</td>
              </tr>
            `).join('')}
          </table>
        </body>
      </html>
    `;

    // Crear blob Excel y descargar
    const blob = new Blob([excelContent], { 
      type: 'application/vnd.ms-excel;charset=utf-8;' 
    });
    
    const link = document.createElement('a');
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `reporte-finalizacion-${new Date().toISOString().split('T')[0]}.xls`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }
    
    return { success: true };
    
  } catch (error) {
    console.error('Error generando Excel de finalización:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Error desconocido' };
  }
};

// Función para generar PDF de ventas localmente
export const generateSalesPdfLocal = async (filters?: any) => {
  try {
    // Obtener datos de ventas desde el servicio local
    const response = databaseService.getRevenueChart();
    
    if (!response.success || !response.data) {
      throw new Error('No se pudieron obtener los datos de ventas');
    }

    const { topCourses, salesByDay } = response.data;
    const totalSales = topCourses.reduce((sum, course) => sum + course.salesCount, 0);
    const totalRevenue = topCourses.reduce((sum, course) => sum + course.totalRevenue, 0);
    
    // Crear documento PDF
    const doc = new jsPDF();
    
    // Título principal
    doc.setFontSize(20);
    doc.setTextColor(16, 185, 129);
    doc.text('Reporte de Ventas', 20, 25);
    
    // Información del reporte
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Generado: ${new Date().toLocaleString()}`, 20, 35);
    
    // Resumen general
    doc.setFontSize(14);
    doc.setTextColor(0);
    doc.text('Resumen General', 20, 55);
    
    autoTable(doc, {
      startY: 60,
      head: [['Métrica', 'Valor']],
      body: [
        ['Total de ventas', totalSales.toString()],
        ['Ingresos totales', `$${totalRevenue.toLocaleString()}`],
        ['Promedio por venta', `$${Math.round(totalRevenue / totalSales).toLocaleString()}`]
      ],
      theme: 'grid',
      headStyles: { 
        fillColor: [16, 185, 129],
        textColor: 255,
        fontStyle: 'bold' 
      },
      margin: { left: 20, right: 20 }
    });
    
    // Ventas por curso
    const finalY1 = (doc as any).lastAutoTable.finalY + 20;
    doc.setFontSize(14);
    doc.text('Ventas por Curso', 20, finalY1);
    
    const coursesData = topCourses.map(course => [
      course.courseTitle,
      course.salesCount.toString(),
      `$${course.totalRevenue.toLocaleString()}`,
      `$${Math.round(course.totalRevenue / course.salesCount).toLocaleString()}`
    ]);
    
    autoTable(doc, {
      startY: finalY1 + 5,
      head: [['Curso', 'Ventas', 'Ingresos', 'Precio Prom.']],
      body: coursesData,
      theme: 'striped',
      headStyles: { 
        fillColor: [16, 185, 129],
        textColor: 255,
        fontStyle: 'bold' 
      },
      alternateRowStyles: { fillColor: [248, 250, 252] },
      margin: { left: 20, right: 20 }
    });
    
    // Ventas por día
    const finalY2 = (doc as any).lastAutoTable.finalY + 20;
    doc.setFontSize(14);
    doc.text('Ventas por Día', 20, finalY2);
    
    const salesData = salesByDay.map(day => [
      day.date,
      day.count.toString(),
      `$${day.total.toLocaleString()}`
    ]);
    
    autoTable(doc, {
      startY: finalY2 + 5,
      head: [['Fecha', 'Cantidad', 'Total']],
      body: salesData,
      theme: 'striped',
      headStyles: { 
        fillColor: [16, 185, 129],
        textColor: 255,
        fontStyle: 'bold' 
      },
      alternateRowStyles: { fillColor: [248, 250, 252] },
      margin: { left: 20, right: 20 }
    });
    
    // Guardar PDF
    const fileName = `reporte-ventas-${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(fileName);
    
    return { success: true };
    
  } catch (error) {
    console.error('Error generando PDF de ventas:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Error desconocido' };
  }
};

// Función para generar PDF de finalización de cursos localmente
export const generateCompletionPdfLocal = async (filters?: any) => {
  try {
    // Obtener datos de finalización desde el servicio local
    const response = databaseService.getCompletionRate();
    
    if (!response.success || !response.data) {
      throw new Error('No se pudieron obtener los datos de finalización');
    }

    const { courses, summary } = response.data;
    
    // Crear documento PDF
    const doc = new jsPDF();
    
    // Título principal
    doc.setFontSize(20);
    doc.setTextColor(16, 185, 129);
    doc.text('Reporte de Finalización de Cursos', 20, 25);
    
    // Información del reporte
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Generado: ${new Date().toLocaleString()}`, 20, 35);
    
    // Resumen general
    doc.setFontSize(14);
    doc.setTextColor(0);
    doc.text('Resumen General', 20, 55);
    
    autoTable(doc, {
      startY: 60,
      head: [['Métrica', 'Valor']],
      body: [
        ['Tasa promedio de finalización', `${summary.averageCompletionRate.toFixed(1)}%`],
        ['Total inscritos', summary.totalEnrolled.toString()],
        ['Total completados', summary.totalCompleted.toString()]
      ],
      theme: 'grid',
      headStyles: { 
        fillColor: [16, 185, 129],
        textColor: 255,
        fontStyle: 'bold' 
      },
      margin: { left: 20, right: 20 }
    });
    
    // Progreso por curso
    const finalY = (doc as any).lastAutoTable.finalY + 20;
    doc.setFontSize(14);
    doc.text('Progreso por Curso', 20, finalY);
    
    const coursesData = courses.map(course => [
      course.courseTitle,
      course.enrolled.toString(),
      course.completed.toString(),
      `${course.completionRate.toFixed(1)}%`
    ]);
    
    autoTable(doc, {
      startY: finalY + 5,
      head: [['Curso', 'Inscritos', 'Completados', 'Tasa Finalización']],
      body: coursesData,
      theme: 'striped',
      headStyles: { 
        fillColor: [16, 185, 129],
        textColor: 255,
        fontStyle: 'bold' 
      },
      alternateRowStyles: { fillColor: [248, 250, 252] },
      margin: { left: 20, right: 20 }
    });
    
    // Guardar PDF
    const fileName = `reporte-finalizacion-${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(fileName);
    
    return { success: true };
    
  } catch (error) {
    console.error('Error generando PDF de finalización:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Error desconocido' };
  }
};