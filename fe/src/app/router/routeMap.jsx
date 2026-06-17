// fe\src\app\router\routeMap.jsx
import { lazy } from "react";

const ALL_ADMIN = ["SUPERADMIN", "ADMIN"];
const ALL_ASSET_STAFF = ["SUPERADMIN", "ADMIN", "ASSET_STAFF"];
const ALL_MAINT_STAFF = ["SUPERADMIN", "ADMIN", "MAINTENANCE_STAFF"];
const ASSET_AND_MAINT = ["SUPERADMIN", "ADMIN", "ASSET_STAFF", "MAINTENANCE_STAFF"];
const ALL_USER = ["SUPERADMIN", "ADMIN", "USER", "STAFF", "ASSET_STAFF", "MAINTENANCE_STAFF"];
const ALL_TECH = ["SUPERADMIN", "ADMIN", "TECH"];

const LoginPage = lazy(() => import("@/modules/auth/login/LoginPage"));

const TicketPage = lazy(() => import("@/modules/itsm/tickets/TicketPage"));

const IncidentPage = lazy(() => import("@/modules/itsm/incidents/IncidentPage"));

const ServiceRequestPage = lazy(() =>
    import("@/modules/itsm/serviceRequests/ServiceRequestPage")
);

const WorkOrderPage = lazy(() => import("@/modules/cmms/workOrders/WorkOrderPage"));

const MaintenancePage = lazy(() => import("@/modules/cmms/maintenance/MaintenancePage"));

const BreakdownPage = lazy(() => import("@/modules/cmms/breakdown/BreakdownPage"));

const AssignmentPage = lazy(() => import("@/modules/cmms/assignments/AssignmentPage"));

const ApprovalPage = lazy(() => import("@/modules/itam/approval/ApprovalPage"));

const DashboardPage = lazy(() => import("@/modules/itam/dashboard/DashboardPage"));

const ListAssetPage = lazy(() => import("@/modules/itam/assetManagement/ListAssetPage"));

const ListDepreciationPage = lazy(() => import("@/modules/itam/assetManagement/ListDepreciationPage"));

const AssetCategoryPage = lazy(() =>
    import("@/modules/itam/assetManagement/pages/AssetCategoryPage")
);

const MaintenanceSchedulePage = lazy(() => import("@/modules/itam/maintenance/MaintenanceSchedulePage"));

const MaintenanceActualPage = lazy(() => import("@/modules/itam/maintenance/MaintenanceActualPage"));

const MaintenanceHistoryPage = lazy(() => import("@/modules/itam/maintenance/MaintenanceHistoryPage"));

const StandardMaintenancePage = lazy(() => import("@/modules/itam/maintenance/StandardMaintenance/StandardMaintenancePage"));

const YearlyStandardPage = lazy(() => import("@/modules/itam/maintenance/YearlyStandard/YearlyStandardPage"));

const AssetDetailPage = lazy(() =>
    import("@/modules/itam/assetManagement/pages/AssetDetailPage")
);

const InventoryPage = lazy(() => import("@/modules/itam/inventoryManagement/InventoryPage"));

const WarehousePage = lazy(() => import("@/modules/itam/warehouseManagement/WarehousePage"));

const SummaryPage = lazy(() => import("@/modules/itam/summary/SummaryPage"));
const MonthlyReportPage = lazy(() => import("@/modules/itam/summary/MonthlyReportPage"));

const ProfilePage = lazy(() => import("@/modules/itam/account/ProfilePage"));
const SecurityPage = lazy(() => import("@/modules/itam/account/SecurityPage"));
const ActivityLogPage = lazy(() => import("@/modules/itam/account/ActivityLogPage"));
const UserManagementPage = lazy(() => import("@/modules/itam/userManagement/UserManagementPage"));
const AssetBudgetPage = lazy(() => import("@/modules/itam/budget/AssetBudgetPage"));
const RepairMaintenanceBudgetPage = lazy(() => import("@/modules/itam/budget/RepairMaintenanceBudgetPage"));

function Placeholder() {
    return <div>Coming Soon</div>;
}

