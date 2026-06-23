// be\src\modules\itam\assets\services\getAll.js
import db from "../../../../models/index.js";
import { Op, where, col } from "sequelize";

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

 const andConditions = [];

 if (query.search) {
  andConditions.push({
   [Op.or]: [
    {
     asset_code: {
      [Op.like]: `%${query.search}%`,
     },
    },
    {
     asset_name: {
      [Op.like]: `%${query.search}%`,
     },
    },
   ],
  });
 }

 const likeFields = [
  "asset_code",
  "asset_name",
  "division",
  "department",
  "owner_name",
  "nik",
  "purchase_date",
  "depreciation_date",
  "hostname",
  "ip_main",
  "ip_backup",
 ];

 likeFields.forEach((field) => {
  if (query[field]) {
   andConditions.push({
    [field]: {
     [Op.like]: `%${query[field]}%`,
    },
   });
  }
 });

 if (query.type) {
  andConditions.push(
   where(col("category.category_name"), {
    [Op.like]: `%${query.type}%`,
   })
  );
 }

 if (query.status) {
  andConditions.push({
   status: query.status.toString().includes(",")
    ? { [Op.in]: query.status.toString().split(",").map((s) => s.trim()) }
    : query.status,
  });
 } else if (query.exclude_status) {
  andConditions.push({
   status: {
    [Op.notIn]: query.exclude_status.split(",").map((s) => s.trim()),
   },
  });
 }

 if (
  query.has_depreciation_date === true ||
  query.has_depreciation_date === "true" ||
  query.has_depreciation_date === 1 ||
  query.has_depreciation_date === "1"
 ) {
  andConditions.push({
   depreciation_date: {
    [Op.ne]: null,
   },
  });
 }

 if (query.category_id) {
  andConditions.push({
   category_id: query.category_id.toString().includes(",")
    ? { [Op.in]: query.category_id.toString().split(",") }
    : query.category_id,
  });
 }

 const whereClause = andConditions.length > 0
  ? { [Op.and]: andConditions }
  : {};

 const sortBy =
  query.sort_by === "depreciation_date"
   ? "depreciation_date"
   : "asset_id";

 const sortOrder =
  String(query.sort_order || "DESC").toUpperCase() === "ASC"
   ? "ASC"
   : "DESC";

 const result =
  await Asset.findAndCountAll(
   {
    where: whereClause,
    include,
    order: [
     [
      sortBy,
      sortOrder,
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
