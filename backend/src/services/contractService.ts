import { ContractRepository } from '../repositories/contractRepository';
import { ClientRepository } from '../repositories/clientRepository';
import { Contract } from '../models';
import { createError } from '../middlewares/errorHandler';

export class ContractService {
  private contractRepository: ContractRepository;
  private clientRepository: ClientRepository;

  constructor() {
    this.contractRepository = new ContractRepository();
    this.clientRepository = new ClientRepository();
  }

  async getAllContracts(): Promise<Contract[]> {
    return this.contractRepository.findAll();
  }

  async getContractById(id: string): Promise<Contract> {
    const contract = await this.contractRepository.findById(id);
    if (!contract) {
      throw createError('Contract not found', 404);
    }
    return contract;
  }

  async getContractsByClientId(clientId: string): Promise<Contract[]> {
    // Verify client exists
    const client = await this.clientRepository.findById(clientId);
    if (!client) {
      throw createError('Client not found', 404);
    }

    return this.contractRepository.findByClientId(clientId);
  }

  // Helper function to convert DD/MM/YYYY to YYYY-MM-DD
  private convertDateFormat(dateString: string): string {
    if (!dateString) return dateString;
    
    // Check if it's DD/MM/YYYY format
    const ddmmyyyyRegex = /^(\d{2})\/(\d{2})\/(\d{4})$/;
    const match = dateString.match(ddmmyyyyRegex);
    
    if (match) {
      const [, day, month, year] = match;
      return `${year}-${month}-${day}`;
    }
    
    // If it's already in YYYY-MM-DD format or other format, return as is
    return dateString;
  }

  async createContract(contractData: Omit<Contract, 'id' | 'created_at' | 'updated_at'>): Promise<Contract> {
    // Validate required fields
    if (!contractData.client_id || !contractData.value) {
      throw createError('Client ID and value are required', 400);
    }

    // Validate value is positive
    if (contractData.value <= 0) {
      throw createError('Contract value must be positive', 400);
    }

    // Check if client exists
    const client = await this.clientRepository.findById(contractData.client_id);
    if (!client) {
      throw createError('Client not found', 404);
    }

    // Process date fields - convert empty strings to null and format dates
    const processedData = { ...contractData } as any;
    
    if (processedData.start_date === '') {
      processedData.start_date = null;
    } else if (processedData.start_date) {
      processedData.start_date = this.convertDateFormat(processedData.start_date);
    }
    
    if (processedData.end_date === '') {
      processedData.end_date = null;
    } else if (processedData.end_date) {
      processedData.end_date = this.convertDateFormat(processedData.end_date);
    }

    // Validate date formats if they are provided
    if (processedData.start_date && typeof processedData.start_date === 'string') {
      const dateRegex = /^(\d{2}\/\d{2}\/\d{4}|\d{4}-\d{2}-\d{2})$/;
      if (!dateRegex.test(processedData.start_date)) {
        throw createError('Start date must be in DD/MM/YYYY or YYYY-MM-DD format', 400);
      }
    }

    if (processedData.end_date && typeof processedData.end_date === 'string') {
      const dateRegex = /^(\d{2}\/\d{2}\/\d{4}|\d{4}-\d{2}-\d{2})$/;
      if (!dateRegex.test(processedData.end_date)) {
        throw createError('End date must be in DD/MM/YYYY or YYYY-MM-DD format', 400);
      }
    }

    // Validate dates
    if (processedData.start_date && processedData.end_date) {
      const startDate = new Date(processedData.start_date);
      const endDate = new Date(processedData.end_date);
      
      if (endDate <= startDate) {
        throw createError('End date must be after start date', 400);
      }
    }

    return this.contractRepository.create(processedData);
  }

  async updateContract(id: string, contractData: Partial<Omit<Contract, 'id' | 'created_at' | 'updated_at'>>): Promise<Contract> {
    // Check if contract exists
    const existingContract = await this.contractRepository.findById(id);
    if (!existingContract) {
      throw createError('Contract not found', 404);
    }

    // Validate value if being updated
    if (contractData.value !== undefined && contractData.value <= 0) {
      throw createError('Contract value must be positive', 400);
    }

    // Verify client exists if client_id is being updated
    if (contractData.client_id) {
      const client = await this.clientRepository.findById(contractData.client_id);
      if (!client) {
        throw createError('Client not found', 404);
      }
    }

    // Process date fields - convert empty strings to null and format dates
    const processedData = { ...contractData } as any;
    
    if (processedData.start_date === '') {
      processedData.start_date = null;
    } else if (processedData.start_date) {
      processedData.start_date = this.convertDateFormat(processedData.start_date);
    }
    
    if (processedData.end_date === '') {
      processedData.end_date = null;
    } else if (processedData.end_date) {
      processedData.end_date = this.convertDateFormat(processedData.end_date);
    }

    // Validate date formats if they are provided
    if (processedData.start_date && typeof processedData.start_date === 'string') {
      const dateRegex = /^(\d{2}\/\d{2}\/\d{4}|\d{4}-\d{2}-\d{2})$/;
      if (!dateRegex.test(processedData.start_date)) {
        throw createError('Start date must be in DD/MM/YYYY or YYYY-MM-DD format', 400);
      }
    }

    if (processedData.end_date && typeof processedData.end_date === 'string') {
      const dateRegex = /^(\d{2}\/\d{2}\/\d{4}|\d{4}-\d{2}-\d{2})$/;
      if (!dateRegex.test(processedData.end_date)) {
        throw createError('End date must be in DD/MM/YYYY or YYYY-MM-DD format', 400);
      }
    }

    // Validate dates if being updated
    if (processedData.start_date || processedData.end_date) {
      const startDateValue = processedData.start_date || existingContract.start_date;
      const endDateValue = processedData.end_date || existingContract.end_date;
      
      if (startDateValue && endDateValue) {
        const startDate = new Date(startDateValue);
        const endDate = new Date(endDateValue);
        
        if (endDate <= startDate) {
          throw createError('End date must be after start date', 400);
        }
      }
    }

    const updatedContract = await this.contractRepository.update(id, processedData);
    if (!updatedContract) {
      throw createError('Failed to update contract', 500);
    }

    return updatedContract;
  }

  async deleteContract(id: string): Promise<void> {
    const contract = await this.contractRepository.findById(id);
    if (!contract) {
      throw createError('Contract not found', 404);
    }

    await this.contractRepository.delete(id);
  }

  async getContractsByStatus(status: string): Promise<Contract[]> {
    return this.contractRepository.findByStatus(status);
  }
}