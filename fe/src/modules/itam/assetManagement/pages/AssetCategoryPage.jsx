import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Card, Form, Button, Input, Space, message } from "antd";
import { PlusOutlined, ReloadOutlined, SearchOutlined } from "@ant-design/icons";
import assetService from "../services/assetService";
import { usePageHeader } from "@/layouts/MainLayout/MainLayout";
import CategoryTable from "../components/CategoryTable";
import CategoryFormModal from "../components/CategoryFormModal";

export default function AssetCategoryPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [form] = Form.useForm();
  
  // Search query state
  const [searchQuery, setSearchQuery] = useState("");
  
  // Expanded row keys state
  const [expandedRowKeys, setExpandedRowKeys] = useState([]);
  
  const { setHeaderTitle, setHeaderSubtitle } = usePageHeader() || {};

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      // Fetch all categories including inactive ones
      const data = await assetService.getCategories({ all: true });
      setCategories(Array.isArray(data) ? data : []);
    } catch {
      message.error("Failed to load categories");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Filter categories by search query while maintaining hierarchy paths
  const filteredCategories = useMemo(() => {
    if (!searchQuery) return categories;
    const q = searchQuery.toLowerCase();
    const matchedIds = new Set();
    
    categories.forEach((c) => {
      if (
        c.category_name.toLowerCase().includes(q) ||
        String(c.category_id).includes(q)
      ) {
        matchedIds.add(c.category_id);
        // Backtrace parent hierarchy path
        let pid = c.parent_id;
        while (pid) {
          matchedIds.add(pid);
          const parentNode = categories.find((x) => x.category_id === pid);
          pid = parentNode ? parentNode.parent_id : null;
        }
      }
    });

    return categories.filter((c) => matchedIds.has(c.category_id));
  }, [categories, searchQuery]);

  // Convert flat categories list to tree structure for Ant Design Table
  const treeData = useMemo(() => {
    const map = {};
    const roots = [];

    filteredCategories.forEach((node) => {
      map[node.category_id] = { ...node, key: String(node.category_id), children: [] };
    });

    filteredCategories.forEach((node) => {
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
  }, [filteredCategories]);

  // Auto expand rows (especially after CRUD or when clearing search)
  useEffect(() => {
    if (searchQuery) {
      const matchedParentIds = [];
      filteredCategories.forEach((c) => {
        const hasChildren = filteredCategories.some((child) => child.parent_id === c.category_id);
        if (hasChildren) {
          matchedParentIds.push(String(c.category_id));
        }
      });
      setExpandedRowKeys(matchedParentIds);
    } else {
      // Auto expand all by default
      const idsToExpand = categories
        .filter((c) => categories.some((child) => child.parent_id === c.category_id))
        .map((c) => String(c.category_id));
      setExpandedRowKeys(idsToExpand);
    }
  }, [searchQuery, filteredCategories, categories]);

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
      if (node.is_active) {
        map[node.category_id] = { ...node, children: [] };
      }
    });

    categories.forEach((node) => {
      if (node.is_active) {
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
        label: `${prefix}${c.category_name} (${c.category_id})`,
      };
    });
  }, [categories, editingCategory]);

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
    if (setHeaderTitle) setHeaderTitle("Manage Categories");
    if (setHeaderSubtitle) {
      setHeaderSubtitle("Manage category hierarchy levels and sorting rules for assets.");
    }
  }, [setHeaderTitle, setHeaderSubtitle]);

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
    </div>
  );
}
