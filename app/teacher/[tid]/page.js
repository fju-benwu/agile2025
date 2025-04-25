import { getFirestore, collection, getDocs } from 'firebase/firestore';
import app from "@/app/_firebase/Config";
import Teacher from './teacher';
export async function generateStaticParams() {
  // Example: Replace with your logic to fetch all possible `tid` values
  const db = getFirestore(app);
  const querySnapshot = await getDocs(collection(db, '系所教師'));
  const params = [];
  querySnapshot.forEach((doc) => {
    params.push({ tid: doc.data().姓名 });
  });
  return params;
}

export default async function Page({ params }) {
  const { tid } = params; // 從路由參數中獲取教師 ID
  const tName = decodeURIComponent(tid);
  return <Teacher tName={tName} />;
}