import { type User, type InsertUser, type Simulation, type InsertSimulation } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  createSimulation(simulation: InsertSimulation): Promise<Simulation>;
  getSimulation(id: string): Promise<Simulation | undefined>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private simulations: Map<string, Simulation>;

  constructor() {
    this.users = new Map();
    this.simulations = new Map();
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async createSimulation(insertSimulation: InsertSimulation): Promise<Simulation> {
    const id = randomUUID();
    const simulation: Simulation = { 
      id,
      profile: insertSimulation.profile,
      valorNominal: insertSimulation.valorNominal,
      plazo: insertSimulation.plazo || null,
      tasaInteres: insertSimulation.tasaInteres || null,
      frecuenciaPago: insertSimulation.frecuenciaPago || null,
      frecuenciaAmortizacion: insertSimulation.frecuenciaAmortizacion || null,
      tipoEmpresa: insertSimulation.tipoEmpresa || null,
      moneda: insertSimulation.moneda || null,
      tipoCupon: insertSimulation.tipoCupon || null,
      tipoCambioInicial: insertSimulation.tipoCambioInicial || null,
      tipoCambioVencimiento: insertSimulation.tipoCambioVencimiento || null,
      nombreEmpresa: insertSimulation.nombreEmpresa || null,
      descripcionEmpresa: insertSimulation.descripcionEmpresa || null,
      usoFondos: insertSimulation.usoFondos || null,
      entorno: insertSimulation.entorno || null,
      results: null,
      createdAt: new Date().toISOString()
    };
    this.simulations.set(id, simulation);
    return simulation;
  }

  async getSimulation(id: string): Promise<Simulation | undefined> {
    return this.simulations.get(id);
  }
}

export const storage = new MemStorage();
