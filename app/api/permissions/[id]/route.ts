import { NextResponse } from 'next/server';
import { permissions } from '@/lib/mock-data';

// PUT /api/permissions/[id] - Update a permission
export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await request.json();
  const permissionId = parseInt(id);

  const index = permissions.findIndex((p) => p.id === permissionId);
  if (index === -1) {
    return NextResponse.json({ error: 'Permission not found' }, { status: 404 });
  }

  const { permission_name, description, category } = body;

  // Check for duplicate if name changed
  if (permission_name && permission_name !== permissions[index].permission_name) {
    const exists = permissions.find((p) => p.permission_name === permission_name);
    if (exists) {
      return NextResponse.json({ error: 'Permission name already exists' }, { status: 409 });
    }
  }

  permissions[index] = {
    ...permissions[index],
    permission_name: permission_name || permissions[index].permission_name,
    description: description !== undefined ? description : permissions[index].description,
    category: category || permissions[index].category,
  };

  return NextResponse.json(permissions[index]);
}

// DELETE /api/permissions/[id] - Delete a permission
export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const permissionId = parseInt(id);

  const index = permissions.findIndex((p) => p.id === permissionId);
  if (index === -1) {
    return NextResponse.json({ error: 'Permission not found' }, { status: 404 });
  }

  permissions.splice(index, 1);

  return NextResponse.json({ success: true });
}
