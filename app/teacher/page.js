'use client';
import { useEffect, useState } from 'react';
import { getFirestore, collection, query, where, getDocs } from 'firebase/firestore';
import app from "@/app/_firebase/Config";

export default function ConsolidatedTeacherPage() {
  const [teachers, setTeachers] = useState([]);
  const [filteredTeachers, setFilteredTeachers] = useState([]);
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [teacherData, setTeacherData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingTeacherData, setLoadingTeacherData] = useState(false);
  const [activeFilter, setActiveFilter] = useState('專任教師'); // Default filter
  const db = getFirestore(app);

  // Check URL for teacher parameter on initial load
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const queryParams = new URLSearchParams(window.location.search);
      const teacherParam = queryParams.get('teacher');
      if (teacherParam) {
        setSelectedTeacher(decodeURIComponent(teacherParam));
      }
    }
  }, []);

  // Helper function to determine position priority for sorting
  const getPositionPriority = (position) => {
    const positionOrder = {
      '教授兼系主任': 1,
      '學術特聘教授': 2,
      '教授兼副教務長': 3,
      '教授兼商管學程主任': 4,
      '教授': 5,
      '副教授': 6,
      '助理教授': 7,
      '講師': 8
    };
    return positionOrder[position] || 999; // Default to low priority if not found
  };

  // Fetch all teachers on initial load
  useEffect(() => {
    const fetchTeachers = async () => {
      try {
        const teachersCollection = collection(db, '系所教師');
        const teacherSnapshot = await getDocs(teachersCollection);
        const teacherList = teacherSnapshot.docs.map(doc => {
          return { id: doc.id, ...doc.data() };
        });
        
        // Sort teachers by position
        const sortedTeachers = teacherList.sort((a, b) => {
          return getPositionPriority(a.職位) - getPositionPriority(b.職位);
        });
        
        setTeachers(sortedTeachers);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching teachers: ", error);
        setLoading(false);
      }
    };

    fetchTeachers();
  }, []);
  
  // Filter teachers when the filter or teacher list changes
  useEffect(() => {
    if (teachers.length > 0) {
      const filtered = teachers.filter(teacher => teacher.任教類別 === activeFilter);
      setFilteredTeachers(filtered);
    }
  }, [teachers, activeFilter]);

  // Fetch detailed teacher data when a teacher is selected
  useEffect(() => {
    async function fetchTeacherData() {
      if (!selectedTeacher) {
        setTeacherData(null);
        return;
      }

      setLoadingTeacherData(true);

      // Query Firebase for the selected teacher
      const teacherCollection = collection(db, "系所教師");
      const q = query(teacherCollection, where("姓名", "==", selectedTeacher.trim()));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const teacherDoc = querySnapshot.docs[0];
        const teacherInfo = teacherDoc.data();

        // Fetch the teacher's students subcollection
        const studentCollection = collection(teacherDoc.ref, "student");
        const studentSnapshot = await getDocs(studentCollection);
        const students = studentSnapshot.docs.map((doc) => doc.data());

        // 合併學生資料和論文資料
        let allStudentData = [];
        
        // 從 subcollection 獲取的學生資料
        if (students && students.length > 0) {
          allStudentData = [...students];
        }
        
        // 從主文檔的 thesis 陣列獲取論文資料
        if (teacherInfo.thesis && Array.isArray(teacherInfo.thesis)) {
          const thesisData = teacherInfo.thesis.map(thesis => ({
            學生姓名: thesis.student,
            入學學年度: thesis.year ? `${thesis.year}學年度` : '未記錄',
            論文題目: thesis.title,
            資料來源: 'thesis' // 標記資料來源
          }));
          allStudentData = [...allStudentData, ...thesisData];
        }

        // 去重並排序 (按學年度倒序)
        const uniqueStudents = [];
        const seen = new Set();
        
        allStudentData.forEach(student => {
          const key = `${student.學生姓名}-${student.論文題目}`;
          if (!seen.has(key)) {
            seen.add(key);
            uniqueStudents.push(student);
          }
        });

        // 按學年度排序 (最新的在前)
        uniqueStudents.sort((a, b) => {
          const yearA = parseInt(a.入學學年度?.toString().replace(/\D/g, '') || '0');
          const yearB = parseInt(b.入學學年度?.toString().replace(/\D/g, '') || '0');
          return yearB - yearA;
        });

        setTeacherData({ ...teacherInfo, students: uniqueStudents });
      } else {
        setTeacherData(null);
      }
      
      setLoadingTeacherData(false);
    }

    fetchTeacherData();
  }, [selectedTeacher]);

  // Handle teacher selection
  const handleTeacherSelect = (teacherName) => {
    setSelectedTeacher(teacherName);
    // Update URL without navigation to reflect selected teacher
    if (typeof window !== 'undefined' && window.history.pushState) {
      const newurl = window.location.protocol + "//" + window.location.host + window.location.pathname + `?teacher=${encodeURIComponent(teacherName)}`;
      window.history.pushState({ path: newurl }, '', newurl);
    }
  };

  // Handle back to list view
  const handleBackToList = () => {
    setSelectedTeacher(null);
    setTeacherData(null);
    if (typeof window !== 'undefined' && window.history.pushState) {
      const newurl = window.location.protocol + "//" + window.location.host + window.location.pathname;
      window.history.pushState({ path: newurl }, '', newurl);
    }
  };

  // Function to render clickable links
  function renderLinks(text) {
    if (!text) return null;
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    return text.split(urlRegex).map((part, i) =>
      urlRegex.test(part) ? (
        <a key={i} href={part} target="_blank" rel="noopener noreferrer" style={{ color: "#1e90ff", wordBreak: "break-all" }}>
          {part}
        </a>
      ) : (
        part
      )
    );
  }

  if (loading) {
    return <div style={{ textAlign: "center", padding: "40px", fontFamily: "'Microsoft JhengHei UI', Arial, sans-serif", fontSize: "20px" }}>載入教師資料中...</div>;
  }

  // Render teacher list when no teacher is selected
  if (!selectedTeacher) {
    return (
      <div className="container" style={{ maxWidth: "1200px", margin: "0 auto", padding: "20px" }}>
        <h1 className="heading" style={{ fontSize: "32px", textAlign: "center", margin: "20px 0", color: "#1e3a8a", fontFamily: "'Microsoft JhengHei UI', Arial, sans-serif" }}>系所教師</h1>
        
        {/* Filter buttons */}
        <div style={{ display: "flex", justifyContent: "center", margin: "20px 0" }}>
          <button 
            style={{ 
              padding: "8px 16px", 
              margin: "0 10px", 
              border: "none", 
              borderRadius: "4px", 
              backgroundColor: activeFilter === "專任教師" ? "#1e3a8a" : "#e5e7eb", 
              color: activeFilter === "專任教師" ? "white" : "#4b5563", 
              fontFamily: "'Microsoft JhengHei UI', Arial, sans-serif",
              fontSize: "16px",
              cursor: "pointer",
              fontWeight: "bold"
            }}
            onClick={() => setActiveFilter("專任教師")}
          >
            專任教師
          </button>
          <button 
            style={{ 
              padding: "8px 16px", 
              margin: "0 10px", 
              border: "none", 
              borderRadius: "4px", 
              backgroundColor: activeFilter === "兼任教師" ? "#1e3a8a" : "#e5e7eb", 
              color: activeFilter === "兼任教師" ? "white" : "#4b5563", 
              fontFamily: "'Microsoft JhengHei UI', Arial, sans-serif",
              fontSize: "16px",
              cursor: "pointer",
              fontWeight: "bold"
            }}
            onClick={() => setActiveFilter("兼任教師")}
          >
            兼任教師
          </button>
        </div>
        
        <div className="grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: "20px" }}>
          {filteredTeachers.map((teacher) => (
            <div 
              key={teacher.id} 
              className="card" 
              style={{ 
                padding: "20px", 
                border: "1px solid #e5e7eb", 
                borderRadius: "8px", 
                cursor: "pointer",
                backgroundColor: "#f8f9fa",
                transition: "transform 0.2s, box-shadow 0.2s",
                boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                textAlign: "center",
                fontFamily: "var(--font-geist-sans), 'Noto Sans TC', 'Microsoft JhengHei', sans-serif"
              }}
              onClick={() => handleTeacherSelect(teacher.姓名)}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = "translateY(-4px)";
                e.currentTarget.style.boxShadow = "0 6px 12px rgba(0,0,0,0.1)";
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "0 2px 4px rgba(0,0,0,0.05)";
              }}
            >
              <div style={{ 
                width: "150px", 
                height: "150px", 
                borderRadius: "50%", 
                overflow: "hidden",
                border: "3px solid #90caf9",
                marginBottom: "12px"
              }}>
                <img 
                  src={teacher.照片 || 'https://via.placeholder.com/150'} 
                  alt={`${teacher.姓名} 的照片`}
                  style={{ 
                    width: "100%", 
                    height: "100%", 
                    objectFit: "cover" 
                  }} 
                />
              </div>
              <h2 className="title" style={{ 
                fontSize: "20px", 
                marginBottom: "4px", 
                color: "#1e3a8a", 
                fontFamily: "'Microsoft JhengHei UI', Arial, sans-serif" 
              }}>
                {teacher.姓名}
              </h2>
              <p className="position" style={{ 
                color: "#0d9488", 
                fontFamily: "'Microsoft JhengHei UI', Arial, sans-serif",
                fontSize: "14px",
                margin: "0 0 8px 0"
              }}>
                {teacher.職位}
              </p>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Show loading state while fetching teacher data
  if (loadingTeacherData) {
    return (
      <div className="container" style={{ maxWidth: "1200px", margin: "0 auto", padding: "20px", fontFamily: "var(--font-geist-sans), 'Noto Sans TC', 'Microsoft JhengHei', sans-serif" }}>
        <button 
          onClick={handleBackToList}
          style={{
            display: "block",
            margin: "0 0 20px 0",
            padding: "8px 16px",
            backgroundColor: "#e5e7eb",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
            fontFamily: "'Microsoft JhengHei UI', Arial, sans-serif",
            fontSize: "16px"
          }}
        >
          ← 返回教師列表
        </button>
        <div style={{ textAlign: "center", padding: "40px", fontFamily: "'Microsoft JhengHei UI', Arial, sans-serif", fontSize: "20px" }}>載入{selectedTeacher}的詳細資料中...</div>
      </div>
    );
  }

  // Render teacher details when a teacher is selected
  return (
    <div className="container" style={{ maxWidth: "1200px", margin: "0 auto", padding: "20px", fontFamily: "var(--font-geist-sans), 'Noto Sans TC', 'Microsoft JhengHei', sans-serif" }}>
      <button 
        onClick={handleBackToList}
        style={{
          display: "block",
          margin: "0 0 20px 0",
          padding: "8px 16px",
          backgroundColor: "#e5e7eb",
          border: "none",
          borderRadius: "4px",
          cursor: "pointer",
          fontFamily: "'Microsoft JhengHei UI', Arial, sans-serif",
          fontSize: "16px"
        }}
      >
        ← 返回教師列表
      </button>
      
      {teacherData ? (
        <div
          style={{
            fontFamily: "'Microsoft JhengHei UI', Arial, sans-serif",
            lineHeight: "1.8",
            maxWidth: "900px",
            margin: "0 auto",
            padding: "30px",
            display: "flex",
            alignItems: "flex-start",
            gap: "32px",
            background: "#f8f9fa",
            borderRadius: "12px",
            boxShadow: "0 2px 12px #0001"
          }}
        >
          {/* Left side - Image area */}
          <div style={{ textAlign: "center", flex: "1" }}>
            <h1 style={{ fontSize: "28px", marginBottom: "16px", color: "#1e3a8a", letterSpacing: "2px", fontFamily: "var(--font-geist-sans), 'Noto Sans TC', 'Microsoft JhengHei', sans-serif" }}>
              {teacherData.姓名}
            </h1>
            <div
              style={{
                width: "300px",
                height: "450px",
                margin: "0 auto 18px auto",
                padding: "15px",
                border: "5px solid #90caf9", // Light blue border
                backgroundColor: "lightgray",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                overflow: "hidden",
                borderRadius: "12px"
              }}
            >
              <img
                src={teacherData.照片}
                alt={`${teacherData.姓名} 的照片`}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover"
                }}
              />
            </div>
          </div>

          {/* Right side - Information area */}
          <div style={{ flex: "2", fontSize: "18px", fontFamily: "var(--font-geist-sans), 'Noto Sans TC', 'Microsoft JhengHei', sans-serif" }}>
            <ul style={{ paddingLeft: "0", listStyle: "none" }}>
              <li style={{ marginBottom: "10px" }}>
                <strong>電子郵件：</strong>
                <span style={{ color: "#2563eb" }}>{teacherData.信箱}</span>
              </li>
              <li style={{ marginBottom: "10px" }}>
                <strong>辦公室位置：</strong>
                <span>{teacherData.辦公室位置}</span>
              </li>
              <li style={{ marginBottom: "10px" }}>
                <strong>電話：</strong>
                <span>{teacherData.電話}</span>
              </li>
            </ul>

            <div style={{ margin: "18px 0 10px 0", fontWeight: "bold", color: "#0d9488", fontSize: "20px" }}>專長</div>
            {Array.isArray(teacherData.專長) && teacherData.專長.length > 0 ? (
              <ul style={{ paddingLeft: "24px", listStyleType: "disc", marginBottom: "18px" }}>
                {teacherData.專長.map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            ) : (
              <p style={{ color: "#999" }}>無專長資料</p>
            )}

            {/* 指導學生與論文資料 */}
            <div style={{ margin: "18px 0 10px 0", fontWeight: "bold", color: "#0d9488", fontSize: "20px" }}>指導學生與論文</div>
            {Array.isArray(teacherData.students) && teacherData.students.length > 0 ? (
              <div style={{ marginBottom: "18px" }}>
                {teacherData.students.map((student, index) => (
                  <div 
                    key={index} 
                    style={{ 
                      marginBottom: "16px", 
                      padding: "12px",
                      backgroundColor: "#ffffff",
                      border: "1px solid #e5e7eb",
                      borderRadius: "6px",
                      borderLeft: "4px solid #0d9488"
                    }}
                  >
                    <div style={{ marginBottom: "6px" }}>
                      <strong style={{ color: "#1e3a8a" }}>學生：</strong>
                      <span style={{ fontSize: "16px", fontWeight: "500" }}>{student.學生姓名}</span>
                      {student.入學學年度 && (
                        <span style={{ 
                          marginLeft: "12px", 
                          color: "#6b7280", 
                          fontSize: "14px",
                          backgroundColor: "#f3f4f6",
                          padding: "2px 8px",
                          borderRadius: "4px"
                        }}>
                          {student.入學學年度}
                        </span>
                      )}
                    </div>
                    {student.論文題目 && (
                      <div style={{ 
                        color: "#374151", 
                        fontSize: "15px", 
                        lineHeight: "1.5",
                        fontStyle: "italic"
                      }}>
                        <strong>論文題目：</strong>{student.論文題目}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ color: "#999" }}>無指導學生資料</p>
            )}

            <div style={{ margin: "18px 0 10px 0", fontWeight: "bold", color: "#0d9488", fontSize: "20px" }}>產學合作資料</div>
            {Array.isArray(teacherData.產學合作資料) && teacherData.產學合作資料.length > 0 ? (
              <ul style={{ paddingLeft: "24px", listStyleType: "disc" }}>
                {teacherData.產學合作資料.map((item, index) => {
                  const urlRegex = /(https?:\/\/[^\s]+)/g;
                  const parts = item.split(urlRegex);
                  return (
                    <li key={index}>
                      {parts.map((part, i) =>
                        urlRegex.test(part) ? (
                          <a key={i} href={part} target="_blank" rel="noopener noreferrer" style={{ color: "#1e90ff", wordBreak: "break-all" }}>
                            {part}
                          </a>
                        ) : (
                          part
                        )
                      )}
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p style={{ color: "#999" }}>無產學合作資料</p>
            )}
          </div>
        </div>
      ) : (
        <p style={{ textAlign: "center", color: "#999", fontFamily: "'Microsoft JhengHei UI', Arial, sans-serif", fontSize: "20px" }}>查無資料</p>
      )}
    </div>
  );
}