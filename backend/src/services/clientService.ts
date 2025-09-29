import { ClientRepository } from '../repositories/clientRepository';
import { Client } from '../models';
import { createError } from '../middlewares/errorHandler';

export class ClientService {
  private clientRepository: ClientRepository;

  constructor() {
    this.clientRepository = new ClientRepository();
  }

  async getAllClients(): Promise<Client[]> {
    return this.clientRepository.findAll();
  }

  async getClientById(id: string): Promise<Client> {
    const client = await this.clientRepository.findById(id);
    if (!client) {
      throw createError('Client not found', 404);
    }
    return client;
  }

  async createClient(clientData: Omit<Client, 'id' | 'created_at' | 'updated_at'>): Promise<Client> {
    // Validate required fields
    if (!clientData.first_name) {
      throw createError('First name is required', 400);
    }

    // Validate email format if provided
    if (clientData.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(clientData.email)) {
        throw createError('Invalid email format', 400);
      }

      // Check if email already exists
      const existingClient = await this.clientRepository.findByEmail(clientData.email);
      if (existingClient) {
        throw createError('Client with this email already exists', 409);
      }
    }

    return this.clientRepository.create(clientData);
  }

  async updateClient(id: string, clientData: Partial<Omit<Client, 'id' | 'created_at' | 'updated_at'>>): Promise<Client> {
    const existingClient = await this.clientRepository.findById(id);
    if (!existingClient) {
      throw createError('Client not found', 404);
    }

    // Validate email format if provided
    if (clientData.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(clientData.email)) {
        throw createError('Invalid email format', 400);
      }

      // Check if email already exists for another client
      const existingEmailClient = await this.clientRepository.findByEmail(clientData.email);
      if (existingEmailClient && existingEmailClient.id !== id) {
        throw createError('Client with this email already exists', 409);
      }
    }

    const updatedClient = await this.clientRepository.update(id, clientData);
    if (!updatedClient) {
      throw createError('Client not found', 404);
    }
    return updatedClient;
  }

  async deleteClient(id: string): Promise<void> {
    const existingClient = await this.clientRepository.findById(id);
    if (!existingClient) {
      throw createError('Client not found', 404);
    }

    await this.clientRepository.delete(id);
  }

  async getClientByEmail(email: string): Promise<Client | null> {
    return this.clientRepository.findByEmail(email);
  }
}