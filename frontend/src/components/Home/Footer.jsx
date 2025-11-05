import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLinkedin, faFacebook, faTwitter } from "@fortawesome/free-brands-svg-icons";

const Footer = () => {
    const [email, setEmail] = useState("");
    const [status, setStatus] = useState("");
    const [isError, setIsError] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!email) {
            setStatus("⚠️ Please enter a valid email.");
            setIsError(true);
            return;
        }

        setStatus("Sending...");
        setIsError(false);

        try {
            const response = await fetch("http://localhost:5000/api/subscribe", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ email }),
            });

            const data = await response.json();

            if (response.ok) {
                setStatus(`✅ ${data.message || "Subscribed successfully!"}`);
                setIsError(false);
                setEmail("");
            } else {
                // use backend error message if available
                setStatus(`❌ ${data.error || "Subscription failed. Try again."}`);
                setIsError(true);
            }
        } catch (error) {
            console.error(error);
            setStatus("⚠️ Server error. Please try again later.");
            setIsError(true);
        }
    };

    return (
        <footer className="bg-black text-white px-4 sm:px-6 md:px-10 lg:px-20 py-10 mt-6 border rounded-t-4xl">
            <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Logo & Navigation */}
                <div>
                    <div className="flex items-center gap-3 mb-4">
                        <img
                            src="/Images/codehire.png"
                            alt="logo"
                            className="invert w-10 h-10 brightness-200"
                        />
                        <h2 className="text-xl sm:text-2xl font-bold">CodeHire</h2>
                    </div>
                    <nav className="space-y-2 text-sm sm:text-base">
                        <a href="#about" className="block hover:underline">
                            About us
                        </a>
                        <a href="#services" className="block hover:underline">
                            Services
                        </a>
                        <a href="#use-cases" className="block hover:underline">
                            Use Cases
                        </a>
                        <a href="#pricing" className="block hover:underline">
                            Pricing
                        </a>
                        <a href="#blog" className="block hover:underline">
                            Blog
                        </a>
                    </nav>
                </div>

                {/* Contact Info */}
                <div>
                    <span className="inline-block bg-[#5465ff] text-white px-3 py-1 rounded mb-4 text-sm sm:text-base">
                        Contact us:
                    </span>
                    <ul className="space-y-2 text-sm sm:text-base">
                        <li>
                            Email:{" "}
                            <a href="mailto:info@codehire.com" className="hover:underline">
                                info@codehire.com
                            </a>
                        </li>
                        <li>
                            Phone:{" "}
                            <a href="tel:5555678901" className="hover:underline">
                                555-567-8901
                            </a>
                        </li>
                        <li>
                            Address: 1234 Main St, Moonstone City, Stardust State 12345
                        </li>
                    </ul>
                </div>

                {/* Newsletter & Social */}
                <div>
                    <form className="space-y-4" onSubmit={handleSubmit}>
                        <label htmlFor="email" className="block text-sm sm:text-base">
                            Subscribe to news:
                        </label>
                        <div className="flex flex-col gap-3 md:gap-0 sm:flex-row">
                            <input
                                type="email"
                                id="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="Email"
                                className="flex-grow px-4 py-2 rounded-t sm:rounded-l sm:rounded-tr-none bg-white text-black border border-white placeholder-gray-400"
                            />
                            <button
                                type="submit"
                                className="md:mx-3 bg-blue-700 px-4 py-2 rounded-b sm:rounded-r sm:rounded-bl-none text-white font-semibold hover:bg-[#5465ff]"
                            >
                                Subscribe
                            </button>
                        </div>
                    </form>

                    {status && (
                        <p
                            className={`mt-3 text-sm text-center sm:text-left ${isError ? "text-red-400" : "text-green-400"
                                }`}
                        >
                            {status}
                        </p>
                    )}

                    <div className="flex justify-center sm:justify-start gap-4 mt-6 text-xl">
                        <a href="#" aria-label="LinkedIn" className="hover:text-[#5465ff]">
                            <FontAwesomeIcon icon={faLinkedin} />
                        </a>
                        <a href="#" aria-label="Facebook" className="hover:text-[#5465ff]">
                            <FontAwesomeIcon icon={faFacebook} />
                        </a>
                        <a href="#" aria-label="Twitter" className="hover:text-[#5465ff]">
                            <FontAwesomeIcon icon={faTwitter} />
                        </a>
                    </div>
                </div>
            </div>

            {/* Bottom Bar */}
            <div className="mt-10 border-t border-white pt-4 text-xs sm:text-sm flex flex-col sm:flex-row justify-between items-center gap-2 sm:gap-0 text-center sm:text-left">
                <span>© 2025 CodeHire. All Rights Reserved.</span>
                <a href="#privacy" className="hover:underline">
                    Privacy Policy
                </a>
            </div>
        </footer>
    );
};

export default Footer;
