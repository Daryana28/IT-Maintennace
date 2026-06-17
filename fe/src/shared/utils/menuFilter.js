// fe\src\shared\utils\menuFilter.js
export function filterMenuByRole(
 menu = [],
 roles = []
) {
 if (!Array.isArray(menu)) {
  return [];
 }

 const roleList = Array.isArray(roles)
  ? roles.map(r => String(r).toUpperCase())
  : [roles].filter(Boolean).map(r => String(r).toUpperCase());

 const hasAccess = (
  itemRoles
 ) => {
  if (!itemRoles) {
   return true;
  }

  const list = Array.isArray(
   itemRoles
  )
   ? itemRoles.map(r => String(r).toUpperCase())
   : [itemRoles].map(r => String(r).toUpperCase());

  return list.some((role) =>
   roleList.includes(role)
  );
 };

 return menu.reduce(
  (result, item) => {
   if (!hasAccess(item?.roles)) {
    return result;
   }

   if (
    Array.isArray(
     item?.children
    )
   ) {
    const children =
     filterMenuByRole(
      item.children,
      roleList
     );

    if (
     children.length ===
     0 &&
     !item.path
    ) {
     return result;
    }

    result.push({
     ...item,
     children,
    });

    return result;
   }

   result.push(item);
   return result;
  },
  []
 );
}