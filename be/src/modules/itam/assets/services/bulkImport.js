// be\src\modules\itam\assets\services\bulkImport.js
import db from "../../../../models/index.js";
import writeAudit from "../../../../core/utils/writeAudit.js";

const {
 Asset,
 AssetCategory,
 sequelize,
} = db;

export default async function (
 rows = [],
 req
) {
 if (
  !Array.isArray(rows) ||
  !rows.length
 ) {
  throw new Error(
   "Rows required"
  );
 }

 const trx =
  await sequelize.transaction();

 try {
  const parseDate = (val) => {
   if (!val) return null;
   const str = String(val).trim();
   if (str === "" || str === "-" || str.toUpperCase() === "N/A") return null;
   const formatted = str.replace(/\//g, "-");
   const d = new Date(formatted);
   if (isNaN(d.getTime())) return null;
   return d.toISOString().split("T")[0];
  };

  const allCategories = await AssetCategory.findAll({
   attributes: ["category_id", "category_name"],
  });

  for (const row of rows) {
   const assetCode = row.asset_code || row.asset_tag || row.NO_ASSET;
   if (!assetCode) continue;

   let categoryId = row.category_id || null;
   const typeStrRaw = row.TYPE || row.category_name || null;
   
   if (!categoryId && typeStrRaw) {
    const typeStr = String(typeStrRaw).trim().toLowerCase();
    const match = allCategories.find((c) => String(c.category_name).trim().toLowerCase() === typeStr);
    if (match) {
     categoryId = match.category_id;
    }
   }

   if (!categoryId) {
    throw new Error(`Kategori "${typeStrRaw || 'Kosong'}" untuk Asset ${assetCode} tidak ditemukan di sistem. Harap pastikan nama TYPE di Excel sama persis dengan nama Kategori.`);
   }

   const payload = {
    asset_code: assetCode,
    asset_name:
     row.asset_name,
    category_id:
     categoryId,
    location_id:
     row.location_id ||
     null,
    serial_number:
     row.serial_number ||
     null,
    status:
     row.status ||
     "ACTIVE",
    purchase_date: parseDate(row.purchase_date),
    depreciation_date: parseDate(row.depreciation_date),
    hostname:
     row.hostname ||
     null,
    owner_name:
     row.owner_name ||
     null,
    division:
     row.division ||
     null,
    department:
     row.department ||
     null,
    nik:
     row.nik ||
     null,
    ip_main:
     row.ip_main ||
     null,
    ip_backup:
     row.ip_backup ||
     null,
   };

   let exist = null;
   if (row.hostname) {
    exist = await Asset.findOne({
     where: {
      hostname: row.hostname,
     },
     transaction: trx,
    });
   }

   if (exist) {
    await exist.update(
     payload,
     {
      transaction:
       trx,
     }
    );
   } else {
    await Asset.create(
     {
      ...payload,
      created_at: new Date(),
     },
     {
      transaction:
       trx,
     }
    );
   }
  }

  await trx.commit();

  await writeAudit({
   req,
   moduleName:
    "ITAM",
   entityName:
    "ASSET",
   entityId: 0,
   actionName:
    "IMPORT",
   description: `Bulk import ${rows.length} rows`,
  });

  return true;
 } catch (error) {
  try {
   await trx.rollback();
  } catch (err) {
   // Ignore if already rolled back
  }
  throw error;
 }
}