'use client'

import styles from "./course.module.css";
import { getFirestore, collection, getDocs, query, where } from "firebase/firestore"; 
import app from "@/app/_firebase/Config";
import { useEffect, useState } from "react";
import Link from "next/link";

const renderTeachers = (teachers) => {
  if (Array.isArray(teachers)) {
    return teachers.map((teacher, index) => (
      <span key={index}>
        <Link href={`/teacher/${encodeURIComponent(teacher.trim())}`}>
          {teacher.trim()}
        </Link>
        {index < teachers.length - 1 && ", "}
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

export default function Course() {
  const db = getFirestore(app);

  const [academicYear, setAcademicYear] = useState(""); // 課程學年度
  const [studentType, setStudentType] = useState(""); 
  const [category, setCategory] = useState("不限");
  const [requiredType, setRequiredType] = useState("");
  const [semester, setSemester] = useState("");

  const [courses, setCourses] = useState([]);

  const [schedule, setSchedule] = useState([]);
  const [scheduleAcademicYear, setScheduleAcademicYear] = useState("");
  const [scheduleStudentType, setScheduleStudentType] = useState("");
  const [scheduleSemester, setScheduleSemester] = useState("");

  // 根據學年度讀取課程資料
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
  }, [academicYear, studentType, category, requiredType, semester]);

  // 根據學年度讀取課表資料
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
  }, [scheduleAcademicYear, scheduleStudentType, scheduleSemester]);

  return (
    <div className="container">
      <div className="section">
        <div className={styles.main}>
          <h2>修業規則與必選修課程</h2>
          <div className="select-container">
            <select onChange={(e) => {setStudentType(e.target.value);
    if (e.target.value) {
      setAcademicYear("113"); // 自動設置為 113 學年度
      document.querySelector("#academicYearSelect").value = "113"; // 同步更新學年度選項
    }}}>
              <option value="">所有學制</option>
              <option value="碩士">一般生</option>
              <option value="碩職">在職專班</option>
            </select>

            <select  id="academicYearSelect" onChange={(e) => setAcademicYear(e.target.value)}>
              <option value="">所有學年度</option>
              <option value="113">113學年度</option>
              <option value="114">114學年度</option>
            </select>

            <div style={{ marginTop: "80px", marginLeft: "-236.5px" }}>
              <select onChange={(e) => setCategory(e.target.value)}>
                <option value="不限">不限</option>
                <option value="人工">人工</option>
                <option value="電商">電商</option>
              </select>
            </div>

            <div style={{ marginTop: "80px" }}>
              <select onChange={(e) => setRequiredType(e.target.value)}>
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

          {/* 課表區塊 */}
          <div className="section">
            <h2>課表</h2>
            <div className="select-container" style={{ marginBottom: "20px", display: "flex", gap: "10px" }}>
              <select onChange={(e) => setScheduleAcademicYear(e.target.value)}>
                <option value="">所有學年度</option>
                <option value="113">113學年度</option>
                <option value="114">114學年度</option>
              </select>

              <select onChange={(e) => setScheduleStudentType(e.target.value)} >
                <option value="">所有學制</option>
                <option value="碩士">碩士班</option>
                <option value="碩職">碩職班</option>
              </select>

              <select onChange={(e) => setScheduleSemester(e.target.value)}>
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
                      const rowData = schedule[rowIndex + 1]?.[day];

                      if (rowData) {
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

                      if (rowData === null) return null;
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
  );
}
