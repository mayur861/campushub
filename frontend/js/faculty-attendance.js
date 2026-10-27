const API_URL =
    "http://localhost:5000/api";


// =========================================
// GET TOKEN
// =========================================

const token =
    localStorage.getItem("token");


// =========================================
// AUTH CHECK
// =========================================

if (!token) {

    window.location.href =
        "login.html";

}


// =========================================
// DOM ELEMENTS
// =========================================

const subjectSelect =
    document.getElementById("subject");

const attendanceDate =
    document.getElementById(
        "attendanceDate"
    );

const loadStudentsBtn =
    document.getElementById(
        "loadStudentsBtn"
    );

const attendanceSection =
    document.getElementById(
        "attendanceSection"
    );

const emptyState =
    document.getElementById(
        "emptyState"
    );

const studentTableBody =
    document.getElementById(
        "studentTableBody"
    );

const studentCount =
    document.getElementById(
        "studentCount"
    );

const message =
    document.getElementById(
        "message"
    );

const markAllPresentBtn =
    document.getElementById(
        "markAllPresentBtn"
    );

const markAllAbsentBtn =
    document.getElementById(
        "markAllAbsentBtn"
    );

const saveAttendanceBtn =
    document.getElementById(
        "saveAttendanceBtn"
    );

const logoutBtn =
    document.getElementById(
        "logoutBtn"
    );


// =========================================
// TODAY DATE
// =========================================

const today =
    new Date()
    .toISOString()
    .split("T")[0];

attendanceDate.value = today;


// =========================================
// LOAD FACULTY SUBJECTS
// =========================================

async function loadSubjects() {

    try {

        const response =
            await fetch(
                `${API_URL}/faculty/subjects`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );


        const data =
            await response.json();


        if (!response.ok) {

            throw new Error(
                data.message ||
                "Unable to load subjects"
            );

        }


        subjectSelect.innerHTML =
            `<option value="">
                Select Subject
            </option>`;


        data.data.forEach(
            (subject) => {

                const option =
                    document.createElement(
                        "option"
                    );

                option.value =
                    subject.id;

                option.textContent =
                    `${subject.name} (${subject.code})`;

                subjectSelect.appendChild(
                    option
                );

            }
        );


    } catch (error) {

        console.error(
            "Load Subjects Error:",
            error
        );

        showMessage(
            error.message,
            "error"
        );

    }
}


// =========================================
// LOAD STUDENTS
// =========================================

async function loadStudents() {

    const subjectId =
        subjectSelect.value;

    const selectedDate =
        attendanceDate.value;


    if (!subjectId) {

        showMessage(
            "Please select a subject",
            "error"
        );

        return;

    }


    if (!selectedDate) {

        showMessage(
            "Please select attendance date",
            "error"
        );

        return;

    }


    showMessage(
        "Loading students...",
        "info"
    );


    try {

        const response =
            await fetch(
                `${API_URL}/faculty/students`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );


        const data =
            await response.json();


        if (!response.ok) {

            throw new Error(
                data.message ||
                "Unable to load students"
            );

        }


        renderStudents(
            data.data
        );


        showMessage(
            `${data.count} students loaded`,
            "success"
        );


    } catch (error) {

        console.error(
            "Load Students Error:",
            error
        );

        showMessage(
            error.message,
            "error"
        );

    }
}


// =========================================
// RENDER STUDENTS
// =========================================

function renderStudents(
    students
) {

    studentTableBody.innerHTML =
        "";


    if (!students ||
        students.length === 0
    ) {

        attendanceSection.style.display =
            "none";

        emptyState.style.display =
            "block";

        showMessage(
            "No students found",
            "error"
        );

        return;

    }


    students.forEach(
        (student, index) => {

            const row =
                document.createElement(
                    "tr"
                );


            row.innerHTML = `

                <td>
                    ${index + 1}
                </td>

                <td>
                    <strong>
                        ${escapeHtml(
                            student.name
                        )}
                    </strong>
                    <br>
                    <small>
                        ${escapeHtml(
                            student.email
                        )}
                    </small>
                </td>

                <td>
                    ${escapeHtml(
                        student.enrollment_no
                    )}
                </td>

                <td>
                    ${student.semester || "-"}
                </td>

                <td>
                    ${student.cgpa || "-"}
                </td>

                <td>

                    <select
                        class="status-select attendance-status"
                        data-student-id="${student.id}">

                        <option value="present">
                            Present
                        </option>

                        <option value="absent">
                            Absent
                        </option>

                    </select>

                </td>

            `;


            studentTableBody.appendChild(
                row
            );

        }
    );


    studentCount.textContent =
        `${students.length} students`;


    attendanceSection.style.display =
        "block";

    emptyState.style.display =
        "none";

}


