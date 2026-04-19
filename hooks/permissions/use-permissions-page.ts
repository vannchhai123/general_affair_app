'use client';

import { useState } from 'react';
import { usePermissions } from './use-permissions';
import {
  useCreatePermission,
  useUpdatePermission,
  useDeletePermission,
} from './use-permission-mutations';
import {
  useAssignPermission,
  useRevokePermission,
} from '../officer-permissions/use-officer-permission-mutations';
import { useOfficers } from '../officers/use-officers';
import { useOfficerPermissions } from '../officer-permissions/use-officer-permissions';
import {
  type Officer,
  type Permission,
  type CreatePermission,
  type UpdatePermission,
} from '@/lib/schemas';

export function usePermissionsPage() {
  const pageSize = 8;
  const [search, setSearchState] = useState('');
  const [category, setCategoryState] = useState('all');
  const [managePageState, setManagePageState] = useState(1);
  const [assignPageState, setAssignPageState] = useState(1);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editPermission, setEditPermission] = useState<Permission | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const [assignmentDialogOpen, setAssignmentDialogOpen] = useState(false);
  const [selectedOfficerId, setSelectedOfficerId] = useState<number | null>(null);

  const { data: permissions, isLoading: permissionsLoading } = usePermissions(
    category !== 'all' ? category : undefined,
  );
  const { officers, isLoading: officersLoading } = useOfficers();
  const { data: assignments, isLoading: assignmentsLoading } = useOfficerPermissions();

  const createPermission = useCreatePermission();
  const updatePermission = useUpdatePermission();
  const deletePermission = useDeletePermission();
  const assignPermission = useAssignPermission();
  const revokePermission = useRevokePermission();

  const filteredPermissions = permissions?.filter((p) => {
    return (
      !search ||
      p.permission_name.toLowerCase().includes(search.toLowerCase()) ||
      p.description?.toLowerCase().includes(search.toLowerCase())
    );
  });

  const categories = Array.from(new Set(permissions?.map((p) => p.category || 'General') || []));

  const isLoading = permissionsLoading || officersLoading || assignmentsLoading;

  const selectedOfficer = officers?.find((o: Officer) => o.id === selectedOfficerId) || null;

  const manageTotalPages = Math.max(1, Math.ceil((filteredPermissions?.length || 0) / pageSize));
  const assignTotalPages = Math.max(1, Math.ceil((officers?.length || 0) / pageSize));

  const managePage = Math.min(managePageState, manageTotalPages);
  const assignPage = Math.min(assignPageState, assignTotalPages);

  const setSearch = (value: string) => {
    setSearchState(value);
    setManagePageState(1);
  };

  const setCategory = (value: string) => {
    setCategoryState(value);
    setManagePageState(1);
  };

  const setManagePage = (page: number) => {
    setManagePageState(Math.max(1, Math.min(page, manageTotalPages)));
  };

  const setAssignPage = (page: number) => {
    setAssignPageState(Math.max(1, Math.min(page, assignTotalPages)));
  };

  const paginatedPermissions = filteredPermissions?.slice(
    (managePage - 1) * pageSize,
    managePage * pageSize,
  );

  const paginatedOfficers = officers?.slice((assignPage - 1) * pageSize, assignPage * pageSize);

  const handleCreate = async (data: CreatePermission) => {
    await createPermission.mutateAsync(data);
    setDialogOpen(false);
  };

  const handleUpdate = async (data: UpdatePermission) => {
    if (!editPermission) return;
    await updatePermission.mutateAsync({ id: editPermission.id, data });
    setEditPermission(null);
    setDialogOpen(false);
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    await deletePermission.mutateAsync(deleteId);
    setDeleteId(null);
  };

  const handleAssign = async (officerId: number, permissionId: number) => {
    await assignPermission.mutateAsync({
      officer_id: officerId,
      permission_id: permissionId,
    });
  };

  const handleRevoke = async (assignmentId: number) => {
    await revokePermission.mutateAsync(assignmentId);
  };

  const openAssignmentDialog = (officerId: number) => {
    setSelectedOfficerId(officerId);
    setAssignmentDialogOpen(true);
  };

  return {
    search,
    setSearch,
    category,
    setCategory,
    dialogOpen,
    setDialogOpen,
    editPermission,
    setEditPermission,
    deleteId,
    setDeleteId,
    assignmentDialogOpen,
    setAssignmentDialogOpen,

    permissions,
    officers,
    assignments,
    filteredPermissions,
    paginatedPermissions,
    paginatedOfficers,
    categories,
    selectedOfficer,
    isLoading,
    pageSize,
    managePage,
    setManagePage,
    manageTotalPages,
    assignPage,
    setAssignPage,
    assignTotalPages,

    handleCreate,
    handleUpdate,
    handleDelete,
    handleAssign,
    handleRevoke,
    openAssignmentDialog,
  };
}
