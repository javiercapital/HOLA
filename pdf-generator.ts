import { jsPDF } from "jspdf";
import { type CalculationResults, type SimulationData } from "./financial-calculations";

export function generatePDF(profile: string, results: CalculationResults, data: SimulationData) {
  if (profile === "inversionista") {
    generateInvestorPDF(results, data);
  } else {
    generateCompanyPDF(results, data);
  }
}

function generateInvestorPDF(results: CalculationResults, data: SimulationData) {
  const doc = new jsPDF();

  // Set font
  doc.setFont("helvetica");

  // Title
  doc.setFontSize(20);
  doc.setTextColor(40, 40, 40);
  doc.text("Reporte de Inversión", 20, 30);

  // Subtitle
  doc.setFontSize(14);
  doc.setTextColor(100, 100, 100);
  doc.text("Papeles Comerciales", 20, 45);

  // Line separator
  doc.setDrawColor(200, 200, 200);
  doc.line(20, 55, 190, 55);

  // Investment summary
  doc.setFontSize(16);
  doc.setTextColor(40, 40, 40);
  doc.text("Resumen de Inversión", 20, 75);

  doc.setFontSize(12);
  doc.setTextColor(60, 60, 60);

  // Capital Invertido
  doc.text("Capital Invertido:", 20, 95);
  doc.setTextColor(40, 40, 40);
  doc.text(formatCurrency(results.valorNominal), 80, 95);

  // Capital + Intereses
  doc.setTextColor(60, 60, 60);
  doc.text("Capital + Intereses:", 20, 110);
  doc.setTextColor(40, 40, 40);
  doc.text(formatCurrency(results.capitalMasIntereses), 80, 110);

  // ROI
  doc.setTextColor(60, 60, 60);
  doc.text("Rentabilidad (ROI):", 20, 125);
  doc.setTextColor(40, 40, 40);
  doc.text(formatPercentage(results.roiTotal), 80, 125);

  // Footer
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text("Generado el " + new Date().toLocaleDateString(), 20, 280);

  doc.save("reporte-inversion.pdf");
}

function generateCompanyPDF(results: CalculationResults, data: SimulationData) {
  const doc = new jsPDF();

  // Set font
  doc.setFont("helvetica");

  // Title
  doc.setFontSize(20);
  doc.setTextColor(40, 40, 40);
  doc.text("Reporte Detallado de Emisión", 20, 30);

  // Subtitle
  doc.setFontSize(14);
  doc.setTextColor(100, 100, 100);
  doc.text("Papeles Comerciales - " + (data.nombreEmpresa || "Empresa Emisora"), 20, 45);

  // Line separator
  doc.setDrawColor(200, 200, 200);
  doc.line(20, 55, 190, 55);

  // Simulation Data
  doc.setFontSize(16);
  doc.setTextColor(40, 40, 40);
  doc.text("Datos de la Simulación", 20, 75);

  doc.setFontSize(10);
  doc.setTextColor(60, 60, 60);
  let yPos = 90;

  doc.text("Valor Nominal: " + formatCurrency(results.valorNominal), 20, yPos);
  yPos += 12;
  doc.text("Plazo: " + results.plazo + " días", 20, yPos);
  yPos += 12;
  doc.text("Tasa de Interés: " + formatPercentage(results.tasaInteres), 20, yPos);
  yPos += 12;
  doc.text("Frecuencia de Pago: " + capitalizeFirst(data.frecuenciaPago), 20, yPos);
  yPos += 12;
  doc.text("Tipo de Empresa: " + (data.tipoEmpresa === "pyme" ? "PYME" : "No PYME"), 20, yPos);
  yPos += 12;
  doc.text("Moneda: " + capitalizeFirst(data.moneda), 20, yPos);
  yPos += 20;

  // Company Information
  if (data.nombreEmpresa) {
    doc.setFontSize(16);
    doc.setTextColor(40, 40, 40);
    doc.text("El Emisor", 20, yPos);
    yPos += 15;

    doc.setFontSize(12);
    doc.setTextColor(60, 60, 60);
    doc.text("Nombre: " + data.nombreEmpresa, 20, yPos);
    yPos += 12;

    if (data.descripcionEmpresa) {
      doc.text("Descripción:", 20, yPos);
      yPos += 8;
      const splitDescription = doc.splitTextToSize(data.descripcionEmpresa, 170);
      doc.text(splitDescription, 20, yPos);
      yPos += splitDescription.length * 5 + 10;
    }
  }

  // Add new page for detailed costs
  doc.addPage();
  yPos = 30;

  // Cost Breakdown Title
  doc.setFontSize(16);
  doc.setTextColor(40, 40, 40);
  doc.text("Desglose de Costos", 20, yPos);
  yPos += 20;

  // Cost items
  const costItems = [
    { label: "Intereses Totales", amount: results.interesesTotales },
    { label: "Registro Nacional de Valores", amount: results.registroNacional },
    { label: "Contribución Anual", amount: results.contribucionAnual },
    { label: "Calificación de Riesgo", amount: results.calificacionRiesgo },
    { label: "Estructuración", amount: results.estructuracion },
    { label: "Colocación", amount: results.colocacion },
    { label: "Representación", amount: results.representacion },
    { label: "Inscripción Código ISIN", amount: results.inscripcionISIN },
    { label: "Publicación Aviso de Prensa", amount: results.publicacionAviso },
    { label: "CVV", amount: results.cvv },
    { label: "IVA", amount: results.iva },
    { label: "BVCC", amount: results.bvcc },
    { label: "Liquidación", amount: results.liquidacion },
  ];

  doc.setFontSize(10);
  costItems.forEach((item) => {
    doc.setTextColor(60, 60, 60);
    doc.text(item.label, 20, yPos);
    doc.setTextColor(40, 40, 40);
    doc.text(formatCurrency(item.amount), 120, yPos);
    yPos += 12;
  });

  // Total
  yPos += 10;
  doc.setDrawColor(40, 40, 40);
  doc.line(20, yPos - 5, 170, yPos - 5);
  doc.setFontSize(12);
  doc.setTextColor(40, 40, 40);
  doc.text("COSTO TOTAL EMISIÓN", 20, yPos);
  doc.text(formatCurrency(results.costoTotalEmision), 120, yPos);
  yPos += 15;

  doc.text("COSTO FINANCIAMIENTO", 20, yPos);
  doc.text(formatPercentage(results.costoFinanciamiento), 120, yPos);

  // Use of Funds section
  if (data.usoFondos) {
    yPos += 30;
    doc.setFontSize(16);
    doc.setTextColor(40, 40, 40);
    doc.text("Uso de Fondos (Detallado)", 20, yPos);
    yPos += 15;

    doc.setFontSize(10);
    doc.setTextColor(60, 60, 60);
    const splitUso = doc.splitTextToSize(data.usoFondos, 170);
    doc.text(splitUso, 20, yPos);
  }

  // Footer
  doc.setFontSize(8);
  doc.setTextColor(100, 100, 100);
  doc.text("Generado el " + new Date().toLocaleDateString(), 20, 280);

  doc.save("reporte-emision-detallado.pdf");
}

function formatCurrency(amount: number): string {
  return "$" + amount.toLocaleString("en-US", { 
    minimumFractionDigits: 2, 
    maximumFractionDigits: 2 
  });
}

function formatPercentage(rate: number): string {
  return rate.toFixed(2) + "%";
}

function capitalizeFirst(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
