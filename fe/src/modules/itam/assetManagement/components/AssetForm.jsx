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

export default function AssetForm({
 open,
 initialValues,
 categories = [],
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

 const buildOptions = useCallback(
  (parentId) =>
   categories
    .filter(
     (x) =>
      String(x.parent_id ?? "") ===
      String(parentId ?? "")
    )
    .map((x) => ({
     value: Number(x.category_id),
     label: x.category_name,
    })),
  [categories]
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
 }, [open, initialValues, form]);

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
     category_id: values.category_id || values.category_lv2 || values.main_type || values.category_lv1,

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
  [form, onSubmit, saving]
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
    />

    <UserSection />

    <FinanceSection
     onPurchaseChange={
      onPurchaseChange
     }
    />

    <NetworkSection />

    <ClassificationSection />
   </Form>
  </Drawer>
 );
}