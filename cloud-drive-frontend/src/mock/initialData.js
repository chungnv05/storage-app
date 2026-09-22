const now = Date.now();
const day = 864e5;

export const initialUsers = [
  {
    id: 'u1',
    name: 'Nguyễn Nhật Anh',
    email: 'nhatanh@demo.vn',
    plan: 'plus',
    password: 'Demo123!',
    phone: '0901234567',
    blocked: false,
    paid: 490000,
    created: now - 35 * day,
    avatar: null
  },
  {
    id: 'u2',
    name: 'Trần Minh Anh',
    email: 'minhanh@demo.vn',
    plan: 'free',
    password: 'Demo123!',
    phone: '',
    blocked: false,
    paid: 0,
    created: now - 42 * day,
    avatar: null
  },
  {
    id: 'u3',
    name: 'Lê Hoàng Nam',
    email: 'hoangnam@demo.vn',
    plan: 'pro',
    password: 'Demo123!',
    phone: '0988776655',
    blocked: false,
    paid: 1190000,
    created: now - 49 * day,
    avatar: null
  },
  {
    id: 'u4',
    name: 'Phạm Thu Hà',
    email: 'thuha@demo.vn',
    plan: 'free',
    password: 'Demo123!',
    phone: '',
    blocked: false,
    paid: 0,
    created: now - 56 * day,
    avatar: null
  },
  {
    id: 'u5',
    name: 'Đỗ Đức Huy',
    email: 'duchuy@demo.vn',
    plan: 'plus',
    password: 'Demo123!',
    phone: '',
    blocked: false,
    paid: 245000,
    created: now - 63 * day,
    avatar: null
  },
  {
    id: 'u6',
    name: 'Vũ Ngọc Linh',
    email: 'ngoclinh@demo.vn',
    plan: 'free',
    password: 'Demo123!',
    phone: '',
    blocked: true,
    paid: 0,
    created: now - 70 * day,
    avatar: null
  }
];

export const initialPlans = [
  {
    id: 'free',
    name: 'Free',
    gb: 3,
    price: 0,
    discount: 0,
    until: ''
  },
  {
    id: 'plus',
    name: 'Plus',
    gb: 10,
    price: 49000,
    discount: 0,
    until: ''
  },
  {
    id: 'pro',
    name: 'Pro',
    gb: 20,
    price: 99000,
    discount: 0,
    until: ''
  }
];

