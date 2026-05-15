import React, { useEffect, useState } from 'react';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from './lib/firebase';
import { X, Loader2, Phone, Calendar, User, MessageSquare } from 'lucide-react';

interface Consultation {
  id: string;
  name: string;
  phone: string;
  timeRange: string;
  inquiry: string;
  createdAt: any;
}

export const AdminModal = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  const [data, setData] = useState<Consultation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isOpen) return;

    // 파이어베이스에서 'consultations' 폴더(컬렉션)의 데이터를 가져옵니다.
    const q = query(collection(db, 'consultations'), orderBy('createdAt', 'desc'));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Consultation[];
      setData(list);
      setLoading(false);
    }, (error) => {
      console.error("데이터 불러오기 에러:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-4xl max-h-[85vh] rounded-3xl shadow-2xl overflow-hidden flex flex-col">
        {/* 헤더 */}
        <div className="p-6 border-b flex justify-between items-center bg-gray-50">
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <MessageSquare className="text-blue-600" /> 실시간 상담 접수 내역
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
            <X size={24} />
          </button>
        </div>

        {/* 내역 리스트 */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="animate-spin text-blue-600 mb-4" size={40} />
              <p className="text-gray-500">내역을 불러오는 중입니다...</p>
            </div>
          ) : data.length === 0 ? (
            <div className="text-center py-20 text-gray-400">접수된 상담 내역이 없습니다.</div>
          ) : (
            <div className="grid gap-4">
              {data.map((item) => (
                <div key={item.id} className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex flex-wrap justify-between items-start gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 font-bold text-lg text-gray-900">
                        <User size={18} className="text-blue-500" /> {item.name} 고객님
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <Phone size={16} /> {item.phone}
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <Calendar size={16} /> 희망시간: {item.timeRange}
                      </div>
                    </div>
                    <div className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs font-semibold">
                      접수완료
                    </div>
                  </div>
                  {item.inquiry && (
                    <div className="mt-4 p-4 bg-gray-50 rounded-xl text-gray-700 text-sm border-l-4 border-blue-200">
                      <strong>문의내용:</strong> {item.inquiry}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
