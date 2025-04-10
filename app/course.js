'use client'
import styles from "./course.module.css";
import { getFirestore, collection, getDocs, query, where } from "firebase/firestore"; 
import app from "@/app/_firebase/Config";
import { useEffect, useState } from "react";

//<body> is moved to layout.js
export default function Course() {
  const db = getFirestore(app);
  console.log("Firebase App Initialized:", db);
  let [courses, setCourses] = useState([]);


  const getCourses = async () => {
    console.log("Fetching course data...");
    setCourses([]); // Clear the courses array before fetching new data 
    const querySnapshot = await getDocs(collection(db, "系所課程"));
    // console.log("系所課程資料：");
    querySnapshot.forEach((doc) => {
      // console.log(`${doc.id} => ${doc.data().課程名稱}`);
      setCourses((prevCourses) => [...prevCourses, doc.data()]); // Update the state with the new course data
      // courses.push(doc.data());
      // console.log(`${doc.id} => ${doc.data().教師.join("、")}`);

    });
  }
  useEffect(() => {
    getCourses(); // Fetch courses when the component mounts
  }, []); // Empty dependency array to run only once on mount
  // getCourses(); // Fetch courses when the component mounts
  async function showStudentType(event) {
    const studentType = event.target.value;
    const courseCollection = collection(db, "系所課程");
    const courseQuery = query(courseCollection, where("學制", "==", studentType));
    const querySnapshot = await getDocs(courseQuery);
    // const querySnapshot = await getDocs(collection(db, ""));
    setCourses([]); // Clear the courses array before fetching new data 
    querySnapshot.forEach((doc) => {
      setCourses((prevCourses) => [...prevCourses, doc.data()]); // Update the state with the new course data
    });
    console.log(courses);
  // Force a re-render by updating the state or triggering a UI update
  // document.querySelector(".course-table tbody").innerHTML = courses.map((course, index) => `
  //   <tr key=${index}>
  //     <td>${course.課程名稱}</td>
  //     <td>${course.教師}</td>
  //     <td>${course.學分}</td>
  //   </tr>
  // `).join('');
  }

  return (
  <>
    <header>
      <h1>輔大資管碩士新生資訊系統</h1>
      <p>整合修業規則、課程資訊與師資介紹</p>
    </header>
    <div className="container">
      {/* 修業規則與必選修課程 */}
      <div className="section">
        <div className={styles.main}>
          <h2>修業規則與必選修課程</h2>
          <div className="select-container">
            <select id="studentTypeSelect" onChange={showStudentType}>
              <option value="碩一">一般生</option>
              <option value="碩職">在職專班</option>
            </select>
          </div>
          <table className="course-table">
            <thead>
            <tr>
              <th>課程名稱</th>
              <th>授課教師</th>
              <th>學分</th>
            </tr>
            </thead>
            <tbody>
            {courses.map((course, index) => (
            <tr key={index}>
              <td>{course.課程名稱}</td>
              <td>{course.教師}</td>
              <td>{course.學分}</td>
            </tr>
          ))}
            </tbody>
          </table>
        </div>
      </div>
    </div> 
  </>
  )
}