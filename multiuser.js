'use client'
import styles from "./course.module.css";
import { getFirestore, collection, getDocs, query, where } from "firebase/firestore"; 
import app from "@/app/_firebase/Config";
import { useEffect, useState } from "react";

export default function Course() {
  const db = getFirestore(app);
  const [courses, setCourses] = useState([]);
  const [studentType, setStudentType] = useState(""); // 學制篩選
  const [category, setCategory] = useState("不限"); // 選別篩選
  const [requiredType, setRequiredType] = useState(""); // 選必修篩選

  // 初始載入所有課程
  useEffect(() => {
    async function fetchCourses() {
      const querySnapshot = await getDocs(collection(db, "系所課程"));
      const initialCourses = [];
      querySnapshot.forEach((doc) => {
        initialCourses.push(doc.data());
      });
      setCourses(initialCourses);
    }
    fetchCourses();
  }, []);

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
          <a href={`https://www.im.fju.edu.tw/${TEACHER_PATH}${encodeURIComponent(teacher)}`}>
            {teacher}
          </a>
          {index < teachers.length - 1 && ", "} {/* 在最後一個教師名稱後不加逗號 */}
        </span>
      ));
    } else {
      return (
        <a href={`https://www.im.fju.edu.tw/${TEACHER_PATH}${encodeURIComponent(teachers)}`}>
          {teachers}
        </a>
      );
    }
  };

  return (
    <>
      <header>
        <h1>輔大資管碩士新生資訊系統</h1>
        <p>整合修業規則、課程資訊與師資介紹</p>
      </header>
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
              <select
                id="categorySelect"
                onChange={(event) => setCategory(event.target.value)}
              >
                <option value="不限">不限</option>
                <option value="人工">人工</option>
                <option value="電商">電商</option>
              </select>

              {/* 選必修篩選下拉選單 */}
              <select
                id="requiredTypeSelect"
                onChange={(event) => setRequiredType(event.target.value)}
              >
                <option value="">所有課程</option>
                <option value="必修">必修</option>
                <option value="選修">選修</option>
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
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}