const routeMap = [
    {
        path: "/login",
        component: LoginPage,
        public: true,
    },

    {
        path: "/itsm/tickets",
        component: TicketPage,
        roles: ALL_USER,
    },
    {
        path: "/itsm/incidents",
        component: IncidentPage,
        roles: ALL_TECH,
    },
    {
        path: "/itsm/service-requests",
        component: ServiceRequestPage,
        roles: ALL_USER,
    },

    {
        path: "/itsm/problem",
        component: Placeholder,
        roles: ALL_TECH,
    },
    {
        path: "/itsm/change",
        component: Placeholder,
        roles: ALL_ADMIN,
    },
    {
        path: "/itsm/sla",
        component: Placeholder,
        roles: ALL_ADMIN,
    },
    {
        path: "/itsm/knowledge",
        component: Placeholder,
        roles: ALL_USER,
    },

    {
        path: "/cmms/work-orders",
        component: WorkOrderPage,
        roles: ALL_TECH,
    },
    {
        path: "/cmms/maintenance",
        component: MaintenancePage,
        roles: ALL_ADMIN,
    },
    {
        path: "/cmms/breakdown",
        component: BreakdownPage,
        roles: ALL_TECH,
    },
    {
        path: "/cmms/assignments",
        component: AssignmentPage,
        roles: ALL_ADMIN,
    },

    {
        path: "/itam/dashboard",
        component: DashboardPage,
        roles: ALL_USER,
    },

    {
        path: "/itam/approval",
        component: ApprovalPage,
        roles: ALL_ADMIN,
    },

    {
        path: "/itam/assets",
        component: ListAssetPage,
        roles: ASSET_AND_MAINT,
    },

    {
        path: "/itam/assets/warranty",
        component: ListDepreciationPage,
        roles: ALL_ASSET_STAFF,
    },
    {
        path: "/itam/assets/categories",
        component: AssetCategoryPage,
        roles: ALL_ASSET_STAFF,
    },

    {
        path: "/itam/assets/:id",
        component: AssetDetailPage,
        roles: ASSET_AND_MAINT,
    },

    {
        path: "/itam/maintenance/yearly-standard",
        component: YearlyStandardPage,
        roles: ALL_ADMIN,
    },

    {
        path: "/itam/maintenance/standard",
        component: StandardMaintenancePage,
        roles: ALL_ADMIN,
    },

    {
        path: "/itam/maintenance/schedule",
        component: MaintenanceSchedulePage,
        roles: ALL_MAINT_STAFF,
    },

    {
        path: "/itam/maintenance/actual",
        component: MaintenanceActualPage,
        roles: ALL_ADMIN,
    },

    {
        path: "/itam/maintenance/history",
        component: MaintenanceHistoryPage,
        roles: ALL_ADMIN,
    },

    {
        path: "/itam/inventory",
        component: InventoryPage,
        roles: ALL_ADMIN,
    },
    {
        path: "/itam/warehouses",
        component: WarehousePage,
        roles: ALL_ADMIN,
    },
    {
        path: "/itam/budget/asset/list",
        component: AssetBudgetPage,
        roles: ALL_ADMIN,
    },
    {
        path: "/itam/budget/asset/schedule",
        component: Placeholder,
        roles: ALL_ADMIN,
    },
    {
        path: "/itam/budget/operational/list",
        component: RepairMaintenanceBudgetPage,
        roles: ALL_ADMIN,
    },
    {
        path: "/itam/budget/operational/schedule",
        component: Placeholder,
        roles: ALL_ADMIN,
    },
    {
        path: "/itam/finance",
        component: Placeholder,
        roles: ALL_ADMIN,
    },

    {
        path: "/itam/summary",
        component: SummaryPage,
        roles: ALL_ADMIN,
    },
    {
        path: "/itam/summary/monthly",
        component: MonthlyReportPage,
        roles: ALL_ADMIN,
    },

    {
        path: "/itam/account/profile",
        component: ProfilePage,
        roles: ALL_USER,
    },
    {
        path: "/itam/account/security",
        component: SecurityPage,
        roles: ALL_USER,
    },
    {
        path: "/itam/account/activity-log",
        component: ActivityLogPage,
        roles: ALL_USER,
    },
    {
        path: "/itam/users",
        component: UserManagementPage,
        roles: ALL_ADMIN,
    },
];

export default routeMap;