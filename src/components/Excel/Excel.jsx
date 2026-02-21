import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { useSchedule } from "./../hooks/useSchedule";
import Schedule from "./components/Schedule/Schedule";
import { useCalendar } from "./../hooks/useCalendar"; 
import { useSession } from "@supabase/auth-helpers-react";
import s from './Excel.module.scss'; 

const GET_SCHEDULE = "Распознать расписание";

const Excel = ({ fileTypes, setIsScheduleVisible }) => {
    const [selectedFile, setSelectedFile] = useState(null);
    const [schedule, setNewSchedule] = useState(null);
    const [groupNum, setGroupNum] = useState("");
    const [isCurrentlyVisible, setIsCurrentlyVisible] = useState(false);
    
    // Новые состояния для UI
    const [isLoadingSchedule, setIsLoadingSchedule] = useState(false);
    const [scheduleError, setScheduleError] = useState(null);
    
    const { createSchedule, getGroup } = useSchedule();
    const { createEvents, status, error, resetStatus } = useCalendar(); 
    
    const calendarId = process.env.REACT_APP_CALENDAR_ID;
    const session = useSession();

    const onGetScheduleClick = async () => {
        // Сбрасываем старые статусы и прячем старую таблицу
        resetStatus();
        setScheduleError(null);
        setNewSchedule(null); 
        setIsLoadingSchedule(true); // Включаем индикатор загрузки

        try {
            const newSchedule = await createSchedule(selectedFile);
            setNewSchedule(newSchedule);
            setGroupNum(getGroup()); 
        } catch (err) {
            // Если произошла ошибка в API (например, плохой ключ или не удалось прочесть картинку)
            setScheduleError(err.message);
        } finally {
            setIsLoadingSchedule(false); // Выключаем загрузку в любом случае
        }
    }

    useEffect(() => {
        const isVisible = !!schedule;
        setIsScheduleVisible(isVisible);
        setIsCurrentlyVisible(isVisible);
        
        return () => {
            setIsScheduleVisible(false);
            setIsCurrentlyVisible(false);
        }
    }, [schedule, setIsScheduleVisible, resetStatus]);

    return (
        <div className={`${s.excelWrapper} ${isCurrentlyVisible ? s.scheduleVisible : ''}`}>
            <div className={s.controls}>
                <label className={s.fileInputLabel}>
                    <span>{selectedFile ? selectedFile.name : "Загрузите фото"}</span>
                    <input
                        type="file"
                        accept={fileTypes.join(',')}
                        onChange={e => setSelectedFile(e.target.files[0])}
                    />
                </label>

                <button
                    className={s.btn}
                    // Блокируем кнопку, если файл не выбран или идет загрузка
                    disabled={!selectedFile || isLoadingSchedule}
                    onClick={onGetScheduleClick}
                >
                    {/* Меняем текст кнопки при загрузке */}
                    {isLoadingSchedule ? "Распознавание..." : GET_SCHEDULE}
                </button>
                
                <button
                    className={`${s.btn} ${s.btnCalendar}`}
                    disabled={!isCurrentlyVisible || status === 'loading' || isLoadingSchedule} 
                    onClick={() => createEvents(schedule, session.provider_token, calendarId)}
                >
                    {status === 'loading' ? 'Добавление...' : 'Добавить в календарь'}
                </button>
            </div>
            
            {/* Блок для вывода статусов и ошибок */}
            <div className={s.statusContainer}>
                {/* Индикатор загрузки расписания (можно стилизовать под спиннер в CSS) */}
                {isLoadingSchedule && (
                    <p style={{ marginTop: '10px', fontWeight: 'bold', color: '#555' }}>
                        ⏳ Нейросеть читает расписание... Пожалуйста, подождите.
                    </p>
                )}

                {/* Ошибка распознавания API (Gemini) */}
                {scheduleError && (
                    <p className={`${s.statusMessage} ${s.error}`}>
                        ❌ Ошибка распознавания: {scheduleError}
                    </p>
                )}

                {/* Успешное добавление в Календарь */}
                {status === 'success' && (
                    <p className={`${s.statusMessage} ${s.success}`}>✅ Успешно добавлено в календарь!</p>
                )}

                {/* Ошибка при добавлении в Календарь */}
                {status === 'error' && (
                    <p className={`${s.statusMessage} ${s.error}`}>❌ Ошибка календаря: {error}</p>
                )}
            </div>

            {/* Таблица покажется только если есть расписание и нет ошибок/загрузки */}
            {isCurrentlyVisible && !isLoadingSchedule && !scheduleError && (
                <Schedule scheduleData={schedule} groupNum={groupNum} />
            )}
        </div>
    );
}

Excel.propTypes = {
    fileTypes: PropTypes.arrayOf(PropTypes.string),
    setIsScheduleVisible: PropTypes.func.isRequired,
}

export default Excel;