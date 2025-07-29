import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { TableIcon } from "lucide-react";
import { type CalculationResults, type SimulationData } from "@/lib/financial-calculations";

interface DetailedResultsTableProps {
  calculationResults: CalculationResults;
  simulationData: SimulationData | null;
}

export default function DetailedResultsTable({ calculationResults, simulationData }: DetailedResultsTableProps) {
  const formatCurrency = (amount: number, currency = "USD") => {
    const prefix = currency === "Bs" ? "Bs " : "$";
    return prefix + amount.toLocaleString("en-US", { 
      minimumFractionDigits: 2, 
      maximumFractionDigits: 2 
    });
  };

  const showBolivares = calculationResults.bolivares && simulationData?.moneda === "bolivares";

  const tableData = [
    { label: "Valor Nominal", usd: calculationResults.valorNominal, bs: showBolivares ? calculationResults.bolivares?.valorNominal : null },
    { label: "Intereses Totales", usd: calculationResults.interesesTotales, bs: showBolivares ? calculationResults.bolivares?.interesesTotales : null },
    { label: "Registro Nacional de Valores", usd: calculationResults.registroNacional, bs: null },
    { label: "Contribución Anual", usd: calculationResults.contribucionAnual, bs: null },
    { label: "Calificación de Riesgo", usd: calculationResults.calificacionRiesgo, bs: null },
    { label: "Estructuración", usd: calculationResults.estructuracion, bs: null },
    { label: "Colocación", usd: calculationResults.colocacion, bs: null },
    { label: "Representación", usd: calculationResults.representacion, bs: null },
    { label: "Inscripción Código ISIN", usd: calculationResults.inscripcionISIN, bs: null },
    { label: "Publicación Aviso de Prensa", usd: calculationResults.publicacionAviso, bs: null },
    { label: "CVV", usd: calculationResults.cvv, bs: null },
    { label: "IVA", usd: calculationResults.iva, bs: null },
    { label: "BVCC", usd: calculationResults.bvcc, bs: null },
    { label: "Liquidación", usd: calculationResults.liquidacion, bs: null },
  ];

  return (
    <Card className="mt-8 animate-in slide-in-from-top-5 duration-500 shadow-lg">
      <CardHeader className="bg-gradient-to-r from-primary to-blue-800 text-white">
        <CardTitle className="flex items-center">
          <TableIcon className="mr-3 h-5 w-5" />
          Detalle de Cálculos y Costos
        </CardTitle>
      </CardHeader>
      
      <CardContent className="p-6">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-b-2">
                <TableHead className="text-left font-semibold text-neutral-800">Concepto</TableHead>
                <TableHead className="text-right font-semibold text-neutral-800">Monto (USD)</TableHead>
                {showBolivares && (
                  <TableHead className="text-right font-semibold text-neutral-800">Monto (Bs)</TableHead>
                )}
              </TableRow>
            </TableHeader>
            <TableBody>
              {tableData.map((item, index) => (
                <TableRow key={index} className="hover:bg-neutral-50">
                  <TableCell className="text-neutral-800">{item.label}</TableCell>
                  <TableCell className="text-right font-medium">{formatCurrency(item.usd)}</TableCell>
                  {showBolivares && (
                    <TableCell className="text-right font-medium">
                      {item.bs ? formatCurrency(item.bs, "Bs") : "-"}
                    </TableCell>
                  )}
                </TableRow>
              ))}
              {/* Total row */}
              <TableRow className="border-t-2 border-primary/30 bg-primary/10 font-semibold">
                <TableCell className="text-primary text-lg">COSTO TOTAL EMISIÓN</TableCell>
                <TableCell className="text-right text-lg text-primary">{formatCurrency(calculationResults.costoTotalEmision)}</TableCell>
                {showBolivares && (
                  <TableCell className="text-right text-lg text-primary">
                    {formatCurrency(calculationResults.bolivares!.costoTotalEmision, "Bs")}
                  </TableCell>
                )}
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
