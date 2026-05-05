import { jsPDF } from 'jspdf';
import { Race, Registration } from '../types';
import { formatDate } from './utils';

export const generateCertificate = (race: Race, registration: Registration) => {
  // Create landscape PDF
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  // Draw background/border
  doc.setDrawColor(250, 204, 21); // Yellow-400
  doc.setLineWidth(5);
  doc.rect(5, 5, pageWidth - 10, pageHeight - 10);
  
  doc.setDrawColor(30, 41, 59); // Slate-800
  doc.setLineWidth(1);
  doc.rect(8, 8, pageWidth - 16, pageHeight - 16);

  // Add decorative corners
  doc.setFillColor(250, 204, 21);
  doc.triangle(5, 5, 25, 5, 5, 25, 'F');
  doc.triangle(pageWidth - 5, 5, pageWidth - 25, 5, pageWidth - 5, 25, 'F');
  doc.triangle(5, pageHeight - 5, 25, pageHeight - 5, 5, pageHeight - 25, 'F');
  doc.triangle(pageWidth - 5, pageHeight - 5, pageWidth - 25, pageHeight - 5, pageWidth - 5, pageHeight - 25, 'F');

  // Title
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30, 41, 59);
  doc.setFontSize(40);
  doc.text('CERTIFICADO', pageWidth / 2, 45, { align: 'center' });
  
  doc.setFontSize(20);
  doc.setFont('helvetica', 'normal');
  doc.text('DE PARTICIPAÇÃO', pageWidth / 2, 55, { align: 'center' });

  // Body text
  doc.setFontSize(16);
  doc.text('Este certificado é concedido com orgulho a:', pageWidth / 2, 85, { align: 'center' });

  // Runner name
  doc.setFont('helvetica', 'bolditalic');
  doc.setFontSize(32);
  doc.setTextColor(0, 0, 0);
  doc.text(registration.runnerName.toUpperCase(), pageWidth / 2, 105, { align: 'center' });

  // Registration details (CPF/Category)
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(12);
  doc.setTextColor(100, 116, 139);
  doc.text(`CPF: ${registration.cpf}`, pageWidth / 2, 112, { align: 'center' });

  // Race information
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(16);
  doc.setTextColor(30, 41, 59);
  const raceText = `Pela sua conclusão e dedicação na competição`;
  doc.text(raceText, pageWidth / 2, 130, { align: 'center' });
  
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  doc.text(race.name.toUpperCase(), pageWidth / 2, 142, { align: 'center' });

  // Location and Date
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(14);
  doc.text(`Realizada em em ${formatDate(race.date)} - ${race.location}`, pageWidth / 2, 155, { align: 'center' });

  // Signature line
  doc.setDrawColor(30, 41, 59);
  doc.setLineWidth(0.5);
  doc.line(pageWidth / 2 - 40, 180, pageWidth / 2 + 40, 180);
  
  doc.setFontSize(12);
  doc.text('Organização RunManager', pageWidth / 2, 185, { align: 'center' });
  
  // Footer ID
  doc.setFontSize(8);
  doc.setTextColor(148, 163, 184);
  doc.text(`Certificado Digital - ID: ${registration.id} | Validado por RunManager System`, pageWidth / 2, 200, { align: 'center' });

  // Save the PDF
  doc.save(`Certificado-${registration.runnerName}-${race.name}.pdf`);
};

export const generateAllCertificates = (race: Race, registrations: Registration[]) => {
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4'
  });

  registrations.forEach((registration, index) => {
    if (index > 0) doc.addPage();

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    // Replicate layout logic (could be refactored to a shared internal function)
    doc.setDrawColor(250, 204, 21);
    doc.setLineWidth(5);
    doc.rect(5, 5, pageWidth - 10, pageHeight - 10);
    doc.setDrawColor(30, 41, 59);
    doc.setLineWidth(1);
    doc.rect(8, 8, pageWidth - 16, pageHeight - 16);
    
    // Title
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(30, 41, 59);
    doc.setFontSize(40);
    doc.text('CERTIFICADO', pageWidth / 2, 45, { align: 'center' });
    doc.setFontSize(20);
    doc.text('DE PARTICIPAÇÃO', pageWidth / 2, 55, { align: 'center' });

    // Runner
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(16);
    doc.text('Este certificado é concedido com orgulho a:', pageWidth / 2, 85, { align: 'center' });
    doc.setFont('helvetica', 'bolditalic');
    doc.setFontSize(32);
    doc.setTextColor(0, 0, 0);
    doc.text(registration.runnerName.toUpperCase(), pageWidth / 2, 105, { align: 'center' });

    // Race
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(16);
    doc.setTextColor(30, 41, 59);
    doc.text(`Pela sua conclusão e dedicação na competição`, pageWidth / 2, 130, { align: 'center' });
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(22);
    doc.text(race.name.toUpperCase(), pageWidth / 2, 142, { align: 'center' });
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(14);
    doc.text(`Realizada em em ${formatDate(race.date)} - ${race.location}`, pageWidth / 2, 155, { align: 'center' });
    
    // Signature
    doc.setDrawColor(30, 41, 59);
    doc.setLineWidth(0.5);
    doc.line(pageWidth / 2 - 40, 180, pageWidth / 2 + 40, 180);
    doc.setFontSize(12);
    doc.text('Organização RunManager', pageWidth / 2, 185, { align: 'center' });
  });

  doc.save(`Certificados-Lote-${race.name}.pdf`);
};
