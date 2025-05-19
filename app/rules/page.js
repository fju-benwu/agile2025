"use client";
import React, { useEffect, useState } from "react";
import { getFirestore, collection, getDocs, doc, getDoc } from "firebase/firestore";
import app from "@/app/_firebase/Config";

// 初始化 Firestore
const db = getFirestore(app);

// 簡化的樣式
const styles = {
  container: {
    fontFamily: "'Microsoft JhengHei', Arial, sans-serif",
    maxWidth: 1200,
    margin: "0 auto",
    padding: 20,
    backgroundColor: "#f8f9fa"
  },
  card: {
    backgroundColor: "white",
    borderRadius: 8,
    padding: 24,
    boxShadow: "0 2px 10px rgba(0, 0, 0, 0.08)",
    marginBottom: 20
  },
  header: {
    backgroundColor: "#f8f9fa",
    color: "#1f2937",
    padding: 24,
    textAlign: "center",
    borderRadius: 8,
    marginBottom: 24,
    border: "1px solid #e5e7eb"
  },
  controlRow: {
    display: "flex",
    gap: 16,
    marginBottom: 20,
    flexWrap: "wrap"
  },
  controlGroup: {
    display: "flex",
    flexDirection: "column",
    minWidth: 150
  },
  label: {
    fontWeight: 500,
    color: "#374151",
    marginBottom: 4,
    fontSize: "14px"
  },
  select: {
    padding: "8px 12px",
    border: "1px solid #d1d5db",
    borderRadius: 6,
    fontSize: 14,
    backgroundColor: "white"
  },
  button: {
    padding: "8px 16px",
    border: "none",
    borderRadius: 6,
    cursor: "pointer",
    fontSize: 14,
    fontWeight: 500,
    backgroundColor: "#4f46e5",
    color: "white",
    transition: "background-color 0.2s"
  },
  buttonDisabled: {
    backgroundColor: "#9ca3af",
    cursor: "not-allowed"
  },
  searchBox: {
    padding: "8px 12px",
    border: "1px solid #d1d5db",
    borderRadius: 6,
    fontSize: 14,
    flex: 1,
    minWidth: 200
  },
  statsRow: {
    display: "flex",
    gap: 16,
    marginBottom: 20
  },
  statCard: {
    flex: 1,
    textAlign: "center",
    padding: 16,
    backgroundColor: "#f3f4f6",
    borderRadius: 6,
    border: "1px solid #e5e7eb"
  },
  statNumber: {
    fontSize: "24px",
    fontWeight: "700",
    color: "#1f2937",
    margin: 0
  },
  statLabel: {
    fontSize: "12px",
    color: "#6b7280",
    margin: "4px 0 0 0"
  },
  courseGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
    gap: 12
  },
  courseCard: {
    backgroundColor: "white",
    border: "1px solid #e5e7eb",
    borderRadius: 6,
    padding: 16,
    transition: "all 0.2s"
  },
  courseName: {
    fontSize: "16px",
    fontWeight: 600,
    color: "#1f2937",
    marginBottom: 8,
    lineHeight: 1.3
  },
  courseDetails: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center"
  },
  courseType: {
    padding: "4px 8px",
    borderRadius: 4,
    fontSize: "12px",
    fontWeight: 500
  },
  required: {
    backgroundColor: "#fef2f2",
    color: "#991b1b",
    border: "1px solid #fecaca"
  },
  elective: {
    backgroundColor: "#eff6ff",
    color: "#1d4ed8",
    border: "1px solid #bfdbfe"
  },
  courseCredit: {
    fontSize: "14px",
    color: "#6b7280",
    fontWeight: 500
  },
  loading: {
    textAlign: "center",
    padding: 40,
    color: "#6b7280"
  },
  emptyState: {
    textAlign: "center",
    padding: 40,
    color: "#9ca3af"
  },
  message: {
    padding: 12,
    borderRadius: 6,
    marginBottom: 16,
    fontSize: "14px"
  },
  errorMessage: {
    backgroundColor: "#fef2f2",
    border: "1px solid #fecaca",
    color: "#991b1b"
  },
  successMessage: {
    backgroundColor: "#f0fdf4",
    border: "1px solid #bbf7d0",
    color: "#166534"
  }
};

