'use client'
// 被copilot騙了，use client不能用這種寫法
// import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { getFirestore, getDoc, doc, collection, query, where, getDocs } from 'firebase/firestore';
import app from "@/app/_firebase/Config";
// 將tname當成prop傳入
// export default function Page({params}) {
export default function Page({ tName: initialTName }) {
  const [teacherData, setTeacherData] = useState(null);
  const [tid, setTid] = useState(null);
  const [tName, setTName] = useState(initialTName);
  const db = getFirestore(app);
  

  // async function getParams() {
  //   const { tid } = await params;
  //   setTid(tid); // 更新 tid 狀態
  //   return tid; // 返回 tid 和 tname
  // }
  // setTid(getParams()); // 從路由參數中獲取tid和tname

  useEffect(() => {

    async function fetchTeacherData() {
      try {
        // console.log("tid:",tid);
        // if (tid==tname) {
        //   //如果tid是數字，則直接使用tid查詢
        //   const querySnapshot = await getDoc(doc(db, '系所教師', tid));
        //   if (querySnapshot.exists()) {
        //     setTeacherData(querySnapshot.data());
        //   } else {
        //     console.log('No matching documents!');
        //   }
        // }else{
          //如果tid是名字，則直接使用名字查詢
          const querySnapshot = await getDocs(query(collection(db, '系所教師'), where('姓名', '==', tName)));
          if (!querySnapshot.empty) {
            querySnapshot.forEach((doc) => {
              setTeacherData(doc.data());
            });
          } else {
            console.log('No matching documents!');
          }
        // }
      } catch (error) {
        console.error('Error fetching teacher data:', error);
      }


    }
    // const tname = isNaN(Number(tid)) ? decodeURIComponent(tid) : tid;

    fetchTeacherData();
  }, [tName]);
  
  return teacherData?
    <div>
      <p>姓名: {teacherData.姓名}</p>
      <p>電子郵件: {teacherData.信箱}</p>
      <p>辦公室位置: {teacherData.辦公室位置}</p>
    </div>
    :
    <p>查無資料</p>;
}
