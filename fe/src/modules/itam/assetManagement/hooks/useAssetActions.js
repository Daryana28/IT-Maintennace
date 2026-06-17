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
    } catch {
     message.error(
      "Delete failed"
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
    } catch {
     message.error(
      "Save failed"
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
     await assetService.bulkImport(
      previewRows
     );

     message.success(
      "Import success"
     );

     setPreviewOpen(false);
     setPreviewRows([]);

     reload();
    } catch (err) {
     console.error(err);
     message.error(
      "Import failed"
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