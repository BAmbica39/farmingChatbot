import { useState, useEffect, useRef } from "react";
import { askQuestion } from "../services/api";

export default function Chatbot() {
    const [question, setQuestion] = useState("");
    const [answer, setAnswer] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const requestRef = useRef();
    const cursorRef = useRef(null);
    const trailsRef = useRef([]);
    const numTrails = 10;
    const [chatHistory, setChatHistory] = useState([]);

    // Initialize cursor and trails on component mount
    useEffect(() => {
        // Create custom cursor element
        const cursor = document.createElement("div");
        cursor.className = "custom-cursor";
        cursor.style.position = "fixed";
        cursor.style.width = "24px";
        cursor.style.height = "24px";
        cursor.style.borderRadius = "50%";
        cursor.style.border = "2px solid rgba(123, 104, 238, 0.8)";
        cursor.style.backgroundColor = "rgba(123, 104, 238, 0.2)";
        cursor.style.backdropFilter = "blur(4px)";
        cursor.style.pointerEvents = "none";
        cursor.style.zIndex = "10000";
        cursor.style.transform = "translate(-50%, -50%)";
        cursor.style.boxShadow = "0 0 10px rgba(123, 104, 238, 0.5)";
        cursor.style.transition = "transform 0.1s ease, width 0.2s ease, height 0.2s ease, background-color 0.2s ease";
        document.body.appendChild(cursor);
        cursorRef.current = cursor;
        
        // Create initial trail data
        const initialTrails = Array.from({ length: numTrails }, (_, i) => ({
            id: i,
            x: 0,
            y: 0,
            size: 6 - i * 0.4,
            alpha: 0.7 - i * 0.06,
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
            trailElement.style.mixBlendMode = "screen";
            trailElement.style.boxShadow = "0 0 8px rgba(98, 87, 217, 0.6)";
            document.body.appendChild(trailElement);
            trail.element = trailElement;
        });

        // Track mouse position
        let lastX = 0;
        let lastY = 0;
        let isOverButton = false;
        let isOverInput = false;
        
        const handleMouseMove = (e) => {
            const mouseX = e.clientX;
            const mouseY = e.clientY;
            
            // Update custom cursor position
            if (cursorRef.current) {
                cursorRef.current.style.left = mouseX + "px";
                cursorRef.current.style.top = mouseY + "px";
            }
            
            // Add some easing to trail positions
            lastX = mouseX;
            lastY = mouseY;
            
            updateTrailsPosition(mouseX, mouseY);
        };

        const handleMouseDown = () => {
            if (cursorRef.current) {
                cursorRef.current.style.transform = "translate(-50%, -50%) scale(0.8)";
                cursorRef.current.style.backgroundColor = "rgba(123, 104, 238, 0.4)";
            }
        };

        const handleMouseUp = () => {
            if (cursorRef.current) {
                cursorRef.current.style.transform = "translate(-50%, -50%) scale(1)";
                cursorRef.current.style.backgroundColor = "rgba(123, 104, 238, 0.2)";
            }
        };

        const handleMouseOver = (e) => {
            const target = e.target;
            
            if (target.tagName === "BUTTON" || target.closest("button")) {
                isOverButton = true;
                if (cursorRef.current) {
                    cursorRef.current.style.width = "32px";
                    cursorRef.current.style.height = "32px";
                    cursorRef.current.style.backgroundColor = "rgba(123, 104, 238, 0.3)";
                    cursorRef.current.style.border = "2px solid rgba(255, 255, 255, 0.8)";
                }
                createSparkleEffect(e);
            } else if (target.tagName === "INPUT" || target.closest("input")) {
                isOverInput = true;
                if (cursorRef.current) {
                    cursorRef.current.style.width = "4px";
                    cursorRef.current.style.height = "24px";
                    cursorRef.current.style.borderRadius = "2px";
                    cursorRef.current.style.backgroundColor = "rgba(123, 104, 238, 0.8)";
                    cursorRef.current.style.border = "none";
                }
            } else if (target.className === "answer-box" || target.closest(".answer-box")) {
                if (cursorRef.current) {
                    cursorRef.current.style.width = "28px";
                    cursorRef.current.style.height = "28px";
                    cursorRef.current.style.backgroundColor = "rgba(123, 104, 238, 0.15)";
                    cursorRef.current.style.border = "2px solid rgba(123, 104, 238, 0.6)";
                }
            }
        };

        const handleMouseOut = (e) => {
            const target = e.target;
            
            if (target.tagName === "BUTTON" || target.closest("button")) {
                isOverButton = false;
                if (cursorRef.current) {
                    cursorRef.current.style.width = "24px";
                    cursorRef.current.style.height = "24px";
                    cursorRef.current.style.backgroundColor = "rgba(123, 104, 238, 0.2)";
                    cursorRef.current.style.border = "2px solid rgba(123, 104, 238, 0.8)";
                    cursorRef.current.style.borderRadius = "50%";
                }
            } else if (target.tagName === "INPUT" || target.closest("input")) {
                isOverInput = false;
                if (cursorRef.current) {
                    cursorRef.current.style.width = "24px";
                    cursorRef.current.style.height = "24px";
                    cursorRef.current.style.backgroundColor = "rgba(123, 104, 238, 0.2)";
                    cursorRef.current.style.border = "2px solid rgba(123, 104, 238, 0.8)";
                    cursorRef.current.style.borderRadius = "50%";
                }
            } else if (target.className === "answer-box" || target.closest(".answer-box")) {
                if (cursorRef.current) {
                    cursorRef.current.style.width = "24px";
                    cursorRef.current.style.height = "24px";
                    cursorRef.current.style.backgroundColor = "rgba(123, 104, 238, 0.2)";
                    cursorRef.current.style.border = "2px solid rgba(123, 104, 238, 0.8)";
                    cursorRef.current.style.borderRadius = "50%";
                }
            }
        };

        window.addEventListener("mousemove", handleMouseMove);
        window.addEventListener("mousedown", handleMouseDown);
        window.addEventListener("mouseup", handleMouseUp);
        
        // Add event listeners to interactive elements
        const interactiveElements = document.querySelectorAll("button, input, .answer-box");
        interactiveElements.forEach((element) => {
            element.addEventListener("mouseover", handleMouseOver);
            element.addEventListener("mouseout", handleMouseOut);
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
            window.removeEventListener("mousedown", handleMouseDown);
            window.removeEventListener("mouseup", handleMouseUp);
            
            interactiveElements.forEach((element) => {
                element.removeEventListener("mouseover", handleMouseOver);
                element.removeEventListener("mouseout", handleMouseOut);
            });
            
            if (cursorRef.current) {
                document.body.removeChild(cursorRef.current);
            }
            
            trailsRef.current.forEach(trail => {
                if (trail.element) {
                    document.body.removeChild(trail.element);
                }
            });
            
            // Clean up any remaining sparkles
            document.querySelectorAll(".cursor-sparkle").forEach(element => {
                document.body.removeChild(element);
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
            }, index * 35); // Slightly reduced delay for more responsive trails
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
                }, 85%, 65%, ${trail.alpha})`;

                // Add slight pulsing effect
                const pulse = Math.sin(currentTime / 150) * 0.5 + 0.5;
                trail.element.style.transform = `translate(-50%, -50%) scale(${
                    1 + pulse * 0.15
                })`;
            }
        });
    };

    // Create sparkle effect on hover over interactive elements
    const createSparkleEffect = (event) => {
        const element = event.target;
        const rect = element.getBoundingClientRect();
        
        for (let i = 0; i < 4; i++) {
            setTimeout(() => {
                const sparkle = document.createElement("div");
                sparkle.className = "cursor-sparkle";
                sparkle.style.position = "fixed";
                sparkle.style.borderRadius = "50%";
                sparkle.style.pointerEvents = "none";
                sparkle.style.zIndex = "9998";
                
                const x = rect.left + Math.random() * rect.width;
                const y = rect.top + Math.random() * rect.height;
                
                sparkle.style.left = x + "px";
                sparkle.style.top = y + "px";
                sparkle.style.width = "12px";
                sparkle.style.height = "12px";
                sparkle.style.backgroundColor = `hsla(${
                    Math.random() * 60 + 240
                }, 100%, 70%, 0.8)`;
                sparkle.style.transform = "translate(-50%, -50%) scale(0)";
                sparkle.style.transition = "transform 0.5s ease-out, opacity 0.5s ease-out";
                sparkle.style.boxShadow = "0 0 10px rgba(255, 255, 255, 0.8)";
                
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

    // Create button press effect
    const createButtonPressEffect = () => {
        const button = document.querySelector(".ask-button");
        if (!button) return;
        
        const rect = button.getBoundingClientRect();
        
        for (let i = 0; i < 8; i++) {
            setTimeout(() => {
                const angle = Math.random() * Math.PI * 2;
                const distance = 30 + Math.random() * 50;
                
                const x = rect.left + rect.width/2 + Math.cos(angle) * distance;
                const y = rect.top + rect.height/2 + Math.sin(angle) * distance;
                
                const sparkle = document.createElement("div");
                sparkle.className = "cursor-sparkle";
                sparkle.style.position = "fixed";
                sparkle.style.borderRadius = "50%";
                sparkle.style.pointerEvents = "none";
                sparkle.style.zIndex = "9998";
                sparkle.style.left = x + "px";
                sparkle.style.top = y + "px";
                sparkle.style.width = (10 + Math.random() * 10) + "px";
                sparkle.style.height = (10 + Math.random() * 10) + "px";
                sparkle.style.backgroundColor = `hsla(${
                    260 + Math.random() * 60
                }, 100%, 70%, 0.8)`;
                sparkle.style.transform = "translate(-50%, -50%) scale(0)";
                sparkle.style.transition = "transform 0.5s ease-out, opacity 0.5s ease-out";
                sparkle.style.boxShadow = `0 0 15px rgba(${
                    Math.floor(Math.random() * 100 + 155)
                }, ${
                    Math.floor(Math.random() * 100 + 155)
                }, 255, 0.8)`;
                
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
            }, i * 50);
        }
    };

    const handleAsk = async () => {
        if (!question.trim()) return;
        
        setIsLoading(true);
        createButtonPressEffect();
        
        try {
            const res = await askQuestion(question);
            setAnswer(res.answer); 
            
            // Add to chat history
            setChatHistory(prev => [...prev, {
                question: question,
                answer: res.answer,
                timestamp: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
            }]);
            
            // Clear input after sending
            setQuestion("");
        } catch (error) {
            console.error("Error fetching answer:", error);
            setAnswer("Sorry, I couldn't process your question. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === "Enter") {
            handleAsk();
        }
    };

    // Weather info (mockup for design)
    const weatherInfo = {
        temp: "74°F",
        condition: "Partly Cloudy",
        humidity: "45%"
    };

    return (
        <div className="chatbot-container">
            <div className="farm-background"></div>
            
            <div className="chatbot-layout">
                <div className="sidebar">
                    <div className="sidebar-header">
                        <div className="logo">
                            <span className="logo-leaf">🌿</span>
                            <h3>FarmBot</h3>
                        </div>
                    </div>
                    
                    <div className="weather-widget">
                        <h4>Farm Weather</h4>
                        <div className="weather-content">
                            <div className="weather-icon">☀️</div>
                            <div className="weather-details">
                                <div className="weather-temp">{weatherInfo.temp}</div>
                                <div className="weather-condition">{weatherInfo.condition}</div>
                                <div className="weather-humidity">Humidity: {weatherInfo.humidity}</div>
                            </div>
                        </div>
                    </div>
                    
                    <div className="chat-history">
                        <h4>Recent Questions</h4>
                        {chatHistory.length === 0 ? (
                            <div className="no-history">Your recent questions will appear here</div>
                        ) : (
                            <div className="history-list">
                                {chatHistory.map((item, index) => (
                                    <div key={index} className="history-item">
                                        <div className="history-question">
                                            <span className="history-icon">❓</span>
                                            <span className="history-text">{item.question}</span>
                                        </div>
                                        <div className="history-time">{item.timestamp}</div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                    
                    <div className="sidebar-footer">
                        <div className="farm-tip">
                            <div className="tip-icon">💡</div>
                            <div className="tip-text">Seasonal Tip: Now is a great time to prepare your soil for spring planting!</div>
                        </div>
                    </div>
                </div>
                
                <div className="chatbot-card">
                    <header className="chatbot-header">
                        <h2>Farming Assistant</h2>
                        <div className="header-icons">
                            <div className="header-icon">🍃</div>
                            <div className="header-icon">🌱</div>
                            <div className="header-icon">🌾</div>
                        </div>
                    </header>
                    
                    <div className="answer-container">
                        <div className="answer-box">
                            <div className="answer-box-header">
                                <h3>{answer ? "Your Answer" : "Welcome to FarmBot"}</h3>
                            </div>
                            <div className="answer-content">
                                {isLoading ? (
                                    <div className="loading-animation">
                                        <div className="loading-dots">
                                            <span></span>
                                            <span></span>
                                            <span></span>
                                        </div>
                                        <div className="loading-text">Finding the best answer for you...</div>
                                    </div>
                                ) : answer ? (
                                    <div className="answer-text">{answer}</div>
                                ) : (
                                    <div className="welcome-message">
                                        <div className="welcome-icon">🌾</div>
                                        <p>I'm your farming assistant, ready to help with any questions about crops, soil health, organic practices, pest management, and sustainable farming techniques.</p>
                                        <p>Ask me anything about your farm or garden below!</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                    
                    <div className="input-container">
                        <div className="input-wrapper">
                            <div className="input-icon">🔍</div>
                            <input
                                type="text"
                                value={question}
                                onChange={(e) => setQuestion(e.target.value)}
                                onKeyPress={handleKeyPress}
                                placeholder="Ask about crops, soil, pests, or techniques..."
                                className="question-input"
                            />
                        </div>
                        <button 
                            onClick={handleAsk} 
                            className="ask-button"
                            disabled={isLoading}
                        >
                            {isLoading ? "Processing..." : "Ask FarmBot"}
                        </button>
                    </div>
                    
                    <footer className="chatbot-footer">
                        <div className="suggested-questions">
                            <span className="suggestion-label">Try asking:</span>
                            <button className="suggestion-pill" onClick={() => setQuestion("How do I improve clay soil?")}>
                                How do I improve clay soil?
                            </button>
                            <button className="suggestion-pill" onClick={() => setQuestion("Best crops for summer planting?")}>
                                Best crops for summer planting?
                            </button>
                            <button className="suggestion-pill" onClick={() => setQuestion("Organic pest control methods?")}>
                                Organic pest control methods?
                            </button>
                        </div>
                    </footer>
                </div>
            </div>

            <style jsx>{`
                /* Base Styles - Now showing default cursor */
                * {
                    /* We're NOT hiding the default cursor */
                    /* cursor: none !important; */
                    cursor: default;
                }
                
                /* Main Container Styles */
                .chatbot-container {
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    min-height: 100vh;
                    background: linear-gradient(135deg, #e6f0f7 0%, #d7e1ff 100%);
                    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                    overflow: hidden;
                    position: relative;
                    perspective: 1000px;
                }

                /* Background Farm Scene */
                .farm-background {
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background-image: radial-gradient(circle at 70% 65%, rgba(185, 222, 255, 0.3) 0%, rgba(185, 222, 255, 0.05) 40%),
                        radial-gradient(circle at 30% 30%, rgba(154, 210, 132, 0.3) 0%, rgba(154, 210, 132, 0.05) 50%);
                    filter: blur(0px);
                    opacity: 0.8;
                    z-index: 1;
                }

                /* Layout Structure */
                .chatbot-layout {
                    display: flex;
                    gap: 24px;
                    width: 90%;
                    max-width: 1200px;
                    height: 85vh;
                    max-height: 850px;
                    z-index: 10;
                }

                /* Sidebar Styles */
                .sidebar {
                    width: 300px;
                    background: linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(255, 255, 255, 0.85) 100%);
                    border-radius: 20px;
                    box-shadow: 
                        0 10px 25px rgba(0, 0, 0, 0.1),
                        0 5px 10px rgba(0, 0, 0, 0.05),
                        0 0 0 1px rgba(123, 104, 238, 0.05);
                    display: flex;
                    flex-direction: column;
                    backdrop-filter: blur(10px);
                    transform: translateZ(20px);
                    overflow: hidden;
                }

                .sidebar-header {
                    padding: 24px;
                    border-bottom: 1px solid rgba(0, 0, 0, 0.05);
                }

                .logo {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                }

                .logo-leaf {
                    font-size: 28px;
                    filter: drop-shadow(0 2px 3px rgba(0, 0, 0, 0.2));
                }

                .logo h3 {
                    margin: 0;
                    font-size: 24px;
                    color:rgb(156, 114, 196);
                    letter-spacing: 0.5px;
                }

                .weather-widget {
                    margin: 16px;
                    padding: 16px;
                    background: linear-gradient(120deg, rgba(255, 255, 255, 0.9) 0%, rgba(245, 245, 255, 0.8) 100%);
                    border-radius: 16px;
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
                }

                .weather-widget h4 {
                    margin-top: 0;
                    margin-bottom: 12px;
                    color: #4f4f5c;
                    font-size: 18px;
                    font-weight: 600;
                }

                .weather-content {
                    display: flex;
                    align-items: center;
                }

                .weather-icon {
                    font-size: 36px;
                    margin-right: 16px;
                    filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2));
                }

                .weather-details {
                    flex: 1;
                }

                .weather-temp {
                    font-size: 24px;
                    font-weight: 600;
                    color: #333;
                }

                .weather-condition {
                    font-size: 14px;
                    color: #666;
                    margin-bottom: 4px;
                }

                .weather-humidity {
                    font-size: 14px;
                    color: #666;
                }

                .chat-history {
                    margin: 0 16px;
                    padding: 16px;
                    flex: 1;
                    overflow-y: auto;
                }

                .chat-history h4 {
                    margin-top: 0;
                    margin-bottom: 16px;
                    color: #4f4f5c;
                    font-size: 18px;
                    font-weight: 600;
                }

                .no-history {
                    color: #999;
                    font-style: italic;
                    text-align: center;
                    padding: 20px 0;
                }

                .history-list {
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                }

                .history-item {
                    padding: 12px;
                    background: linear-gradient(120deg, rgba(255, 255, 255, 0.7) 0%, rgba(245, 245, 255, 0.7) 100%);
                    border-radius: 10px;
                    border-left: 3px solid #7b68ee;
                    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
                    transition: all 0.3s ease;
                }

                .history-item:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
                    border-left-width: 5px;
                }

                .history-question {
                    display: flex;
                    align-items: flex-start;
                    gap: 8px;
                    margin-bottom: 8px;
                }

                .history-icon {
                    font-size: 14px;
                    color: #7b68ee;
                }

                .history-text {
                    font-size: 14px;
                    color: #555;
                    flex: 1;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    max-width: 200px;
                }

                .history-time {
                    font-size: 12px;
                    color: #999;
                    text-align: right;
                }

                .sidebar-footer {
                    padding: 16px;
                    border-top: 1px solid rgba(0, 0, 0, 0.05);
                }

                .farm-tip {
                    display: flex;
                    gap: 12px;
                    background: linear-gradient(120deg, rgba(215, 255, 215, 0.5) 0%, rgba(205, 245, 205, 0.5) 100%);
                    padding: 12px;
                    border-radius: 10px;
                }

                .tip-icon {
                    font-size: 18px;
                }

                .tip-text {
                    font-size: 14px;
                    color:rgb(156, 114, 196);
                    line-height: 1.5;
                }

                /* Chatbot Card Styles */
                .chatbot-card {
                    flex: 1;
                    background-color: white;
                    border-radius: 20px;
                    box-shadow: 
                        0 15px 35px rgba(0, 0, 0, 0.1),
                        0 3px 10px rgba(0, 0, 0, 0.05),
                        0 0 0 1px rgba(123, 104, 238, 0.05);
                    display: flex;
                    flex-direction: column;
                    overflow: hidden;
                    z-index: 10;
                    backdrop-filter: blur(5px);
                    transform-style: preserve-3d;
                    transition: all 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
                }

                .chatbot-card:hover {
                    transform: translateZ(5px);
                    box-shadow: 
                        0 20px 40px rgba(123, 104, 238, 0.2),
                        0 15px 20px rgba(0, 0, 0, 0.1),
                        0 0 0 1px rgba(123, 104, 238, 0.1);
                        }

                /* Header Styles */
                .chatbot-header {
                    background: linear-gradient(120deg, #7579e7 0%, #9b5de5 60%, #a678e2 100%);
                    color: white;
                    padding: 24px 32px;
                    border-radius: 20px 20px 0 0;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    position: relative;
                    overflow: hidden;
                }

                .chatbot-header:after {
                    content: '';
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: linear-gradient(120deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 100%);
                    z-index: 0;
                }

                .chatbot-header h2 {
                    margin: 0;
                    font-size: 28px;
                    font-weight: 700;
                    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
                    position: relative;
                    z-index: 1;
                    letter-spacing: 0.5px;
                }

                .header-icons {
                    display: flex;
                    gap: 12px;
                }

                .header-icon {
                    font-size: 24px;
                    animation: float 6s ease-in-out infinite;
                    animation-delay: calc(var(--i, 0) * 1s);
                    filter: drop-shadow(0 3px 5px rgba(0, 0, 0, 0.2));
                    position: relative;
                    z-index: 1;
                    transform-origin: center;
                }

                .header-icon:nth-child(1) { --i: 0; }
                .header-icon:nth-child(2) { --i: 2; }
                .header-icon:nth-child(3) { --i: 1; }

                /* Answer Area Styles */
                .answer-container {
                    flex: 1;
                    padding: 24px 32px;
                    overflow-y: auto;
                    background: linear-gradient(180deg, rgba(255,255,255,1) 0%, rgba(250,250,255,1) 100%);
                }

                .answer-box {
                    background-color: #f7f9ff;
                    border-radius: 16px;
                    height: 100%;
                    display: flex;
                    flex-direction: column;
                    box-shadow: 
                        0 4px 16px rgba(0, 0, 0, 0.04),
                        0 1px 4px rgba(0, 0, 0, 0.02);
                    transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
                    overflow: hidden;
                }

                .answer-box:hover {
                    box-shadow: 
                        0 8px 24px rgba(0, 0, 0, 0.06),
                        0 2px 8px rgba(0, 0, 0, 0.04);
                    transform: translateY(-2px);
                }

                .answer-box-header {
                    padding: 16px 24px;
                    border-bottom: 1px solid rgba(0, 0, 0, 0.05);
                    background: linear-gradient(90deg, rgba(240,242,255,1) 0%, rgba(245,247,255,1) 100%);
                }

                .answer-box-header h3 {
                    margin: 0;
                    color: #333;
                    font-size: 18px;
                    font-weight: 600;
                }

                .answer-content {
                    padding: 24px;
                    flex: 1;
                    overflow-y: auto;
                }

                .welcome-message {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    text-align: center;
                    color: #555;
                    line-height: 1.6;
                }

                .welcome-icon {
                    font-size: 48px;
                    margin-bottom: 20px;
                    animation: pulse 3s infinite alternate;
                }

                .welcome-message p {
                    max-width: 500px;
                    margin: 8px 0;
                }

                .answer-text {
                    line-height: 1.7;
                    color: #333;
                }

                /* Loading Animation */
                .loading-animation {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    height: 100%;
                    gap: 20px;
                }

                .loading-dots {
                    display: flex;
                    justify-content: center;
                    align-items: center;
                }

                .loading-dots span {
                    width: 12px;
                    height: 12px;
                    margin: 0 6px;
                    background: linear-gradient(135deg, #2a7b54 0%, #38a169 100%);
                    border-radius: 50%;
                    display: inline-block;
                    animation: bounce 1.4s infinite ease-in-out both;
                    box-shadow: 0 0 10px rgba(42, 123, 84, 0.5);
                }

                .loading-dots span:nth-child(1) {
                    animation-delay: -0.32s;
                }

                .loading-dots span:nth-child(2) {
                    animation-delay: -0.16s;
                }

                .loading-text {
                    color: #666;
                    font-size: 14px;
                }

                /* Input Area Styles */
                .input-container {
                    padding: 24px 32px;
                    display: flex;
                    gap: 16px;
                    border-top: 1px solid rgba(0, 0, 0, 0.05);
                    background: linear-gradient(180deg, rgba(250,250,255,1) 0%, rgba(245,247,255,1) 100%);
                }

                .input-wrapper {
                    flex: 1;
                    position: relative;
                    display: flex;
                    align-items: center;
                    background-color: white;
                    border-radius: 12px;
                    border: 2px solid #e0e0e0;
                    transition: all 0.3s ease;
                    box-shadow: 
                        inset 0 2px 4px rgba(0, 0, 0, 0.03),
                        0 0 0 4px rgba(42, 123, 84, 0);
                }

                .input-wrapper:focus-within {
                    border-color:rgb(156, 114, 196);
                    box-shadow: 
                        0 0 0 4px rgba(42, 123, 84, 0.15),
                        0 8px 16px rgba(0, 0, 0, 0.05);
                    transform: translateY(-2px);
                }

                .input-icon {
                    padding: 0 12px;
                    font-size: 18px;
                    color: #999;
                }

                .question-input {
                    flex: 1;
                    padding: 16px 0 16px 0;
                    border: none;
                    font-size: 16px;
                    background: transparent;
                    width: 100%;
                }

                .question-input:focus {
                    outline: none;
                }

                .ask-button {
                    background: linear-gradient(120deg, #7579e7 0%, #9b5de5 60%, #a678e2 100%);
                    color: white;
                    border: none;
                    border-radius: 12px;
                    padding: 16px 28px;
                    font-size: 16px;
                    font-weight: 600;
                    transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
                    position: relative;
                    overflow: hidden;
                    box-shadow: 
                        0 4px 12px rgba(42, 123, 84, 0.3),
                        0 0 0 2px rgba(42, 123, 84, 0.1);
                    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
                    letter-spacing: 0.5px;
                    cursor: pointer;
                }

                .ask-button:before {
                    content: '';
                    position: absolute;
                    top: 0;
                    left: -100%;
                    width: 100%;
                    height: 100%;
                    background: linear-gradient(
                        90deg, 
                        rgba(255, 255, 255, 0) 0%, 
                        rgba(255, 255, 255, 0.3) 50%, 
                        rgba(255, 255, 255, 0) 100%
                    );
                    transition: left 0.7s ease;
                    z-index: 1;
                }

                .ask-button:hover {
                    background: linear-gradient(135deg, #35926a 0%, #41b578 100%);
                    transform: translateY(-3px);
                    box-shadow: 
                        0 8px 20px rgba(42, 123, 84, 0.4),
                        0 0 0 3px rgba(42, 123, 84, 0.2);
                }

                .ask-button:hover:before {
                    left: 100%;
                }

                .ask-button:active {
                    transform: translateY(0);
                    box-shadow: 
                        0 4px 8px rgba(42, 123, 84, 0.3),
                        0 0 0 3px rgba(42, 123, 84, 0.2);
                }

                .ask-button:disabled {
                    background: linear-gradient(135deg, #89c4a3 0%, #a3d6b7 100%);
                    cursor: not-allowed;
                    transform: none;
                    box-shadow: 0 2px 8px rgba(42, 123, 84, 0.2);
                }

                /* Footer Styles */
                .chatbot-footer {
                    padding: 16px 32px;
                    background: linear-gradient(180deg, #f5f7ff 0%, #eff1fa 100%);
                    border-top: 1px solid rgba(0, 0, 0, 0.05);
                    border-radius: 0 0 20px 20px;
                }

                .suggested-questions {
                    display: flex;
                    flex-wrap: wrap;
                    align-items: center;
                    gap: 10px;
                }

                .suggestion-label {
                    color: #666;
                    font-size: 14px;
                }

                .suggestion-pill {
                    background: linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(245,245,255,0.9) 100%);
                    border: 1px solid rgba(42, 123, 84, 0.2);
                    color: #2a7b54;
                    border-radius: 20px;
                    padding: 8px 16px;
                    font-size: 14px;
                    transition: all 0.3s ease;
                    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
                    cursor: pointer;
                }

                .suggestion-pill:hover {
                    background: linear-gradient(135deg, rgba(230,255,240,0.9) 0%, rgba(220,245,230,0.9) 100%);
                    transform: translateY(-2px);
                    box-shadow: 0 4px 10px rgba(42, 123, 84, 0.2);
                }

                /* Animations */
                @keyframes bounce {
                    0%, 80%, 100% {
                        transform: scale(0);
                        opacity: 0.5;
                    }
                    40% {
                        transform: scale(1);
                        opacity: 1;
                    }
                }

                @keyframes float {
                    0% {
                        transform: translateY(0px) rotate(0deg);
                    }
                    50% {
                        transform: translateY(-10px) rotate(5deg);
                    }
                    100% {
                        transform: translateY(0px) rotate(0deg);
                    }
                }

                @keyframes pulse {
                    0% {
                        transform: scale(1);
                        opacity: 0.7;
                    }
                    100% {
                        transform: scale(1.1);
                        opacity: 1;
                    }
                }

                /* Responsive Adjustments */
                @media (max-width: 1200px) {
                    .chatbot-layout {
                        width: 95%;
                    }
                }

                @media (max-width: 900px) {
                    .chatbot-layout {
                        flex-direction: column;
                        height: auto;
                        max-height: none;
                        gap: 16px;
                    }
                    
                    .sidebar {
                        width: 100%;
                        max-height: 300px;
                    }
                    
                    .chatbot-card {
                        height: 600px;
                    }
                }

                @media (max-width: 768px) {
                    .input-container {
                        flex-direction: column;
                        padding: 16px 24px;
                    }
                    
                    .ask-button {
                        width: 100%;
                        padding: 14px 20px;
                    }

                    .chatbot-header {
                        padding: 16px 24px;
                    }

                    .chatbot-header h2 {
                        font-size: 22px;
                    }

                    .answer-container {
                        padding: 16px 24px;
                    }
                    
                    .suggested-questions {
                        flex-direction: column;
                        align-items: flex-start;
                    }
                    
                    .suggestion-pill {
                        width: 100%;
                    }
                }
            `}</style>
        </div>
    );
}