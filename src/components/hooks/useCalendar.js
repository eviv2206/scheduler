import { useState } from "react";

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function fetchWithRetry(url, options, retries = 3, delay = 2500) {
    try {
        const response = await fetch(url, options);
        if (!response.ok) {
            const { error } = await response.json();
            throw new Error(`Ошибка Google API: ${error.message} (${response.status})`);
        }
        return await response.json();
    } catch (err) {
        if (retries > 1) {
            console.warn(`Запрос не удался (${err.message}), повтор через ${delay / 1000} сек...`);
            await sleep(delay);
            return fetchWithRetry(url, options, retries - 1, delay);
        } else {
            console.error(`Запрос окончательно не удался после всех попыток: ${err.message}`);
            throw err; 
        }
    }
}

export const useCalendar = () => {
    const [status, setStatus] = useState('idle'); 
    const [error, setError] = useState(null);

    async function createEvents(events, token, calendarId) {
        setStatus('loading');
        setError(null);

        try {
            const promises = [];
            events.forEach((day) => {
                day.classes.forEach((event) => {
                    if (event.subject !== '') {
                        const url = `https://www.googleapis.com/calendar/v3/calendars/${calendarId}/events`;
                        const options = {
                            method: "POST",
                            headers: { "Authorization": `Bearer ${token}` },
                            body: JSON.stringify(transformData(event, day.date))
                        };
                        promises.push(fetchWithRetry(url, options));
                    }
                });
            });

            const results = await Promise.allSettled(promises);
            const failedRequests = results.filter(res => res.status === 'rejected');

            if (failedRequests.length > 0) {
                console.error("Не удалось выполнить запросы:", failedRequests);
                const errorMsg = failedRequests.map(fr => fr.reason.message).join(', ');
                throw new Error(`Не удалось добавить ${failedRequests.length} событий. Ошибки: ${errorMsg}`);
            }

            setStatus('success');
        } catch (err) {
            setError(err.message);
            setStatus('error');
        }
    }

    function resetStatus() {
        setStatus('idle');
        setError(null);
    }

    function transformData(event, date) {
        return {
            summary: `${event.subject} ${event.room} ${event.teacher}`,
            start: { dateTime: convertDateToISO(date, event.time).start, timeZone: "Europe/Moscow" },
            end: { dateTime: convertDateToISO(date, event.time).end, timeZone: "Europe/Moscow" }
        }
    }

    function convertDateToISO(dateString, timeRangeString) {
        const months = {
            'ЯНВАРЯ': 0, 'ФЕВРАЛЯ': 1, 'МАРТА': 2, 'АПРЕЛЯ': 3, 'МАЯ': 4, 'ИЮНЯ': 5,
            'ИЮЛЯ': 6, 'АВГУСТА': 7, 'СЕНТЯБРЯ': 8, 'ОКТЯБРЯ': 9, 'НОЯБРЯ': 10, 'ДЕКАБРЯ': 11
        };

        const parts = dateString.split(' ');
        const day = parseInt(parts[0], 10);
        const month = months[parts[1].toUpperCase()];
        const year = parts[2] ? parseInt(parts[2], 10) : new Date().getFullYear();

        const timeRangeParts = timeRangeString.match(/\d+/g);
        const startHour = parseInt(timeRangeParts[0], 10);
        const startMinute = parseInt(timeRangeParts[1], 10);
        const endHour = parseInt(timeRangeParts[2], 10);
        const endMinute = parseInt(timeRangeParts[3], 10);

        const startDate = new Date(year, month, day, startHour, startMinute);
        const endDate = new Date(year, month, day, endHour, endMinute);

        if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
            throw new Error(`Не удалось распознать дату: "${dateString}" или время: "${timeRangeString}"`);
        }

        return {
            start: startDate.toISOString(),
            end: endDate.toISOString()
        }
    }

    return { createEvents, status, error, resetStatus }
}