import { useState, useEffect, useCallback } from "react";
import { Card, Button, Input, Flex, Modal } from "antd";
import {
    PlusOutlined,
    ReloadOutlined,
    SearchOutlined,
} from "@ant-design/icons";
import toast from "react-hot-toast";

import "./UserManagement.css";
import userService from "./services/userService";
import UserTable from "./components/UserTable";
import UserFormModal from "./components/UserFormModal";

export default function UserManagementPage() {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [search, setSearch] = useState("");
    const [modalOpen, setModalOpen] = useState(false);
    const [editing, setEditing] = useState(null);
    const [submitting, setSubmitting] = useState(false);

    const fetchData = useCallback(
        async (p = page, ps = pageSize, s = search) => {
            setLoading(true);
            try {
                const res = await userService.getAll({
                    page: p,
                    pageSize: ps,
                    search: s,
                });
                setData(res.data || []);
                setTotal(res.meta?.total || 0);
                setPage(res.meta?.page || 1);
                setPageSize(res.meta?.pageSize || 10);
            } catch (err) {
                toast.error(err.message || "Gagal memuat data pengguna");
            } finally {
                setLoading(false);
            }
        },
        [page, pageSize, search]
    );

    useEffect(() => {
        fetchData(1, pageSize, search);
    }, []);

    const handleSearch = useCallback(
        (value) => {
            setSearch(value);
            fetchData(1, pageSize, value);
        },
        [pageSize, fetchData]
    );

    const handleTableChange = useCallback(
        (pagination) => {
            fetchData(pagination.current, pagination.pageSize, search);
        },
        [search, fetchData]
    );

    const handleRefresh = useCallback(() => {
        fetchData(page, pageSize, search);
    }, [page, pageSize, search, fetchData]);

    const openCreate = useCallback(() => {
        setEditing(null);
        setModalOpen(true);
    }, []);

    const openEdit = useCallback((record) => {
        setEditing(record);
        setModalOpen(true);
    }, []);

    const closeModal = useCallback(() => {
        setModalOpen(false);
        setEditing(null);
    }, []);

    const handleSubmit = useCallback(
        async (values) => {
            setSubmitting(true);
            try {
                if (editing) {
                    await userService.update(editing.user_id, values);
                    toast.success("Pengguna berhasil diperbarui");
                } else {
                    const res = await userService.create(values);
                    Modal.info({
                        title: 'User Baru Berhasil Dibuat',
                        content: (
                            <div>
                                <p style={{ marginBottom: 8 }}><strong>Username:</strong> {res.data?.user?.username || values.username}</p>
                                <p style={{ marginBottom: 0 }}><strong>Password:</strong> <code style={{ background: '#f5f5f5', padding: '2px 6px', borderRadius: '4px', fontSize: '15px', color: '#d91e18', fontWeight: 'bold' }}>{res.data?.plaintextPassword}</code></p>
                            </div>
                        ),
                        okText: 'OK',
                    });
                }
                closeModal();
                fetchData(page, pageSize, search);
            } catch (err) {
                toast.error(err.message || "Operasi gagal");
            } finally {
                setSubmitting(false);
            }
        },
        [editing, page, pageSize, search, fetchData, closeModal]
    );

    const handleDelete = useCallback(
        async (id) => {
            try {
                await userService.remove(id);
                toast.success("Pengguna berhasil dihapus");
                fetchData(page, pageSize, search);
            } catch (err) {
                toast.error(err.message || "Gagal menghapus pengguna");
            }
        },
        [page, pageSize, search, fetchData]
    );

    const handleResetPassword = useCallback(
        async (id) => {
            try {
                const res = await userService.resetPassword(id);
                Modal.info({
                    title: 'Password Berhasil Direset',
                    content: (
                        <div>
                              <p>Silakan simpan informasi login baru berikut:</p>
                              <p style={{ marginBottom: 8 }}><strong>Username:</strong> {res.data?.user?.username}</p>
                              <p style={{ marginBottom: 0 }}><strong>Password:</strong> <code style={{ background: '#f5f5f5', padding: '2px 6px', borderRadius: '4px', fontSize: '15px', color: '#d91e18', fontWeight: 'bold' }}>{res.data?.plaintextPassword}</code></p>
                        </div>
                    ),
                    okText: 'OK',
                });
            } catch (err) {
                toast.error(err.message || "Gagal mereset password");
            }
        },
        []
    );

    return (
        <div className="page-shell">
            {/* PAGE HEADER */}
            <div className="dashboard-page-head um-page-head">
                <div>
                    <h1 className="dashboard-page-title">Manajemen Pengguna</h1>
                    <div className="dashboard-page-subtitle">
                        Kelola semua pengguna aplikasi, atur role dan hak akses
                    </div>
                </div>
                <div className="dashboard-actions">
                    <Button
                        icon={<ReloadOutlined />}
                        loading={loading}
                        onClick={handleRefresh}
                    >
                        Refresh
                    </Button>
                    <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={openCreate}
                        className="btn-primary-gradient"
                    >
                        Tambah Pengguna
                    </Button>
                </div>
            </div>

            <Card variant="borderless">
                <Flex
                    justify="space-between"
                    align="center"
                    wrap="wrap"
                    gap="middle"
                    className="um-card-body"
                >
                    <div className="um-search-wrap">
                        <Input.Search
                            placeholder="Cari username, nama, atau email..."
                            allowClear
                            onSearch={handleSearch}
                            prefix={<SearchOutlined style={{ color: "var(--muted)" }} />}
                        />
                    </div>
                </Flex>

                <UserTable
                    data={data}
                    loading={loading}
                    page={page}
                    pageSize={pageSize}
                    total={total}
                    onEdit={openEdit}
                    onDelete={handleDelete}
                    onResetPassword={handleResetPassword}
                    onChange={handleTableChange}
                />
            </Card>

            <UserFormModal
                open={modalOpen}
                editing={editing}
                submitting={submitting}
                onCancel={closeModal}
                onSubmit={handleSubmit}
            />
        </div>
    );
}