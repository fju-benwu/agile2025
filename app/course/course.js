'use client'

import { getFirestore, collection, getDocs, query, where } from "firebase/firestore"; 
import app from "@/app/_firebase/Config";
import { useEffect, useState } from "react";

// Global style that will be added to the component
const globalStyle = `
  .main-layout {
    display: flex;
    gap: 20px;
  }
  .left-content {
    flex: 1;
  }
  .right-panel {
    width: 300px;
    position: sticky;
    top: 20px;
    height: fit-content;
  }
  .query-panel {
    background-color: white;
    border-radius: 8px;
    padding: 20px;
    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    margin-bottom: 20px;
  }
  course-container {
    background-color: white;
    border-radius: 8px;
    padding: 20px;
    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    margin-bottom: 20px;
  }
  .course-category {
    margin-bottom: 25px;
    border: 2px solid #e0e0e0;
    border-radius: 8px;
    padding: 15px;
    background-color: #fafafa;
  }
  .course-category h3 {
    background-color: #3498db;
    color: white;
    margin: -15px -15px 15px -15px;
    padding: 10px 15px;
    border-radius: 6px 6px 0 0;
    font-size: 1.1em;
  }
  .course-item {
    display: flex;
    align-items: center;
    padding: 10px;
    margin: 5px 0;
    border-radius: 6px;
    background-color: white;
    border: 1px solid #e0e0e0;
    transition: all 0.2s;
  }
  .course-item:hover {
    background-color: #f8f9fa;
    border-color: #3498db;
  }
  .course-item label {
    margin-left: 12px;
    flex-grow: 1;
    cursor: pointer;
    line-height: 1.4;
  }
  .course-item input[type="checkbox"] {
    cursor: pointer;
    width: 20px;
    height: 20px;
    accent-color: #3498db;
  }
  .credit {
    color: #7f8c8d;
    font-size: 0.9em;
    font-weight: bold;
    margin-left: 10px;
  }
  .course-code {
    color: #2980b9;
    font-size: 0.8em;
    margin-left: 8px;
    background-color: #ecf0f1;
    padding: 2px 6px;
    border-radius: 3px;
  }
  .english-tag {
    background-color: #e74c3c;
    color: white;
    font-size: 0.7em;
    padding: 3px 8px;
    border-radius: 4px;
    margin-left: 8px;
    font-weight: bold;
  }
  button {
    background-color: #3498db;
    color: white;
    border: none;
    padding: 12px 24px;
    border-radius: 6px;
    cursor: pointer;
    font-size: 16px;
    font-weight: bold;
    transition: all 0.3s;
    margin-right: 10px;
    margin-bottom: 10px;
  }
  button:hover { 
    background-color: #2980b9; 
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0,0,0,0.1);
  }
  .query-button {
    background-color: #27ae60;
    width: 100%;
    margin-top: 15px;
  }
  .query-button:hover { background-color: #229954; }
  .selector-container {
    display: flex;
    margin-bottom: 15px;
    gap: 10px;
  }
  .query-selector-container {
    margin-bottom: 15px;
  }
  .selector {
    padding: 12px;
    flex: 1;
    border-radius: 6px;
    border: 2px solid #ddd;
    font-size: 16px;
    font-family: 'Microsoft JhengHei', Arial, sans-serif;
    transition: border-color 0.3s;
  }
  .selector:focus {
    border-color: #3498db;
    outline: none;
  }
  .query-selector {
    width: 100%;
    padding: 12px;
    border-radius: 6px;
    border: 2px solid #ddd;
    font-size: 16px;
    font-family: 'Microsoft JhengHei', Arial, sans-serif;
    transition: border-color 0.3s;
  }
  .query-selector:focus {
    border-color: #3498db;
    outline: none;
  }
  .course-table {
    width: 100%;
    border-collapse: collapse;
    border-spacing: 0;
    margin-top: 20px;
    font-size: 15px;
  }
  .course-table th {
    background-color: #3498db;
    color: white;
    font-weight: bold;
    text-align: left;
    padding: 12px 10px;
  }
  .course-table tr:nth-child(even) {
    background-color: #f8f9fa;
  }
  .course-table tr:hover {
    background-color: #ecf0f1;
  }
  .course-table td {
    padding: 10px;
    border-bottom: 1px solid #ddd;
  }
  .schedule-table {
    width: 100%;
    border-collapse: collapse;
    margin-top: 20px;
    text-align: center;
    border: 1px solid #ddd;
  }
  .schedule-table th {
    background-color: #3498db;
    color: white;
    padding: 10px;
    font-weight: bold;
  }
  .schedule-table td {
    padding: 10px 5px;
    border: 1px solid #ddd;
    vertical-align: top;
  }
  .schedule-cell {
    background-color: #dbeafe;
    border: 1px solid #bfdbfe;
    padding: 8px;
    font-size: 14px;
  }
  .teacher-link {
    color: #2563eb;
    text-decoration: none;
    cursor: pointer;
  }
  .teacher-link:hover {
    text-decoration: underline;
  }
  
  /* Carousel styles */
  .carousel-container {
    position: relative;
    overflow: hidden;
    border-radius: 8px;
    margin-bottom: 20px;
    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  }
  .carousel-slide {
    display: none;
    padding: 25px 30px;
    background-color: white;
    animation: fade 0.8s ease-in-out;
  }
  .carousel-slide.active {
    display: block;
  }
  @keyframes fade {
    from {opacity: 0.7}
    to {opacity: 1}
  }
  .carousel-title {
    font-size: 20px;
    color: #3498db;
    margin-top: 0;
    margin-bottom: 15px;
    font-weight: bold;
  }
  .carousel-content {
    font-size: 16px;
    line-height: 1.6;
    color: #2c3e50;
  }
  .carousel-dots {
    text-align: center;
    padding: 15px 0;
  }
  .carousel-dot {
    display: inline-block;
    width: 12px;
    height: 12px;
    margin: 0 5px;
    background-color: #bbb;
    border-radius: 50%;
    cursor: pointer;
    transition: background-color 0.3s;
  }
  .carousel-dot.active {
    background-color: #3498db;
  }
  .carousel-navigation {
    position: absolute;
    top: 50%;
    width: 100%;
    transform: translateY(-50%);
    display: flex;
    justify-content: space-between;
    padding: 0 15px;
    box-sizing: border-box;
  }
  .carousel-button {
    background-color: rgba(52, 152, 219, 0.7);
    color: white;
    border: none;
    width: 40px;
    height: 40px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    font-size: 18px;
    transition: all 0.3s;
    margin: 0;
    padding: 0;
  }
  .carousel-button:hover {
    background-color: rgba(52, 152, 219, 1);
    transform: scale(1.1);
  }
  
  @media (max-width: 768px) {
    .main-layout {
      flex-direction: column;
    }
    .right-panel {
      width: 100%;
      position: static;
    }
  }
`;

