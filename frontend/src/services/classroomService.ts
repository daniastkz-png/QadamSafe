import {
    collection,
    doc,
    setDoc,
    getDoc,
    getDocs,
    query,
    where,
    updateDoc,
    serverTimestamp,
    orderBy
} from 'firebase/firestore';
import { db, auth, API_URL, fetchWithTimeout } from './firebase';


export interface Classroom {
    id: string;
    name: string;
    grade: string;
    teacherId: string;
    code: string;
    createdAt: any;
    studentCount: number;
}

export const classroomService = {
    // Create a new classroom
    createClassroom: async (name: string, grade: string, teacherId: string): Promise<string> => {
        try {
            const classroomId = doc(collection(db, 'classrooms')).id;
            // Generate a random 6-character code
            const code = 'QS' + Math.random().toString(36).substring(2, 8).toUpperCase();

            await setDoc(doc(db, 'classrooms', classroomId), {
                id: classroomId,
                name,
                grade,
                teacherId,
                code,
                createdAt: serverTimestamp(),
                studentCount: 0,
                settings: {
                    allowJoin: true
                }
            });

            return classroomId;
        } catch (error) {
            console.error('Error creating classroom:', error);
            throw error;
        }
    },

    // Get classrooms for a teacher
    getTeacherClassrooms: async (teacherId: string): Promise<Classroom[]> => {
        try {
            const q = query(
                collection(db, 'classrooms'),
                where('teacherId', '==', teacherId),
                orderBy('createdAt', 'desc')
            );

            const snapshot = await getDocs(q);
            return snapshot.docs.map(doc => doc.data() as Classroom);
        } catch (error) {
            console.error('Error getting classrooms:', error);
            throw error;
        }
    },

    // Get students in a classroom (using subcollection)
    getClassroomStudents: async (classroomId: string) => {
        try {
            // Depending on architecture, students might be in a subcollection OR 
            // we query users with 'classroomId' array. 
            // For this implementation, let's query the 'students' subcollection if we use that pattern,
            // OR query the users collection.
            // Following the plan: /classrooms/{id}/students/{uid}

            const studentsRef = collection(db, 'classrooms', classroomId, 'students');
            const snapshot = await getDocs(studentsRef);

            // To get full student details (name, avatar), we might need to fetch user profiles
            // This can be optimized, but for now let's fetch individual profiles
            const students = await Promise.all(snapshot.docs.map(async (studentDoc) => {
                const uid = studentDoc.id;
                const userDoc = await getDoc(doc(db, 'users', uid));
                if (userDoc.exists()) {
                    return { ...userDoc.data(), ...studentDoc.data() };
                }
                return null;
            }));

            return students.filter(s => s !== null);
        } catch (error) {
            console.error('Error getting students:', error);
            throw error;
        }
    },

    // Join a classroom (Backend API)
    joinClassroom: async (code: string) => {
        try {
            const currentUser = auth.currentUser;
            if (!currentUser) throw new Error('Not authenticated');

            const token = await currentUser.getIdToken();

            const response = await fetchWithTimeout(`${API_URL}/api/classrooms/join`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ code })
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || 'Failed to join classroom');
            }

            return await response.json();
        } catch (error) {
            console.error('Error joining classroom:', error);
            throw error;
        }
    },

    // Delete classroom
    deleteClassroom: async (classroomId: string) => {
        try {
            await updateDoc(doc(db, 'classrooms', classroomId), {
                isDeleted: true
            });
            // Or actually delete: await deleteDoc(doc(db, 'classrooms', classroomId));
        } catch (error) {
            console.error('Error deleting classroom:', error);
            throw error;
        }
    }
};
