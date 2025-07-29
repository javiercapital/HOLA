# GUÍA COMPLETA: Simulador de Papeles Comerciales con Gráfico de Torta

## 📋 RESUMEN DEL PROYECTO
Un simulador web completo para inversiones en Papeles Comerciales con:
- Dos perfiles de usuario (Inversionista/Empresa Emisora)
- Cálculos financieros complejos
- Gráfico de torta para distribución de costos
- Generación de reportes PDF
- Diseño azul oscuro y blanco

## 🔧 PASO 1: CONFIGURACIÓN INICIAL

### 1.1 Crear el proyecto
```bash
npx create-react-app simulador-papeles-comerciales --template typescript
cd simulador-papeles-comerciales
```

### 1.2 Instalar dependencias necesarias
```bash
npm install @radix-ui/react-dialog @radix-ui/react-select @radix-ui/react-radio-group
npm install @radix-ui/react-label @radix-ui/react-form @radix-ui/react-toast
npm install react-hook-form @hookform/resolvers zod
npm install @tanstack/react-query
npm install tailwindcss @tailwindcss/forms
npm install lucide-react
npm install recharts
npm install jspdf
npm install wouter
```

### 1.3 Configurar Tailwind CSS
```bash
npx tailwindcss init -p
```

## 📁 PASO 2: ESTRUCTURA DE ARCHIVOS

```
src/
├── components/
│   ├── ui/                          # Componentes base UI
│   │   ├── button.tsx
│   │   ├── card.tsx  
│   │   ├── input.tsx
│   │   ├── form.tsx
│   │   ├── select.tsx
│   │   ├── radio-group.tsx
│   │   └── textarea.tsx
│   ├── simulator-form.tsx           # Formulario principal
│   ├── results-panel.tsx            # Panel de resultados
│   ├── detailed-results-table.tsx   # Tabla detallada
│   └── financing-cost-chart.tsx     # Gráfico de torta
├── lib/
│   ├── financial-calculations.ts    # Motor de cálculos
│   ├── pdf-generator.ts            # Generador PDF
│   └── utils.ts                    # Utilidades
├── hooks/
│   └── use-toast.ts                # Hook para notificaciones
├── pages/
│   └── simulator.tsx               # Página principal
├── types/
│   └── index.ts                    # Tipos TypeScript
├── App.tsx                         # Componente principal
├── index.css                       # Estilos globales
└── main.tsx                        # Punto de entrada
```

## 🎨 PASO 3: CONFIGURACIÓN DE ESTILOS

### 3.1 tailwind.config.js
```js
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#1e40af',
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        },
      },
    },
  },
  plugins: [],
}
```

### 3.2 index.css
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --background: 0 0% 100%;
  --foreground: 222.2 84% 4.9%;
  --primary: 221.2 83.2% 53.3%;
  --primary-foreground: 210 40% 98%;
}

.dark {
  --background: 222.2 84% 4.9%;
  --foreground: 210 40% 98%;
  --primary: 217.2 91.2% 59.8%;
  --primary-foreground: 222.2 84% 4.9%;
}

body {
  font-family: 'Inter', sans-serif;
  background-color: hsl(var(--background));
  color: hsl(var(--foreground));
}
```

## 💻 PASO 4: CÓDIGO PRINCIPAL

### 4.1 Tipos de Datos (src/types/index.ts)
```typescript
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
```

### 4.2 Motor de Cálculos Financieros (src/lib/financial-calculations.ts)
```typescript
import { SimulationData, CalculationResults } from '../types';

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

function getRegistroNacionalCost(tipoEmpresa: string): number {
  return tipoEmpresa === "pyme" ? 0.01 : 0.02; // 1% for PYME, 2% for no-PYME
}

