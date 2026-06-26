import { useEffect, useMemo } from "react";
import { DatePicker, Form, Input, Modal, Select } from "antd";
import dayjs from "dayjs";

const SOFTWARE_TYPE_OPTIONS = [
 { value: "Monthly", label: "Monthly" },
 { value: "Yearly", label: "Yearly" },
 { value: "Permanen", label: "Permanen" },
];

function getSoftwareType(asset) {
 const source = asset && typeof asset === "object" ? asset : {};
 return source.operating_system || source.type || "";
}

function calculateNextRenewal(renewDate, type) {
 if (!renewDate) return null;

 if (type === "Monthly") {
  return dayjs(renewDate).add(1, "month");
 }

 if (type === "Yearly") {
  return dayjs(renewDate).add(1, "year");
 }

 return null;
}

export default function RenewalModal({
 open,
 asset,
 loading = false,
 onCancel,
 onSubmit,
}) {
 const [form] = Form.useForm();
 const selectedType = Form.useWatch("type", form);
 const renewDate = Form.useWatch("renew_date", form);

 const initialType = useMemo(() => getSoftwareType(asset), [asset]);

 useEffect(() => {
  if (!open) return;

  const defaultRenewDate = dayjs();
  const type = initialType || "Yearly";

  form.setFieldsValue({
   type,
   renew_date: defaultRenewDate,
   qty: asset?.qty || asset?.mac_address || "",
   vendor: asset?.owner_name || "",
   notes: "",
   next_renewal: type === "Permanen"
    ? null
    : calculateNextRenewal(defaultRenewDate, type),
   next_renewal_text: type === "Permanen" ? "Seumur Hidup" : "",
  });
 }, [open, asset, initialType, form]);

 useEffect(() => {
  if (!open) return;

  if (selectedType === "Permanen") {
   form.setFieldsValue({
    next_renewal: null,
    next_renewal_text: "Seumur Hidup",
   });
   return;
  }

  form.setFieldsValue({
   next_renewal_text: "",
   next_renewal: calculateNextRenewal(renewDate, selectedType),
  });
 }, [open, selectedType, renewDate, form]);

 const handleOk = async () => {
  const values = await form.validateFields();

  await onSubmit?.({
   ...values,
   renew_date: values.renew_date
    ? values.renew_date.format("YYYY-MM-DD")
    : null,
   next_renewal: values.type === "Permanen"
    ? null
    : values.next_renewal
     ? values.next_renewal.format("YYYY-MM-DD")
     : null,
  });
 };

 return (
  <Modal
   title="Renew License"
   open={open}
   onCancel={onCancel}
   onOk={handleOk}
   okText="Simpan Renewal"
   cancelText="Batal"
   confirmLoading={loading}
   destroyOnHidden
  >
   <Form form={form} layout="vertical">
    <Form.Item label="LICENSE NO">
     <Input value={asset?.serial_number || asset?.asset_code || "-"} disabled />
    </Form.Item>

    <Form.Item label="DESCRIPTION">
     <Input value={asset?.asset_name || "-"} disabled />
    </Form.Item>

    <Form.Item
     name="type"
     label="TYPE"
     rules={[{ required: true, message: "Type wajib dipilih" }]}
    >
     <Select options={SOFTWARE_TYPE_OPTIONS} />
    </Form.Item>

    <Form.Item
     name="renew_date"
     label="RENEW DATE"
     rules={[{ required: true, message: "Renew date wajib diisi" }]}
    >
     <DatePicker
      style={{ width: "100%" }}
      format="DD/MM/YYYY"
     />
    </Form.Item>

    {selectedType === "Permanen" ? (
     <Form.Item name="next_renewal_text" label="NEXT RENEWAL">
      <Input disabled />
     </Form.Item>
    ) : (
     <Form.Item name="next_renewal" label="NEXT RENEWAL (DD/MM/YYYY)">
      <DatePicker
       style={{ width: "100%" }}
       format="DD/MM/YYYY"
       disabled
      />
     </Form.Item>
    )}

    <Form.Item name="qty" label="QTY">
     <Input placeholder="Contoh: 1 License" />
    </Form.Item>

    <Form.Item name="vendor" label="VENDOR">
     <Input />
    </Form.Item>

    <Form.Item name="notes" label="NOTE">
     <Input.TextArea rows={3} />
    </Form.Item>
   </Form>
  </Modal>
 );
}
