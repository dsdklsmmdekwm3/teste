// Adapter para usar localStorage ao invés de Supabase
// Mantém a mesma interface para facilitar a migração

import * as localStorage from './local-storage';

// Simular interface do Supabase
export class LocalStorageAdapter {
  private table: string;

  constructor(table: string) {
    this.table = table;
  }

  select(columns?: string) {
    return this;
  }

  eq(column: string, value: any) {
    return this;
  }

  async maybeSingle() {
    return this.getData();
  }

  async single() {
    const data = await this.getData();
    if (!data) {
      throw new Error('No data found');
    }
    return { data, error: null };
  }

  async getData() {
    const allData = localStorage.loadLocalData();
    const tableData = (allData as any)[this.table] || [];
    
    return {
      data: tableData,
      error: null,
    };
  }

  async insert(values: any) {
    const allData = localStorage.loadLocalData();
    const tableData = (allData as any)[this.table] || [];
    
    const newItem = {
      ...values,
      id: values.id || this.generateId(),
      created_at: new Date().toISOString(),
    };
    
    const updated = [...tableData, newItem];
    localStorage.saveLocalData({ [this.table]: updated });
    
    return {
      data: newItem,
      error: null,
    };
  }

  async update(values: any) {
    // Implementar update se necessário
    return { data: null, error: null };
  }

  async upsert(values: any, options?: any) {
    const allData = localStorage.loadLocalData();
    const tableData = (allData as any)[this.table] || [];
    
    const key = options?.onConflict || 'key';
    const existingIndex = tableData.findIndex((item: any) => item[key] === values[key]);
    
    const item = {
      ...values,
      updated_at: new Date().toISOString(),
    };
    
    let updated;
    if (existingIndex >= 0) {
      updated = [...tableData];
      updated[existingIndex] = item;
    } else {
      updated = [...tableData, item];
    }
    
    localStorage.saveLocalData({ [this.table]: updated });
    
    return {
      data: item,
      error: null,
    };
  }

  async delete() {
    // Implementar delete se necessário
    return { data: null, error: null };
  }

  order(column: string, options?: { ascending?: boolean }) {
    return this;
  }

  in(column: string, values: any[]) {
    return this;
  }

  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}

// Factory function para criar adapters
export const createStorageAdapter = (table: string) => {
  return new LocalStorageAdapter(table);
};

// Função helper para usar com código existente
export const storage = {
  from: (table: string) => createStorageAdapter(table),
};

