export interface Officer {
  id: number;
  user_id: number | null;
  username: string | null;
  uuid: string;
  officerCode: string;

  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  position: string;
  department: string;
  status: string;
}

export interface OfficerFilters {
  search?: string;
  department?: string;
  status?: string;
}
