const email_username = "likhavat@test.com"; // using user's test email from before
const password = "password123";

async function run() {
    try {
        const res = await fetch("http://127.0.0.1:3000/api/user/signin", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email_username, password })
        });

        if (!res.ok) {
            console.log("Login failed", await res.text());
            return;
        }

        const data = await res.json();
        const token = data.accessToken;
        console.log("Logged in!");

        const scriptRes = await fetch("http://127.0.0.1:3000/api/scripts/script", {
            headers: {
                "Authorization": "Bearer " + token
            }
        });

        console.log("Status:", scriptRes.status);
        console.log("Body:", await scriptRes.text());
    } catch (e) {
        console.error(e);
    }
}
run();
