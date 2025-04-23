'use client'
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { getFirestore, getDoc, doc, collection, query, where, getDocs } from 'firebase/firestore';
import app from "@/app/_firebase/Config";

//新增generateStaticParams()解決
//[Error: Page "/teacher/[tid]" is missing "generateStaticParams()" so it cannot be used with "output: export" config.]
// export async function generateStaticParams() {
//   // Example: Replace with your logic to fetch all possible `tid` values
//   const db = getFirestore(app);
//   const querySnapshot = await getDocs(collection(db, '系所教師'));
//   const params = [];
//   querySnapshot.forEach((doc) => {
//     params.push({ tid: doc.id });
//   });
//   return params;
// }

export default function TeacherIntro() {

  const { tid } = useParams();// 使用 useParams() 取得路由參數
  //如果參數內容是數字，則儲存數字
  //如果參數內容不是數字，中文字會被加碼，使用RIComponent()解碼後，儲存老師姓名
  const tname = isNaN(Number(tid)) ? decodeURIComponent(tid) : tid;
  
  const db = getFirestore(app);

  const [teacherData, setTeacherData] = useState(null);

  useEffect(() => {
    async function fetchTeacherData() {
      try {
        if (tid==tname) {
          //如果tid是數字，則直接使用tid查詢
          const querySnapshot = await getDoc(doc(db, '系所教師', tid));
          if (querySnapshot.exists()) {
            setTeacherData(querySnapshot.data());
          } else {
            console.log('No matching documents!');
          }
        }else{
          //如果tid是名字，則直接使用名字查詢
          const querySnapshot = await getDocs(query(collection(db, '系所教師'), where('姓名', '==', tname)));
          if (!querySnapshot.empty) {
            querySnapshot.forEach((doc) => {
              setTeacherData(doc.data());
            });
          } else {
            console.log('No matching documents!');
          }
        }
      } catch (error) {
        console.error('Error fetching teacher data:', error);
      }


    }
    fetchTeacherData();
  }, [tname]);
  
  return teacherData?
    <div>
      <p>姓名: {teacherData.姓名}</p>
      <p>電子郵件: {teacherData.信箱}</p>
      <p>辦公室位置: {teacherData.辦公室位置}</p>
    </div>
    :
    <p>查無資料</p>;
}
