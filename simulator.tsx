import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartLine, Calculator, Shield, Bus, Building } from "lucide-react";
import SimulatorForm from "@/components/simulator-form-fixed";
import ResultsPanel from "@/components/results-panel";
import DetailedResultsTable from "@/components/detailed-results-table";
import FinancingCostChart from "@/components/financing-cost-chart";
import { calculateFinancials, type SimulationData, type CalculationResults } from "@/lib/financial-calculations";

export default function Simulator() {
  const [currentProfile, setCurrentProfile] = useState<string>("");
  const [calculationResults, setCalculationResults] = useState<CalculationResults | null>(null);
  const [simulationData, setSimulationData] = useState<SimulationData | null>(null);

  const handleCalculation = (data: SimulationData) => {
    const results = calculateFinancials(data);
    setCalculationResults(results);
    setSimulationData(data);
  };

  const handleReset = () => {
    setCurrentProfile("");
    setCalculationResults(null);
    setSimulationData(null);
  };

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header */}
      <header className="bg-primary shadow-lg border-b border-primary/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              <ChartLine className="text-white text-3xl" />
              <div>
                <h1 className="text-2xl font-bold text-white">Simulador de Inversión</h1>
                <p className="text-sm text-blue-100">Papeles Comerciales</p>
              </div>
            </div>
            <div className="flex items-center space-x-2 text-blue-100">
              <Shield className="h-5 w-5 text-green-400" />
              <span className="text-sm font-medium">Plataforma Segura</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Input Form */}
          <div className="lg:col-span-2">
            <Card className="overflow-hidden shadow-lg">
              <CardHeader className="bg-gradient-to-r from-primary to-blue-800 text-white">
                <CardTitle className="flex items-center">
                  <Calculator className="mr-3 h-5 w-5" />
                  Configuración de Simulación
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <SimulatorForm
                  currentProfile={currentProfile}
                  onProfileChange={setCurrentProfile}
                  onCalculate={handleCalculation}
                  onReset={handleReset}
                />
              </CardContent>
            </Card>
          </div>

          {/* Results Panel */}
          <div className="lg:col-span-1">
            <ResultsPanel
              currentProfile={currentProfile}
              calculationResults={calculationResults}
              simulationData={simulationData}
            />
          </div>
        </div>

        {/* Detailed Results Table */}
        {calculationResults && currentProfile === "empresa" && (
          <DetailedResultsTable
            calculationResults={calculationResults}
            simulationData={simulationData}
          />
        )}

        {/* Gráfico de torta para costos de financiamiento - Solo para empresas */}
        {calculationResults && currentProfile === "empresa" && (
          <div className="mt-6">
            <FinancingCostChart results={calculationResults} />
          </div>
        )}
      </main>
    </div>
  );
}
