// fe/src/modules/itam/assets/hooks/useAsset.js
import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import { message } from "antd";
import assetService from "../services/assetService";

export default function useAsset() {
  const [rows, setRows] = useState([]);
  const [categories, setCategories] =
    useState([]);
  const [loading, setLoading] =
    useState(false);

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] =
    useState(20);
  const [total, setTotal] = useState(0);

  const [filters, setFilters] =
    useState({
      search: "",
      status: "",
      category_id: "",
    });

  const requestIdRef = useRef(0);

  const loadCategories =
    useCallback(async () => {
      try {
        const data =
          await assetService.getCategories();

        setCategories(
          Array.isArray(data) ? data : []
        );
      } catch {
        message.error(
          "Failed to load categories"
        );
      }
    }, []);

  const loadData = useCallback(
    async (
      nextPage = 1,
      nextPageSize = 20,
      nextFilters = filters
    ) => {
      const requestId =
        ++requestIdRef.current;

      setLoading(true);

      try {
        const assetData =
          await assetService.getAll({
            page: nextPage,
            pageSize: nextPageSize,
            search:
              nextFilters.search,
            status:
              nextFilters.status,
            exclude_status:
              nextFilters.exclude_status,
            category_id:
              nextFilters.category_id,
          });

        if (
          requestId !==
          requestIdRef.current
        ) {
          return;
        }

        setRows(
          Array.isArray(
            assetData?.data
          )
            ? assetData.data
            : []
        );

        setTotal(
          Number(
            assetData?.meta?.total
          ) || 0
        );

        setPage(nextPage);
        setPageSize(nextPageSize);
        setFilters(nextFilters);
      } catch {
        if (
          requestId ===
          requestIdRef.current
        ) {
          message.error(
            "Failed to load assets"
          );
        }
      } finally {
        if (
          requestId ===
          requestIdRef.current
        ) {
          setLoading(false);
        }
      }
    },
    [filters]
  );

  useEffect(() => {
    loadCategories();
    loadData(1, 20, filters);
  }, []);

  const reload = useCallback(
    (
      nextPage = page,
      nextPageSize = pageSize,
      nextFilters = filters
    ) =>
      loadData(
        nextPage,
        nextPageSize,
        nextFilters
      ),
    [
      loadData,
      page,
      pageSize,
      filters,
    ]
  );

  const saveAsset =
    useCallback(
      async (payload) => {
        try {
          if (payload?.asset_id) {
            await assetService.update(
              payload.asset_id,
              payload
            );
          } else {
            await assetService.create(
              payload
            );
          }

          await reload();
        } catch {
          message.error(
            "Failed to save asset"
          );
        }
      },
      [reload]
    );

  const removeAsset =
    useCallback(
      async (id) => {
        try {
          await assetService.remove(id);
          await reload();
        } catch {
          message.error(
            "Failed to delete asset"
          );
        }
      },
      [reload]
    );

  return {
    rows,
    categories,
    loading,
    page,
    pageSize,
    total,
    filters,
    reload,
    saveAsset,
    removeAsset,
  };
}