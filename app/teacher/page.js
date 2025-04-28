'use client';
import { useEffect, useState } from 'react';
import app from '../_firebase/Config';
import { collection, getDocs, getFirestore } from 'firebase/firestore';
import Link from 'next/link';

const db = getFirestore(app);

export default function TeacherPage() {
    const [teachers, setTeachers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTeachers = async () => {
            try {
                const teachersCollection = collection(db, '系所教師');
                const teacherSnapshot = await getDocs(teachersCollection);
                const teacherList = teacherSnapshot.docs.map(doc => {
                    return { id: doc.id, ...doc.data() };
                });
                setTeachers(teacherList);
                setLoading(false);
            } catch (error) {
                console.error("Error fetching teachers: ", error);
                setLoading(false);
            }
        };

        fetchTeachers();
    }, []);

    if (loading) {
        return <div className="container mx-auto p-4">Loading teachers...</div>;
    }

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-4">教師列表</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {teachers.map((teacher) => (
                    <Link href={`/teacher/${teacher.姓名}`} key={teacher.id}>
                        <div className="border p-4 rounded shadow hover:shadow-lg transition cursor-pointer">
                            <h2 className="text-xl font-semibold">{teacher.姓名}</h2>
                            <p className="text-gray-600">{teacher.信箱}</p>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
}