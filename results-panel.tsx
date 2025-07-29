import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PieChart, Calculator, FileText } from "lucide-react";
import { type CalculationResults, type SimulationData } from "@/lib/financial-calculations";
import { generatePDF } from "@/lib/pdf-generator";
import { useToast } from "@/hooks/use-toast";
import FinancingCostChart from "./financing-cost-chart";

interface ResultsPanelProps {
  currentProfile: string;
  calculationResults: CalculationResults | null;
  simulationData: SimulationData | null;
}

export default function ResultsPanel({ currentProfile, calculationResults, simulationData }: ResultsPanelProps) {
  const { toast } = useToast();

  const formatCurrency = (amount: number, currency = "USD") => {
    const prefix = currency === "Bs" ? "Bs " : "$";
    return prefix + amount.toLocaleString("en-US", { 
      minimumFractionDigits: 2, 
      maximumFractionDigits: 2 
    });
  };

  const formatPercentage = (rate: number) => {
    return rate.toFixed(2) + "%";
  };

  const handleGeneratePDF = () => {
    if (!calculationResults || !simulationData) return;

    try {
      generatePDF(currentProfile, calculationResults, simulationData);
      toast({
        title: "PDF Generado",
        description: "El reporte ha sido generado exitosamente.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Hubo un problema al generar el PDF.",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="sticky top-8 shadow-lg">
      <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-800 text-white">
        <CardTitle className="flex items-center">
          <PieChart className="mr-3 h-5 w-5" />
          Resultados
        </CardTitle>
      </CardHeader>

      <CardContent className="p-6">
        {!calculationResults ? (
          <div className="text-center py-8">
            <Calculator className="mx-auto h-12 w-12 text-neutral-300 mb-4" />
            <p className="text-neutral-500">
              Seleccione un perfil y complete los datos para ver los resultados
            </p>
          </div>
        ) : currentProfile === "inversionista" ? (
          <div className="space-y-4">
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-blue-700">Capital Invertido</span>
                <Calculator className="h-4 w-4 text-blue-600" />
              </div>
              <div className="text-2xl font-bold text-blue-900">
                {formatCurrency(calculationResults.valorNominal)}
              </div>
            </div>

            <div className="bg-primary/10 rounded-lg p-4 border border-primary/20">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-primary">Capital + Intereses</span>
                <PieChart className="h-4 w-4 text-primary" />
              </div>
              <div className="text-2xl font-bold text-primary">
                {formatCurrency(calculationResults.capitalMasIntereses)}
              </div>
            </div>

            <div className="bg-green-50 rounded-lg p-4 border border-green-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-green-700">Rentabilidad (ROI)</span>
                <span className="text-green-600">%</span>
              </div>
              <div className="text-2xl font-bold text-green-800">
                {formatPercentage(calculationResults.roiTotal)}
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="bg-red-50 rounded-lg p-4 border border-red-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-red-700">Costo Total Emisión</span>
                <Calculator className="h-4 w-4 text-red-600" />
              </div>
              <div className="text-2xl font-bold text-red-800">
                {formatCurrency(calculationResults.costoTotalEmision)}
              </div>
            </div>

            <div className="bg-neutral-100 rounded-lg p-4 border border-neutral-300">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-neutral-700">Costo Financiamiento</span>
                <span className="text-neutral-600">%</span>
              </div>
              <div className="text-2xl font-bold text-neutral-800">
                {formatPercentage(calculationResults.costoFinanciamiento)}
              </div>
            </div>
          </div>
        )}

        {calculationResults && (
          <div className="mt-6">
            <Button
              onClick={handleGeneratePDF}
              className="w-full bg-gradient-to-r from-primary to-blue-800 hover:from-blue-700 hover:to-blue-900"
            >
              <FileText className="mr-2 h-4 w-4" />
              Generar Reporte PDF
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
