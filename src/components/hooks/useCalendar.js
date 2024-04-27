export const useCalendar = () => {
    async function createEvents(events, token, calendarId) {
        events.forEach((day) => {
            day.classes.forEach(async (event) => {
                if (event.subject !== '') {
                    await fetch(`https://www.googleapis.com/calendar/v3/calendars/${calendarId}/events`, {
                        method: "POST",
                        headers: {
                            "Authorization": `Bearer ${token}`,
                        },
                        body: JSON.stringify(transformData(event, day.date))
                    })
                }
            });
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
    }
}
