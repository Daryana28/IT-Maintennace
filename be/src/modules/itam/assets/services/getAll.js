// be\src\modules\itam\assets\services\getAll.js
import db from "../../../../models/index.js";
import { Op } from "sequelize";

const {
 Asset,
 AssetCategory,
 AssetLocation,
} = db;

const include = [
 {
  model: AssetCategory,
  as: "category",
  required: false,
  include: [
   {
    model: AssetCategory,
    as: "parent",
    required: false,
    attributes: ["category_id", "category_name"],
   },
  ],
 },
 {
  model: AssetLocation,
  as: "location",
  required: false,
 },
];

export default async function (
 query = {}
) {
 const page = Math.max(
  Number(query.page) || 1,
  1
 );

 const pageSize =
  Math.max(
   Number(
    query.pageSize
   ) || 20,
   1
  );

 const offset =
  (page - 1) *
  pageSize;

 const where = {
  ...(query.search && {
   [Op.or]: [
    {
     asset_code: {
      [Op.like]:
       `%${query.search}%`,
     },
    },
    {
     asset_name: {
      [Op.like]:
       `%${query.search}%`,
     },
    },
   ],
  }),

  ...(query.status ? {
   status: query.status.toString().includes(",")
    ? { [Op.in]: query.status.toString().split(",").map(s => s.trim()) }
    : query.status,
  } : query.exclude_status ? {
   status: {
    [Op.notIn]: query.exclude_status.split(",").map(s => s.trim()),
   }
  } : {}),

  ...(query.category_id && {
   category_id: query.category_id.toString().includes(",")
    ? { [Op.in]: query.category_id.toString().split(",") }
    : query.category_id,
  }),
 };

 const result =
  await Asset.findAndCountAll(
   {
    where,
    include,
    order: [
     [
      "asset_id",
      "DESC",
     ],
    ],
    limit:
     pageSize,
    offset,
    distinct: true,
   }
  );

 return {
  rows:
   result.rows,
  total:
   result.count,
  page,
  pageSize,
  totalPages:
   Math.ceil(
    result.count /
     pageSize
   ),
 };
}