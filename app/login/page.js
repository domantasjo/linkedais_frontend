"use client";
import './login.css'

export default function LoginPage()
{
    const handleSubmit = (e) => {
        e.preventDefault();
        console.log("Logging in...");
    };
    return(
        <div className="login-container">
            <h1>Login</h1>
            <div className={"field"}>
                <label htmlFor="email">Email:</label>
                <input id="email" type="email" placeholder="Email" required />
            </div>
            <div className={"field"}>
                <label htmlFor="password">Password:</label>
                <input id="password" type="password" placeholder="Password" required />
            </div>
        </div>


    );
}