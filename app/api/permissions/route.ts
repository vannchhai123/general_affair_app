import { NextResponse } from 'next/server';
import { permissions, officerPermissions, officers } from '@/lib/mock-data';
import { getNextPermissionId, getNextOfficerPermissionId } from '@/lib/mock-data';

// GET /api/permissions - Get all permissions
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get('category');

  let filteredPermissions = permissions;

  if (category) {
    filteredPermissions = permissions.filter((p) => p.category === category);
  }

  return NextResponse.json(filteredPermissions);
}

// POST /api/permissions - Create a new permission
export async function POST(request: Request) {
  const body = await request.json();

  const { permission_name, description, category } = body;

  if (!permission_name) {
    return NextResponse.json({ error: 'Permission name is required' }, { status: 400 });
  }

  // Check for duplicate
  const exists = permissions.find((p) => p.permission_name === permission_name);
  if (exists) {
    return NextResponse.json({ error: 'Permission already exists' }, { status: 409 });
  }

  const newPermission = {
    id: getNextPermissionId(),
    permission_name,
    description: description || '',
    category: category || 'General',
  };

  permissions.push(newPermission);

  return NextResponse.json(newPermission, { status: 201 });
}
