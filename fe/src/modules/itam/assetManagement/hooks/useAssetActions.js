// fe\src\modules\itam\assets\hooks\useAssetActions.js
import {
 useCallback,
 useState,
} from "react";

import {
 message,
} from "antd";
import assetService from "../services/assetService";

export default function useAssetActions({
 editing,
 setEditing,
 setOpen,
 saveAsset,
 removeAsset,
 reload,
 loadCategories,
 setPreviewOpen,
 setPreviewRows,
 previewRows,
}) {
 const [isImporting, setIsImporting] = useState(false);

 const openCreate =
  useCallback(() => {
   setEditing(null);
   setOpen(true);
  }, [
   setEditing,
   setOpen,
  ]);

 const openEdit =
  useCallback(
   (row) => {
    setEditing(row);
    setOpen(true);
   },
   [
    setEditing,
    setOpen,
   ]
  );

 const closeModal =
  useCallback(() => {
   setOpen(false);
   setEditing(null);
  }, [
   setOpen,
   setEditing,
  ]);

 const onDelete =
  useCallback(
   async (row) => {
    try {
     await removeAsset(
      row.asset_id
     );

     message.success(
      "Asset deleted"
     );
    } catch (err) {
     const errorMessage =
      err?.response?.data?.message ||
      err?.message ||
      "Delete failed";
     message.error(
      errorMessage
     );
    }
   },
   [removeAsset]
  );

 const onSubmit =
  useCallback(
   async (values) => {
    try {
     await saveAsset({
      ...editing,
      ...values,
     });

     message.success(
      "Asset saved"
     );

     closeModal();
    } catch (err) {
     const errorMessage =
      err?.response?.data?.message ||
      err?.message ||
      "Save failed";
     message.error(
      errorMessage
     );
    }
   },
   [
    editing,
    saveAsset,
    closeModal,
   ]
  );

 const confirmImport =
  useCallback(
   async (
    assetService
   ) => {
    if (isImporting) return;
    setIsImporting(true);
   try {
     if (loadCategories) {
      await loadCategories();
     }

     await assetService.bulkImport(
      previewRows
     );

     message.success(
      "Import success"
     );

     setPreviewOpen(false);
     setPreviewRows([]);

     if (loadCategories) {
      await loadCategories();
     }

     reload();
    } catch (err) {
     console.error(err);
     const errorMessage =
      err?.response?.data?.message ||
      err?.message ||
      "Import failed";
     message.error(
      errorMessage
     );
    } finally {
     setIsImporting(false);
    }
   },
   [
    previewRows,
    reload,
    setPreviewOpen,
    setPreviewRows,
    isImporting,
   ]
  );

 const generateQr = useCallback(async (id) => {
  try {
   const res = await assetService.generateQr(id);
   message.success("QR Generated");
   return res;
  } catch (err) {
   message.error("QR failed");
  }
 }, []);

 return {
  openCreate,
  openEdit,
  closeModal,
  onDelete,
  onSubmit,
  confirmImport,
  generateQr,
  isImporting
 };
}