// Simplified styles for specific elements not covered by the global CSS
const styles = {
  mainContainer: {
    maxWidth: "1200px",
    margin: "0 auto",
    padding: "20px",
    fontFamily: "'Microsoft JhengHei', Arial, sans-serif"
  },
  heading: {
    fontSize: "24px",
    color: "#2c3e50",
    marginBottom: "20px",
    textAlign: "center",
    fontWeight: "bold"
  },
  backButton: {
    display: "block",
    margin: "0 0 20px 0",
    padding: "8px 16px",
    backgroundColor: "#95a5a6",
    color: "white",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    fontFamily: "'Microsoft JhengHei', Arial, sans-serif",
    fontSize: "16px"
  },
  teacherContainer: {
    fontFamily: "'Microsoft JhengHei', Arial, sans-serif",
    lineHeight: "1.8",
    maxWidth: "900px",
    margin: "0 auto",
    padding: "30px",
    display: "flex",
    alignItems: "flex-start",
    gap: "32px",
    background: "white",
    borderRadius: "8px",
    boxShadow: "0 2px 10px rgba(0,0,0,0.1)"
  }
};

// Function to render teacher links
const renderTeachers = (teachers, handleTeacherSelect) => {
  if (Array.isArray(teachers)) {
    return teachers.map((teacher, index) => (
      <span key={index}>
        <span 
          onClick={() => handleTeacherSelect(teacher.trim())}
          className="teacher-link"
        >
          {teacher.trim()}
        </span>
        {index < teachers.length - 1 && ", "}
      </span>
    ));
  } else {
    return (
      <span 
        onClick={() => handleTeacherSelect(teachers.trim())}
        className="teacher-link"
      >
        {teachers.trim()}
      </span>
    );
  }
};

