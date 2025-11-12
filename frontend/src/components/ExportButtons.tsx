import React, { useEffect, useState } from 'react';
import { FileSpreadsheet, FileText, Loader } from 'lucide-react';
import { 
  generateUsersExcelLocal, 
  generateSalesExcelLocal, 
  generateCompletionExcelLocal, 
  generateUsersPdfLocal,
  generateSalesPdfLocal,
  generateCompletionPdfLocal
} from '../services/export-local';

interface ExportButtonsProps {
  reportType: 'sales' | 'users' | 'completion';
  filters?: any;
  className?: string;
}

const ExportButtons: React.FC<ExportButtonsProps> = ({ 
  reportType, 
  filters = {},
  className = ""
}) => {
  const [isExporting, setIsExporting] = useState<{
    excel: boolean;
    pdf: boolean;
  }>({
    excel: false,
    pdf: false
  });
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    if (!feedback) {
      return;
    }
    const timer = setTimeout(() => setFeedback(null), 4000);
    return () => clearTimeout(timer);
  }, [feedback]);

  const getReportLabel = () => {
    switch (reportType) {
      case 'sales':
        return 'Reporte de ventas';
      case 'users':
        return 'Reporte de usuarios';
      case 'completion':
        return 'Reporte de finalización';
      default:
        return 'Reporte';
    }
  };

  const notifySuccess = (format: 'excel' | 'pdf') => {
    const label = getReportLabel();
    setFeedback({
      type: 'success',
      message: `${label} exportado en ${format === 'excel' ? 'Excel' : 'PDF'} correctamente.`
    });
  };

  const handleExportExcel = async () => {
    try {
      setIsExporting(prev => ({ ...prev, excel: true }));
      
      let result;
      switch (reportType) {
        case 'sales':
          result = await generateSalesExcelLocal(filters);
          break;
        case 'users':
          result = await generateUsersExcelLocal(filters.period);
          break;
        case 'completion':
          result = await generateCompletionExcelLocal(filters);
          break;
        default:
          throw new Error('Tipo de reporte no soportado para Excel');
      }

      if (result.success) {
        console.log('✅ Excel exportado exitosamente');
        notifySuccess('excel');
      } else {
        console.error('❌ Error exportando Excel:', result.error);
        alert('Error al exportar Excel: ' + result.error);
        setFeedback({
          type: 'error',
          message: 'Ocurrió un error al exportar el Excel. Inténtalo nuevamente.'
        });
      }
      
    } catch (error) {
      console.error('Error en exportación Excel:', error);
      alert('Error al exportar Excel');
      setFeedback({
        type: 'error',
        message: 'Ocurrió un error al exportar el Excel. Inténtalo nuevamente.'
      });
    } finally {
      setIsExporting(prev => ({ ...prev, excel: false }));
    }
  };

  const handleExportPDF = async () => {
    try {
      setIsExporting(prev => ({ ...prev, pdf: true }));
      
      let result;
      switch (reportType) {
        case 'users':
          result = await generateUsersPdfLocal(filters.period);
          break;
        case 'sales':
          result = await generateSalesPdfLocal(filters);
          break;
        case 'completion':
          result = await generateCompletionPdfLocal(filters);
          break;
        default:
          throw new Error('Tipo de reporte no soportado para PDF');
      }

      if (result.success) {
        console.log('✅ PDF exportado exitosamente');
        notifySuccess('pdf');
      } else {
        console.error('❌ Error exportando PDF:', result.error);
        alert('Error al exportar PDF: ' + result.error);
        setFeedback({
          type: 'error',
          message: 'Ocurrió un error al exportar el PDF. Inténtalo nuevamente.'
        });
      }
      
    } catch (error) {
      console.error('Error en exportación PDF:', error);
      alert('Error al exportar PDF');
      setFeedback({
        type: 'error',
        message: 'Ocurrió un error al exportar el PDF. Inténtalo nuevamente.'
      });
    } finally {
      setIsExporting(prev => ({ ...prev, pdf: false }));
    }
  };

  return (
    <div className={`export-buttons ${className}`}>
      <button
        onClick={handleExportExcel}
        disabled={isExporting.excel}
        className="btn btn-success export-btn"
      >
        {isExporting.excel ? (
          <>
            <Loader className="icon icon-spin" />
            Exportando...
          </>
        ) : (
          <>
            <FileSpreadsheet className="icon" />
            Exportar Excel
          </>
        )}
      </button>

      <button
        onClick={handleExportPDF}
        disabled={isExporting.pdf}
        className="btn btn-secondary export-btn"
      >
        {isExporting.pdf ? (
          <>
            <Loader className="icon icon-spin" />
            Exportando...
          </>
        ) : (
          <>
            <FileText className="icon" />
            Exportar PDF
          </>
        )}
      </button>

      {feedback && (
        <div className={`export-feedback ${feedback.type}`}>
          {feedback.message}
        </div>
      )}
    </div>
  );
};

export default ExportButtons;