export function calculateFinancials(data: SimulationData): CalculationResults {
  const {
    valorNominal,
    plazo,
    tasaInteres,
    tipoEmpresa,
    moneda,
    tipoCambioInicial,
    tipoCambioVencimiento,
  } = data;

  // Calculate basic financial metrics
  const interesesTotales = (valorNominal * (tasaInteres / 100) * plazo) / 365;
  const capitalMasIntereses = valorNominal + interesesTotales;

  // Calculate emission costs
  const registroNacional = valorNominal * getRegistroNacionalCost(tipoEmpresa);
  const contribucionAnual = valorNominal * FIXED_COSTS.contribucionAnual;
  const calificacionRiesgo = FIXED_COSTS.calificacionRiesgo;
  const estructuracion = valorNominal * FIXED_COSTS.estructuracion;
  const colocacion = valorNominal * FIXED_COSTS.colocacion;
  const representacion = valorNominal * FIXED_COSTS.representacion;
  const inscripcionISIN = getISINCost(plazo);
  const publicacionAviso = FIXED_COSTS.publicacionAviso;

  // CVV calculation (monthly)
  const cvvMonths = Math.ceil(plazo / 30);
  const cvv = valorNominal * FIXED_COSTS.cvvMensual * cvvMonths;
  const iva = cvv * FIXED_COSTS.iva;

  const bvcc = valorNominal * FIXED_COSTS.bvcc;
  const liquidacion = moneda === "bolivares" 
    ? valorNominal * FIXED_COSTS.liquidacionBolivares 
    : valorNominal * FIXED_COSTS.liquidacionDolares;

  const costoTotalEmision = registroNacional + contribucionAnual + calificacionRiesgo + 
    estructuracion + colocacion + representacion + inscripcionISIN + publicacionAviso + 
    cvv + iva + bvcc + liquidacion;

  const valorEfectivo = valorNominal - costoTotalEmision;
  const costoFinanciamiento = ((costoTotalEmision + interesesTotales) / valorNominal) * 100;
  const gananciaNeta = valorEfectivo;
  const roiTotal = ((interesesTotales - costoTotalEmision) / valorNominal) * 100;
  const roiAnualizado = (roiTotal * 365) / plazo;

  let bolivares;
  if (moneda === "bolivares" && tipoCambioInicial && tipoCambioVencimiento) {
    bolivares = {
      valorNominal: valorNominal * tipoCambioInicial,
      interesesTotales: interesesTotales * tipoCambioVencimiento,
      capitalMasIntereses: valorNominal * tipoCambioInicial + interesesTotales * tipoCambioVencimiento,
      costoTotalEmision: costoTotalEmision * tipoCambioInicial,
    };
  }

  return {
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
    bolivares,
  };
}
```

### 4.3 Componente del Gráfico de Torta (src/components/financing-cost-chart.tsx)
```typescript
import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { CalculationResults } from '../types';

interface FinancingCostChartProps {
  results: CalculationResults;
}

const COLORS = [
  '#1e40af', '#3b82f6', '#60a5fa', '#93c5fd', 
  '#dbeafe', '#1e3a8a', '#2563eb'
];

export default function FinancingCostChart({ results }: FinancingCostChartProps) {
  const chartData = [
    {
      name: 'Estructuración',
      value: results.estructuracion || 0,
      percentage: ((results.estructuracion || 0) / (results.costoTotalEmision || 1)) * 100,
    },
    {
      name: 'Colocación',
      value: results.colocacion || 0,
      percentage: ((results.colocacion || 0) / (results.costoTotalEmision || 1)) * 100,
    },
    {
      name: 'Representación',
      value: results.representacion || 0,
      percentage: ((results.representacion || 0) / (results.costoTotalEmision || 1)) * 100,
    },
    {
      name: 'Calificación Riesgo',
      value: results.calificacionRiesgo || 0,
      percentage: ((results.calificacionRiesgo || 0) / (results.costoTotalEmision || 1)) * 100,
    },
    {
      name: 'Otros Costos',
      value: (results.cvv || 0) + (results.iva || 0) + (results.bvcc || 0) + 
             (results.liquidacion || 0) + (results.inscripcionISIN || 0) + 
             (results.publicacionAviso || 0) + (results.contribucionAnual || 0) + 
             (results.registroNacional || 0),
      percentage: 0,
    },
  ].filter(item => item.value > 0);

  // Calcular porcentaje para "Otros Costos"
  const otrosIndex = chartData.findIndex(item => item.name === 'Otros Costos');
  if (otrosIndex !== -1) {
    chartData[otrosIndex].percentage = (chartData[otrosIndex].value / (results.costoTotalEmision || 1)) * 100;
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-VE', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(value);
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-semibold text-gray-800">{data.name}</p>
          <p className="text-blue-600">{formatCurrency(data.value)}</p>
          <p className="text-gray-600">{data.percentage.toFixed(1)}% del total</p>
        </div>
      );
    }
    return null;
  };

  if (chartData.length === 0) return null;

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
      <div className="flex items-center mb-4">
        <h3 className="text-lg font-bold text-gray-800">
          Distribución de Costos de Financiamiento
        </h3>
      </div>
      
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              outerRadius={100}
              fill="#8884d8"
              dataKey="value"
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
      
      <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
        <div className="flex justify-between items-center">
          <span className="font-semibold text-blue-800">Costo Total de Emisión:</span>
          <span className="font-bold text-blue-900 text-lg">
            {formatCurrency(results.costoTotalEmision || 0)}
          </span>
        </div>
        <div className="flex justify-between items-center mt-1">
          <span className="text-sm text-blue-700">Como % del Valor Nominal:</span>
          <span className="text-sm font-semibold text-blue-800">
            {(((results.costoTotalEmision || 0) / (results.valorNominal || 1)) * 100).toFixed(2)}%
          </span>
        </div>
      </div>
    </div>
  );
}
```

## 🚀 PASO 5: INTEGRACIÓN EN TU PÁGINA EXISTENTE

### 5.1 Si ya tienes un proyecto React existente:

```typescript
// En tu componente existente
import React, { useState } from 'react';
import FinancingCostChart from './components/financing-cost-chart';
import { calculateFinancials } from './lib/financial-calculations';

