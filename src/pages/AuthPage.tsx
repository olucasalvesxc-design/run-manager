import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  updateProfile,
  signInWithPopup,
  GoogleAuthProvider
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { useAuth } from '../hooks/useAuth';
import { Zap, Loader2, ArrowLeft, Mail } from 'lucide-react';

interface AuthPageProps {
  mode: 'login' | 'register';
  role?: 'athlete' | 'organizer';
}

const AuthPage: React.FC<AuthPageProps> = ({ mode, role }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<React.ReactNode | null>(null);
  const navigate = useNavigate();
  const { user, profile, loading: authLoading } = useAuth();

  // Redirect if already logged in
  React.useEffect(() => {
    if (!authLoading && user && profile) {
      if (profile.role === 'organizer' || profile.organizerName) {
        navigate('/organizer/dashboard');
      } else {
        navigate('/athlete/dashboard');
      }
    }
  }, [user, profile, authLoading, navigate]);

  const generateAthleteCode = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (mode === 'register') {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(userCredential.user, { displayName: name });
        
      // Create profile with specific role
      const profileData: any = {
        email,
        role: role || 'athlete',
        athleteCode: generateAthleteCode(),
        createdAt: new Date().toISOString()
      };

      if (role === 'organizer') {
        profileData.organizerName = name;
      } else {
        profileData.runnerName = name;
      }

      await setDoc(doc(db, 'profiles', userCredential.user.uid), profileData);

        // Initial redirect after register
        navigate(role === 'organizer' ? '/organizer/dashboard' : '/athlete/dashboard');
      } else {
        await signInWithEmailAndPassword(auth, email, password);
        
        // Fetch profile to redirect based on role
        const profileSnap = await getDoc(doc(db, 'profiles', auth.currentUser!.uid));
        if (profileSnap.exists()) {
          const profileData = profileSnap.data();
          if (profileData.role === 'organizer' || profileData.organizerName) {
             navigate('/organizer/dashboard');
          } else {
             navigate('/athlete/dashboard');
          }
        } else {
          navigate('/athlete/dashboard'); // Fallback
        }
      }
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/operation-not-allowed') {
        const projectId = auth.app.options.projectId;
        setError(
          <div className="flex flex-col gap-2">
            <p>O método de login por e-mail/senha não está ativado no projeto "<strong>{projectId}</strong>".</p>
            <p>Ative-o no Console do Firebase:</p>
            <a 
              href={`https://console.firebase.google.com/project/${projectId}/authentication/providers`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-white underline font-bold"
            >
              Abrir Configurações de Autenticação
            </a>
          </div>
        );
      } else if (err.code === 'auth/email-already-in-use') {
        setError(
          <div className="flex flex-col gap-1">
            <p>Este e-mail já está em uso por outro usuário.</p>
            <Link to="/login" className="text-white underline font-bold">Ir para o Login</Link>
          </div>
        );
      } else if (err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password' || err.code === 'auth/user-not-found') {
        setError(
          <div className="flex flex-col gap-1">
            <p>E-mail ou senha incorretos.</p>
            <p className="text-xs opacity-80 mt-1">Se o projeto foi reiniciado recentemente, você pode precisar criar sua conta novamente.</p>
            <Link to="/signup" className="text-white underline font-bold mt-1">Criar nova conta</Link>
          </div>
        );
      } else if (err.code === 'auth/weak-password') {
        setError('A senha é muito fraca. Ela deve ter pelo menos 6 caracteres.');
      } else {
        setError(err.message || 'Ocorreu um erro inesperado. Por favor, tente novamente.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError(null);
    const provider = new GoogleAuthProvider();
    
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      // Check if profile exists, if not create it
      const docRef = doc(db, 'profiles', user.uid);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        const profileData: any = {
          email: user.email,
          role: role || 'athlete',
          athleteCode: generateAthleteCode(),
          createdAt: new Date().toISOString()
        };

        const displayName = user.displayName || (role === 'organizer' ? 'Organizador' : 'Atleta');

        if (role === 'organizer') {
          profileData.organizerName = displayName;
        } else {
          profileData.runnerName = displayName;
        }

        await setDoc(docRef, profileData);
        navigate(role === 'organizer' ? '/organizer/dashboard' : '/athlete/dashboard');
      } else {
        const profileData = docSnap.data();
        if (profileData.role === 'organizer' || profileData.organizerName) {
          navigate('/organizer/dashboard');
        } else {
          navigate('/athlete/dashboard');
        }
      }
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/operation-not-allowed') {
        const projectId = auth.app.options.projectId;
        setError(
          <div className="flex flex-col gap-2">
            <p>O login via Google não está habilitado no Console do Firebase para o projeto "<strong>{projectId}</strong>".</p>
            <p>Ative-o em Authentication &gt; Sign-in method.</p>
            <a 
              href={`https://console.firebase.google.com/project/${projectId}/authentication/providers`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-white underline font-bold"
            >
              Abrir Painel de Autenticação
            </a>
          </div>
        );
      } else if (err.code === 'auth/popup-closed-by-user') {
        console.log('Login popup closed by user');
        return;
      } else if (err.code === 'auth/account-exists-with-different-credential') {
        setError('Já existe uma conta com este e-mail, mas vinculada a outro método de login.');
      } else {
        setError(err.message || 'Falha ao autenticar com o Google. Tente novamente.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-yellow-400/5 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-yellow-400/5 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2"></div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="text-center mb-6 sm:mb-10 px-4">
          <Link to="/" className="inline-flex items-center gap-2 mb-6 sm:mb-8 group">
             <img src="/logo-opt.png" alt="RunManager" className="w-8 h-8 sm:w-10 sm:h-10 object-contain group-hover:scale-110 transition-transform duration-300" />
             <span className="text-xl sm:text-2xl font-display font-bold tracking-tight">RunManager</span>
          </Link>
          <h2 className="text-2xl sm:text-3xl font-display font-black italic uppercase tracking-tighter">
            {mode === 'login' ? 'Bem-vindo de volta' : `Cadastro ${role === 'organizer' ? 'Organizador' : 'Atleta'}`}
          </h2>
          <p className="text-slate-400 mt-2 text-xs sm:text-sm font-medium italic">
            {mode === 'login' 
              ? 'Acesse seu painel exclusivo' 
              : `Crie sua conta de ${role === 'organizer' ? 'organizador' : 'atleta'} e comece agora`}
          </p>
        </div>

        <div className="bg-slate-900/50 backdrop-blur-xl border border-white/5 p-6 sm:p-8 rounded-[2rem] sm:rounded-[2.5rem] shadow-2xl mx-4 sm:mx-0">
          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
            {mode === 'register' && (
              <div className="space-y-2">
                <label className="block text-[8px] sm:text-[10px] font-black text-slate-500 uppercase tracking-widest italic ml-2">Nome Completo</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-950 border border-white/5 rounded-xl sm:rounded-2xl px-5 sm:px-6 py-3.5 sm:py-4 focus:outline-none focus:border-yellow-400/50 transition-all font-medium text-sm"
                  placeholder="Seu nome"
                />
              </div>
            )}
            <div className="space-y-2">
              <label className="block text-[8px] sm:text-[10px] font-black text-slate-500 uppercase tracking-widest italic ml-2">E-mail</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-950 border border-white/5 rounded-xl sm:rounded-2xl px-5 sm:px-6 py-3.5 sm:py-4 focus:outline-none focus:border-yellow-400/50 transition-all font-medium text-sm"
                placeholder="exemplo@email.com"
              />
            </div>
            <div className="space-y-2">
              <label className="block text-[8px] sm:text-[10px] font-black text-slate-500 uppercase tracking-widest italic ml-2">Senha</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-950 border border-white/5 rounded-xl sm:rounded-2xl px-5 sm:px-6 py-3.5 sm:py-4 focus:outline-none focus:border-yellow-400/50 transition-all font-medium text-sm"
                placeholder="••••••••"
              />
            </div>

            {error && (
              <div className="bg-yellow-400/10 border border-yellow-400/20 text-yellow-400 px-5 sm:px-6 py-3 sm:py-4 rounded-xl sm:rounded-2xl text-[8px] sm:text-[10px] font-black uppercase tracking-widest italic">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-yellow-400 text-black py-4 sm:py-5 rounded-xl sm:rounded-2xl font-black italic uppercase text-[10px] sm:text-xs tracking-[0.2em] flex items-center justify-center gap-3 hover:bg-yellow-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed group shadow-[0_20px_40px_-10px_rgba(250,204,21,0.3)]"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                <>
                  <Mail className="w-4 h-4 sm:w-5 sm:h-5" />
                  {mode === 'login' ? 'Entrar Agora' : 'Finalizar'}
                </>
              )}
            </button>

            <div className="relative py-2 sm:py-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/5"></div>
              </div>
              <div className="relative flex justify-center text-[7px] sm:text-[8px] uppercase tracking-[0.3em] font-black text-slate-500 italic">
                <span className="bg-slate-950 px-3">Ou continue com</span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="w-full bg-white text-slate-950 py-4 sm:py-5 rounded-xl sm:rounded-2xl font-black italic uppercase text-[10px] sm:text-xs tracking-[0.2em] flex items-center justify-center gap-3 hover:bg-slate-100 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-xl"
            >
              <svg className="w-4 h-4 sm:w-5 sm:h-5" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Google
            </button>
          </form>

          <div className="mt-8 text-center text-slate-500 text-[10px] font-black uppercase tracking-widest italic">
            {mode === 'login' ? (
              <>
                Não tem uma conta?{' '}
                <Link to="/signup" className="text-yellow-400 hover:underline">Cadastre-se</Link>
              </>
            ) : (
              <>
                Já tem uma conta?{' '}
                <Link to="/login" className="text-yellow-400 hover:underline">Faça login</Link>
              </>
            )}
          </div>
        </div>

        <Link to="/" className="flex items-center gap-2 text-slate-600 hover:text-white transition-colors mt-8 mx-auto w-fit text-[10px] font-black uppercase tracking-widest italic">
           <ArrowLeft className="w-4 h-4" />
           Voltar para o Início
        </Link>
      </motion.div>
    </div>
  );
};

export default AuthPage;
