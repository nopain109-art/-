import React, { useEffect, useState, useRef } from 'react';
import gsap from 'gsap';

const reviewsPool = [
    { name: "이정현", review: "몇 년 전에 가입했던 보험인데 실제 상황이 생기고 나서야 구조를 이해했습니다. 그때 설명이 그대로 맞아떨어졌습니다." },
    { name: "김민수", review: "사고 이후 보험금 청구 과정이 너무 복잡해서 막막했는데, 하나씩 정리해주셔서 겨우 끝냈습니다." },
    { name: "박지훈", review: "입원 중이라 정신이 없었는데 필요한 것만 딱 집어서 안내해줘서 그대로 진행했습니다." },
    { name: "최현우", review: "예전에 들었던 설명이 실제 상황에서 그대로 적용되는 걸 보고 신뢰가 생겼습니다." },
    { name: "정다은", review: "가족 치료 때문에 정신없던 시기였는데 중간에서 계속 체크해줘서 많이 도움됐습니다." },
    { name: "강민재", review: "보험은 가입보다 이후가 중요하다는 걸 이번에 확실히 느꼈습니다." },
    { name: "윤서연", review: "급하게 연락드렸는데 바로 정리 방향을 잡아주셔서 훨씬 수월했습니다." },
    { name: "조현우", review: "처음에는 그냥 맡겼는데 실제 상황에서 그 선택이 맞았다는 걸 알게 됐습니다." },
    { name: "한지민", review: "아버지 수술 이후 보험 처리 과정이 복잡했는데 전부 같이 진행해주셨습니다." },
    { name: "오세훈", review: "보험이 실제로 도움이 되는 순간을 처음 경험했습니다." },
    { name: "서유진", review: "설계 차이가 실제 청구 단계에서 크게 느껴졌습니다." },
    { name: "신동현", review: "전화 한 통으로 전체 흐름이 잡혀서 그대로 따라갔습니다." },
    { name: "문지우", review: "몇 년 전 가입이라 기억도 없었는데 모든 내용을 다시 정리해주셨습니다." },
    { name: "배성호", review: "대응 속도가 빨라서 문제 없이 처리할 수 있었습니다." },
    { name: "허지훈", review: "보험은 관리가 핵심이라는 걸 이번에 알게 됐습니다." },
    { name: "유나영", review: "예상 못한 상황이었는데 해야 할 일을 단계별로 알려주셔서 정리됐습니다." },
    { name: "고민재", review: "계속 체크해줘서 놓치는 부분 없이 처리할 수 있었습니다." },
    { name: "임수아", review: "설명 들을 때보다 실제 상황에서 구조가 더 명확하게 이해됐습니다." },
    { name: "장우진", review: "처음엔 단순 가입이었는데 결과적으로는 관리 서비스 느낌이었습니다." },
    { name: "백승현", review: "가족 입장에서 정말 필요한 역할을 해주셨습니다." }
];

function maskName(name: string) {
    if (name.length === 2) return name[0] + "*";
    if (name.length === 3) return name[0] + "*" + name[2];
    return name[0] + "*".repeat(name.length - 2) + name[name.length - 1];
}

const usedIndexes = new Set<number>();

function getRandomReviewIndex() {
    // 다 썼으면 초기화 (무한 반복 구조)
    if (usedIndexes.size === reviewsPool.length) {
        usedIndexes.clear();
    }

    let index;

    do {
        index = Math.floor(Math.random() * reviewsPool.length);
    } while (usedIndexes.has(index));

    usedIndexes.add(index);

    return index;
}

export function ReviewSection() {
    const [current, setCurrent] = useState(() => getRandomReviewIndex());
    const cardRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const interval = setInterval(() => {
            gsap.to(cardRef.current, {
                opacity: 0,
                scale: 0.9,
                duration: 0.4,
                onComplete: () => {
                    setCurrent(getRandomReviewIndex());
                    gsap.fromTo(cardRef.current,
                        { opacity: 0, scale: 1.1, y: 20 },
                        {
                            opacity: 1,
                            scale: 1,
                            y: 0,
                            duration: 0.8,
                            ease: "power3.out"
                        }
                    );
                }
            });
        }, 2000);

        return () => clearInterval(interval);
    }, []);

    return (
        <div className="mt-40 overflow-hidden relative reveal">
            <h3 className="text-3xl md:text-4xl font-black mb-16 text-center tracking-tight text-white px-4">
                실제 고객님들의 이야기
            </h3>

            <div className="relative h-[220px] flex items-center justify-center px-6">
                {/* REVIEW CARD */}
                <div 
                    ref={cardRef}
                    className="absolute bg-gray-800 text-gray-100 rounded-3xl shadow-2xl px-8 py-10 max-w-2xl w-full border border-gray-700/50"
                >
                    <div className="flex flex-col gap-6">
                        <p className="text-xl md:text-2xl leading-relaxed font-medium text-white break-keep text-center">
                            "{reviewsPool[current].review}"
                        </p>

                        <div className="flex items-center justify-between border-t border-gray-700 pt-6">
                            <span className="font-bold text-blue-400 tracking-wide text-lg">
                                {maskName(reviewsPool[current].name)} 고객님
                            </span>
                            <span className="text-sm text-gray-400">
                                상담 후기
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
