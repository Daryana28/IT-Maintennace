// fe/src/modules/itam/assets/components/AssetForm.jsx
import {
 useEffect,
 useMemo,
 useCallback,
 useState,
} from "react";

import {
 Button,
 Drawer,
 Form,
 Space,
} from "antd";

import dayjs from "dayjs";

import assetService from "../services/assetService";

import AssetInfoSection from "./form/AssetInfoSection";
import UserSection from "./form/UserSection";
import FinanceSection from "./form/FinanceSection";
import NetworkSection from "./form/NetworkSection";
import ClassificationSection from "./form/ClassificationSection";
import {
 getAssetTypeProfile,
 normalizeAssetType as normalizeName,
 resolveAssetTypeKey,
} from "../utils/assetTypeProfiles";
import { getWorkbookTabCategoryIds } from "../utils/assetWorkbookTabs";

const ROOT_LABEL_MAP = {
 hardware: "Hardware",
 "software hardware": "Software",
 software: "Application",
 application: "Application",
 networking: "Network",
 network: "Network",
 cyber: "Cyber Security",
 "cyber security": "Cyber Security",
};

const ALLOWED_ROOTS = new Set(Object.keys(ROOT_LABEL_MAP));

export default function AssetForm({
 open,
 initialValues,
 categories = [],
 routeGroup = "",
 workbookTabKey = "",
 defaultCategoryId = null,
 onCancel,
 onSubmit,
}) {
 const [form] = Form.useForm();
 const [saving, setSaving] = useState(false);

 const lv1 = Form.useWatch("category_lv1", form);
 const mainType = Form.useWatch("main_type", form);
 const lv2 = Form.useWatch("category_lv2", form);

 const categoryMap = useMemo(
  () =>
   new Map(
    categories.map((x) => [
     String(x.category_id),
     x,
    ])
   ),
  [categories]
 );

 const activeTypeKey = useMemo(() => {
  const selectedRoot = categoryMap.get(
   String(lv1 ?? "")
  );
  const rootName =
   selectedRoot?.category_name ||
   routeGroup;
  return resolveAssetTypeKey(rootName);
 }, [categoryMap, lv1, routeGroup]);

 const typeProfile = useMemo(
  () => getAssetTypeProfile(activeTypeKey),
  [activeTypeKey]
 );
 const isWorkbookMode = Boolean(workbookTabKey);
 const workbookCategoryIds = useMemo(
  () => getWorkbookTabCategoryIds(categories, routeGroup, workbookTabKey),
  [categories, routeGroup, workbookTabKey]
 );
 const defaultWorkbookCategoryId = workbookCategoryIds.length
  ? Number(workbookCategoryIds[0])
  : (defaultCategoryId ? Number(defaultCategoryId) : null);

 const getRootCategoryIdByRoute = useCallback(
  (groupName) => {
   if (!groupName) return null;

   const aliases = {
    hardware: ["hardware"],
    "software-hardware": ["software hardware"],
    software: ["software", "application"],
    application: ["software", "application"],
    network: ["network", "networking"],
    "cyber-security": ["cyber security", "cyber"],
   };

   const allowedNames =
    aliases[normalizeName(groupName)] || [
     normalizeName(groupName),
    ];

   const matchedRoot = categories.find(
    (item) =>
     !item.parent_id &&
     allowedNames.includes(
      normalizeName(item.category_name)
     )
   );

   return matchedRoot
    ? Number(matchedRoot.category_id)
    : null;
  },
  [categories]
 );

 const normalizedCategories = useMemo(
  () =>
   categories.map((item) => ({
    ...item,
    normalized_name: normalizeName(item.category_name),
   })),
  [categories]
 );

 const buildOptions = useCallback(
  (parentId) => {
   const options =
    normalizedCategories
     .filter(
      (x) => {
       if (
        String(x.parent_id ?? "") !==
        String(parentId ?? "")
       ) {
        return false;
       }

       if (parentId == null) {
        return ALLOWED_ROOTS.has(
         x.normalized_name
        );
       }

       return true;
      }
     )
     .map((x) => ({
      value: Number(x.category_id),
      label:
       parentId == null
        ? ROOT_LABEL_MAP[
           x.normalized_name
          ] ||
          x.category_name
        : x.category_name,
      sortNo: Number(x.sort_no || 0),
     }))
     .sort(
      (a, b) =>
       a.sortNo - b.sortNo ||
       a.label.localeCompare(b.label)
     );

   if (parentId != null) {
    return options.map((option) => ({
     value: option.value,
     label: option.label,
    }));
   }

   const seenLabels = new Set();
   return options
    .filter((option) => {
     const key =
      normalizeName(option.label);
     if (seenLabels.has(key)) {
      return false;
     }
     seenLabels.add(key);
     return true;
    })
    .map((option) => ({
     value: option.value,
     label: option.label,
    }));
  },
  [normalizedCategories]
 );

 const buildCategoryPath = useCallback(
  (id) => {
   if (!id) return [];

   const path = [];
   let current = categoryMap.get(String(id));

   while (current) {
    path.unshift(
     Number(current.category_id)
    );

    current = current.parent_id
     ? categoryMap.get(
      String(current.parent_id)
     )
     : null;
   }

   return path;
  },
  [categoryMap]
 );

 useEffect(() => {
  if (!open || initialValues) return;

  let active = true;
  const defaultRootId =
   getRootCategoryIdByRoute(routeGroup);

  if (isWorkbookMode && defaultWorkbookCategoryId) {
   form.setFieldsValue({
    category_id: defaultWorkbookCategoryId,
    category_lv1: null,
    main_type: null,
    category_lv2: null,
   });
  } else if (defaultRootId) {
   form.setFieldsValue({
    category_lv1: defaultRootId,
    main_type: null,
    category_lv2: null,
    category_id: null,
   });
  }

  (async () => {
   const code =
    await assetService.getNextCode();

   if (active) {
    form.setFieldValue(
     "asset_code",
     code
    );
   }
  })();

  return () => {
   active = false;
  };
 }, [open, initialValues, form, routeGroup, getRootCategoryIdByRoute, isWorkbookMode, defaultWorkbookCategoryId]);

 useEffect(() => {
  if (!open) return;

  const path = buildCategoryPath(
   initialValues?.category_id
  );

  form.setFieldsValue({
   ...initialValues,
   category_lv1: path[0] || null,
   asset_name: initialValues?.asset_name || null,
   main_type: path[1] || null,
   category_lv2: path[2] || null,
   category_id: path[3] || null,

   purchase_date:
    initialValues?.purchase_date
     ? dayjs(
      initialValues.purchase_date
     )
     : null,

   depreciation_date:
    initialValues?.depreciation_date
     ? dayjs(
      initialValues.depreciation_date
     )
     : null,
  });
 }, [
  open,
  initialValues,
  form,
  buildCategoryPath,
 ]);

 const close = useCallback(() => {
  form.resetFields();
  onCancel();
 }, [form, onCancel]);

 const onPurchaseChange =
  useCallback(
   (value) => {
    form.setFieldValue(
     "depreciation_date",
     value
      ? dayjs(value).add(
       6,
       "year"
      )
      : null
    );
   },
   [form]
  );

 const submit = useCallback(
  async () => {
   if (saving) return;

   setSaving(true);

   try {
    const values =
     await form.validateFields();

    await onSubmit({
     ...values,
     category_id:
      values.category_id ||
      values.category_lv2 ||
      values.main_type ||
      values.category_lv1 ||
      defaultWorkbookCategoryId,

     purchase_date:
      values.purchase_date
       ? values.purchase_date.format(
        "YYYY-MM-DD"
       )
       : null,

     depreciation_date:
      values.depreciation_date
       ? values.depreciation_date.format(
        "YYYY-MM-DD"
       )
       : null,
    });

    form.resetFields();
   } finally {
    setSaving(false);
   }
  },
   [defaultWorkbookCategoryId, form, onSubmit, saving]
  );

 const rootOptions = useMemo(
  () => buildOptions(null),
  [buildOptions]
 );

 const mainTypeOptions = useMemo(
  () => buildOptions(lv1),
  [buildOptions, lv1]
 );

 const lv2Options = useMemo(
  () => buildOptions(mainType),
  [buildOptions, mainType]
 );

 const lv3Options = useMemo(
  () => buildOptions(lv2),
  [buildOptions, lv2]
 );

 return (
  <Drawer
   title={
    initialValues
     ? "Edit Asset"
     : "Add Asset"
   }
   open={open}
   onClose={close}
   size="large"
   destroyOnHidden
   extra={
    <Space>
     <Button onClick={close}>
      Cancel
     </Button>

     <Button
      type="primary"
      loading={saving}
      onClick={submit}
     >
      Save
     </Button>
    </Space>
   }
  >
   <Form
    form={form}
    layout="vertical"
   >
    <AssetInfoSection
     form={form}
     rootOptions={rootOptions}
     mainTypeOptions={mainTypeOptions}
     lv2Options={lv2Options}
     lv3Options={lv3Options}
     typeProfile={typeProfile}
     workbookTabKey={workbookTabKey}
    />

    <UserSection
     typeProfile={typeProfile}
     workbookTabKey={workbookTabKey}
    />

    <FinanceSection
     typeProfile={typeProfile}
     onPurchaseChange={
      onPurchaseChange
     }
     workbookTabKey={workbookTabKey}
    />

    <NetworkSection
     typeProfile={typeProfile}
     workbookTabKey={workbookTabKey}
    />

    {!isWorkbookMode && (
     <ClassificationSection
      typeProfile={typeProfile}
     />
    )}
   </Form>
  </Drawer>
 );
}
