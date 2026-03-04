"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
	const router = useRouter();
	const [username, setUsername] = useState("");
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [statusMessage, setStatusMessage] = useState("");
	const [errors, setErrors] = useState({});
	const [isLoading, setIsLoading] = useState(false);

	const validateForm = () => {
		const newErrors = {};

		// Username validation
		if (!username.trim()) {
			newErrors.username = "Vartotojo vardas yra privalomas";
		} else if (username.trim().length < 3) {
			newErrors.username = "Vartotojo vardas turi būti bent 3 simboliai";
		}

		// Email validation
		if (!email.trim()) {
			newErrors.email = "El. paštas yra privalomas";
		} else if (!/\S+@\S+\.\S+/.test(email)) {
			newErrors.email = "Neteisingas el. pašto formatas (pvz., vardas@gmail.com)";
		}

		// Password validation
		if (!password) {
			newErrors.password = "Slaptažodis yra privalomas";
		} else if (password.length < 6) {
			newErrors.password = "Slaptažodis turi būti bent 6 simboliai";
		}

		// Confirm password validation
		if (!confirmPassword) {
			newErrors.confirmPassword = "Patvirtinkite slaptažodį";
		} else if (password !== confirmPassword) {
			newErrors.confirmPassword = "Slaptažodžiai nesutampa";
		}

		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

	const handleRegister = async () => {
		if (!validateForm()) return;

		setIsLoading(true);
		setStatusMessage("");

		try {
			const res = await fetch("http://localhost:8080/api/auth/register", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					name: username,
					email,
					password
				}),
			});

			const data = await res.json();

			if (res.ok) {
                setStatusMessage("Registracija sėkminga! Nukreipiama į prisijungimo puslapį...");

                // Redirect to login page after short delay
                setTimeout(() => {
                    router.push("/login");
                }, 1500);
			} else {
				// Handle backend errors
				if (data.error === "Email already registered") {
					setErrors({ ...errors, email: "Toks el. paštas jau užregistruotas" });
				} else {
					setStatusMessage(data.error || "Registracija nepavyko");
				}
			}
		} catch (err) {
			console.error("Error:", err);
			setStatusMessage("Serverio klaida. Bandykite vėliau.");
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
			<div className="bg-white shadow-lg rounded-lg p-8 max-w-md w-full space-y-6">
				<h1 className="text-2xl font-bold text-center text-gray-800">Registruotis</h1>

				{statusMessage && (
					<div className={`text-center text-sm font-medium p-2 rounded ${
						statusMessage.includes("sėkminga")
							? "text-green-600 bg-green-50"
							: "text-red-600 bg-red-50"
					}`}>
						{statusMessage}
					</div>
				)}

				<div className="space-y-4">
					{/* Username Field */}
					<div>
						<label htmlFor="username" className="block text-sm font-medium text-gray-800 mb-1">
							Vardas:
						</label>
						<input
							id="username"
							type="text"
							placeholder="įveskite vartotojo vardą"
							required
							value={username}
							onChange={(e) => {
								setUsername(e.target.value);
								// Clear error when user starts typing
								if (errors.username) setErrors({ ...errors, username: "" });
							}}
							aria-invalid={!!errors.username}
							aria-describedby={errors.username ? "username-error" : undefined}
							className={`w-full border rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-gray-500 text-gray-800 ${
								errors.username ? "border-red-500" : "border-gray-300"
							}`}
						/>
						{errors.username && (
							<p id="username-error" className="text-red-500 text-xs mt-1">
								{errors.username}
							</p>
						)}
					</div>

					{/* Email Field */}
					<div>
						<label htmlFor="email" className="block text-sm font-medium text-gray-800 mb-1">
							El. paštas:
						</label>
						<input
							id="email"
							type="email"
							placeholder="įveskite el. paštą"
							required
							value={email}
							onChange={(e) => {
								setEmail(e.target.value);
								if (errors.email) setErrors({ ...errors, email: "" });
							}}
							aria-invalid={!!errors.email}
							aria-describedby={errors.email ? "email-error" : undefined}
							className={`w-full border rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-gray-500 text-gray-800 ${
								errors.email ? "border-red-500" : "border-gray-300"
							}`}
						/>
						{errors.email && (
							<p id="email-error" className="text-red-500 text-xs mt-1">
								{errors.email}
							</p>
						)}
					</div>

					{/* Password Field */}
					<div>
						<label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
							Slaptažodis:
						</label>
						<input
							id="password"
							type="password"
							placeholder="įveskite slaptažodį"
							required
							value={password}
							onChange={(e) => {
								setPassword(e.target.value);
								if (errors.password) setErrors({ ...errors, password: "" });
								// Also clear confirm password error when password changes
								if (errors.confirmPassword) setErrors({ ...errors, confirmPassword: "" });
							}}
							aria-invalid={!!errors.password}
							aria-describedby={errors.password ? "password-error" : undefined}
							className={`w-full border rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-gray-500 text-gray-800 ${
								errors.password ? "border-red-500" : "border-gray-300"
							}`}
						/>
						{errors.password && (
							<p id="password-error" className="text-red-500 text-xs mt-1">
								{errors.password}
							</p>
						)}
					</div>

					{/* Confirm Password Field */}
					<div>
						<label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
							Pakartokite slaptažodį:
						</label>
						<input
							id="confirmPassword"
							type="password"
							placeholder="pakartokite slaptažodį"
							required
							value={confirmPassword}
							onChange={(e) => {
								setConfirmPassword(e.target.value);
								if (errors.confirmPassword) setErrors({ ...errors, confirmPassword: "" });
							}}
							aria-invalid={!!errors.confirmPassword}
							aria-describedby={errors.confirmPassword ? "confirm-password-error" : undefined}
							className={`w-full border rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-gray-500 text-gray-800 ${
								errors.confirmPassword ? "border-red-500" : "border-gray-300"
							}`}
						/>
						{errors.confirmPassword && (
							<p id="confirm-password-error" className="text-red-500 text-xs mt-1">
								{errors.confirmPassword}
							</p>
						)}
					</div>
				</div>

				<div className="flex flex-col gap-3 pt-2">
					<button
						onClick={handleRegister}
						disabled={isLoading}
						className="w-full bg-gray-800 text-white font-semibold py-2 rounded-md hover:bg-gray-700 transition active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
					>
						{isLoading ? "Registruojama..." : "Registruotis"}
					</button>
				</div>
			</div>
		</div>
	);
}