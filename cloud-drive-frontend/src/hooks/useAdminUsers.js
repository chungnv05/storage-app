import { useState, useEffect, useCallback } from 'react';
import adminApi from '../api/adminApi';

function mapUsers(data) {
  return Array.isArray(data)
    ? data.map(u => {
        const isBlocked = u.status === 'LOCKED' || u.blocked === true;
        return {
          ...u,
          id: u.id,
          fullName: u.fullName || u.name || '',
          name: u.fullName || u.name || '',
          email: u.email || '',
          phone: u.phone || '',
          avatarUrl: u.avatarUrl || null,
          avatar: u.avatarUrl || u.avatar || null,
          role: u.role || 'USER',
          status: u.status || (isBlocked ? 'LOCKED' : 'ACTIVE'),
          blocked: isBlocked,
          packageName: u.packageName || '',
          plan: u.packageName || u.plan || '',
          storageLimitBytes: Number(u.storageLimitBytes) || 0,
          storageUsedBytes: Number(u.storageUsedBytes) || 0,
          createdAt: u.createdAt || null,
          created: u.createdAt ? new Date(u.createdAt).getTime() : Date.now(),
          paid: u.paid || 0
        };
      })
    : [];
}

export default function useAdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await adminApi.getAllUsers();
      setUsers(mapUsers(data));
    } catch (err) {
      console.error('Lỗi khi tải danh sách người dùng:', err);
      setError(err?.response?.data?.message || err?.message || 'Không thể tải danh sách người dùng');
    } finally {
      setLoading(false);
    }
  }, []);

  const adminBlockUser = useCallback((userId) => {
    setUsers(prev =>
      prev.map(u => {
        if (u.id === userId) {
          const nextBlocked = !u.blocked;
          return {
            ...u,
            blocked: nextBlocked,
            status: nextBlocked ? 'LOCKED' : 'ACTIVE'
          };
        }
        return u;
      })
    );
  }, []);

  useEffect(() => {
    let isMounted = true;

    adminApi
      .getAllUsers()
      .then(data => {
        if (!isMounted) return;
        setUsers(mapUsers(data));
      })
      .catch(err => {
        if (!isMounted) return;
        console.error('Lỗi khi tải danh sách người dùng:', err);
        setError(err?.response?.data?.message || err?.message || 'Không thể tải danh sách người dùng');
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  return {
    users,
    loading,
    error,
    adminBlockUser,
    refetchUsers: fetchUsers
  };
}
