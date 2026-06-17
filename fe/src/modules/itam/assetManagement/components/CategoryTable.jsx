import React from "react";
import { Table, Tag, Button, Space, Popconfirm, Tooltip } from "antd";
import { NodeIndexOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";

export default function CategoryTable({
  loading,
  dataSource,
  expandedRowKeys,
  onExpandedRowsChange,
  onAddSub,
  onEdit,
  onDelete,
}) {
  const renderLevelTag = (level) => {
    const num = Number(level || 1);
    return (
      <Tag className={`category-level-tag level-${num}`}>
        Level {num}
      </Tag>
    );
  };

  const columns = [

    {
      title: "CATEGORY NAME",
      dataIndex: "category_name",
      key: "category_name",
      width: 320,
      render: (text) => <span className="category-name-text">{text}</span>,
    },
    {
      title: "LEVEL",
      dataIndex: "level_no",
      key: "level_no",
      width: 120,
      align: "center",
      render: (level) => renderLevelTag(level),
    },
    {
      title: "ORDER NO",
      dataIndex: "sort_no",
      key: "sort_no",
      width: 120,
      align: "center",
      render: (text) => <span className="category-name-text">{text}</span>,
    },
    {
      title: "TAB GROUP",
      dataIndex: "show_in_tabs",
      key: "show_in_tabs",
      width: 140,
      align: "center",
      render: (show) => (show === false || show === 0 || show === '0' || show === 'false') ? <Tag color="default">TIDAK</Tag> : <Tag color="blue">YA</Tag>,
    },
    {
      title: "STATUS",
      dataIndex: "is_active",
      key: "is_active",
      width: 140,
      align: "center",
      render: (active) => (
        <Tag className={`category-status-tag ${active ? "active" : "inactive"}`}>
          {active ? "ACTIVE" : "INACTIVE"}
        </Tag>
      ),
    },
    {
      title: "ACTION",
      key: "action",
      width: 180,
      align: "center",
      render: (_, row) => (
        <Space size="small">
          {Number(row.level_no) < 4 && (
            <Tooltip title="Add Sub-Category">
              <Button
                type="text"
                icon={<NodeIndexOutlined className="category-name-text" />}
                onClick={() => onAddSub(row)}
              />
            </Tooltip>
          )}
          <Tooltip title="Edit Category">
            <Button
              type="text"
              icon={<EditOutlined className="category-name-text" />}
              onClick={() => onEdit(row)}
            />
          </Tooltip>
          <Popconfirm
            title="Delete this category?"
            description="This will permanently delete the category if no assets or subcategories are attached."
            onConfirm={() => onDelete(row.category_id)}
            okText="Yes"
            cancelText="No"
          >
            <Tooltip title="Delete Category">
              <Button
                type="text"
                danger
                icon={<DeleteOutlined />}
              />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <Table
      className="category-table"
      columns={columns}
      dataSource={dataSource}
      loading={loading}
      pagination={false}
      bordered
      size="middle"
      expandable={{
        expandedRowKeys,
        onExpandedRowsChange,
        expandIcon: ({ expanded, onExpand, record }) => {
          if (!record.children || record.children.length === 0) {
            return <span className="category-expand-spacer" />;
          }
          return (
            <span
              onClick={(e) => onExpand(record, e)}
              className="category-expand-btn"
            >
              {expanded ? "−" : "+"}
            </span>
          );
        },
      }}
    />
  );
}
