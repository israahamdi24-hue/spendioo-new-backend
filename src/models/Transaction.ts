export interface Transaction {
  id?: number;
  user_id: number;
  category_id: number;
  type: "income" | "expense";
  amount: number;
  date: string;
  description?: string;
}
