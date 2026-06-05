import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import {
  Mail,
  Lock,
  User,
  Building2,
  Loader2,
  ArrowRight,
  AlertCircle,
  HelpCircle,
  Eye,
  EyeOff,
  Globe,
  Shield
} from 'lucide-react';

import { auth, db } from '../firebase/config';

import {
  createUserWithEmailAndPassword
} from 'firebase/auth';

import {
  doc,
  setDoc
} from 'firebase/firestore';

const UserRegister = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] =
    useState('');

  const [fullName, setFullName] =
    useState('');

  const [company, setCompany] =
    useState('');

  const [error, setError] =
    useState('');

  const [loading, setLoading] =
    useState(false);

  const [showPassword,
    setShowPassword] =
    useState(false);

  const navigate = useNavigate();

  const handleRegister = async (
    e
  ) => {
    e.preventDefault();

    setError('');
    setLoading(true);

    try {
      const userCredential =
        await createUserWithEmailAndPassword(
          auth,
          email.trim(),
          password
        );

      const user =
        userCredential.user;

      await setDoc(
        doc(
          db,
          'voting',
          user.uid
        ),
        {
          uid: user.uid,

          fullName,

          email,

          company,

          role: 'voter',

          hasVoted: false,

          votedCategories: [],

          createdAt:
            new Date().toISOString()
        }
      );

      alert(
        'Account registered successfully.'
      );

      navigate('/login');

    } catch (err) {

      console.error(err);

      if (
        err.code ===
        'auth/email-already-in-use'
      ) {
        setError(
          'This email address is already registered.'
        );
      }
      else if (
        err.code ===
        'auth/weak-password'
      ) {
        setError(
          'Password must be at least 6 characters.'
        );
      }
      else {
        setError(
          err.message
        );
      }

    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-slate-50 text-slate-800">

      {/* LEFT PANEL */}

      <div className="w-full md:w-[45%] border-b md:border-b-0 md:border-r border-slate-200 bg-gradient-to-br from-blue-50 to-slate-50 p-8 lg:p-12 flex flex-col justify-between">

        <div className="flex items-center gap-3">

          <div className="w-10 h-10 bg-gradient-to-tr from-blue-600 to-indigo-500 rounded-xl flex items-center justify-center shadow-md">

            <Shield
              className="text-white"
              size={20}
            />

          </div>

          <span className="font-black text-base tracking-tight uppercase text-slate-900">

            P2SA Election Portal

          </span>

        </div>

        <div className="my-12 md:my-0 space-y-6 max-w-md">

          <div className="inline-flex items-center gap-2 px-3 py-1 border rounded-full text-xs font-bold tracking-wide bg-blue-50 border-blue-200 text-blue-700">

            <Globe size={12} />

            Official Registration Portal

          </div>

          <h2 className="text-3xl lg:text-4xl font-black tracking-tight leading-tight text-slate-900">

            Create Your Voter Account

          </h2>

          <p className="text-base leading-relaxed text-slate-600 font-medium">

            Register your account to participate in the election process and access the voting platform.

          </p>

        </div>

        <div className="text-xs text-slate-400 font-bold">

          &copy; {new Date().getFullYear()} P2SA

        </div>

      </div>

      {/* RIGHT PANEL */}

      <div className="flex-1 flex items-center justify-center bg-white p-6 md:p-12 lg:p-16">

        <div className="w-full max-w-[420px]">

          <div className="mb-8">

            <h3 className="text-2xl font-black text-slate-900">

              User Registration

            </h3>

            <p className="text-base mt-2 font-medium text-slate-500">

              Fill in your details below.

            </p>

          </div>

          <form
            onSubmit={handleRegister}
            className="space-y-5"
          >

            {/* FULL NAME */}

            <div>

              <label className="block text-sm font-bold mb-2 text-slate-700">

                Full Name

              </label>

              <div className="relative">

                <User
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                  size={18}
                />

                <input
                  type="text"
                  value={fullName}
                  onChange={(e) =>
                    setFullName(
                      e.target.value
                    )
                  }
                  required
                  placeholder="Enter your full name"
                  className="w-full pl-12 pr-4 py-3.5 border border-slate-200 rounded-xl font-medium bg-slate-50 focus:bg-white focus:ring-4 focus:ring-blue-100 focus:border-blue-500 focus:outline-none transition-all"
                />

              </div>

            </div>

            {/* COMPANY */}

            <div>

              <label className="block text-sm font-bold mb-2 text-slate-700">

                Company / Organization

              </label>

              <div className="relative">

                <Building2
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                  size={18}
                />

                <input
                  type="text"
                  value={company}
                  onChange={(e) =>
                    setCompany(
                      e.target.value
                    )
                  }
                  required
                  placeholder="Enter company name"
                  className="w-full pl-12 pr-4 py-3.5 border border-slate-200 rounded-xl font-medium bg-slate-50 focus:bg-white focus:ring-4 focus:ring-blue-100 focus:border-blue-500 focus:outline-none transition-all"
                />

              </div>

            </div>

            {/* EMAIL */}

            <div>

              <label className="block text-sm font-bold mb-2 text-slate-700">

                Email Address

              </label>

              <div className="relative">

                <Mail
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                  size={18}
                />

                <input
                  type="email"
                  value={email}
                  onChange={(e) =>
                    setEmail(
                      e.target.value
                    )
                  }
                  required
                  placeholder="Enter your email"
                  className="w-full pl-12 pr-4 py-3.5 border border-slate-200 rounded-xl font-medium bg-slate-50 focus:bg-white focus:ring-4 focus:ring-blue-100 focus:border-blue-500 focus:outline-none transition-all"
                />

              </div>

            </div>

            {/* PASSWORD */}

            <div>

              <label className="block text-sm font-bold mb-2 text-slate-700">

                Password

              </label>

              <div className="relative">

                <Lock
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                  size={18}
                />

                <input
                  type={
                    showPassword
                      ? 'text'
                      : 'password'
                  }
                  value={password}
                  onChange={(e) =>
                    setPassword(
                      e.target.value
                    )
                  }
                  required
                  placeholder="Minimum 6 characters"
                  className="w-full pl-12 pr-12 py-3.5 border border-slate-200 rounded-xl font-medium bg-slate-50 focus:bg-white focus:ring-4 focus:ring-blue-100 focus:border-blue-500 focus:outline-none transition-all"
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowPassword(
                      !showPassword
                    )
                  }
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400"
                >
                  {showPassword
                    ? <EyeOff size={16} />
                    : <Eye size={16} />}
                </button>

              </div>

            </div>

            {error && (

              <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">

                <AlertCircle
                  size={16}
                  className="shrink-0 mt-0.5"
                />

                <span>
                  {error}
                </span>

              </div>

            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-4 rounded-xl font-bold text-base shadow-lg disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >

              {loading ? (
                <>
                  <Loader2
                    className="animate-spin"
                    size={20}
                  />
                  <span>
                    Registering...
                  </span>
                </>
              ) : (
                <>
                  <span>
                    Create Account
                  </span>
                  <ArrowRight
                    size={18}
                  />
                </>
              )}

            </button>

          </form>
          
          <div className="mt-6 text-center">

            <p className="text-sm text-slate-500">

                Already have an account?

                <button
                type="button"
                onClick={() => navigate('/login')}
                className="ml-2 font-bold text-blue-600 hover:text-blue-700"
                >
                Login Here
                </button>

            </p>

            </div>

          <div className="mt-10 flex items-center justify-center gap-2 text-slate-400">

            <HelpCircle size={14} />

            <span className="text-[10px] uppercase font-black tracking-widest">

              Secure Registration Portal

            </span>

          </div>

        </div>

      </div>

    </div>
  );
};

export default UserRegister;