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

const totalNotifications =
    document.getElementById(
        "totalNotifications"
    );

const unreadNotifications =
    document.getElementById(
        "unreadNotifications"
    );

const readNotifications =
    document.getElementById(
        "readNotifications"
    );

const notificationsContainer =
    document.getElementById(
        "notificationsContainer"
    );

const message =
    document.getElementById(
        "message"
    );


// =========================================
// LOAD NOTIFICATIONS
// =========================================

async function loadNotifications() {

    try {

        const response = await fetch(
            `${API_URL}/notifications`, {
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
                "Failed to load notifications"
            );

        }


        const notifications =
            data.data;


        // =====================================
        // STATISTICS
        // =====================================

        const unread =
            notifications.filter(
                notification =>
                Number(notification.is_read) === 0
            ).length;


        const read =
            notifications.filter(
                notification =>
                Number(notification.is_read) === 1
            ).length;


        totalNotifications.textContent =
            notifications.length;

        unreadNotifications.textContent =
            unread;

        readNotifications.textContent =
            read;


        // =====================================
        // DISPLAY NOTIFICATIONS
        // =====================================

        notificationsContainer.innerHTML =
            "";


        if (notifications.length === 0) {

            notificationsContainer.innerHTML = `

                <div class="empty-state">

                    <h3>
                        No Notifications
                    </h3>

                    <p>
                        You don't have any notifications yet.
                    </p>

                </div>

            `;

            return;

        }


        notifications.forEach(notification => {

                    const card =
                        document.createElement("div");


                    card.className =
                        notification.is_read == 1 ?
                        "notification-card read" :
                        "notification-card unread";


                    const date =
                        formatDate(
                            notification.created_at
                        );


                    card.innerHTML = `

                <div class="notification-content">

                    <div class="notification-icon">
                        🔔
                    </div>

                    <div>

                        <p class="notification-message">
                            ${notification.message}
                        </p>

                        <p class="notification-date">
                            ${date}
                        </p>

                    </div>

                </div>


                <div class="notification-action">

                    ${
                        Number(notification.is_read) === 0
                        ?
                        `
                            <button
                                class="read-btn"
                                onclick="markAsRead(${notification.id})"
                            >
                                ✓ Mark as Read
                            </button>
                        `
                        :
                        `
                            <span class="read-label">
                                ✓ Read
                            </span>
                        `
                    }

                </div>

            `;


            notificationsContainer.appendChild(
                card
            );

        });


    } catch (error) {

        console.error(
            "Notifications Error:",
            error
        );


        notificationsContainer.innerHTML =
            `<p>${error.message}</p>`;

    }

}


// =========================================
// MARK AS READ
// =========================================

async function markAsRead(notificationId) {

    try {

        const response = await fetch(
            `${API_URL}/notifications/${notificationId}/read`,
            {
                method: "PUT",

                headers: {
                    "Authorization":
                        `Bearer ${token}`
                }
            }
        );


        const data =
            await response.json();


        if (!response.ok) {

            message.textContent =
                data.message ||
                "Failed to mark notification as read";

            return;

        }


        message.textContent =
            "Notification marked as read.";


        await loadNotifications();


    } catch (error) {

        console.error(
            "Mark Notification Error:",
            error
        );


        message.textContent =
            "Unable to connect to server";

    }

}


// =========================================
// FORMAT DATE
// =========================================

function formatDate(dateString) {

    if (!dateString) {
        return "N/A";
    }


    const date =
        new Date(dateString);


    return date.toLocaleString(
        "en-IN",
        {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        }
    );

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

loadNotifications();