import { useState, useEffect, useCallback } from "react";
import dayjs from "dayjs";
import isBetween from "dayjs/plugin/isBetween";
import { message } from "antd";

import maintenanceScheduleService from "../services/maintenanceScheduleService";
import holidayService from "../services/holidayService";

dayjs.extend(isBetween);

const colorKeys = [
    "blue", "green", "purple", "orange", "cyan",
];

export default function useScheduleData(viewMode) {
    const [schedules, setSchedules] = useState([]);
    const [loading, setLoading] = useState(false);
    const [holidays, setHolidays] = useState([]);
    const [standards, setStandards] = useState([]);
    const [currentDate, setCurrentDate] = useState([
        dayjs().startOf("week").add(1, "day"),
        dayjs().endOf("week").add(1, "day")
    ]);
    const [days, setDays] = useState([]);
    const [activeYearId, setActiveYearId] = useState(null);

    const loadHolidays = useCallback(async () => {
        try {
            const res = await holidayService.getAll();
            setHolidays(res.data || []);
        } catch (error) {
            console.error("Failed to load holidays", error);
        }
    }, []);

    useEffect(() => {
        loadHolidays();
    }, [loadHolidays]);

    // Generate days based on viewMode & holidays
    useEffect(() => {
        let numDays = 7;
        let startD = Array.isArray(currentDate) ? currentDate[0] : currentDate;

        if (Array.isArray(currentDate) && currentDate.length === 2 && currentDate[0] && currentDate[1]) {
            startD = currentDate[0];
            numDays = currentDate[1].diff(currentDate[0], 'day') + 1;
        } else if (!Array.isArray(currentDate) && currentDate) {
            startD = currentDate;
            if (viewMode === "daily") {
                numDays = 1;
            } else if (viewMode === "monthly") {
                numDays = currentDate.daysInMonth();
                startD = currentDate.startOf("month");
            }
        }

        let generatedDays = [];
        if (viewMode === "daily") {
            generatedDays = Array.from({ length: 12 }).map((_, i) => {
                const hour = 7 + i;
                const hourDate = startD.hour(hour).minute(0).second(0);
                const dtStr = hourDate.format("YYYY-MM-DD HH:00:00");
                return {
                    dateString: dtStr,
                    dayNum: hourDate.format("HH:00"),
                    label: "Jam",
                    isWeekend: false,
                    isToday: startD.isSame(dayjs(), "day"),
                    isHoliday: false,
                    holidayDesc: "",
                };
            });
        } else {
            generatedDays = Array.from({ length: numDays }).map((_, i) => {
                const date = startD.add(i, "day");
                const dtStr = date.format("YYYY-MM-DD");
                const foundHoliday = holidays.find(
                    (h) => h.holiday_date === dtStr
                );

                return {
                    dateString: dtStr,
                    dayNum: date.date(),
                    label: date.format("ddd"),
                    isWeekend: date.day() === 0 || date.day() === 6,
                    isToday: date.isSame(dayjs(), "day"),
                    isHoliday: !!foundHoliday,
                    holidayDesc: foundHoliday ? foundHoliday.description : "",
                };
            });
        }
        setDays(generatedDays);
    }, [currentDate, viewMode, holidays]);

    const loadData = useCallback(async () => {
        try {
            setLoading(true);
            const { default: standardService } = await import(
                "../services/standardMaintenanceService"
            );
            const years = await standardService.getYears();

            if (!years || years.length === 0) {
                setSchedules([]);
                setLoading(false);
                return;
            }
            const activeYearIdVal = years[0].id;
            setActiveYearId(activeYearIdVal);

            const { default: assetService } = await import(
                "../../assetManagement/services/assetService"
            );

            const [standardsRes, schedulesRes, catData] =
                await Promise.all([
                    standardService.getAll(activeYearIdVal),
                    maintenanceScheduleService.getSchedules(
                        activeYearIdVal
                    ),
                    assetService
                        .getCategories({ all: true })
                        .catch(() => []),
                ]);
            const categories = Array.isArray(catData) ? catData : [];

            setStandards(standardsRes);

            const result = [];
            let rowIdx = 1;

            // Group schedules by standard_maintenance_id
            const scheduleMap = {};
            schedulesRes.forEach((sch) => {
                if (sch.status === "CANCELLED") return;
                const smId =
                    sch.standard_maintenance_id ||
                    sch.StandardMaintenance?.id;
                if (smId) {
                    if (!scheduleMap[smId]) scheduleMap[smId] = [];
                    scheduleMap[smId].push(sch);
                }
            });

            standardsRes.forEach((sm, index) => {
                const randomOffset = index % 5;
                const baseDate = Array.isArray(currentDate) ? currentDate[0] : currentDate;

                const pushItemRows = (schedulesArr, isSchedule) => {
                    if (
                        sm.details &&
                        sm.details.length > 0
                    ) {
                        sm.details.forEach((detail) => {
                            if (
                                detail.pengecekanList &&
                                detail.pengecekanList.length > 0
                            ) {
                                detail.pengecekanList.forEach(
                                    (cek) => {
                                        result.push({
                                            key: `sm-${sm.id}-det-${detail.id}-cek-${cek.id}`,
                                            no: rowIdx++,
                                            kategori:
                                                sm.kategori ||
                                                "-",
                                            subKategori:
                                                sm.subKategori ||
                                                "-",
                                            perangkat:
                                                sm.namaPerangkat ||
                                                "-",
                                            jenis:
                                                sm.subPerangkat ||
                                                sm.tipePerangkat ||
                                                "-",
                                            fungsi:
                                                detail.fungsi ||
                                                "-",
                                            deskripsi:
                                                detail.deskripsi ||
                                                "-",
                                            pengecekan:
                                                cek.pengecekan ||
                                                "-",
                                            standard:
                                                cek.standard ||
                                                "-",
                                            bagian:
                                                cek.bagian ||
                                                "-",
                                            metode:
                                                cek.metode ||
                                                "-",
                                            alat:
                                                cek.alat || "-",
                                            periodik:
                                                cek.periodik
                                                    ? cek.periodik
                                                        .trim()
                                                        .split(/\s+/)
                                                        .map(
                                                            (w) =>
                                                                w
                                                                    .charAt(0)
                                                                    .toUpperCase() +
                                                                w
                                                                    .slice(1)
                                                                    .toLowerCase()
                                                        )
                                                        .join(" ")
                                                    : "-",
                                            span: 1,
                                            task: cek.pengecekan,
                                            color: colorKeys[
                                                rowIdx %
                                                colorKeys.length
                                            ],
                                            sm_id: sm.id,
                                            sm_periodik:
                                                cek.periodik,
                                            yearly_standard_id:
                                                sm.yearly_standard_id ||
                                                activeYearIdVal,
                                            schedules: isSchedule
                                                ? schedulesArr
                                                : [],
                                        });
                                    }
                                );
                            }
                        });
                    }
                };

                const relatedSchedules = scheduleMap[sm.id];
                if (
                    relatedSchedules &&
                    relatedSchedules.length > 0
                ) {
                    pushItemRows(relatedSchedules, true);
                } else {
                    pushItemRows([], false);
                }
            });

            // Sort by category sort_no
            result.sort((a, b) => {
                const getCat = (name, parentName) => {
                    if (!parentName)
                        return categories.find(
                            (c) => c.category_name === name
                        );
                    const parent = categories.find(
                        (c) => c.category_name === parentName
                    );
                    if (!parent) return null;
                    return categories.find(
                        (c) =>
                            c.category_name === name &&
                            c.parent_id === parent.category_id
                    );
                };

                const katA = getCat(a.kategori);
                const katB = getCat(b.kategori);
                const orderKatA = katA?.sort_no || 0;
                const orderKatB = katB?.sort_no || 0;

                if (a.kategori !== b.kategori) {
                    return (
                        orderKatA - orderKatB ||
                        (a.kategori || "").localeCompare(
                            b.kategori || ""
                        )
                    );
                }

                const subA = getCat(
                    a.subKategori,
                    a.kategori
                );
                const subB = getCat(
                    b.subKategori,
                    b.kategori
                );
                const orderSubA = subA?.sort_no || 0;
                const orderSubB = subB?.sort_no || 0;

                if (a.subKategori !== b.subKategori) {
                    return (
                        orderSubA - orderSubB ||
                        (a.subKategori || "").localeCompare(
                            b.subKategori || ""
                        )
                    );
                }

                if (a.perangkat !== b.perangkat)
                    return a.perangkat.localeCompare(
                        b.perangkat
                    );
                if (a.jenis !== b.jenis)
                    return (a.jenis || "").localeCompare(
                        b.jenis || ""
                    );
                if (a.fungsi !== b.fungsi)
                    return (a.fungsi || "").localeCompare(
                        b.fungsi || ""
                    );
                if (a.pengecekan !== b.pengecekan)
                    return (
                        a.pengecekan || ""
                    ).localeCompare(b.pengecekan || "");
                return 0;
            });

            result.forEach((r, idx) => {
                r.no = idx + 1;
            });

            setSchedules(result);
        } catch (err) {
            console.error(err);
            message.error("Gagal memuat jadwal maintenance");
        } finally {
            setLoading(false);
        }
    }, [viewMode, currentDate]);

    useEffect(() => {
        loadData();
    }, [viewMode, loadData]);

    const reload = useCallback(() => {
        loadData();
    }, [loadData]);

    return {
        schedules,
        loading,
        holidays,
        standards,
        currentDate,
        days,
        activeYearId,
        setCurrentDate,
        loadHolidays,
        reload,
    };
}