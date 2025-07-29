import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart as PieChartIcon } from 'lucide-react';
import { type CalculationResults } from '@/lib/financial-calculations';

interface FinancingCostChartProps {
  results: CalculationResults;
}

const COLORS = [
  '#1e40af', // Azul oscuro
  '#3b82f6', // Azul medio
  '#60a5fa', // Azul claro
  '#93c5fd', // Azul muy claro
  '#dbeafe', // Azul pálido
  '#1e3a8a', // Azul marino
  '#2563eb', // Azul royal
];

export default function FinancingCostChart({ results }: FinancingCostChartProps) {
  // Preparar datos para el gráfico de torta usando los nombres correctos
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
      name: 'Contribución Anual',
      value: results.contribucionAnual || 0,
      percentage: ((results.contribucionAnual || 0) / (results.costoTotalEmision || 1)) * 100,
    },
    {
      name: 'Registro Nacional',
      value: results.registroNacional || 0,
      percentage: ((results.registroNacional || 0) / (results.costoTotalEmision || 1)) * 100,
    },
    {
      name: 'CVV + IVA',
      value: (results.cvv || 0) + (results.iva || 0),
      percentage: (((results.cvv || 0) + (results.iva || 0)) / (results.costoTotalEmision || 1)) * 100,
    },
    {
      name: 'BVCC',
      value: results.bvcc || 0,
      percentage: ((results.bvcc || 0) / (results.costoTotalEmision || 1)) * 100,
    },
    {
      name: 'Liquidación y Otros',
      value: (results.liquidacion || 0) + (results.inscripcionISIN || 0) + (results.publicacionAviso || 0),
      percentage: (((results.liquidacion || 0) + (results.inscripcionISIN || 0) + (results.publicacionAviso || 0)) / (results.costoTotalEmision || 1)) * 100,
    },
  ].filter(item => item.value > 0); // Solo mostrar costos que tienen valor

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
        <div className="bg-white p-3 border border-neutral-200 rounded-lg shadow-lg">
          <p className="font-semibold text-neutral-800">{data.name}</p>
          <p className="text-blue-600">{formatCurrency(data.value)}</p>
          <p className="text-neutral-600">{data.percentage.toFixed(1)}% del total</p>
        </div>
      );
    }
    return null;
  };

  const CustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percentage }: any) => {
    if (percentage < 5) return null; // No mostrar etiquetas para porcentajes muy pequeños
    
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text 
        x={x} 
        y={y} 
        fill="white" 
        textAnchor={x > cx ? 'start' : 'end'} 
        dominantBaseline="central"
        className="text-xs font-semibold"
      >
        {`${percentage.toFixed(0)}%`}
      </text>
    );
  };

  if (chartData.length === 0) {
    return null; // No mostrar el gráfico si no hay datos
  }

  return (
    <Card className="bg-white border border-neutral-200 shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center text-lg font-bold text-neutral-800">
          <PieChartIcon className="mr-2 h-5 w-5 text-blue-600" />
          Distribución de Costos de Financiamiento
        </CardTitle>
        <p className="text-sm text-neutral-600">
          Desglose porcentual de cada componente del costo total de emisión
        </p>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={CustomLabel}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend 
                verticalAlign="bottom" 
                height={36}
                formatter={(value, entry: any) => (
                  <span className="text-sm text-neutral-700">
                    {value} ({entry.percentage?.toFixed(1)}%)
                  </span>
                )}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        
        {/* Resumen total */}
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
      </CardContent>
    </Card>
  );
}