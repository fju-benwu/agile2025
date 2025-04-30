'use client'
// 被copilot騙了，use client不能用這種寫法
// import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { getFirestore, getDoc, doc, collection, query, where, getDocs } from 'firebase/firestore';
import app from "@/app/_firebase/Config";
// 將tname當成prop傳入
// export default function Page({params}) {
  export default function Teacher({ tName }) {
    const [teacherData, setTeacherData] = useState(null);
    const db = getFirestore(app);
  
  

  // async function getParams() {
  //   const { tid } = await params;
  //   setTid(tid); // 更新 tid 狀態
  //   return tid; // 返回 tid 和 tname
  // }
  // setTid(getParams()); // 從路由參數中獲取tid和tname

  useEffect(() => {
    async function fetchTeacherData() {
      if (!tName) return; // 確保 tName 存在

      // 查詢 Firebase 中教師集合，根據姓名篩選
      const teacherCollection = collection(db, "系所教師"); // 假設集合名稱為 "系所教師"
      const q = query(teacherCollection, where("姓名", "==", tName.trim())); // 根據姓名查詢
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        // 如果找到教師資料，取第一筆資料
        const teacherDoc = querySnapshot.docs[0];
        const teacherData = teacherDoc.data();
  
        // 抓取該教師的 student 子集合
        const studentCollection = collection(teacherDoc.ref, "student"); // 子集合名稱為 "student"
        const studentSnapshot = await getDocs(studentCollection);
  
        const students = studentSnapshot.docs.map((doc) => doc.data()); // 將子集合文檔轉為陣列
  
        // 將教師資料和學生資料合併
        setTeacherData({ ...teacherData, students });
      } else {
        setTeacherData(null); // 如果找不到教師資料
      }
    }
  
    fetchTeacherData();
  }, [tName]);
  
  return teacherData?
  (
    <div style={{ fontFamily: "標楷體, serif", lineHeight: "1.8", maxWidth: "800px", margin: "0 auto", padding: "20px", display: "flex", alignItems: "flex-start", gap: "20px" }}>
      {/* 左側圖片區域 */}
      <div style={{ textAlign: "center", flex: "1" }}>
        <h1 style={{ fontSize: "24px", marginBottom: "10px" }}>{teacherData.姓名}</h1>
        <img 
          src={teacherData.照片} 
          alt={`${teacherData.姓名} 的照片`} 
          style={{ maxWidth: "300px", height: "auto", borderRadius: "8px", border: "2px solid #ddd" }} 
        />
      </div>

      {/* 右側資訊區域 */}
      <div style={{ flex: "2" }}>
        <p><strong>電子郵件:</strong> {teacherData.信箱}</p>
        <p><strong>辦公室位置:</strong> {teacherData.辦公室位置}</p>
        <p><strong>電話:</strong> {teacherData.電話}</p>
        <p><strong>專長:</strong> </p>
        {/* 專長 */}
        {Array.isArray(teacherData.專長) && teacherData.專長.length > 0 ? (
  <ul style={{ paddingLeft: "20px", listStyleType: "disc" }}>
    {teacherData.專長.map((item, index) => (
      <li key={index}>{item}</li>
    ))}
  </ul>
) : (
  <p style={{ color: "#999" }}>無專長資料</p>
)}
{/* 學生資料 */}
<p><strong>學生資料:</strong></p>
      {Array.isArray(teacherData.students) && teacherData.students.length > 0 ? (
        <ul style={{ paddingLeft: "20px", listStyleType: "disc" }}>
          {teacherData.students.map((student, index) => (
            <li key={index}>
              <p><strong>入學學年度:</strong> {student.入學學年度}</p>
              <p><strong>學生姓名:</strong> {student.學生姓名}</p>
              <p><strong>論文題目:</strong> {student.論文題目}</p>
            </li>
          ))}
        </ul>
      ) : (
        <p style={{ color: "#999" }}>無學生資料</p>
      )}
        {/* 產學合作資料 */}
        {Array.isArray(teacherData.產學合作資料) && teacherData.產學合作資料.length > 0 ? (
  <ul style={{ paddingLeft: "20px", listStyleType: "disc" }}>
    {teacherData.產學合作資料.map((item, index) => (
      <li key={index}>{item}</li>
    ))}
  </ul>
) : (
  <p style={{ color: "#999" }}>無產學合作資料</p>
)}
      </div>
    </div>
  ) : (
    <p style={{ textAlign: "center", color: "#999", fontFamily: "標楷體, serif" }}>查無資料</p>
  );
}