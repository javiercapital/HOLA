import { sql } from "drizzle-orm";
import { pgTable, text, varchar, real, integer, boolean, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const simulations = pgTable("simulations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  profile: text("profile").notNull(), // 'inversionista' or 'empresa'
  valorNominal: real("valor_nominal").notNull(),
  plazo: integer("plazo"),
  tasaInteres: real("tasa_interes"),
  frecuenciaPago: text("frecuencia_pago"),
  frecuenciaAmortizacion: text("frecuencia_amortizacion"),
  tipoEmpresa: text("tipo_empresa"),
  moneda: text("moneda"),
  tipoCupon: text("tipo_cupon"),
  tipoCambioInicial: real("tipo_cambio_inicial"),
  tipoCambioVencimiento: real("tipo_cambio_vencimiento"),
  nombreEmpresa: text("nombre_empresa"),
  descripcionEmpresa: text("descripcion_empresa"),
  usoFondos: text("uso_fondos"),
  entorno: text("entorno"),
  results: jsonb("results"),
  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertSimulationSchema = createInsertSchema(simulations).omit({
  id: true,
  createdAt: true,
  results: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertSimulation = z.infer<typeof insertSimulationSchema>;
export type Simulation = typeof simulations.$inferSelect;
