const API_URL = "http://localhost:5000/api";

const loginForm =
    document.getElementById("loginForm");

const message =
    document.getElementById("message");


// ==========================================
// LOGIN FORM
// ==========================================

loginForm.addEventListener(
    "submit",
    async(event) => {

        event.preventDefault();


        // Get form values

        const email =
            document
            .getElementById("email")
            .value
            .trim();

        const password =
            document
            .getElementById("password")
            .value;


        // Validation

        if (!email || !password) {

            message.textContent =
                "Email and password are required";

            message.className =
                "message message-error";

            return;
        }


        message.textContent =
            "Logging in...";

        message.className =
            "message message-info";


        try {

            // Login API

            const response =
                await fetch(
                    `${API_URL}/auth/login`, {
                        method: "POST",

                        headers: {
                            "Content-Type": "application/json"
                        },

                        body: JSON.stringify({
                            email: email,
                            password: password
                        })
                    }
                );


            const data =
                await response.json();


            // Login failed

            if (!response.ok) {

                message.textContent =
                    data.message ||
                    "Invalid email or password";

                message.className =
                    "message message-error";

                return;
            }


            // ==========================================
            // CLEAR OLD LOGIN DATA
            // ==========================================

            localStorage.removeItem("token");
            localStorage.removeItem("user");


            // ==========================================
            // SAVE NEW LOGIN DATA
            // ==========================================

            localStorage.setItem(
                "token",
                data.token
            );

            localStorage.setItem(
                "user",
                JSON.stringify(data.user)
            );


            message.textContent =
                "Login successful!";

            message.className =
                "message message-success";


            // ==========================================
            // ROLE BASED REDIRECT
            // ==========================================


            // ADMIN

            if (
                data.user.role === "admin"
            ) {

                window.location.href =
                    "admin-dashboard.html";

                return;
            }


            // FACULTY

            if (
                data.user.role === "faculty"
            ) {

                window.location.href =
                    "faculty-dashboard.html";

                return;
            }


            // COMPANY

            if (
                data.user.role === "company"
            ) {

                window.location.href =
                    "company-dashboard.html";

                return;
            }


            // STUDENT

            if (
                data.user.role === "student"
            ) {

                window.location.href =
                    "dashboard.html";

                return;
            }


            // UNKNOWN ROLE

            message.textContent =
                "Invalid user role";

            message.className =
                "message message-error";


        } catch (error) {

            console.error(
                "Login Error:",
                error
            );


            message.textContent =
                "Unable to connect to server";

            message.className =
                "message message-error";

        }

    }
);