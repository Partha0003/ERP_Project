export interface EmployeeDto {
  id?: number;
  name: string;
  email: string;
  phone: string;
  role: string;
  departmentId?: number;
  departmentName?: string;
  baseSalary?: number;
  bonus?: number;
  deduction?: number;
  performanceRating?: string;
  active?: boolean;
  password?: string;
}

export interface EmployeePageResponse {
  content: EmployeeDto[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}
