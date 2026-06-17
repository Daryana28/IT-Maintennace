import { memo } from "react";
import { Table, Space, Tag, Button, Popconfirm } from "antd";
import { EditOutlined, DeleteOutlined } from "@ant-design/icons";

import UserAvatar from "./UserAvatar";

const ROLE_COLORS = {
    SUPERADMIN: "red",
    ADMIN: "blue",
    USER: "green",
    TECH: "orange",
    STAFF: "cyan",
    ASSET_STAFF: "geekblue",
    MAINTENANCE_STAFF: "volcano",
};

const UserTable = memo(function UserTable({
    data,
    loading,
    page,
    pageSize,
    total,
    onEdit,
    onDelete,
    onChange,
}) {
    const columns = [
        {
            title: "Username",
            dataIndex: "username",
            key: "username",
            width: 140,
            render: (text, record) => (
                <Space>
                    <UserAvatar
                        fullName={record.full_name}
                        username={record.username}
                    />
                    <span className="user-name">{text}</span>
                </Space>
            ),
        },
        {
            title: "Nama Lengkap",
            dataIndex: "full_name",
            key: "full_name",
            width: 200,
            ellipsis: true,
            render: (text) => <span className="text-fullname">{text || "-"}</span>,
        },
        {
            title: "Email",
            dataIndex: "email",
            key: "email",
            width: 220,
            ellipsis: true,
            render: (text) => <span className="text-email">{text}</span>,
        },
        {
            title: "Role",
            dataIndex: "roles",
            key: "roles",
            width: 180,
            render: (roles) => {
                if (!roles?.length) return <Tag>-</Tag>;
                return (
                    <Space size={4} wrap>
                        {roles.map((role) => (
                            <Tag
                                key={role.role_id}
                                color={ROLE_COLORS[role.role_name] || "default"}
                                className="user-tag"
                            >
                                {role.role_name}
                            </Tag>
                        ))}
                    </Space>
                );
            },
        },
        {
            title: "Status",
            dataIndex: "is_active",
            key: "is_active",
            width: 100,
            align: "center",
            render: (active) => (
                <Tag
                    color={active ? "green" : "red"}
                    className="user-tag"
                >
                    {active ? "Active" : "Inactive"}
                </Tag>
            ),
        },
        {
            title: "Aksi",
            key: "action",
            width: 140,
            align: "center",
            render: (_, record) => (
                <Space size="small">
                    <Button
                        type="link"
                        icon={<EditOutlined />}
                        onClick={() => onEdit(record)}
                        style={{ color: "var(--primary)" }}
                    />
                    <Popconfirm
                        title="Hapus pengguna ini?"
                        description="Tindakan ini tidak dapat dibatalkan."
                        onConfirm={() => onDelete(record.user_id)}
                        okText="Ya, hapus"
                        cancelText="Batal"
                        okButtonProps={{ danger: true }}
                    >
                        <Button type="link" danger icon={<DeleteOutlined />} />
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    return (
        <Table
            columns={columns}
            dataSource={data}
            rowKey="user_id"
            loading={loading}
            pagination={{
                current: page,
                pageSize,
                total,
                showSizeChanger: true,
                showTotal: (total, range) =>
                    `${range[0]}-${range[1]} dari ${total} pengguna`,
                pageSizeOptions: ["10", "20", "50"],
            }}
            onChange={onChange}
            scroll={{ x: 900 }}
        />
    );
});

export default UserTable;