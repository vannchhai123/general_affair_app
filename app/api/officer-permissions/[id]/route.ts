import { NextResponse } from 'next/server';
import { officerPermissions } from '@/lib/mock-data';

// DELETE /api/officer-permissions/[id] - Remove permission from officer
export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const assignmentId = parseInt(id);

  const index = officerPermissions.findIndex((op) => op.id === assignmentId);
  if (index === -1) {
    return NextResponse.json({ error: 'Assignment not found' }, { status: 404 });
  }

  officerPermissions.splice(index, 1);

  return NextResponse.json({ success: true });
}
