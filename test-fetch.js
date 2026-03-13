import fetch from 'node-fetch';

async function testFetch() {
    try {
        const res = await fetch('http://localhost:3000/api/user/profile/password/reset', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: 'pinaki82499730@gmail.com', newpassword: 'pass' })
        });
        console.log("Status:", res.status);
        console.log("Text:", await res.text());
    } catch (err) {
        console.error("Fetch failed:", err);
    }
}
testFetch();
