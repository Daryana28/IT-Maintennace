import { memo, useEffect, useState } from "react";
import { Modal, Form, Input, Select, Switch, Button, Row, Col, Space } from "antd";
import { UserOutlined, TeamOutlined } from "@ant-design/icons";
import userService from "../services/userService";

const UserFormModal = memo(function UserFormModal({
    open,
    editing,
    submitting,
    onCancel,
    onSubmit,
}) {
    const [roleOptions, setRoleOptions] = useState([]);
    const [rolesLoading, setRolesLoading] = useState(false);

    useEffect(() => {
        if (!open) return;
        setRolesLoading(true);
        userService
            .getRoles()
            .then((res) => {
                const opts = (res.data || []).map((r) => ({
                    label: r.role_name,
                    value: r.role_id,
                }));
                setRoleOptions(opts);
            })
            .catch(() => {
                setRoleOptions([]);
            })
            .finally(() => {
                setRolesLoading(false);
            });
    }, [open]);
    const [form] = Form.useForm();

    useEffect(() => {
        if (!open) return;
        if (editing) {
            form.setFieldsValue({
                username: editing.username,
                full_name: editing.full_name,
                is_active: editing.is_active,
                role_ids: editing.roles?.map((r) => r.role_id) || [],
                password: "",
            });
        } else {
            form.resetFields();
        }
    }, [open, editing, form]);

    const handleFinish = (values) => {
        // Remove empty password for edit
        if (editing && !values.password) {
            const { password, ...rest } = values;
            onSubmit(rest);
        } else {
            onSubmit(values);
        }
    };

    return (
        <Modal
            title={
                <Space>
                    <TeamOutlined style={{ color: "var(--primary)" }} />
                    {editing ? "Edit Pengguna" : "Tambah Pengguna Baru"}
                </Space>
            }
            open={open}
            onCancel={onCancel}
            footer={null}
            width={600}
            destroyOnHidden
            centered
        >
            <Form
                form={form}
                layout="vertical"
                onFinish={handleFinish}
                requiredMark="optional"
                className="um-modal-form"
            >
                <Row gutter={16}>
                    <Col xs={24} sm={12}>
                        <Form.Item
                            name="username"
                            label="Username"
                            rules={[
                                { required: true, message: "Username wajib diisi" },
                                { min: 3, message: "Minimal 3 karakter" },
                            ]}
                            tooltip="Identitas unik untuk login"
                        >
                            <Input
                                prefix={<UserOutlined style={{ color: "var(--muted)" }} />}
                                placeholder="Masukkan username"
                                className="um-modal-input"
                                disabled={!!editing}
                            />
                        </Form.Item>
                    </Col>
                    <Col xs={24} sm={12}>
                        <Form.Item
                            name="full_name"
                            label="Nama Lengkap"
                            rules={[{ required: true, message: "Nama lengkap wajib diisi" }]}
                            tooltip="Nama lengkap pengguna"
                        >
                            <Input
                                placeholder="Masukkan nama lengkap"
                                className="um-modal-input"
                            />
                        </Form.Item>
                    </Col>
                </Row>

                <Row gutter={16}>
                    <Col xs={24} sm={12}>
                        <Form.Item
                            name="role_ids"
                            label="Role"
                            rules={[{ required: true, message: "Pilih minimal satu role" }]}
                            tooltip="Hak akses pengguna"
                        >
                            <Select
                                mode="multiple"
                                placeholder="Pilih role"
                                options={roleOptions}
                                className="um-modal-input"
                                loading={rolesLoading}
                                notFoundContent={rolesLoading ? "Memuat..." : "Tidak ada role"}
                            />
                        </Form.Item>
                    </Col>
                </Row>

                <Row gutter={16}>
                    {editing && (
                        <Col xs={24} sm={12}>
                            <Form.Item
                                name="password"
                                label="Password Baru (kosongkan jika tidak diubah)"
                                rules={[]}
                                tooltip="Biarkan kosong jika tidak ingin mengubah password"
                            >
                                <Input.Password
                                    placeholder="Biarkan kosong jika tidak diubah"
                                    className="um-modal-input"
                                />
                            </Form.Item>
                        </Col>
                    )}
                    <Col xs={24} sm={editing ? 12 : 24}>
                        <Form.Item
                            name="is_active"
                            label="Status Aktif"
                            valuePropName="checked"
                            initialValue={true}
                            tooltip="Nonaktifkan untuk menonaktifkan akses pengguna"
                        >
                            <Switch checkedChildren="Active" unCheckedChildren="Inactive" />
                        </Form.Item>
                    </Col>
                </Row>

                <div className="um-modal-footer">
                    <Button onClick={onCancel}>Batal</Button>
                    <Button
                        type="primary"
                        htmlType="submit"
                        loading={submitting}
                        className="btn-primary-gradient"
                    >
                        {editing ? "Simpan Perubahan" : "Tambah Pengguna"}
                    </Button>
                </div>
            </Form>
        </Modal>
    );
});

export default UserFormModal;