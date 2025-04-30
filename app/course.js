'use client'
import styles from "./course.module.css";
import { getFirestore, collection, getDocs, query, where } from "firebase/firestore"; 
import app from "@/app/_firebase/Config";
import { useEffect, useState } from "react";
import Link from "next/link"; // 引入 Link 元件

const renderTeachers = (teachers) => {
  if (Array.isArray(teachers)) {
    return teachers.map((teacher, index) => (
      <span key={index}>
        <Link href={`/teacher/${encodeURIComponent(teacher)}`}>
          {teacher}
        </Link>
        {index < teachers.length - 1 && ", "} {/* 在最後一個教師名稱後不加逗號 */}
      </span>
    ));
  } else {
    return (
      <Link href={`/teacher/${encodeURIComponent(teachers)}`}>
        {teachers}
      </Link>
    );
  }
};


export default function Course()
 {
  const db = getFirestore(app);
  const [courses, setCourses] = useState([]);
  const [studentType, setStudentType] = useState(""); // 學制篩選
  const [category, setCategory] = useState("不限"); // 選別篩選
  const [requiredType, setRequiredType] = useState(""); // 選必修篩選
  const [schedule, setSchedule] = useState([]); // 課表資料
  const [semester, setSemester] = useState(""); // 新增學期篩選狀態
  const [scheduleStudentType, setScheduleStudentType] = useState(""); // 課表學制篩選
  const [scheduleSemester, setScheduleSemester] = useState(""); // 課表學期篩選
  const [scheduleAcademicYear, setScheduleAcademicYear] = useState(""); // 學年度篩選

  


  // 初始載入所有課程

  useEffect(() => {
    async function fetchSchedule() {
      const querySnapshot = await getDocs(collection(db, "系所課程"));
      const scheduleData = [];
  
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        const { 開課星期, 開始節次, 結束節次, 學制, 學期,開課學年, ...rest } = data;
  
        // 根據課表學制篩選
        if (scheduleStudentType && scheduleStudentType !== 學制) {
          return; // 如果學制不匹配，跳過這筆資料
        }
  
        // 根據課表學期篩選
        if (scheduleSemester && scheduleSemester !== 學期) {
          return; // 如果學期不匹配，跳過這筆資料
        }

        // 根據課表學年度篩選
        if (scheduleAcademicYear && scheduleAcademicYear != 開課學年) {
          console.log("開課學年變數:", scheduleAcademicYear)
          console.log("開課學年資料庫:", 開課學年)
          return; // 如果學年度不匹配，跳過這筆資料
        }
  
        // 將資料展開到對應的節次和星期
        for (let i = 開始節次; i <= 結束節次; i++) {
          if (!scheduleData[i]) scheduleData[i] = {};
          if (i === 開始節次) {
            // 在開始節次標記 rowSpan
            scheduleData[i][開課星期] = { ...rest, rowSpan: 結束節次 - 開始節次 + 1 };
          } else {
            // 其他節次設為 null，表示不渲染
            scheduleData[i][開課星期] = null;
          }
        }
      });
  
      console.log(scheduleData); // 檢查資料是否正確
      setSchedule(scheduleData);
    }
  
    fetchSchedule();
  }, [scheduleStudentType, scheduleSemester, scheduleAcademicYear]); // 多加 scheduleAcademicYear

  // 根據學制、選別和選必修篩選課程
  useEffect(() => {
    async function fetchFilteredCourses() {
      let courseCollection = collection(db, "系所課程");
      let courseQuery = query(courseCollection);

      // 如果有學制篩選條件
      if (studentType) {
        courseQuery = query(courseQuery, where("學制", "==", studentType));
      }

      // 如果有選別篩選條件
      if (category !== "不限") {
        courseQuery = query(courseQuery, where("選別", "==", category));
      }

      // 如果有選必修篩選條件
      if (requiredType) {
        courseQuery = query(courseQuery, where("選必修", "==", requiredType));
      }
        // 如果有學期篩選條件
    if (semester) {
      courseQuery = query(courseQuery, where("學期", "==", semester));
    }
      const querySnapshot = await getDocs(courseQuery);
      const filteredCourses = [];
      querySnapshot.forEach((doc) => {
        filteredCourses.push(doc.data());
      });
      setCourses(filteredCourses);
    }

    fetchFilteredCourses();
  }, [studentType, category, requiredType]); // 當學制、選別或選必修改變時重新篩選

  // 定義教師頁面的路徑占位符
  const TEACHER_PATH = "教師/"; // TODO: 請驗證並更新為正確的教師介紹頁面路徑（參考網站結構，例如 "師資介紹"）

  // 渲染教師名稱和連結的輔助函數
  const renderTeachers = (teachers) => {
    if (Array.isArray(teachers)) {
      return teachers.map((teacher, index) => (
        <span key={index}>
          <Link href={`/teacher/${encodeURIComponent(teacher.trim())}`}>
            {teacher.trim()}
          </Link>
          {index < teachers.length - 1 && ", "} {/* 在最後一個教師名稱後不加逗號 */}
        </span>
      ));
    } else {
      return (
        <Link href={`/teacher/${encodeURIComponent(teachers.trim())}`}>
          {teachers.trim()}
        </Link>
      );
    }
  };
  

  return (
    <>
      <div className="container">
        <div className="section">
          <div className={styles.main}>
            <h2>修業規則與必選修課程</h2>
            <div className="select-container">
              {/* 學制篩選下拉選單 */}
              <select
                id="studentTypeSelect"
                onChange={(event) => setStudentType(event.target.value)}
              >
                <option value="">所有學制</option>
                <option value="碩士">一般生</option>
                <option value="碩職">在職專班</option>
              </select>

              {/* 選別篩選下拉選單 */}
              <div style={{marginTop: "80px",marginLeft: "-115px"}}>
              <select
                id="categorySelect"
                onChange={(event) => setCategory(event.target.value)}
              >
                <option value="不限">不限</option>
                <option value="人工">人工</option>
                <option value="電商">電商</option>
              </select>
              </div>
              {/* 選必修篩選下拉選單 */}
              <div style={{marginTop: "80px"}}>
              <select
                id="requiredTypeSelect"
                onChange={(event) => setRequiredType(event.target.value)}
              >
                <option value="">所有課程</option>
                <option value="必修">必修</option>
                <option value="選修">選修</option>
              </select>
              </div>
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
                {courses.map((course, index) => (
                  <tr key={index}>
                    <td>{course.課程名稱}</td>
                    <td>{course.年級}</td>
                    <td>{course.學期}</td>
                    <td>{renderTeachers(course.教師)}</td>
                    <td>{course.學分}</td>
                    <td>{course.選別}</td>
                    <td>{course.選必修}</td>
                    <td>{course.地點}</td>
                    <td>{course.開課時間}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="section">
  

    {/* 新增課表 */}
    <h2>課表</h2>
    <div className="select-container" style={{ marginBottom: "20px", display: "flex", gap: "10px" }}>
      {/* 課表學年度篩選下拉選單 */}
<select
  id="scheduleAcademicYearSelect"
  onChange={(event) => setScheduleAcademicYear(event.target.value)}
>
  <option value="">所有學年度</option>
  <option value="113">113學年度</option>
  <option value="114">114學年度</option>
</select>

  {/* 課表學制篩選下拉選單 */}
  <select
    id="scheduleStudentTypeSelect"
    onChange={(event) => setScheduleStudentType(event.target.value)}
  >
    <option value="">所有學制</option>
    <option value="碩士">碩士班</option>
    <option value="碩職">碩職班</option>
  </select>

  {/* 課表學期篩選下拉選單 */}
  <select
    id="scheduleSemesterSelect"
    onChange={(event) => setScheduleSemester(event.target.value)}
  >
    <option value="">所有學期</option>
    <option value="上">上學期</option>
    <option value="下">下學期</option>
  </select>
</div>
    <table className="schedule-table" border="1" style={{ width: "100%", textAlign: "center" }}>
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
      <td>{period}</td>
      {[1, 2, 3, 4, 5, 6].map((day, colIndex) => {
        const rowData = schedule[rowIndex + 1]?.[day]; // 根據節次和星期獲取資料

        if (rowData) {
          // 如果有 rowSpan，渲染單元格
          if (rowData.rowSpan) {
            return (
              <td key={colIndex} rowSpan={rowData.rowSpan}>
                <div>{rowData.課程代號}</div>
                <div>{rowData.課程名稱}</div>
                <div>{renderTeachers(rowData.教師)}</div>
                <div>{rowData.地點}</div>
              </td>
            );
          }
        }

        // 如果資料為 null，跳過渲染
        if (rowData === null) {
          return null;
        }

        // 如果沒有資料，顯示 "無"
        return <td key={colIndex}></td>;
      })}
    </tr>
  ))}
</tbody>
    </table>
  </div>
</div>
          </div>
        </div>
      
    </>
  );
}