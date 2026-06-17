import React, { useState, useEffect, useMemo } from 'react';
import { Card, Table, Typography, Tag, Input, Space, Row, Col, Button } from 'antd';
import { SearchOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

export default function ReviewTab({ sortedData = [], headerTitle }) {
  const [data, setData] = useState([]);
  const [searchText, setSearchText] = useState('');

  useEffect(() => {
    setData(sortedData);
  }, [sortedData]);

  // Flatten the hierarchical data into a single array
  const flatData = useMemo(() => {
    const result = [];
    data.forEach((katNode, katIndex) => {
      const pKat = { kategori: katNode.kategori };

      if (!katNode.subKategoriList || katNode.subKategoriList.length === 0) {
        result.push({ ...pKat, key: `k-${katIndex}` });
        return;
      }

      katNode.subKategoriList.forEach((subKatNode, subKatIndex) => {
        const pSubKat = { ...pKat, subKategori: subKatNode.subKategori };

        subKatNode.namaPerangkatList?.forEach((namaNode, namaIndex) => {
          const pNama = { ...pSubKat, namaPerangkat: namaNode.namaPerangkat };

          if (!namaNode.jenisPerangkatList || namaNode.jenisPerangkatList.length === 0) {
            result.push({ ...pNama, key: `np-${katIndex}-${subKatIndex}-${namaIndex}` });
            return;
          }

          namaNode.jenisPerangkatList.forEach((jenisNode, jenisIndex) => {
            const pJenis = { ...pNama, jenisPerangkat: jenisNode.jenisPerangkat };

            if (!jenisNode.details || jenisNode.details.length === 0) {
              result.push({ ...pJenis, key: `jp-${katIndex}-${subKatIndex}-${namaIndex}-${jenisIndex}` });
              return;
            }

            jenisNode.details.forEach((det, dIndex) => {
              const dBase = { ...pJenis, fungsi: det.fungsi, deskripsi: det.deskripsi };

              if (!det.pengecekanList || det.pengecekanList.length === 0) {
                result.push({ ...dBase, key: `d-${katIndex}-${subKatIndex}-${namaIndex}-${jenisIndex}-${dIndex}` });
                return;
              }

              det.pengecekanList.forEach((cek, cIndex) => {
                result.push({
                  ...dBase,
                  key: `c-${katIndex}-${subKatIndex}-${namaIndex}-${jenisIndex}-${dIndex}-${cIndex}`,
                  pengecekan: cek.pengecekan,
                  standard: cek.standard,
                  bagian: cek.bagian,
                  metode: cek.metode,
                  alat: cek.alat,
                  periodik: cek.periodik,
                });
              });
            });
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

  const columns = [
    {
      title: 'Kategori',
      dataIndex: 'kategori',
      key: 'kategori',
      width: 150,
      onCell: (record, index) => ({ rowSpan: getRowSpan(record, index, 'kategori', []), style: { verticalAlign: 'top' } }),
      render: (kat) => {
        const color = kat?.toLowerCase() === 'utama' ? 'blue' : 'cyan';
        return kat ? <Tag color={color}>{kat}</Tag> : '-';
      }
    },
    { 
      title: 'Sub Kategori', dataIndex: 'subKategori', key: 'subKategori', width: 150,
      onCell: (record, index) => ({ rowSpan: getRowSpan(record, index, 'subKategori', ['kategori']), style: { verticalAlign: 'top' } })
    },
    { 
      title: 'Nama Perangkat', dataIndex: 'namaPerangkat', key: 'namaPerangkat', width: 150, 
      onCell: (record, index) => ({ rowSpan: getRowSpan(record, index, 'namaPerangkat', ['kategori', 'subKategori']), style: { verticalAlign: 'top' } }),
      render: (text) => <Text>{text || '-'}</Text> 
    },
    { 
      title: 'Jenis Perangkat', dataIndex: 'jenisPerangkat', key: 'jenisPerangkat', width: 150,
      onCell: (record, index) => ({ rowSpan: getRowSpan(record, index, 'jenisPerangkat', ['kategori', 'subKategori', 'namaPerangkat']), style: { verticalAlign: 'top' } }),
      render: t => <Tag color="geekblue">{t || '-'}</Tag> 
    },
    { 
      title: 'Fungsi', dataIndex: 'fungsi', key: 'fungsi', width: 200,
      onCell: (record, index) => ({ rowSpan: getRowSpan(record, index, 'fungsi', ['kategori', 'subKategori', 'namaPerangkat', 'jenisPerangkat']), style: { verticalAlign: 'top' } })
    },
    { 
      title: 'Deskripsi', dataIndex: 'deskripsi', key: 'deskripsi', width: 200,
      onCell: (record, index) => ({ rowSpan: getRowSpan(record, index, 'deskripsi', ['kategori', 'subKategori', 'namaPerangkat', 'jenisPerangkat', 'fungsi']), style: { verticalAlign: 'top' } })
    },
    { title: 'Pengecekan', dataIndex: 'pengecekan', key: 'pengecekan', width: 200, render: t => t ? <Tag variant="filled" color="processing">{t}</Tag> : '-', onCell: () => ({ style: { verticalAlign: 'top' } }) },
    { title: 'Standard', dataIndex: 'standard', key: 'standard', width: 150, onCell: () => ({ style: { verticalAlign: 'top' } }) },
    { title: 'Bagian', dataIndex: 'bagian', key: 'bagian', width: 120, onCell: () => ({ style: { verticalAlign: 'top' } }) },
    { title: 'Metode', dataIndex: 'metode', key: 'metode', width: 120, onCell: () => ({ style: { verticalAlign: 'top' } }) },
    { title: 'Alat', dataIndex: 'alat', key: 'alat', width: 120, onCell: () => ({ style: { verticalAlign: 'top' } }) },
    { title: 'Periodik', dataIndex: 'periodik', key: 'periodik', width: 120, render: t => t ? <Tag color="purple">{t}</Tag> : '-', onCell: () => ({ style: { verticalAlign: 'top' } }) },
    { title: 'Approval', dataIndex: 'approval', key: 'approval', width: 120, render: t => t ? <Tag color="green">{t}</Tag> : '-', onCell: () => ({ style: { verticalAlign: 'top' } }) },
  ];

  const exportExcel = () => {
    import('xlsx').then(XLSX => {
      const ws = XLSX.utils.json_to_sheet(filteredData.map(item => ({
        'Kategori': item.kategori || '',
        'Sub Kategori': item.subKategori || '',
        'Nama Perangkat': item.namaPerangkat || '',
        'Jenis Perangkat': item.jenisPerangkat || '',
        'Fungsi': item.fungsi || '',
        'Deskripsi': item.deskripsi || '',
        'Pengecekan': item.pengecekan || '',
        'Standard': item.standard || '',
        'Bagian': item.bagian || '',
        'Metode': item.metode || '',
        'Alat': item.alat || '',
        'Periodik': item.periodik || '',
        'Approval': item.approval || '',
      })));
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

    // 2. Middle Text (Now spans left and middle)
    const titleWidth = usableWidth - rightColWidth;
    
    doc.setFont("helvetica", "bold");
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(16);
    doc.text("STANDAR MAINTENANCE PERANGKAT IT", margin + titleWidth / 2, startY + 11, { align: "center" });
    doc.setFontSize(18);
    doc.text("2026", margin + titleWidth / 2, startY + 20, { align: "center" });

    // 3. Right Table
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

    const head = [["Kategori", "Sub Kategori", "Nama", "Jenis", "Fungsi", "Pengecekan", "Standard", "Bagian", "Periodik"]];
    
    const body = filteredData.map((item, index) => {
      const arr = [
        item.kategori || "-",
        item.subKategori || "-",
        item.namaPerangkat || "-",
        item.jenisPerangkat || "-",
        item.fungsi || "-",
        item.pengecekan || "-",
        item.standard || "-",
        item.bagian || "-",
        item.periodik || "-"
      ];
      arr._item = item;
      arr._index = index;
      return arr;
    });



    autoTable(doc, {
      head,
      body,
      startY: startY + headerHeight + 5,
      styles: { fontSize: 7, cellPadding: 1, lineColor: [0, 0, 0], lineWidth: 0.1 },
      theme: 'grid',
      headStyles: { fillColor: [240, 240, 240], textColor: [0, 0, 0], fontStyle: 'bold' },
      willDrawCell: function(data) {
        if (data.row.section === 'body') {
          // Track the first row index for each page
          if (!doc.firstRowOfPage) doc.firstRowOfPage = {};
          if (doc.firstRowOfPage[data.pageNumber] === undefined) {
            doc.firstRowOfPage[data.pageNumber] = data.row.index;
          }

          const groupKeys = [
            ['kategori'], // Col 0
            ['kategori', 'subKategori'], // Col 1
            ['kategori', 'subKategori', 'namaPerangkat'], // Col 2
            ['kategori', 'subKategori', 'namaPerangkat', 'jenisPerangkat'], // Col 3
            ['kategori', 'subKategori', 'namaPerangkat', 'jenisPerangkat', 'fungsi'] // Col 4
          ];

          if (data.column.index < groupKeys.length) {
            const keys = groupKeys[data.column.index];
            const rowIndex = data.row.raw._index;
            const record = data.row.raw._item;
            const prevRecord = rowIndex > 0 ? filteredData[rowIndex - 1] : null;
            const nextRecord = rowIndex < filteredData.length - 1 ? filteredData[rowIndex + 1] : null;

            const isSameAsPrev = prevRecord && keys.every(k => prevRecord[k] === record[k]);
            const isSameAsNext = nextRecord && keys.every(k => nextRecord[k] === record[k]);
            const isFirstRowOnPage = doc.firstRowOfPage[data.pageNumber] === rowIndex;

            if (isSameAsPrev && !isFirstRowOnPage) {
              data.cell.text = []; // Hide text for subsequent merged cells, EXCEPT on new pages
            }

            // Simulate merge by removing internal borders
            let top = 0.1, bottom = 0.1, left = 0.1, right = 0.1;
            
            // If it's connected to the previous row AND it's on the same page, remove top border
            if (isSameAsPrev && !isFirstRowOnPage) top = 0;
            
            // If it's connected to the next row, remove bottom border
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
        <Text type="secondary">Melihat hasil akhir konfigurasi Standard Maintenance secara mendatar (Flat Table).</Text>
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
