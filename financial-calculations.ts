export interface SimulationData {
  profile: string;
  valorNominal: number;
  plazo: number;
  tasaInteres: number;
  frecuenciaPago: string;
  frecuenciaAmortizacion: string;
  tipoEmpresa: string;
  moneda: string;
  tipoCupon: string;
  tipoCambioInicial?: number;
  tipoCambioVencimiento?: number;
  nombreEmpresa: string;
  descripcionEmpresa: string;
  usoFondos: string;
  entorno: string;
}

export interface CalculationResults {
  valorNominal: number;
  valorEfectivo: number;
  plazo: number;
  tasaInteres: number;
  interesesTotales: number;
  registroNacional: number;
  contribucionAnual: number;
  calificacionRiesgo: number;
  estructuracion: number;
  colocacion: number;
  representacion: number;
  inscripcionISIN: number;
  publicacionAviso: number;
  cvv: number;
  iva: number;
  bvcc: number;
  liquidacion: number;
  costoTotalEmision: number;
  costoFinanciamiento: number;
  gananciaNeta: number;
  capitalMasIntereses: number;
  roiTotal: number;
  roiAnualizado: number;
  bolivares?: {
    valorNominal: number;
    interesesTotales: number;
    capitalMasIntereses: number;
    costoTotalEmision: number;
  };
}

// Fixed commission rates and costs
const FIXED_COSTS = {
  contribucionAnual: 0.005, // 0.5%
  calificacionRiesgo: 1500, // $1,500 fixed
  estructuracion: 0.02, // 2%
  colocacion: 0.04, // 4%
  representacion: 0.0025, // 0.25%
  publicacionAviso: 25, // $25 fixed
  cvvMensual: 0.0003, // 0.03% monthly
  iva: 0.16, // 16% on CVV only
  bvcc: 0.005, // 0.5%
  liquidacionBolivares: 0.0025, // 0.25% for Bolívares
  liquidacionDolares: 0, // 0% for Dólares
};

// ISIN cost by term
const ISIN_COSTS: { [key: number]: number } = {
  90: 38,
  180: 80,
  270: 118,
  365: 160,
};

function getISINCost(plazo: number): number {
  if (plazo <= 90) return ISIN_COSTS[90];
  if (plazo <= 180) return ISIN_COSTS[180];
  if (plazo <= 270) return ISIN_COSTS[270];
  return ISIN_COSTS[365];
}

export function calculateFinancials(data: SimulationData): CalculationResults {
  // Basic calculations
  const valorNominal = data.valorNominal;
  const valorEfectivo = valorNominal; // 100% price
  const plazo = data.plazo;
  const tasaInteres = data.tasaInteres;

  // Interest calculations (360-day basis)
  const diasBase = 360;
  const interesesTotales = (valorNominal * (tasaInteres / 100) * plazo) / diasBase;

  // Commission calculations
  const registroNacional = valorNominal * (data.tipoEmpresa === "pyme" ? 0.01 : 0.02);
  const contribucionAnual = valorNominal * FIXED_COSTS.contribucionAnual;
  const calificacionRiesgo = FIXED_COSTS.calificacionRiesgo;
  const estructuracion = valorNominal * FIXED_COSTS.estructuracion;
  const colocacion = valorNominal * FIXED_COSTS.colocacion;
  const representacion = valorNominal * FIXED_COSTS.representacion;
  const publicacionAviso = FIXED_COSTS.publicacionAviso;

  // ISIN cost based on term
  const inscripcionISIN = getISINCost(plazo);

  // CVV calculation (monthly basis)
  const mesesCompletos = Math.floor(plazo / 30);
  const cvv = valorNominal * FIXED_COSTS.cvvMensual * mesesCompletos;
  const iva = cvv * FIXED_COSTS.iva; // IVA only on CVV

  const bvcc = valorNominal * FIXED_COSTS.bvcc;

  // Liquidation cost based on currency
  const liquidacionRate = data.moneda === "bolivares" ? FIXED_COSTS.liquidacionBolivares : FIXED_COSTS.liquidacionDolares;
  const liquidacion = valorNominal * liquidacionRate;

  // Total cost for issuer
  const costoTotalEmision = 
    interesesTotales + 
    registroNacional + 
    contribucionAnual + 
    calificacionRiesgo +
    estructuracion + 
    colocacion + 
    representacion +
    inscripcionISIN + 
    publicacionAviso + 
    cvv +
    iva + 
    bvcc + 
    liquidacion;

  const costoFinanciamiento = (costoTotalEmision / valorNominal) * 100;

  // Investor returns
  const gananciaNeta = interesesTotales;
  const capitalMasIntereses = valorNominal + gananciaNeta;
  const roiTotal = (gananciaNeta / valorNominal) * 100;
  const roiAnualizado = (Math.pow(1 + (roiTotal / 100), diasBase / plazo) - 1) * 100;

  const results: CalculationResults = {
    valorNominal,
    valorEfectivo,
    plazo,
    tasaInteres,
    interesesTotales,
    registroNacional,
    contribucionAnual,
    calificacionRiesgo,
    estructuracion,
    colocacion,
    representacion,
    inscripcionISIN,
    publicacionAviso,
    cvv,
    iva,
    bvcc,
    liquidacion,
    costoTotalEmision,
    costoFinanciamiento,
    gananciaNeta,
    capitalMasIntereses,
    roiTotal,
    roiAnualizado,
  };

  // Currency conversion if applicable
  if (data.moneda === "bolivares" && data.tipoCambioInicial && data.tipoCambioVencimiento) {
    results.bolivares = {
      valorNominal: valorNominal * data.tipoCambioVencimiento,
      interesesTotales: interesesTotales * data.tipoCambioVencimiento,
      capitalMasIntereses: capitalMasIntereses * data.tipoCambioVencimiento,
      costoTotalEmision: costoTotalEmision * data.tipoCambioVencimiento,
    };
  }

  return results;
}
