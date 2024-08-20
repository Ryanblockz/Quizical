import React, { useState } from 'react';
import { auth, rtdb } from '../firebase';
import { signInWithPopup, GoogleAuthProvider, createUserWithEmailAndPassword, signInWithEmailAndPassword, sendPasswordResetEmail, updateProfile } from "firebase/auth";
import { ref, set, get } from "firebase/database";

const checkOnlineStatus = () => {
    return navigator.onLine;
};

function Auth({ setUser }) {
    const [emailOrUsername, setEmailOrUsername] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [username, setUsername] = useState('');
    const [isSignUp, setIsSignUp] = useState(false);
    const [passwordError, setPasswordError] = useState('');
    const [usernameError, setUsernameError] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [resetEmailSent, setResetEmailSent] = useState(false);
    const [showForgotPassword, setShowForgotPassword] = useState(false);
    const [registrationSuccess, setRegistrationSuccess] = useState(false);

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
        console.log("handleEmailPasswordAuth called");

        if (!checkOnlineStatus()) {
            setPasswordError("You are currently offline. Please check your internet connection and try again.");
            return;
        }

        setPasswordError('');
        setUsernameError('');
        setShowForgotPassword(false);
        setResetEmailSent(false);
        setRegistrationSuccess(false);

        if (isSignUp) {
            console.log("Attempting sign up");
            console.log('Email:', emailOrUsername);
            console.log('Username:', username);
            console.log('Password length:', password.length);
            console.log('Confirm Password length:', confirmPassword.length);

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

            try {
                console.log("Checking if username exists");
                const usernameRef = ref(rtdb, `usernames/${username}`);
                const usernameSnapshot = await get(usernameRef);
                if (usernameSnapshot.exists()) {
                    setUsernameError("Username is already taken");
                    return;
                }

                console.log("Creating user");
                const userCredential = await createUserWithEmailAndPassword(auth, emailOrUsername, password);
                console.log("User created", userCredential.user);

                console.log("Updating profile");
                await updateProfile(userCredential.user, { displayName: username });

                console.log("Setting user data");
                await set(ref(rtdb, `users/${userCredential.user.uid}`), {
                    username: username,
                    email: emailOrUsername,
                    perfectStreaks: 0,
                    bestTime: null
                });

                console.log("Setting username");
                await set(ref(rtdb, `usernames/${username}`), {
                    uid: userCredential.user.uid,
                    email: emailOrUsername
                });

                console.log("Registration successful");
                setRegistrationSuccess(true);
                setUser(userCredential.user);
            } catch (error) {
                console.error("Error with email/password auth", error);
                console.log("Error code:", error.code);
                console.log("Error message:", error.message);
                setPasswordError(error.message);
            }
        } else {
            try {
                console.log("Attempting to sign in with email:", emailOrUsername);
                const userCredential = await signInWithEmailAndPassword(auth, emailOrUsername, password);
                setUser(userCredential.user);
            } catch (error) {
                console.error("Error signing in", error);
                if (error.code === "auth/user-not-found" || error.code === "auth/wrong-password") {
                    setPasswordError("Invalid email or password");
                } else {
                    setPasswordError(error.message);
                }
                setShowForgotPassword(true);
            }
        }
    };

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    const handleForgotPassword = async (e) => {
        e.preventDefault();
        if (!emailOrUsername) {
            setPasswordError("Please enter your email address or username.");
            return;
        }
        try {
            let email = emailOrUsername;
            if (!email.includes('@')) {
                // If it's a username, fetch the corresponding email
                const usernameRef = ref(rtdb, `usernames/${emailOrUsername}`);
                const usernameSnapshot = await get(usernameRef);
                if (usernameSnapshot.exists()) {
                    const userData = usernameSnapshot.val();
                    email = userData.email;
                } else {
                    throw new Error("Username not found");
                }
            }
            await sendPasswordResetEmail(auth, email);
            setResetEmailSent(true);
            setPasswordError('');
            setShowForgotPassword(false);
        } catch (error) {
            console.error("Error sending password reset email", error);
            if (error.message === "Username not found") {
                setPasswordError("Invalid username. Please use your email address.");
            } else {
                setPasswordError(error.message);
            }
            setResetEmailSent(false);
        }
    };

    return (
        <div className="auth-container">
            <h2>{isSignUp ? 'Sign Up' : 'Sign In'}</h2>
            {registrationSuccess && (
                <p className="success-message">Registration successful! Welcome, {username}!</p>
            )}
            <form onSubmit={handleEmailPasswordAuth}>
                {isSignUp ? (
                    <>
                        <input
                            type="email"
                            value={emailOrUsername}
                            onChange={(e) => setEmailOrUsername(e.target.value)}
                            placeholder="Email"
                            required
                        />
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="Username"
                            required
                        />
                    </>
                ) : (
                    <input
                        type="text"
                        value={emailOrUsername}
                        onChange={(e) => setEmailOrUsername(e.target.value)}
                        placeholder="Email"
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