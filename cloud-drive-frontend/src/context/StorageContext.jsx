import React, { createContext, useState, useEffect, useCallback, useMemo } from 'react';
import {
  initialUsers,
  initialPlans,
  initialFiles,
  initialNotices,
  initialCampaigns
} from '../mock/initialData.js';
import { generateId, GB, calculateDiscountPrice, classifyFileType } from '../mock/utils.js';
import useAuth from '../hooks/useAuth.js';

const STORAGE_KEY = 'luutru-react-storage-v1';

const StorageContext = createContext(null);

export function StorageProvider({ children }) {
  const { user: authUser, isAuthenticated, logout: keycloakLogout } = useAuth();

  // Load or initialize state from localStorage
  const [data, setData] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Không thể đọc dữ liệu localStorage:', e);
    }
    return {
      users: initialUsers,
      plans: initialPlans,
      files: initialFiles,
      notices: initialNotices,
      campaigns: initialCampaigns,
      currentUserId: 'u1'
    };
  });

  // Session-only unlocked items for encryption/passwords
  const [unlockedItems, setUnlockedItems] = useState(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [toastMessage, setToastMessage] = useState(null);

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
      console.warn('LocalStorage đầy hoặc không khả dụng:', e);
    }
  }, [data]);

  // Show toast notification
  const toast = useCallback((msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(prev => (prev === msg ? null : prev));
    }, 4000);
  }, []);

  // Determine current active user
  const currentUser = useMemo(() => {
    const userInDb = data.users.find(u => u.id === data.currentUserId) || data.users[0];
    if (isAuthenticated && authUser) {
      return {
        ...userInDb,
        name: `${authUser.firstName || ''} ${authUser.lastName || ''}`.trim() || authUser.username || userInDb.name,
        email: authUser.email || userInDb.email,
        roles: authUser.roles || []
      };
    }
    return userInDb;
  }, [data.users, data.currentUserId, isAuthenticated, authUser]);

  // Helper getters
  const getUser = useCallback((id) => data.users.find(u => u.id === id), [data.users]);
  const getFile = useCallback((id) => data.files.find(f => f.id === id), [data.files]);
  const getPlan = useCallback((id) => data.plans.find(p => p.id === id) || data.plans[0], [data.plans]);

  const getUserUsedBytes = useCallback((userId) => {
    return data.files
      .filter(f => f.owner === userId)
      .reduce((sum, f) => sum + (f.bytes || 0), 0);
  }, [data.files]);

  // Check if item is locked
  const isItemLocked = useCallback(function checkLocked(file) {
    if (!file) return false;
    if (file.isLocked && !unlockedItems.has(file.id)) return true;
    if (file.parent) {
      const parent = data.files.find(f => f.id === file.parent);
      if (parent && checkLocked(parent)) return true;
    }
    return false;
  }, [data.files, unlockedItems]);

  // Unlock password-protected item
  const unlockItem = useCallback((fileId, password) => {
    const f = data.files.find(item => item.id === fileId);
    if (!f) return false;
    if (f.lockPassword && f.lockPassword !== password) {
      return false;
    }
    setUnlockedItems(prev => new Set([...prev, fileId]));
    return true;
  }, [data.files]);

  // Protect item with password
  const protectItem = useCallback((fileId, password) => {
    setData(prev => ({
      ...prev,
      files: prev.files.map(f => {
        if (f.id === fileId) {
          return {
            ...f,
            isLocked: true,
            lockPassword: password
          };
        }
        return f;
      })
    }));
    setUnlockedItems(prev => {
      const next = new Set(prev);
      next.delete(fileId);
      return next;
    });
    toast('Đã mã hóa và đặt mật khẩu bảo vệ.');
  }, [toast]);

  const relockAll = useCallback(() => {
    setUnlockedItems(new Set());
    toast('Đã khóa lại các tệp và thư mục trong phiên này.');
  }, [toast]);

  // Actions on Files
  const createFolder = useCallback((name, parentId = null) => {
    const trimmed = name.trim();
    if (!trimmed) {
      toast('Vui lòng nhập tên thư mục.');
      return false;
    }

    const exists = data.files.some(
      f => f.owner === currentUser.id && f.parent === parentId && !f.deleted && f.name.toLowerCase() === trimmed.toLowerCase()
    );
    if (exists) {
      toast('Tên thư mục đã tồn tại trong mục này.');
      return false;
    }

    const newFolder = {
      id: generateId(),
      name: trimmed,
      type: 'folder',
      bytes: 0,
      owner: currentUser.id,
      parent: parentId,
      shared: [],
      created: Date.now(),
      deleted: null,
      isLocked: false
    };

    setData(prev => ({
      ...prev,
      files: [newFolder, ...prev.files]
    }));
    toast('Đã tạo thư mục mới thành công.');
    return true;
  }, [currentUser.id, data.files, toast]);

  const uploadFiles = useCallback((fileList, parentId = null) => {
    if (!fileList || fileList.length === 0) return 0;
    const currentPlan = getPlan(currentUser.plan);
    const usedBytes = getUserUsedBytes(currentUser.id);
    const addedBytes = Array.from(fileList).reduce((acc, f) => acc + f.size, 0);

    if (usedBytes + addedBytes > currentPlan.gb * GB) {
      toast('Không đủ dung lượng. Hãy nâng cấp gói hoặc dọn thùng rác.');
      return 0;
    }

    const newFiles = Array.from(fileList).map(f => ({
      id: generateId(),
      name: f.name,
      type: classifyFileType(f),
      bytes: f.size,
      owner: currentUser.id,
      parent: parentId,
      shared: [],
      created: Date.now(),
      deleted: null,
      isLocked: false,
      fileObject: f
    }));

    setData(prev => ({
      ...prev,
      files: [...newFiles, ...prev.files]
    }));
    toast(`Đã tải lên ${newFiles.length} tệp thành công.`);
    return newFiles.length;
  }, [currentUser, getPlan, getUserUsedBytes, toast]);

  // Trash, Restore, Delete Forever
  const trashFile = useCallback((fileId) => {
    const nowTime = Date.now();
    // Recursively collect all descendants
    const toTrash = new Set([fileId]);
    const findChildren = (pid) => {
      data.files.filter(f => f.parent === pid).forEach(child => {
        toTrash.add(child.id);
        findChildren(child.id);
      });
    };
    findChildren(fileId);

    setData(prev => ({
      ...prev,
      files: prev.files.map(f => {
        if (toTrash.has(f.id) && !f.deleted) {
          return { ...f, deleted: nowTime };
        }
        return f;
      })
    }));
    toast('Đã chuyển vào thùng rác.');
  }, [data.files, toast]);

  const restoreFile = useCallback((fileId) => {
    const target = data.files.find(f => f.id === fileId);
    if (!target) return;
    const deletedTime = target.deleted;

    setData(prev => ({
      ...prev,
      files: prev.files.map(f => {
        if (f.id === fileId || (deletedTime && f.deleted === deletedTime)) {
          return { ...f, deleted: null };
        }
        return f;
      })
    }));
    toast('Đã khôi phục tài liệu.');
  }, [data.files, toast]);

  const deleteForever = useCallback((fileId) => {
    const toDelete = new Set([fileId]);
    const findChildren = (pid) => {
      data.files.filter(f => f.parent === pid).forEach(child => {
        toDelete.add(child.id);
        findChildren(child.id);
      });
    };
    findChildren(fileId);

    setData(prev => ({
      ...prev,
      files: prev.files.filter(f => !toDelete.has(f.id))
    }));
    toast('Đã xóa vĩnh viễn và giải phóng dung lượng.');
  }, [data.files, toast]);

  // Share & Revoke
  const shareFile = useCallback((fileId, targetUserId) => {
    const targetUser = data.users.find(u => u.id === targetUserId);
    const targetFile = data.files.find(f => f.id === fileId);
    if (!targetUser || !targetFile) return;

    setData(prev => {
      const updatedFiles = prev.files.map(f => {
        if (f.id === fileId && !f.shared.includes(targetUserId)) {
          return { ...f, shared: [...f.shared, targetUserId] };
        }
        return f;
      });

      const newNotice = {
        id: generateId(),
        to: targetUserId,
        title: `${currentUser.name} đã chia sẻ một ${targetFile.type === 'folder' ? 'thư mục' : 'tài liệu'}`,
        text: targetFile.name,
        file: fileId,
        at: Date.now(),
        read: false
      };

      return {
        ...prev,
        files: updatedFiles,
        notices: [newNotice, ...prev.notices]
      };
    });
    toast(`Đã chia sẻ cho ${targetUser.name}.`);
  }, [currentUser.name, data.files, data.users, toast]);

  const revokeShare = useCallback((fileId, targetUserId) => {
    setData(prev => ({
      ...prev,
      files: prev.files.map(f => {
        if (f.id === fileId) {
          return {
            ...f,
            shared: f.shared.filter(uid => uid !== targetUserId)
          };
        }
        return f;
      })
    }));
    toast('Đã thu hồi quyền chia sẻ.');
  }, [toast]);

  // Plan Purchase (Simulation)
  const buyPlan = useCallback((planId) => {
    const plan = data.plans.find(p => p.id === planId);
    if (!plan) return false;
    const usedBytes = getUserUsedBytes(currentUser.id);
    if (usedBytes > plan.gb * GB) {
      toast('Dung lượng đang dùng vượt hạn mức gói này. Vui lòng dọn dữ liệu trước.');
      return false;
    }

    const price = calculateDiscountPrice(plan);
    setData(prev => {
      const updatedUsers = prev.users.map(u => {
        if (u.id === currentUser.id) {
          return {
            ...u,
            plan: planId,
            paid: (u.paid || 0) + price
          };
        }
        return u;
      });

      const newNotice = {
        id: generateId(),
        to: currentUser.id,
        title: `Đã kích hoạt gói ${plan.name}`,
        text: `Dung lượng của bạn hiện là ${plan.gb} GB. Thanh toán mô phỏng thành công.`,
        at: Date.now(),
        read: false
      };

      return {
        ...prev,
        users: updatedUsers,
        notices: [newNotice, ...prev.notices]
      };
    });
    toast(`Đã cập nhật lên gói ${plan.name}!`);
    return true;
  }, [currentUser.id, data.plans, getUserUsedBytes, toast]);

  // Profile Update
  const updateProfile = useCallback(({ name, email, phone }) => {
    setData(prev => ({
      ...prev,
      users: prev.users.map(u => {
        if (u.id === currentUser.id) {
          return { ...u, name: name.trim(), email: email.trim(), phone: (phone || '').trim() };
        }
        return u;
      })
    }));
    toast('Đã cập nhật thông tin cá nhân.');
  }, [currentUser.id, toast]);

  const changePassword = useCallback((oldPassword, newPassword) => {
    const userInDb = data.users.find(u => u.id === currentUser.id);
    if (userInDb && userInDb.password && userInDb.password !== oldPassword) {
      toast('Mật khẩu hiện tại không đúng.');
      return false;
    }
    setData(prev => ({
      ...prev,
      users: prev.users.map(u => {
        if (u.id === currentUser.id) {
          return { ...u, password: newPassword };
        }
        return u;
      })
    }));
    toast('Đã đổi mật khẩu thành công.');
    return true;
  }, [currentUser.id, data.users, toast]);

  const changeAvatar = useCallback((dataUrl) => {
    setData(prev => ({
      ...prev,
      users: prev.users.map(u => {
        if (u.id === currentUser.id) {
          return { ...u, avatar: dataUrl };
        }
        return u;
      })
    }));
    toast('Đã cập nhật ảnh đại diện.');
  }, [currentUser.id, toast]);

  // Notifications
  const markAllNoticesRead = useCallback(() => {
    setData(prev => ({
      ...prev,
      notices: prev.notices.map(n => (n.to === currentUser.id ? { ...n, read: true } : n))
    }));
    toast('Đã đánh dấu đã đọc tất cả.');
  }, [currentUser.id, toast]);

  const markNoticeRead = useCallback((noticeId) => {
    setData(prev => ({
      ...prev,
      notices: prev.notices.map(n => (n.id === noticeId ? { ...n, read: true } : n))
    }));
  }, []);

  // Admin Actions
  const adminBlockUser = useCallback((userId) => {
    setData(prev => ({
      ...prev,
      users: prev.users.map(u => {
        if (u.id === userId) {
          const nextBlocked = !u.blocked;
          toast(nextBlocked ? `Đã khóa tài khoản ${u.name}.` : `Đã mở khóa tài khoản ${u.name}.`);
          return { ...u, blocked: nextBlocked };
        }
        return u;
      })
    }));
  }, [toast]);

  const adminEditPlan = useCallback((planId, updatedFields) => {
    const { gb, price, discount, until } = updatedFields;
    // Check if any user is currently exceeding new capacity
    const isExceeded = data.users.some(u => u.plan === planId && getUserUsedBytes(u.id) > gb * GB);
    if (isExceeded) {
      toast('Có tài khoản đang dùng vượt hạn mức mới. Không thể giảm dung lượng.');
      return false;
    }

    setData(prev => ({
      ...prev,
      plans: prev.plans.map(p => {
        if (p.id === planId) {
          return {
            ...p,
            gb: Number(gb),
            price: Number(price),
            discount: Number(discount || 0),
            until: until || ''
          };
        }
        return p;
      })
    }));
    toast('Đã lưu cấu hình gói cước.');
    return true;
  }, [data.users, getUserUsedBytes, toast]);

  const adminSendBroadcast = useCallback(({ title, message, audience }) => {
    const recipients = audience === 'all'
      ? data.users
      : data.users.filter(u => u.id === audience);

    const nowTime = Date.now();
    const newNotices = recipients.map(u => ({
      id: generateId(),
      to: u.id,
      title: title.trim(),
      text: message.trim(),
      at: nowTime,
      read: false
    }));

    const newCampaign = {
      id: generateId(),
      title: title.trim(),
      text: message.trim(),
      count: recipients.length,
      at: nowTime
    };

    setData(prev => ({
      ...prev,
      notices: [...newNotices, ...prev.notices],
      campaigns: [newCampaign, ...prev.campaigns]
    }));
    toast(`Đã gửi thông báo đến ${recipients.length} tài khoản.`);
    return true;
  }, [data.users, toast]);

  const value = {
    users: data.users,
    files: data.files,
    plans: data.plans,
    notices: data.notices,
    campaigns: data.campaigns,
    currentUser,
    setCurrentUserId: (id) => setData(prev => ({ ...prev, currentUserId: id })),
    getUser,
    getFile,
    getPlan,
    getUserUsedBytes,
    searchQuery,
    setSearchQuery,
    typeFilter,
    setTypeFilter,
    toastMessage,
    toast,
    isItemLocked,
    unlockItem,
    protectItem,
    relockAll,
    createFolder,
    uploadFiles,
    trashFile,
    restoreFile,
    deleteForever,
    shareFile,
    revokeShare,
    buyPlan,
    updateProfile,
    changePassword,
    changeAvatar,
    markAllNoticesRead,
    markNoticeRead,
    adminBlockUser,
    adminEditPlan,
    adminSendBroadcast,
    keycloakLogout
  };

  return (
    <StorageContext.Provider value={value}>
      {children}
    </StorageContext.Provider>
  );
}

export default StorageContext;