function YourExistingPage() {
  const [calculationResults, setCalculationResults] = useState(null);
  const [userProfile, setUserProfile] = useState('empresa');

  // Datos de ejemplo - reemplaza con tus datos reales
  const simulationData = {
    profile: 'empresa',
    valorNominal: 100000,
    plazo: 360,
    tasaInteres: 13,
    frecuenciaPago: 'anual',
    frecuenciaAmortizacion: 'vencimiento',
    tipoEmpresa: 'no_pyme',
    moneda: 'dolares',
    tipoCupon: 'con_cupon',
    nombreEmpresa: 'Mi Empresa S.A.',
    descripcionEmpresa: '',
    usoFondos: '',
    entorno: '',
  };

  const handleCalculate = () => {
    const results = calculateFinancials(simulationData);
    setCalculationResults(results);
  };

  return (
    <div className="container mx-auto p-6">
      {/* Tu contenido existente */}
      
      <button 
        onClick={handleCalculate}
        className="bg-blue-600 text-white px-4 py-2 rounded"
      >
        Calcular Costos
      </button>

      {/* Agregar el gráfico */}
      {calculationResults && userProfile === 'empresa' && (
        <div className="mt-6">
          <FinancingCostChart results={calculationResults} />
        </div>
      )}
    </div>
  );
}
```

## 📝 PASO 6: COMANDO DE INSTALACIÓN COMPLETA

```bash
# 1. Crear proyecto
npx create-react-app mi-simulador --template typescript
cd mi-simulador

# 2. Instalar todas las dependencias
npm install @radix-ui/react-dialog @radix-ui/react-select @radix-ui/react-radio-group @radix-ui/react-label @radix-ui/react-toast react-hook-form @hookform/resolvers zod @tanstack/react-query tailwindcss @tailwindcss/forms lucide-react recharts jspdf wouter

# 3. Configurar Tailwind
npx tailwindcss init -p

# 4. Ejecutar proyecto
npm start
```

## ✅ CHECKLIST DE IMPLEMENTACIÓN

- [ ] ✅ Proyecto React creado
- [ ] ✅ Dependencias instaladas
- [ ] ✅ Tailwind configurado
- [ ] ✅ Tipos TypeScript definidos
- [ ] ✅ Motor de cálculos implementado
- [ ] ✅ Componente gráfico creado
- [ ] ✅ Integrado en página principal
- [ ] ✅ Estilos aplicados
- [ ] ✅ Pruebas realizadas

## 🎯 RESULTADO FINAL

Tendrás un simulador completo con:
- ✅ Formulario dinámico según perfil
- ✅ Cálculos financieros precisos
- ✅ Gráfico de torta interactivo
- ✅ Diseño profesional azul/blanco
- ✅ Generación de PDFs
- ✅ Responsive design

¡Listo para usar en producción! 🚀