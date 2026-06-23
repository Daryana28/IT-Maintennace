import React, { useState, useEffect, useMemo } from 'react';
import { Card, Table, Typography, Tag, Input, Space, Row, Col, Button, Checkbox } from 'antd';
import { SearchOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

// Helper to determine active months based on periodic configuration
const getActiveMonthsForPeriodic = (periodik) => {
  const p = (periodik || "").toLowerCase().trim();
  const active = Array(12).fill(false);
  
  if (!p || p === "-") return active;
  
  // Weekly or Monthly
  if (p.includes("minggu") || p.includes("/w") || p.includes("week") || p.includes("1 bulan") || p.includes("1x/month") || p === "monthly" || p === "bulan") {
    return Array(12).fill(true);
  }
  
  // Quarterly (every 3 months)
  if (p.includes("3 bulan") || p.includes("quarter") || p.includes("3x/month") || p.includes("3x/bulan")) {
    active[0] = true; // Jan
    active[3] = true; // Apr
    active[6] = true; // Jul
    active[9] = true; // Oct
    return active;
  }
  
  // Half-yearly (every 6 months)
  if (p.includes("6 bulan") || p.includes("half") || p.includes("semester")) {
    active[0] = true; // Jan
    active[6] = true; // Jul
    return active;
  }
  
  // Yearly (every 12 months or yearly)
  if (p.includes("tahun") || p.includes("yearly") || p.includes("12 bulan") || p.includes("1 tahun")) {
    active[0] = true; // Jan
    return active;
  }
  
  // Fallback: If it's something like "2-bulan", check every 2 months
  if (p.includes("2 bulan")) {
    for (let i = 0; i < 12; i += 2) active[i] = true;
    return active;
  }
  
  // Default to all active if not matching specific patterns
  return Array(12).fill(true);
};

// Helper to recursively collect all maintenanceItems from category tree nodes
const collectMaintenanceItems = (nodes) => {
  let items = [];
  if (!nodes) return items;
  nodes.forEach(node => {
    if (node.maintenanceItems && node.maintenanceItems.length > 0) {
      items = items.concat(node.maintenanceItems);
    }
    if (node.children && node.children.length > 0) {
      items = items.concat(collectMaintenanceItems(node.children));
    }
  });
  return items;
};

export default function ReviewTab({ sortedData = [], headerTitle }) {
  const [data, setData] = useState([]);
  const [searchText, setSearchText] = useState('');

  useEffect(() => {
    setData(sortedData);
  }, [sortedData]);

  // Flatten the hierarchical tree data into a flat array of checks
  const flatData = useMemo(() => {
    const items = collectMaintenanceItems(data);
    const result = [];
    const categorySeqs = {};
    const detailIdsSeen = new Set();

    items.forEach((item) => {
      const cat = (item.kategori || "Default").toLowerCase();
      if (categorySeqs[cat] === undefined) {
        categorySeqs[cat] = 1;
      }

      if (!item.details && !item.formattedDetails) {
        result.push({
          kategori: item.kategori,
          subKategori: item.subKategori,
          namaPerangkat: item.namaPerangkat,
          subPerangkat: item.subPerangkat,
          key: `sm-${item.id}`,
          detailSeq: null
        });
        return;
      }

      const detailsList = item.formattedDetails || item.details || [];
      detailsList.forEach((det) => {
        const detailId = det.detailId || det.id;
        if (!detailIdsSeen.has(detailId)) {
          detailIdsSeen.add(detailId);
          det._seq = categorySeqs[cat]++;
        }
        const currentDetailSeq = det._seq;

        const checksList = det.pengecekanList || [];
        if (checksList.length === 0) {
          result.push({
            kategori: item.kategori,
            subKategori: item.subKategori,
            namaPerangkat: item.namaPerangkat,
            subPerangkat: item.subPerangkat,
            fungsi: det.fungsi,
            deskripsi: det.deskripsi,
            key: `det-${detailId}`,
            detailSeq: currentDetailSeq
          });
          return;
        }

        checksList.forEach((cek) => {
          const cekId = cek.cekId || cek.id;
          result.push({
            kategori: item.kategori,
            subKategori: item.subKategori,
            namaPerangkat: item.namaPerangkat,
            subPerangkat: item.subPerangkat,
            fungsi: det.fungsi,
            deskripsi: det.deskripsi,
            pengecekan: cek.pengecekan,
            standard: cek.standard,
            metode: cek.metode,
            alat: cek.alat,
            periodik: cek.periodik,
            bagian: cek.bagian,
            cekId,
            detailId,
            smId: item.id,
            key: `cek-${cekId || Math.random()}`,
            detailSeq: currentDetailSeq
          });
        });
      });
    });
    return result;
  }, [data]);

  const filteredData = useMemo(() => {
    if (!searchText) return flatData;
    const lowerSearch = searchText.toLowerCase();
    return flatData.filter(item => {
      return Object.values(item).some(val => 
        String(val).toLowerCase().includes(lowerSearch)
      );
    });
  }, [flatData, searchText]);

  const getRowSpan = (record, index, dataIndex, parentDataIndices = []) => {
    if (index > 0) {
      const prevRecord = filteredData[index - 1];
      const isSameAsPrev = prevRecord[dataIndex] === record[dataIndex] && 
                           parentDataIndices.every(p => prevRecord[p] === record[p]);
      if (isSameAsPrev) {
        return 0; // Merge with previous
      }
    }

    let spanCount = 1;
    for (let i = index + 1; i < filteredData.length; i++) {
      const nextRecord = filteredData[i];
      const isSameAsNext = nextRecord[dataIndex] === record[dataIndex] &&
                           parentDataIndices.every(p => nextRecord[p] === record[p]);
      if (isSameAsNext) {
        spanCount++;
      } else {
        break;
      }
    }
    return spanCount;
  };

  const monthNames = [
    { key: 'jan', label: 'Jan', index: 0 },
    { key: 'feb', label: 'Feb', index: 1 },
    { key: 'mar', label: 'Mar', index: 2 },
    { key: 'apr', label: 'Apr', index: 3 },
    { key: 'mei', label: 'Mei', index: 4 },
    { key: 'jun', label: 'Jun', index: 5 },
    { key: 'jul', label: 'Jul', index: 6 },
    { key: 'agt', label: 'Agt', index: 7 },
    { key: 'sep', label: 'Sep', index: 8 },
    { key: 'okt', label: 'Okt', index: 9 },
    { key: 'nov', label: 'Nov', index: 10 },
    { key: 'des', label: 'Des', index: 11 },
  ];

  const columns = [
    {
      title: 'No',
      key: 'no',
      width: 50,
      align: 'center',
      render: (text, record, index) => index + 1,
    },
    {
      title: 'Kategori',
      dataIndex: 'kategori',
      key: 'kategori',
      width: 130,
      onCell: (record, index) => ({ rowSpan: getRowSpan(record, index, 'kategori', []), style: { verticalAlign: 'top' } }),
      render: (kat) => {
        const color = kat?.toLowerCase() === 'utama' ? 'blue' : 'cyan';
        return kat ? <Tag color={color}>{kat}</Tag> : '-';
      }
    },
    { 
      title: 'Nama Perangkat', dataIndex: 'namaPerangkat', key: 'namaPerangkat', width: 130, 
      onCell: (record, index) => ({ rowSpan: getRowSpan(record, index, 'namaPerangkat', ['kategori', 'subKategori']), style: { verticalAlign: 'top' } }),
      render: (text) => <Text>{text || '-'}</Text> 
    },
    { 
      title: 'Sub Perangkat', dataIndex: 'subPerangkat', key: 'subPerangkat', width: 130,
      onCell: (record, index) => ({ rowSpan: getRowSpan(record, index, 'subPerangkat', ['kategori', 'subKategori', 'namaPerangkat']), style: { verticalAlign: 'top' } }),
      render: t => <Tag color="geekblue">{t || '-'}</Tag> 
    },
    {
      title: 'No Detail',
      dataIndex: 'detailSeq',
      key: 'detailSeq',
      width: 80,
      align: 'center',
      onCell: (record, index) => ({ rowSpan: getRowSpan(record, index, 'detailSeq', ['kategori', 'subKategori', 'namaPerangkat', 'subPerangkat', 'fungsi']), style: { verticalAlign: 'top' } }),
      render: (val) => val || '-'
    },
    { 
      title: 'Fungsi', dataIndex: 'fungsi', key: 'fungsi', width: 150,
      onCell: (record, index) => ({ rowSpan: getRowSpan(record, index, 'fungsi', ['kategori', 'subKategori', 'namaPerangkat', 'subPerangkat']), style: { verticalAlign: 'top' } })
    },
    { 
      title: 'Desc', dataIndex: 'deskripsi', key: 'deskripsi', width: 180,
      onCell: (record, index) => ({ rowSpan: getRowSpan(record, index, 'deskripsi', ['kategori', 'subKategori', 'namaPerangkat', 'subPerangkat', 'fungsi']), style: { verticalAlign: 'top' } })
    },
    { title: 'Pengecekan', dataIndex: 'pengecekan', key: 'pengecekan', width: 180, render: t => t ? <Tag variant="filled" color="processing">{t}</Tag> : '-', onCell: () => ({ style: { verticalAlign: 'top' } }) },
    {
      title: 'Pengecekan Normal',
      children: [
        { title: 'Standar', dataIndex: 'standard', key: 'standard', width: 120, onCell: () => ({ style: { verticalAlign: 'top' } }) },
        { title: 'Metode', dataIndex: 'metode', key: 'metode', width: 120, onCell: () => ({ style: { verticalAlign: 'top' } }) },
        { title: 'Alat', dataIndex: 'alat', key: 'alat', width: 120, onCell: () => ({ style: { verticalAlign: 'top' } }) },
      ]
    },
    { title: 'Periodic', dataIndex: 'periodik', key: 'periodik', width: 100, render: t => t ? <Tag color="purple">{t}</Tag> : '-', onCell: () => ({ style: { verticalAlign: 'top' } }) },
    {
      title: 'Bulan (Plan)',
      children: monthNames.map(m => ({
        title: m.label,
        key: m.key,
        width: 50,
        align: 'center',
        render: (_, record) => {
          const activeMonths = getActiveMonthsForPeriodic(record.periodik);
          return <Checkbox checked={activeMonths[m.index]} disabled />;
        }
      }))
    }
  ];

  const exportExcel = () => {
    import('xlsx').then(XLSX => {
      const ws = XLSX.utils.json_to_sheet(filteredData.map((item, index) => {
        const activeMonths = getActiveMonthsForPeriodic(item.periodik);
        return {
          'No': index + 1,
          'Kategori': item.kategori || '',
          'Nama Perangkat': item.namaPerangkat || '',
          'Sub Perangkat': item.subPerangkat || '',
          'No Detail': item.detailSeq || '',
          'Fungsi': item.fungsi || '',
          'Deskripsi': item.deskripsi || '',
          'Pengecekan': item.pengecekan || '',
          'Standar': item.standard || '',
          'Metode': item.metode || '',
          'Alat': item.alat || '',
          'Periodik': item.periodik || '',
          'Jan': activeMonths[0] ? '✓' : '',
          'Feb': activeMonths[1] ? '✓' : '',
          'Mar': activeMonths[2] ? '✓' : '',
          'Apr': activeMonths[3] ? '✓' : '',
          'Mei': activeMonths[4] ? '✓' : '',
          'Jun': activeMonths[5] ? '✓' : '',
          'Jul': activeMonths[6] ? '✓' : '',
          'Agt': activeMonths[7] ? '✓' : '',
          'Sep': activeMonths[8] ? '✓' : '',
          'Okt': activeMonths[9] ? '✓' : '',
          'Nov': activeMonths[10] ? '✓' : '',
          'Des': activeMonths[11] ? '✓' : '',
        };
      }));
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Standard_Maintenance");
      XLSX.writeFile(wb, `${headerTitle || "Review_Standard_Maintenance"}.xlsx`);
    });
  };

  const exportPDF = async () => {
    const [{ default: jsPDF }, { default: autoTable }] = await Promise.all([
      import('jspdf'),
      import('jspdf-autotable')
    ]);

    const doc = new jsPDF('landscape');
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 14;
    const usableWidth = pageWidth - 2 * margin;

    const startY = 10;
    const headerHeight = 25;
    
    // Draw Header Rect
    doc.setDrawColor(0);
    doc.setLineWidth(0.5);
    doc.rect(margin, startY, usableWidth, headerHeight);

    const rightColWidth = 75; 

    // Vertical dividers
    doc.line(pageWidth - margin - rightColWidth, startY, pageWidth - margin - rightColWidth, startY + headerHeight);

    // Middle Text (Now spans left and middle)
    const titleWidth = usableWidth - rightColWidth;
    
    doc.setFont("helvetica", "bold");
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(16);
    doc.text("STANDAR MAINTENANCE PERANGKAT IT", margin + titleWidth / 2, startY + 11, { align: "center" });
    doc.setFontSize(18);
    doc.text("2026", margin + titleWidth / 2, startY + 20, { align: "center" });

    // Right Table
    const rightStartX = pageWidth - margin - rightColWidth;
    const subColW = rightColWidth / 3;
    const signHeaderH = 8;

    doc.line(rightStartX, startY + signHeaderH, rightStartX + rightColWidth, startY + signHeaderH);
    doc.line(rightStartX + subColW, startY, rightStartX + subColW, startY + headerHeight);
    doc.line(rightStartX + 2 * subColW, startY, rightStartX + 2 * subColW, startY + headerHeight);

    doc.setFontSize(8);
    doc.text("Disetujui", rightStartX + subColW / 2, startY + 5, { align: "center" });
    doc.text("Diperiksa", rightStartX + subColW + subColW / 2, startY + 5, { align: "center" });
    doc.text("Dibuat", rightStartX + 2 * subColW + subColW / 2, startY + 5, { align: "center" });

    const head = [["No", "Kategori", "Nama Perangkat", "Sub Perangkat", "No Det", "Fungsi", "Pengecekan", "Standar", "Periodik", "Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agt", "Sep", "Okt", "Nov", "Des"]];
    
    const body = filteredData.map((item, index) => {
      const activeMonths = getActiveMonthsForPeriodic(item.periodik);
      const arr = [
        index + 1,
        item.kategori || "-",
        item.namaPerangkat || "-",
        item.subPerangkat || "-",
        item.detailSeq || "-",
        item.fungsi || "-",
        item.pengecekan || "-",
        item.standard || "-",
        item.periodik || "-",
        activeMonths[0] ? "✓" : "",
        activeMonths[1] ? "✓" : "",
        activeMonths[2] ? "✓" : "",
        activeMonths[3] ? "✓" : "",
        activeMonths[4] ? "✓" : "",
        activeMonths[5] ? "✓" : "",
        activeMonths[6] ? "✓" : "",
        activeMonths[7] ? "✓" : "",
        activeMonths[8] ? "✓" : "",
        activeMonths[9] ? "✓" : "",
        activeMonths[10] ? "✓" : "",
        activeMonths[11] ? "✓" : "",
      ];
      arr._item = item;
      arr._index = index;
      return arr;
    });

    autoTable(doc, {
      head,
      body,
      startY: startY + headerHeight + 5,
      styles: { fontSize: 6, cellPadding: 1, lineColor: [0, 0, 0], lineWidth: 0.1 },
      theme: 'grid',
      headStyles: { fillColor: [240, 240, 240], textColor: [0, 0, 0], fontStyle: 'bold' },
      willDrawCell: function(data) {
        if (data.row.section === 'body') {
          // Track the first row index for each page
          if (!doc.firstRowOfPage) doc.firstRowOfPage = {};
          if (doc.firstRowOfPage[data.pageNumber] === undefined) {
            doc.firstRowOfPage[data.pageNumber] = data.row.index;
          }

          const groupKeys = {
            1: ['kategori'],
            2: ['kategori', 'namaPerangkat'],
            3: ['kategori', 'namaPerangkat', 'subPerangkat'],
            4: ['kategori', 'namaPerangkat', 'subPerangkat', 'detailSeq'],
            5: ['kategori', 'namaPerangkat', 'subPerangkat', 'detailSeq', 'fungsi']
          };

          if (groupKeys[data.column.index]) {
            const keys = groupKeys[data.column.index];
            const rowIndex = data.row.raw._index;
            const record = data.row.raw._item;
            const prevRecord = rowIndex > 0 ? filteredData[rowIndex - 1] : null;
            const nextRecord = rowIndex < filteredData.length - 1 ? filteredData[rowIndex + 1] : null;
            const isFirstRowOnPage = doc.firstRowOfPage[data.pageNumber] === rowIndex;

            const isSameAsPrev = prevRecord && keys.every(k => prevRecord[k] === record[k]);
            const isSameAsNext = nextRecord && keys.every(k => nextRecord[k] === record[k]);

            if (isSameAsPrev && !isFirstRowOnPage) {
              data.cell.text = []; // Hide text for subsequent merged cells, EXCEPT on new pages
            }

            // Simulate merge by removing internal borders
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
  };

  return (
    <Card variant="borderless" className="main-card">
      <div style={{ marginBottom: 20 }}>
        <Title level={5} style={{ color: "#1e293b", margin: 0 }}>{headerTitle || "Review Standard Maintenance"}</Title>
        <Text type="secondary">Melihat hasil akhir konfigurasi Standard Maintenance secara mendatar (Excel Table).</Text>
      </div>

      <Row justify="space-between" align="middle" className="filter-section" style={{ marginBottom: 16 }}>
        <Col>
          <Space size="middle" wrap>
            <Input 
              placeholder="Cari data..." 
              prefix={<SearchOutlined />} 
              allowClear 
              style={{ width: 300 }} 
              value={searchText}
              onChange={e => setSearchText(e.target.value)}
            />
          </Space>
        </Col>
        <Col>
          <Space>
            <Button onClick={exportExcel} style={{ backgroundColor: '#107c41', color: 'white' }}>Export Excel</Button>
            <Button onClick={exportPDF} style={{ backgroundColor: '#e3242b', color: 'white' }}>Export PDF</Button>
          </Space>
        </Col>
      </Row>

      <Table
        title={() => <Text strong style={{ fontSize: '16px' }}>{headerTitle || "Data Review Standard Maintenance"}</Text>}
        bordered
        columns={columns}
        dataSource={filteredData}
        pagination={false}
        size="small"
        scroll={{ x: 'max-content', y: 600 }}
        rowClassName={() => 'custom-table-row'}
      />

    </Card>
  );
}
