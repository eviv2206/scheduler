import React, {useEffect, useState} from "react";
import PropTypes from "prop-types";
import {useSchedule} from "../hooks/useSchedule";
import Schedule from "./components/Schedule/Schedule";
import {useCalendar} from "../hooks/useCalendar";
import {useSession} from "@supabase/auth-helpers-react";

const GET_SCHEDULE = "Получить расписание"
const Excel = ({fileTypes}) => {
    const [selectedFile, setSelectedFile] = useState(null);
    const [schedule, setNewSchedule] = useState(null);
    const [groupNum, setGroupNum] = useState("");
    const [isShowSchedule, setIsShowSchedule] = useState(false);
    const {createSchedule, getGroup} = useSchedule();
    const {createEvents} = useCalendar();
    const calendarId = process.env.REACT_APP_CALENDAR_ID;
    const session = useSession();

    const onClick = async () => {
        const newSchedule = await createSchedule(selectedFile);
        setNewSchedule(newSchedule);
        setGroupNum(getGroup())
    }

    useEffect(() => {
        !!schedule && setIsShowSchedule(true);
        return () => {
            setIsShowSchedule(false);
        }
    }, [schedule])

    return (
        <div>
            <div>
                <input type="file" accept={fileTypes.join(',')} onChange={e => setSelectedFile(e.target.files[0])}/>
                <button disabled={!selectedFile} onClick={onClick}>{GET_SCHEDULE}</button>
                <button disabled={!isShowSchedule}
                        onClick={() => createEvents(schedule, session.provider_token, calendarId)}>Добавить в календарь
                </button>
            </div>
            {isShowSchedule && <Schedule scheduleData={schedule} groupNum={groupNum}/>}
        </div>
    );
}

Excel.propTypes = {
    fileTypes: PropTypes.arrayOf(PropTypes.string),
}

export default Excel;