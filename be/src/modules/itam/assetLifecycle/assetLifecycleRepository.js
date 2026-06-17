// be\src\modules\itam\assetLifecycle\assetLifecycleRepository.js
import db from "../../../models/index.js";

const {
 AssetLifecycle,
 User,
} = db;

const getByAssetId =
 async (assetId) => {
  return await AssetLifecycle.findAll({
   where: {
    asset_id:
     Number(assetId),
   },
   include: [
    {
     model: User,
     as: "creator",
     required: false,
     attributes: [
      "user_id",
      "full_name",
     ],
    },
   ],
   order: [
    ["created_at", "DESC"],
   ],
  });
 };

const create =
 async (payload) => {
  return await AssetLifecycle.create(
   payload
  );
 };

export default {
 getByAssetId,
 create,
};