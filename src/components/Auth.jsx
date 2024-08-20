import React, { useState } from 'react';
import { auth } from '../firebase';
import { signInWithPopup, GoogleAuthProvider, createUserWithEmailAndPassword, signInWithEmailAndPassword, sendPasswordResetEmail } from "firebase/auth";
import { getFirestore, doc, setDoc, getDoc } from "firebase/firestore";

function Auth({ setUser }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [username, setUsername] = useState('');
    const [isSignUp, setIsSignUp] = useState(false);
    const [passwordError, setPasswordError] = useState('');
    const [usernameError, setUsernameError] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [resetEmailSent, setResetEmailSent] = useState(false);
    const [showForgotPassword, setShowForgotPassword] = useState(false);

    const db = getFirestore();

    const handleGoogleSignIn = async () => {
        const provider = new GoogleAuthProvider();
        try {
            const result = await signInWithPopup(auth, provider);
            setUser(result.user);
        } catch (error) {
            console.error("Error signing in with Google", error);
        }
    };

    const validatePassword = (password) => {
        const regex = /^(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])/;
        return regex.test(password);
    };

    const handleEmailPasswordAuth = async (e) => {
        e.preventDefault();
        setPasswordError('');
        setUsernameError('');
        setShowForgotPassword(false);
        setResetEmailSent(false);

        if (isSignUp) {
            if (!validatePassword(password)) {
                setPasswordError("Password must contain at least one uppercase letter, one number, and one symbol");
                return;
            }
            if (password !== confirmPassword) {
                setPasswordError("Passwords don't match");
                return;
            }
            if (username.length < 3) {
                setUsernameError("Username must be at least 3 characters long");
                return;
            }
            // Check if username is unique
            const usernameDoc = await getDoc(doc(db, "usernames", username));
            if (usernameDoc.exists()) {
                setUsernameError("Username is already taken");
                return;
            }
        }

        try {
            if (isSignUp) {
                const userCredential = await createUserWithEmailAndPassword(auth, email, password);
                await setDoc(doc(db, "users", userCredential.user.uid), {
                    username: username,
                    email: email,
                    perfectStreaks: 0,
                    bestTime: null
                });
                await setDoc(doc(db, "usernames", username), { uid: userCredential.user.uid });
                setUser(userCredential.user);
            } else {
                const userCredential = await signInWithEmailAndPassword(auth, email, password);
                setUser(userCredential.user);
            }
        } catch (error) {
            console.error("Error with email/password auth", error);
            if (error.code === 'auth/invalid-credential') {
                setPasswordError("Incorrect password");
            } else {
                setPasswordError(error.message);
            }
            if (!isSignUp) {
                setShowForgotPassword(true);
            }
        }
    };

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    const handleForgotPassword = async (e) => {
        e.preventDefault();
        if (!email) {
            setPasswordError("Please enter your email address.");
            return;
        }
        try {
            await sendPasswordResetEmail(auth, email);
            setResetEmailSent(true);
            setPasswordError('');
            setShowForgotPassword(false);
        } catch (error) {
            console.error("Error sending password reset email", error);
            setPasswordError(error.message);
            setResetEmailSent(false);
        }
    };

    return (
        <div className="auth-container">
            <h2>{isSignUp ? 'Sign Up' : 'Sign In'}</h2>
            <form onSubmit={handleEmailPasswordAuth}>
                <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Email"
                    required
                />
                {isSignUp && (
                    <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="Username"
                        required
                    />
                )}
                <div className="password-input-container">
                    <input
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Password"
                        required
                    />
                    <button type="button" onClick={togglePasswordVisibility} className="toggle-password">
                        {showPassword ? "Hide" : "Show"}
                    </button>
                </div>
                {isSignUp && (
                    <div className="password-input-container">
                        <input
                            type={showPassword ? "text" : "password"}
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="Confirm Password"
                            required
                        />
                        <button type="button" onClick={togglePasswordVisibility} className="toggle-password">
                            {showPassword ? "Hide" : "Show"}
                        </button>
                    </div>
                )}
                {showForgotPassword && (
                    <p onClick={handleForgotPassword} className="auth-toggle forgot-password">
                        Forgot Password?
                    </p>
                )}
                {passwordError && <p className="error-message">{passwordError}</p>}
                {usernameError && <p className="error-message">{usernameError}</p>}
                {resetEmailSent && (
                    <p className="reset-email-sent">Password reset email sent. Please check your inbox.</p>
                )}
                <button type="submit" className="auth-button primary-button">
                    {isSignUp ? 'Sign Up' : 'Sign In'}
                </button>
            </form>
            <button onClick={handleGoogleSignIn} className="auth-button google-button">
                <span className="continue-with">Continue with </span>
                <span className="google-text">G<span style={{ color: '#EA4335' }}>o</span><span style={{ color: '#FBBC05' }}>o</span><span style={{ color: '#4285F4' }}>g</span><span style={{ color: '#34A853' }}>l</span><span style={{ color: '#EA4335' }}>e</span></span>
            </button>
            <p onClick={() => {
                setIsSignUp(!isSignUp);
                setPasswordError('');
                setConfirmPassword('');
                setResetEmailSent(false);
                setShowForgotPassword(false);
            }} className="auth-toggle">
                {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
            </p>
        </div>
    );
}

export default Auth;