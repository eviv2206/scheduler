import { useState } from "react";

// 1. Вспомогательная функция "спать"
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function fetchWithRetry(url, options, retries = 3, delay = 2500) {
    try {
        // Пытаемся выполнить запрос
        const response = await fetch(url, options);

        // Если ответ НЕ .ok (например, 401, 404, 500), выбрасываем ошибку
        if (!response.ok) {
            const { error } = await response.json();
            throw new Error(`Ошибка Google API: ${error.message} (${response.status})`);
        }
        
        // Если все хорошо, возвращаем JSON
        return await response.json();

    } catch (err) {
        // 3. Это блок catch для ОШИБКИ (сетевой сбой ИЛИ !response.ok)

        // Проверяем, остались ли попытки
        if (retries > 1) {
            console.warn(`Запрос не удался (${err.message}), повтор через ${delay / 1000} сек...`);
            // Ждем 2.5 секунды
            await sleep(delay);
            // Вызываем эту же функцию снова, но с (retries - 1)
            return fetchWithRetry(url, options, retries - 1, delay);
        } else {
            // Попытки закончились. Выбрасываем финальную ошибку.
            console.error(`Запрос окончательно не удался после всех попыток: ${err.message}`);
            throw err; // Эта ошибка будет поймана Promise.allSettled
        }
    }
}


export const useCalendar = () => {
    const [status, setStatus] = useState('idle'); // 'idle', 'loading', 'success', 'error'
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
                            headers: {
                                "Authorization": `Bearer ${token}`,
                            },
                            body: JSON.stringify(transformData(event, day.date))
                        };

                        // 4. Вместо обычного fetch, мы добавляем в массив наш fetchWithRetry
                        promises.push(fetchWithRetry(url, options));
                    }
                });
            });

            // 5. ИСПОЛЬЗУЕМ Promise.allSettled
            // Он дождется выполнения ВСЕХ промисов, 
            // не останавливаясь на первой ошибке.
            const results = await Promise.allSettled(promises);

            // 6. Проверяем результаты
            const failedRequests = results.filter(res => res.status === 'rejected');

            if (failedRequests.length > 0) {
                // Если есть хотя бы 1 ошибка ПОСЛЕ всех попыток
                console.error("Не удалось выполнить запросы:", failedRequests);
                // Собираем сообщения об ошибках
                const errorMsg = failedRequests
                    .map(fr => fr.reason.message) // fr.reason - это ошибка, которую мы выбросили
                    .join(', ');
                
                throw new Error(`Не удалось добавить ${failedRequests.length} событий. Ошибки: ${errorMsg}`);
            }

            // Если failedRequests.length === 0, значит все успешно
            setStatus('success');

        } catch (err) {
            // 7. Этот catch теперь ловит ошибки парсинга
            // ИЛИ ошибки, которые мы выбросили ПОСЛЕ проверки allSettled
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

    // ❗️ ВАЖНО: Я также оставил исправление для `convertDateToISO`
    function convertDateToISO(dateString, timeRangeString) {
        const months = {
            'ЯНВАРЯ': 0, 'ФЕВРАЛЯ': 1, 'МАРТА': 2, 'АПРЕЛЯ': 3, 'МАЯ': 4, 'ИЮНЯ': 5,
            'ИЮЛЯ': 6, 'АВГУСТА': 7, 'СЕНТЯБРЯ': 8, 'ОКТЯБРЯ': 9, 'НОЯБРЯ': 10, 'ДЕКАБРЯ': 11
        };

        const parts = dateString.split(' ');
        const day = parseInt(parts[0], 10);
        const month = months[parts[1].toUpperCase()];
        
        // Используем текущий год, если год не указан
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

    return {
        createEvents,
        status,
        error,
        resetStatus,
    }
}