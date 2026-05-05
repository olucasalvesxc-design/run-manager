import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { 
  Mail, 
  Lock, 
  ArrowRight, 
  Dumbbell, 
  Loader2, 
  ShieldCheck, 
  AlertCircle,
  Zap,
  User,
  ArrowBigRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const AuthPage = () => {
  const { signIn, signUp, signInWithGoogle } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const isLogin = location.pathname === '/login';
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      if (isLogin) {
        await signIn(formData.email, formData.password);
      } else {
        await signUp(formData.email, formData.password, formData.name);
      }
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message === 'Firebase: Error (auth/invalid-credential).' ? 'E-mail ou senha incorretos.' : 'Erro na autenticação. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      await signInWithGoogle();
      navigate('/dashboard');
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#05070A] text-white flex flex-col items-center justify-center p-6 font-sans overflow-hidden">
      {/* Background Decor */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#3B82F6]/5 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#3B82F6]/5 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="text-center mb-12">
           <Link to="/" className="inline-flex items-center gap-3 group mb-10">
             <div className="w-10 h-10 sm:w-12 sm:h-12 bg-[#3B82F6] rounded-xl flex items-center justify-center transform group-hover:rotate-12 transition-transform duration-300 shadow-[0_0_20px_rgba(59,130,246,0.3)]">
               <Dumbbell className="w-6 h-6 text-white" />
             </div>
             <span className="text-2xl sm:text-3xl font-display font-black italic uppercase tracking-tighter">
               RUN<span className="text-[#3B82F6]">PRO</span>
             </span>
           </Link>
           <h1 className="text-4xl sm:text-5xl font-display font-black italic uppercase tracking-tighter mb-4 text-white">
             {isLogin ? 'Welcome Back.' : 'Join the Lab.'}
           </h1>
           <p className="text-slate-500 font-black uppercase tracking-widest italic text-[10px] sm:text-xs">
             {isLogin ? 'Acesse seu painel de performance de elite.' : 'Crie sua conta e comece sua evolução profissional.'}
           </p>
        </div>

        <div className="bg-[#11161D] rounded-[2.5rem] sm:rounded-[3rem] p-8 sm:p-12 border border-white/5 shadow-2xl relative">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#3B82F6] to-transparent" />
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <AnimatePresence>
                {error && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="bg-red-500/10 border border-red-500/20 text-red-500 px-6 py-4 rounded-2xl flex items-center gap-3 text-[10px] font-black uppercase tracking-widest italic"
                  >
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    {error}
                  </motion.div>
                )}
              </AnimatePresence>

              {!isLogin && (
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic ml-2">Nome Completo</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-700" />
                    <input 
                      required
                      type="text"
                      value={formData.name}
                      onChange={e => setFormData({...formData, name: e.target.value})}
                      placeholder="COMO QUER SER CHAMADO"
                      className="w-full bg-black/40 border-2 border-white/5 rounded-2xl px-12 py-4 focus:outline-none focus:border-[#3B82F6]/50 transition-all font-bold italic uppercase text-xs sm:text-sm tracking-widest text-white"
                    />
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic ml-2">E-mail Profissional</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-700" />
                  <input 
                    required
                    type="email"
                    value={formData.email}
                    onChange={e => setFormData({...formData, email: e.target.value})}
                    placeholder="atleta@runpro.com"
                    className="w-full bg-black/40 border-2 border-white/5 rounded-2xl px-12 py-4 focus:outline-none focus:border-[#3B82F6]/50 transition-all font-bold italic uppercase text-xs sm:text-sm tracking-widest text-white"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic ml-2">Sua Senha</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-700" />
                  <input 
                    required
                    type="password"
                    value={formData.password}
                    onChange={e => setFormData({...formData, password: e.target.value})}
                    placeholder="••••••••"
                    className="w-full bg-black/40 border-2 border-white/5 rounded-2xl px-12 py-4 focus:outline-none focus:border-[#3B82F6]/50 transition-all font-bold italic text-white"
                  />
                </div>
              </div>

              <button 
                type="submit"
                disabled={loading}
                className="w-full bg-[#3B82F6] text-white py-5 rounded-2xl sm:rounded-[2rem] font-black italic uppercase text-[10px] sm:text-xs tracking-[0.2em] flex items-center justify-center gap-3 hover:bg-blue-600 transition-all disabled:opacity-50 group shadow-[0_20px_40px_-10px_rgba(59,130,246,0.3)] font-bold"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <ShieldCheck className="w-5 h-5" />}
                {isLogin ? 'Entrar no Sistema' : 'Criar Perfil Elite'}
              </button>

              <div className="relative py-4">
                 <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-white/5"></div>
                 </div>
                 <div className="relative flex justify-center text-[8px] font-black uppercase tracking-widest">
                    <span className="bg-[#11161D] px-4 text-slate-700">Ou continue com</span>
                 </div>
              </div>

              <button 
                type="button"
                onClick={handleGoogleLogin}
                className="w-full bg-white/5 border border-white/10 text-white py-5 rounded-2xl font-black italic uppercase text-[10px] tracking-widest flex items-center justify-center gap-3 hover:bg-white/10 transition-all"
              >
                <img src="https://www.google.com/favicon.ico" className="w-4 h-4 grayscale opacity-50 contrast-150" alt="Google" />
                Google Authenticator
              </button>
            </form>
        </div>

        <div className="mt-10 text-center space-y-4">
           <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest italic">
              {isLogin ? "Não tem uma conta?" : "Já possui perfil?"}
              <Link to={isLogin ? "/signup/select" : "/login"} className="text-[#3B82F6] hover:underline ml-2">
                 {isLogin ? 'Criar Nova' : 'Fazer Login'}
              </Link>
           </p>
        </div>
      </motion.div>
    </div>
  );
};

export default AuthPage;
