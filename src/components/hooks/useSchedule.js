const TEACHER_NAME = "Дубик Д."; 

// КОНСТАНТА ДЛЯ КЛАССОВ:
const TARGET_CLASSES = ["6а", "6б", "6в", "6г"]; 

// КОНСТАНТА ДЛЯ ПРЕДМЕТА (можно использовать часть слова, чтобы точно найти)
const TARGET_SUBJECT = "англ"; 

const TIMES_MON_WED = [
    "08:00 - 08:45", "09:00 - 09:45", "10:00 - 10:45", "11:00 - 11:45", 
    "12:00 - 12:45", "13:00 - 13:45", "14:00 - 14:45", "15:00 - 15:45", 
    "16:00 - 16:45", "16:55 - 17:40", "17:50 - 18:35", "18:45 - 19:30" 
];

const TIMES_THU_FRI = [
    "08:25 - 09:10", "09:20 - 10:05", "10:15 - 11:00", "11:10 - 11:55", 
    "12:05 - 12:50", "13:00 - 13:45", "14:15 - 15:00", "15:10 - 15:55", 
    "16:05 - 16:50", "17:00 - 17:45", "17:50 - 18:35", "18:45 - 19:30" 
];

const getLessonTime = (lessonNumber, dayKey) => {
    const index = parseInt(lessonNumber, 10) - 1;
    if (dayKey === 'thursday' || dayKey === 'friday') {
        return TIMES_THU_FRI[index] || "00:00 - 00:00"; 
    } else {
        return TIMES_MON_WED[index] || "00:00 - 00:00";
    }
};

const getTargetWeekDates = () => {
    const dates = [];
    const today = new Date();
    const dayOfWeek = today.getDay(); 

    let targetMonday = new Date(today);

    if (dayOfWeek === 6) {
        targetMonday.setDate(today.getDate() + 2); 
    } else if (dayOfWeek === 0) {
        targetMonday.setDate(today.getDate() + 1); 
    } else {
        const diff = today.getDate() - dayOfWeek + 1; 
        targetMonday.setDate(diff);
    }

    targetMonday.setHours(0, 0, 0, 0);

    const monthNames = ['ЯНВАРЯ', 'ФЕВРАЛЯ', 'МАРТА', 'АПРЕЛЯ', 'МАЯ', 'ИЮНЯ', 'ИЮЛЯ', 'АВГУСТА', 'СЕНТЯБРЯ', 'ОКТЯБРЯ', 'НОЯБРЯ', 'ДЕКАБРЯ'];
    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'];
    const daysRu = ['Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница'];

    for (let i = 0; i < 5; i++) {
        const d = new Date(targetMonday);
        d.setDate(targetMonday.getDate() + i);
        dates.push({
            key: days[i],
            dayOfWeek: daysRu[i],
            date: `${d.getDate()} ${monthNames[d.getMonth()]} ${d.getFullYear()}`
        });
    }
    return dates;
};

export const useSchedule = () => {
    const getGroup = () => {
        return TARGET_CLASSES.length > 0 ? TARGET_CLASSES.join(", ") : "Все классы";
    };

    const fileToBase64 = (file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result.split(',')[1]);
            reader.onerror = error => reject(error);
        });
    };

    const createSchedule = async (file) => {
        try {
            const base64Data = await fileToBase64(file);
            
            // ❗️ ВАЖНО: Вставьте сюда свой БЕЗОПАСНЫЙ API-ключ ❗️
            const apiKey = process.env.REACT_APP_GEMINI_API_KEY || 'ТВОЙ_КЛЮЧ_ЗДЕСЬ'; 
            
            const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${apiKey}`;
            
            const prompt = `
                Проанализируй таблицу школьного расписания на изображении.
                Верни данные СТРОГО в формате JSON массива.
                Каждый объект массива — это строка расписания (один урок).
                В предмете (subject) объединяй класс и название (например "11а-англ.язык").
                Если урока нет, ставь null.
                Структура:
                [
                  {
                    "lesson_number": 6,
                    "monday": { "subject": "11а-англ.язык", "room": "361" },
                    "tuesday": { "subject": "11а-англ.язык", "room": "361" },
                    "wednesday": { "subject": "6б-англ.язык", "room": "359" },
                    "thursday": { "subject": "6в-англ.язык", "room": "359" },
                    "friday": null
                  }
                ]
                Только JSON, без маркдауна.
            `;

            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{
                        parts: [
                            { text: prompt },
                            { inlineData: { mimeType: file.type, data: base64Data } }
                        ]
                    }]
                })
            });

            if (!response.ok) {
                const err = await response.json();
                throw new Error(err.error?.message || 'Ошибка сети');
            }

            const data = await response.json();
            let jsonText = data.candidates[0].content.parts[0].text;
            jsonText = jsonText.replace(/```json/g, '').replace(/```/g, '').trim();
            const parsedLessons = JSON.parse(jsonText);

            const weekDates = getTargetWeekDates();
            
            const newSchedule = weekDates.map(dayInfo => {
                const dayClasses = [];
                
                parsedLessons.forEach(lessonRow => {
                    const lessonData = lessonRow[dayInfo.key];
                    
                    if (lessonData && lessonData.subject) {
                        const subjectStringLower = lessonData.subject.toLowerCase();
                        
                        // 1. Проверяем совпадение по классу
                        const isClassMatch = TARGET_CLASSES.length === 0 || 
                                             TARGET_CLASSES.some(targetClass => 
                                                subjectStringLower.includes(targetClass.toLowerCase().trim())
                                             );

                        // 2. Проверяем совпадение по предмету (должно содержать слово "англ")
                        const isSubjectMatch = subjectStringLower.includes(TARGET_SUBJECT.toLowerCase().trim());

                        // 3. Урок добавляется только если совпали И класс, И предмет
                        if (isClassMatch && isSubjectMatch) {
                            dayClasses.push({
                                time: getLessonTime(lessonRow.lesson_number, dayInfo.key),
                                subject: lessonData.subject,
                                teacher: TEACHER_NAME,
                                room: lessonData.room ? `каб. ${lessonData.room}` : ''
                            });
                        }
                    }
                });

                return {
                    date: dayInfo.date,
                    dayOfWeek: dayInfo.dayOfWeek,
                    classes: dayClasses
                };
            });

            return newSchedule;

        } catch (e) {
            console.error(e);
            throw new Error(e.message || "Не удалось распознать расписание");
        }
    };

    return { createSchedule, getGroup };
};