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
                <input id="email" type="email" placeholder="Email" style={{color: "black", border: "2px solid black", borderRadius: "3px",  padding: "1px"}} required />
            </div>
        </div>
    );
}