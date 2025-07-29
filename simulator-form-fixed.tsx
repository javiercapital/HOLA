import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Calculator, RotateCcw, Bus, Building, DollarSign, Calendar, Percent, ArrowRightLeft, Info, Coins, BarChart } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { type SimulationData } from "@/lib/financial-calculations";

const simulationSchema = z.object({
  profile: z.enum(["inversionista", "empresa"], { required_error: "Debe seleccionar un perfil" }),
  valorNominal: z.number().min(1000, "El monto debe ser mayor a $1,000"),
  plazo: z.number().min(30).max(365).optional(),
  tasaInteres: z.number().min(1).max(50).optional(),
  frecuenciaPago: z.string().optional(),
  frecuenciaAmortizacion: z.string().optional(),
  tipoEmpresa: z.string().optional(),
  moneda: z.string().optional(),
  tipoCupon: z.string().optional(),
  tipoCambioInicial: z.number().positive().optional(),
  tipoCambioVencimiento: z.number().positive().optional(),
  nombreEmpresa: z.string().optional(),
  descripcionEmpresa: z.string().optional(),
  usoFondos: z.string().optional(),
  entorno: z.string().optional(),
});

type SimulationFormData = z.infer<typeof simulationSchema>;

interface SimulatorFormProps {
  currentProfile: string;
  onProfileChange: (profile: string) => void;
  onCalculate: (data: SimulationData) => void;
  onReset: () => void;
}

