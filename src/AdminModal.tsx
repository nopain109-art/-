import React, { useEffect, useState } from 'react';
import { collection, deleteDoc, doc, query, updateDoc, orderBy, onSnapshot } from 'firebase/firestore';
import { signOut, onAuthStateChanged } from 'firebase/auth';
import { auth, db } from './lib/firebase';
import { LogOut, Trash2, X, CheckCircle, Circle } from 'lucide-react';

interface Consultation {
  id: string;
  name: string;
  phone: string;
  timeRange: string;
  inquiry: string;
  status?: string;
  createdAt: any;
}

export function AdminModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [user, setUser] = useState<any>(null);
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // 1. 로그인 상태 감지
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (!currentUser) {
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, []);

  // 2. [실시간 연동 업그레이드] 실시간으로 DB를 감시하여 새로고침 없이 내역을 띄웁니다.
  useEffect(() => {
    if (!isOpen || !user) return;

    setLoading(true);
    // 최신 접수글이 맨 위로 오도록 정렬(createdAt, desc)
    const q = query(collection(db, 'consultations'), orderBy('createdAt', 'desc'));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data: Consultation[] = [];
      snapshot.forEach(doc => {
        data.push({ id: doc.id, ...doc.data() } as Consultation);
      });
      setConsultations(data);
      setError('');
      setLoading(false);
    }, (err: any) => {
      console.error(err);
      if (err.message && err.message.includes('permission')) {
        setError(`권한이 없습니다 (파이어베이스 Rules 이메일 권한 설정 확인 필요).`);
      } else {
        setError(`데이터를 불러오는데 실패했습니다: ${err.message}`);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [isOpen, user]);

  const handleLogout = async () => {
    await signOut(auth);
    setConsultations([]);
    onClose(); // 로그아웃 시 창 닫기
  };

  // 3. 삭제 기능
  const handleDelete = async (id: string, name: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm(`${name} 고객님의 상담 내역을 정말 삭제하시겠습니까?\n삭제된 데이터는 복구할 수 없습니다.`)) return;
    try {
      await deleteDoc(doc(db, 'consultations', id));
      alert("삭제되었습니다.");
    } catch (err) {
      console.error(err);
      alert('삭제 실패');
    }
  };

  // 4. 완료/대기 토글 기능
  const handleToggleStatus = async (id: string, currentStatus: string | undefined, e: React.MouseEvent) => {
    e.stopPropagation();
    const newStatus = currentStatus === 'completed' ? 'pending' : 'completed';
    try {
      await updateDoc(doc(db, 'consultations', id), {
        status: newStatus
      });
    } catch (err) {
      console.error(err);
      alert('상태 변경 중 오류가 발생했습니다.');
    }
  };

  // 5. 접수 시간 이쁘게 바꾸는 함수 (기존 유지)
  const formatDate = (timestamp: any) => {
    if (!timestamp) return '';
    const date = new Date(timestamp.toMillis());
    return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto" onClick={onClose}>
      <div className="bg-white p-6 md:p-10 rounded-[2rem] shadow-2xl flex flex-col relative w-full max-w-5xl my-auto min-h-[50vh] max-h-[90vh] overflow-hidden" onClick={e => e.stopPropagation()}>
        
        <button onClick={onClose} className="absolute top-6 right-6 text-gray-400 hover:text-gray-900 transition-colors z-10">
          <X className="w-6 h-6" />
        </button>

        <div className="flex justify-between items-center mb-8 pr-8">
          <h2 className="text-3xl font-black text-gray-900 tracking-tight">상담 예약 DB 관리자 모드</h2>
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
            <h3 className="text-xl font-bold mb-2">접근 권한이 없습니다</h3>
            <p className="text-gray-500 mb-4 text-center max-w-sm">
              로그인을 다시 시도하거나 메인 화면에서 관리자 계정으로 로그인해 주세요.
            </p>
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
                  <th className="p-4 font-bold text-gray-600 border-b border-gray-200 whitespace-nowrap">상태</th>
                  <th className="p-4 font-bold text-gray-600 border-b border-gray-200 whitespace-nowrap">이름</th>
                  <th className="p-4 font-bold text-gray-600 border-b border-gray-200 whitespace-nowrap">연락처</th>
                  <th className="p-4 font-bold text-gray-600 border-b border-gray-200 whitespace-nowrap">상담 희망 시간</th>
                  <th className="p-4 font-bold text-gray-600 border-b border-gray-200">문의사항</th>
                  <th className="p-4 font-bold text-gray-600 border-b border-gray-200 whitespace-nowrap">접수 일시</th>
                  <th className="p-4 border-b border-gray-200"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {consultations.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-12 text-center text-gray-500 font-medium text-lg">신청 내역이 없습니다.</td>
                  </tr>
                ) : (
                  consultations.map(c => (
                    <tr key={c.id} className={`hover:bg-blue-50/50 transition-colors group ${c.status === 'completed' ? 'opacity-50 bg-gray-50' : ''}`}>
                      <td className="p-4">
                        <button 
                          onClick={(e) => handleToggleStatus(c.id, c.status, e)}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold transition-colors ${c.status === 'completed' ? 'text-green-600 bg-green-100/50 hover:bg-green-100' : 'text-gray-500 bg-gray-100 hover:bg-gray-200'}`}
                        >
                          {c.status === 'completed' ? (
                            <><CheckCircle className="w-4 h-4" /> 완료</>
                          ) : (
                            <><Circle className="w-4 h-4" /> 대기</>
                          )}
                        </button>
                      </td>
                      <td className={`p-4 font-bold text-gray-900 whitespace-nowrap ${c.status === 'completed' ? 'line-through text-gray-400' : ''}`}>{c.name}</td>
                      <td className="p-4 font-mono text-gray-600 whitespace-nowrap">{c.phone}</td>
                      <td className="p-4">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 whitespace-nowrap">
                          {c.timeRange}
                        </span>
                      </td>
                      <td className="p-4 text-sm text-gray-600 max-w-md whitespace-pre-wrap leading-relaxed">{c.inquiry}</td>
                      <td className="p-4 text-sm text-gray-500 whitespace-nowrap">
                        {formatDate(c.createdAt)}
                      </td>
                      <td className="p-4 text-right">
                        <button onClick={(e) => handleDelete(c.id, c.name, e)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100">
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
