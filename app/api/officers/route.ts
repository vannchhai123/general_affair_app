import { NextResponse } from 'next/server';
import { officers, getNextOfficerId } from '@/lib/mock-data';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = (searchParams.get('search') || '').toLowerCase();
    const department = searchParams.get('department') || '';
    const status = searchParams.get('status') || '';

    let filtered = [...officers];

    if (search) {
      filtered = filtered.filter(
        (o) =>
          o.first_name.toLowerCase().includes(search) ||
          o.last_name.toLowerCase().includes(search) ||
          o.email.toLowerCase().includes(search),
      );
    }
    if (department) {
      filtered = filtered.filter((o) => o.department === department);
    }
    if (status) {
      filtered = filtered.filter((o) => o.status === status);
    }

    return NextResponse.json(filtered);
  } catch (error) {
    console.error('Officers fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch officers' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { first_name, last_name, email, position, department, phone, status } = body;

    if (!first_name || !last_name) {
      return NextResponse.json({ error: 'First and last name required' }, { status: 400 });
    }

    const newOfficer = {
      id: getNextOfficerId(),
      user_id: null,
      first_name,
      last_name,
      email: email || '',
      position: position || '',
      department: department || '',
      phone: phone || '',
      status: status || 'active',
    };

    officers.push(newOfficer);
    return NextResponse.json(newOfficer, { status: 201 });
  } catch (error) {
    console.error('Officer create error:', error);
    return NextResponse.json({ error: 'Failed to create officer' }, { status: 500 });
  }
}
