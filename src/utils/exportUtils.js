import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

export const exportToPDF = async (elementId, nombreArchivo = 'estadisticas', usuario = 'Usuario Quickflow') => {
  const input = document.getElementById(elementId);
  const canvas = await html2canvas(input);
  const imgData = canvas.toDataURL('image/png');

  const pdf = new jsPDF('p', 'mm', 'a4');
  const width = pdf.internal.pageSize.getWidth();
  const height = pdf.internal.pageSize.getHeight();

  // 🧠 Logo superior (ajustar según tu logo)
  const logo = new Image();
  logo.src = '/logo.png'; // ajusta la ruta si está en src/assets
  await new Promise(resolve => {
    logo.onload = () => resolve();
  });

  // 🕓 Fecha actual
  const fecha = new Date().toLocaleDateString('es-MX', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  // 📝 Encabezado con logo + texto
  pdf.addImage(logo, 'PNG', 10, 10, 30, 30);
  pdf.setFontSize(12);
  pdf.text(`Quickflow – Estadísticas`, 50, 20);
  pdf.text(`Usuario: ${usuario}`, 50, 28);
  pdf.text(`Fecha: ${fecha}`, 50, 36);

  // 🖼️ Gráfico insertado
  const yOffset = 45; // empujar hacia abajo
  pdf.addImage(imgData, 'PNG', 10, yOffset, width - 20, 0);

  pdf.save(`${nombreArchivo}.pdf`);
};


  const pdf = new jsPDF('p', 'mm', 'a4');
  const imgProps = pdf.getImageProperties(imgData);
  const pdfWidth = pdf.internal.pageSize.getWidth();
  const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

  pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
  pdf.save(`${nombreArchivo}.pdf`);
};
