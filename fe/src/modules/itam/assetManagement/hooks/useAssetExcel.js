// fe\src\modules\itam\assets\hooks\useAssetExcel.js
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

export default function useAssetExcel() {
  const exportExcel = (
    rows = []
  ) => {
    const data =
      rows.map(
        (
          item,
          index
        ) => ({
          "NO ASSET": item.asset_code,
          "NAMA ASET": item.asset_name,
          TYPE: item.category?.category_name || "-",
          DIVISI: item.division,
          DEPT: item.department,
          "NAMA PIC": item.owner_name,
          NIK: item.nik,
          PEMBELIAN: item.purchase_date,
          "DEPRESIASI (5+1 Th)": item.depreciation_date,
          HOSTNAME: item.hostname,
          "IP ADDRESS MAIN": item.ip_main,
          "IP ADDRESS BACKUP": item.ip_backup,
          STATUS: item.status,
        })
      );

    const ws =
      XLSX.utils.json_to_sheet(
        data
      );

    const wb =
      XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(
      wb,
      ws,
      "Assets"
    );

    const buffer =
      XLSX.write(
        wb,
        {
          bookType:
            "xlsx",
          type:
            "array",
        }
      );

    saveAs(
      new Blob([
        buffer,
      ]),
      `asset-report-${Date.now()}.xlsx`
    );
  };

  const downloadTemplate =
    () => {
      const ws =
        XLSX.utils.json_to_sheet(
          [
            {
              "NO ASSET": "",
              "NAMA ASET": "",
              TYPE: "",
              DIVISI: "",
              DEPT: "",
              "NAMA PIC": "",
              NIK: "",
              PEMBELIAN: "",
              "DEPRESIASI (5+1 Th)": "",
              HOSTNAME: "",
              "IP ADDRESS MAIN": "",
              "IP ADDRESS BACKUP": "",
              STATUS: "ACTIVE",
            },
          ]
        );

      const wb =
        XLSX.utils.book_new();

      XLSX.utils.book_append_sheet(
        wb,
        ws,
        "Template"
      );

      const buffer =
        XLSX.write(
          wb,
          {
            bookType:
              "xlsx",
            type:
              "array",
          }
        );

      saveAs(
        new Blob([
          buffer,
        ]),
        "asset-template.xlsx"
      );
    };

  const readExcel =
    async (file) => {
      const buffer =
        await file.arrayBuffer();

      const wb =
        XLSX.read(
          buffer,
          { cellDates: true }
        );

      const ws =
        wb.Sheets[
          wb.SheetNames[0]
        ];

      const rows = XLSX.utils.sheet_to_json(
        ws,
        { raw: false, dateNF: "yyyy-mm-dd" }
      );

      return rows
        .map((row) => ({
          ...row,
          asset_code: row.asset_tag || row.asset_code || row["NO ASSET"],
          asset_name: row.asset_name || row["NAMA ASET"] || row.TYPE,
          division: row.division || row.DIVISI,
          department: row.department || row.DEPT,
          owner_name: row.owner_name || row["NAMA PIC"] || row.NAMA,
          nik: row.nik || row.NIK,
          purchase_date: row.purchase_date || row.PEMBELIAN,
          depreciation_date: row.depreciation_date || row["DEPRESIASI (5+1 Th)"],
          hostname: row.hostname || row.HOSTNAME,
          ip_main: row.ip_main || row["IP ADDRESS MAIN"],
          ip_backup: row.ip_backup || row["IP ADDRESS BACKUP"],
          status: row.status || row.STATUS || "ACTIVE",
        }))
        .filter((row) => row.asset_code);
    };

  return {
    exportExcel,
    downloadTemplate,
    readExcel,
  };
}