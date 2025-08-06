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
    console.log('ChallengeCalendar props:', { startDate, endDate, certifications, status });

    const getTodayString = () => {
        const today = new Date();
        const koreaTime = new Date(today.getTime() + 9 * 60 * 60 * 1000);
        return koreaTime.toISOString().split('T')[0];
    };

    const generateCalendar = (): CalendarDay[][] => {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        const firstDay = new Date(year, month, 1);
        const start = new Date(firstDay);
        start.setDate(start.getDate() - firstDay.getDay());

        // 날짜 문자열을 직접 비교하기 위해 YYYY-MM-DD 형식으로 변환
        const challengeStartStr = startDate;
        const challengeEndStr = endDate;

        const todayStr = getTodayString();
        const today = new Date();
        const weeks: CalendarDay[][] = [];
        let currentWeek: CalendarDay[] = [];

        // 디버깅을 위한 로그
        console.log('Calendar generation debug:', {
            challengeStartStr,
            challengeEndStr,
            today: today.toISOString(),
            todayStr
        });

        for (let i = 0; i < 42; i++) {
            const date = new Date(start);
            date.setDate(start.getDate() + i);
            const dateStr = date.toISOString().split('T')[0];

            // certifications 객체에서 해당 날짜의 인증 상태 확인
            const isCertified = certifications[dateStr] === true || certifications[dateStr] === 'true' || certifications[dateStr] === 1;
            const isCurrentMonth = date.getMonth() === month;
            const isToday = dateStr === todayStr;
            
            // 날짜 문자열로 직접 비교하여 시간대 문제 해결
            const isInChallengeRange = dateStr >= challengeStartStr && dateStr <= challengeEndStr;
            
            // 미인증 조건: 과거 날짜이고 챌린지 기간 내이며 인증되지 않은 경우
            const isMissed = dateStr < todayStr && isInChallengeRange && !isCertified;

            // 디버깅을 위한 로그
            if (isInChallengeRange) {
                console.log(`Date: ${dateStr}, isCertified: ${isCertified}, isMissed: ${isMissed}, certifications[dateStr]: ${certifications[dateStr]}, dateStr < todayStr: ${dateStr < todayStr}`);
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