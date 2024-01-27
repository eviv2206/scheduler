export const useCalendar = () => {
    async function createEvents(events, token, calendarId) {
        events.forEach((day) => {
            day.classes.forEach(async (event) => await fetch(`https://www.googleapis.com/calendar/v3/calendars/${calendarId}/events`, {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${token}`,
                },
                body: JSON.stringify(transformData(event, day.date))
            }));
        })

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
            'Января': 0,
            'Февраля': 1,
            'Марта': 2,
            'Апреля': 3,
            'Мая': 4,
            'Июня': 5,
            'Июля': 6,
            'Августа': 7,
            'Сентября': 8,
            'Октября': 9,
            'Ноября': 10,
            'Декабря': 11
        };

        const parts = dateString.split(' ');
        const day = parseInt(parts[0], 10);
        const month = months[parts[1]];
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
    }
}