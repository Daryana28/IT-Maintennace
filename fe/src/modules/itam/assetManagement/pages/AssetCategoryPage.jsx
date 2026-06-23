import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Card, Form, Button, Input, Space, message } from "antd";
import { PlusOutlined, ReloadOutlined, SearchOutlined } from "@ant-design/icons";
import assetService from "../services/assetService";
import { usePageHeader } from "@/layouts/MainLayout/MainLayout";
import CategoryTable from "../components/CategoryTable";
import CategoryFormModal from "../components/CategoryFormModal";
import CategoryTransferModal from "../components/CategoryTransferModal";
import {
  normalizeCategoryName as normalizeName,
  syncAssetCategoryStructure,
} from "../utils/categoryStructure";

const LEGACY_ROOT_NAMES = new Set(["software", "networking", "cyber"]);
const isHardwareRootCategory = (row) => !row?.parent_id && normalizeName(row.category_name) === "hardware";
const isLegacyRootCategory = (row) => !row?.parent_id && LEGACY_ROOT_NAMES.has(normalizeName(row.category_name));

export default function AssetCategoryPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [transferModalOpen, setTransferModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [form] = Form.useForm();
  const [transferForm] = Form.useForm();
  
  // Search query state
  const [searchQuery, setSearchQuery] = useState("");
  
  // Expanded row keys state
  const [expandedRowKeys, setExpandedRowKeys] = useState([]);
  
  const { setHeaderBreadcrumb, setHeaderTitle, setHeaderSubtitle } = usePageHeader() || {};
  const structureSyncedRef = React.useRef(false);

  const formatCategoryName = useCallback((row) => row?.category_name || "-", []);
  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      // Fetch all categories including inactive ones
      const data = await assetService.getCategories({ all: true });
      const rows = Array.isArray(data) ? data : [];

      if (!structureSyncedRef.current) {
        structureSyncedRef.current = true;
        const result = await syncAssetCategoryStructure(assetService, rows);
        if (result.changed) {
          setCategories(Array.isArray(result.rows) ? result.rows : []);
          return;
        }
      }

      setCategories(rows);
    } catch {
      message.error("Failed to load categories");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timerId = window.setTimeout(() => {
      void loadData();
    }, 0);

    return () => window.clearTimeout(timerId);
  }, [loadData]);

  // Filter categories by search query while maintaining hierarchy paths
  const filteredCategories = useMemo(() => {
    const visibleCategories = categories.filter(
      (row) => !isLegacyRootCategory(row)
    );

    if (!searchQuery) return visibleCategories;
    const q = searchQuery.toLowerCase();
    const matchedIds = new Set();
    
    visibleCategories.forEach((c) => {
      if (
        c.category_name.toLowerCase().includes(q) ||
        String(c.category_id).includes(q)
      ) {
        matchedIds.add(c.category_id);
        // Backtrace parent hierarchy path
        let pid = c.parent_id;
        while (pid) {
          matchedIds.add(pid);
          const parentNode = visibleCategories.find((x) => x.category_id === pid);
          pid = parentNode ? parentNode.parent_id : null;
        }
      }
    });

    return visibleCategories.filter((c) => matchedIds.has(c.category_id));
  }, [categories, searchQuery]);

  // Convert flat categories list to tree structure for Ant Design Table
  const treeData = useMemo(() => {
    const map = {};
    const roots = [];
    const visibleIdSet = new Set(filteredCategories.map((node) => String(node.category_id)));
    const hardwareRoot = filteredCategories.find((node) => isHardwareRootCategory(node));
    const getVisibleParentId = (node) => {
      let currentParentId = node.parent_id;

      while (currentParentId) {
        if (visibleIdSet.has(String(currentParentId))) {
          return currentParentId;
        }

        const parentNode = categories.find(
          (item) => String(item.category_id) === String(currentParentId)
        );
        currentParentId = parentNode?.parent_id || null;
      }

      if (hardwareRoot && Number(node.level_no || 1) > 1) {
        return hardwareRoot.category_id;
      }

      return null;
    };

    filteredCategories.forEach((node) => {
      map[node.category_id] = { ...node, key: String(node.category_id), children: [] };
    });

    filteredCategories.forEach((node) => {
      const mappedNode = map[node.category_id];
      const visibleParentId = getVisibleParentId(node);

      if (visibleParentId) {
        const parent = map[visibleParentId];
        if (parent) {
          parent.children.push(mappedNode);
        } else {
          roots.push(mappedNode);
        }
      } else {
        roots.push(mappedNode);
      }
    });

    const cleanEmptyChildren = (nodes) => {
      nodes.forEach((node) => {
        if (node.children.length === 0) {
          delete node.children;
        } else {
          node.children.sort((a, b) => (a.sort_no || 0) - (b.sort_no || 0));
          cleanEmptyChildren(node.children);
        }
      });
    };

    roots.sort((a, b) => (a.sort_no || 0) - (b.sort_no || 0));
    cleanEmptyChildren(roots);
    return roots;
  }, [categories, filteredCategories]);

  const prevSearchQuery = React.useRef(searchQuery);

  // Auto expand rows based on search
  useEffect(() => {
    const timerId = window.setTimeout(() => {
      if (searchQuery) {
        const matchedParentIds = [];
        filteredCategories.forEach((c) => {
          const hasChildren = filteredCategories.some((child) => child.parent_id === c.category_id);
          if (hasChildren) {
            matchedParentIds.push(String(c.category_id));
          }
        });
        setExpandedRowKeys(matchedParentIds);
      } else if (prevSearchQuery.current !== "") {
        // Hanya reset (collapse) jika sebelumnya ada pencarian dan sekarang di-clear
        setExpandedRowKeys([]);
      }
      prevSearchQuery.current = searchQuery;
    }, 0);

    return () => window.clearTimeout(timerId);
  }, [searchQuery, filteredCategories]);

  const handleExpandAll = () => {
    const idsToExpand = categories
      .filter((c) => categories.some((child) => child.parent_id === c.category_id))
      .map((c) => String(c.category_id));
    setExpandedRowKeys(idsToExpand);
  };

  const handleCollapseAll = () => {
    setExpandedRowKeys([]);
  };

  const handleExpandedRowsChange = (keys) => {
    setExpandedRowKeys(keys);
  };

  // Generate options for parent categories select box
  const parentOptions = useMemo(() => {
    // 1. Filter out invalid parent choices first
    const validParentNodes = categories.filter((c) => {
      if (isLegacyRootCategory(c)) {
        return false;
      }
      // Exclude the current editing category to prevent cycles
      if (editingCategory && String(c.category_id) === String(editingCategory.category_id)) {
        return false;
      }
      // Must be active
      if (!c.is_active) {
        return false;
      }
      // Cannot select level 4 as a parent because maximum level is 4
      if (Number(c.level_no || 1) >= 4) {
        return false;
      }
      return true;
    });

    const validParentIds = new Set(validParentNodes.map((c) => c.category_id));

    // 2. Build full tree of active categories for DFS traversal
    const map = {};
    const roots = [];

    categories.forEach((node) => {
      if (node.is_active && !isLegacyRootCategory(node)) {
        map[node.category_id] = { ...node, children: [] };
      }
    });

    categories.forEach((node) => {
      if (node.is_active && !isLegacyRootCategory(node)) {
        const mappedNode = map[node.category_id];
        if (node.parent_id) {
          const parent = map[node.parent_id];
          if (parent) {
            parent.children.push(mappedNode);
          } else {
            roots.push(mappedNode);
          }
        } else {
          roots.push(mappedNode);
        }
      }
    });

    // Recursively sort children
    const sortTree = (nodes) => {
      nodes.sort((a, b) => (a.sort_no || 0) - (b.sort_no || 0));
      nodes.forEach((n) => sortTree(n.children));
    };
    sortTree(roots);

    // 3. Perform pre-order DFS to flatten with indentation
    const flatList = [];
    const traverse = (nodes) => {
      nodes.forEach((node) => {
        if (validParentIds.has(node.category_id)) {
          flatList.push(node);
        }
        if (node.children && node.children.length > 0) {
          traverse(node.children);
        }
      });
    };
    traverse(roots);

    // 4. Map to options with indentation prefix
    return flatList.map((c) => {
      const level = Number(c.level_no || 1);
      const prefix = level > 1 ? "\u00A0\u00A0".repeat(level - 1) + "└─ " : "";
      return {
        value: String(c.category_id),
        label: `${prefix}${formatCategoryName(c)} (${c.category_id})`,
      };
    });
  }, [categories, editingCategory, formatCategoryName]);

  const handleOpenCreate = () => {
    setEditingCategory(null);
    form.resetFields();
    form.setFieldsValue({
      is_subcategory: false,
      sort_no: 0,
      is_active: true,
      show_in_tabs: true,
    });
    setModalOpen(true);
  };

  const handleOpenAddSub = (parentRow) => {
    setEditingCategory(null);
    form.resetFields();
    form.setFieldsValue({
      is_subcategory: true,
      parent_id: String(parentRow.category_id),
      sort_no: 0,
      is_active: true,
    });
    setModalOpen(true);
  };

  const handleOpenEdit = (row) => {
    setEditingCategory(row);
    form.resetFields();
    form.setFieldsValue({
      category_name: row.category_name,
      is_subcategory: !!row.parent_id,
      parent_id: row.parent_id ? String(row.parent_id) : undefined,
      sort_no: Number(row.sort_no || 0),
      is_active: !!row.is_active,
      show_in_tabs: row.show_in_tabs !== undefined ? !!row.show_in_tabs : true,
    });
    setModalOpen(true);
  };

  const handleOpenTransfer = (row) => {
    setEditingCategory(row);
    transferForm.setFieldsValue({
      parent_id: row.parent_id ? String(row.parent_id) : undefined,
    });
    setTransferModalOpen(true);
  };

  const handleTransferSave = async () => {
    try {
      const values = await transferForm.validateFields();
      const parentNode = categories.find((c) => String(c.category_id) === String(values.parent_id));
      const newLevel = parentNode ? Number(parentNode.level_no || 1) + 1 : 1;

      await assetService.updateCategory(editingCategory.category_id, {
        category_name: editingCategory.category_name,
        parent_id: values.parent_id ? Number(values.parent_id) : null,
        level_no: newLevel,
        is_active: !!editingCategory.is_active,
        sort_no: Number(editingCategory.sort_no || 0),
        show_in_tabs: !!editingCategory.show_in_tabs,
      });
      message.success("Category moved successfully");
      setTransferModalOpen(false);
      loadData();
    } catch {
      message.error("Failed to move category");
    }
  };

  const handlePromote = async (row) => {
    try {
      // Dapatkan parent dari kategori saat ini
      const parentNode = categories.find(c => c.category_id === row.parent_id);
      const newParentId = parentNode?.parent_id || null;
      const newLevel = Math.max(1, Number(row.level_no) - 1);

      await assetService.updateCategory(row.category_id, {
        category_name: row.category_name,
        parent_id: newParentId,
        level_no: newLevel,
        is_active: !!row.is_active,
        sort_no: Number(row.sort_no || 0),
        show_in_tabs: !!row.show_in_tabs
      });
      message.success("Category promoted successfully");
      loadData();
    } catch {
      message.error("Failed to promote category");
    }
  };

  const handleDemote = async (row) => {
    try {
      // Cari sibling sebelumnya
      const siblings = categories
        .filter(c => c.parent_id === row.parent_id)
        .sort((a, b) => (a.sort_no || 0) - (b.sort_no || 0));
      
      const currentIndex = siblings.findIndex(s => s.category_id === row.category_id);
      
      if (currentIndex > 0) {
        const previousSibling = siblings[currentIndex - 1];
        
        await assetService.updateCategory(row.category_id, {
          category_name: row.category_name,
          parent_id: previousSibling.category_id,
          level_no: Number(row.level_no) + 1,
          is_active: !!row.is_active,
          sort_no: Number(row.sort_no || 0),
          show_in_tabs: !!row.show_in_tabs
        });
        message.success("Category demoted successfully");
        loadData();
      } else {
        message.warning("No sibling above to demote to.");
      }
    } catch {
      message.error("Failed to demote category");
    }
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      
      // Calculate level_no automatically based on parent choice
      let level_no = 1;
      let parent_id = null;
      
      if (values.is_subcategory && values.parent_id) {
        const parentNode = categories.find((c) => String(c.category_id) === String(values.parent_id));
        if (parentNode) {
          level_no = Number(parentNode.level_no || 1) + 1;
          parent_id = Number(values.parent_id);
        }
      }

      const payload = {
        category_name: values.category_name,
        show_in_tabs: !!values.show_in_tabs,
        parent_id,
        level_no,
        sort_no: Number(values.sort_no || 0),
        is_active: !!values.is_active,
      };

      if (editingCategory) {
        await assetService.updateCategory(editingCategory.category_id, payload);
        message.success("Category updated successfully");
      } else {
        await assetService.createCategory(payload);
        message.success("Category created successfully");
      }

      setModalOpen(false);
      loadData();
    } catch (error) {
      if (error?.response?.data?.message) {
        message.error(error.response.data.message);
      } else {
        message.error("Failed to save category");
      }
    }
  };

  const handleDelete = async (id) => {
    try {
      await assetService.removeCategory(id);
      message.success("Category deleted successfully");
      loadData();
    } catch (error) {
      const errorMsg = error?.response?.data?.message || "Failed to delete category";
      message.error(errorMsg);
    }
  };

  // Set Page Header Details
  useEffect(() => {
    if (setHeaderBreadcrumb) setHeaderBreadcrumb("Asset Management > Manage Categories");
    if (setHeaderTitle) setHeaderTitle("Manage Categories");
    if (setHeaderSubtitle) {
      setHeaderSubtitle("Atur struktur kategori asset, termasuk pemindahan kategori ke group baru.");
    }
  }, [setHeaderBreadcrumb, setHeaderTitle, setHeaderSubtitle]);

  return (
    <div className="page-shell category-page-container">
      {/* TABLE SECTION */}
      <Card
        variant="borderless"
        className="category-card category-card-body-override"
      >
        <div className="category-toolbar-row">
          <div className="category-toolbar-left">
            <Input
              prefix={<SearchOutlined />}
              placeholder="Search category ID or name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="category-search-input"
              allowClear
            />
          </div>
          <div className="category-toolbar-right">
            <Space size="middle">
              <Button onClick={handleExpandAll} disabled={categories.length === 0}>
                Expand All
              </Button>
              <Button onClick={handleCollapseAll} disabled={categories.length === 0}>
                Collapse All
              </Button>
              <Button
                icon={<ReloadOutlined />}
                onClick={loadData}
                loading={loading}
                className="category-refresh-btn"
              >
                Refresh
              </Button>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={handleOpenCreate}
                className="category-add-btn"
              >
                Add Category
              </Button>
            </Space>
          </div>
        </div>

        <CategoryTable
          loading={loading}
          dataSource={treeData}
          expandedRowKeys={expandedRowKeys}
          onExpandedRowsChange={handleExpandedRowsChange}
          onAddSub={handleOpenAddSub}
          onEdit={handleOpenEdit}
          onDelete={handleDelete}
          onPromote={handlePromote}
          onDemote={handleDemote}
          onTransfer={handleOpenTransfer}
          formatCategoryName={formatCategoryName}
        />
      </Card>

      {/* CREATE / EDIT DIALOG */}
      <CategoryFormModal
        open={modalOpen}
        editingCategory={editingCategory}
        form={form}
        parentOptions={parentOptions}
        onCancel={() => setModalOpen(false)}
        onSave={handleSave}
      />
      
      {/* TRANSFER DIALOG */}
      <CategoryTransferModal
        open={transferModalOpen}
        editingCategory={editingCategory}
        form={transferForm}
        parentOptions={parentOptions}
        onCancel={() => setTransferModalOpen(false)}
        onSave={handleTransferSave}
      />
    </div>
  );
}
