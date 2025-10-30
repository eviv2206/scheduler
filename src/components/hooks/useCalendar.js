import { useState } from "react";

export const useCalendar = () => {
    const [status, setStatus] = useState('idle'); // 'idle', 'loading', 'success', 'error'
    const [error, setError] = useState(null);

    async function createEvents(events, token, calendarId) {
        setStatus('loading');
        setError(null);

        const promises = [];
        events.forEach((day) => {
            day.classes.forEach((event) => {
                if (event.subject !== '') {
                    const fetchPromise = fetch(`https://www.googleapis.com/calendar/v3/calendars/${calendarId}/events`, {
                        method: "POST",
                        headers: {
                            "Authorization": `Bearer ${token}`,
                        },
                        body: JSON.stringify(transformData(event, day.date))
                    })
                    .then(async response => {
                        if (!response.ok) {
                            const { error } = await response.json();
                            throw new Error(`Ошибка Google API: ${error.message}`);
                        }
                        return response.json();
                    });
                    
                    promises.push(fetchPromise);
                }
            });
        });

        // 6. Выполняем все запросы параллельно и ждем их завершения
        try {
            await Promise.all(promises);
            setStatus('success');
        } catch (err) {
            setError(err.message);
            setStatus('error');
        }
    }

    // 9. Функция для сброса состояния (например, при загрузке нового файла)
    function resetStatus() {
        setStatus('idle');
        setError(null);
    }

    function transformData(event, date) {
        return {
            summary: `${event.subject} ${event.room} ${event.teacher}`,
            start: {
                dateTime: convertDateToISO(date, event.time).start,
                timeZone: "Europe/Moscow"
            },
            end: {
                dateTime: convertDateToISO(date, event.time).end,
                timeZone: "Europe/Moscow"
            }
        }
    }

    function convertDateToISO(dateString, timeRangeString) {
        const months = {
            'ЯНВАРЯ': 0,
            'ФЕВРАЛЯ': 1,
            'МАРТА': 2,
            'АПРЕЛЯ': 3,
            'МАЯ': 4,
            'ИЮНЯ': 5,
            'ИЮЛЯ': 6,
            'АВГУСТА': 7,
            'СЕНТЯБРЯ': 8,
            'ОКТЯБРЯ': 9,
            'НОЯБРЯ': 10,
            'ДЕКАБРЯ': 11
        };

        const parts = dateString.split(' ');
        const day = parseInt(parts[0], 10);
        const month = months[parts[1].toUpperCase()];
        const year = parseInt(parts[2], 10);

        const timeRangeParts = timeRangeString.match(/\d+/g);
        const startHour = parseInt(timeRangeParts[0], 10);
        const startMinute = parseInt(timeRangeParts[1], 10);
        const endHour = parseInt(timeRangeParts[2], 10);
        const endMinute = parseInt(timeRangeParts[3], 10);

        const startDate = new Date(year, month, day, startHour, startMinute);
        const endDate = new Date(year, month, day, endHour, endMinute);

        return {
            start: startDate.toISOString(),
            end: endDate.toISOString()
        }
    }

return {
        createEvents,
        status,
        error,
        resetStatus,
    }
}
