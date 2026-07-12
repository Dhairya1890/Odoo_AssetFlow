import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import toast from 'react-hot-toast';
import { Box, Building2, ShieldCheck } from 'lucide-react';

export default function Login() {
  const [view, setView] = useState('login');
  
  // Login State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // Signup State (Mock for now since no backend endpoint was specified for it)
  const [signupName, setSignupName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupConfirm, setSignupConfirm] = useState('');

  const navigate = useNavigate();
  const location = useLocation();
  const { login, isLoading, error } = useAuthStore();

  const from = location.state?.from?.pathname || '/dashboard';

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) return toast.error('Please enter both email and password');
    
    const success = await login(email, password);
    if (success) {
      toast.success('Successfully authenticated');
      navigate(from, { replace: true });
    }
  };

  const handleSignupSubmit = (e) => {
    e.preventDefault();
    toast.error('Signup functionality coming soon!');
  };

  const toggleAuth = (newView) => {
    setView(newView);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-background relative overflow-hidden text-on-surface font-sans">
      {/* Subtle Background Detail (Non-image decorative element) */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden opacity-30">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] rounded-full bg-secondary-container blur-[120px]" />
        <div className="absolute -bottom-[10%] -right-[10%] w-[40%] h-[40%] rounded-full bg-primary-fixed blur-[120px]" />
      </div>

      {/* Login Section */}
      <main 
        className={`w-full max-w-[400px] z-10 transition-all duration-300 transform ${view === 'login' ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2 pointer-events-none hidden'}`}
      >
        <div className="bg-surface-container-lowest hairline-border rounded-card p-8 flex flex-col gap-8 shadow-sm">
          <div className="flex flex-col items-center gap-2">
            <div className="w-12 h-12 bg-primary flex items-center justify-center rounded-lg mb-2">
              <Box className="text-white w-7 h-7" />
            </div>
            <h1 className="text-xl font-medium text-on-surface tracking-tight">AssetFlow</h1>
            <p className="text-sm text-on-surface-variant">Sign in to manage your ecosystem</p>
          </div>

          <form className="flex flex-col gap-5" onSubmit={handleLoginSubmit}>
            <div className="flex flex-col gap-1.5 group">
              <label className="text-sm font-medium text-on-surface-variant" htmlFor="login-email">Email address</label>
              <input 
                id="login-email"
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2.5 bg-surface-container-low hairline-border rounded-lg text-sm text-on-surface focus:outline-none focus:border-primary transition-all group-focus-within:scale-[1.01]" 
                placeholder="name@company.com" 
              />
            </div>
            <div className="flex flex-col gap-1.5 text-right group">
              <div className="flex justify-between items-center">
                <label className="text-sm font-medium text-on-surface-variant" htmlFor="login-password">Password</label>
                <a className="text-xs font-medium text-on-secondary-container hover:underline" href="#">Forgot password?</a>
              </div>
              <input 
                id="login-password"
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2.5 bg-surface-container-low hairline-border rounded-lg text-sm text-on-surface focus:outline-none focus:border-primary transition-all group-focus-within:scale-[1.01]" 
                placeholder="••••••••" 
              />
            </div>
            
            {error && (
              <div className="text-red-600 text-sm bg-red-50 border border-red-100 p-3 rounded-lg text-center">
                {error}
              </div>
            )}

            <button 
              type="submit"
              disabled={isLoading}
              className="w-full bg-primary text-on-primary py-3 rounded-lg text-sm font-medium hover:bg-on-surface-variant transition-all mt-2 active:scale-[0.98] disabled:opacity-70 flex justify-center items-center h-[46px]"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                'Sign in'
              )}
            </button>
          </form>

          <div className="flex flex-col items-center gap-4">
            <div className="w-full flex items-center gap-4">
              <div className="flex-1 hairline-border border-t"></div>
              <span className="text-xs font-medium text-outline">or</span>
              <div className="flex-1 hairline-border border-t"></div>
            </div>
            <p className="text-sm text-on-surface-variant">
              New to AssetFlow?{' '}
              <button className="text-primary font-medium hover:underline" onClick={() => toggleAuth('signup')}>Create an account</button>
            </p>
          </div>
        </div>
        <footer className="mt-8 flex justify-center gap-6 opacity-60">
          <a className="text-xs font-medium text-on-surface-variant hover:text-on-surface" href="#">Terms</a>
          <a className="text-xs font-medium text-on-surface-variant hover:text-on-surface" href="#">Privacy</a>
          <a className="text-xs font-medium text-on-surface-variant hover:text-on-surface" href="#">Help</a>
        </footer>
      </main>

      {/* Signup Section */}
      <main 
        className={`w-full max-w-[440px] z-10 transition-all duration-300 transform ${view === 'signup' ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2 pointer-events-none hidden'}`}
      >
        <div className="bg-surface-container-lowest hairline-border rounded-card p-8 flex flex-col gap-8 shadow-sm">
          <div className="flex flex-col items-center gap-2">
            <div className="w-12 h-12 bg-primary flex items-center justify-center rounded-lg mb-2">
              <Building2 className="text-white w-7 h-7" />
            </div>
            <h1 className="text-xl font-medium text-on-surface tracking-tight">Create your account</h1>
            <p className="text-sm text-on-surface-variant">Join 2,000+ organizations scaling with AssetFlow</p>
          </div>

          <form className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-5" onSubmit={handleSignupSubmit}>
            <div className="flex flex-col gap-1.5 md:col-span-2 group">
              <label className="text-sm font-medium text-on-surface-variant" htmlFor="signup-name">Full name</label>
              <input 
                id="signup-name"
                type="text" 
                value={signupName}
                onChange={(e) => setSignupName(e.target.value)}
                className="w-full px-4 py-2.5 bg-surface-container-low hairline-border rounded-lg text-sm text-on-surface focus:outline-none focus:border-primary transition-all group-focus-within:scale-[1.01]" 
                placeholder="John Doe" 
              />
            </div>
            <div className="flex flex-col gap-1.5 md:col-span-2 group">
              <label className="text-sm font-medium text-on-surface-variant" htmlFor="signup-email">Work email</label>
              <input 
                id="signup-email"
                type="email" 
                value={signupEmail}
                onChange={(e) => setSignupEmail(e.target.value)}
                className="w-full px-4 py-2.5 bg-surface-container-low hairline-border rounded-lg text-sm text-on-surface focus:outline-none focus:border-primary transition-all group-focus-within:scale-[1.01]" 
                placeholder="john@company.com" 
              />
            </div>
            <div className="flex flex-col gap-1.5 group">
              <label className="text-sm font-medium text-on-surface-variant" htmlFor="signup-password">Password</label>
              <input 
                id="signup-password"
                type="password" 
                value={signupPassword}
                onChange={(e) => setSignupPassword(e.target.value)}
                className="w-full px-4 py-2.5 bg-surface-container-low hairline-border rounded-lg text-sm text-on-surface focus:outline-none focus:border-primary transition-all group-focus-within:scale-[1.01]" 
                placeholder="••••••••" 
              />
            </div>
            <div className="flex flex-col gap-1.5 group">
              <label className="text-sm font-medium text-on-surface-variant" htmlFor="signup-confirm">Confirm password</label>
              <input 
                id="signup-confirm"
                type="password" 
                value={signupConfirm}
                onChange={(e) => setSignupConfirm(e.target.value)}
                className="w-full px-4 py-2.5 bg-surface-container-low hairline-border rounded-lg text-sm text-on-surface focus:outline-none focus:border-primary transition-all group-focus-within:scale-[1.01]" 
                placeholder="••••••••" 
              />
            </div>
            <div className="md:col-span-2 mt-2">
              <button 
                type="submit" 
                className="w-full bg-primary text-on-primary py-3 rounded-lg text-sm font-medium hover:bg-on-surface-variant transition-all active:scale-[0.98] h-[46px]"
              >
                Create account
              </button>
            </div>
          </form>

          <div className="flex flex-col items-center gap-4">
            <p className="text-sm text-on-surface-variant text-center">
              By signing up, you agree to our{' '}
              <a className="text-primary font-medium hover:underline" href="#">Terms of Service</a>
            </p>
            <div className="w-full hairline-border border-t"></div>
            <p className="text-sm text-on-surface-variant">
              Already have an account?{' '}
              <button className="text-primary font-medium hover:underline" onClick={() => toggleAuth('login')}>Log in</button>
            </p>
          </div>
        </div>
        <footer className="mt-8 flex justify-center gap-6 opacity-60">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-on-surface-variant" />
            <span className="text-xs font-medium text-on-surface-variant">SOC2 Type II Certified</span>
          </div>
        </footer>
      </main>
    </div>
  );
}

