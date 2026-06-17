import { message } from "antd";

export const filterAssetsByCategory = (allAssets, leafName) => {
  const leaf = leafName.toLowerCase().trim();

  // 1. Exact match pada category_name
  let result = allAssets.filter(
    a => a.category?.category_name?.toLowerCase().trim() === leaf
  );
  if (result.length > 0) return { assets: result, matched: true };

  // 2. Match parent category_name (SM memakai nama parent, asset ada di child)
  result = allAssets.filter(
    a => a.category?.parent?.category_name?.toLowerCase().trim() === leaf
  );
  if (result.length > 0) {
    const childNames = [...new Set(result.map(a => a.category?.category_name).filter(Boolean))].join(', ');
    message.info(`Kategori "${leafName}" adalah parent — menampilkan ${result.length} aset dari: ${childNames}.`);
    return { assets: result, matched: true };
  }

  // 3. Partial match substring
  result = allAssets.filter(a => {
    const cn = a.category?.category_name?.toLowerCase().trim() || '';
    const pn = a.category?.parent?.category_name?.toLowerCase().trim() || '';
    return cn.includes(leaf) || leaf.includes(cn) || pn.includes(leaf) || leaf.includes(pn);
  });
  if (result.length > 0) {
    message.info(`Tidak ada kategori "${leafName}" yang exact — menampilkan ${result.length} aset dengan kategori serupa.`);
    return { assets: result, matched: false };
  }

  // 4. Fallback semua asset
  message.warning(
    `Tidak ada aset untuk kategori "${leafName}". Menampilkan semua aset — pilih aset yang sesuai secara manual.`
  );
  return { assets: allAssets, matched: false };
};

export const getRowSpan = (data, record, index, dataIndex, parentDataIndices = []) => {
  if (!data || data.length === 0) return 1;

  // Temukan absolute index dari record di keseluruhan data
  const absIndex = data.findIndex(item => item.key === record.key || item.no === record.no);
  if (absIndex === -1) return 1;

  if (index > 0) {
    // Membandingkan dengan baris sebelumnya menggunakan absolute index
    const prevRecord = data[absIndex - 1];
    const isSameAsPrev = prevRecord[dataIndex] === record[dataIndex] && 
                         parentDataIndices.every(p => prevRecord[p] === record[p]);
    if (isSameAsPrev) {
      return 0; // Gabung dengan baris sebelumnya
    }
  }

  let spanCount = 1;
  for (let i = absIndex + 1; i < data.length; i++) {
    const nextRecord = data[i];
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
