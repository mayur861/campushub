const API_URL = "http://localhost:5000/api";

const token = localStorage.getItem("token");


// =========================================
// CHECK LOGIN
// =========================================

if (!token) {

    window.location.href = "login.html";

}


// =========================================
// ELEMENTS
// =========================================

const overallAttendance =
    document.getElementById(
        "overallAttendance"
    );

const totalClasses =
    document.getElementById(
        "totalClasses"
    );

const presentClasses =
    document.getElementById(
        "presentClasses"
    );

const absentClasses =
    document.getElementById(
        "absentClasses"
    );

const summaryContainer =
    document.getElementById(
        "summaryContainer"
    );

const historyContainer =
    document.getElementById(
        "historyContainer"
    );


// =========================================
// LOAD ATTENDANCE SUMMARY
// =========================================

async function loadAttendanceSummary() {

    try {

        const response = await fetch(
            `${API_URL}/attendance/summary`, {
                method: "GET",

                headers: {
                    "Authorization": `Bearer ${token}`
                }
            }
        );


        const data =
            await response.json();


        if (!response.ok) {

            throw new Error(
                data.message ||
                "Failed to load attendance"
            );

        }


        const summary = data.data;


        // Calculate overall attendance

        let total = 0;

        let present = 0;

        let absent = 0;


        summary.forEach(subject => {

            total += Number(
                subject.total_classes || 0
            );

            present += Number(
                subject.present_classes || 0
            );

            absent += Number(
                subject.absent_classes || 0
            );

        });


        const percentage =
            total > 0 ?
            ((present / total) * 100).toFixed(2) :
            "0.00";


        overallAttendance.textContent =
            `${percentage}%`;


        totalClasses.textContent =
            total;

        presentClasses.textContent =
            present;

        absentClasses.textContent =
            absent;


        // Subject-wise table

        summaryContainer.innerHTML = "";


        if (summary.length === 0) {

            summaryContainer.innerHTML =
                "<p>No attendance records available.</p>";

            return;

        }


        const table =
            document.createElement("table");

        table.className =
            "attendance-table";


        table.innerHTML = `

            <thead>

                <tr>

                    <th>
                        Subject
                    </th>

                    <th>
                        Code
                    </th>

                    <th>
                        Total Classes
                    </th>

                    <th>
                        Present
                    </th>

                    <th>
                        Absent
                    </th>

                    <th>
                        Attendance
                    </th>

                </tr>

            </thead>

            <tbody>

            </tbody>

        `;


        const tbody =
            table.querySelector("tbody");


        summary.forEach(subject => {

            const row =
                document.createElement("tr");


            row.innerHTML = `

                <td>
                    ${subject.subject_name}
                </td>

                <td>
                    ${subject.code}
                </td>

                <td>
                    ${subject.total_classes}
                </td>

                <td>
                    ${subject.present_classes}
                </td>

                <td>
                    ${subject.absent_classes}
                </td>

                <td>

                    <span class="attendance-badge">

                        ${subject.attendance_percentage}%

                    </span>

                </td>

            `;


            tbody.appendChild(row);

        });


        summaryContainer.appendChild(table);


    } catch (error) {

        console.error(
            "Attendance Summary Error:",
            error
        );


        summaryContainer.innerHTML =
            `<p>${error.message}</p>`;

    }

}


// =========================================
// LOAD ATTENDANCE HISTORY
// =========================================

async function loadAttendanceHistory() {

    try {

        const response = await fetch(
            `${API_URL}/attendance`, {
                method: "GET",

                headers: {
                    "Authorization": `Bearer ${token}`
                }
            }
        );


        const data =
            await response.json();


        if (!response.ok) {

            throw new Error(
                data.message ||
                "Failed to load attendance history"
            );

        }


        const history = data.data;


        historyContainer.innerHTML = "";


        if (history.length === 0) {

            historyContainer.innerHTML =
                "<p>No attendance history available.</p>";

            return;

        }


        const table =
            document.createElement("table");

        table.className =
            "attendance-table";


        table.innerHTML = `

            <thead>

                <tr>

                    <th>
                        Date
                    </th>

                    <th>
                        Subject
                    </th>

                    <th>
                        Code
                    </th>

                    <th>
                        Status
                    </th>

                </tr>

            </thead>

            <tbody>

            </tbody>

        `;


        const tbody =
            table.querySelector("tbody");


        history.forEach(record => {

            const row =
                document.createElement("tr");


            const statusClass =
                record.status === "present" ?
                "present" :
                "absent";


            row.innerHTML = `

                <td>
                    ${record.attendance_date}
                </td>

                <td>
                    ${record.subject_name}
                </td>

                <td>
                    ${record.code}
                </td>

                <td>

                    <span
                        class="attendance-status ${statusClass}"
                    >
                        ${record.status}
                    </span>

                </td>

            `;


            tbody.appendChild(row);

        });


        historyContainer.appendChild(table);


    } catch (error) {

        console.error(
            "Attendance History Error:",
            error
        );


        historyContainer.innerHTML =
            `<p>${error.message}</p>`;

    }

}


// =========================================
// LOGOUT
// =========================================

document
    .getElementById("logoutBtn")
    .addEventListener(
        "click",
        () => {

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
// START
// =========================================

loadAttendanceSummary();

loadAttendanceHistory();