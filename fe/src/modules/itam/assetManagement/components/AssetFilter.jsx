// fe\src\modules\itam\assets\components\AssetFilter.jsx
import {
  memo,
  useEffect,
  useState,
} from "react";

import {
  Card,
  Col,
  Input,
  Row,
  Select,
} from "antd";

const FULL_WIDTH = {
  width: "100%",
};

const STATUS_OPTIONS = Object.freeze([
  {
    value: "ACTIVE",
    label: "Active",
  },
  {
    value: "STOCK",
    label: "In Stock",
  },
  {
    value: "MAINTENANCE",
    label: "Maintenance",
  },
  {
    value: "RETIRED",
    label: "Retired",
  },
]);

function AssetFilter({
  keyword,
  status,
  onKeywordChange,
  onStatusChange,
  statusOptions = STATUS_OPTIONS,
}) {
  const [search, setSearch] =
    useState(keyword);

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(keyword);
    }, 0);

    return () =>
      clearTimeout(timer);
  }, [keyword]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (search !== keyword) {
        onKeywordChange(search);
      }
    }, 400);

    return () =>
      clearTimeout(timer);
  }, [
    search,
    keyword,
    onKeywordChange,
  ]);

  return (
    <div className="asset-filter-bar">
      <Row
        gutter={[12, 12]}
      >
        <Col
          xs={24}
          md={14}
        >
          <Input
            allowClear
            value={search}
            placeholder="Search asset"
            onChange={(e) =>
              setSearch(
                e.target.value
              )
            }
          />
        </Col>

        <Col
          xs={24}
          md={10}
        >
          <Select
            allowClear
            style={FULL_WIDTH}
            value={
              status ||
              undefined
            }
            placeholder="Filter status"
            options={
              statusOptions
            }
            onChange={(v) =>
              onStatusChange(
                v || ""
              )
            }
          />
        </Col>
      </Row>
    </div>
  );
}

export default memo(
  AssetFilter
);
