// utils/exportUtils.js

import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

/**
 * Exporta una sección de la página como PDF con encabezado personalizado.
 * @param {string} elementId - ID del contenedor a capturar
 * @param {string} nombreArchivo - Nombre del archivo PDF
 * @param {string} usuario - Nombre del usuario que generó el reporte
 */
export const exportToPDF = async (elementId, nombreArchivo = 'estadisticas', usuario = 'Usuario Quickflow') => {
  const input = document.getElementById(elementId);
  const canvas = await html2canvas(input);
  const imgData = canvas.toDataURL('image/png');

  const pdf = new jsPDF('p', 'mm', 'a4');
  const width = pdf.internal.pageSize.getWidth();

  // 📎 Cargar logo (ajusta si está en /src/assets/)
  const logo = new Image();
  logo.src = '/logo.png';
  await new Promise(resolve => logo.onload = resolve);

  // 📅 Fecha actual
  const fecha = new Date().toLocaleDateString('es-MX', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  // 🧾 Encabezado del PDF
  pdf.addImage(logo, 'PNG', 10, 10, 30, 30);
  pdf.setFontSize(12);
  pdf.text(`Quickflow – Estadísticas`, 50, 20);
  pdf.text(`Usuario: ${usuario}`, 50, 28);
  pdf.text(`Fecha: ${fecha}`, 50, 36);

  // 📊 Imagen del contenido capturado
  const yOffset = 45;
  pdf.addImage(imgData, 'PNG', 10, yOffset, width - 20, 0);

  pdf.save(`${nombreArchivo}.pdf`);
};

/**
 * Exporta datos JSON a un archivo Excel (.xlsx)
 * @param {Array} data - Array de objetos con los datos
 * @param {string} nombreArchivo - Nombre del archivo Excel
 */
export const exportToExcel = (data, nombreArchivo = 'estadisticas') => {
  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Datos');
  const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
  saveAs(blob, `${nombreArchivo}.xlsx`);
};
