import styles from "./course.module.css";
import { getFirestore, collection, getDocs } from "firebase/firestore"; 
import app from "@/app/_firebase/Config";
const db = getFirestore(app);
const querySnapshot = await getDocs(collection(db, "系所課程"));
// console.log("系所課程資料：");
let courses = [];
querySnapshot.forEach((doc) => {
  // console.log(`${doc.id} => ${doc.data().課程名稱}`);
  courses.push(doc.data());
  // console.log(`${doc.id} => ${doc.data().教師.join("、")}`);

});

//<body> is moved to layout.js
export default function Course() {
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
          <table className="course-table">
            <thead>
            <tr>
              <th>課程名稱</th>
              <th>授課教師</th>
            </tr>
            </thead>
            <tbody>
            {courses.map((course, index) => (
            <tr key={index}>
              <td>{course.課程名稱}</td>
              <td>{course.教師.join("、")}</td>
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