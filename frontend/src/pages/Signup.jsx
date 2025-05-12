import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { signup } from "../services/api";

const Signup = () => {
    const [formData, setFormData] = useState({ name: "", email: "", password: "" });
    const [message, setMessage] = useState("");
    const [playSound, setPlaySound] = useState(false);
    const navigate = useNavigate();
    const requestRef = useRef();
    const trailsRef = useRef([]);
    const numTrails = 15;

    // Initialize cursor trails and sound effects on component mount
    useEffect(() => {
        // Create initial trail data
        const initialTrails = Array.from({ length: numTrails }, (_, i) => ({
            id: i,
            x: 0,
            y: 0,
            size: 8 - i * 0.5,
            alpha: 1 - i * 0.08,
            hue: (i * 8) % 360,
            element: null
        }));
        
        trailsRef.current = initialTrails;

        // Create trail elements
        initialTrails.forEach((trail) => {
            const trailElement = document.createElement("div");
            trailElement.className = "cursor-trail";
            trailElement.style.position = "fixed";
            trailElement.style.borderRadius = "50%";
            trailElement.style.pointerEvents = "none";
            trailElement.style.zIndex = "9999";
            trailElement.style.transform = "translate(-50%, -50%)";
            trailElement.style.transition = "transform 0.1s ease-out";
            document.body.appendChild(trailElement);
            trail.element = trailElement;
        });

        // Track mouse position
        const handleMouseMove = (e) => {
            updateTrailsPosition(e.clientX, e.clientY);
        };

        window.addEventListener("mousemove", handleMouseMove);

        // Add sparkle effect to interactive elements
        const interactiveElements = document.querySelectorAll("input, button");
        interactiveElements.forEach((element) => {
            element.addEventListener("mouseenter", createSparkleEffect);
        });

        // Animation loop
        const animate = () => {
            updateTrailsAppearance();
            requestRef.current = requestAnimationFrame(animate);
        };
        
        requestRef.current = requestAnimationFrame(animate);

        // Create audio elements for sound effects
        const hoverSound = new Audio("https://assets.mixkit.co/sfx/preview/mixkit-tech-click-1141.mp3");
        const clickSound = new Audio("https://assets.mixkit.co/sfx/preview/mixkit-modern-click-box-check-1120.mp3");
        const typeSound = new Audio("https://assets.mixkit.co/sfx/preview/mixkit-single-key-press-in-a-laptop-2542.mp3");
        
        hoverSound.volume = 0.2;
        clickSound.volume = 0.3;
        typeSound.volume = 0.1;

        // Event handlers for sound effects
        const handleButtonHover = () => {
            if (playSound) {
                hoverSound.currentTime = 0;
                hoverSound.play();
            }
        };

        const handleButtonClick = () => {
            if (playSound) {
                clickSound.currentTime = 0;
                clickSound.play();
            }
        };

        const handleInputFocus = () => {
            if (playSound) {
                hoverSound.currentTime = 0;
                hoverSound.play();
            }
        };

        const handleKeyPress = () => {
            if (playSound) {
                typeSound.currentTime = 0;
                typeSound.play();
            }
        };

        // Add event listeners for sound effects
        const button = document.querySelector(".signup-btn");
        const inputs = document.querySelectorAll("input");

        if (button) {
            button.addEventListener("mouseenter", handleButtonHover);
            button.addEventListener("click", handleButtonClick);
        }

        inputs.forEach(input => {
            input.addEventListener("focus", handleInputFocus);
            input.addEventListener("keydown", handleKeyPress);
        });

        // Cleanup function
        return () => {
            window.removeEventListener("mousemove", handleMouseMove);
            interactiveElements.forEach((element) => {
                element.removeEventListener("mouseenter", createSparkleEffect);
            });
            
            trailsRef.current.forEach(trail => {
                if (trail.element) {
                    document.body.removeChild(trail.element);
                }
            });
            
            if (button) {
                button.removeEventListener("mouseenter", handleButtonHover);
                button.removeEventListener("click", handleButtonClick);
            }
            
            inputs.forEach(input => {
                input.removeEventListener("focus", handleInputFocus);
                input.removeEventListener("keydown", handleKeyPress);
            });
            
            cancelAnimationFrame(requestRef.current);
        };
    }, [playSound]);

    // Update trail positions with delay
    const updateTrailsPosition = (mouseX, mouseY) => {
        trailsRef.current.forEach((trail, index) => {
            setTimeout(() => {
                if (trail.element) {
                    trail.x = mouseX;
                    trail.y = mouseY;
                }
            }, index * 40); // Increasing delay for trailing elements
        });
    };

    // Update trail appearances in animation loop
    const updateTrailsAppearance = () => {
        trailsRef.current.forEach((trail) => {
            if (trail.element) {
                const currentTime = Date.now();
                trail.element.style.width = trail.size + "px";
                trail.element.style.height = trail.size + "px";
                trail.element.style.left = trail.x + "px";
                trail.element.style.top = trail.y + "px";
                trail.element.style.backgroundColor = `hsla(${
                    trail.hue + ((currentTime / 50) % 360)
                }, 80%, 60%, ${trail.alpha})`;

                // Add slight pulsing effect
                const pulse = Math.sin(currentTime / 200) * 0.5 + 0.5;
                trail.element.style.transform = `translate(-50%, -50%) scale(${
                    1 + pulse * 0.2
                })`;
            }
        });
    };

    // Create sparkle effect on hover over interactive elements
    const createSparkleEffect = (event) => {
        const element = event.target;
        const rect = element.getBoundingClientRect();
        
        for (let i = 0; i < 5; i++) {
            setTimeout(() => {
                const sparkle = document.createElement("div");
                sparkle.className = "cursor-sparkle";
                sparkle.style.position = "fixed";
                sparkle.style.borderRadius = "50%";
                sparkle.style.pointerEvents = "none";
                sparkle.style.zIndex = "9999";
                
                const x = rect.left + Math.random() * rect.width;
                const y = rect.top + Math.random() * rect.height;
                
                sparkle.style.left = x + "px";
                sparkle.style.top = y + "px";
                sparkle.style.width = "15px";
                sparkle.style.height = "15px";
                sparkle.style.backgroundColor = `hsla(${
                    Math.random() * 60 + 240
                }, 100%, 70%, 0.8)`;
                sparkle.style.transform = "translate(-50%, -50%) scale(0)";
                sparkle.style.transition = "transform 0.5s ease-out, opacity 0.5s ease-out";
                
                document.body.appendChild(sparkle);

                setTimeout(() => {
                    sparkle.style.transform = "translate(-50%, -50%) scale(1)";
                }, 10);

                setTimeout(() => {
                    sparkle.style.opacity = "0";
                    setTimeout(() => {
                        if (sparkle.parentNode) {
                            document.body.removeChild(sparkle);
                        }
                    }, 500);
                }, 300);
            }, i * 100);
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await signup(formData);
            console.log("✅ Signup success response:", res);

            if (res && res.message === "Signup successful") {
                alert(res.message);
                navigate("/login");
            } else {
                setMessage("Signup failed. Try again.");
            }
        } catch (error) {
            console.error("❌ Signup error:", error);

            if (error.response?.status === 409) {
                setMessage("Email already exists");
            } else {
                setMessage(error.response?.data?.detail || "Signup failed. Try again.");
            }
        }
    };

    const toggleSound = () => {
        setPlaySound(!playSound);
    };

    return (
        <div className="signup-container">
            <div className="signup-form-wrapper">
                <form onSubmit={handleSubmit} className="signup-form">
                    <h2>User Registration</h2>
                    
                    <div className="form-group">
                        <label htmlFor="name">Name</label>
                        <input 
                            id="name"
                            name="name" 
                            placeholder="Enter your name"
                            value={formData.name}
                            onChange={handleChange} 
                            required 
                        />
                    </div>
                    
                    <div className="form-group">
                        <label htmlFor="email">Email</label>
                        <input 
                            id="email"
                            name="email" 
                            type="email" 
                            placeholder="Enter your email"
                            value={formData.email}
                            onChange={handleChange} 
                            required 
                        />
                    </div>
                    
                    <div className="form-group">
                        <label htmlFor="password">Password</label>
                        <input 
                            id="password"
                            name="password" 
                            type="password" 
                            placeholder="Create a password"
                            value={formData.password}
                            onChange={handleChange} 
                            required 
                        />
                    </div>
                    
                    <button type="submit" className="signup-btn">Register Now</button>
                    
                    {message && <p className="message">{message}</p>}
                    
                    <div className="sound-toggle">
                        <label className="switch">
                            <input type="checkbox" checked={playSound} onChange={toggleSound} />
                            <span className="slider"></span>
                        </label>
                        <span className="sound-label">Sound Effects {playSound ? 'On' : 'Off'}</span>
                    </div>
                </form>
            </div>
            
            <style jsx>{`
                * {
                    margin: 0;
                    padding: 0;
                    box-sizing: border-box;
                    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                }
                
                .signup-container {
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    min-height: 100vh;
                    background-color: #f0f2f5;
                    background: linear-gradient(135deg, #e6e9f0 0%, #eef1f5 100%);
                    position: relative;
                    overflow: hidden;
                }

                /* Animated background bubbles */
                .signup-container::before,
                .signup-container::after {
                    content: '';
                    position: absolute;
                    border-radius: 50%;
                    filter: blur(30px);
                    opacity: 0.3;
                    z-index: 0;
                }
                
                .signup-container::before {
                    width: 150px;
                    height: 150px;
                    background: linear-gradient(90deg, #7c69ef, #b668e8);
                    top: 20%;
                    left: 15%;
                    animation: float 12s infinite alternate;
                }
                
                .signup-container::after {
                    width: 200px;
                    height: 200px;
                    background: linear-gradient(90deg, #69c6ef, #70e4d9);
                    bottom: 15%;
                    right: 15%;
                    animation: float 15s infinite alternate-reverse;
                }
                
                /* Additional bubbles */
                .signup-container::before,
                .signup-container::after {
                    content: '';
                    box-shadow: 
                        400px 400px 0 rgba(124, 105, 239, 0.2),
                        -300px 300px 0 rgba(233, 109, 233, 0.2),
                        -200px -200px 0 rgba(94, 186, 213, 0.15),
                        300px -300px 0 rgba(94, 186, 213, 0.1);
                }
                
                @keyframes float {
                    0% {
                        transform: translate(0, 0) rotate(0deg);
                    }
                    50% {
                        transform: translate(15px, 15px) rotate(5deg);
                    }
                    100% {
                        transform: translate(-15px, 10px) rotate(-3deg);
                    }
                }
                
                .signup-form-wrapper {
                    position: relative;
                    z-index: 10;
                    width: 100%;
                    max-width: 450px;
                    padding: 20px;
                }
                
                .signup-form {
                    background-color: white;
                    border-radius: 12px;
                    padding: 40px;
                    box-shadow: 0 8px 30px rgba(0, 0, 0, 0.08);
                    position: relative;
                    transition: all 0.3s ease;
                }
                
                .signup-form:hover {
                    transform: translateY(-5px);
                    box-shadow: 0 15px 35px rgba(124, 105, 239, 0.1);
                }
                
                h2 {
                    color: #333;
                    font-size: 24px;
                    font-weight: 600;
                    margin-bottom: 30px;
                    text-align: center;
                }
                
                .form-group {
                    margin-bottom: 24px;
                }
                
                label {
                    display: block;
                    font-size: 14px;
                    color: #555;
                    margin-bottom: 8px;
                    font-weight: 500;
                }
                
                input {
                    width: 100%;
                    padding: 14px 16px;
                    border: 1px solid #ddd;
                    border-radius: 8px;
                    font-size: 15px;
                    transition: all 0.3s ease;
                    background-color: #f9fafc;
                }
                
                input:focus {
                    outline: none;
                    border-color: #7c69ef;
                    box-shadow: 0 0 0 3px rgba(124, 105, 239, 0.15);
                    background-color: white;
                }
                
                .signup-btn {
                    width: 100%;
                    padding: 14px;
                    margin-top: 10px;
                    background-color: #7c69ef;
                    color: white;
                    border: none;
                    border-radius: 8px;
                    font-size: 16px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    position: relative;
                    overflow: hidden;
                }
                
                .signup-btn:before {
                    content: '';
                    position: absolute;
                    top: 0;
                    left: -100%;
                    width: 100%;
                    height: 100%;
                    background: linear-gradient(120deg, transparent, rgba(255, 255, 255, 0.3), transparent);
                    transition: all 0.6s;
                }
                
                .signup-btn:hover {
                    background-color: #6a57d9;
                    transform: translateY(-2px);
                    box-shadow: 0 8px 15px rgba(124, 105, 239, 0.25);
                }
                
                .signup-btn:hover:before {
                    left: 100%;
                }
                
                .signup-btn:active {
                    transform: translateY(0);
                }
                
                .message {
                    margin-top: 15px;
                    padding: 10px;
                    border-radius: 6px;
                    font-size: 14px;
                    text-align: center;
                    background-color: #ffeded;
                    color: #e74c3c;
                }
                
                /* Sound toggle switch */
                .sound-toggle {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    margin-top: 20px;
                }
                
                .sound-label {
                    margin-left: 10px;
                    font-size: 14px;
                    color: #666;
                }
                
                .switch {
                    position: relative;
                    display: inline-block;
                    width: 46px;
                    height: 24px;
                }
                
                .switch input {
                    opacity: 0;
                    width: 0;
                    height: 0;
                }
                
                .slider {
                    position: absolute;
                    cursor: pointer;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background-color: #ccc;
                    transition: .4s;
                    border-radius: 34px;
                }
                
                .slider:before {
                    position: absolute;
                    content: "";
                    height: 18px;
                    width: 18px;
                    left: 3px;
                    bottom: 3px;
                    background-color: white;
                    transition: .4s;
                    border-radius: 50%;
                }
                
                input:checked + .slider {
                    background-color: #7c69ef;
                }
                
                input:checked + .slider:before {
                    transform: translateX(22px);
                }
                
                /* Responsive adjustments */
                @media (max-width: 480px) {
                    .signup-form {
                        padding: 30px 20px;
                    }
                    
                    h2 {
                        font-size: 22px;
                    }
                    
                    input {
                        padding: 12px 14px;
                    }
                }
            `}</style>
        </div>
    );
};

export default Signup;