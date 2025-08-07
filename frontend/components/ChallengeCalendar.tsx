// ✅ 공통 Calendar 컴포넌트 (ChallengeCalendar.tsx)
'use client';

import React, { useState } from 'react';

interface CalendarDay {
    date: number;
    dateStr: string;
    isCurrentMonth: boolean;
    isToday: boolean;
    isCertified: boolean;
    isInChallengeRange: boolean;
    isMissed?: boolean;
}

interface ChallengeCalendarProps {
    startDate: string;
    endDate: string;
    certifications: Record<string, any>;
    status: 'active' | 'completed';
}

export default function ChallengeCalendar({ startDate, endDate, certifications, status }: ChallengeCalendarProps) {
    const [currentDate, setCurrentDate] = useState(new Date());

    // 디버깅을 위한 로그
    console.log('ChallengeCalendar props:', { 
      startDate, 
      endDate, 
      certifications, 
      certificationsType: typeof certifications,
      certificationsIsArray: Array.isArray(certifications),
      status 
    });

    const getTodayString = () => {
        // 한국 시간대로 오늘 날짜를 가져오되, 시간대 변환으로 인한 날짜 변경을 방지
        const today = new Date();
        const year = today.getFullYear();
        const month = today.getMonth();
        const day = today.getDate();
        
        // 한국 시간대로 날짜 생성 (정오 시간으로 설정하여 시간대 문제 방지)
        const koreaDate = new Date(year, month, day, 12, 0, 0, 0);
        return koreaDate.toISOString().split('T')[0];
    };

    const generateCalendar = (): CalendarDay[][] => {
        const month = currentDate.getMonth();
        const year = currentDate.getFullYear();
        const start = new Date(year, month, 1);
        const end = new Date(year, month + 1, 0);
        const firstDay = new Date(year, month, 1);
        start.setDate(start.getDate() - firstDay.getDay());

        // 날짜 문자열을 직접 비교하기 위해 YYYY-MM-DD 형식으로 변환
        const challengeStartStr = startDate;
        const challengeEndStr = endDate;

        const todayStr = getTodayString();
        const today = new Date();
        const weeks: CalendarDay[][] = [];
        let currentWeek: CalendarDay[] = [];

            // certifications 객체가 undefined인 경우 빈 객체로 초기화
    const safeCertifications = certifications && typeof certifications === 'object' ? certifications : {};

        // 디버깅을 위한 로그
        console.log('Calendar generation debug:', {
            challengeStartStr,
            challengeEndStr,
            today: today.toISOString(),
            todayStr,
            certifications: safeCertifications
        });

        for (let i = 0; i < 42; i++) {
            const date = new Date(start);
            date.setDate(start.getDate() + i);
            
            // 날짜를 한국 시간대로 처리 (정오 시간으로 설정)
            const year = date.getFullYear();
            const month = date.getMonth();
            const day = date.getDate();
            const koreaDate = new Date(year, month, day, 12, 0, 0, 0);
            const dateStr = koreaDate.toISOString().split('T')[0];

            // certifications 객체에서 해당 날짜의 인증 상태 확인 (안전하게)
            const isCertified = safeCertifications[dateStr] === true || safeCertifications[dateStr] === 'true' || safeCertifications[dateStr] === 1;
            const isCurrentMonth = date.getMonth() === month;
            const isToday = dateStr === todayStr;
            
            // 날짜 문자열로 직접 비교하여 시간대 문제 해결
            const isInChallengeRange = dateStr >= challengeStartStr && dateStr <= challengeEndStr;
            
            // 미인증 조건: 과거 날짜이고 챌린지 기간 내이며 인증되지 않은 경우
            const isMissed = dateStr < todayStr && isInChallengeRange && !isCertified;

            // 디버깅을 위한 로그 (챌린지 기간 내의 날짜만)
            if (isInChallengeRange) {
                console.log(`Date: ${dateStr}, isCertified: ${isCertified}, isMissed: ${isMissed}, certifications[dateStr]: ${safeCertifications[dateStr]}, dateStr < todayStr: ${dateStr < todayStr}`);
            }

            currentWeek.push({
                date: date.getDate(),
                dateStr,
                isCurrentMonth,
                isToday,
                isCertified,
                isInChallengeRange,
                isMissed
            });

            if (currentWeek.length === 7) {
                weeks.push(currentWeek);
                currentWeek = [];
            }
        }

        return weeks;
    };

    const navigateMonth = (direction: 'prev' | 'next') => {
        const newDate = new Date(currentDate);
        newDate.setMonth(direction === 'prev' ? currentDate.getMonth() - 1 : currentDate.getMonth() + 1);
        setCurrentDate(newDate);
    };

    // 챌린지 상태에 따라 기본 월 설정 (초기 로드 시에만)
    React.useEffect(() => {
        if (startDate) {
            let targetDate;
            
            if (status === 'completed') {
                // 완료된 챌린지: 시작일이 포함된 월
                targetDate = new Date(startDate);
            } else {
                // 진행중인 챌린지: 오늘 날짜가 포함된 월
                targetDate = new Date();
            }
            
            setCurrentDate(new Date(targetDate.getFullYear(), targetDate.getMonth(), 1));
        }
    }, [startDate, status]);

    const calendar = generateCalendar();
    const monthNames = ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'];
    const dayNames = ['일', '월', '화', '수', '목', '금', '토'];

    return (
        <div>
            <div className="flex justify-between items-center mb-4">
                <button onClick={() => navigateMonth('prev')}><i className="ri-arrow-left-s-line" /></button>
                <h4>{currentDate.getFullYear()}년 {monthNames[currentDate.getMonth()]}</h4>
                <button onClick={() => navigateMonth('next')}><i className="ri-arrow-right-s-line" /></button>
            </div>

            <div className="grid grid-cols-7 gap-2 text-xs text-center mb-2 text-gray-600">
                {dayNames.map((d) => <div key={d}>{d}</div>)}
            </div>

            {calendar.map((week, weekIdx) => (
            <div key={weekIdx} className="grid grid-cols-7 gap-2 mb-1">
                {week.map((day, dayIdx) => {
                let className = 'aspect-square flex items-center justify-center rounded text-sm font-medium ';
                
                if (!day.isCurrentMonth) {
                    className += ' text-gray-300';
                } else if (!day.isInChallengeRange) {
                    className += ' text-gray-400';
                } else if (day.isCertified) {
                    className += ' bg-green-500 text-white';
                } else if (day.isMissed) {
                    className += ' bg-red-500 text-white';
                } else {
                    className += ' bg-gray-100 text-gray-700';
                }

                return (
                    <div key={dayIdx} className={className}>
                    {day.date}
                    </div>
                );
                })}
            </div>
            ))}

            <div className="flex items-center justify-center gap-6 mt-4 text-xs">
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-500 rounded" />
                    <span className="text-gray-600">인증 완료</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-red-500 rounded" />
                    <span className="text-gray-600">미인증</span>
                </div>
            </div>
        </div>
    );
}