// =========================================
// SAVE ATTENDANCE
// =========================================

async function saveAttendance() {

    const subjectId =
        subjectSelect.value;

    const selectedDate =
        attendanceDate.value;


    if (!subjectId || !selectedDate) {

        showMessage(
            "Please select subject and date",
            "error"
        );

        return;

    }


    const statusElements =
        document.querySelectorAll(
            ".attendance-status"
        );


    if (
        statusElements.length === 0
    ) {

        showMessage(
            "No students available",
            "error"
        );

        return;

    }


    saveAttendanceBtn.disabled =
        true;

    saveAttendanceBtn.textContent =
        "Saving...";


    let successCount = 0;

    let errorCount = 0;


    try {

        for (
            const statusElement
            of statusElements
        ) {

            const studentId =
                statusElement.dataset.studentId;

            const status =
                statusElement.value;


            try {

                const response =
                    await fetch(
                        `${API_URL}/attendance`, {
                            method: "POST",

                            headers: {
                                "Content-Type": "application/json",

                                Authorization: `Bearer ${token}`
                            },

                            body: JSON.stringify({

                                student_id: Number(
                                    studentId
                                ),

                                subject_id: Number(
                                    subjectId
                                ),

                                attendance_date: selectedDate,

                                status: status

                            })
                        }
                    );


                const data =
                    await response.json();


                if (response.ok) {

                    successCount++;

                } else {

                    errorCount++;

                    console.warn(
                        `Student ${studentId}:`,
                        data.message
                    );

                }

            } catch (error) {

                errorCount++;

                console.error(
                    error
                );

            }

        }


        if (errorCount === 0) {

            showMessage(
                `Attendance saved successfully for ${successCount} students.`,
                "success"
            );

        } else {

            showMessage(
                `Attendance saved for ${successCount} students. ${errorCount} records could not be saved.`,
                "error"
            );

        }


    } finally {

        saveAttendanceBtn.disabled =
            false;

        saveAttendanceBtn.textContent =
            "💾 Save Attendance";

    }

}


// =========================================
// MARK ALL PRESENT
// =========================================

function markAllPresent() {

    const elements =
        document.querySelectorAll(
            ".attendance-status"
        );


    elements.forEach(
        (element) => {

            element.value =
                "present";

        }
    );

}


// =========================================
// MARK ALL ABSENT
// =========================================

function markAllAbsent() {

    const elements =
        document.querySelectorAll(
            ".attendance-status"
        );


    elements.forEach(
        (element) => {

            element.value =
                "absent";

        }
    );

}


// =========================================
// MESSAGE
// =========================================

function showMessage(
    text,
    type
) {

    message.textContent =
        text;


    if (type === "success") {

        message.style.color =
            "#15803d";

    } else if (type === "error") {

        message.style.color =
            "#dc2626";

    } else {

        message.style.color =
            "#2563eb";

    }

}


// =========================================
// HTML ESCAPE
// =========================================

function escapeHtml(
    value
) {

    if (!value) {
        return "";
    }

    return String(value)
        .replace(
            /&/g,
            "&amp;"
        )
        .replace(
            /</g,
            "&lt;"
        )
        .replace(
            />/g,
            "&gt;"
        )
        .replace(
            /"/g,
            "&quot;"
        )
        .replace(
            /'/g,
            "&#039;"
        );

}


// =========================================
// LOGOUT
// =========================================

logoutBtn.addEventListener(
    "click",
    (event) => {

        event.preventDefault();

        localStorage.removeItem(
            "token"
        );

        localStorage.removeItem(
            "user"
        );

        window.location.href =
            "login.html";

    }
);


// =========================================
// EVENT LISTENERS
// =========================================

loadStudentsBtn.addEventListener(
    "click",
    loadStudents
);


markAllPresentBtn.addEventListener(
    "click",
    markAllPresent
);


markAllAbsentBtn.addEventListener(
    "click",
    markAllAbsent
);


saveAttendanceBtn.addEventListener(
    "click",
    saveAttendance
);


// =========================================
// INITIALIZE
// =========================================

loadSubjects();