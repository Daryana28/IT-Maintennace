// be\src\modules\itam\assets\services\create.js
import db from "../../../../models/index.js";
import writeAudit from "../../../../core/utils/writeAudit.js";
import assetLifecycleRepository from "../../assetLifecycle/assetLifecycleRepository.js";

const { Asset } = db;

export default async function (payload, req) {
 const created = await Asset.create({
  ...payload,
  created_at: new Date(),
 });

 await assetLifecycleRepository.create({
  asset_id: created.asset_id,
  action_name: "PROCURED",
  notes: "Asset created",
  created_by: req?.user?.user_id || null,
 });

 await writeAudit({
  req,
  moduleName: "ITAM",
  entityName: "ASSET",
  entityId: created.asset_id,
  actionName: "CREATE",
  newData: created.toJSON(),
  description: "Create asset",
 });

 return created;
}