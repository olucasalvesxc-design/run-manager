import React, { useState, useEffect } from 'react';
import { Link, useLocation, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { 
  LayoutDashboard, 
  User, 
  Settings, 
  LogOut, 
  Bell, 
  Search,
  Menu,
  X,
  Dumbbell,
  Calendar,
  Trophy,
  History,
  TrendingUp,
  CreditCard,
  MessageSquare,
  ClipboardList,
  ChevronRight,
  AlertCircle,
  Clock,
  Zap
} from 'lucide-react';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { collection, query, where, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';

const DashboardLayout = () => {
  const { user, profile, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);

  useEffect(() => {
    if (!user) return;
    const q = query(
      collection(db, 'notifications'),
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc'),
      limit(5)
    );
    return onSnapshot(q, (snap) => {
      setNotifications(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
  }, [user]);

  const isOrganizer = profile?.role === 'organizer' || profile?.role === 'admin';
  const isAdmin = profile?.role === 'admin';

  const navItems = isOrganizer ? [
    { label: 'Visão Geral', icon: LayoutDashboard, path: '/dashboard/overview' },
    { label: 'Corridas', icon: Trophy, path: '/dashboard/races' },
    { label: 'Consultorias', icon: MessageSquare, path: '/dashboard/trainer' },
    { label: 'Financeiro', icon: CreditCard, path: '/dashboard/finances' },
    { label: 'Configurações', icon: Settings, path: '/dashboard/settings' },
  ] : [
    { label: 'Início', icon: LayoutDashboard, path: '/dashboard/overview' },
    { label: 'Meus Treinos', icon: Dumbbell, path: '/dashboard/runner' },
    { label: 'Minhas Provas', icon: Trophy, path: '/dashboard/races' },
    { label: 'Meu Perfil', icon: User, path: '/dashboard/settings' },
  ];

  if (isAdmin) {
    navItems.splice(4, 0, { label: 'Admin Hub', icon: Zap, path: '/dashboard/admin' });
  }

  const MobileBottomNav = () => (
    <div className="lg:hidden fixed bottom-6 left-6 right-6 z-[60] bg-[#0B1220]/90 backdrop-blur-2xl border border-white/5 rounded-3xl p-4 flex items-center justify-around shadow-2xl">
      {navItems.slice(0, 4).map((item) => {
        const isActive = location.pathname === item.path;
        return (
          <Link 
            key={item.path}
            to={item.path}
            className={cn(
              "flex flex-col items-center gap-1 transition-all duration-300",
              isActive ? "text-[#3B82F6] scale-110" : "text-slate-500"
            )}
          >
            <item.icon className={cn("w-5 h-5", isActive ? "fill-current" : "")} />
            <span className="text-[8px] font-black uppercase tracking-widest">{item.label.split(' ')[0]}</span>
          </Link>
        );
      })}
    </div>
  );

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-[#05070A] text-white font-sans flex overflow-hidden">
      {/* Mobile Backdrop */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-50 w-72 bg-[#0A0D12] border-r border-white/5 transform transition-transform duration-300 ease-out lg:relative lg:translate-x-0 shadow-2xl flex flex-col",
        isSidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        {/* Sidebar Branding */}
        <div className="p-8 pb-12">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 bg-[#3B82F6] rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(59,130,246,0.3)] group-hover:scale-110 transition-transform">
              <Dumbbell className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-display font-black italic uppercase tracking-tighter">
              RUN<span className="text-[#3B82F6]">PRO</span>
            </span>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 space-y-2 overflow-y-auto">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setIsSidebarOpen(false)}
              className={cn(
                "flex items-center gap-4 px-6 py-4 rounded-2xl text-[10px] sm:text-xs font-black uppercase tracking-widest italic transition-all group relative overflow-hidden",
                location.pathname === item.path 
                  ? "bg-[#3B82F6] text-white shadow-[0_10px_20px_rgba(59,130,246,0.2)]" 
                  : "text-slate-500 hover:text-white hover:bg-white/5"
              )}
            >
              <item.icon className={cn(
                "w-5 h-5 transition-transform group-hover:scale-110",
                location.pathname === item.path ? "text-white" : "text-slate-600 group-hover:text-[#3B82F6]"
              )} />
              {item.label}
              {location.pathname === item.path && (
                <motion.div 
                  layoutId="activeNav"
                  className="absolute right-0 top-0 bottom-0 w-1.5 bg-white/20 rounded-l-full"
                />
              )}
            </Link>
          ))}
        </nav>

        {/* User Footer */}
        <div className="p-6 mt-auto border-t border-white/5">
           <div className="bg-black/40 rounded-3xl p-6 mb-4">
              <div className="flex items-center gap-4">
                 <div className="w-10 h-10 rounded-xl bg-[#3B82F6]/10 flex items-center justify-center text-[#3B82F6] font-display font-black italic">
                    {user?.email?.charAt(0).toUpperCase()}
                 </div>
                 <div className="flex-1 min-w-0 text-left">
                    <p className="text-[10px] font-black uppercase tracking-widest truncate">{profile?.runnerName || profile?.organizerName || user?.email?.split('@')[0]}</p>
                    <p className="text-[8px] font-bold text-[#3B82F6] uppercase tracking-widest truncate">{profile?.planStatus === 'trial' ? 'FREE TRIAL' : 'PREMIUM ACCESS'}</p>
                 </div>
              </div>
           </div>
           <button 
             onClick={handleSignOut}
             className="w-full flex items-center gap-4 px-6 py-4 text-slate-500 hover:text-[#EF4444] rounded-2xl hover:bg-red-500/5 transition-all text-xs font-black uppercase tracking-widest italic group"
           >
             <LogOut className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
             Desconectar
           </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Top Navbar */}
        <header className="h-20 sm:h-24 bg-[#05070A]/80 backdrop-blur-xl border-b border-white/5 flex items-center justify-between px-4 sm:px-10 z-30">
          <button 
            onClick={() => setIsSidebarOpen(true)}
            className="lg:hidden p-2 text-slate-400 hover:text-white transition-colors"
          >
            <Menu className="w-6 h-6" />
          </button>

          <div className="flex-1 hidden md:flex items-center ml-8 lg:ml-0">
            <div className="relative w-full max-w-md group">
               <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600 group-focus-within:text-[#3B82F6] transition-colors" />
               <input 
                 type="text" 
                 placeholder="BUSCAR TREINOS, PROVAS OU DICAS..."
                 className="w-full bg-white/5 border border-white/5 rounded-2xl pl-12 pr-6 py-3 text-[10px] font-black tracking-widest uppercase focus:outline-none focus:border-[#3B82F6]/50 transition-all placeholder:text-slate-700" 
               />
            </div>
          </div>

          <div className="flex items-center gap-3 sm:gap-6 ml-auto">
            <div className="relative">
              <button 
                onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors relative group"
              >
                <Bell className="w-5 h-5 text-slate-400 group-hover:text-white transition-colors" />
                {notifications.some(n => !n.read) && (
                  <span className="absolute top-2 right-2 w-2 h-2 bg-[#3B82F6] rounded-full shadow-[0_0_10px_#3B82F6]" />
                )}
              </button>

              <AnimatePresence>
                {isNotificationsOpen && (
                  <>
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      onClick={() => setIsNotificationsOpen(false)}
                      className="fixed inset-0 z-[60]"
                    />
                    <motion.div 
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute right-0 mt-4 w-80 sm:w-96 bg-[#11161D] border border-white/10 rounded-[2rem] shadow-[0_30px_60px_rgba(0,0,0,0.5)] z-[70] overflow-hidden"
                    >
                      <div className="p-6 border-b border-white/5 flex items-center justify-between">
                         <h4 className="text-xs font-black uppercase tracking-widest italic">Notificações</h4>
                         <button className="text-[10px] font-black uppercase text-[#3B82F6] hover:text-[#3B82F6]/80 transition-colors">Marcar Todas</button>
                      </div>
                      <div className="max-h-[400px] overflow-y-auto divide-y divide-white/5">
                        {notifications.length === 0 ? (
                           <div className="p-12 text-center">
                              <Bell className="w-8 h-8 text-slate-800 mx-auto mb-4" />
                              <p className="text-[10px] font-black text-slate-700 uppercase tracking-widest italic">Nada por aqui hoje.</p>
                           </div>
                        ) : (
                          notifications.map(n => (
                            <div key={n.id} className="p-6 hover:bg-white/5 transition-colors cursor-pointer relative group">
                               {!n.read && <div className="absolute top-0 left-0 w-1 h-full bg-[#3B82F6] shadow-[0_0_15px_rgba(59,130,246,0.5)]" />}
                               <div className="flex gap-4">
                                  <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center shrink-0">
                                     <AlertCircle className="w-4 h-4 text-[#3B82F6]" />
                                  </div>
                                  <div className="space-y-1">
                                     <p className="text-xs font-bold leading-tight text-white">{n.title || 'Nova Notificação'}</p>
                                     <p className="text-[10px] font-medium text-slate-500 line-clamp-2">{n.message}</p>
                                     <div className="flex items-center gap-2 pt-2">
                                        <Clock className="w-3 h-3 text-slate-700" />
                                        <span className="text-[8px] font-black text-slate-700 uppercase tracking-tighter italic">2h atrás</span>
                                        {!n.read && <span className="w-1.5 h-1.5 rounded-full bg-[#3B82F6] shadow-[0_0_8px_rgba(59,130,246,0.6)]" />}
                                     </div>
                                  </div>
                               </div>
                            </div>
                          ))
                        )}
                      </div>
                      <Link 
                        to="/dashboard/notifications" 
                        className="block w-full p-5 text-center text-[10px] font-black uppercase tracking-[0.2em] italic text-slate-500 hover:text-white bg-white/5 hover:bg-white/10 transition-all"
                      >
                         Ver Todo Histórico
                      </Link>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>

            <div className="h-10 w-px bg-white/5 hidden sm:block" />

            <div className="flex items-center gap-3">
               <div className="text-right hidden sm:block">
                  <p className="text-[10px] font-black uppercase tracking-widest">{user?.email?.split('@')[0]}</p>
                  <p className="text-[8px] font-bold text-[#3B82F6] uppercase tracking-widest">Nível Elite</p>
               </div>
               <Link 
                to="/dashboard/profile"
                className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-[#3B82F6] to-blue-700 p-[1px] group"
              >
                <div className="w-full h-full rounded-xl bg-[#05070A] flex items-center justify-center overflow-hidden group-hover:scale-95 transition-transform">
                   <User className="w-5 h-5 text-white/50" />
                </div>
              </Link>
            </div>
          </div>
        </header>

        {/* Dynamic Page Content */}
        <main className="flex-1 overflow-y-auto bg-gradient-to-b from-[#05070A] to-[#0A0D12] custom-scrollbar relative">
          <div className="p-4 sm:p-10 lg:p-14 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-28 lg:pb-14">
            <Outlet />
          </div>
          <MobileBottomNav />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
