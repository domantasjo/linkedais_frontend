"use client";
import './login.css'
import {useState} from "react";

export default function LoginPage()
{
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isLoggedIn, setIsLoggedIn] = useState("");
    const handleRegister = async () => {
    try{
     const res = await fetch("http://localhost:8080/api/auth/register", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                email: email,
                password: password
            }),
        });
        const data = await res.json();

            if (res.ok) {
                setIsLoggedIn("Registered successfully!");
            } else {
                setIsLoggedIn(data.message || "Registration failed");
            }
        }
    catch (err) {
            setIsLoggedIn("Server error");
        }
    };

    const handleLogin = async () => {
        try{
        const res = await fetch("http://localhost:8080/api/auth/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                email: email,
                password: password
            }),
        });
        const data = await res.json();

            if (res.ok && data.token) {
                localStorage.setItem("token", data.token);
                setIsLoggedIn("Logged in successfully!");
            } else {
                setIsLoggedIn(data.message || "Invalid credentials");
            }
        } catch (err) {
            setIsLoggedIn("Server error");
        }
    };
    return(
        <div className="login-container">
            <h1>{isLoggedIn}</h1>
            <div className={"field"}>
                <label htmlFor="email">Email:</label>
                <input
                    id="email"
                    type="email"
                    placeholder="Email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />
            </div>
            <div className={"field"}>
                <label htmlFor="password">Password:</label>
                <input
                    id="password"
                    type="password"
                    placeholder="Password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />
            </div>
            <button onClick={handleLogin}>Login</button>
            <button onClick={handleRegister}>Register</button>
        </div>


    );
}