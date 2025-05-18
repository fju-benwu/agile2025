'use client'
// import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { getFirestore, getDoc, doc, collection, query, where, getDocs } from 'firebase/firestore';
import app from "@/app/_firebase/Config";

// 將 tName 當成 prop 傳入
export default function Teacher({ tName }) {
  const [teacherData, setTeacherData] = useState(null);
  const db = getFirestore(app);

  useEffect(() => {
    async function fetchTeacherData() {
      if (!tName) return;

      // 查詢 Firebase 中教師集合，根據姓名篩選
      const teacherCollection = collection(db, "系所教師");
      const q = query(teacherCollection, where("姓名", "==", tName.trim()));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const teacherDoc = querySnapshot.docs[0];
        const teacherData = teacherDoc.data();

        // 抓取該教師的 student 子集合
        const studentCollection = collection(teacherDoc.ref, "student");
        const studentSnapshot = await getDocs(studentCollection);

        const students = studentSnapshot.docs.map((doc) => doc.data());

        setTeacherData({ ...teacherData, students });
      } else {
        setTeacherData(null);
      }
    }

    fetchTeacherData();
  }, [tName]);

  // 將網址自動轉為可點擊的連結
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

  return teacherData ? (
    <div
      style={{
        fontFamily: "標楷體, serif",
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
      {/* 左側圖片區域 */}
      <div style={{ textAlign: "center", flex: "1" }}>
        <h1 style={{ fontSize: "28px", marginBottom: "16px", color: "#1e3a8a", letterSpacing: "2px" }}>
          {teacherData.姓名}
        </h1>
        <div
          style={{
            width: "300px",
            height: "150px",
            margin: "0 auto 18px auto",
            padding: "15px",
            border: "5px solid blue",
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

      {/* 右側資訊區域 */}
      <div style={{ flex: "2", fontSize: "18px" }}>
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

        <div style={{ margin: "18px 0 10px 0", fontWeight: "bold", color: "#0d9488", fontSize: "20px" }}>學生資料</div>
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
    <p style={{ textAlign: "center", color: "#999", fontFamily: "標楷體, serif", fontSize: "20px" }}>查無資料</p>
  );
}