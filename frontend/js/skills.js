const API_URL = "http://localhost:5000/api";

const token = localStorage.getItem("token");


// =========================================
// CHECK LOGIN
// =========================================

if (!token) {
    window.location.href = "login.html";
}


// =========================================
// LOAD SKILLS
// =========================================

async function loadSkills() {

    try {

        const response = await fetch(
            `${API_URL}/students/skills`, {
                method: "GET",

                headers: {
                    "Authorization": `Bearer ${token}`
                }
            }
        );


        const data = await response.json();


        if (!response.ok) {

            throw new Error(
                data.message || "Failed to load skills"
            );

        }


        const container =
            document.getElementById("skillsContainer");


        container.innerHTML = "";


        if (data.data.length === 0) {

            container.innerHTML =
                "<p>No skills added yet.</p>";

            return;

        }


        data.data.forEach(skill => {

            const div =
                document.createElement("div");

            div.className = "skill-item";


            div.innerHTML = `
                <span class="skill">
                    ${skill.name}
                </span>

                <button
                    class="delete-skill"
                    onclick="deleteSkill(${skill.id})"
                >
                    ✕
                </button>
            `;


            container.appendChild(div);

        });


    } catch (error) {

        console.error(
            "Load Skills Error:",
            error
        );

    }

}


// =========================================
// ADD SKILL
// =========================================

document
    .getElementById("addSkillBtn")
    .addEventListener(
        "click",
        async() => {

            const skillId =
                document.getElementById(
                    "skillSelect"
                ).value;


            const message =
                document.getElementById(
                    "skillMessage"
                );


            if (!skillId) {

                message.textContent =
                    "Please select a skill.";

                return;

            }


            try {

                const response = await fetch(
                    `${API_URL}/students/skills`, {
                        method: "POST",

                        headers: {

                            "Content-Type": "application/json",

                            "Authorization": `Bearer ${token}`

                        },

                        body: JSON.stringify({
                            skill_id: Number(skillId)
                        })

                    }
                );


                const data =
                    await response.json();


                if (!response.ok) {

                    message.textContent =
                        data.message ||
                        "Failed to add skill";

                    return;

                }


                message.textContent =
                    "Skill added successfully!";


                document.getElementById(
                    "skillSelect"
                ).value = "";


                await loadSkills();


            } catch (error) {

                console.error(
                    "Add Skill Error:",
                    error
                );


                message.textContent =
                    "Unable to connect to server";

            }

        }
    );


// =========================================
// DELETE SKILL
// =========================================

async function deleteSkill(skillId) {

    try {

        const response = await fetch(
            `${API_URL}/students/skills/${skillId}`, {
                method: "DELETE",

                headers: {
                    "Authorization": `Bearer ${token}`
                }
            }
        );


        const data =
            await response.json();


        if (!response.ok) {

            alert(
                data.message ||
                "Failed to delete skill"
            );

            return;

        }


        await loadSkills();


    } catch (error) {

        console.error(
            "Delete Skill Error:",
            error
        );


        alert(
            "Unable to connect to server"
        );

    }

}


// =========================================
// RESUME UPLOAD
// =========================================

document
    .getElementById("resumeForm")
    .addEventListener(
        "submit",
        async(event) => {

            event.preventDefault();


            const fileInput =
                document.getElementById("resume");


            const message =
                document.getElementById(
                    "resumeMessage"
                );


            if (!fileInput.files.length) {

                message.textContent =
                    "Please select a resume.";

                return;

            }


            const formData =
                new FormData();


            formData.append(
                "resume",
                fileInput.files[0]
            );


            message.textContent =
                "Uploading resume...";


            try {

                const response = await fetch(
                    `${API_URL}/students/resume`, {
                        method: "POST",

                        headers: {
                            "Authorization": `Bearer ${token}`
                        },

                        body: formData
                    }
                );


                const data =
                    await response.json();


                if (!response.ok) {

                    message.textContent =
                        data.message ||
                        "Resume upload failed";

                    return;

                }


                message.textContent =
                    "Resume uploaded successfully!";


                fileInput.value = "";


                document.getElementById(
                    "resumeStatus"
                ).innerHTML = `
                    <p class="resume-success">
                        ✅ Resume uploaded successfully
                    </p>
                `;


            } catch (error) {

                console.error(
                    "Resume Upload Error:",
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

loadSkills();