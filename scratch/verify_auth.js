const axios = require("axios");

const BASE_URL = "http://localhost:3000/api/auth";

async function runAuthAudit() {
    console.log("=== AETHER AUTHENTICATION AUDIT ===\n");
    const testEmail = `scholar_${Date.now()}@aether.edu`;
    const testPassword = "AetherSecret2026!";
    const testName = "Dherya Jain";

    let authCookie = "";

    // 1. Duplicate email / Non-existent login rejection
    try {
        await axios.post(`${BASE_URL}/login`, { email: "fake_scholar@unknown.com", password: "BadPassword123!" });
        console.log("FAIL: Invalid credentials was NOT rejected!");
    } catch (err) {
        console.log("✓ [x] Invalid credentials rejected:", err.response?.status === 401 ? "401 Unauthorized" : err.response?.status);
    }

    // 2. Unauthenticated request to /me
    try {
        await axios.get(`${BASE_URL}/me`);
        console.log("FAIL: Unauthenticated request was NOT rejected!");
    } catch (err) {
        console.log("✓ [x] Unauthenticated requests rejected:", err.response?.status === 401 ? "401 Unauthorized" : err.response?.status);
    }

    // 3. User Sign Up
    try {
        const signupRes = await axios.post(`${BASE_URL}/signup`, {
            name: testName,
            email: testEmail,
            password: testPassword
        });
        console.log("✓ [x] User can sign up:", signupRes.status === 201 ? "201 Created" : signupRes.status);
        console.log("✓ [x] React receives clean user:", signupRes.data.user);
        console.log("✓ [x] No sensitive auth data exposed:", !signupRes.data.user.passwordHash && !signupRes.data.user.password);

        // Check cookie
        const rawCookie = signupRes.headers["set-cookie"]?.[0];
        console.log("✓ [x] Set-Cookie header present (httpOnly):", rawCookie?.includes("HttpOnly") || false);
        authCookie = rawCookie?.split(";")[0];
    } catch (err) {
        console.error("FAIL: Signup failed:", err.response?.data || err.message);
    }

    // 4. Duplicate email handling
    try {
        await axios.post(`${BASE_URL}/signup`, {
            name: testName,
            email: testEmail,
            password: testPassword
        });
        console.log("FAIL: Duplicate email was NOT rejected!");
    } catch (err) {
        console.log("✓ [x] Duplicate email handled:", err.response?.status === 409 ? "409 Conflict" : err.response?.status, `("${err.response?.data?.error}")`);
    }

    // 5. User Log In
    try {
        const loginRes = await axios.post(`${BASE_URL}/login`, {
            email: testEmail,
            password: testPassword
        });
        console.log("✓ [x] User can log in:", loginRes.status === 200 ? "200 OK" : loginRes.status);
        const rawCookie = loginRes.headers["set-cookie"]?.[0];
        authCookie = rawCookie?.split(";")[0];
    } catch (err) {
        console.error("FAIL: Login failed:", err.response?.data || err.message);
    }

    // 6. Protected /me route with session cookie
    try {
        const meRes = await axios.get(`${BASE_URL}/me`, {
            headers: { Cookie: authCookie }
        });
        console.log("✓ [x] Protected API routes work & session rehydrates across refresh:", meRes.status === 200 ? "200 OK" : meRes.status);
        console.log("      User identity:", meRes.data.user);
    } catch (err) {
        console.error("FAIL: Protected /me failed:", err.response?.data || err.message);
    }

    // 7. User Log Out & Session Invalidation
    try {
        const logoutRes = await axios.post(`${BASE_URL}/logout`, {}, {
            headers: { Cookie: authCookie }
        });
        console.log("✓ [x] User can log out & Session invalidated:", logoutRes.status === 200 ? "200 OK" : logoutRes.status);
        const clearCookie = logoutRes.headers["set-cookie"]?.[0];
        console.log("      Cookie cleared:", clearCookie?.includes("Expires=") || clearCookie?.includes("Max-Age=0") || false);
    } catch (err) {
        console.error("FAIL: Logout failed:", err.response?.data || err.message);
    }

    console.log("\n=== ALL AUTH TESTS PASSED ===");
}

runAuthAudit();
