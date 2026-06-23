// fe\src\modules\itam\assets\hooks\useAssetPageState.js
import {
 useState,
} from "react";

export default function useAssetPageState() {
 const [open, setOpen] =
  useState(false);

 const [editing, setEditing] =
  useState(null);

 const [
  previewOpen,
  setPreviewOpen,
 ] = useState(false);

 const [
  previewRows,
  setPreviewRows,
 ] = useState([]);

 const [headerFilters, setHeaderFilters] =
  useState({
   asset_code: "",
   asset_name: "",
   type: "",
   division: "",
   department: "",
   owner_name: "",
   nik: "",
   purchase_date: "",
   depreciation_date: "",
   hostname: "",
   ip_main: "",
   ip_backup: "",
   status: "",
  });

 const setHeaderFilter = (
  key,
  value
 ) =>
  setHeaderFilters(
   (prev) => ({
    ...prev,
    [key]: value,
   })
  );

 return {
  open,
  setOpen,

  editing,
  setEditing,

  previewOpen,
  setPreviewOpen,

  previewRows,
  setPreviewRows,

  headerFilters,
  setHeaderFilters,
  setHeaderFilter,
 };
}
