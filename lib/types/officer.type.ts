export interface Officer {
  id: number;
  user_id: number | null;
  username: string | null;
  uuid?: string | null;
  officerCode: string;

  first_name: string;
  last_name: string;
  sex?: 'male' | 'female';
  email: string;
  phone: string;
  position: string;
  department: string;
  status: string;
  imageUrl?: string | null;
  image_url?: string | null;
  avatar_url?: string | null;
  profileImage?: string | null;
  profile_image?: string | null;
  photoUrl?: string | null;
  photo_url?: string | null;
}

export interface OfficerFilters {
  search?: string;
  department?: string;
  status?: string;
}
