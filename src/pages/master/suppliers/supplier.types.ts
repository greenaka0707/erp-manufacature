export interface Supplier {
  id: string;
  code: string;
  name: string;
  phone?: string;
  email?: string;
  address?: string;
  contact_person?: string;
  is_active?: boolean;
}
