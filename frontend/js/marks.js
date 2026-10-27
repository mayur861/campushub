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

const averageMarks =
    document.getElementById(
        "averageMarks"
    );

const highestMarks =
    document.getElementById(
        "highestMarks"
    );

const totalRecords =
    document.getElementById(
        "totalRecords"
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
// LOAD MARKS SUMMARY
// =========================================

async function loadMarksSummary() {

    try {

        const response = await fetch(
            `${API_URL}/marks/summary`, {
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
                "Failed to load marks"
            );

        }


        const summary =
            data.data;


        // Calculate overall values

        let totalMarks = 0;

        let totalSubjects = 0;

        let highest = 0;


        summary.forEach(subject => {

            const average =
                Number(
                    subject.average_marks || 0
                );


            if (subject.average_marks !== null) {

                totalMarks += average;

                totalSubjects++;

            }


            const midterm =
                Number(
                    subject.midterm_marks || 0
                );

            const internal =
                Number(
                    subject.internal_marks || 0
                );

            const finalMarks =
                Number(
                    subject.final_marks || 0
                );


            highest = Math.max(
                highest,
                midterm,
                internal,
                finalMarks
            );

        });


        const overallAverage =
            totalSubjects > 0 ?
            (
                totalMarks /
                totalSubjects
            ).toFixed(2) :
            "0.00";


        averageMarks.textContent =
            overallAverage;


        highestMarks.textContent =
            highest;


        // Subject table

        summaryContainer.innerHTML = "";


        if (summary.length === 0) {

            summaryContainer.innerHTML =
                "<p>No marks available.</p>";

            return;

        }


        const table =
            document.createElement("table");

        table.className =
            "marks-table";


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
                        Midterm
                    </th>

                    <th>
                        Internal
                    </th>

                    <th>
                        Final
                    </th>

                    <th>
                        Average
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
                    ${subject.midterm_marks ?? "-"}
                </td>

                <td>
                    ${subject.internal_marks ?? "-"}
                </td>

                <td>
                    ${subject.final_marks ?? "-"}
                </td>

                <td>
                    <strong>
                        ${subject.average_marks ?? "-"}
                    </strong>
                </td>

            `;


            tbody.appendChild(row);

        });


        summaryContainer.appendChild(table);


    } catch (error) {

        console.error(
            "Marks Summary Error:",
            error
        );


        summaryContainer.innerHTML =
            `<p>${error.message}</p>`;

    }

}


// =========================================
// LOAD MARKS HISTORY
// =========================================

async function loadMarksHistory() {

    try {

        const response = await fetch(
            `${API_URL}/marks`, {
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
                "Failed to load marks history"
            );

        }


        const history =
            data.data;


        totalRecords.textContent =
            history.length;


        historyContainer.innerHTML = "";


        if (history.length === 0) {

            historyContainer.innerHTML =
                "<p>No marks history available.</p>";

            return;

        }


        const table =
            document.createElement("table");

        table.className =
            "marks-table";


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
                        Exam Type
                    </th>

                    <th>
                        Marks
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


            row.innerHTML = `

                <td>
                    ${record.subject_name}
                </td>

                <td>
                    ${record.code}
                </td>

                <td>
                    <span class="exam-badge">
                        ${record.exam_type}
                    </span>
                </td>

                <td>
                    <strong>
                        ${record.marks}
                    </strong>
                    / 100
                </td>

            `;


            tbody.appendChild(row);

        });


        historyContainer.appendChild(table);


    } catch (error) {

        console.error(
            "Marks History Error:",
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

loadMarksSummary();

loadMarksHistory();