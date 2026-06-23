const ROOT_ALIASES = {
  hardware: ["hardware"],
  "software-hardware": ["software-hardware", "software hardware"],
  application: ["application", "software"],
  network: ["network", "networking"],
  "cyber-security": ["cyber-security", "cyber security", "cyber"],
};

const DEFAULT_STATUS_OPTIONS = [
  { value: "ACTIVE", label: "ACTIVE" },
  { value: "INACTIVE", label: "INACTIVE" },
  { value: "REPAIR", label: "REPAIR" },
  { value: "STOCK", label: "STOCK" },
  { value: "SCRAP", label: "SCRAP" },
];

const APPLICATION_STATUS_OPTIONS = [
  { value: "ACTIVE", label: "ACTIVE" },
  { value: "INACTIVE", label: "INACTIVE" },
  { value: "UNDER_MAINTENANCE", label: "UNDER MAINTENANCE" },
  { value: "EXPIRED", label: "EXPIRED" },
  { value: "DECOMMISSIONED", label: "DECOMMISSIONED" },
];

const SOFTWARE_HARDWARE_STATUS_OPTIONS = [
  { value: "ACTIVE", label: "ACTIVE" },
  { value: "INACTIVE", label: "INACTIVE" },
  { value: "LICENSE_EXPIRED", label: "LICENSE EXPIRED" },
  { value: "PENDING_RENEWAL", label: "PENDING RENEWAL" },
  { value: "OBSOLETE", label: "OBSOLETE" },
];

const NETWORK_STATUS_OPTIONS = [
  { value: "ACTIVE", label: "ACTIVE" },
  { value: "INACTIVE", label: "INACTIVE" },
  { value: "DOWN", label: "DOWN" },
  { value: "UNDER_MAINTENANCE", label: "UNDER MAINTENANCE" },
  { value: "DECOMMISSIONED", label: "DECOMMISSIONED" },
];

const CYBER_STATUS_OPTIONS = [
  { value: "ACTIVE", label: "ACTIVE" },
  { value: "INACTIVE", label: "INACTIVE" },
  { value: "MONITORING", label: "MONITORING" },
  { value: "UNDER_REVIEW", label: "UNDER REVIEW" },
  { value: "DECOMMISSIONED", label: "DECOMMISSIONED" },
];

