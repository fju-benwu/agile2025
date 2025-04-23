import { getFirestore, collection, getDocs } from 'firebase/firestore';
import app from "@/app/_firebase/Config";
export async function generateStaticParams() {
  // Example: Replace with your logic to fetch all possible `tid` values
  const db = getFirestore(app);
  const querySnapshot = await getDocs(collection(db, '系所教師'));
  const params = [];
  querySnapshot.forEach((doc) => {
    params.push({ tid: doc.id });
  });
  return params;
}

export default async function Page({ params }) {
  const { tid } = await params;
  const tname = isNaN(Number(tid)) ? decodeURIComponent(tid) : tid;
  return <div>tname: {tname}</div>;
}