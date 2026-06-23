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
    key: "asm",
    label: "Asset Management",
    icon: DatabaseOutlined,
    roles: ASSET_AND_MAINT,
    children: [
      {
        key: "assetHardware",
        label: "Hardware",
        roles: ASSET_AND_MAINT,
        children: [
          {
            key: "assetHardwareAll",
            label: "All",
            path: "/itam/assets/hardware/list",
            roles: ASSET_AND_MAINT,
          },
          {
            key: "assetHardwareDepreciation",
            label: "History Depresiasi",
            path: "/itam/assets/hardware/depreciation",
            roles: ALL_ASSET_STAFF,
          },
        ],
      },
      {
        key: "assetSoftwareHardware",
        label: "Software",
        roles: ASSET_AND_MAINT,
        children: [
          {
            key: "assetSoftwareHardwareAll",
            label: "All",
            path: "/itam/assets/software-hardware/list",
            roles: ASSET_AND_MAINT,
          },
          {
            key: "assetSoftwareHardwareDepreciation",
            label: "History Depresiasi",
            path: "/itam/assets/software-hardware/depreciation",
            roles: ALL_ASSET_STAFF,
          },
        ],
      },
    ],
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
            label: "Schedule",
            path: "/itam/budget/asset/list",
          },
          {
            key: "budgetAssetSchedule",
            label: "Monitoring Progress",
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
            label: "Schedule",
            path: "/itam/budget/operational/list",
          },
          {
            key: "budgetOpSchedule",
            label: "Monitoring Progress",
            path: "/itam/budget/operational/schedule",
          },
        ],
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
        key: "maintenanceHardware",
        label: "Hardware",
        roles: ALL_MAINT_STAFF,
        children: [
          { key: "mHardwareStandard", label: "Standard Maintenance", path: "/itam/maintenance/hardware/yearly-standard", roles: ALL_MAINT_STAFF },
          { key: "mHardwareSchedule", label: "Schedule", path: "/itam/maintenance/hardware/schedule", roles: ALL_MAINT_STAFF },
          { key: "mHardwareLogSheet", label: "Logsheet Abnormal", path: "/itam/maintenance/hardware/logsheet", roles: ALL_MAINT_STAFF },
        ],
      },
      {
        key: "maintenanceSoftwareHardware",
        label: "Software Hardware",
        roles: ALL_MAINT_STAFF,
        children: [
          { key: "mSoftwareHardwareStandard", label: "Standard Maintenance", path: "/itam/maintenance/software-hardware/yearly-standard", roles: ALL_MAINT_STAFF },
          { key: "mSoftwareHardwareSchedule", label: "Schedule", path: "/itam/maintenance/software-hardware/schedule", roles: ALL_MAINT_STAFF },
          { key: "mSoftwareHardwareLogSheet", label: "Logsheet Abnormal", path: "/itam/maintenance/software-hardware/logsheet", roles: ALL_MAINT_STAFF },
        ],
      },
      {
        key: "maintenanceApplication",
        label: "Application",
        roles: ALL_MAINT_STAFF,
        children: [
          { key: "mApplicationStandard", label: "Standard Maintenance", path: "/itam/maintenance/application/yearly-standard", roles: ALL_MAINT_STAFF },
          { key: "mApplicationSchedule", label: "Schedule", path: "/itam/maintenance/application/schedule", roles: ALL_MAINT_STAFF },
          { key: "mApplicationLogSheet", label: "Logsheet Abnormal", path: "/itam/maintenance/application/logsheet", roles: ALL_MAINT_STAFF },
        ],
      },
      {
        key: "maintenanceNetwork",
        label: "Network",
        roles: ALL_MAINT_STAFF,
        children: [
          { key: "mNetworkStandard", label: "Standard Maintenance", path: "/itam/maintenance/network/yearly-standard", roles: ALL_MAINT_STAFF },
          { key: "mNetworkSchedule", label: "Schedule", path: "/itam/maintenance/network/schedule", roles: ALL_MAINT_STAFF },
          { key: "mNetworkLogSheet", label: "Logsheet Abnormal", path: "/itam/maintenance/network/logsheet", roles: ALL_MAINT_STAFF },
        ],
      },
      {
        key: "maintenanceCyberSecurity",
        label: "Cyber Security",
        roles: ALL_MAINT_STAFF,
        children: [
          { key: "mCyberSecurityStandard", label: "Standard Maintenance", path: "/itam/maintenance/cyber-security/yearly-standard", roles: ALL_MAINT_STAFF },
          { key: "mCyberSecuritySchedule", label: "Schedule", path: "/itam/maintenance/cyber-security/schedule", roles: ALL_MAINT_STAFF },
          { key: "mCyberSecurityLogSheet", label: "Logsheet Abnormal", path: "/itam/maintenance/cyber-security/logsheet", roles: ALL_MAINT_STAFF },
        ],
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
    path: "/itam/summary",
    roles: ALL_ADMIN,
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
