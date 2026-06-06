export interface Salesperson {
  id: string;

  code: string;
  name: string;

  phone?: string;
  email?: string;
  address?: string;

  is_active?: boolean;
}
