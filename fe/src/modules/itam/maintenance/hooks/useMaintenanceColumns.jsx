import React from 'react';
import { Tooltip, Button, message } from 'antd';
import { CalendarOutlined, CopyOutlined, StopOutlined, CheckOutlined, MinusOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { getRowSpan, filterAssetsByCategory } from '../utils/tableHelpers';

// Helper for color mapping if needed
const colorMap = {
  blue: { bg: '#e6f4ff', text: '#1677ff', border: '#91caff' },
  green: { bg: '#f6ffed', text: '#52c41a', border: '#b7eb8f' },
  orange: { bg: '#fff7e6', text: '#fa8c16', border: '#ffd591' },
  purple: { bg: '#f9f0ff', text: '#722ed1', border: '#d3adf7' },
  cyan: { bg: '#e6fffb', text: '#13c2c2', border: '#87e8de' },
  red: { bg: '#fff1f0', text: '#f5222d', border: '#ffa39e' },
};

export const useMaintenanceColumns = ({
  schedules,
  days,
  viewMode,
  currentDate,
  holidays,
  handleDropReschedule,
  setCopySourceSMId,
  setIsCopyModalVisible,
  setEditScheduleId,
  setIsEditMode,
  form,
  setIsModalVisible,
  setActiveYearId,
  setAssets,
  setSelectedAssetIds,
  setCancelModal,
  setLoading,
  isReadOnly,
  handleToggleChecklist,
}) => {
  const activeYearStr = dayjs().year();
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  const getCellConfig = (dString, isHoliday, isWeekend, customWidth = 140) => ({
    dataIndex: `date_${dString}`,
    key: `date_${dString}`,
    width: customWidth,
    align: "center",
    onCell: (record, index) => {
      let rs = getRowSpan(schedules, record, index, 'sm_id', []);
      let cs = 1;
      const cellStyle = { padding: "6px 8px", verticalAlign: "top" };
      if (isHoliday) {
        cellStyle.background = '#fff1f0';
      } else if (isWeekend) {
        cellStyle.background = '#f8fafc';
      }

      const baseDate = Array.isArray(currentDate) ? currentDate[0] : currentDate;
      const defaultStartDate = baseDate ? baseDate.format("YYYY-MM-DD") : dayjs().format("YYYY-MM-DD");

      if (viewMode === "daily" && record.schedules && record.schedules.length > 0) {
        const intervals = record.schedules.map(sch => {
          let schDate = dayjs(sch.next_maintenance_date || defaultStartDate);
          if (schDate.hour() === 0 && schDate.minute() === 0) {
            schDate = schDate.hour(8);
          }
          const roundedMinute = Math.floor(schDate.minute() / 10) * 10;
          const startD = schDate.minute(roundedMinute).second(0);
          const schEndDate = sch.next_maintenance_end_date ? dayjs(sch.next_maintenance_end_date) : startD.add(1, 'hour');
          const diffMinutes = schEndDate.diff(startD, 'minute');
          const span = Math.max(1, Math.ceil(diffMinutes / 10));
          const endD = startD.add(span * 10, 'minute');
          return { start: startD, end: endD, schedule: sch };
        }).sort((a, b) => a.start.valueOf() - b.start.valueOf());

        const clusters = [];
        let currentCluster = null;
        for (const inv of intervals) {
          if (!currentCluster) {
            currentCluster = { start: inv.start, end: inv.end, schedules: [inv.schedule] };
            clusters.push(currentCluster);
          } else {
            if (inv.start.isBefore(currentCluster.end)) {
              if (inv.end.isAfter(currentCluster.end)) currentCluster.end = inv.end;
              currentCluster.schedules.push(inv.schedule);
            } else {
              currentCluster = { start: inv.start, end: inv.end, schedules: [inv.schedule] };
              clusters.push(currentCluster);
            }
          }
        }

        const currentD = dayjs(dString);
        for (const cl of clusters) {
          if (currentD.isSame(cl.start)) {
            cs = cl.end.diff(cl.start, 'minute') / 10;
            cellStyle.padding = "4px";
            break;
          } else if (currentD.isAfter(cl.start) && currentD.isBefore(cl.end)) {
            cs = 0;
            break;
          }
        }
      }

      if (rs === 0) return { rowSpan: 0, colSpan: cs, style: cellStyle };
      return { rowSpan: rs, colSpan: cs, style: cellStyle };
    },
    render: (_, record) => {
      const baseDate = Array.isArray(currentDate) ? currentDate[0] : currentDate;
      const defaultStartDate = baseDate ? baseDate.format("YYYY-MM-DD") : dayjs().format("YYYY-MM-DD");

      const matchingSchedules = (() => {
        if (viewMode === "daily") {
          if (!record.schedules || record.schedules.length === 0) return [];
          const intervals = record.schedules.map(sch => {
            let schDate = dayjs(sch.next_maintenance_date || defaultStartDate);
            if (schDate.hour() === 0 && schDate.minute() === 0) {
              schDate = schDate.hour(8);
            }
            const roundedMinute = Math.floor(schDate.minute() / 10) * 10;
            const startD = schDate.minute(roundedMinute).second(0);
            const schEndDate = sch.next_maintenance_end_date ? dayjs(sch.next_maintenance_end_date) : startD.add(1, 'hour');
            const diffMinutes = schEndDate.diff(startD, 'minute');
            const span = Math.max(1, Math.ceil(diffMinutes / 10));
            const endD = startD.add(span * 10, 'minute');
            return { start: startD, end: endD, schedule: sch };
          }).sort((a, b) => a.start.valueOf() - b.start.valueOf());

          const clusters = [];
          let currentCluster = null;
          for (const inv of intervals) {
            if (!currentCluster) {
              currentCluster = { start: inv.start, end: inv.end, schedules: [inv.schedule] };
              clusters.push(currentCluster);
            } else {
              if (inv.start.isBefore(currentCluster.end)) {
                if (inv.end.isAfter(currentCluster.end)) currentCluster.end = inv.end;
                currentCluster.schedules.push(inv.schedule);
              } else {
                currentCluster = { start: inv.start, end: inv.end, schedules: [inv.schedule] };
                clusters.push(currentCluster);
              }
            }
          }

          const currentD = dayjs(dString);
          for (const cl of clusters) {
            if (currentD.isSame(cl.start)) {
              return cl.schedules;
            }
          }
          return [];
        } else {
          return (record.schedules || []).filter(sch => {
            let schDate = dayjs(sch.next_maintenance_date || defaultStartDate);
            return schDate.format("YYYY-MM-DD") === dString;
          });
        }
      })();

      const dropProps = isReadOnly ? {} : {
        style: { minHeight: '30px', height: '100%', width: '100%' },
        onDragOver: (e) => { e.preventDefault(); e.dataTransfer.dropEffect = "move"; },
        onDrop: (e) => {
          e.preventDefault();
          const scheduleId = e.dataTransfer.getData("scheduleId");
          if (scheduleId) handleDropReschedule(scheduleId, dString);
        }
      };

      if (matchingSchedules.length > 0) {
        const activeSchedules = matchingSchedules.filter(sch => sch.status !== 'CANCELLED');
        const cancelledSchedules = matchingSchedules.filter(sch => sch.status === 'CANCELLED');

        const renderGroup = (group, isCancelled) => {
          if (group.length === 0) return null;
          const c = isCancelled ? { bg: '#fff1f0', text: '#cf1322', border: '#ffa39e' } : (colorMap[record.color] || colorMap.blue);

          const assetNames = group.map(sch => {
            const asset = sch.asset;
            if (!asset) return "-";
            let name = "";
            if (asset.hostname && asset.hostname !== "-" && asset.asset_name && asset.asset_name !== "-") {
              name = `${asset.hostname} (${asset.asset_name})`;
            } else {
              name = asset.hostname && asset.hostname !== "-" ? asset.hostname : asset.asset_name;
            }
            const codeStr = asset.asset_code !== "-" ? ` [${asset.asset_code}]` : "";
            return `${name}${codeStr}`;
          });
          const titleText = assetNames.join(", ");

          const tooltipContent = (
            <div style={{ padding: '2px 0' }}>
              <div style={{ fontWeight: 600, fontSize: 13, borderBottom: '1px solid rgba(255,255,255,0.2)', paddingBottom: 4, marginBottom: 4 }}>
                {titleText}
              </div>
              <ul style={{ paddingLeft: 16, margin: '4px 0', fontSize: 12 }}>
                {group.map(sch => {
                  let assetName = "";
                  if (sch.asset?.hostname && sch.asset?.hostname !== "-" && sch.asset?.asset_name && sch.asset?.asset_name !== "-") {
                    assetName = `${sch.asset.hostname} (${sch.asset.asset_name})`;
                  } else {
                    assetName = sch.asset?.hostname && sch.asset?.hostname !== "-" ? sch.asset?.hostname : sch.asset?.asset_name;
                  }
                  const codeStr = sch.asset?.asset_code !== "-" ? ` [${sch.asset?.asset_code}]` : "";
                  return <li key={sch.id}>{assetName}{codeStr}</li>;
                })}
              </ul>
              <div style={{ fontSize: 12, lineHeight: 1.5, marginTop: 4 }}>
                <div><span style={{ opacity: 0.8 }}>Perangkat:</span> {record.perangkat} ({record.jenis})</div>
                <div><span style={{ opacity: 0.8 }}>Task:</span> {record.task}</div>
                <div><span style={{ opacity: 0.8 }}>Periodik:</span> {group[0].periodik || record.periodik}</div>
                {group[0].next_maintenance_date && (
                  <div>
                    <span style={{ opacity: 0.8 }}>Jam:</span> {dayjs(group[0].next_maintenance_date).format('HH:mm')} 
                    {group[0].next_maintenance_end_date ? ` - ${dayjs(group[0].next_maintenance_end_date).format('HH:mm')}` : ''}
                  </div>
                )}
                <div><span style={{ opacity: 0.8 }}>Status:</span> {isCancelled ? <span style={{ color: '#ffa39e', fontWeight: 'bold' }}>Dibatalkan</span> : 'Aktif'}</div>
              </div>
            </div>
          );

          const groupScheduleIds = group.map(s => s.id).join(",");

          return (
            <Tooltip key={isCancelled ? 'cancelled' : 'active'} title={tooltipContent} placement="topLeft">
              <div
                className={`gantt-bar${isCancelled ? ' gantt-bar-cancelled' : ''}`}
                draggable={!isCancelled && !isReadOnly}
                onDragStart={(e) => {
                  if (isCancelled || isReadOnly) { e.preventDefault(); return; }
                  e.dataTransfer.setData("scheduleId", groupScheduleIds);
                  e.dataTransfer.effectAllowed = "move";
                }}
                style={{
                  background: isCancelled ? '#fff1f0' : c.bg,
                  border: `1px solid ${isCancelled ? '#ffa39e' : c.border}`,
                  color: isCancelled ? '#cf1322' : c.text,
                  display: 'flex', flexDirection: 'column', alignItems: 'flex-start',
                  textAlign: 'left', lineHeight: '1.4', position: 'relative',
                  cursor: isCancelled ? 'not-allowed' : 'pointer', opacity: isCancelled ? 0.7 : 1,
                  marginBottom: 6, padding: '6px 8px', borderRadius: '6px',
                  boxShadow: '0 1px 2px rgba(0,0,0,0.05)', transition: 'all 0.2s ease', width: '100%'
                }}
                onClick={async (e) => {
                  e.stopPropagation();
                  if (isCancelled) return;
                  try {
                    setLoading(true);
                    const { default: assetService } = await import("../../assetManagement/services/assetService");
                    const assetData = await assetService.getAll({ pageSize: 1000 });
                    const leafName = record.subKategori !== "-" ? record.subKategori : record.kategori;
                    const { assets: filteredAssets } = filterAssetsByCategory(assetData?.data || [], leafName);
                    const activeAssets = filteredAssets.filter(a => a.status && a.status.toLowerCase() === 'active');
                    setAssets(activeAssets);
                    setIsEditMode(true);
                    setEditScheduleId(groupScheduleIds);
                    setActiveYearId(record.yearly_standard_id);
                    form.setFieldsValue({
                      standard_maintenance_id: record.sm_id,
                      periodik: group[0].periodik ? group[0].periodik.trim().split(/\s+/).map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(" ") : "1 Bulan",
                      asset_ids: group.map(s => s.asset_id),
                      next_maintenance_date_range: [
                        group[0].next_maintenance_date ? dayjs(group[0].next_maintenance_date) : dayjs(dString),
                        group[0].next_maintenance_end_date ? dayjs(group[0].next_maintenance_end_date) : (group[0].next_maintenance_date ? dayjs(group[0].next_maintenance_date).add(1, 'hour') : dayjs(dString).add(1, 'hour'))
                      ]
                    });
                    setSelectedAssetIds(group.map(s => s.asset_id));
                    setIsModalVisible(true);
                  } catch (err) { message.error("Gagal memuat data formulir"); } finally { setLoading(false); }
                }}
              >
                <div style={{ fontWeight: 600, fontSize: '11px', width: isCancelled ? '100%' : 'calc(100% - 20px)', textDecoration: isCancelled ? 'line-through' : 'none', display: 'flex', flexDirection: 'column', gap: '2px' }}>
                  {group.map((sch, i) => {
                    const asset = sch.asset;
                    if (!asset) return null;
                    let name = "";
                    if (asset.hostname && asset.hostname !== "-" && asset.asset_name && asset.asset_name !== "-") {
                      name = `${asset.hostname} (${asset.asset_name})`;
                    } else {
                      name = asset.hostname && asset.hostname !== "-" ? asset.hostname : asset.asset_name;
                    }
                    const codeStr = asset.asset_code && asset.asset_code !== "-" ? ` [${asset.asset_code}]` : "";
                    
                    if (viewMode === "daily") {
                        let schDate = dayjs(sch.next_maintenance_date || defaultStartDate);
                        let schEndDate = sch.next_maintenance_end_date ? dayjs(sch.next_maintenance_end_date) : schDate.add(1, 'hour');
                        if (schDate.hour() === 0 && schDate.minute() === 0) {
                            schDate = schDate.hour(8);
                            if (!sch.next_maintenance_end_date) schEndDate = schDate.add(1, 'hour');
                        }
                        const hourStr = schDate.format('HH:mm');
                        const nextHourStr = schEndDate.format('HH:mm');
                        return (
                            <div key={i} style={{ textOverflow: 'ellipsis', whiteSpace: 'nowrap', overflow: 'hidden', width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                              <div style={{ display: 'flex', alignItems: 'center' }}>
                                <span style={{ marginRight: '6px', fontSize: '12px', color: c.border }}>•</span> 
                                {name}{codeStr}
                              </div>
                              <div style={{ paddingLeft: '12px', fontSize: '10px', opacity: 0.8 }}>
                                dilakukan dari jam {hourStr}-{nextHourStr}
                              </div>
                            </div>
                        );
                    }

                    return (
                      <div key={i} style={{ textOverflow: 'ellipsis', whiteSpace: 'nowrap', overflow: 'hidden', width: '100%', display: 'flex', alignItems: 'center' }}>
                        <span style={{ marginRight: '6px', fontSize: '12px', color: c.border }}>•</span> {name}
                      </div>
                    );
                  })}
                </div>
                <div style={{ fontSize: '10px', marginTop: '4px', opacity: 0.85, display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <CalendarOutlined style={{ fontSize: '10px' }} />
                  <span>{isCancelled ? 'Dibatalkan' : `${group[0].periodik || record.periodik}`}</span>
                </div>
                {!isCancelled && !isReadOnly && (
                  <Tooltip title="Batalkan jadwal ini" placement="top">
                    <div className="gantt-cancel-btn" style={{ position: 'absolute', top: '4px', right: '4px', cursor: 'pointer', opacity: 0.6 }} onClick={(e) => { e.stopPropagation(); setCancelModal({ open: true, scheduleId: groupScheduleIds, reason: '' }); }}>
                      <StopOutlined style={{ fontSize: 12, color: '#ff4d4f' }} />
                    </div>
                  </Tooltip>
                )}
              </div>
            </Tooltip>
          );
        };

        return (
          <div {...dropProps}>
            {renderGroup(activeSchedules, false)}
            {renderGroup(cancelledSchedules, true)}
          </div>
        );
      }

      if (isReadOnly) {
        return <div className="gantt-empty-cell"></div>;
      }

      return (
        <Tooltip title="Klik atau Drop untuk menambah asset pada jadwal ini">
          <div className="gantt-empty-cell" {...dropProps} onClick={async () => {
            try {
              setLoading(true);
              const { default: assetService } = await import("../../assetManagement/services/assetService");
              const assetData = await assetService.getAll({ pageSize: 1000 });
              const leafName = record.subKategori !== "-" ? record.subKategori : record.kategori;
              const { assets: filteredAssets } = filterAssetsByCategory(assetData?.data || [], leafName);
              const activeAssets = filteredAssets.filter(a => a.status && a.status.toLowerCase() === 'active');
              setAssets(activeAssets);
              setActiveYearId(record.yearly_standard_id);
              form.setFieldsValue({
                standard_maintenance_id: record.sm_id,
                periodik: record.sm_periodik ? record.sm_periodik.trim().split(/\s+/).map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(" ") : "1 Bulan",
                asset_ids: [],
                next_maintenance_date_range: [dayjs(dString), dayjs(dString).add(1, 'hour')]
              });
              setIsModalVisible(true);
            } catch (e) { message.error("Gagal memuat data formulir"); } finally { setLoading(false); }
          }}></div>
        </Tooltip>
      );
    }
  });

  const dayColumns = days.map((d) => {
    const parentTitle = (
      <Tooltip title={d.isHoliday ? d.holidayDesc : (d.isWeekend ? "Akhir Pekan" : "")}>
        <div className={`calendar-header-cell ${d.isToday && viewMode !== 'daily' ? 'is-today' : ''} ${d.isWeekend ? 'is-weekend' : ''}`} style={d.isHoliday ? { background: '#fff1f0', color: '#cf1322', borderBottom: '2px solid #ffa39e' } : {}}>
          <div className="day-number">{d.dayNum}</div>
          <div className="day-label">{d.label}</div>
        </div>
      </Tooltip>
    );

    if (viewMode === "daily") {
      const minutes = [0, 10, 20, 30, 40, 50];
      return {
        title: parentTitle,
        children: minutes.map((min) => {
          const minStr = min === 0 ? "00" : min.toString();
          const fullDateStr = `${d.dateString.substring(0, 13)}:${minStr}:00`;
          return {
            title: <span style={{ fontSize: '10px', color: '#64748b' }}>{minStr}</span>,
            ...getCellConfig(fullDateStr, d.isHoliday, d.isWeekend, 60)
          };
        })
      };
    }

    return {
      title: parentTitle,
      ...getCellConfig(d.dateString, d.isHoliday, d.isWeekend)
    };
  });

  const yearlyColumns = months.map((m, mIndex) => {
    const daysInMonth = dayjs().year(activeYearStr).month(mIndex).daysInMonth();
    const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);

    return {
      title: m,
      children: daysArray.map((dayNum) => {
        const dateString = dayjs().year(activeYearStr).month(mIndex).date(dayNum).format("YYYY-MM-DD");

        return {
          title: <span style={{ fontSize: '10px', color: '#64748b' }}>{dayNum}</span>,
          dataIndex: `yearly_${dateString}`,
          key: `yearly_${dateString}`,
          width: 160,
          align: "center",
          className: "yearly-day-col",
          onCell: (record, index) => {
            let rs = getRowSpan(schedules, record, index, 'sm_id', []);
            if (rs === 0) return { rowSpan: 0 };
            return { rowSpan: rs, style: { padding: "2px", verticalAlign: "top" } };
          },
          render: (_, record) => {
            const dropPropsYearly = isReadOnly ? {} : {
              style: { minHeight: '22px', height: '100%', width: '100%' },
              onDragOver: (e) => { e.preventDefault(); e.dataTransfer.dropEffect = "move"; },
              onDrop: (e) => {
                e.preventDefault();
                const scheduleId = e.dataTransfer.getData("scheduleId");
                if (scheduleId) {
                  handleDropReschedule(scheduleId, dateString);
                }
              }
            };

            const matchingSchedules = (record.schedules || []).filter(sch => {
              const p = record.periodik?.toLowerCase() || "";
              let show = false;

              const startDayjs = dayjs(sch.next_maintenance_date || dayjs().format("YYYY-MM-DD"));
              const startMonth = startDayjs.month();
              const startDateNum = startDayjs.date();
              const cellDayjs = dayjs(dateString);
              const diffDays = cellDayjs.diff(startDayjs, 'day');

              if (diffDays >= 0) {
                if (p.includes("hari") || p.includes("daily")) {
                  show = true;
                } else if (p.includes("1 minggu") || (p.includes("weekly") && !p.includes("bi"))) {
                  if (diffDays % 7 === 0) show = true;
                } else if (p.includes("2 minggu") || p.includes("bi-weekly") || p.includes("biweekly")) {
                  if (diffDays % 14 === 0) show = true;
                } else {
                  if (dayNum === startDateNum && mIndex >= startMonth) {
                    if (p.includes("1 bulan") || p.includes("monthly") || p === "bulan") {
                      show = true;
                    } else if (p.includes("3 bulan") || p.includes("quarterly")) {
                      if ((mIndex - startMonth) % 3 === 0) show = true;
                    } else if (p.includes("6 bulan") || p.includes("semi-annual") || p.includes("bi-annual") || p.includes("semester")) {
                      if ((mIndex - startMonth) % 6 === 0) show = true;
                    } else if (p.includes("1 tahun") || p.includes("yearly") || p.includes("annual")) {
                      if (mIndex === startMonth) show = true;
                    } else {
                      show = true;
                    }
                  }
                }
              }
              return show && sch.id;
            });

            if (matchingSchedules.length > 0) {
              const activeSchedules = matchingSchedules.filter(sch => sch.status !== 'CANCELLED');
              const cancelledSchedules = matchingSchedules.filter(sch => sch.status === 'CANCELLED');

              const renderGroupYearly = (group, isCancelled) => {
                if (group.length === 0) return null;
                const c = isCancelled ? { bg: '#fff1f0', text: '#cf1322', border: '#ffa39e' } : (colorMap[record.color] || colorMap.blue);

                const titleText = group.map(sch => {
                  const asset = sch.asset;
                  if (!asset) return "-";
                  let name = "";
                  if (asset.hostname && asset.hostname !== "-" && asset.asset_name && asset.asset_name !== "-") {
                    name = `${asset.hostname} (${asset.asset_name})`;
                  } else {
                    name = asset.hostname && asset.hostname !== "-" ? asset.hostname : asset.asset_name;
                  }
                  const codeStr = asset.asset_code !== "-" ? ` [${asset.asset_code}]` : "";
                  return `${name}${codeStr}`;
                }).join(", ");

                const tooltipContentYearly = (
                  <div style={{ padding: '2px 0' }}>
                    <div style={{ fontWeight: 600, fontSize: 13, borderBottom: '1px solid rgba(255,255,255,0.2)', paddingBottom: 4, marginBottom: 4 }}>
                      {titleText} - {dayNum} {m}
                    </div>
                    <ul style={{ paddingLeft: 16, margin: '4px 0', fontSize: 12 }}>
                      {group.map(sch => {
                        let assetName = "";
                        if (sch.asset?.hostname && sch.asset?.hostname !== "-" && sch.asset?.asset_name && sch.asset?.asset_name !== "-") {
                          assetName = `${sch.asset.hostname} (${sch.asset.asset_name})`;
                        } else {
                          assetName = sch.asset?.hostname && sch.asset?.hostname !== "-" ? sch.asset?.hostname : sch.asset?.asset_name;
                        }
                        const codeStr = sch.asset?.asset_code !== "-" ? ` [${sch.asset?.asset_code}]` : "";
                        return <li key={sch.id}>{assetName}{codeStr}</li>;
                      })}
                    </ul>
                    <div style={{ fontSize: 12, lineHeight: 1.5, marginTop: 4 }}>
                      <div><span style={{ opacity: 0.8 }}>Perangkat:</span> {record.perangkat} ({record.jenis})</div>
                      <div><span style={{ opacity: 0.8 }}>Periodik:</span> {group[0].periodik || record.periodik}</div>
                      <div><span style={{ opacity: 0.8 }}>Status:</span> {isCancelled ? <span style={{ color: '#ffa39e', fontWeight: 'bold' }}>Dibatalkan</span> : 'Aktif'}</div>
                    </div>
                  </div>
                );

                const groupScheduleIds = group.map(s => s.id).join(",");

                return (
                  <Tooltip key={isCancelled ? 'cancelled' : 'active'} title={tooltipContentYearly} placement="topLeft">
                    <div
                      className={`yearly-gantt-block${isCancelled ? ' gantt-bar-cancelled' : ''}`}
                      draggable={!isCancelled && !isReadOnly}
                      onDragStart={(e) => {
                        if (isCancelled || isReadOnly) { e.preventDefault(); return; }
                        e.dataTransfer.setData("scheduleId", groupScheduleIds);
                        e.dataTransfer.effectAllowed = "move";
                      }}
                      style={{ 
                        background: isCancelled ? '#fff1f0' : c.bg, 
                        border: `1px solid ${isCancelled ? '#ffa39e' : c.border}`, 
                        color: isCancelled ? '#cf1322' : c.text,
                        display: 'flex', flexDirection: 'column', alignItems: 'flex-start', justifyContent: 'flex-start',
                        height: '100%', minHeight: '60px', width: '100%', borderRadius: '6px',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.05)', opacity: isCancelled ? 0.7 : 1, 
                        cursor: isCancelled ? 'not-allowed' : 'pointer', padding: '8px', textAlign: 'left',
                        gap: '4px', transition: 'all 0.2s ease'
                      }}
                      onClick={async () => {
                        if (isCancelled) return;
                        try {
                          setLoading(true);
                          const { default: assetService } = await import("../../assetManagement/services/assetService");
                          const assetData = await assetService.getAll({ pageSize: 1000 });
                          const leafName = record.subKategori !== "-" ? record.subKategori : record.kategori;
                          const { assets: filteredAssets } = filterAssetsByCategory(assetData?.data || [], leafName);
                          const activeAssets = filteredAssets.filter(a => a.status && a.status.toLowerCase() === 'active');
                          setAssets(activeAssets);
                          setIsEditMode(true);
                          setEditScheduleId(groupScheduleIds);
                          setActiveYearId(record.yearly_standard_id);
                          form.setFieldsValue({
                            standard_maintenance_id: record.sm_id,
                            periodik: group[0].periodik ? group[0].periodik.trim().split(/\s+/).map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(" ") : "1 Bulan",
                            asset_ids: group.map(s => s.asset_id),
                            next_maintenance_date: group[0].next_maintenance_date ? dayjs(group[0].next_maintenance_date) : dayjs(dateString)
                          });
                          setIsModalVisible(true);
                        } catch (e) { message.error("Gagal memuat data formulir"); } finally { setLoading(false); }
                      }}
                    >
                      <div style={{ fontSize: '12px', fontWeight: 600, wordBreak: 'break-word', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', width: '100%', marginBottom: '2px', lineHeight: '1.3' }}>
                        {record.pengecekan}
                      </div>
                      <div style={{ fontSize: '11px', fontWeight: 500, opacity: 0.85, textOverflow: 'ellipsis', whiteSpace: 'nowrap', overflow: 'hidden', width: '100%', marginBottom: '4px' }}>
                        {record.perangkat}
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', width: '100%' }}>
                        {group.map((sch, i) => {
                          const asset = sch.asset;
                          if (!asset) return null;
                          let name = "";
                          if (asset.hostname && asset.hostname !== "-" && asset.asset_name && asset.asset_name !== "-") {
                            name = `${asset.hostname} (${asset.asset_name})`;
                          } else {
                            name = asset.hostname && asset.hostname !== "-" ? asset.hostname : asset.asset_name;
                          }
                          return (
                            <div key={i} style={{ fontSize: '10px', textOverflow: 'ellipsis', whiteSpace: 'nowrap', overflow: 'hidden', width: '100%', display: 'flex', alignItems: 'center', opacity: 0.9 }}>
                              <span style={{ marginRight: '6px', fontSize: '12px', color: c.border }}>•</span> {name}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </Tooltip>
                );
              };

              return (
                <div {...dropPropsYearly} style={{ ...dropPropsYearly.style, display: 'flex', flexDirection: 'column', gap: '2px', alignItems: 'center' }}>
                  {renderGroupYearly(activeSchedules, false)}
                  {renderGroupYearly(cancelledSchedules, true)}
                </div>
              );
            }

            if (isReadOnly) {
              return <div className="gantt-empty-cell"></div>;
            }

            return (
              <Tooltip title="Klik atau Drop untuk menambah asset pada jadwal ini">
                <div className="gantt-empty-cell" {...dropPropsYearly} onClick={async () => {
                  try {
                    setLoading(true);
                    const { default: assetService } = await import("../../assetManagement/services/assetService");
                    const assetData = await assetService.getAll({ pageSize: 1000 });
                    const leafName = record.subKategori !== "-" ? record.subKategori : record.kategori;
                    const { assets: filteredAssets } = filterAssetsByCategory(assetData?.data || [], leafName);
                    const activeAssets = filteredAssets.filter(a => a.status && a.status.toLowerCase() === 'active');
                    setAssets(activeAssets);
                    setActiveYearId(record.yearly_standard_id);
                    form.setFieldsValue({
                      standard_maintenance_id: record.sm_id,
                      periodik: record.sm_periodik ? record.sm_periodik.trim().split(/\s+/).map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(" ") : "1 Bulan",
                      asset_ids: []
                    });
                    setIsModalVisible(true);
                  } catch (e) { message.error("Gagal memuat data formulir"); } finally { setLoading(false); }
                }}></div>
              </Tooltip>
            );
          }
        };
      })
    };
  });

  const groupedDays = days.reduce((acc, day) => {
    const monthKey = dayjs(day.dateString).format("MMM YYYY");
    const lastGroup = acc[acc.length - 1];

    if (lastGroup && lastGroup.key === monthKey) {
      lastGroup.days.push(day);
      return acc;
    }

    acc.push({
      key: monthKey,
      title: dayjs(day.dateString).format("MMMM YYYY").toUpperCase(),
      days: [day],
    });

    return acc;
  }, []);

  const getSchedulesForDate = (record, dateString) =>
    (record.schedules || []).filter((sch) => {
      if (sch.status === "CANCELLED") return false;
      const scheduleDate = dayjs(sch.next_maintenance_date || dayjs().format("YYYY-MM-DD")).format("YYYY-MM-DD");
      return scheduleDate === dateString;
    });

  const renderChecklistState = (matchingSchedules) => {
    const completedCount = matchingSchedules.filter((sch) => sch.status === "COMPLETED").length;

    if (matchingSchedules.length === 0) return "empty";
    if (completedCount === matchingSchedules.length) return "checked";
    if (completedCount > 0) return "partial";
    return "pending";
  };

  const checklistLeftColumns = [
    {
      title: "No",
      dataIndex: "no",
      key: "no",
      width: 52,
      align: "center",
      className: "excel-col",
    },
    {
      title: "Kategori",
      dataIndex: "kategori",
      key: "kategori",
      width: 130,
      className: "excel-col",
      onCell: (record, index) => ({
        rowSpan: getRowSpan(schedules, record, index, "kategori"),
        style: { verticalAlign: "top", background: "#fff" },
      }),
    },
    {
      title: "Nama Perangkat",
      dataIndex: "perangkat",
      key: "perangkat",
      width: 150,
      className: "excel-col",
      onCell: (record, index) => ({
        rowSpan: getRowSpan(schedules, record, index, "perangkat", ["kategori"]),
        style: { verticalAlign: "top", background: "#fff" },
      }),
    },
    {
      title: "Sub Perangkat",
      dataIndex: "jenis",
      key: "jenis",
      width: 140,
      className: "excel-col",
      onCell: (record, index) => ({
        rowSpan: getRowSpan(schedules, record, index, "jenis", ["kategori", "perangkat"]),
        style: { verticalAlign: "top", background: "#fff" },
      }),
    },
    {
      title: "Fungsi",
      dataIndex: "fungsi",
      key: "fungsi",
      width: 130,
      className: "excel-col",
      onCell: (record, index) => ({
        rowSpan: getRowSpan(schedules, record, index, "fungsi", ["kategori", "perangkat", "jenis"]),
        style: { verticalAlign: "top", background: "#fff" },
      }),
    },
    {
      title: "DESC",
      dataIndex: "deskripsi",
      key: "deskripsi",
      width: 150,
      className: "excel-col",
      onCell: (record, index) => ({
        rowSpan: getRowSpan(schedules, record, index, "deskripsi", ["kategori", "perangkat", "jenis", "fungsi"]),
        style: { verticalAlign: "top", background: "#fff" },
      }),
    },
    {
      title: "Pengecekan",
      dataIndex: "pengecekan",
      key: "pengecekan",
      width: 160,
      className: "excel-col",
    },
    {
      title: "Aplikasi",
      children: [
        {
          title: "Standart",
          dataIndex: "standard",
          key: "standard",
          width: 140,
          className: "excel-col",
        },
        {
          title: "Bagian",
          dataIndex: "bagian",
          key: "bagian",
          width: 130,
          className: "excel-col",
        },
        {
          title: "Methode",
          dataIndex: "metode",
          key: "metode",
          width: 120,
          className: "excel-col",
        },
        {
          title: "Alat",
          dataIndex: "alat",
          key: "alat",
          width: 110,
          className: "excel-col",
        },
      ],
    },
    {
      title: "Periodik",
      dataIndex: "periodik",
      key: "periodik",
      width: 86,
      align: "center",
      className: "excel-col",
    },
    {
      title: "Aksi",
      key: "aksi",
      width: 64,
      align: "center",
      className: "excel-col",
      render: (_, record) =>
        isReadOnly ? null : (
          <Tooltip title="Copy Schedule">
            <Button
              size="small"
              type="text"
              icon={<CopyOutlined style={{ color: "#1677ff" }} />}
              onClick={() => {
                setCopySourceSMId(record.sm_id);
                setIsCopyModalVisible(true);
              }}
            />
          </Tooltip>
        ),
    },
  ];

  const checklistDayColumns = groupedDays.map((group) => ({
    title: group.title,
    children: group.days.map((day) => ({
      title: (
        <div className={`maintenance-excel__day-head${day.isWeekend ? " is-weekend" : ""}${day.isHoliday ? " is-holiday" : ""}`}>
          <div className="maintenance-excel__day-num">{day.dayNum}</div>
          <div className="maintenance-excel__day-label">{String(day.label).toUpperCase()}</div>
        </div>
      ),
      dataIndex: `check_${day.dateString}`,
      key: `check_${day.dateString}`,
      width: 40,
      align: "center",
      className: "maintenance-excel__day-col",
      render: (_, record) => {
        const matchingSchedules = getSchedulesForDate(record, day.dateString);
        const state = renderChecklistState(matchingSchedules);
        const scheduleIds = matchingSchedules.map((sch) => sch.id);
        const canToggle = !isReadOnly && scheduleIds.length > 0;
        const blockedState = day.isHoliday ? "holiday" : day.isWeekend ? "weekend" : "";
        const cellState = scheduleIds.length > 0 ? state : blockedState || "empty";

        return (
          <button
            type="button"
            disabled={!canToggle}
            className={`maintenance-excel__check-btn is-${cellState}${canToggle ? " is-clickable" : ""}`}
            onClick={() => {
              if (!canToggle) return;
              handleToggleChecklist?.(scheduleIds, state !== "checked");
            }}
          >
            {state === "checked" ? <CheckOutlined /> : state === "partial" ? <MinusOutlined /> : null}
          </button>
        );
      },
    })),
  }));

  const checklistColumns = [
    ...checklistLeftColumns,
    ...checklistDayColumns,
  ];

  const columns = [
    { title: "No", dataIndex: "no", key: "no", width: 40, align: "center", fixed: "left", className: "sm-col" },
    {
      title: "", dataIndex: "aksi", key: "aksi", width: 36, align: "center", fixed: "left",
      onCell: (record, index) => ({ rowSpan: getRowSpan(schedules, record, index, 'sm_id', []), style: { verticalAlign: 'middle', background: '#fff' } }),
      render: (_, record) => (
        isReadOnly ? null : (
          <Tooltip title="Copy Schedule">
            <Button size="small" type="text" icon={<CopyOutlined style={{ color: '#1677ff' }} />} onClick={() => {
              setCopySourceSMId(record.sm_id);
              setIsCopyModalVisible(true);
            }} />
          </Tooltip>
        )
      )
    },
    {
      title: "Perangkat", dataIndex: "perangkat", key: "perangkat", width: 110, fixed: "left", className: "sm-col",
      onCell: (record, index) => ({ rowSpan: getRowSpan(schedules, record, index, 'perangkat', []), style: { verticalAlign: 'top', background: '#fff' } })
    },
    {
      title: "Jenis", dataIndex: "jenis", key: "jenis", width: 110, fixed: "left", className: "sm-col",
      onCell: (record, index) => ({ rowSpan: getRowSpan(schedules, record, index, 'jenis', ['perangkat']), style: { verticalAlign: 'top', background: '#fff' } })
    },
    {
      title: "Fungsi", dataIndex: "fungsi", key: "fungsi", width: 130, className: "sm-col",
      onCell: (record, index) => ({ rowSpan: getRowSpan(schedules, record, index, 'fungsi', ['perangkat', 'jenis']), style: { verticalAlign: 'top', background: '#fff' } })
    },
    {
      title: "Deskripsi", dataIndex: "deskripsi", key: "deskripsi", width: 160, className: "sm-col",
      onCell: (record, index) => ({ rowSpan: getRowSpan(schedules, record, index, 'deskripsi', ['perangkat', 'jenis', 'fungsi']), style: { verticalAlign: 'top', background: '#fff' } })
    },
    {
      title: "Pengecekan", dataIndex: "pengecekan", key: "pengecekan", width: 160, className: "sm-col",
      onCell: (record, index) => ({ rowSpan: getRowSpan(schedules, record, index, 'pengecekan', ['perangkat', 'jenis', 'fungsi', 'deskripsi']), style: { verticalAlign: 'top', background: '#fff' } })
    },
    {
      title: "Standard", dataIndex: "standard", key: "standard", width: 130, className: "sm-col",
      onCell: (record, index) => ({ rowSpan: getRowSpan(schedules, record, index, 'standard', ['perangkat', 'jenis', 'fungsi', 'deskripsi', 'pengecekan']), style: { verticalAlign: 'top', background: '#fff' } })
    },
    {
      title: "Bagian", dataIndex: "bagian", key: "bagian", width: 100, className: "sm-col",
      onCell: (record, index) => ({ rowSpan: getRowSpan(schedules, record, index, 'bagian', ['perangkat', 'jenis', 'fungsi', 'deskripsi', 'pengecekan', 'standard']), style: { verticalAlign: 'top', background: '#fff' } })
    },
    {
      title: "Periodik", dataIndex: "periodik", key: "periodik", width: 80, className: "sm-col",
      onCell: (record, index) => ({ rowSpan: getRowSpan(schedules, record, index, 'periodik', ['perangkat', 'jenis', 'fungsi', 'deskripsi', 'pengecekan', 'standard', 'bagian']), style: { verticalAlign: 'top', background: '#fff' } })
    },
    {
      title: (
        <div className="calendar-week-header">
          <CalendarOutlined style={{ marginRight: 8 }} />
          {Array.isArray(currentDate) && currentDate[0] && currentDate[1] 
            ? `Periode (${currentDate[0].format('DD MMM')} - ${currentDate[1].format('DD MMM YYYY')})` 
            : `Periode`}
        </div>
      ),
      children: dayColumns,
    },
  ];

  const baseYearlyCols = [
    { title: "No", dataIndex: "no", key: "no", width: 60, align: "center", fixed: "left" },
    {
      title: "Aksi", dataIndex: "aksi", key: "aksi", width: 50, align: "center", fixed: "left",
      onCell: (record, index) => ({ rowSpan: getRowSpan(schedules, record, index, 'sm_id', []), style: { verticalAlign: 'middle', background: '#fff' } }),
      render: (_, record) => (
        isReadOnly ? null : (
          <Tooltip title="Copy Schedule">
            <Button size="small" type="text" icon={<CopyOutlined style={{ color: '#1677ff' }} />} onClick={() => {
              setCopySourceSMId(record.sm_id);
              setIsCopyModalVisible(true);
            }} />
          </Tooltip>
        )
      )
    },
    {
      title: "Kategori", dataIndex: "kategori", key: "kategori", width: 140, fixed: "left",
      onCell: (record, index) => ({ rowSpan: getRowSpan(schedules, record, index, 'kategori'), style: { verticalAlign: 'top', background: '#fff' } })
    },
    {
      title: "Perangkat", dataIndex: "perangkat", key: "perangkat", width: 150, fixed: "left",
      onCell: (record, index) => ({ rowSpan: getRowSpan(schedules, record, index, 'perangkat', ['kategori']), style: { verticalAlign: 'top', background: '#fff' } })
    },
    {
      title: "Jenis", dataIndex: "jenis", key: "jenis", width: 150, fixed: "left",
      onCell: (record, index) => ({ rowSpan: getRowSpan(schedules, record, index, 'jenis', ['kategori', 'perangkat']), style: { verticalAlign: 'top', background: '#fff' } })
    },
    {
      title: "Fungsi", dataIndex: "fungsi", key: "fungsi", width: 150,
      onCell: (record, index) => ({ rowSpan: getRowSpan(schedules, record, index, 'fungsi', ['kategori', 'perangkat', 'jenis']), style: { verticalAlign: 'top', background: '#fff' } })
    },
    {
      title: "Deskripsi", dataIndex: "deskripsi", key: "deskripsi", width: 200,
      onCell: (record, index) => ({ rowSpan: getRowSpan(schedules, record, index, 'deskripsi', ['kategori', 'perangkat', 'jenis', 'fungsi']), style: { verticalAlign: 'top', background: '#fff' } })
    },
    { title: "Pengecekan", dataIndex: "pengecekan", key: "pengecekan", width: 200, onCell: () => ({ style: { background: '#fff' } }) },
    { title: "Standard", dataIndex: "standard", key: "standard", width: 150, onCell: () => ({ style: { background: '#fff' } }) },
    { title: "Bagian", dataIndex: "bagian", key: "bagian", width: 120, onCell: () => ({ style: { background: '#fff' } }) },
    { title: "Periodik", dataIndex: "periodik", key: "periodik", width: 100, onCell: () => ({ style: { background: '#fff' } }) },
    {
      title: "Jadwal Tahunan (Standard)",
      children: yearlyColumns
    }
  ];

  if (viewMode === "yearly") return baseYearlyCols;
  if (viewMode === "daily") return columns;
  return checklistColumns;
};
