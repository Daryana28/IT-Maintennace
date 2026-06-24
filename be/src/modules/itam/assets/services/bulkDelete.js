import db from "../../../../models/index.js";
import writeAudit from "../../../../core/utils/writeAudit.js";
import { Op } from "sequelize";

const {
 Asset,
 sequelize,
} = db;

export default async function (
 payload = {},
 req
) {
 const categoryIds = Array.isArray(payload.category_ids)
  ? payload.category_ids.map((id) => String(id).trim()).filter(Boolean)
  : [];

 if (!categoryIds.length) {
  throw new Error("Category ids required");
 }

 const trx = await sequelize.transaction();

 try {
  const deletedCount = await Asset.destroy({
   where: {
    category_id: {
     [Op.in]: categoryIds,
    },
   },
   transaction: trx,
  });

  await trx.commit();

  await writeAudit({
   req,
   moduleName: "ITAM",
   entityName: "ASSET",
   entityId: 0,
   actionName: "BULK_DELETE",
   description: `Delete assets by categories: ${categoryIds.join(", ")} (${deletedCount} rows)`,
  });

  return deletedCount;
 } catch (error) {
  try {
   await trx.rollback();
  } catch {
   // noop
  }
  throw error;
 }
}
