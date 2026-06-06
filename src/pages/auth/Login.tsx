import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

import Particles from "react-tsparticles";

import LogoTW2 from '../../components/layout/LogoTW2.png';

const loginSchema = z.object({
  email: z.string().min(1, "Email is required").email("Invalid email format"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type LoginFormInputs = z.infer<typeof loginSchema>;

function AnimatedBackground() {
  return (
    <>

      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(circle at top, #1e3a8a 0%, #0f172a 45%, #020617 100%)',
        }}
      />

      <div className="absolute top-[-100px] left-[10%] w-[500px] h-[500px] rounded-full bg-cyan-400/20 blur-3xl" />

      <div className="absolute bottom-[-150px] right-[10%] w-[400px] h-[400px] rounded-full bg-blue-500/20 blur-3xl" />

      <Particles
        id="loginParticles"
        className="absolute inset-0"
        options={{
          background: {
            color: 'transparent',
          },
          fpsLimit: 60,
          particles: {
            color: {
              value: '#60a5fa',
            },
            links: {
              color: '#3b82f6',
              distance: 150,
              enable: true,
              opacity: 0.25,
              width: 1,
            },
            move: {
              enable: true,
              speed: 1,
            },
            number: {
              value: 55,
            },
            opacity: {
              value: 0.5,
            },
            size: {
              value: {
                min: 1,
                max: 4,
              },
            },
          },
        }}
      />
    </>
  );
}

export default function LoginPage() {
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormInputs>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormInputs) => {
    setIsLoading(true);
    setServerError("");

    try {
      const response = await fetch("http://localhost:3000/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: data.email,
          password: data.password,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        setServerError(result.pesan || "Email atau password salah.");
        return;
      }

      localStorage.setItem("user", JSON.stringify(result.data));

      const userId =
        result.data?.UserID ||
        result.data?.user_id ||
        result.data?.id;

      try {
        const groupRes = await fetch(
          "http://localhost:3000/api/groupGetGroupByUserId",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              user_id: userId,
            }),
          }
        );

        const groupResult = await groupRes.json();

        if (
          groupRes.ok &&
          groupResult.status === "sukses" &&
          groupResult.data?.length > 0
        ) {
          navigate('/dashboard');
        } else {
          navigate('/onboarding');
        }
      } catch {
        navigate('/onboarding');
      }

    } catch (error) {
      console.error("Gagal koneksi ke backend:", error);
      setServerError("Tidak bisa terhubung ke server.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden flex flex-col justify-center items-center p-4">

      <AnimatedBackground />
      <div className="relative z-10 w-full flex flex-col items-center">

        <div className="flex items-center justify-center gap-3 mb-5">
          <img
            src={LogoTW2}
            alt="TaskWeaver Logo"
            className="w-12 h-12 object-cover rounded-md"
          />

          <span className="text-3xl font-bold text-white tracking-wide drop-shadow-lg">
            TaskWeaver
          </span>
        </div>

        <div className="w-full max-w-md bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 p-8">

          <h2 className="text-2xl font-bold text-slate-900 mb-2">
            Welcome back
          </h2>

          <p className="text-slate-500 mb-6">
            Please enter your details to sign in.
          </p>

          {serverError && (
            <div className="p-3 mb-4 text-sm text-red-700 bg-red-100 rounded-lg border border-red-200">
              {serverError}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Email Address
              </label>

              <input
                type="email"
                {...register("email")}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
                  errors.email
                    ? 'border-red-500'
                    : 'border-gray-200'
                }`}
                placeholder="Enter your email"
              />

              {errors.email && (
                <span className="text-xs text-red-500 mt-1">
                  {errors.email.message}
                </span>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Password
              </label>

              <input
                type="password"
                {...register("password")}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
                  errors.password
                    ? 'border-red-500'
                    : 'border-gray-200'
                }`}
                placeholder="••••••••"
              />

              {errors.password && (
                <span className="text-xs text-red-500 mt-1">
                  {errors.password.message}
                </span>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-6 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 rounded-lg transition-all duration-300 hover:scale-[1.02] flex justify-center items-center disabled:opacity-50"
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <svg
                    className="animate-spin h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />

                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 
                      0 0 5.373 0 12h4zm2 5.291A7.962 
                      7.962 0 014 12H0c0 3.042 1.135 
                      5.824 3 7.938l3-2.647z"
                    />
                  </svg>

                  Processing...
                </span>
              ) : (
                "Sign In"
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-600">
            Don't have an account?{" "}
            <Link
              to="/register"
              className="font-medium text-blue-600 hover:text-blue-500"
            >
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}