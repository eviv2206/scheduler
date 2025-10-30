import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { useSchedule } from "../hooks/useSchedule";
import Schedule from "./components/Schedule/Schedule";
import { useCalendar } from "../hooks/useCalendar"; // 1. Импортируем обновленный хук
import { useSession } from "@supabase/auth-helpers-react";
import s from './Excel.module.scss'; 

const GET_SCHEDULE = "Получить расписание";

const Excel = ({ fileTypes, setIsScheduleVisible }) => {
    const [selectedFile, setSelectedFile] = useState(null);
    const [schedule, setNewSchedule] = useState(null);
    const [groupNum, setGroupNum] = useState("");
    const [isCurrentlyVisible, setIsCurrentlyVisible] = useState(false);
    
    const { createSchedule, getGroup } = useSchedule();
    
    // 2. Получаем все данные из хука useCalendar
    const { createEvents, status, error, resetStatus } = useCalendar(); 
    
    const calendarId = process.env.REACT_APP_CALENDAR_ID;
    const session = useSession();

    // 3. Создаем новую функцию-обертку
    const onGetScheduleClick = async () => {
        resetStatus(); // Сбрасываем статус (Успех/Ошибка) от прошлого календаря
        const newSchedule = await createSchedule(selectedFile);
        setNewSchedule(newSchedule);
        setGroupNum(getGroup());
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
                    <span>{selectedFile ? selectedFile.name : "Выберите файл"}</span>
                    <input
                        type="file"
                        accept={fileTypes.join(',')}
                        onChange={e => setSelectedFile(e.target.files[0])}
                    />
                </label>

                <button
                    className={s.btn}
                    disabled={!selectedFile}
                    onClick={onGetScheduleClick} // 4. Используем новую функцию
                >
                    {GET_SCHEDULE}
                </button>
                
                <button
                    className={`${s.btn} ${s.btnCalendar}`}
                    // 5. Блокируем кнопку во время загрузки
                    disabled={!isCurrentlyVisible || status === 'loading'} 
                    onClick={() => createEvents(schedule, session.provider_token, calendarId)}
                >
                    {/* 6. Показываем текст загрузки */}
                    {status === 'loading' ? 'Добавление...' : 'Добавить в календарь'}
                </button>
            </div>
            
            {/* 7. Новый блок для сообщений о статусе */}
            <div className={s.statusContainer}>
                {status === 'success' && (
                    <p className={`${s.statusMessage} ${s.success}`}>
                        ✅ Расписание успешно добавлено в ваш календарь!
                    </p>
                )}
                {status === 'error' && (
                    <p className={`${s.statusMessage} ${s.error}`}>
                        ❌ Ошибка: {error}
                    </p>
                )}
            </div>

            {isCurrentlyVisible && <Schedule scheduleData={schedule} groupNum={groupNum} />}
        </div>
    );
}

Excel.propTypes = {
    fileTypes: PropTypes.arrayOf(PropTypes.string),
    setIsScheduleVisible: PropTypes.func.isRequired,
}

export default Excel;