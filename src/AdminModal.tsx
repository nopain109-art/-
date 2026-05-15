import React, { useEffect, useState } from 'react';
import { collection, getDocs, deleteDoc, doc, query } from 'firebase/firestore';
import { signInWithRedirect, GoogleAuthProvider, signOut, onAuthStateChanged, getRedirectResult } from 'firebase/auth';
import { auth, db } from './lib/firebase';
import { LogOut, Trash2, X } from 'lucide-react';

interface Consultation {
  id: string;
  name: string;
  phone: string;
  timeRange: string;
  inquiry: string;
  createdAt: any;
}

export function AdminModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [user, setUser] = useState<any>(null);
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser && isOpen) {
        fetchConsultations();
      } else {
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && user) {
      fetchConsultations();
    }
  }, [isOpen, user]);

  const handleLogin = () => {
    const provider = new GoogleAuthProvider();
    signInWithRedirect(auth, provider);
  };

  const handleLogout = async () => {
    await signOut(auth);
    setConsultations([]);
  };

  const fetchConsultations = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, 'consultations'));
      const snapshot = await getDocs(q);
      const data: Consultation[] = [];
      snapshot.forEach(doc => {
        data.push({ id: doc.id, ...doc.data() } as Consultation);
      });
      data.sort((a, b) => {
        if (!a.createdAt || !b.createdAt) return 0;
        return b.createdAt.toMillis() - a.createdAt.toMillis();
      });
      setConsultations(data);
      setError('');
    } catch (err: any) {
      console.error(err);
      if (err.message && err.message.includes('permission')) {
        setError(`권한이 없습니다 (이메일 불일치 등). 에러: ${err.message}`);
      } else {
        setError(`데이터를 불러오는데 실패했습니다. 에러: ${err.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm('정말 삭제하시겠습니까?')) return;
    try {
      await deleteDoc(doc(db, 'consultations', id));
      setConsultations(prev => prev.filter(c => c.id !== id));
    } catch (err) {
      console.error(err);
      alert('삭제 실패');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto" onClick={onClose}>
      <div className="bg-white p-6 md:p-10 rounded-[2rem] shadow-2xl flex flex-col relative w-full max-w-5xl my-auto min-h-[50vh] max-h-[90vh] overflow-hidden" onClick={e => e.stopPropagation()}>
        
        <button onClick={onClose} className="absolute top-6 right-6 text-gray-400 hover:text-gray-900 transition-colors z-10">
          <X className="w-6 h-6" />
        </button>

        <div className="flex justify-between items-center mb-8 pr-8">
          <h2 className="text-3xl font-black text-gray-900 tracking-tight">상담 예약 내역</h2>
          {user && (
            <button onClick={handleLogout} className="flex items-center gap-2 text-gray-600 hover:text-gray-900 font-medium px-4 py-2 rounded-lg hover:bg-gray-100 transition">
              <LogOut className="w-5 h-5" />
              로그아웃
            </button>
          )}
        </div>

        {error && <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-xl mb-6 font-medium break-keep">{error}</div>}

        {!user ? (
          <div className="flex-1 flex flex-col items-center justify-center py-12">
            <div className="bg-blue-50 text-blue-800 p-4 rounded-full mb-6">
              <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
            </div>
            <h3 className="text-xl font-bold mb-2">관리자 전용 페이지입니다</h3>
            <p className="text-gray-500 mb-8 text-center max-w-sm">
              상담 예약 내역을 확인하고 관리하려면 관리자 계정으로 로그인해주세요.
            </p>
            <button onClick={handleLogin} className="bg-gray-900 text-white font-bold px-8 py-4 rounded-xl hover:bg-gray-800 transition-all shadow-lg hover:shadow-xl hover:-translate-y-1">
              Google 계정으로 로그인
            </button>
          </div>
        ) : loading ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto scrollbar-hide rounded-xl border border-gray-200">
            <table className="w-full text-left border-collapse">
              <thead className="bg-gray-50 sticky top-0 z-10">
                <tr>
                  <th className="p-4 font-bold text-gray-600 border-b border-gray-200 whitespace-nowrap">이름</th>
                  <th className="p-4 font-bold text-gray-600 border-b border-gray-200 whitespace-nowrap">연락처</th>
                  <th className="p-4 font-bold text-gray-600 border-b border-gray-200 whitespace-nowrap">상담 희망 시간</th>
                  <th className="p-4 font-bold text-gray-600 border-b border-gray-200">문의사항</th>
                  <th className="p-4 font-bold text-gray-600 border-b border-gray-200 whitespace-nowrap">신청일</th>
                  <th className="p-4 border-b border-gray-200"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {consultations.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-12 text-center text-gray-500 font-medium text-lg">신청 내역이 없습니다.</td>
                  </tr>
                ) : (
                  consultations.map(c => (
                    <tr key={c.id} className="hover:bg-blue-50/50 transition-colors group">
                      <td className="p-4 font-bold text-gray-900 whitespace-nowrap">{c.name}</td>
                      <td className="p-4 font-mono text-gray-600 whitespace-nowrap">{c.phone}</td>
                      <td className="p-4">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 whitespace-nowrap">
                          {c.timeRange}
                        </span>
                      </td>
                      <td className="p-4 text-sm text-gray-600 max-w-md whitespace-pre-wrap leading-relaxed">{c.inquiry}</td>
                      <td className="p-4 text-sm text-gray-500 whitespace-nowrap">
                        {c.createdAt ? new Date(c.createdAt.toMillis()).toLocaleString() : ''}
                      </td>
                      <td className="p-4 text-right">
                        <button onClick={(e) => handleDelete(c.id, e)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100">
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
