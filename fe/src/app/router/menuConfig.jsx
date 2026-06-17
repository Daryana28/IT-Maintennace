import {
  DashboardOutlined,
  UserOutlined,
  DatabaseOutlined,
  CheckCircleOutlined,
  ToolOutlined,
  PieChartOutlined,
  DollarOutlined,
  TeamOutlined,
} from "@ant-design/icons";


const ALL_ADMIN = [
  "SUPERADMIN",
  "ADMIN",
];

const ALL_ASSET_STAFF = [
  "SUPERADMIN",
  "ADMIN",
  "ASSET_STAFF",
];

const ALL_MAINT_STAFF = [
  "SUPERADMIN",
  "ADMIN",
  "MAINTENANCE_STAFF",
];

const ASSET_AND_MAINT = [
  "SUPERADMIN",
  "ADMIN",
  "ASSET_STAFF",
  "MAINTENANCE_STAFF",
];

const ALL_USER = [
  "SUPERADMIN",
  "ADMIN",
  "USER",
  "STAFF",
  "ASSET_STAFF",
  "MAINTENANCE_STAFF",
];

const ALL_TECH = [
  "SUPERADMIN",
  "ADMIN",
  "TECH",
];

export const MENU = [
  {
    key: "dashboard",
    label: "Dashboard",
    icon: DashboardOutlined,
    path: "/itam/dashboard",
    roles: ALL_USER,
  },

  {
    key: "budget",
    label: "Budget",
    icon: DollarOutlined,
    roles: ALL_ADMIN,
    children: [
      {
        key: "budgetAsset",
        label: "Asset",
        children: [
          {
            key: "budgetAssetList",
            label: "List",
            path: "/itam/budget/asset/list",
          },
          {
            key: "budgetAssetSchedule",
            label: "Schedule",
            path: "/itam/budget/asset/schedule",
          },
        ],
      },
      {
        key: "budgetRepairMaintenance",
        label: "Operational",
        children: [
          {
            key: "budgetOpList",
            label: "List",
            path: "/itam/budget/operational/list",
          },
          {
            key: "budgetOpSchedule",
            label: "Schedule",
            path: "/itam/budget/operational/schedule",
          },
        ],
      },
    ],
  },

  {
    key: "asm",
    label: "Asset Management",
    icon: DatabaseOutlined,
    roles: ASSET_AND_MAINT,
    children: [
      {
        key: "assets",
        label: "List Assets",
        path: "/itam/assets",
        roles: ASSET_AND_MAINT,
      },
      {
        key: "assetWarranty",
        label: "List Depresiasi",
        path: "/itam/assets/warranty",
        roles: ALL_ASSET_STAFF,
      },
      {
        key: "assetCategories",
        label: "Manage Categories",
        path: "/itam/assets/categories",
        roles: ALL_ASSET_STAFF,
      },
    ],
  },

  {
    key: "maintenance",
    label: "Maintenance",
    icon: ToolOutlined,
    roles: ALL_MAINT_STAFF,
    children: [
      {
        key: "maintenanceStandard",
        label: "Standard Maintenance",
        path: "/itam/maintenance/yearly-standard",
        roles: ALL_ADMIN,
      },
      {
        key: "maintenanceSchedule",
        label: "Schedule",
        path: "/itam/maintenance/schedule",
        roles: ALL_MAINT_STAFF,
      },
      {
        key: "maintenanceActual",
        label: "Aktual",
        path: "/itam/maintenance/actual",
        roles: ALL_ADMIN,
      },
      {
        key: "maintenanceHistory",
        label: "History",
        path: "/itam/maintenance/history",
        roles: ALL_ADMIN,
      },
    ],
  },

  {
    key: "approval",
    label: "Approval",
    icon: CheckCircleOutlined,
    path: "/itam/approval",
    roles: ALL_ADMIN,
  },



  {
    key: "summary",
    label: "Summary",
    icon: PieChartOutlined,
    roles: ALL_ADMIN,
    children: [
      {
        key: "summaryCenter",
        label: "Summary Center",
        path: "/itam/summary",
      },
      {
        key: "summaryMonthly",
        label: "Monthly Report",
        path: "/itam/summary/monthly",
      },
    ],
  },

  {
    key: "users",
    label: "User Management",
    icon: TeamOutlined,
    path: "/itam/users",
    roles: ALL_ADMIN,
  },

  {
    key: "account",
    label: "Account",
    icon: UserOutlined,
    roles: ALL_USER,
    children: [
      {
        key: "profile",
        label: "Profile",
        path: "/itam/account/profile",
      },
      {
        key: "security",
        label: "Security",
        path: "/itam/account/security",
      },
      {
        key: "activityLog",
        label: "Activity Log",
        path: "/itam/account/activity-log",
      },
    ],
  },
];