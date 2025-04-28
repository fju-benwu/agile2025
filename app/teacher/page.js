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
        <div className="container">
            <h1 className="heading">系所教師</h1>
            <div className="grid">
                {teachers.map((teacher) => (
                    <div key={teacher.id} className="card">
                        <Link href={`/teacher/${teacher.姓名}`} className="link">
                        <h2 className="title">{teacher.姓名}</h2>
                        <p className="text">{teacher.信箱}</p></Link>
                    </div>
                ))}
            </div>
        </div>
    );
}
