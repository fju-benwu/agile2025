import { getFirestore, collection, getDocs } from 'firebase/firestore';
import app from "@/app/_firebase/Config";

export async function generateStaticParams() {
  // Replace with your actual dynamic parameters
  const db = getFirestore(app);
  const teacherCollection = collection(db, '系所師資');
  const snapshot = await getDocs(teacherCollection);
  const params = snapshot.docs.map(doc => ({ tid: doc.id }));
  return params;
}

export default async function Page({ params }) {
  const { tid } = await params;
  const tname = isNaN(Number(tid)) ? decodeURIComponent(tid) : tid;
  return <div>tname: {tname}</div>;
}