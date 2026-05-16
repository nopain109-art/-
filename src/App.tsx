import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowRight, CheckCircle2, ShieldCheck, X, Loader2 } from 'lucide-react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { getRedirectResult, onAuthStateChanged } from 'firebase/auth';
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

  // 로그인 후 리디렉션 감지 및 로그인 상태 유지를 위한 이펙트
  useEffect(() => {
    // 1. 구글 로그인 후 리디렉션되어 돌아왔을 때 처리
    getRedirectResult(auth)
      .then((result) => {
        if (result && result.user) {
          const adminEmail = "nopain109@gmail.com"; // 관리자 이메일 반영
          if (result.user.email === adminEmail) {
            setIsAdminOpen(true);
          } else {
            alert("관리자 권한이 없는 계정입니다: " + result.user.email);
          }
        }
      })
      .catch((error) => {
        console.error("Redirect login error:", error);
      });

    // 2. 새로고침 시 이미 로그인 상태가 유지되고 있는지 감지
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        const adminEmail = "nopain109@gmail.com"; // 관리자 이메일 반영
        if (user.email === adminEmail) {
          setIsAdminOpen(true);
        }
      }
    });

    return () => unsubscribe();
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
        status: 'pending',
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
      // 1. 로딩 애니메이션
      const count = { val: 9999 };
      gsap.to(count, {
        val: 1,
        duration: 2,
        ease: "power3.inOut",
        onUpdate: () => {
          setLoadCount(Math.ceil(count.val));
        },
        onComplete: () => {
          gsap.to("#loader", { 
            yPercent: -100, 
            duration: 1.2, 
            ease: "expo.inOut", 
            delay: 0.2,
            onComplete: () => {
               startMainAnimations();
               ScrollTrigger.refresh();
               const fireConfetti = () => {
                 if (window.scrollY < window.innerHeight * 1.2) {
                   confetti({
                     particleCount: Math.floor(Math.random() * 50) + 50,
                     spread: Math.floor(Math.random() * 40) + 60,
                     origin: { y: 0.5, x: Math.random() * 0.4 + 0.3 },
                     colors: ['#0052CC', '#E61F2B', '#ffffff', '#FFD700'],
                     ticks: 200,
                     gravity: 0.8
                   });
                 }
               };
               fireConfetti();
               setInterval(fireConfetti, 2500);
            }
          });
        }
      });

      const onScroll = () => {
         const scrolled = window.scrollY;
         gsap.to(".bg-shape", { y: scrolled * 0.2, duration: 0.5 });
      };
      window.addEventListener('scroll', onScroll);

      function startMainAnimations() {
          document.querySelector('.svg-taegeuk')?.classList.add('taegeuk-active');
          const reveals = gsap.utils.toArray('.reveal');
          reveals.forEach((el: any) => {
              gsap.fromTo(el, 
                  { opacity: 0, y: 60 },
                  {
                      scrollTrigger: { 
                          trigger: el, 
                          start: "top 85%",
                      },
                      opacity: 1, 
                      y: 0, 
                      duration: 1.8, 
                      ease: "power3.out",
                  }
              );
          });

          // Typewriter animation per wrapper
          const titleWrappers = gsap.utils.toArray('.title-wrapper');
          titleWrappers.forEach((wrapper: any) => {
              const chars = wrapper.querySelectorAll('.title-char');
              gsap.fromTo(chars, 
                  { opacity: 0, y: 30 },
                  {
                      opacity: 1, y: 0,
                      duration: 0.8,
                      stagger: 0.15,
                      ease: "power3.out",
                      scrollTrigger: { trigger: wrapper, start: "top 85%" }
                  }
              );
          });

          // About section typewriter animation
          gsap.fromTo(".about-char", 
              { opacity: 0 },
              {
                  opacity: 1,
                  duration: 0.1,
                  stagger: 0.02,
                  ease: "none",
                  scrollTrigger: { trigger: ".about-typewriter", start: "top 80%" }
              }
          );
          // Staggered reveal list blocks
          const staggerContainers = gsap.utils.toArray('.reveal-stagger-container');
          staggerContainers.forEach((container: any) => {
              const items = container.querySelectorAll('.reveal-item');
              gsap.fromTo(items, 
                  { opacity: 0, y: 40 },
                  {
                      opacity: 1, 
                      y: 0, 
                      duration: 0.8,
                      stagger: 0.25,
                      ease: "power2.out",
                      scrollTrigger: { 
                          trigger: container, 
                          start: "top 85%" 
                      }
                  }
              );
          });

          // Draw red lines
          gsap.set('.reveal-circle', { strokeDasharray: 200, strokeDashoffset: 200 });
          gsap.to('.reveal-circle', {
              strokeDashoffset: 0, duration: 1.2, ease: "power2.inOut", delay: 0.2,
              scrollTrigger: { trigger: '.reveal-circle', start: "top 85%" }
          });
      }
    });

    const isFinePointer = window.matchMedia('(pointer: fine)').matches;
    const dot = cursorDotRef.current;
    
    const onMouseMove = (e: MouseEvent) => {
      if (dot) {
        gsap.to(dot, { x: e.clientX, y: e.clientY, duration: 0 });
      }
    };

    if (isFinePointer) {
      window.addEventListener('mousemove', onMouseMove);
    }

    return () => {
      if (isFinePointer) {
        window.removeEventListener('mousemove', onMouseMove);
      }
      ctx.revert();
    };
  }, []);

  const openModal = (e?: React.MouseEvent) => {
    if (e) e.preventDefault();
    setIsQRModalOpen(true);
  };

  return (
    <>
      {/* 로딩 화면 */}
      <div id="loader">
        <div className="text-xl md:text-3xl font-bold mb-8 tracking-[0.5em] opacity-50 text-center text-white">KOREA INSURANCE REPRESENTATIVE</div>
        <img src="https://upload.wikimedia.org/wikipedia/commons/0/09/Flag_of_South_Korea.svg" alt="태극기" className="w-48 h-32 md:w-64 md:h-48 mx-auto mb-10 opacity-90 shadow-2xl transition-transform hover:scale-105" />
        <div className="loader-number text-white" id="load-count">{loadCount}{loadCount === 1 ? '등' : ''}</div>
        <div className="text-4xl md:text-6xl font-black mt-8 text-white">보험국가대표</div>
      </div>

      {/* 커서 도트 */}
      <div className="cursor-dot hidden md:block" ref={cursorDotRef}></div>

      {/* 네비게이션 */}
      <nav className="fixed top-0 w-full z-50 px-6 py-4 md:px-12 flex justify-end items-center bg-white/80 backdrop-blur-md border-b border-gray-50 h-[72px]">
        <div className="flex items-center gap-4 md:gap-8 text-sm font-bold text-gray-500">
          <a href="#about" className="hidden md:block hover:text-blue-900 transition-colors">차별화된 전문성</a>
          <a href="#vision" className="hidden md:block hover:text-blue-900 transition-colors">설계 철학</a>
          <button onClick={openModal} className="hidden md:block transition-colors bg-blue-600 text-white rounded-full px-5 py-2 hover:bg-blue-700 shadow-md">상담 신청</button>
          <button onClick={() => setIsAdminOpen(true)} className="whitespace-nowrap hidden md:block text-gray-400 hover:text-gray-600 transition-colors">관리자 메뉴</button>
        </div>
      </nav>

      {/* 히어로 섹션 */}
      <section className="relative min-h-[75vh] flex flex-col justify-center items-center px-6 overflow-hidden pt-12 pb-48">
        <div className="max-w-6xl w-full text-center flex flex-col items-center">
          <div className="relative mb-0 w-[14rem] h-[14rem] md:w-[20rem] md:h-[20rem] lg:w-[26rem] lg:h-[26rem] reveal lg:-mb-6 flex items-center justify-center">
            <svg viewBox="-20 -20 140 140" xmlns="http://www.w3.org/2000/svg" className="svg-taegeuk w-[120%] h-[120%] -rotate-90">
              <defs>
                <filter id="brush-texture">
                  <feTurbulence type="fractalNoise" baseFrequency="0.08" numOctaves="3" result="noise" />
                  <feDisplacementMap in="SourceGraphic" in2="noise" scale="3" xChannelSelector="R" yChannelSelector="G" />
                  <feGaussianBlur stdDeviation="0.4" />
                </filter>
              </defs>
              <g filter="url(#brush-texture)">
                  <path 
                    d="M 50 10 A 40 40 0 0 1 50 90 A 20 20 0 0 0 50 50 A 20 20 0 0 1 50 10" 
                    fill="none" stroke="#CD2E3A" strokeWidth="14" strokeLinecap="round" 
                    className="taegeuk-path-red" 
                  />
                  <path 
                    d="M 50 90 A 40 40 0 0 1 50 10 A 20 20 0 0 0 50 50 A 20 20 0 0 1 50 90" 
                    fill="none" stroke="#0047A0" strokeWidth="14" strokeLinecap="round" 
                    className="taegeuk-path-blue" 
                  />
                  <path 
                    d="M 50 10 A 40 40 0 0 1 50 90 A 20 20 0 0 0 50 50 A 20 20 0 0 1 50 10" 
                    fill="none" stroke="#CD2E3A" strokeWidth="6" strokeLinecap="round" 
                    className="taegeuk-shadow-red" transform="translate(1, -1)"
                  />
                  <path 
                    d="M 50 90 A 40 40 0 0 1 50 10 A 20 20 0 0 0 50 50 A 20 20 0 0 1 50 90" 
                    fill="none" stroke="#0047A0" strokeWidth="6" strokeLinecap="round" 
                    className="taegeuk-shadow-blue" transform="translate(-1, 1)"
                  />
              </g>
            </svg>
          </div>
          <div className="relative mb-4 px-4 pb-2 w-full flex justify-center title-wrapper z-10 mt-4 md:mt-2">
            <h1 className="text-[4.5rem] sm:text-[7rem] md:text-[9.5rem] lg:text-[12rem] leading-[1.2] font-black tracking-tighter text-[#001A41] inline-flex items-center justify-center relative z-20">
              {"보험국대".split('').map((char, i) => (
                <span key={`0-${i}`} className={`inline-block title-char opacity-0`}>{char}</span>
              ))}
            </h1>
          </div>
          <div className="my-10 md:my-14 inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-blue-50 border border-blue-100 reveal z-10 w-max mx-auto">
            <span className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></span>
            <span className="text-sm md:text-base font-bold text-blue-700">국가대표 보험설계사 | 이지원</span>
          </div>
          
          <h1 className="text-3xl md:text-6xl font-black mb-6 tracking-tighter leading-tight title-wrapper z-10">
            <div className="mb-2">
              {"내 보험을".split('').map((char, i) => (
                <span key={`1a-${i}`} className={`inline-block title-char opacity-0`}>{char === ' ' ? '\u00A0' : char}</span>
              ))}
              <br className="block md:hidden" />
              <span className="inline-block title-char opacity-0 hidden md:inline">&nbsp;</span>
              {"누구에게".split('').map((char, i) => (
                <span key={`1b-${i}`} className={`inline-block title-char opacity-0 text-blue-600`}>{char === ' ' ? '\u00A0' : char}</span>
              ))}
              <br className="block md:hidden mt-2" />
              <span className="inline-block title-char opacity-0 hidden md:inline">&nbsp;</span>
              {"맡기느냐에 따라".split('').map((char, i) => (
                <span key={`1c-${i}`} className={`inline-block title-char opacity-0 ${i <= 3 ? 'text-blue-600' : ''}`}>{char === ' ' ? '\u00A0' : char}</span>
              ))}
            </div>
            <div>
              {"내 미래가".split('').map((char, i) => (
                <span key={`2a-${i}`} className={`inline-block title-char opacity-0 ${i >= 2 ? 'text-blue-600' : ''}`}>{char === ' ' ? '\u00A0' : char}</span>
              ))}
              <br className="block md:hidden" />
              <span className="inline-block title-char opacity-0 hidden md:inline">&nbsp;</span>
              {"180도".split('').map((char, i) => (
                <span key={`2b-${i}`} className={`inline-block title-char opacity-0 text-blue-600`}>{char === ' ' ? '\u00A0' : char}</span>
              ))}
              <br className="block md:hidden mt-2" />
              <span className="inline-block title-char opacity-0 hidden md:inline">&nbsp;</span>
              {"달라집니다.".split('').map((char, i) => (
                <span key={`2c-${i}`} className={`inline-block title-char opacity-0`}>{char === ' ' ? '\u00A0' : char}</span>
              ))}
            </div>
          </h1>

          <div className="reveal-stagger-container flex flex-col items-center z-10 w-full mb-6">
            <div className="inline-block p-6 md:p-8 bg-white/70 backdrop-blur-md rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white reveal-item">
              <p className="text-base md:text-xl text-gray-800 font-medium leading-loose md:leading-loose">
                <span className="text-gray-900 font-bold block mb-3 text-xl md:text-3xl" style={{ boxShadow: 'inset 0 -0.4em 0 rgba(0, 82, 204, 0.2)' }}>가입은 끝이 아니라 시작입니다.</span>
                <span className="inline-block mt-2">차별화된 전문성으로 당신의 미래를 정직하게 설계합니다.</span>
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 mt-6">
              <div className="reveal-item flex items-center gap-3 p-4 bg-white shadow-xl rounded-2xl border border-gray-100 text-base md:text-lg font-bold whitespace-nowrap">
                <CheckCircle2 className="text-blue-600 w-5 h-5 flex-shrink-0" /> 의학적 지식에 기반한 전문분석
              </div>
              <div className="reveal-item flex items-center gap-3 p-4 bg-white shadow-xl rounded-2xl border border-gray-100 text-base md:text-lg font-bold whitespace-nowrap">
                <ShieldCheck className="text-blue-600 w-5 h-5 flex-shrink-0" /> 평생 함께하는 사후관리서비스
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 마키 텍스트 슬라이더 */}
      <div className="py-5 bg-accent-blue text-white overflow-hidden select-none border-y border-white/10">
        <div className="marquee-container font-bold text-sm tracking-widest">
          {[
            "의료실비", "암보험", "유병자보험", "연금보험", "간병보험", "태아보험", 
            "종신보험", "상해보험", "화재보험", "펫보험", "운전자보험"
          ].map((item, idx) => (
            <React.Fragment key={idx}>
              <span className="mx-10">{item}</span><span>•</span>
            </React.Fragment>
          ))}
          {[
            "의료실비", "암보험", "유병자보험", "연금보험", "간병보험", "태아보험", 
            "종신보험", "상해보험", "화재보험", "펫보험", "운전자보험"
          ].map((item, idx) => (
            <React.Fragment key={`dup-${idx}`}>
              <span className="mx-10">{item}</span><span>•</span>
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* 프로필 섹션 */}
      <section id="about" className="py-32 px-6 bg-white">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-16 items-center">
          <div className="w-full lg:w-5/12 relative reveal flex justify-center order-2 lg:order-1 pt-8 lg:pt-0">
            <div className="img-container w-full max-w-[480px] lg:max-w-none lg:w-full cursor-pointer relative z-0">
              <div className="img-glow-effect"></div>
              <img src="https://i.imgur.com/SYFmFzw.png" alt="보험국대 이지원" className="w-full h-auto drop-shadow-2xl rounded-2xl" />
              <div className="absolute -bottom-6 -right-6 bg-white p-6 md:p-8 rounded-3xl shadow-2xl border border-gray-100 text-right">
                <p className="text-xl font-bold text-gray-900 mb-1">이지원 팀장</p>
                <p className="text-sm font-bold text-blue-600 mb-1">Professional</p>
                <p className="text-xl md:text-3xl font-black text-gray-900">의료경력 15년</p>
              </div>
            </div>
          </div>

          <div className="w-full lg:w-7/12 flex flex-col gap-8 order-1 lg:order-2">
            <div className="space-y-4">
              <h2 className="text-4xl md:text-6xl font-black tracking-tighter leading-tight reveal">
                의료를 아는<br /><span className="text-blue-600 underline">진짜 전문가</span>
              </h2>
            </div>
            
            <div className="border-l-4 border-blue-600 pl-5 py-2">
              <p className="text-xl md:text-2xl font-bold text-gray-800">국가대표 보험설계사 이지원 팀장</p>
            </div>

            <div className="space-y-6 text-gray-600 text-[1.1rem]">
              <p className="about-typewriter bg-gray-50 p-6 rounded-2xl italic text-gray-700 leading-relaxed font-medium">
                {"\"수많은 환자분들을 보며 느꼈습니다. 제대로 된 보험 하나가 삶을 어떻게 지탱해 주고, 반대로 잘못된 설계가 얼마나 큰 비극이 되는지.. 저 또한 예기치 못한 사고 and 암으로 삶의 무게를 온몸으로 느껴보았습니다. 그렇기에 더욱 잘 알고있습니다. 능력있는 설계사를 만나는것이 얼마나 중요한지를요. 견고한 양심과 정직함으로 신뢰를 쌓아가겠습니다.\"".split('').map((char, i) => (
                  <span key={`about-${i}`} className="about-char opacity-0">{char}</span>
                ))}
              </p>
              
              <ul className="space-y-4 mt-8 font-semibold text-gray-800 tracking-tight text-[1.05rem] reveal-stagger-container">
                <li className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl reveal-item">
                  <CheckCircle2 className="text-blue-600 w-6 h-6 flex-shrink-0" />
                  <span className="leading-snug">임상병리사 출신</span>
                </li>
                <li className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl reveal-item">
                  <CheckCircle2 className="text-blue-600 w-6 h-6 flex-shrink-0" />
                  <span className="leading-snug">병원급 의료기관 검사실 근무</span>
                </li>
                <li className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl reveal-item">
                  <CheckCircle2 className="text-blue-600 w-6 h-6 flex-shrink-0" />
                  <span className="leading-snug">전국 5대 수탁검사센터 검사 | 분석 | 결과상담 | 보험청구 | 학술교육 업무 경력 13년</span>
                </li>
                <li className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl reveal-item">
                  <CheckCircle2 className="text-blue-600 w-6 h-6 flex-shrink-0" />
                  <span className="leading-snug">손해보험 설계사 자격 보유</span>
                </li>
                <li className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl reveal-item">
                  <CheckCircle2 className="text-blue-600 w-6 h-6 flex-shrink-0" />
                  <span className="leading-snug">제3보험 설계사 자격 보유</span>
                </li>
                <li className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl reveal-item">
                  <CheckCircle2 className="text-blue-600 w-6 h-6 flex-shrink-0" />
                  <span className="leading-snug">생명보험 설계사 자격 보유</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* 철학 및 리뷰 섹션 */}
      <section id="vision" className="py-32 bg-gray-900 text-white px-6">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-5xl md:text-7xl font-bold mb-20 tracking-tight reveal leading-[1.3] md:leading-tight">
            보험국대의<br className="md:hidden" /> 
            <span className="relative inline-block mt-2 md:mt-0 ml-0 md:ml-4 group">
              <span className="relative z-10">세가지 약속</span>
              <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[115%] h-[150%] text-red-600 pointer-events-none z-0">
                 <svg viewBox="0 0 100 50" preserveAspectRatio="none" className="w-full h-full overflow-visible">
                   <path d="M 50 8 C 80 8, 95 20, 93 25 C 90 35, 75 42, 50 42 C 25 42, 10 35, 8 25 C 5 15, 20 8, 50 8" 
                         fill="none" stroke="currentColor" strokeWidth="2.0" strokeLinecap="round" strokeDasharray="200" strokeDashoffset="200"
                         className="reveal-circle opacity-80" filter="url(#rough-brush)" />
                 </svg>
              </span>
              <svg className="hidden">
                  <defs>
                      <filter id="rough-brush">
                          <feTurbulence type="fractalNoise" baseFrequency="0.7" numOctaves="3" result="noise" />
                          <feDisplacementMap in="SourceGraphic" in2="noise" scale="3" xChannelSelector="R" yChannelSelector="G" />
                      </filter>
                  </defs>
              </svg>
            </span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-16">
            <div className="reveal">
              <h4 className="text-2xl font-bold mb-4 text-blue-400">01. 정직</h4>
              <p className="text-gray-100 text-lg md:text-xl leading-relaxed">내 가족의 보험을 설계한다는 마음으로 불필요한 거품은 모두 걷어냅니다.</p>
            </div>
            <div className="reveal">
              <h4 className="text-2xl font-bold mb-4 text-blue-400">02. 책임</h4>
              <p className="text-gray-100 text-lg md:text-xl leading-relaxed">가입은 시작일 뿐입니다. 가입부터 청구까지 모두 책임지고 함께 합니다.</p>
            </div>
            <div className="reveal">
              <h4 className="text-2xl font-bold mb-4 text-blue-400">03. 전문성</h4>
              <p className="text-gray-100 text-lg md:text-xl leading-relaxed">수탁검사센터에서 10여간 검사, 해석, 상담, 청구 업무를 했던 구력으로 어떤 상황에서도 든든한 보장을 약속합니다.</p>
            </div>
          </div>
          
          <ReviewSection />
        </div>
      </section>

      {/* 연락처 및 QR 코드 섹션 */}
      <section id="contact" className="py-40 px-6 text-center">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-5xl md:text-8xl font-black tracking-tighter mb-12 reveal">
            지금 당신의 미래를<br /><span className="text-red-500 animate-fast-blink">점검</span>하세요.
          </h2>
          <div className="flex flex-col items-center gap-10 reveal">
            <div className="flex flex-col items-center gap-8">
              <div className="relative">
                <span className="text-3xl md:text-6xl font-light border-b-4 border-blue-600 animate-normal-blink pb-2 transition-all cursor-default text-gray-900 flex items-center justify-center gap-3">
                  <span className="text-red-500 text-2xl md:text-5xl">📞</span> 010. 9366. 1009
                </span>
              </div>
              <button 
                onClick={openModal} 
                className="bg-accent-blue text-white px-10 py-4 rounded-full font-bold text-lg hover:scale-105 transition-transform shadow-xl inline-flex items-center gap-3"
              >
                무료 상담 신청 <ArrowRight className="w-5 h-5" />
              </button>
            </div>
            
            <div className="flex flex-col md:flex-row gap-8 lg:gap-12 items-center justify-center mt-4 w-full">
              <div className="space-y-4 flex flex-col items-center">
                <p className="text-gray-500 font-bold tracking-widest text-xl">카카오톡</p>
                <a href="http://pf.kakao.com/_gxiHKX" target="_blank" rel="noreferrer" className="text-blue-600 font-medium hover:underline text-sm md:text-base cursor-pointer">http://pf.kakao.com/_gxiHKX</a>
                <a href="http://pf.kakao.com/_gxiHKX" target="_blank" rel="noreferrer" className="w-32 h-32 md:w-44 md:h-44 p-2 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center overflow-hidden shadow-sm hover:shadow-md transition-shadow cursor-pointer block">
                   <img src="https://api.qrserver.com/v1/create-qr-code/?size=256x256&data=http://pf.kakao.com/_gxiHKX&margin=0" alt="카카오톡 상담 QR 코드" className="w-full h-full object-cover mix-blend-multiply hover:scale-105 transition-transform" />
                </a>
              </div>
              
              <div className="space-y-4 flex flex-col items-center">
                <p className="text-gray-500 font-bold tracking-widest text-xl">유튜브</p>
                <a href="https://www.youtube.com/@보험국대" target="_blank" rel="noreferrer" className="text-blue-600 font-medium hover:underline text-sm md:text-base cursor-pointer">https://www.youtube.com/@보험국대</a>
                <a href="https://www.youtube.com/@보험국대" target="_blank" rel="noreferrer" className="w-32 h-32 md:w-44 md:h-44 p-2 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center overflow-hidden shadow-sm hover:shadow-md transition-shadow cursor-pointer block">
                   <img src="https://api.qrserver.com/v1/create-qr-code/?size=256x256&data=https://www.youtube.com/@보험국대&margin=0" alt="유튜브 QR 코드" className="w-full h-full object-cover mix-blend-multiply hover:scale-105 transition-transform" />
                </a>
              </div>

              <div className="space-y-4 flex flex-col items-center">
                <p className="text-gray-500 font-bold tracking-widest text-xl">블로그</p>
                <a href="https://blog.naver.com/nopain1009" target="_blank" rel="noreferrer" className="text-blue-600 font-medium hover:underline text-sm md:text-base cursor-pointer">https://blog.naver.com/nopain1009</a>
                <a href="https://blog.naver.com/nopain1009" target="_blank" rel="noreferrer" className="w-32 h-32 md:w-44 md:h-44 p-2 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center overflow-hidden shadow-sm hover:shadow-md transition-shadow cursor-pointer block">
                   <img src="https://api.qrserver.com/v1/create-qr-code/?size=256x256&data=https://blog.naver.com/nopain1009&margin=0" alt="블로그 QR 코드" className="w-full h-full object-cover mix-blend-multiply hover:scale-105 transition-transform" />
                </a>
              </div>
            </div>
            <p className="text-sm text-gray-500 bg-gray-50 px-5 py-3 rounded-full mt-6 border border-gray-100 shadow-sm">성함과 연락처를 남겨주시면 순차적으로 연락드리겠습니다.</p>
          </div>
        </div>
      </section>

      <footer className="py-12 text-center border-t border-gray-50 text-gray-400 text-xs tracking-widest font-medium">
        nopain1009@naver.com
      </footer>

      {/* 상담 예약 모달 창 */}
      {isQRModalOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto" onClick={() => setIsQRModalOpen(false)}>
          <div className="bg-white p-8 md:p-12 rounded-[2rem] shadow-2xl flex flex-col gap-6 relative max-w-lg w-full my-auto" onClick={e => e.stopPropagation()}>
            <button onClick={() => setIsQRModalOpen(false)} className="absolute top-6 right-6 text-gray-400 hover:text-gray-900 transition-colors">
              <X className="w-6 h-6" />
            </button>
            <div className="text-left space-y-2 mb-2">
              <h3 className="text-3xl md:text-4xl font-black text-gray-900 tracking-tight">상담 신청</h3>
              <p className="text-sm font-semibold text-blue-600">전문적인 보장 자산을 설계해 드립니다.</p>
            </div>
            
            <form onSubmit={handleConsultationSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">이름 *</label>
                <input 
                  type="text" 
                  required
                  maxLength={100}
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 outline-none transition-all placeholder:text-gray-300"
                  placeholder="홍길동"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">연락처 *</label>
                <input 
                  type="tel" 
                  required
                  maxLength={20}
                  value={formData.phone}
                  onChange={e => setFormData({...formData, phone: e.target.value})}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 outline-none transition-all placeholder:text-gray-300"
                  placeholder="010-0000-0000"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">상담 가능 시간 *</label>
                <select 
                  value={formData.timeRange}
                  onChange={e => setFormData({...formData, timeRange: e.target.value})}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 outline-none transition-all bg-white"
                >
                  {timeOptions.map(time => (
                    <option key={time} value={time}>{time}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">문의사항</label>
                <textarea 
                  rows={4}
                  maxLength={2000}
                  value={formData.inquiry}
                  onChange={e => setFormData({...formData, inquiry: e.target.value})}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 outline-none transition-all resize-none placeholder:text-gray-300"
                  placeholder="현재 가입되어 있는 보험 점검 및 암보험 리모델링 문의드립니다."
                />
              </div>

              <button 
                type="submit" 
                disabled={isSubmitting}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-lg py-4 rounded-xl transition-colors mt-2 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isSubmitting ? <Loader2 className="w-6 h-6 animate-spin" /> : '상담 신청하기'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 관리자 모달 연동 */}
      <AdminModal isOpen={isAdminOpen} onClose={() => setIsAdminOpen(false)} />
    </>
  );
}
