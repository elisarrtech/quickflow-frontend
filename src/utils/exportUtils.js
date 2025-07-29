import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

export const exportToPDF = async (elementId, nombreArchivo = 'estadisticas') => {
  const input = document.getElementById(elementId);
  const canvas = await html2canvas(input);
  const imgData = canvas.toDataURL('image/png');

  const pdf = new jsPDF('p', 'mm', 'a4');
  const imgProps = pdf.getImageProperties(imgData);
  const pdfWidth = pdf.internal.pageSize.getWidth();
  const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

  pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
  pdf.save(`${nombreArchivo}.pdf`);
};
