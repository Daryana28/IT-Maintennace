// fe\src\modules\itam\assets\components\AssetCategoryTabs.jsx
import {
 Card,
 Tabs,
} from "antd";

const toId = (v) =>
 String(v ?? "");

export default function AssetCategoryTabs({
 categories,
 lv1,
 lv2,
 lv3,
 lv4,
 setLv1,
 setLv2,
 setLv3,
 setLv4,
}) {
 const visibleCategories = categories.filter((x) => {
  const show = x.show_in_tabs;
  return show !== false && show !== 0 && show !== '0' && show !== 'false';
 });

 const getChildren = (parentId) =>
  visibleCategories.filter(
   (x) => toId(x.parent_id) === toId(parentId)
  );

 const roots = visibleCategories.filter(
  (x) => !x.parent_id
 );

 const lv2Tabs =
  lv1
   ? getChildren(
    lv1
   )
   : [];

 const lv3Tabs =
  lv2
   ? getChildren(
    lv2
   )
   : [];

 const lv4Tabs =
  lv3
   ? getChildren(
    lv3
   )
   : [];

 return (
  <div className="asset-category-tabs-container">
   <Tabs
    activeKey={lv1}
    onChange={(
     key
    ) => {
     setLv1(key);
     setLv2("");
     setLv3("");
     setLv4("");
    }}
    items={[
     {
      key: "",
      label:
       "All",
     },
     ...roots.map(
      (x) => ({
       key: toId(
        x.category_id
       ),
       label:
        x.category_name,
      })
     ),
    ]}
   />

   {!!lv1 &&
    lv2Tabs.length >
    0 && (
     <Tabs
      activeKey={
       lv2
      }
      onChange={(
       key
      ) => {
       setLv2(
        key
       );
       setLv3(
        ""
       );
       setLv4(
        ""
       );
      }}
      items={lv2Tabs.map(
       (x) => ({
        key: toId(
         x.category_id
        ),
        label:
         x.category_name,
       })
      )}
     />
    )}

   {!!lv2 &&
    lv3Tabs.length >
    0 && (
     <Tabs
      activeKey={
       lv3
      }
      onChange={(
       key
      ) => {
       setLv3(
        key
       );
       setLv4(
        ""
       );
      }}
      items={lv3Tabs.map(
       (x) => ({
        key: toId(
         x.category_id
        ),
        label:
         x.category_name,
       })
      )}
     />
    )}

   {!!lv3 &&
    lv4Tabs.length >
    0 && (
     <Tabs
      activeKey={
       lv4
      }
      onChange={
       setLv4
      }
      items={lv4Tabs.map(
       (x) => ({
        key: toId(
         x.category_id
        ),
        label:
         x.category_name,
       })
      )}
     />
    )}
  </div>
 );
}