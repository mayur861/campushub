const API_URL = "http://localhost:5000/api";

const token = localStorage.getItem("token");

const user = JSON.parse(
    localStorage.getItem("user") || "{}"
);


// ==========================================
// AUTH CHECK
// ==========================================

if (!token) {
    window.location.href = "login.html";
}

if (user.role && user.role !== "faculty") {
    window.location.href = "dashboard.html";
}


// ==========================================
// ELEMENTS
// ==========================================

const subjectSelect =
    document.getElementById("subject");

const examTypeSelect =
    document.getElementById("examType");

const loadStudentsBtn =
    document.getElementById("loadStudentsBtn");

const marksSection =
    document.getElementById("marksSection");

const emptyState =
    document.getElementById("emptyState");

const studentTableBody =
    document.getElementById("studentTableBody");

const studentCount =
    document.getElementById("studentCount");

const message =
    document.getElementById("message");

const saveMarksBtn =
    document.getElementById("saveMarksBtn");

const logoutBtn =
    document.getElementById("logoutBtn");


// ==========================================
// LOAD FACULTY SUBJECTS
// ==========================================

async function loadSubjects() {

    try {

        subjectSelect.disabled = true;

        const response = await fetch(
            `${API_URL}/faculty/subjects`, {
                method: "GET",

                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );

        const data =
            await response.json();


        if (!response.ok) {

            if (response.status === 401) {
                logout();
                return;
            }

            throw new Error(
                data.message ||
                "Unable to load subjects"
            );
        }


        subjectSelect.innerHTML =
            `<option value="">
                Select Subject
            </option>`;


        if (!data.data ||
            data.data.length === 0
        ) {

            subjectSelect.innerHTML +=
                `<option value="">
                    No subjects found
                </option>`;

            return;
        }


        data.data.forEach(subject => {

            const option =
                document.createElement("option");

            option.value =
                subject.id;

            option.textContent =
                `${subject.name} (${subject.code})`;

            subjectSelect.appendChild(option);

        });


    } catch (error) {

        console.error(
            "Load Subjects Error:",
            error
        );

        showMessage(
            error.message,
            "error"
        );

    } finally {

        subjectSelect.disabled = false;

    }

}


// ==========================================
// LOAD STUDENTS
// ==========================================

async function loadStudents() {

    const subjectId =
        subjectSelect.value;

    const examType =
        examTypeSelect.value;


    if (!subjectId) {

        showMessage(
            "Please select a subject.",
            "error"
        );

        return;
    }


    if (!examType) {

        showMessage(
            "Please select exam type.",
            "error"
        );

        return;
    }


    loadStudentsBtn.disabled = true;

    loadStudentsBtn.textContent =
        "Loading...";


    try {

        const response = await fetch(
            `${API_URL}/faculty/students`, {
                method: "GET",

                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );


        const data =
            await response.json();


        if (!response.ok) {

            if (response.status === 401) {
                logout();
                return;
            }

            throw new Error(
                data.message ||
                "Unable to load students"
            );
        }


        renderStudents(
            data.data || []
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

    } finally {

        loadStudentsBtn.disabled = false;

        loadStudentsBtn.textContent =
            "Load Students";

    }

}


// ==========================================
// RENDER STUDENTS
// ==========================================

function renderStudents(students) {

    studentTableBody.innerHTML = "";


    if (!students ||
        students.length === 0
    ) {

        marksSection.style.display =
            "none";

        emptyState.style.display =
            "block";

        studentCount.textContent =
            "0 students";

        showMessage(
            "No students found in your department.",
            "error"
        );

        return;
    }


    students.forEach(
        (student, index) => {

            const row =
                document.createElement("tr");


            row.innerHTML = `

                <td>
                    <span class="serial-number">
                        ${index + 1}
                    </span>
                </td>


                <td>

                    <div class="student-info">

                        <div class="student-avatar">
                            ${getInitials(student.name)}
                        </div>

                        <div>

                            <strong>
                                ${escapeHtml(
                                    student.name
                                )}
                            </strong>

                            <small>
                                ${escapeHtml(
                                    student.email
                                )}
                            </small>

                        </div>

                    </div>

                </td>


                <td>
                    ${escapeHtml(
                        student.enrollment_no || "-"
                    )}
                </td>


                <td>
                    ${student.semester || "-"}
                </td>


                <td>
                    ${student.cgpa || "-"}
                </td>


                <td>

                    <input
                        type="number"
                        class="marks-input"
                        data-student-id="${student.id}"
                        min="0"
                        max="100"
                        step="0.01"
                        placeholder="Enter marks">

                </td>

            `;


            studentTableBody.appendChild(row);

        }
    );


    studentCount.textContent =
        `${students.length} students`;

    marksSection.style.display =
        "block";

    emptyState.style.display =
        "none";


    showMessage(
        `${students.length} students loaded successfully.`,
        "success"
    );

}


// ==========================================
// SAVE MARKS
// ==========================================

async function saveMarks() {

    const subjectId =
        subjectSelect.value;

    const examType =
        examTypeSelect.value;


    if (!subjectId) {

        showMessage(
            "Please select a subject.",
            "error"
        );

        return;
    }


    if (!examType) {

        showMessage(
            "Please select exam type.",
            "error"
        );

        return;
    }


    const inputs =
        document.querySelectorAll(
            ".marks-input"
        );


    if (inputs.length === 0) {

        showMessage(
            "No students available.",
            "error"
        );

        return;
    }


    // --------------------------------------
    // Validate marks
    // --------------------------------------

    for (const input of inputs) {

        const value =
            input.value.trim();


        if (value === "") {

            showMessage(
                "Please enter marks for all students.",
                "error"
            );

            input.focus();

            return;
        }


        const marks =
            Number(value);


        if (
            Number.isNaN(marks) ||
            marks < 0 ||
            marks > 100
        ) {

            showMessage(
                "Marks must be between 0 and 100.",
                "error"
            );

            input.focus();

            return;
        }

    }


    const confirmed =
        confirm(
            `Save ${examType} marks for ${inputs.length} students?`
        );


    if (!confirmed) {
        return;
    }


    saveMarksBtn.disabled = true;

    saveMarksBtn.textContent =
        "Saving...";


    let successCount = 0;

    let errorCount = 0;


    try {

        for (const input of inputs) {

            const studentId =
                Number(
                    input.dataset.studentId
                );


            const marks =
                Number(input.value);


            try {

                const response =
                    await fetch(
                        `${API_URL}/marks`, {
                            method: "POST",

                            headers: {

                                "Content-Type": "application/json",

                                Authorization: `Bearer ${token}`

                            },

                            body: JSON.stringify({

                                student_id: studentId,

                                subject_id: Number(
                                    subjectId
                                ),

                                exam_type: examType,

                                marks: marks

                            })
                        }
                    );


                const data =
                    await response.json();


                if (response.ok) {

                    successCount++;

                    input.disabled = true;

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
                    `Student ${studentId}:`,
                    error
                );

            }

        }


        if (
            successCount > 0 &&
            errorCount === 0
        ) {

            showMessage(
                `✓ Marks saved successfully for ${successCount} students.`,
                "success"
            );

        } else if (
            successCount > 0 &&
            errorCount > 0
        ) {

            showMessage(
                `Marks saved for ${successCount} students. ${errorCount} records failed or already exist.`,
                "error"
            );

        } else {

            showMessage(
                "No marks were saved. Marks may already exist for this exam.",
                "error"
            );

        }


    } finally {

        saveMarksBtn.disabled = false;

        saveMarksBtn.textContent =
            "💾 Save Marks";

    }

}


// ==========================================
// MESSAGE
// ==========================================

function showMessage(text, type) {

    message.textContent = text;

    message.className =
        "message";


    if (type === "success") {

        message.classList.add(
            "message-success"
        );

    } else if (type === "error") {

        message.classList.add(
            "message-error"
        );

    } else {

        message.classList.add(
            "message-info"
        );

    }

}


// ==========================================
// GET INITIALS
// ==========================================

function getInitials(name) {

    if (!name) {
        return "S";
    }


    const parts =
        name.trim().split(" ");


    if (parts.length === 1) {

        return parts[0]
            .charAt(0)
            .toUpperCase();

    }


    return (
        parts[0].charAt(0) +
        parts[parts.length - 1].charAt(0)
    ).toUpperCase();

}


// ==========================================
// ESCAPE HTML
// ==========================================

function escapeHtml(value) {

    if (
        value === null ||
        value === undefined
    ) {
        return "";
    }


    return String(value)

    .replace(/&/g, "&amp;")

    .replace(/</g, "&lt;")

    .replace(/>/g, "&gt;")

    .replace(/"/g, "&quot;")

    .replace(/'/g, "&#039;");

}


// ==========================================
// LOGOUT
// ==========================================

function logout() {

    localStorage.removeItem("token");

    localStorage.removeItem("user");

    window.location.href =
        "login.html";

}


logoutBtn.addEventListener(
    "click",
    (event) => {

        event.preventDefault();

        logout();

    }
);


// ==========================================
// EVENTS
// ==========================================

loadStudentsBtn.addEventListener(
    "click",
    loadStudents
);


saveMarksBtn.addEventListener(
    "click",
    saveMarks
);


// ==========================================
// INITIAL LOAD
// ==========================================

loadSubjects();