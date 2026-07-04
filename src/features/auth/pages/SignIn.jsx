import { useState } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { useAuth } from "../hooks/useAuth.js"
import inventoryIllustration from "../../../assets/images/inventory-illustration.png"

const IconMail = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"
    strokeLinecap="round" strokeLinejoin="round" {...props}>
    <rect x="3" y="5" width="18" height="14" rx="2" />
    <path d="m3 7 9 6 9-6" />
  </svg>
)

const IconLock = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"
    strokeLinecap="round" strokeLinejoin="round" {...props}>
    <rect x="4" y="11" width="16" height="9" rx="2" />
    <path d="M8 11V7a4 4 0 0 1 8 0v4" />
  </svg>
)

const IconEye = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"
    strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M1.5 12S5 5 12 5s10.5 7 10.5 7-3.5 7-10.5 7S1.5 12 1.5 12Z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
)

const IconEyeOff = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"
    strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M3 3l18 18" />
    <path d="M10.6 5.1A10.9 10.9 0 0 1 12 5c7 0 10.5 7 10.5 7a13.5 13.5 0 0 1-3.15 4.15M6.5 6.5C3.4 8.3 1.5 12 1.5 12s3.5 7 10.5 7a10.6 10.6 0 0 0 4.2-.85" />
    <path d="M9.9 9.9a3 3 0 0 0 4.2 4.2" />
  </svg>
)

const IconShield = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"
    strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M12 3l7 3v6c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6l7-3Z" />
  </svg>
)

const IconBarChart = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"
    strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M4 20V10M12 20V4M20 20v-7" />
  </svg>
)

const IconHexagon = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"
    strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M12 2 21 7v10l-9 5-9-5V7l9-5Z" />
  </svg>
)

const IconInfo = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"
    strokeLinecap="round" strokeLinejoin="round" {...props}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 11v5M12 8h.01" />
  </svg>
)

const IconBox = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"
    strokeLinecap="round" strokeLinejoin="round" {...props}>
    <rect x="4" y="4" width="16" height="16" rx="5" />
  </svg>
)

function SignIn() {
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const { login, error } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const redirectTo = location.state?.from?.pathname || "/"

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      await login({ email, password })
      navigate(redirectTo, { replace: true })
    } catch {
    
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen w-full flex bg-white">
      
      {/* Left panel: narrower now so the form side can take more space */}
      <div className="hidden lg:flex lg:w-[40%] xl:w-[38%] relative bg-[#0b1120] text-white flex-col justify-between overflow-hidden px-12 py-14">
      

        <div>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600">
              <IconBox className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-lg font-bold leading-tight">
                Entouche<span className="text-blue-500"></span>
              </p>
              <p className="text-xs text-slate-400">Enterprise inventory management</p>
            </div>
          </div>

          
          <h1 className="mt-10 text-4xl font-bold leading-tight">
            Smarter inventory.
            <br />
            <span className="text-blue-500">Stronger business.</span>
          </h1>
          <p className="mt-5 max-w-sm text-sm text-slate-400">
            Entouche helps you track, manage and optimize your inventory
            across all locations in real time.
          </p>
        </div>

        {/* Hero illustration */}
        <div className="relative -mx-2 flex flex-1 items-center justify-center py-6">
          <img
            src={inventoryIllustration}
            alt="InventoryPro dashboard preview with a warehouse illustration"
            className="w-full max-w-md object-contain drop-shadow-2xl"
          />
        </div>

        
        <div className="relative grid grid-cols-3 gap-6 pt-4">
          <div>
            <IconShield className="h-5 w-5 text-blue-500" />
            <p className="mt-3 text-sm font-semibold">Secure &amp; reliable</p>
            <p className="mt-1 text-xs text-slate-400 leading-relaxed">
              Your data is protected with enterprise-grade security.
            </p>
          </div>
          <div>
            <IconBarChart className="h-5 w-5 text-blue-500" />
            <p className="mt-3 text-sm font-semibold">Real-time insights</p>
            <p className="mt-1 text-xs text-slate-400 leading-relaxed">
              Make informed decisions with live inventory visibility.
            </p>
          </div>
          <div>
            <IconHexagon className="h-5 w-5 text-blue-500" />
            <p className="mt-3 text-sm font-semibold">Designed for growth</p>
            <p className="mt-1 text-xs text-slate-400 leading-relaxed">
              Built to scale with your business operations effortlessly.
            </p>
          </div>
        </div>
      </div>

      
      {/* Right panel: now takes the remaining, larger share of the width */}
      <div className="flex flex-1 items-center justify-center px-6 py-12 sm:px-10 lg:px-16">
        <div className="w-full max-w-[420px]">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900">Welcome back</h2>
            <p className="mt-2 text-sm text-gray-500">
              Sign in to your Entouche account
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="mt-8 rounded-xl border border-gray-200 bg-white p-6 shadow-sm"
          >
            {error && (
              <div className="mb-5 rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-700">
                {error}
              </div>
            )}

           
            <label htmlFor="email" className="block text-sm font-medium text-gray-800">
              Email address
            </label>
            <div className="relative mt-1.5">
              <IconMail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address"
                className="w-full rounded-lg border border-gray-300 py-2.5 pl-10 pr-3 text-sm text-gray-700 placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>

           
            <label htmlFor="password" className="mt-5 block text-sm font-medium text-gray-800">
              Password
            </label>
            <div className="relative mt-1.5">
              <IconLock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full rounded-lg border border-gray-300 py-2.5 pl-10 pr-10 text-sm text-gray-700 placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <IconEyeOff className="h-4 w-4" /> : <IconEye className="h-4 w-4" />}
              </button>
            </div>

            
            <div className="mt-4 flex items-center justify-between">
              <label className="flex items-center gap-2 text-sm text-gray-700">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                Remember me
              </label>
              <a href="#" className="text-sm font-medium text-blue-600 hover:text-blue-700">
                Forgot password?
              </a>
            </div>

            
            <button
              type="submit"
              disabled={isSubmitting}
              className="mt-6 w-full rounded-lg bg-blue-600 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? "Signing in..." : "Sign in"}
            </button>
          </form>

         
          <p className="mt-5 flex items-center justify-center gap-1.5 text-xs text-gray-500">
            <IconShield className="h-3.5 w-3.5" />
            Your data is secure and encrypted
          </p>

          
          <div className="mt-4 flex items-start gap-3 rounded-lg border border-gray-200 bg-gray-50 p-4">
            <IconInfo className="mt-0.5 h-4 w-4 flex-shrink-0 text-gray-400" />
            <div>
              <p className="text-sm font-semibold text-gray-800">Need access?</p>
              <p className="text-sm text-gray-500">
                Please contact your system administrator.
              </p>
            </div>
          </div>

          <p className="mt-6 text-center text-xs text-gray-400">
            © {new Date().getFullYear()} InventoryPro. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  )
}

export default SignIn