TypeScript
import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowRight, CheckCircle2, ShieldCheck, X, Loader2 } from 'lucide-react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { getRedirectResult } from 'firebase/auth';
import { db, auth } from './lib/firebase';
import { AdminModal } from './AdminModal';
import { ReviewSection } from './ReviewSection';
import confetti from 'canvas-confetti';

gsap.registerPlugin(ScrollTrigger);

export default function App() {
  const cursorDotRef = useRef<HTMLDivElement>(null);
  const [loadCount, setLoadCount] = useState(0);
  const [isQRModalOpen, setIsQRModalOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    timeRange: '10:00 - 11:00',
    inquiry: ''
  });

  // [수정된 부분] 로그인 성공 시 자동으로 상담창을 여는 로직
  useEffect(() => {
    getRedirectResult(auth)
      .then((result) => {
        if (result && result.user) {
          // ★ 본인의 구글 이메일 주소로 꼭 수정하세요 ★
          const adminEmail = "nopain109@gmail.com"; 
          
          if (result.user.email === adminEmail) {
            setIsAdminOpen(true); // 관리자 모달 즉시 열기
          } else {
            alert("관리자 권한이 없습니다.");
          }
        }
      })
      .catch((error) => {
        console.error("로그인 에러:", error);
      });
  }, []);

  const timeOptions = Array.from({ length: 24 }, (_, i) => {
    const hour = i.toString().padStart(2, '0');
    const nextHour = (i + 1) === 24 ? '00' : (i + 1).toString().padStart(2, '0');
    return `${hour}:00 - ${nextHour}:00`;
  });

  const handleConsultationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.phone) return alert("이름과 연락처를 입력해주세요.");
    
    setIsSubmitting(true);
    try {
      await addDoc(collection(db, 'consultations'), {
        name: formData.name,
        phone: formData.phone,
        timeRange: formData.timeRange,
        inquiry: formData.inquiry || '',
        createdAt: serverTimestamp()
      });
      alert('성공적으로 접수되었습니다. 순차적으로 연락드리겠습니다.');
      setIsQRModalOpen(false);
      setFormData({ name: '', phone: '', timeRange: '10:00 - 11:00', inquiry: '' });
    } catch (err) {
      console.error(err);
      alert('오류가 발생했습니다. 다시 시도해주세요.');
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    let ctx = gsap.context(() => {
      // 로딩 애니메이션 및 기타 GSAP 로직 (기존 유지)
      const count = { val: 9999 };
      gsap.to(count, {
        val: 1,
        duration: 2,
        ease: "power3.inOut",
        onUpdate: () => setLoadCount(Math.ceil(count.val)),
        onComplete: () => {
          gsap.to("#loader", { 
            yPercent: -100, 
            duration: 1.2, 
            ease: "expo.inOut", 
            delay: 0.2 
          });
        }
      });
    });
    return () => ctx.revert();
  }, []);

  const openModal = (e?: React.MouseEvent) => {
    if (e) e.preventDefault();
    setIsQRModalOpen(true);
  };

  return (
    <>
      {/* 로딩 화면 */}
      <div id="loader" className="fixed inset-0 z-[100] bg-blue-900 flex flex-col items-center justify-center text-white">
        <div className="loader-number text-6xl font-black">{loadCount}</div>
        <div className="text-2xl mt-4">보험국가대표</div>
      </div>

      {/* 네비게이션 */}
      <nav className="fixed top-0 w-full z-50 px-6 py-4 flex justify-end items-center bg-white/80 backdrop-blur-md border-b">
        <div className="flex items-center gap-4">
          <button onClick={openModal} className="bg-blue-600 text-white rounded-full px-5 py-2">상담 신청</button>
          <button onClick={() => setIsAdminOpen(true)} className="text-gray-400">관리자</button>
        </div>
      </nav>

      {/* 메인 섹션 */}
      <section className="pt-32 pb-20 text-center">
        <h1 className="text-5xl font-black mb-6">국가대표 1등 설계사 이지원</h1>
        <p className="text-xl text-gray-600">진심을 다하는 보험 상담을 약속드립니다.</p>
      </section>

      {/* [중요] 상담 내역 모달 창 - 로그인이 성공하면 이 창이 뜹니다 */}
      {isAdminOpen && (
        <AdminModal 
          isOpen={isAdminOpen} 
          onClose={() => setIsAdminOpen(false)} 
        />
      )}
    </>
  );
}
