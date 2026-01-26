const { db, admin } = require("../config/firebase");

const joinClassroom = async (req, res) => {
    try {
        const { code } = req.body;
        const userId = req.user.userId;

        if (!code) {
            return res.status(400).json({ error: "Class code is required" });
        }

        // Find classroom by code
        const snapshot = await db.collection("classrooms")
            .where("code", "==", code.toUpperCase().trim())
            .limit(1)
            .get();

        if (snapshot.empty) {
            return res.status(404).json({ error: "Classroom not found" });
        }

        const classroomDoc = snapshot.docs[0];
        const classroom = classroomDoc.data();

        // Check if already joined
        const studentDoc = await db.collection("classrooms").doc(classroom.id).collection("students").doc(userId).get();
        if (studentDoc.exists) {
            return res.status(400).json({ error: "Already joined this classroom" });
        }

        // Add user to classroom's students subcollection
        await db.collection("classrooms").doc(classroom.id).collection("students").doc(userId).set({
            joinedAt: new Date(),
            status: "active"
        });

        // Update student count
        await db.collection("classrooms").doc(classroom.id).update({
            studentCount: admin.firestore.FieldValue.increment(1)
        });

        // Update user's profile
        await db.collection("users").doc(userId).update({
            joinedClassrooms: admin.firestore.FieldValue.arrayUnion(classroom.id)
        });

        res.status(200).json({ success: true, classroomId: classroom.id, name: classroom.name });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = { joinClassroom };
