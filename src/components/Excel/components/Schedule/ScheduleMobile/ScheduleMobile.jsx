import React from "react";
import s from './ScheduleMobile.module.scss';

const TABLE_TITLE = "Расписание для группы №";

const ScheduleMobile = ({ scheduleData, groupNum }) => {
    return (
        <div className={s.scheduleMobile}>
            <h3>{TABLE_TITLE}{groupNum}</h3>
            
            <div className={s.dayList}>
                {scheduleData.map((day, dayIndex) => {
                    if (day.classes.length === 0) {
                        return null;
                    }

                    return (
                        <div key={dayIndex} className={s.dayCard}>
                            <h4 className={s.dayHeader}>
                                {`${day.date} - ${day.dayOfWeek}`}
                            </h4>
                            <div className={s.classList}>
                                {day.classes.map((classItem, classIndex) => (
                                    <div key={classIndex} className={s.classItem}>
                                        <div className={s.classTime}>{classItem.time}</div>
                                        <div className={s.classDetails}>
                                            <p className={s.classSubject}>{classItem.subject}</p>
                                            <span className={s.classMeta}>
                                                {classItem.teacher} {classItem.room}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default ScheduleMobile;