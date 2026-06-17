import dayjs from "dayjs";

export const exportPDF = async (schedules, viewMode, message) => {
  if (viewMode !== "yearly") {
    message.info("Export PDF saat ini hanya tersedia untuk tampilan Yearly.");
    return;
  }

  try {
    const [{ default: jsPDF }, { default: autoTable }] = await Promise.all([
      import('jspdf'),
      import('jspdf-autotable')
    ]);

    // Format ekstra lebar (1600x600) untuk menampung 54 kolom
    const doc = new jsPDF('landscape', 'mm', [1600, 600]);
    const pageWidth = doc.internal.pageSize.getWidth();

    doc.setFont("helvetica", "bold");
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(24);
    doc.text("JADWAL MAINTENANCE TAHUNAN", pageWidth / 2, 20, { align: "center" });

    // Build headers
    const head1 = [
      { content: "No", rowSpan: 2, styles: { halign: 'center', valign: 'middle' } },
      { content: "Kategori", rowSpan: 2, styles: { halign: 'center', valign: 'middle' } },
      { content: "Sub Kategori", rowSpan: 2, styles: { halign: 'center', valign: 'middle' } },
      { content: "Perangkat", rowSpan: 2, styles: { halign: 'center', valign: 'middle' } },
      { content: "Jenis", rowSpan: 2, styles: { halign: 'center', valign: 'middle' } },
      { content: "Fungsi", rowSpan: 2, styles: { halign: 'center', valign: 'middle' } },
      { content: "Deskripsi", rowSpan: 2, styles: { halign: 'center', valign: 'middle' } },
      { content: "Pengecekan", rowSpan: 2, styles: { halign: 'center', valign: 'middle' } },
      { content: "Standard", rowSpan: 2, styles: { halign: 'center', valign: 'middle' } },
      { content: "Bagian", rowSpan: 2, styles: { halign: 'center', valign: 'middle' } },
      { content: "Metode", rowSpan: 2, styles: { halign: 'center', valign: 'middle' } },
      { content: "Alat", rowSpan: 2, styles: { halign: 'center', valign: 'middle' } },
      { content: "Periodik", rowSpan: 2, styles: { halign: 'center', valign: 'middle' } }
    ];
    const head2 = [];

    const monthsArr = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    monthsArr.forEach(m => {
      head1.push({ content: m, colSpan: 4, styles: { halign: 'center' } });
      head2.push("W1", "W2", "W3", "W4");
    });

    const head = [head1, head2];

    const body = schedules.map((item, index) => {
      const arr = [
        item.no || "-",
        item.kategori || "-",
        item.subKategori || "-",
        item.perangkat || "-",
        item.jenis || "-",
        item.fungsi || "-",
        item.deskripsi || "-",
        item.pengecekan || "-",
        item.standard || "-",
        item.bagian || "-",
        item.metode || "-",
        item.alat || "-",
        item.periodik || "-"
      ];
      
      const p = item.periodik?.toLowerCase() || "";
      
      monthsArr.forEach((m, mIndex) => {
        ["W1", "W2", "W3", "W4"].forEach((w, wIndex) => {
          let show = false;
          if (p.includes("hari") || p.includes("1 minggu")) {
             show = true;
          } else if (p.includes("2 minggu")) {
             if (wIndex % 2 === 0) show = true;
          } else {
             const startMonth = item.startDate ? dayjs(item.startDate).month() : 0;
             let showInMonth = false;
             if (p.includes("1 bulan")) showInMonth = true;
             else if (p.includes("3 bulan") && mIndex % 3 === startMonth % 3) showInMonth = true;
             else if (p.includes("6 bulan") && mIndex % 6 === startMonth % 6) showInMonth = true;
             else if (p.includes("1 tahun") && mIndex === startMonth) showInMonth = true;
  
             if (showInMonth && wIndex === 0) show = true;
          }
          arr.push(show ? "X" : ""); 
        });
      });
      
      arr._item = item;
      arr._index = index;
      return arr;
    });

    autoTable(doc, {
      head,
      body,
      startY: 30,
      styles: { fontSize: 10, cellPadding: 3, lineColor: [0, 0, 0], lineWidth: 0.1 },
      theme: 'grid',
      headStyles: { fillColor: [240, 240, 240], textColor: [0, 0, 0], fontStyle: 'bold' },
      willDrawCell: function(data) {
        if (data.row.section === 'body') {
          // Gantt Chart Blue cells
          if (data.column.index >= 8 && data.cell.raw === "X") {
            data.cell.styles.fillColor = [22, 119, 255]; // blue color
            data.cell.text = []; // Hide the text
          }

          // RowSpan merging logic
          if (!doc.firstRowOfPage) doc.firstRowOfPage = {};
          if (doc.firstRowOfPage[data.pageNumber] === undefined) {
            doc.firstRowOfPage[data.pageNumber] = data.row.index;
          }

          const groupKeys = [
            null, // Col 0 is No
            ['kategori'], // Col 1
            ['kategori', 'subKategori'], // Col 2
            ['kategori', 'subKategori', 'perangkat'], // Col 3
            ['kategori', 'subKategori', 'perangkat', 'jenis'], // Col 4
            ['kategori', 'subKategori', 'perangkat', 'jenis', 'fungsi'] // Col 5
          ];

          if (data.column.index >= 1 && data.column.index <= 5) {
            const keys = groupKeys[data.column.index];
            const rowIndex = data.row.raw._index;
            const record = data.row.raw._item;
            const prevRecord = rowIndex > 0 ? schedules[rowIndex - 1] : null;
            const nextRecord = rowIndex < schedules.length - 1 ? schedules[rowIndex + 1] : null;

            const isSameAsPrev = prevRecord && keys.every(k => prevRecord[k] === record[k]);
            const isSameAsNext = nextRecord && keys.every(k => nextRecord[k] === record[k]);
            const isFirstRowOnPage = doc.firstRowOfPage[data.pageNumber] === rowIndex;

            if (isSameAsPrev && !isFirstRowOnPage) {
              data.cell.text = []; 
            }

            let top = 0.1, bottom = 0.1, left = 0.1, right = 0.1;
            if (isSameAsPrev && !isFirstRowOnPage) top = 0;
            if (isSameAsNext) bottom = 0;
            data.cell.styles.lineWidth = { top, bottom, left, right };
          }
        }
      }
    });

    const blobUrl = doc.output('bloburl');
    window.open(blobUrl, '_blank');
  } catch (error) {
    console.error("Export PDF error:", error);
    message.error("Terjadi kesalahan saat melakukan export PDF");
  }
};
