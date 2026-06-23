import 'dotenv/config';
import bcrypt from 'bcrypt';
import db from './src/models/index.js';
import { generateCheckboxDates } from './src/modules/cmms/maintenanceSchedule/checkboxGenerator.js';

async function seed() {
  try {
    console.log("Starting database seeding...");

    // Clean up existing transaction & checklist data for a clean reset
    console.log("Cleaning up existing maintenance data...");
    await db.MaintenanceLogSheet.destroy({ where: {} });
    await db.MaintenanceAbnormalLog.destroy({ where: {} });
    await db.MaintenanceActual.destroy({ where: {} });
    await db.MaintenanceSchedule.destroy({ where: {} });
    await db.StandardMaintenanceCheck.destroy({ where: {} });
    await db.StandardMaintenanceDetail.destroy({ where: {} });
    await db.StandardMaintenance.destroy({ where: {} });
    await db.YearlyStandardMaintenance.destroy({ where: {} });
    await db.Asset.destroy({ where: {} });
    await db.AssetCategory.destroy({ where: {} });
    await db.AssetLocation.destroy({ where: {} });
    console.log("✓ Cleanup finished.");

    // 1. Seed Company
    const [company] = await db.Company.findOrCreate({
      where: { company_code: 'COMP01' },
      defaults: {
        company_name: 'Enterprise IT Solutions',
        is_active: true,
        created_at: new Date()
      }
    });
    console.log("✓ Seeded Company:", company.company_name);

    // 2. Seed Department
    const [dept] = await db.Department.findOrCreate({
      where: { department_name: 'IT Operations' },
      defaults: {
        company_id: company.company_id,
        department_code: 'IT',
        is_active: true,
        created_at: new Date()
      }
    });
    console.log("✓ Seeded Department:", dept.department_name);

    // 3. Seed Job Level
    const [level] = await db.JobLevel.findOrCreate({
      where: { level_name: 'Senior Administrator' },
      defaults: {
        description: 'Senior System Administrator Level',
        rank_order: 1
      }
    });
    console.log("✓ Seeded Job Level:", level.level_name);

    // 4. Seed Roles
    const [adminRole] = await db.Role.findOrCreate({
      where: { role_name: 'Admin' }
    });
    const [superAdminRole] = await db.Role.findOrCreate({
      where: { role_name: 'SuperAdmin' }
    });
    console.log("✓ Seeded Roles");

    // 5. Seed Users
    const passwordHash = await bcrypt.hash('password123', 10);
    
    const [user1] = await db.User.findOrCreate({
      where: { email: 'tester@example.com' },
      defaults: {
        company_id: company.company_id,
        department_id: dept.department_id,
        job_level_id: level.level_id,
        username: 'tester',
        full_name: 'QA Tester Profile',
        password_hash: passwordHash,
        is_active: true,
        created_at: new Date()
      }
    });

    const [user2] = await db.User.findOrCreate({
      where: { email: 'admin@example.com' },
      defaults: {
        company_id: company.company_id,
        department_id: dept.department_id,
        job_level_id: level.level_id,
        username: 'admin',
        full_name: 'Super Administrator',
        password_hash: passwordHash,
        is_active: true,
        created_at: new Date()
      }
    });
    console.log("✓ Seeded Users (tester@example.com / password123, admin@example.com / password123)");

    // Link user roles
    await db.UserRole.findOrCreate({
      where: { user_id: user1.user_id, role_id: adminRole.role_id }
    });
    await db.UserRole.findOrCreate({
      where: { user_id: user2.user_id, role_id: superAdminRole.role_id }
    });
    console.log("✓ Linked Users to Roles");

    // 6. Seed Location
    const [loc] = await db.AssetLocation.findOrCreate({
      where: { location_name: 'IT Data Center Lt. 3' }
    });
    console.log("✓ Seeded Asset Location:", loc.location_name);

    // 7. Seed Asset Categories (Hardware, Software, Networking, Cyber)
    const [catHW] = await db.AssetCategory.findOrCreate({
      where: { category_name: 'Hardware' },
      defaults: { category_code: 'HW', show_in_tabs: true, level_no: 1, sort_no: 1, is_active: true, created_at: new Date() }
    });
    const [catLaptop] = await db.AssetCategory.findOrCreate({
      where: { category_name: 'Laptop', parent_id: catHW.category_id },
      defaults: { category_code: 'LPT', show_in_tabs: true, level_no: 2, sort_no: 1, is_active: true, created_at: new Date() }
    });

    const [catSW] = await db.AssetCategory.findOrCreate({
      where: { category_name: 'Software' },
      defaults: { category_code: 'SW', show_in_tabs: true, level_no: 1, sort_no: 2, is_active: true, created_at: new Date() }
    });
    const [catERP] = await db.AssetCategory.findOrCreate({
      where: { category_name: 'ERP System', parent_id: catSW.category_id },
      defaults: { category_code: 'ERP', show_in_tabs: true, level_no: 2, sort_no: 1, is_active: true, created_at: new Date() }
    });

    const [catNW] = await db.AssetCategory.findOrCreate({
      where: { category_name: 'Networking' },
      defaults: { category_code: 'NW', show_in_tabs: true, level_no: 1, sort_no: 3, is_active: true, created_at: new Date() }
    });
    const [catSwitch] = await db.AssetCategory.findOrCreate({
      where: { category_name: 'Switch Router', parent_id: catNW.category_id },
      defaults: { category_code: 'SWT', show_in_tabs: true, level_no: 2, sort_no: 1, is_active: true, created_at: new Date() }
    });

    const [catCY] = await db.AssetCategory.findOrCreate({
      where: { category_name: 'Cyber' },
      defaults: { category_code: 'CYB', show_in_tabs: true, level_no: 1, sort_no: 4, is_active: true, created_at: new Date() }
    });
    const [catFW] = await db.AssetCategory.findOrCreate({
      where: { category_name: 'Firewall Protection', parent_id: catCY.category_id },
      defaults: { category_code: 'FW', show_in_tabs: true, level_no: 2, sort_no: 1, is_active: true, created_at: new Date() }
    });
    console.log("✓ Seeded Asset Categories");

    // 8. Seed Assets
    const [asset1] = await db.Asset.findOrCreate({
      where: { asset_code: 'AST-LPT-001' },
      defaults: {
        category_id: catLaptop.category_id,
        location_id: loc.location_id,
        asset_name: 'ThinkPad T14 QA Tester',
        serial_number: 'SN-THINK-LPT001',
        status: 'ACTIVE',
        created_at: new Date(),
        purchase_date: '2025-01-10',
        hostname: 'qa-tester-lpt',
        ip_main: '192.168.10.45'
      }
    });

    const [asset2] = await db.Asset.findOrCreate({
      where: { asset_code: 'AST-ERP-001' },
      defaults: {
        category_id: catERP.category_id,
        location_id: loc.location_id,
        asset_name: 'Production SAP ERP Server',
        serial_number: 'SN-ERP-SRV909',
        status: 'ACTIVE',
        created_at: new Date(),
        purchase_date: '2024-06-15',
        hostname: 'sap-production-srv',
        ip_main: '192.168.10.10'
      }
    });

    const [asset3] = await db.Asset.findOrCreate({
      where: { asset_code: 'AST-NET-001' },
      defaults: {
        category_id: catSwitch.category_id,
        location_id: loc.location_id,
        asset_name: 'Cisco Catalyst Switch IT',
        serial_number: 'SN-CISCO-SW01',
        status: 'ACTIVE',
        created_at: new Date(),
        purchase_date: '2024-11-20',
        hostname: 'switch-core-datacenter',
        ip_main: '192.168.10.2'
      }
    });

    const [asset4] = await db.Asset.findOrCreate({
      where: { asset_code: 'AST-FW-001' },
      defaults: {
        category_id: catFW.category_id,
        location_id: loc.location_id,
        asset_name: 'Fortigate 100F Firewall Core',
        serial_number: 'SN-FORTI-FW100F',
        status: 'ACTIVE',
        created_at: new Date(),
        purchase_date: '2025-02-05',
        hostname: 'firewall-core',
        ip_main: '192.168.10.1'
      }
    });
    console.log("✓ Seeded Asset Records");

    // 9. Seed Yearly Standard
    const currentYear = 2026;
    const [yearly] = await db.YearlyStandardMaintenance.findOrCreate({
      where: { tahun: currentYear },
      defaults: {
        judul: `Standar Pemeliharaan Infrastruktur IT ${currentYear}`,
        status_approval: 'APPROVED',
        created_at: new Date(),
        updated_at: new Date()
      }
    });
    console.log("✓ Seeded Yearly Standard Maintenance:", yearly.judul);

    // 10. Seed Standard Maintenances
    const standardSpecs = [
      { kategori: 'Hardware', subKategori: 'Laptop', namaPerangkat: 'Laptop', tipePerangkat: 'ThinkPad' },
      { kategori: 'Software', subKategori: 'ERP System', namaPerangkat: 'ERP System', tipePerangkat: 'SAP ERP' },
      { kategori: 'Networking', subKategori: 'Switch Router', namaPerangkat: 'Switch Router', tipePerangkat: 'Cisco Catalyst' },
      { kategori: 'Cyber', subKategori: 'Firewall Protection', namaPerangkat: 'Firewall Protection', tipePerangkat: 'ASA Firewall' }
    ];

    for (const spec of standardSpecs) {
      const [sm] = await db.StandardMaintenance.findOrCreate({
        where: {
          yearly_standard_id: yearly.id,
          kategori: spec.kategori,
          subKategori: spec.subKategori
        },
        defaults: {
          namaPerangkat: spec.namaPerangkat,
          tipePerangkat: spec.tipePerangkat,
          subPerangkat: '-',
          created_at: new Date(),
          updated_at: new Date()
        }
      });

      // Seed Standard Detail
      const [detail] = await db.StandardMaintenanceDetail.findOrCreate({
        where: { standard_maintenance_id: sm.id, fungsi: 'Pemeriksaan Kesehatan Perangkat' },
        defaults: {
          deskripsi: `SOP pemeriksaan periodik menyeluruh untuk perangkat ${spec.namaPerangkat}`,
          created_at: new Date(),
          updated_at: new Date()
        }
      });

      // Seed Standard Checks
      // Check 1: Pembersihan Fisik (Bulanan)
      const [check1] = await db.StandardMaintenanceCheck.findOrCreate({
        where: { standard_maintenance_detail_id: detail.id, pengecekan: 'Pembersihan debu & fan' },
        defaults: {
          standard: 'Bebas debu & sirkulasi fan lancar',
          periodik: '1 Bulan',
          bagian: 'Casing & Heat Sink',
          metode: 'Kuas halus & blower',
          alat: 'Blower & Kuas',
          created_at: new Date(),
          updated_at: new Date()
        }
      });

      // Check 2: Update Sistem (Mingguan)
      const [check2] = await db.StandardMaintenanceCheck.findOrCreate({
        where: { standard_maintenance_detail_id: detail.id, pengecekan: 'Review security logs & patches' },
        defaults: {
          standard: 'Security logs bersih & tidak ada alert kritis',
          periodik: '1 Minggu',
          bagian: 'Sistem Operasi / Firmware',
          metode: 'Web console monitoring & log review',
          alat: 'Admin Dashboards',
          created_at: new Date(),
          updated_at: new Date()
        }
      });

      // 11. Generate Maintenance Schedule
      let categoryName = sm.subKategori;
      const categoryObj = await db.AssetCategory.findOne({ where: { category_name: categoryName }, raw: true });
      if (categoryObj) {
        const assets = await db.Asset.findAll({ where: { category_id: categoryObj.category_id }, raw: true });
        for (const asset of assets) {
          const [schedule] = await db.MaintenanceSchedule.findOrCreate({
            where: {
              asset_id: asset.asset_id,
              yearly_standard_id: yearly.id,
              standard_maintenance_id: sm.id
            },
            defaults: {
              periodik: '1 Minggu',
              status: 'ACTIVE'
            }
          });

          // Generate check cells
          const checks = [check1, check2];
          const actualRecords = [];
          for (const check of checks) {
            const dates = await generateCheckboxDates(currentYear, check.periodik);
            for (const date of dates) {
              actualRecords.push({
                schedule_id: schedule.id,
                check_id: check.id,
                tanggal: date,
                status: 'PLAN',
                legend: '□',
                created_at: new Date(),
                updated_at: new Date()
              });
            }
          }

          if (actualRecords.length > 0) {
            // Bulk insert check cells
            await db.MaintenanceActual.bulkCreate(actualRecords);
            
            // To make testing realistic, let's set some cells to Done (✓) and one cell to Abnormal (✗)
            const createdActuals = await db.MaintenanceActual.findAll({
              where: { schedule_id: schedule.id }
            });

            // Set first 3 checks of each schedule to Done
            for (let i = 0; i < Math.min(createdActuals.length, 3); i++) {
              await createdActuals[i].update({
                status: 'ACTUAL',
                legend: '✓'
              });
            }

            // Set the 4th check of the first laptop schedule to Abnormal (✗) and create abnormal log
            if (asset.asset_code === 'AST-LPT-001' && createdActuals.length > 3) {
              const abnormalCell = createdActuals[3];
              await abnormalCell.update({
                status: 'ABNORMAL',
                legend: '✗'
              });

              const [log] = await db.MaintenanceAbnormalLog.findOrCreate({
                where: { actual_id: abnormalCell.id },
                defaults: {
                  deskripsi_kerusakan: 'Laptop mengalami overheating parah saat membuka visual studio. Kipas berbunyi bising.',
                  tindakan: 'Pembersihan ulang pasta thermal processor dan pembersihan kipas internal.',
                  status_temuan: 'OPEN',
                  created_at: new Date(),
                  updated_at: new Date()
                }
              });

              // Create legacy record in maintenance_log_sheets
              await db.MaintenanceLogSheet.findOrCreate({
                where: { actual_id: abnormalCell.id },
                defaults: {
                  schedule_id: schedule.id,
                  temuan: 'Laptop overheating, kipas bising.',
                  tindakan: 'Pembersihan pasta thermal.',
                  status_temuan: 'OPEN',
                  tanggal_temuan: new Date(),
                  created_by: user1.user_id
                }
              });
              
              console.log("✓ Seeded Abnormal check cell and Reported Log Sheet for Laptop T14");
            }
          }
        }
      }
    }

    console.log("Seeding process completed successfully!");
    process.exit(0);
  } catch (error) {
    console.error("Error during seeding process:", error);
    process.exit(1);
  }
}

seed();
