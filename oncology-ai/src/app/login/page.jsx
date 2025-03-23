'use client'
import React, { useRef, useEffect, useState } from "react";
import Link from "next/link"; 
import re from "../../Assets/IMG/register.svg"
import lo from "../../Assets/IMG/log.svg"
import axios from "axios";
import Image from "next/image";
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import toast from "react-hot-toast";
import { FaLinkedin, FaGithub, FaGoogle } from "react-icons/fa";


export default function LoginAndRegister() {

  const router = useRouter();
  const [error, setError] = useState("");
  const [registerData, setRegisterData] = useState({
    StdName: "",
    StdEmail: "",
    StdPassword: "",
    StdConfirmPassword : ""
  });

  const [loginData, setLoginData] = useState({
    StdEmail: "",
    StdPassword: "",
  });

  const HandlesubmitLogin = async (e) => {
    e.preventDefault();
  
    try {
      // Prepare the login data
      const data = {
        email: loginData.StdEmail,
        password: loginData.StdPassword,
      };
  
      // Ensure both email and password are provided
      if (!data.email || !data.password) {
        alert("Please enter both email and password.");
        return;
      }
  
      // Use toast.promise to handle loading, success, and error states
      const res = await toast.promise(
        signIn("credentials", {
          redirect: false,
          email: data.email,
          password: data.password,
        }),
        {
          loading: 'Loading...',
          success: <b>Login Success! Redirecting...</b>,
          error: <b>Error during login. </b>,
        }
      );
  
      // Handle the response
      if (res?.error) {
        // Log the error for debugging
        console.error("Sign-in error:", res.error);
  
        // Check the type of error to give more specific feedback
        if (res.error === "Invalid password.") {
          alert("Incorrect password. Please try again.");
        } else if (res.error === "No user found with this email.") {
          alert("No account found with this email address.");
        } else {
          alert("Invalid credentials or an error occurred. Please try again.");
        }
  
        return;
      }
  
      if (res?.ok) {  
        // Redirect to the dashboard
        router.push("/");
      }
    } catch (error) {
      // Handle any unexpected errors
      console.error("Unexpected error during sign-in:", error);
      alert("An unexpected error occurred. Please try again later.");
    }
  };
  
  

  // Handle registration form submission
  const handleSubmitRegister = async (e) => {
    e.preventDefault();
    
    // Form validation
    if (!registerData.StdName || !registerData.StdEmail || !registerData.StdPassword) {
      setError("Please fill all required fields.");
      return;
    } else if (registerData.StdPassword !== registerData.StdConfirmPassword) {
      setError("Passwords do not match");
      return;
    }
    
    try {
      // Prepare data in the desired order
      const data = {
        StudentName: registerData.StdName,
        StudentEmail: registerData.StdEmail,
        StudentPassword: registerData.StdPassword,
      };

      const API_KEY = process.env.NEXT_PUBLIC_API_KEY;
      

      await toast.promise(
        axios.post('https://cesa-csi-pvppcoe.vercel.app/api/StudentRegistration', data, {
          headers: {
            Authorization: `${API_KEY}`,
            'Content-Type': 'application/json',
          },
        }),
        {
          loading: 'Creating An Account...',
          success: <b>Account created successfully!</b>,
          error: <b>Could not save event. Please try again.</b>,
        }
      );

      // Handle response
    } catch (error) {
      console.error("There was an error submitting the registration:", error);
      console.log("Failed to register. Please try again.");
    }


    if (typeof window !== "undefined") {
      const container = containerRef.current;
      const signInBtn = document.getElementById("sign-in-btn");
      const signUpBtn = document.getElementById("sign-up-btn");

        container.classList.add("sign-up-mode");
        container.classList.remove("sign-up-mode");
      

      return () => {
        signUpBtn.removeEventListener("click", () => container.classList.add("sign-up-mode"));
        signInBtn.removeEventListener("click", () => container.classList.remove("sign-up-mode"));
      };
    }
  };

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setRegisterData((prevState) => ({
      ...prevState,
      [name]: value
    }));

    setLoginData((prevState) => ({
      ...prevState,
      [name]: value
    }));
  };





  const containerRef = useRef(null);

  // Toggle between sign-in and sign-up mode
  useEffect(() => {
    if (typeof window !== "undefined") {
      const container = containerRef.current;
      const signInBtn = document.getElementById("sign-in-btn");
      const signUpBtn = document.getElementById("sign-up-btn");

      signUpBtn.addEventListener("click", () => {
        container.classList.add("sign-up-mode");
      });

      signInBtn.addEventListener("click", () => {
        container.classList.remove("sign-up-mode");
      });

      return () => {
        signUpBtn.removeEventListener("click", () => container.classList.add("sign-up-mode"));
        signInBtn.removeEventListener("click", () => container.classList.remove("sign-up-mode"));
      };
    }
  }, []);

  return (
    <div className="containerlog" ref={containerRef}>
      <div className="forms-container">
        <div className="signin-signup">
          {/* Sign In Form */}
          <form onSubmit={HandlesubmitLogin} className="sign-in-form">
            <h2 className="title">Sign In</h2>
            <div className="input-field">
              <i className="fas fa-user"></i>
              <input 
              type="text"
               placeholder="Username"
                  name="StdEmail"
               value={loginData.StdEmail}
               onChange={handleChange}
               />
            </div>
            <div className="input-field">
              <i className="fas fa-lock"></i>
              <input 
              type="password"
               placeholder="Password" 
               name="StdPassword"
               value={loginData.StdPassword}
               onChange={handleChange}
               />
            </div>
            <input type="submit" value="Login" className="btn solid" />
            <p className="social-text">Or Sign in with social platforms</p>
            <div className="social-media">
              <a href="#" className="social-icon">
              <FaLinkedin className="text-blue-600 w-8 h-8 hover:text-blue-700 transition" />

              </a>
              <a href="#" className="social-icon">
              <FaGithub className="text-gray-800 w-8 h-8 hover:text-gray-900 transition" />
              </a>
              <a href="#" className="social-icon">
              <FaGoogle className="text-red-600 w-8 h-8 hover:text-red-700 transition" />
              </a>
            
            </div>
          </form>

          {/* Sign Up Form */}
          <form onSubmit={handleSubmitRegister} className="sign-up-form">
            <h2 className="title">Sign Up</h2>
            <div className="input-field">
              <i className="fas fa-user"></i>
              <input
                type="text"
                name="StdName"
                placeholder="Username"
                value={registerData.StdName}
                onChange={handleChange}
              />
            </div>
            <div className="input-field">
              <i className="fas fa-envelope"></i>
              <input
                type="email"
                name="StdEmail"
                placeholder="Email"
                value={registerData.StdEmail}
                onChange={handleChange}
              />
            </div>
            <div className="input-field">
              <i className="fas fa-lock"></i>
              <input
                type="password"
                name="StdPassword"
                placeholder="Password"
                value={registerData.StdPassword}
                onChange={handleChange}
              />
            </div>
            <div className="input-field">
              <i className="fas fa-lock"></i>
              <input 
                type="password"
                name="StdConfirmPassword"  
                placeholder="Confirm password" 
                value={registerData.StdConfirmPassword}
                onChange={handleChange}
              />
            </div>
            <input type="submit" value="Sign Up" className="btn solid" />
            <p className="social-text">Or Sign up with social platforms</p>
            <div className="social-media">
              <a href="#" className="social-icon">
              <FaLinkedin className="text-blue-600 w-8 h-8 hover:text-blue-700 transition" />

              </a>
              <a href="#" className="social-icon">
              <FaGithub className="text-gray-800 w-8 h-8 hover:text-gray-900 transition" />
              </a>
              <a href="#" className="social-icon">
              <FaGoogle className="text-red-600 w-8 h-8 hover:text-red-700 transition" />
              </a>
            
            </div>
          </form>
        </div>
      </div>

      {/* Panels */}
      <div className="panels-container">
        <div className="panel left-panel">
          <div className="content">
            <h3>New here?</h3>
            <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Optio minus natus est.</p>
            <button className="btn transparent" id="sign-up-btn">
              Sign Up
            </button>
          </div>
          <Image src={lo} className="image" alt="Login Image" />
        </div>

        <div className="panel right-panel">
          <div className="content">
            <h3>One of us?</h3>
            <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Optio minus natus est.</p>
            <button className="btn transparent" id="sign-in-btn">
              Sign In
            </button>
          </div>
          <Image src={re} className="image" alt="Register Image" />
        </div>
      </div>
    </div>
  );
}
