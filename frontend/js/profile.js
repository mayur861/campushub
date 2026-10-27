const API_URL = "http://localhost:5000/api";

const token = localStorage.getItem("token");


// =========================================
// CHECK LOGIN
// =========================================

if (!token) {
    window.location.href = "login.html";
}


// =========================================
// LOAD PROFILE
// =========================================

async function loadProfile() {

    try {

        const response = await fetch(
            `${API_URL}/students/profile`, {
                method: "GET",

                headers: {
                    "Authorization": `Bearer ${token}`
                }
            }
        );

        const data = await response.json();

        if (!response.ok) {

            throw new Error(
                data.message || "Failed to load profile"
            );

        }

        console.log("Profile Data:", data);

        const profile = data.data;


        // =====================================
        // FILL FORM
        // =====================================

        document.getElementById("name").value =
            profile.name || "";

        document.getElementById("email").value =
            profile.email || "";

        document.getElementById("enrollment_no").value =
            profile.enrollment_no || "";

        document.getElementById("department").value =
            profile.department_name || "";

        document.getElementById("semester").value =
            profile.semester || "";

        document.getElementById("cgpa").value =
            profile.cgpa || "";

        document.getElementById("phone").value =
            profile.phone || "";


        // =====================================
        // SHOW PROFILE
        // =====================================

        document.getElementById("loading").style.display =
            "none";

        document.getElementById("profileContent").style.display =
            "block";

    } catch (error) {

        console.error("Profile Error:", error);

        document.getElementById("loading").textContent =
            error.message;

    }

}


// =========================================
// UPDATE PROFILE
// =========================================

document
    .getElementById("profileForm")
    .addEventListener(
        "submit",
        async(event) => {

            event.preventDefault();


            const semester =
                document.getElementById("semester").value;

            const cgpa =
                document.getElementById("cgpa").value;

            const phone =
                document.getElementById("phone").value;


            const message =
                document.getElementById("message");


            message.textContent =
                "Saving changes...";


            try {

                const response = await fetch(
                    `${API_URL}/students/profile`, {
                        method: "PUT",

                        headers: {

                            "Content-Type": "application/json",

                            "Authorization": `Bearer ${token}`

                        },

                        body: JSON.stringify({

                            semester: Number(semester),

                            cgpa: Number(cgpa),

                            phone: phone

                        })

                    }
                );


                const data =
                    await response.json();


                if (!response.ok) {

                    message.textContent =
                        data.message ||
                        "Update failed";

                    return;

                }


                message.textContent =
                    "Profile updated successfully!";


                // Reload latest profile
                await loadProfile();


            } catch (error) {

                console.error(
                    "Update Profile Error:",
                    error
                );

                message.textContent =
                    "Unable to connect to server";

            }

        }
    );


// =========================================
// LOGOUT
// =========================================

document
    .getElementById("logoutBtn")
    .addEventListener(
        "click",
        () => {

            localStorage.removeItem("token");

            localStorage.removeItem("user");

            window.location.href =
                "login.html";

        }
    );


// =========================================
// START
// =========================================

loadProfile();