export default function Course() {
  const db = getFirestore(app);

  // State for course filtering
  const [academicYear, setAcademicYear] = useState(""); 
  const [studentType, setStudentType] = useState(""); 
  const [category, setCategory] = useState("不限");
  const [requiredType, setRequiredType] = useState("");
  const [semester, setSemester] = useState("");
  const [courses, setCourses] = useState([]);

  // State for schedule filtering
  const [schedule, setSchedule] = useState([]);
  const [scheduleAcademicYear, setScheduleAcademicYear] = useState("113");
  const [scheduleStudentType, setScheduleStudentType] = useState("");
  const [scheduleSemester, setScheduleSemester] = useState("");
  
  // State for teacher details
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [teacherData, setTeacherData] = useState(null);
  const [loadingTeacherData, setLoadingTeacherData] = useState(false);

  // State for carousel
  const [currentSlide, setCurrentSlide] = useState(0);
  
  // Carousel announcements data
  const announcements = [
    {
      title: "113學年度第一學期選課公告(範例)",
      content: "113學年度第一學期選課將於8月15日開始，請同學注意選課時程，並事先與導師諮詢選課規劃。"
    },
    {
      title: "課程異動通知(範例)",
      content: "因應師資調整，本學期「人工智慧應用」課程時間調整為每週三下午3-6節。詳情請洽系辦公室。"
    },
    {
      title: "新增課程通知(範例)",
      content: "本學期新增「大數據分析與應用」課程，歡迎有興趣的同學選修。本課程由石佳惠老師授課。"
    }
  ];

  // Fetch courses based on filters
  useEffect(() => {
    async function fetchFilteredCourses() {
      if (!academicYear) {
        setCourses([]);
        return;
      }

      const courseCollection = collection(db, `系所課程/${academicYear}/該年度課程`);
      let courseQuery = query(courseCollection);

      if (studentType) {
        courseQuery = query(courseQuery, where("學制", "==", studentType));
      }
      if (category !== "不限") {
        courseQuery = query(courseQuery, where("選別", "==", category));
      }
      if (requiredType) {
        courseQuery = query(courseQuery, where("選必修", "==", requiredType));
      }
      if (semester) {
        courseQuery = query(courseQuery, where("學期", "==", semester));
      }

      const querySnapshot = await getDocs(courseQuery);
      const result = [];
      querySnapshot.forEach((doc) => result.push(doc.data()));
      setCourses(result);
    }

    fetchFilteredCourses();
  }, [academicYear, studentType, category, requiredType, semester, db]);

  // Fetch schedule data
  useEffect(() => {
    async function fetchSchedule() {
      if (!scheduleAcademicYear) {
        setSchedule([]);
        return;
      }

      const querySnapshot = await getDocs(
        collection(db, `系所課程/${scheduleAcademicYear}/該年度課程`)
      );

      const scheduleData = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        const { 開課星期, 開始節次, 結束節次, 學制, 學期, ...rest } = data;

        if (scheduleStudentType && scheduleStudentType !== 學制) return;
        if (scheduleSemester && scheduleSemester !== 學期) return;

        for (let i = 開始節次; i <= 結束節次; i++) {
          if (!scheduleData[i]) scheduleData[i] = {};
          if (i === 開始節次) {
            scheduleData[i][開課星期] = { ...rest, rowSpan: 結束節次 - 開始節次 + 1 };
          } else {
            scheduleData[i][開課星期] = null;
          }
        }
      });

      setSchedule(scheduleData);
    }

    fetchSchedule();
  }, [scheduleAcademicYear, scheduleStudentType, scheduleSemester, db]);

  // Fetch teacher data when selected
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

        // 這部分改為讀取陣列
        let allStudentData = [];
        if (teacherInfo.thesis && Array.isArray(teacherInfo.thesis)) {
          const thesisData = teacherInfo.thesis.map(thesis => ({
            學生姓名: thesis.student,
            入學學年度: thesis.year ? `${thesis.year}學年度` : '未記錄',
            論文題目: thesis.title,
            資料來源: 'thesis' // 標記資料來源
          }));
          allStudentData = [...allStudentData, ...thesisData];
        }
        // Fetch the teacher's students subcollection
        // const studentCollection = collection(teacherDoc.ref, "student");
        // const studentSnapshot = await getDocs(studentCollection);
        // const students = studentSnapshot.docs.map((doc) => doc.data());

        setTeacherData({ ...teacherInfo, students:allStudentData });
      } else {
        setTeacherData(null);
      }
      
      setLoadingTeacherData(false);
    }

    fetchTeacherData();
  }, [selectedTeacher, db]);

  // Carousel auto rotation
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prevSlide) => 
        prevSlide === announcements.length - 1 ? 0 : prevSlide + 1
      );
    }, 5000); // Change slide every 5 seconds
    
    return () => clearInterval(interval);
  }, [announcements.length]);

  // Handle carousel navigation
  const nextSlide = () => {
    setCurrentSlide((prevSlide) => 
      prevSlide === announcements.length - 1 ? 0 : prevSlide + 1
    );
  };
  
  const prevSlide = () => {
    setCurrentSlide((prevSlide) => 
      prevSlide === 0 ? announcements.length - 1 : prevSlide - 1
    );
  };
  
  const goToSlide = (slideIndex) => {
    setCurrentSlide(slideIndex);
  };

  // Handle teacher selection
  const handleTeacherSelect = (teacherName) => {
    setSelectedTeacher(teacherName);
    // Update URL without navigation to reflect selected teacher
    if (typeof window !== 'undefined' && window.history.pushState) {
      const newurl = window.location.protocol + "//" + window.location.host + window.location.pathname + `?teacher=${encodeURIComponent(teacherName)}`;
      window.history.pushState({ path: newurl }, '', newurl);
    }
  };

  // Handle back to course view
  const handleBackToCourses = () => {
    setSelectedTeacher(null);
    setTeacherData(null);
    if (typeof window !== 'undefined' && window.history.pushState) {
      const newurl = window.location.protocol + "//" + window.location.host + window.location.pathname;
      window.history.pushState({ path: newurl }, '', newurl);
    }
  };

  // Teacher details view
  if (selectedTeacher && teacherData) {
    return (
      <div style={styles.mainContainer}>
        <style>{globalStyle}</style>
        <button 
          onClick={handleBackToCourses}
          className="back-button"
        >
          ← 返回課程列表
        </button>
        
        <div className="course-container">
          <div style={styles.teacherContainer}>
            {/* Left side - Image area */}
            <div style={{ textAlign: "center", flex: "1" }}>
              <h1 style={{ fontSize: "24px", marginBottom: "16px", color: "#3498db", letterSpacing: "2px" }}>
                {teacherData.姓名}
              </h1>
              <div style={{
                width: "250px",
                height: "350px",
                margin: "0 auto 18px auto",
                padding: "15px",
                border: "5px solid #3498db",
                backgroundColor: "#f1f9ff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                overflow: "hidden",
                borderRadius: "12px"
              }}>
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
            <div style={{ flex: "2", fontSize: "16px" }}>
              <ul style={{ paddingLeft: "0", listStyle: "none" }}>
                <li style={{ marginBottom: "10px" }}>
                  <strong>電子郵件：</strong>
                  <span style={{ color: "#3498db" }}>{teacherData.信箱}</span>
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

              <div style={{ margin: "18px 0 10px 0", fontWeight: "bold", color: "#27ae60", fontSize: "18px" }}>專長</div>
              {Array.isArray(teacherData.專長) && teacherData.專長.length > 0 ? (
                <ul style={{ paddingLeft: "24px", listStyleType: "disc", marginBottom: "18px" }}>
                  {teacherData.專長.map((item, index) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
              ) : (
                <p style={{ color: "#999" }}>無專長資料</p>
              )}

              <div style={{ margin: "18px 0 10px 0", fontWeight: "bold", color: "#27ae60", fontSize: "18px" }}>學生資料</div>
              {Array.isArray(teacherData.students) && teacherData.students.length > 0 ? (
                <ul style={{ paddingLeft: "24px", listStyleType: "disc", marginBottom: "18px" }}>
                  {teacherData.students.map((student, index) => (
                    <li key={index} style={{ marginBottom: "10px" }}>
                      <div><strong>入學學年度：</strong>{student.入學學年度}</div>
                      <div><strong>學生姓名：</strong>{student.學生姓名}</div>
                      <div><strong>論文題目：</strong>{student.論文題目}</div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p style={{ color: "#999" }}>無學生資料</p>
              )}

              <div style={{ margin: "18px 0 10px 0", fontWeight: "bold", color: "#27ae60", fontSize: "18px" }}>產學合作資料</div>
              {Array.isArray(teacherData.產學合作資料) && teacherData.產學合作資料.length > 0 ? (
                <ul style={{ paddingLeft: "24px", listStyleType: "disc" }}>
                  {teacherData.產學合作資料.map((item, index) => {
                    const urlRegex = /(https?:\/\/[^\s]+)/g;
                    const parts = item.split(urlRegex);
                    return (
                      <li key={index}>
                        {parts.map((part, i) =>
                          urlRegex.test(part) ? (
                            <a key={i} href={part} target="_blank" rel="noopener noreferrer" style={{ color: "#3498db", wordBreak: "break-all" }}>
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
        </div>
      </div>
    );
  }
  
  // Loading teacher data view
  if (loadingTeacherData) {
    return (
      <div style={styles.mainContainer}>
        <style>{globalStyle}</style>
        <button 
          onClick={handleBackToCourses}
          className="back-button"
        >
          ← 返回課程列表
        </button>
        <div className="course-container">
          <div style={{ textAlign: "center", padding: "40px", fontSize: "18px" }}>
            載入{selectedTeacher}的詳細資料中...
          </div>
        </div>
      </div>
    );
  }

  // Course and schedule view
  return (
    <div style={styles.mainContainer}>
      <style>{globalStyle}</style>
      
      {/* Carousel for announcements */}
      <div className="carousel-container">
        {announcements.map((announcement, index) => (
          <div 
            key={index} 
            className={`carousel-slide ${index === currentSlide ? 'active' : ''}`}
          >
            <h3 className="carousel-title">{announcement.title}</h3>
            <p className="carousel-content">{announcement.content}</p>
          </div>
        ))}
        
        <div className="carousel-navigation">
          <button className="carousel-button" onClick={prevSlide}>&lsaquo;</button>
          <button className="carousel-button" onClick={nextSlide}>&rsaquo;</button>
        </div>
        
        <div className="carousel-dots">
          {announcements.map((_, index) => (
            <span 
              key={index} 
              className={`carousel-dot ${index === currentSlide ? 'active' : ''}`}
              onClick={() => goToSlide(index)}
            ></span>
          ))}
        </div>
      </div>
      
      {/* Course section */}
      <div className="course-container">
        <h2 style={styles.heading}>修業規則與必選修課程</h2>
        
        <div className="selector-container">
          <select 
            className="selector"
            onChange={(e) => {
              setStudentType(e.target.value);
              if (e.target.value) {
                setAcademicYear("113");
                document.querySelector("#academicYearSelect").value = "113";
              }
            }}
          >
            <option value="">選擇學制</option>
            <option value="碩士">一般生</option>
            <option value="碩職">在職專班</option>
          </select>

          <select 
            id="academicYearSelect" 
            className="selector"
            onChange={(e) => setAcademicYear(e.target.value)}
          >
            <option value="">選擇學年度</option>
            <option value="113">113學年度</option>
            <option value="114">114學年度</option>
          </select>
        </div>
        
        <div className="selector-container">
          <select 
            className="selector"
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="不限">不限</option>
            <option value="人工">人工</option>
            <option value="電商">電商</option>
          </select>

          <select 
            className="selector"
            onChange={(e) => setRequiredType(e.target.value)}
          >
            <option value="">所有課程</option>
            <option value="必修">必修</option>
            <option value="選修">選修</option>
          </select>
          
          <select 
            className="selector"
            onChange={(e) => setSemester(e.target.value)}
          >
            <option value="">所有學期</option>
            <option value="上">上學期</option>
            <option value="下">下學期</option>
          </select>
        </div>

        <table className="course-table">
          <thead>
            <tr>
              <th>課程名稱</th>
              <th>年級</th>
              <th>學期</th>
              <th>授課教師</th>
              <th>學分</th>
              <th>選別</th>
              <th>選必修</th>
              <th>地點</th>
              <th>開課時間</th>
            </tr>
          </thead>
          <tbody>
            {courses.length > 0 ? (
              courses.map((course, index) => (
                <tr key={index}>
                  <td>{course.課程名稱}</td>
                  <td>{course.年級}</td>
                  <td>{course.學期}</td>
                  <td>{renderTeachers(course.教師, handleTeacherSelect)}</td>
                  <td>{course.學分}</td>
                  <td>{course.選別}</td>
                  <td>{course.選必修}</td>
                  <td>{course.地點}</td>
                  <td>{course.開課時間}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="9" style={{textAlign: "center", padding: "20px"}}>
                  請選擇過濾條件查詢課程
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Schedule section */}
      <div className="course-container">
        <h2 style={styles.heading}>課表</h2>
        
        <div className="selector-container">
          <select 
            className="selector"
            onChange={(e) => setScheduleAcademicYear(e.target.value)}
          >
            <option value="113">113學年度</option>
            <option value="114">114學年度</option>
          </select>

          <select 
            className="selector"
            onChange={(e) => setScheduleStudentType(e.target.value)}
          >
            <option value="">選擇學制</option>
            <option value="碩士">碩士班</option>
            <option value="碩職">碩職班</option>
          </select>

          <select 
            className="selector"
            onChange={(e) => setScheduleSemester(e.target.value)}
          >
            <option value="">所有學期</option>
            <option value="上">上學期</option>
            <option value="下">下學期</option>
          </select>
        </div>

        <table className="schedule-table">
          <thead>
            <tr>
              <th>節次</th>
              {["星期一", "星期二", "星期三", "星期四", "星期五", "星期六"].map((day, index) => (
                <th key={index}>{day}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {["1", "2", "3", "4", "午休", "5", "6", "7", "8-9", "E1-E3"].map((period, rowIndex) => (
              <tr key={rowIndex}>
                <td><strong>{period}</strong></td>
                {[1, 2, 3, 4, 5, 6].map((day, colIndex) => {
                  const rowData = schedule[rowIndex + 1]?.[day];

                  if (rowData) {
                    if (rowData.rowSpan) {
                      return (
                        <td 
                          key={colIndex} 
                          rowSpan={rowData.rowSpan}
                          className="schedule-cell"
                        >
                          <div style={{ fontWeight: "bold" }}>{rowData.課程代號}</div>
                          <div>{rowData.課程名稱}</div>
                          <div>{renderTeachers(rowData.教師, handleTeacherSelect)}</div>
                          <div>{rowData.地點}</div>
                        </td>
                      );
                    }
                  }

                  if (rowData === null) return null;
                  return <td key={colIndex}></td>;
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}