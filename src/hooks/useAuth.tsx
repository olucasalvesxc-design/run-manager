import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  onAuthStateChanged, 
  User, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut as firebaseSignOut 
} from 'firebase/auth';
import { doc, onSnapshot, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';

interface UserProfile {
  role?: 'athlete' | 'organizer' | 'admin';
  runnerName?: string;
  organizerName?: string;
  email?: string;
  athleteCode?: string;
  raceCredits?: number;
  creditsUsed?: number;
  [key: string]: any;
}

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  signIn: (email: string, p: string) => Promise<any>;
  signUp: (email: string, p: string, n: string) => Promise<any>;
  signInWithGoogle: () => Promise<any>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({ 
  user: null, 
  profile: null, 
  loading: true,
  signIn: async () => {},
  signUp: async () => {},
  signInWithGoogle: async () => {},
  signOut: async () => {}
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const signIn = (email: string, p: string) => signInWithEmailAndPassword(auth, email, p);
  
  const signUp = async (email: string, p: string, name: string) => {
    const cred = await createUserWithEmailAndPassword(auth, email, p);
    await setDoc(doc(db, 'profiles', cred.user.uid), {
      email,
      runnerName: name,
      organizerName: name,
      role: 'athlete',
      createdAt: serverTimestamp(),
      planStatus: 'trial',
      planName: 'FREE'
    });
    return cred;
  };

  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    const cred = await signInWithPopup(auth, provider);
    const profileDoc = doc(db, 'profiles', cred.user.uid);
    // Create profile if doesn't exist
    await setDoc(profileDoc, {
      email: cred.user.email,
      runnerName: cred.user.displayName,
      organizerName: cred.user.displayName,
      role: 'athlete',
      updatedAt: serverTimestamp()
    }, { merge: true });
    return cred;
  };

  const signOut = () => firebaseSignOut(auth);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      setUser(user);
      if (!user) {
        setProfile(null);
        setLoading(false);
      }
    });

    return unsubscribeAuth;
  }, []);

  useEffect(() => {
    if (!user) {
      setProfile(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    // Real-time profile sync
    const unsubscribeProfile = onSnapshot(doc(db, 'profiles', user.uid), (snapshot) => {
      if (snapshot.exists()) {
        setProfile(snapshot.data() as UserProfile);
      } else {
        setProfile(null);
      }
      setLoading(false);
    }, (error) => {
      console.error("Profile sync error:", error);
      setLoading(false);
    });

    return unsubscribeProfile;
  }, [user]);

  return (
    <AuthContext.Provider value={{ user, profile, loading, signIn, signUp, signInWithGoogle, signOut }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
