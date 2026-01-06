/**
 * Transaction data model
 * Represents a financial transaction in the application
 */
export interface Transaction {
  id: string;
  amount: number;
  description: string;
  category: string;
  date: Date;
  type: 'income' | 'expense';
}
