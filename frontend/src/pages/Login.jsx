import { useState, useEffect, useRef } from "react";
import { login } from "../services/api";
import { useNavigate } from "react-router-dom";

export default function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [trails, setTrails] = useState([]);
    const requestRef = useRef();
    const navigate = useNavigate();
    const trailsRef = useRef([]);
    const numTrails = 15;

    // Initialize cursor trails on component mount
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
        
        setTrails(initialTrails);
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

        // Cleanup function
        return () => {
            window.removeEventListener("mousemove", handleMouseMove);
            interactiveElements.forEach((element) => {
                element.removeEventListener("mouseenter", createSparkleEffect);
            });
            
            trails.forEach(trail => {
                if (trail.element) {
                    document.body.removeChild(trail.element);
                }
            });
            
            cancelAnimationFrame(requestRef.current);
        };
    }, []);

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

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            await login({ email, password });
            navigate("/chat");
        } catch (error) {
            alert(error.response?.data?.detail || "Login failed");
        }
    };

    return (
        <div className="login-container">
            <form onSubmit={handleLogin} className="login-form">
                <h2>Login</h2>
                
                <div className="form-group">
                    <label>Email</label>
                    <input 
                        type="email" 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)} 
                        placeholder="Enter your email"
                        required 
                    />
                </div>
                
                <div className="form-group">
                    <label>Password</label>
                    <input 
                        type="password"
                        value={password} 
                        onChange={(e) => setPassword(e.target.value)} 
                        placeholder="Enter your password"
                        required 
                    />
                </div>
                
                <button type="submit" className="login-btn">Login Now</button>
            </form>
            
            <style jsx>{`
                * {
                    margin: 0;
                    padding: 0;
                    box-sizing: border-box;
                    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                }
                
                .login-container {
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    min-height: 100vh;
                    background-color: #f0f2f5;
                    background: linear-gradient(135deg, #e6e9f0 0%, #eef1f5 100%);
                    position: relative;
                    overflow: hidden;
                }
                
                .login-form {
                    background-color: white;
                    border-radius: 10px;
                    padding: 40px;
                    width: 400px;
                    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.05);
                    position: relative;
                    z-index: 10;
                }
                
                h2 {
                    color: #333;
                    font-size: 24px;
                    margin-bottom: 30px;
                    text-align: center;
                }
                
                .form-group {
                    margin-bottom: 25px;
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
                    padding: 12px 15px;
                    border: 1px solid #ddd;
                    border-radius: 6px;
                    font-size: 14px;
                    transition: all 0.3s ease;
                }
                
                input:focus {
                    outline: none;
                    border-color: #7c69ef;
                    box-shadow: 0 0 0 3px rgba(124, 105, 239, 0.15);
                }
                
                .login-btn {
                    width: 100%;
                    padding: 12px;
                    background-color: #7c69ef;
                    color: white;
                    border: none;
                    border-radius: 6px;
                    font-size: 16px;
                    font-weight: 500;
                    cursor: pointer;
                    transition: all 0.3s ease;
                }
                
                .login-btn:hover {
                    background-color: #6a57d9;
                    transform: translateY(-2px);
                    box-shadow: 0 4px 12px rgba(124, 105, 239, 0.25);
                }
                
                .login-btn:active {
                    transform: translateY(0);
                }
                
                /* Add subtle animations in the background */
                .login-container::before {
                    content: '';
                    position: absolute;
                    width: 150px;
                    height: 150px;
                    background: linear-gradient(90deg, #7c69ef, #b668e8);
                    border-radius: 50%;
                    top: 50px;
                    left: 20%;
                    filter: blur(30px);
                    opacity: 0.4;
                    animation: float 8s infinite alternate;
                }
                
                .login-container::after {
                    content: '';
                    position: absolute;
                    width: 200px;
                    height: 200px;
                    background: linear-gradient(90deg, #69c6ef, #70e4d9);
                    border-radius: 50%;
                    bottom: 50px;
                    right: 20%;
                    filter: blur(30px);
                    opacity: 0.3;
                    animation: float 10s infinite alternate-reverse;
                }
                
                @keyframes float {
                    0% {
                        transform: translate(0, 0);
                    }
                    100% {
                        transform: translate(20px, 20px);
                    }
                }
                
                /* Responsive adjustments */
                @media (max-width: 480px) {
                    .login-form {
                        width: 90%;
                        padding: 30px 20px;
                    }
                }
            `}</style>
        </div>
    );
}