export default function SimplifiedCourseDisplay() {
  // 狀態管理
  const [academicYears, setAcademicYears] = useState([]);
  const [selectedYear, setSelectedYear] = useState("");
  const [studentTypes] = useState(["一般生", "在職生"]);
  const [selectedType, setSelectedType] = useState("");
  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState("");
  const [courses, setCourses] = useState({});
  const [filteredCourses, setFilteredCourses] = useState({});
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [message, setMessage] = useState({ type: "", text: "" });

  // 載入學年度
  const loadAcademicYears = async () => {
    try {
      setInitialLoading(true);
      const snapshot = await getDocs(collection(db, '修業規則'));
      const years = snapshot.docs.map(doc => doc.id).sort();
      setAcademicYears(years);
      setInitialLoading(false);
    } catch (error) {
      console.error('Error loading academic years:', error);
      setMessage({ type: "error", text: "載入學年度失敗：" + error.message });
      setInitialLoading(false);
    }
  };

  // 載入組別
  const loadGroups = (studentType) => {
    if (studentType === "一般生") {
      setGroups(["人工智慧組", "電子商務組"]);
    } else {
      setGroups([]);
      setSelectedGroup("");
    }
  };

  // 從 Firestore 載入課程資料
  const loadCoursesFromFirestore = async (academicYear, studentType, group = null) => {
    try {
      setLoading(true);
      let coursesData = {};

      console.log('Loading courses for:', academicYear, studentType, group);

      if (studentType === "在職生") {
        // 在職生路徑：修業規則/{學年度}/在職生 (3個段落 = 奇數，有效)
        const coursesSnapshot = await getDocs(collection(db, '修業規則', academicYear, '在職生'));
        coursesSnapshot.forEach(doc => {
          coursesData[doc.id] = doc.data();
        });
      } else if (studentType === "一般生") {
        if (!group) {
          setMessage({ type: "error", text: "請選擇組別" });
          setLoading(false);
          return {};
        }

        // 正確路徑：修業規則/{學年度}/一般生/{組別}/課程/[課程文件]
        const coursesSnapshot = await getDocs(
          collection(db, "修業規則", academicYear, "一般生", group, "課程")
        );
        console.log('找到的課程數量:', coursesSnapshot.size);

        coursesSnapshot.forEach(doc => {
          coursesData[doc.id] = doc.data();
        });
      }

      setCourses(coursesData);
      setLoading(false);
      
      // 顯示載入結果
      if (Object.keys(coursesData).length > 0) {
        setMessage({ type: "success", text: `成功載入 ${Object.keys(coursesData).length} 門課程` });
      } else {
        setMessage({ type: "error", text: "找不到課程資料" });
      }
      
      return coursesData;
    } catch (error) {
      console.error('Error loading courses:', error);
      setLoading(false);
      setMessage({ type: "error", text: "載入課程資料失敗：" + error.message });
      return {};
    }
  };

  // 計算統計資訊
  const calculateStats = (coursesData) => {
    const courses = Object.values(coursesData);
    const totalCourses = courses.length;
    const totalCredits = courses.reduce((sum, course) => sum + (course.學分 || 0), 0);
    const requiredCredits = courses
      .filter(course => course.選別 === '必修')
      .reduce((sum, course) => sum + (course.學分 || 0), 0);
    const electiveCredits = courses
      .filter(course => course.選別 === '選修')
      .reduce((sum, course) => sum + (course.學分 || 0), 0);

    return { totalCourses, totalCredits, requiredCredits, electiveCredits };
  };

  // 載入課程
  const handleLoadCourses = async () => {
    if (!selectedYear || !selectedType) {
      setMessage({ type: "error", text: "請選擇學年度和學制" });
      return;
    }

    if (selectedType === "一般生" && !selectedGroup) {
      setMessage({ type: "error", text: "請選擇組別" });
      return;
    }

    try {
      await loadCoursesFromFirestore(selectedYear, selectedType, selectedGroup);
    } catch (error) {
      setMessage({ type: "error", text: "載入課程失敗：" + error.message });
    }
  };

  // 篩選課程
  const filterCourses = () => {
    let filtered = { ...courses };

    // 按課程類型篩選
    if (filterType !== "all") {
      filtered = Object.fromEntries(
        Object.entries(filtered).filter(([name, course]) => course.選別 === filterType)
      );
    }

    // 按搜尋詞篩選
    if (searchTerm) {
      filtered = Object.fromEntries(
        Object.entries(filtered).filter(([name]) =>
          name.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }

    setFilteredCourses(filtered);
  };

  // Effects
  useEffect(() => {
    loadAcademicYears();
  }, []);

  useEffect(() => {
    if (selectedType) {
      loadGroups(selectedType);
      // 清空課程資料當學制改變時
      setCourses({});
      setFilteredCourses({});
    }
  }, [selectedType]);

  useEffect(() => {
    // 當學年度改變時，清空課程資料
    setCourses({});
    setFilteredCourses({});
  }, [selectedYear]);

  useEffect(() => {
    // 當組別改變時，清空課程資料
    setCourses({});
    setFilteredCourses({});
  }, [selectedGroup]);

  useEffect(() => {
    filterCourses();
  }, [courses, searchTerm, filterType]);

  useEffect(() => {
    if (message.text) {
      const timer = setTimeout(() => {
        setMessage({ type: "", text: "" });
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  const stats = calculateStats(filteredCourses);

  if (initialLoading) {
    return (
      <div style={styles.container}>
        <div style={styles.loading}>
          <p>載入系統中...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* 只保留純文字標題 */}
      <div style={{ textAlign: "center", margin: "24px 0 12px 0", fontSize: "22px", fontWeight: 600 }}>
        修業規則
      </div>

      {/* 控制面板 */}
      <div style={styles.card}>
        <h3 style={{ margin: "0 0 16px 0", color: "#374151" }}>選擇條件</h3>
        <div style={styles.controlRow}>
          <div style={styles.controlGroup}>
            <label style={styles.label}>學年度</label>
            <select
              style={styles.select}
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              disabled={academicYears.length === 0}
            >
              <option value="">請選擇</option>
              {academicYears.map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>

          <div style={styles.controlGroup}>
            <label style={styles.label}>學制</label>
            <select
              style={styles.select}
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              disabled={!selectedYear}
            >
              <option value="">請選擇</option>
              {studentTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>

          {selectedType === "一般生" && (
            <div style={styles.controlGroup}>
              <label style={styles.label}>組別</label>
              <select
                style={styles.select}
                value={selectedGroup}
                onChange={(e) => setSelectedGroup(e.target.value)}
              >
                <option value="">請選擇</option>
                {groups.map(group => (
                  <option key={group} value={group}>{group}</option>
                ))}
              </select>
            </div>
          )}

          <div style={styles.controlGroup}>
            <label style={styles.label}>&nbsp;</label>
            <button
              style={{
                ...styles.button,
                ...(loading || !selectedYear || !selectedType || (selectedType === "一般生" && !selectedGroup) 
                   ? styles.buttonDisabled : {})
              }}
              onClick={handleLoadCourses}
              disabled={loading || !selectedYear || !selectedType || (selectedType === "一般生" && !selectedGroup)}
            >
              {loading ? '載入中...' : '載入課程'}
            </button>
          </div>
        </div>

        {/* 訊息顯示 */}
        {message.text && (
          <div style={{
            ...styles.message,
            ...(message.type === 'error' ? styles.errorMessage : styles.successMessage)
          }}>
            {message.text}
          </div>
        )}
      </div>

      

      {/* 課程列表 */}
      <div style={styles.card}>
        <h3 style={{ margin: "0 0 16px 0", color: "#374151" }}>課程列表</h3>

        {/* 統計資訊與搜尋/篩選同一行，左統計右搜尋 */}
        {Object.keys(courses).length > 0 && (
          <div style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 12,
            marginBottom: 12,
            flexWrap: "wrap"
          }}>
            {/* 統計資訊（縮小） */}
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <div style={{ fontSize: 13, color: "#374151", background: "#f3f4f6", borderRadius: 4, padding: "4px 10px", border: "1px solid #e5e7eb" }}>
                總課程數：{stats.totalCourses}
              </div>
              <div style={{ fontSize: 13, color: "#374151", background: "#f3f4f6", borderRadius: 4, padding: "4px 10px", border: "1px solid #e5e7eb" }}>
                總學分數：{stats.totalCredits}
              </div>
              <div style={{ fontSize: 13, color: "#991b1b", background: "#fef2f2", borderRadius: 4, padding: "4px 10px", border: "1px solid #fecaca" }}>
                必修學分：{stats.requiredCredits}
              </div>
              <div style={{ fontSize: 13, color: "#1d4ed8", background: "#eff6ff", borderRadius: 4, padding: "4px 10px", border: "1px solid #bfdbfe" }}>
                選修學分：{stats.electiveCredits}
              </div>
            </div>
            {/* 搜尋與篩選 */}
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <input
                style={{ ...styles.searchBox, maxWidth: 180, fontSize: 13, padding: "6px 10px" }}
                type="text"
                placeholder="搜尋課程名稱..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <select
                style={{ ...styles.select, fontSize: 13, padding: "6px 10px", minWidth: 90 }}
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
              >
                <option value="all">全部</option>
                <option value="必修">必修</option>
                <option value="選修">選修</option>
              </select>
            </div>
          </div>
        )}

        {loading ? (
          <div style={styles.loading}>
            <p>載入課程資料中...</p>
          </div>
        ) : Object.keys(filteredCourses).length === 0 ? (
          <div style={styles.emptyState}>
            {Object.keys(courses).length === 0 ? (
              <>
                <p>尚未載入課程資料</p>
                <p style={{ fontSize: "14px", margin: "8px 0 0 0" }}>
                  請選擇條件並點擊「載入課程」按鈕
                </p>
              </>
            ) : (
              <>
                <p>沒有符合條件的課程</p>
                <p style={{ fontSize: "14px", margin: "8px 0 0 0" }}>
                  請調整搜尋條件或篩選設定
                </p>
              </>
            )}
          </div>
        ) : (
          <div style={styles.courseGrid}>
            {Object.entries(filteredCourses)
              .sort(([, a], [, b]) => {
                // 必修優先，然後依課程名稱排序
                if (a.選別 === b.選別) {
                  return a.課程名稱?.localeCompare?.(b.課程名稱) ?? 0;
                }
                return a.選別 === '必修' ? -1 : 1;
              })
              .map(([name, course]) => (
                <div
                  key={name}
                  style={styles.courseCard}
                >
                  <div style={styles.courseName}>{name}</div>
                  <div style={styles.courseDetails}>
                    <span
                      style={{
                        ...styles.courseType,
                        ...(course.選別 === '必修' ? styles.required : styles.elective)
                      }}
                    >
                      {course.選別}
                    </span>
                    <span style={styles.courseCredit}>
                      {course.學分} 學分
                    </span>
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>
    </div>
  );
}