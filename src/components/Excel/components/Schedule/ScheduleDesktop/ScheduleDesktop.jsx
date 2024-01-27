import React from "react";
import s from './ScheduleDesktop.module.scss'

const TABLE_TITLE = "Расписание для группы №";
const ScheduleDesktop = ({scheduleData, groupNum}) => {
    const transposedData = scheduleData.reduce((acc, day) => {
        day.classes.forEach((classItem, index) => {
            if (!acc[index]) {
                acc[index] = [];
            }
            acc[index].push({
                time: classItem.time,
                subject: classItem.subject,
                teacher: classItem?.teacher,
                room: classItem?.room,
            });
        });
        return acc;
    }, []);
    return (
        <div className={s.ScheduleDesktop}>
            <h3>{TABLE_TITLE}{groupNum}</h3>
            <table>
                <thead>
                <tr>
                    {scheduleData.map((item, index) => {
                        if (item.classes.length !== 0) {
                            return <th key={index}>{`${item.date} ${item.dayOfWeek}`}</th>;
                        }
                        return null;
                    })}
                </tr>
                </thead>
                <tbody>
                {transposedData.map((column, colIndex) => (
                    <tr key={colIndex}>
                        {column.map((cell, rowIndex) => (
                            <td key={rowIndex}>
                                <div className={s.ceil}>
                                    <div className={s.time_ceil}>{cell.time}</div>
                                    <div className={s.ceil_details}><p>{cell.subject}</p><span>{cell.teacher} {cell.room}</span></div>
                                </div>
                            </td>
                        ))}
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    );
};

export default ScheduleDesktop;