const TYPE_PROFILES = {
  hardware: {
    assetSectionTitle: "Asset Info",
    assetNameLabel: "Nama Asset",
    serialNumberLabel: "Serial Number",
    hostnameLabel: "Hostname",
    userSectionTitle: "User Assignment",
    ownerNameLabel: "Nama User",
    financeSectionTitle: "Financial",
    purchaseDateLabel: "Pembelian",
    depreciationDateLabel: "Depresiasi",
    networkSectionTitle: "Network",
    ipMainLabel: "IP Main",
    ipBackupLabel: "IP Backup",
    classificationSectionTitle: "User Classification",
    classificationLabels: ["Managerial", "Meeting", "Teknikal"],
    statusOptions: DEFAULT_STATUS_OPTIONS,
    tableLabels: {
      assetName: "NAMA ASSET",
      type: "TYPE",
      ownerName: "NAMA",
      purchaseDate: "PEMBELIAN",
      depreciationDate: "DEPRESIASI (5+1 TH)",
      hostname: "HOSTNAME",
      ipMain: "IP ADDRESS\nMAIN",
      ipBackup: "IP ADDRESS\nBACKUP",
    },
  },
  "software-hardware": {
    assetSectionTitle: "Software Hardware Info",
    assetNameLabel: "Nama Device / Software",
    serialNumberLabel: "Serial / License Number",
    hostnameLabel: "Hostname / Client",
    userSectionTitle: "User Assignment",
    ownerNameLabel: "PIC User",
    financeSectionTitle: "Financial & License",
    purchaseDateLabel: "Tanggal Aktif",
    depreciationDateLabel: "Expired / Renewal Date",
    networkSectionTitle: "Access & Connection",
    ipMainLabel: "IP Main / URL",
    ipBackupLabel: "IP Backup / Backup",
    classificationSectionTitle: "Asset Classification",
    classificationLabels: ["Office Use", "Shared Use", "Technical Use"],
    statusOptions: SOFTWARE_HARDWARE_STATUS_OPTIONS,
    tableLabels: {
      assetName: "NAMA DEVICE / SOFTWARE",
      type: "KATEGORI",
      ownerName: "PIC USER",
      purchaseDate: "TGL AKTIF",
      depreciationDate: "EXPIRED / RENEWAL",
      hostname: "HOSTNAME / CLIENT",
      ipMain: "IP / URL\nMAIN",
      ipBackup: "IP / URL\nBACKUP",
    },
  },
  application: {
    assetSectionTitle: "Application Info",
    assetNameLabel: "Nama Aplikasi",
    serialNumberLabel: "License Key / Code",
    hostnameLabel: "Server / Host",
    userSectionTitle: "Application Ownership",
    ownerNameLabel: "PIC Application",
    financeSectionTitle: "Financial",
    purchaseDateLabel: "Tanggal Aktif",
    depreciationDateLabel: "Expired / Renewal Date",
    networkSectionTitle: "Access & Hosting",
    ipMainLabel: "URL / IP Server",
    ipBackupLabel: "Backup Server",
    classificationSectionTitle: "Application Classification",
    classificationLabels: ["Business Critical", "Internal Use", "Operational"],
    statusOptions: APPLICATION_STATUS_OPTIONS,
    tableLabels: {
      assetName: "NAMA APLIKASI",
      type: "KATEGORI APP",
      ownerName: "PIC APPLICATION",
      purchaseDate: "TGL AKTIF",
      depreciationDate: "EXPIRED / RENEWAL",
      hostname: "SERVER / HOST",
      ipMain: "URL / IP SERVER",
      ipBackup: "BACKUP SERVER",
    },
  },
  network: {
    assetSectionTitle: "Network Asset Info",
    assetNameLabel: "Nama Device Network",
    serialNumberLabel: "Serial Number",
    hostnameLabel: "Device Name / Hostname",
    userSectionTitle: "Network Ownership",
    ownerNameLabel: "PIC Network",
    financeSectionTitle: "Financial",
    purchaseDateLabel: "Tanggal Instalasi",
    depreciationDateLabel: "Replacement Date",
    networkSectionTitle: "Addressing",
    ipMainLabel: "IP Address Main",
    ipBackupLabel: "Management / Backup IP",
    classificationSectionTitle: "Network Classification",
    classificationLabels: ["Backbone", "Distribution", "Access"],
    statusOptions: NETWORK_STATUS_OPTIONS,
    tableLabels: {
      assetName: "NAMA DEVICE",
      type: "KATEGORI NETWORK",
      ownerName: "PIC NETWORK",
      purchaseDate: "TGL INSTALASI",
      depreciationDate: "REPLACEMENT DATE",
      hostname: "DEVICE / HOSTNAME",
      ipMain: "IP ADDRESS\nMAIN",
      ipBackup: "MGMT / BACKUP\nIP",
    },
  },
  "cyber-security": {
    assetSectionTitle: "Cyber Security Info",
    assetNameLabel: "Nama Security Asset",
    serialNumberLabel: "License / Serial Number",
    hostnameLabel: "Appliance / Host",
    userSectionTitle: "Security Ownership",
    ownerNameLabel: "PIC Security",
    financeSectionTitle: "Financial & Subscription",
    purchaseDateLabel: "Tanggal Aktif",
    depreciationDateLabel: "Expired / Review Date",
    networkSectionTitle: "Security Access",
    ipMainLabel: "Protected URL / IP",
    ipBackupLabel: "Failover / Backup Node",
    classificationSectionTitle: "Security Classification",
    classificationLabels: ["Protection", "Detection", "Compliance"],
    statusOptions: CYBER_STATUS_OPTIONS,
    tableLabels: {
      assetName: "NAMA SECURITY ASSET",
      type: "KATEGORI SECURITY",
      ownerName: "PIC SECURITY",
      purchaseDate: "TGL AKTIF",
      depreciationDate: "EXPIRED / REVIEW",
      hostname: "APPLIANCE / HOST",
      ipMain: "PROTECTED URL /\nIP",
      ipBackup: "FAILOVER /\nBACKUP NODE",
    },
  },
};

export function normalizeAssetType(value = "") {
  return String(value).trim().toLowerCase();
}

export function resolveAssetTypeKey(value = "") {
  const normalized = normalizeAssetType(value);

  for (const [key, aliases] of Object.entries(ROOT_ALIASES)) {
    if (aliases.includes(normalized)) {
      return key;
    }
  }

  return "hardware";
}

export function getAssetTypeProfile(value = "") {
  return TYPE_PROFILES[resolveAssetTypeKey(value)] || TYPE_PROFILES.hardware;
}
