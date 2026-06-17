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

 const [keyword, setKeyword] =
  useState("");

 const [status, setStatus] =
  useState("");

 return {
  open,
  setOpen,

  editing,
  setEditing,

  previewOpen,
  setPreviewOpen,

  previewRows,
  setPreviewRows,

  keyword,
  setKeyword,

  status,
  setStatus,
 };
}