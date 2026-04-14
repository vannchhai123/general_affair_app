import { NextResponse } from 'next/server';
import { officerPermissions, officers, permissions } from '@/lib/mock-data';
import { getNextOfficerPermissionId } from '@/lib/mock-data';

// GET /api/officer-permissions - Get all officer permission assignments
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const officerId = searchParams.get('officer_id');
  const permissionId = searchParams.get('permission_id');

  let filtered = officerPermissions;

  if (officerId) {
    filtered = filtered.filter((op) => op.officer_id === parseInt(officerId));
  }

  if (permissionId) {
    filtered = filtered.filter((op) => op.permission_id === parseInt(permissionId));
  }

  const enriched = filtered.map((op) => {
    const officer = officers.find((o) => o.id === op.officer_id);
    const permission = permissions.find((p) => p.id === op.permission_id);

    return {
      ...op,
      officer_name: officer ? `${officer.first_name} ${officer.last_name}` : 'Unknown',
      officer_department: officer?.department || 'Unknown',
      permission_name: permission?.permission_name || 'Unknown',
      permission_category: permission?.category || 'Unknown',
    };
  });

  return NextResponse.json(enriched);
}

// POST /api/officer-permissions - Assign permission to officer
export async function POST(request: Request) {
  const body = await request.json();

  const { officer_id, permission_id } = body;

  if (!officer_id || !permission_id) {
    return NextResponse.json(
      { error: 'Officer ID and Permission ID are required' },
      { status: 400 },
    );
  }

  // Check if officer exists
  const officer = officers.find((o) => o.id === officer_id);
  if (!officer) {
    return NextResponse.json({ error: 'Officer not found' }, { status: 404 });
  }

  // Check if permission exists
  const permission = permissions.find((p) => p.id === permission_id);
  if (!permission) {
    return NextResponse.json({ error: 'Permission not found' }, { status: 404 });
  }

  // Check if already assigned
  const exists = officerPermissions.find(
    (op) => op.officer_id === officer_id && op.permission_id === permission_id,
  );
  if (exists) {
    return NextResponse.json({ error: 'Permission already assigned to officer' }, { status: 409 });
  }

  const newAssignment = {
    id: getNextOfficerPermissionId(),
    officer_id,
    permission_id,
    granted_at: new Date().toISOString(),
    granted_by: 1, // TODO: Get from session
  };

  officerPermissions.push(newAssignment);

  return NextResponse.json(newAssignment, { status: 201 });
}
