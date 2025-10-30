import React from "react";
import s from './ScheduleDesktop.module.scss';

const TABLE_TITLE = "Расписание для группы №";

// Компонент для пустой ячейки
const EmptyCell = () => (
    <div className={`${s.ceil} ${s.emptyCeil}`}>-</div>
);

// Компонент для ячейки с парой
const ClassCell = ({ cell }) => (
    <div className={s.ceil}>
        <div className={s.ceil_details}>
            <p>{cell.subject}</p>
            <span>{cell.teacher} {cell.room}</span>
        </div>
    </div>
);


const ScheduleDesktop = ({ scheduleData, groupNum }) => {

    const allTimes = scheduleData.reduce((acc, day) => {
        day.classes.forEach(classItem => {
            acc.add(classItem.time);
        });
        return acc;
    }, new Set());

    const sortedTimes = Array.from(allTimes).sort();

    const transposedData = sortedTimes.map(time => {
        return scheduleData.map(day => {
            const classForThisTime = day.classes.find(c => c.time === time);
            return classForThisTime || null;
        });
    });

    const activeDays = scheduleData.filter(day => day.classes.length > 0);

    return (
        <div className={s.ScheduleDesktop}>
            <h3>{TABLE_TITLE}{groupNum}</h3>
            <table>
                <thead>
                    <tr>
                        <th className={s.timeHeader}>Время</th>
                        {activeDays.map((item, index) => (
                            <th className={s.timeHeader} key={index}>{`${item.date} ${item.dayOfWeek}`}</th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {transposedData.map((row, timeIndex) => (
                        <tr key={sortedTimes[timeIndex]}>
                            <td className={s.timeCell}>{sortedTimes[timeIndex]}</td>
                            
                            {row.map((cell, dayIndex) => {
                                const day = scheduleData[dayIndex];
                                if (day.classes.length === 0) {
                                    return null;
                                }
                                return (
                                    <td key={dayIndex}>
                                        {cell ? <ClassCell cell={cell} /> : <EmptyCell />}
                                    </td>
                                );
                            })}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default ScheduleDesktop;