export const initialFiles = [
  {
    id: 'd1',
    name: 'Dự án & công việc',
    type: 'folder',
    bytes: 0,
    owner: 'u1',
    parent: null,
    shared: ['u2'],
    created: now - 1 * day,
    deleted: null,
    isLocked: false
  },
  {
    id: 'd2',
    name: 'Tài liệu cá nhân',
    type: 'folder',
    bytes: 0,
    owner: 'u1',
    parent: null,
    shared: [],
    created: now - 2 * day,
    deleted: null,
    isLocked: false
  },
  {
    id: 'd3',
    name: 'Hình ảnh & sáng tạo',
    type: 'folder',
    bytes: 0,
    owner: 'u1',
    parent: null,
    shared: [],
    created: now - 3 * day,
    deleted: null,
    isLocked: false
  },
  // Thư mục lồng cấp 2 & 3
  {
    id: 'demo-sub-1',
    name: 'Thiết kế giao diện',
    type: 'folder',
    bytes: 0,
    owner: 'u1',
    parent: 'd1',
    shared: [],
    created: now - 4 * day,
    deleted: null,
    isLocked: false
  },
  {
    id: 'demo-sub-2',
    name: 'Bản bàn giao',
    type: 'folder',
    bytes: 0,
    owner: 'u1',
    parent: 'demo-sub-1',
    shared: [],
    created: now - 5 * day,
    deleted: null,
    isLocked: false
  },
  {
    id: 'demo-sub-file',
    name: 'Mô tả màn hình.pdf',
    type: 'document',
    bytes: 1200000,
    owner: 'u1',
    parent: 'demo-sub-1',
    shared: [],
    created: now - 6 * day,
    deleted: null,
    isLocked: false
  },
  {
    id: 'demo-deep-file',
    name: 'Checklist bàn giao.xlsx',
    type: 'document',
    bytes: 450000,
    owner: 'u1',
    parent: 'demo-sub-2',
    shared: [],
    created: now - 7 * day,
    deleted: null,
    isLocked: false
  },
  // Tệp gốc & trong các thư mục
  {
    id: 'f1',
    name: 'Kế hoạch dự án Q4.pdf',
    type: 'document',
    bytes: 12400000,
    owner: 'u1',
    parent: null,
    shared: [],
    created: now - 8 * day,
    deleted: null,
    isLocked: false
  },
  {
    id: 'f2',
    name: 'Báo cáo tháng 09.xlsx',
    type: 'document',
    bytes: 2800000,
    owner: 'u1',
    parent: null,
    shared: [],
    created: now - 9 * day,
    deleted: null,
    isLocked: false
  },
  {
    id: 'f3',
    name: 'Brand guidelines.pdf',
    type: 'document',
    bytes: 18500000,
    owner: 'u1',
    parent: 'd1',
    shared: [],
    created: now - 10 * day,
    deleted: null,
    isLocked: false
  },
  {
    id: 'f4',
    name: 'Giới thiệu sản phẩm.mp4',
    type: 'video',
    bytes: 1280000000,
    owner: 'u1',
    parent: null,
    shared: [],
    created: now - 11 * day,
    deleted: null,
    isLocked: false
  },
  {
    id: 'f5',
    name: 'Bộ ảnh sản phẩm.jpg',
    type: 'image',
    bytes: 246000000,
    owner: 'u1',
    parent: null,
    shared: [],
    created: now - 12 * day,
    deleted: null,
    isLocked: false
  },
  {
    id: 'f6',
    name: 'Source website.zip',
    type: 'other',
    bytes: 420000000,
    owner: 'u1',
    parent: null,
    shared: [],
    created: now - 13 * day,
    deleted: null,
    isLocked: false
  },
  {
    id: 'f7',
    name: 'Hợp đồng dịch vụ.docx',
    type: 'document',
    bytes: 3200000,
    owner: 'u1',
    parent: 'd2',
    shared: [],
    created: now - 14 * day,
    deleted: null,
    isLocked: false
  },
  {
    id: 'f8',
    name: 'Ảnh sự kiện.png',
    type: 'image',
    bytes: 182000000,
    owner: 'u1',
    parent: 'd3',
    shared: [],
    created: now - 15 * day,
    deleted: null,
    isLocked: false
  },
  {
    id: 'f9',
    name: 'Video hội thảo.mp4',
    type: 'video',
    bytes: 650000000,
    owner: 'u1',
    parent: 'd1',
    shared: [],
    created: now - 16 * day,
    deleted: null,
    isLocked: false
  },
  // Tệp được chia sẻ từ u2, u3
  {
    id: 's1',
    name: 'Tài liệu dự án Storage',
    type: 'folder',
    bytes: 0,
    owner: 'u2',
    parent: null,
    shared: ['u1'],
    created: now - 17 * day,
    deleted: null,
    isLocked: false
  },
  {
    id: 's2',
    name: 'Đặc tả chức năng.pdf',
    type: 'document',
    bytes: 5400000,
    owner: 'u2',
    parent: 's1',
    shared: [],
    created: now - 18 * day,
    deleted: null,
    isLocked: false
  },
  {
    id: 's3',
    name: 'Bảng giá dịch vụ.xlsx',
    type: 'document',
    bytes: 1800000,
    owner: 'u3',
    parent: null,
    shared: ['u1'],
    created: now - 19 * day,
    deleted: null,
    isLocked: false
  },
  // Tệp trong thùng rác
  {
    id: 't1',
    name: 'Bản nháp cũ.docx',
    type: 'document',
    bytes: 2400000,
    owner: 'u1',
    parent: null,
    shared: [],
    created: now - 25 * day,
    deleted: now - 4 * day,
    isLocked: false
  },
  {
    id: 't2',
    name: 'Ảnh chưa sử dụng.png',
    type: 'image',
    bytes: 4300000,
    owner: 'u1',
    parent: null,
    shared: [],
    created: now - 28 * day,
    deleted: now - 8 * day,
    isLocked: false
  }
];

export const initialNotices = [
  {
    id: 'n1',
    to: 'u1',
    title: 'Minh Anh đã chia sẻ một thư mục',
    text: 'Bạn có thể truy cập “Tài liệu dự án Storage”.',
    file: 's1',
    at: now - 36e5,
    read: false
  },
  {
    id: 'n2',
    to: 'u1',
    title: 'Hoàng Nam đã chia sẻ một tài liệu',
    text: 'Bảng giá dịch vụ.xlsx',
    file: 's3',
    at: now - 864e5,
    read: false
  }
];

export const initialCampaigns = [
  {
    id: 'c1',
    title: 'Ưu đãi nâng cấp gói Plus mừng năm mới',
    text: 'Nhận ngay ưu đãi 20% khi đăng ký gói Plus trong tuần này.',
    count: 6,
    at: now - 3 * day
  }
];
