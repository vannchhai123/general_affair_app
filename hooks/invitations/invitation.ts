import { Invitation } from '@/lib/schemas/invitation';

const API_BASE_URL = '/api/invitations';

export const invitationApi = {
  getAll: async (): Promise<Invitation[]> => {
    const response = await fetch(API_BASE_URL);
    if (!response.ok) {
      throw new Error('Failed to fetch invitations');
    }
    return response.json();
  },

  getById: async (id: number): Promise<Invitation> => {
    const response = await fetch(`${API_BASE_URL}/${id}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch invitation with id ${id}`);
    }
    return response.json();
  },

  create: async (data: Omit<Invitation, 'id'>): Promise<Invitation> => {
    const response = await fetch(API_BASE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error('Failed to create invitation');
    }

    return response.json();
  },

  update: async (id: number, data: Partial<Invitation>): Promise<Invitation> => {
    const response = await fetch(`${API_BASE_URL}/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`Failed to update invitation with id ${id}`);
    }

    return response.json();
  },

  delete: async (id: number): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error(`Failed to delete invitation with id ${id}`);
    }
  },
};
