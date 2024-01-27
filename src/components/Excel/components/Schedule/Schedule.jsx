import React from "react";
import ScheduleDesktop from "./ScheduleDesktop/ScheduleDesktop";

const Schedule = ({scheduleData, groupNum}) => {
    return (<ScheduleDesktop scheduleData={scheduleData} groupNum={groupNum}/>);
}

export default Schedule;