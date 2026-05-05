import React, { useEffect, useState } from 'react';
import { Link, useNavigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { auth, db } from '../lib/firebase';
import { doc, getDoc, onSnapshot, query, collection, where, orderBy, updateDoc, writeBatch } from 'firebase/firestore';
import { 
  Trophy, 
  LayoutDashboard, 
  Plus, 
  Settings, 
  LogOut, 
  Zap, 
  ChevronRight,
  Menu,
  X,
  Bell,
  Check,
  Trash2,
  AlertCircle,
  Dumbbell,
  ShieldCheck,
  Activity as ActivityIcon
} from 'lucide-react';
import { cn, formatDate, handleFirestoreError, OperationType } from '../lib/utils';
import { AnimatePresence, motion } from 'motion/react';

const DashboardLayout = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const [profile, setProfile] = useState<any | null>(null);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notificationFilter, setNotificationFilter] = useState<'all' | 'unread'>('unread');

  useEffect(() => {
    if (!user) return;
    const profileRef = doc(db, 'profiles', user.uid);
    const unsubProfile = onSnapshot(profileRef, (snap) => {
      if (snap.exists()) {
        setProfile(snap.data());
      }
    });

    const notifQuery = query(
      collection(db, 'notifications'),
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc')
    );
    const unsubNotifs = onSnapshot(notifQuery, (snap) => {
      setNotifications(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    return () => {
      unsubProfile();
      unsubNotifs();
    };
  }, [user]);

  const unreadCount = notifications.filter(n => !n.read).length;
  const filteredNotifications = notificationFilter === 'all' 
    ? notifications 
    : notifications.filter(n => !n.read);

  const isAdmin = user?.email?.toLowerCase() === 'lukas.alvesr7@gmail.com';

  const markAsRead = async (notifId: string) => {
    try {
      await updateDoc(doc(db, 'notifications', notifId), { read: true });
    } catch (err) {
      console.error('Error marking notification as read:', err);
    }
  };

  const markAllAsRead = async () => {
    const unread = notifications.filter(n => !n.read);
    if (unread.length === 0) return;
    
    try {
      const batch = writeBatch(db);
      unread.forEach(n => {
        batch.update(doc(db, 'notifications', n.id), { read: true });
      });
      await batch.commit();
    } catch (err) {
      console.error('Error marking all as read:', err);
    }
  };

  const handleLogout = async () => {
    await auth.signOut();
    navigate('/');
  };

  const navItems = [];
  const userRole = profile?.role || (profile?.organizerName ? 'organizer' : 'athlete');
  const profilePath = userRole === 'organizer' ? '/organizer/settings' : '/athlete/profile';

  if (userRole === 'organizer') {
    navItems.push(
      { label: 'Painel Geral', icon: <LayoutDashboard className="w-5 h-5" />, path: '/organizer/dashboard' },
      { label: 'Criar Corrida', icon: <Plus className="w-5 h-5 text-yellow-400" />, path: '/organizer/races/create' },
      { label: 'Minhas Corridas', icon: <Trophy className="w-5 h-5" />, path: '/organizer/races' },
      { label: 'Inscritos', icon: <Bell className="w-5 h-5" />, path: '/organizer/registrations' },
      { label: 'Consultoria e Treinos', icon: <Dumbbell className="w-5 h-5" />, path: '/organizer/training-consulting' },
      { label: 'Financeiro e Pix', icon: <Trophy className="w-5 h-5" />, path: '/organizer/finance' },
      { label: 'Meu Plano', icon: <Zap className="w-5 h-5 text-yellow-400" />, path: '/organizer/plans' },
      { label: 'Configurações', icon: <Settings className="w-5 h-5" />, path: '/organizer/settings' }
    );
  } else {
    navItems.push(
      { label: 'Meu Painel', icon: <LayoutDashboard className="w-5 h-5" />, path: '/athlete/dashboard' },
      { label: 'Minhas Corridas', icon: <Trophy className="w-5 h-5" />, path: '/athlete/races' },
      { label: 'Meus Treinos', icon: <ActivityIcon className="w-5 h-5 text-yellow-400" />, path: '/athlete/trainings' },
      { label: 'Consultorias', icon: <Dumbbell className="w-5 h-5" />, path: '/athlete/consulting' },
      { label: 'Perfil', icon: <Settings className="w-5 h-5" />, path: '/athlete/profile' }
    );
  }

  if (isAdmin) {
    navItems.unshift({ label: 'Master Panel', icon: <ShieldCheck className="w-5 h-5 text-yellow-400" />, path: '/admin' });
  }

  const NavItem = ({ item }: { item: any, key?: React.Key }) => (
    <Link
      to={item.path}
      onClick={() => console.log('[Nav] click →', item.path)}
      className={cn(
        "flex items-center gap-3 px-5 py-3.5 rounded-2xl font-bold transition-all group border border-transparent",
        location.pathname === item.path 
          ? "bg-white/5 text-yellow-400 border-white/10 shadow-xl" 
          : "text-slate-500 hover:text-white hover:bg-white/5"
      )}
    >
      <div className={cn(
        "p-2 rounded-lg transition-colors",
        location.pathname === item.path ? "bg-yellow-400/10" : "bg-slate-900 group-hover:bg-slate-800"
      )}>
        {React.cloneElement(item.icon as React.ReactElement, { className: "w-4 h-4" })}
      </div>
      <span className="text-sm tracking-tight">{item.label}</span>
      {location.pathname === item.path && (
        <motion.div 
          layoutId="active-pill"
          className="w-1 h-4 bg-yellow-400 rounded-full ml-auto"
        />
      )}
    </Link>
  );

  const NotificationsPanel = ({ isMobile = false }) => (
    <motion.div
      initial={isMobile ? { opacity: 0, y: 10 } : { opacity: 0, scale: 0.9 }}
      animate={isMobile ? { opacity: 1, y: 0 } : { opacity: 1, scale: 1 }}
      exit={isMobile ? { opacity: 0, y: 10 } : { opacity: 0, scale: 0.9 }}
      className={cn(
        "bg-slate-900 border border-white/10 rounded-[2.5rem] z-[100] overflow-hidden shadow-[0_50px_100px_-20px_rgba(0,0,0,0.8)]",
        isMobile ? "fixed top-20 right-4 left-4 max-h-[70vh] w-auto" : "fixed left-[296px] top-24 w-80 max-h-[600px] flex flex-col"
      )}
    >
      <div className="p-6 border-b border-white/5 space-y-4 shrink-0 bg-slate-900">
         <div className="flex items-center justify-between">
            <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 italic">Notificações</h4>
            {unreadCount > 0 && (
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  markAllAsRead();
                }} 
                className="text-[10px] font-black uppercase text-yellow-400 hover:text-yellow-300 transition-colors"
              >
                Marcar Todas
              </button>
            )}
         </div>
         <div className="flex bg-black/40 p-1.5 rounded-2xl border border-white/5">
            <button 
              onClick={(e) => {
                e.stopPropagation();
                setNotificationFilter('unread');
              }}
              className={cn(
                "flex-1 py-1.5 text-[9px] font-black uppercase tracking-widest rounded-xl transition-all",
                notificationFilter === 'unread' ? "bg-slate-800 text-white shadow-lg" : "text-slate-500 hover:text-slate-400"
              )}
            >
               Não Lidas
            </button>
            <button 
              onClick={(e) => {
                e.stopPropagation();
                setNotificationFilter('all');
              }}
              className={cn(
                "flex-1 py-1.5 text-[9px] font-black uppercase tracking-widest rounded-xl transition-all",
                notificationFilter === 'all' ? "bg-slate-800 text-white shadow-lg" : "text-slate-500 hover:text-slate-400"
              )}
            >
               Todas
            </button>
         </div>
      </div>
      <div className="overflow-y-auto custom-scrollbar p-3 space-y-1 flex-1">
         {filteredNotifications.length === 0 ? (
           <div className="py-16 text-center">
              <div className="w-12 h-12 bg-slate-800/50 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-white/5">
                <Bell className="w-6 h-6 text-slate-700" />
              </div>
              <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest leading-relaxed">
                {notificationFilter === 'unread' ? 'Tudo limpo por aqui!' : 'Silêncio total...'}
              </p>
           </div>
         ) : (
           filteredNotifications.map((n) => (
             <motion.div 
               layout
               initial={{ opacity: 0, y: 10 }}
               animate={{ opacity: 1, y: 0 }}
               key={n.id} 
               onClick={(e) => {
                 e.stopPropagation();
                 markAsRead(n.id);
               }}
               className={cn(
                 "p-4 rounded-3xl cursor-pointer transition-all border group relative overflow-hidden",
                 !n.read ? "bg-white/5 border-white/10" : "bg-transparent border-transparent opacity-50 hover:opacity-100 hover:bg-white/5"
               )}
             >
                {!n.read && <div className="absolute top-0 left-0 w-1 h-full bg-yellow-400" />}
                <div className="flex items-start gap-4">
                   <div className="w-9 h-9 rounded-xl bg-slate-800 flex items-center justify-center shrink-0 border border-white/5">
                      <AlertCircle className="w-4 h-4 text-yellow-400" />
                   </div>
                   <div className="flex-1 min-w-0">
                      <div className="text-[10px] font-black text-white uppercase italic mb-1 truncate">{n.title}</div>
                      <p className="text-[10px] text-slate-400 font-medium leading-tight line-clamp-2 mb-2">{n.message}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-[8px] font-bold text-slate-600 uppercase tracking-tighter">
                          {n.createdAt?.toDate ? formatDate(n.createdAt.toDate()) : 'Agora'}
                        </span>
                        {!n.read && <span className="w-1.5 h-1.5 rounded-full bg-yellow-400" />}
                      </div>
                   </div>
                </div>
             </motion.div>
           ))
         )}
      </div>
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans grid lg:grid-cols-[280px_1fr] grid-cols-1 overflow-x-hidden">
      {/* Sidebar - Desktop */}
      <aside className="hidden lg:flex flex-col border-r border-white/5 bg-slate-950/50 backdrop-blur-xl p-8 sticky top-0 h-screen overflow-y-auto custom-scrollbar">
        <div className="flex items-center gap-3 mb-10">
          <motion.img
            src="/logo-opt.png"
            alt="RunManager"
            whileHover={{ scale: 1.1 }}
            className="w-10 h-10 object-contain"
          />
          <span className="text-xl font-display font-black tracking-tight italic uppercase">RunManager</span>
        </div>

        <nav className="flex-1 space-y-1.5">
          <div className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em] mb-4 pl-4 italic">Navegação</div>
          {navItems.map((item) => (
            <NavItem key={item.path} item={item} />
          ))}
          
          <div className="pt-6">
            <div className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em] mb-4 pl-4 italic">Notificações</div>
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className={cn(
                  "w-full flex items-center gap-3 px-5 py-3.5 rounded-2xl font-bold transition-all group border border-transparent",
                  showNotifications 
                    ? "bg-white/5 text-white border-white/10" 
                    : "text-slate-500 hover:text-white hover:bg-white/5"
                )}
              >
                <div className="p-2 rounded-lg bg-slate-900 group-hover:bg-slate-800 relative">
                  <Bell className="w-4 h-4" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full border-2 border-slate-950 animate-pulse" />
                  )}
                </div>
                <span className="text-sm tracking-tight">Alertas</span>
                {unreadCount > 0 && (
                  <span className="ml-auto bg-yellow-400/10 text-yellow-400 text-[10px] px-2 py-0.5 rounded-full font-black">
                    {unreadCount}
                  </span>
                )}
              </button>
            </div>
          </div>
        </nav>

        <div className="mt-8 pt-8 border-t border-white/5 space-y-3">
          <Link 
            to={profilePath}
            className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all group"
          >
             <div className="w-10 h-10 rounded-xl bg-slate-800 border border-white/10 flex items-center justify-center text-yellow-400 font-black italic overflow-hidden shrink-0 group-hover:scale-105 transition-transform">
                {profile?.profileImageUrl ? (
                  <img src={profile.profileImageUrl} alt="Avatar" className="w-full h-full object-cover" />
                ) : user?.photoURL ? (
                  <img src={user.photoURL} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  profile?.organizerName?.charAt(0) || user?.displayName?.charAt(0) || user?.email?.charAt(0)
                )}
             </div>
             <div className="flex-1 min-w-0">
                <div className="text-xs font-black truncate text-white italic uppercase tracking-tight">{profile?.organizerName || user?.displayName || 'Organizador'}</div>
                <div className="text-[9px] text-slate-500 truncate uppercase font-black tracking-widest">{user?.email}</div>
             </div>
          </Link>
          <button 
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-3 px-4 py-3.5 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] text-yellow-400 bg-yellow-400/5 hover:bg-yellow-400/10 border border-yellow-400/10 transition-all active:scale-95"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      </aside>

      <div className="flex flex-col min-w-0">
        {/* Mobile Nav Header */}
        <header className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-slate-950/80 backdrop-blur-2xl border-b border-white/5 p-4 flex justify-between items-center h-16">
           <div className="flex items-center gap-3">
              <img src="/logo-opt.png" alt="RunManager" className="w-8 h-8 object-contain" />
              <span className="text-lg font-display font-black tracking-tight italic uppercase">RunManager</span>
           </div>
           <div className="flex items-center gap-2">
             <button 
               onClick={() => setShowNotifications(!showNotifications)}
               className="relative w-10 h-10 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
             >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-2.5 right-2.5 w-2.5 h-2.5 bg-yellow-400 rounded-full border-2 border-slate-950 shadow-lg" />
                )}
             </button>
             <button 
               onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} 
               className="w-10 h-10 flex items-center justify-center bg-white/5 rounded-xl border border-white/10 text-white active:scale-90 transition-all"
             >
                {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
             </button>
           </div>
           <AnimatePresence>
             {showNotifications && <NotificationsPanel isMobile />}
           </AnimatePresence>
        </header>

        {/* Mobile Menu Overlay */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <>
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsMobileMenuOpen(false)}
                className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-md lg:hidden"
              />
              <motion.div 
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                className="fixed top-0 right-0 bottom-0 z-[70] w-full max-w-[320px] bg-slate-950 border-l border-white/10 p-8 flex flex-col shadow-2xl lg:hidden"
              >
                 <div className="flex justify-between items-center mb-10">
                    <div className="flex items-center gap-3">
                      <img src="/logo-opt.png" alt="RunManager" className="w-10 h-10 object-contain" />
                      <span className="text-xl font-display font-black tracking-tight italic uppercase">Menu</span>
                    </div>
                    <button 
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="w-10 h-10 flex items-center justify-center text-slate-500 hover:text-white transition-colors"
                    >
                      <X className="w-6 h-6" />
                    </button>
                 </div>

                 <nav className="flex-1 overflow-y-auto space-y-2 py-4">
                    {navItems.map((item) => (
                      <Link
                        key={item.path}
                        to={item.path}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={cn(
                          "flex items-center gap-4 px-6 py-4 rounded-[2rem] font-black uppercase text-xs tracking-widest transition-all border",
                          location.pathname === item.path 
                            ? "bg-yellow-400 text-slate-950 border-yellow-300 shadow-[0_15px_30px_rgba(250,204,21,0.3)]" 
                            : "text-slate-500 border-transparent hover:text-white hover:bg-white/5"
                        )}
                      >
                        <div className={cn(
                          "w-8 h-8 rounded-full flex items-center justify-center",
                          location.pathname === item.path ? "bg-slate-950/10" : "bg-slate-900"
                        )}>
                          {React.cloneElement(item.icon as React.ReactElement, { className: "w-4 h-4" })}
                        </div>
                        {item.label}
                      </Link>
                    ))}
                    
                    {/* Botão de Alertas no Mobile Menu */}
                    <button
                      onClick={() => {
                        setShowNotifications(true);
                        setIsMobileMenuOpen(false);
                      }}
                      className={cn(
                        "w-full flex items-center gap-4 px-6 py-4 rounded-[2rem] font-black uppercase text-xs tracking-widest transition-all border border-transparent text-slate-500 hover:text-white hover:bg-white/5"
                      )}
                    >
                      <div className="w-8 h-8 bg-slate-900 rounded-full flex items-center justify-center relative">
                        <Bell className="w-4 h-4" />
                        {unreadCount > 0 && <span className="absolute top-0 right-0 w-2 h-2 bg-yellow-400 rounded-full" />}
                      </div>
                      Alertas
                      {unreadCount > 0 && <span className="ml-auto bg-yellow-400/20 text-yellow-400 px-2 py-0.5 rounded-full text-[10px]">{unreadCount}</span>}
                    </button>
                 </nav>

                 <div className="mt-auto pt-8 border-t border-white/5 space-y-6">
                    <Link 
                      to={profilePath}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center gap-4 p-4 rounded-3xl bg-white/5 border border-white/10"
                    >
                       <div className="w-12 h-12 rounded-2xl bg-slate-900 border border-white/10 flex items-center justify-center text-yellow-400 font-black italic overflow-hidden">
                          {profile?.profileImageUrl ? (
                            <img src={profile.profileImageUrl} alt="Avatar" className="w-full h-full object-cover" />
                          ) : user?.photoURL ? (
                            <img src={user.photoURL} alt="Avatar" className="w-full h-full object-cover" />
                          ) : (
                            profile?.organizerName?.charAt(0) || user?.displayName?.charAt(0) || user?.email?.charAt(0)
                          )}
                       </div>
                       <div className="flex-1 min-w-0">
                          <div className="text-sm font-black truncate text-white uppercase italic tracking-tight">
                            {profile?.organizerName || user?.displayName || 'Organizador'}
                          </div>
                          <div className="text-[9px] text-slate-500 truncate uppercase font-black tracking-widest">{user?.email}</div>
                       </div>
                    </Link>

                    <button 
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        handleLogout();
                      }}
                      className="w-full flex items-center justify-center gap-3 px-6 py-5 rounded-[2.5rem] font-black text-[10px] uppercase tracking-[0.3em] text-yellow-400 border border-yellow-400/20 bg-yellow-400/5 hover:bg-yellow-400/10 transition-all active:scale-95"
                    >
                      <LogOut className="w-4 h-4" />
                      Encerrar Sessão
                    </button>
                 </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Global Notifications Overlay */}
        <AnimatePresence>
          {showNotifications && (
            <>
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowNotifications(false)}
                className="fixed inset-0 z-[95] bg-black/40 backdrop-blur-[2px]"
              />
              <NotificationsPanel isMobile={window.innerWidth < 1024} />
            </>
          )}
        </AnimatePresence>

        {/* Main Content Area */}
        <main className="flex-1 w-full max-w-[1440px] mx-auto min-h-screen pt-16 lg:pt-0">
           <div className="p-2 sm:p-4 md:p-8 lg:p-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
              <Outlet />
           </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
