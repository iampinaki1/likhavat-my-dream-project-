import TempUser from "./models/tempuser.models.js";
import connectDB from "./config/db.js";

async function testTempUser() {
    await connectDB();
    try {
        const tempUser = new TempUser({
            username: "testuser123_temp",
            email: "test_temp@example.com",
            password: "hashed_password",
            verificationCode: 1234,
            verificationCodeExpiry: new Date(Date.now() + 2 * 60 * 1000),
        });

        await tempUser.save();
        console.log("Successfully saved TempUser");
    } catch (err) {
        console.error("TempUser validation failed:", err);
    }
    process.exit(0);
}

testTempUser();
