import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import LogoTW2 from '../../components/layout/LogoTW2.png';

const loginSchema = z.object({
  email: z.string().min(1, "Email is required").email("Invalid email format"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type LoginFormInputs = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const navigate = useNavigate();
  
  // State untuk efek loading dan pesan error dari backend
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
      // Menembak data ke Endpoint Backend (Express)
      const response = await fetch("http://localhost:3000/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: data.email,
          password: data.password
        }),
      });

      const result = await response.json();

      if (response.ok) {
        // Simpan data user ke localStorage biar tidak hilang saat halaman di-refresh
        // Ini sangat berguna nanti untuk halaman Dashboard dan Chat
        localStorage.setItem("user", JSON.stringify(result.data));

        console.log("Login sukses! Data user:", result.data);

        // Cek apakah user sudah punya tim. 
        // Sesuaikan 'hasTeam' dengan nama field yang sesungguhnya dari tabel database-mu nanti
        const userHasTeam = result.data?.hasTeam || false; 

        if (userHasTeam) {
          navigate('/dashboard');
        } else {
          navigate('/onboarding');
        }
      } else {
        // Jika gagal (Misal: password salah atau email tidak ditemukan)
        setServerError(result.pesan || "Email atau password salah.");
      }
    } catch (error) {
      console.error("Gagal koneksi ke backend:", error);
      setServerError("Tidak bisa terhubung ke server.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center p-4">
      <div className="flex items-center gap-2">
        <div className="flex items-center justify-center gap-3 mb-5">
          <img 
            src={LogoTW2} 
            alt="TaskWeaver Logo" 
            className="w-12 h-12 object-cover rounded-md mix-blend-multiply" 
          />
          <span className="text-3xl font-bold text-blue-600 leading-none">
            TaskWeaver AI
          </span>
        </div>
      </div>
    
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Welcome back</h2>
        <p className="text-slate-500 mb-6">Please enter your details to sign in.</p>

        {/* --- Menampilkan Pesan Error dari Backend --- */}
        {serverError && (
          <div className="p-3 mb-4 text-sm text-red-700 bg-red-100 rounded-lg border border-red-200">
            {serverError}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
            <input 
              type="email" 
              {...register("email")} 
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
                errors.email ? 'border-red-500' : 'border-gray-200'
              }`}
              placeholder="Enter your email"
            />
            {errors.email && <span className="text-xs text-red-500 mt-1">{errors.email.message}</span>}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
            <input 
              type="password" 
              {...register("password")} 
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
                errors.password ? 'border-red-500' : 'border-gray-200'
              }`}
              placeholder="••••••••"
            />
            {errors.password && <span className="text-xs text-red-500 mt-1">{errors.password.message}</span>}
          </div>

          <button 
            type="submit"
            disabled={isLoading}
            className="w-full mt-6 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 rounded-lg transition-colors flex justify-center items-center disabled:opacity-50"
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                Memproses...
              </span>
            ) : "Sign In"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-600">
          Don't have an account? <Link to="/register" className="font-medium text-blue-600 hover:text-blue-500">Sign up</Link>
        </p>
      </div>
    </div>
  );
}