export default function SimulatorForm({ currentProfile, onProfileChange, onCalculate, onReset }: SimulatorFormProps) {
  const [showExchangeFields, setShowExchangeFields] = useState(false);
  const { toast } = useToast();

  const form = useForm<SimulationFormData>({
    resolver: zodResolver(simulationSchema),
    defaultValues: {
      valorNominal: 100000,
      plazo: 360,
      tasaInteres: 13,
      frecuenciaPago: "",
      frecuenciaAmortizacion: "",
      tipoEmpresa: "",
      moneda: "",
      tipoCupon: "",
      tipoCambioInicial: 36.50,
      tipoCambioVencimiento: 38.00,
      nombreEmpresa: "",
      descripcionEmpresa: "",
      usoFondos: "",
      entorno: "",
    },
  });

  const moneda = form.watch("moneda");

  useEffect(() => {
    setShowExchangeFields(moneda === "bolivares");
  }, [moneda]);

  const onSubmit = (data: SimulationFormData) => {
    // Validate required fields for empresa profile
    if (data.profile === "empresa") {
      const requiredFields = ["plazo", "tasaInteres", "frecuenciaPago", "frecuenciaAmortizacion", "tipoEmpresa", "moneda", "tipoCupon", "nombreEmpresa"];
      
      for (const field of requiredFields) {
        if (!data[field as keyof SimulationFormData]) {
          toast({
            title: "Error de Validación",
            description: `El campo ${field} es obligatorio para empresas emisoras.`,
            variant: "destructive",
          });
          return;
        }
      }

      if (data.moneda === "bolivares") {
        if (!data.tipoCambioInicial || !data.tipoCambioVencimiento) {
          toast({
            title: "Error de Validación",
            description: "Los tipos de cambio son obligatorios para emisiones en Bolívares.",
            variant: "destructive",
          });
          return;
        }
      }
    }

    // Prepare data with defaults for inversionista
    const simulationData: SimulationData = {
      profile: data.profile,
      valorNominal: data.valorNominal,
      plazo: data.profile === "inversionista" ? 360 : data.plazo!,
      tasaInteres: data.profile === "inversionista" ? 13 : data.tasaInteres!,
      frecuenciaPago: data.profile === "inversionista" ? "anual" : data.frecuenciaPago!,
      frecuenciaAmortizacion: data.profile === "inversionista" ? "vencimiento" : data.frecuenciaAmortizacion!,
      tipoEmpresa: data.profile === "inversionista" ? "no_pyme" : data.tipoEmpresa!,
      moneda: data.profile === "inversionista" ? "dolares" : data.moneda!,
      tipoCupon: data.profile === "inversionista" ? "con_cupon" : data.tipoCupon!,
      tipoCambioInicial: data.tipoCambioInicial,
      tipoCambioVencimiento: data.tipoCambioVencimiento,
      nombreEmpresa: data.nombreEmpresa || "",
      descripcionEmpresa: data.descripcionEmpresa || "",
      usoFondos: data.usoFondos || "",
      entorno: data.entorno || "",
    };

    onCalculate(simulationData);
  };

  const handleReset = () => {
    form.reset();
    setShowExchangeFields(false);
    onReset();
  };

  const handleProfileChange = (value: string) => {
    onProfileChange(value);
    form.setValue("profile", value as "inversionista" | "empresa");
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Profile Selection */}
        <div className="bg-neutral-50 rounded-lg p-4 border border-neutral-200">
          <FormField
            control={form.control}
            name="profile"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center text-sm font-semibold text-neutral-800 mb-3">
                  <Bus className="mr-2 h-4 w-4 text-primary" />
                  Perfil de Usuario *
                </FormLabel>
                <FormControl>
                  <RadioGroup
                    onValueChange={(value) => {
                      field.onChange(value);
                      handleProfileChange(value);
                    }}
                    value={field.value}
                    className="grid grid-cols-1 sm:grid-cols-2 gap-3"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="inversionista" id="inversionista" />
                      <Label htmlFor="inversionista" className="flex items-center space-x-3 cursor-pointer p-4 rounded-lg border-2 border-neutral-300 hover:border-primary-300 flex-1">
                        <Bus className="h-5 w-5 text-primary" />
                        <div>
                          <div className="font-medium text-neutral-900">Inversionista</div>
                          <div className="text-xs text-neutral-600">Simular retornos de inversión</div>
                        </div>
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="empresa" id="empresa" />
                      <Label htmlFor="empresa" className="flex items-center space-x-3 cursor-pointer p-4 rounded-lg border-2 border-neutral-300 hover:border-primary-300 flex-1">
                        <Building className="h-5 w-5 text-primary" />
                        <div>
                          <div className="font-medium text-neutral-900">Empresa Emisora</div>
                          <div className="text-xs text-neutral-600">Calcular costos de emisión</div>
                        </div>
                      </Label>
                    </div>
                  </RadioGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Investment Amount */}
        <FormField
          control={form.control}
          name="valorNominal"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center text-sm font-semibold text-neutral-800">
                <DollarSign className="mr-2 h-4 w-4 text-green-500" />
                Monto a Invertir (Valor Nominal) *
              </FormLabel>
              <FormControl>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-500">$</span>
                  <Input
                    type="number"
                    placeholder="Ej: 100000"
                    className="pl-8"
                    min="1000"
                    step="100"
                    value={field.value || ""}
                    onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : 0)}
                  />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Company Fields - Only visible for Empresa profile */}
        {currentProfile === "empresa" && (
          <div className="space-y-6 animate-in slide-in-from-top-5 duration-300">
            {/* Investment Term and Interest Rate */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="plazo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center text-sm font-semibold text-neutral-800">
                      <Calendar className="mr-2 h-4 w-4 text-primary" />
                      Plazo de la Inversión (días) *
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="Ej: 360"
                        min="30"
                        max="365"
                        value={field.value || ""}
                        onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="tasaInteres"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center text-sm font-semibold text-neutral-800">
                      <Percent className="mr-2 h-4 w-4 text-orange-500" />
                      Tasa de Interés Anual (%) *
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="Ej: 13"
                        min="1"
                        max="50"
                        step="0.1"
                        value={field.value || ""}
                        onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Payment Frequencies */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="frecuenciaPago"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Frecuencia de Pago de Intereses *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar..." />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="mensual">Mensual</SelectItem>
                        <SelectItem value="trimestral">Trimestral</SelectItem>
                        <SelectItem value="semestral">Semestral</SelectItem>
                        <SelectItem value="anual">Anual</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="frecuenciaAmortizacion"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Frecuencia de Amortización *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar..." />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="anual">Anual</SelectItem>
                        <SelectItem value="vencimiento">Al Vencimiento</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Company and Currency Settings */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="tipoEmpresa"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo de Empresa *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar..." />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="pyme">PYME (1%)</SelectItem>
                        <SelectItem value="no_pyme">No PYME (2%)</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="moneda"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Moneda de Emisión *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar..." />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="dolares">Dólares</SelectItem>
                        <SelectItem value="bolivares">Bolívares</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="tipoCupon"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo de Cupón *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar..." />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="con_cupon">Con Cupón Periódico</SelectItem>
                        <SelectItem value="cero_cupon">Cero Cupón</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Exchange Rate Fields - Only for Bolívares */}
            {showExchangeFields && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-in slide-in-from-top-5 duration-300">
                <FormField
                  control={form.control}
                  name="tipoCambioInicial"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center text-sm font-semibold text-neutral-800">
                        <ArrowRightLeft className="mr-2 h-4 w-4 text-orange-500" />
                        Tipo de Cambio Inicial (Bs/USD) *
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="Ej: 36.50"
                          min="1"
                          step="0.01"
                          value={field.value || ""}
                          onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : 0)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="tipoCambioVencimiento"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center text-sm font-semibold text-neutral-800">
                        <ArrowRightLeft className="mr-2 h-4 w-4 text-orange-500" />
                        Tipo de Cambio al Vencimiento (Bs/USD) *
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="Ej: 38.00"
                          min="1"
                          step="0.01"
                          value={field.value || ""}
                          onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : 0)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}

            {/* Company Information */}
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="nombreEmpresa"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center text-sm font-semibold text-neutral-800">
                      <Building className="mr-2 h-4 w-4 text-primary" />
                      Nombre de la Empresa Emisora *
                    </FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Ej: Corporación ABC S.A." />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="descripcionEmpresa"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center text-sm font-semibold text-neutral-800">
                      <Info className="mr-2 h-4 w-4 text-primary" />
                      Descripción Detallada de la Empresa
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        placeholder="Descripción completa de la empresa, sector, actividades principales..."
                        className="min-h-[80px]"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="usoFondos"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center text-sm font-semibold text-neutral-800">
                      <Coins className="mr-2 h-4 w-4 text-green-500" />
                      Uso de Fondos (Detallado)
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        placeholder="Detalle específico del uso de los fondos obtenidos..."
                        className="min-h-[80px]"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="entorno"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center text-sm font-semibold text-neutral-800">
                      <BarChart className="mr-2 h-4 w-4 text-blue-500" />
                      Entorno de Mercado
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        placeholder="Información sobre el entorno económico y de mercado relevante..."
                        className="min-h-[80px]"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-neutral-200">
          <Button
            type="submit"
            className="flex-1 bg-gradient-to-r from-primary to-blue-800 hover:from-blue-700 hover:to-blue-900 text-white font-semibold py-3"
          >
            <Calculator className="mr-2 h-4 w-4" />
            Calcular Resultados
          </Button>
          
          <Button
            type="button"
            variant="outline"
            onClick={handleReset}
            className="flex-1 border-neutral-300 text-neutral-700 hover:bg-neutral-50 py-3"
          >
            <RotateCcw className="mr-2 h-4 w-4" />
            Limpiar Formulario
          </Button>
        </div>
      </form>
    </Form>
  );
}