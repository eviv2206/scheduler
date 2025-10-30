import React, { useState, useEffect } from "react";
import ScheduleDesktop from "./ScheduleDesktop/ScheduleDesktop";
import ScheduleMobile from "./ScheduleMobile/ScheduleMobile";

const useMediaQuery = (query) => {
    const [matches, setMatches] = useState(window.matchMedia(query).matches);

    useEffect(() => {
        const media = window.matchMedia(query);
        const listener = () => setMatches(media.matches);
        
        media.addEventListener('change', listener);
        return () => media.removeEventListener('change', listener);
    }, [query]);

    return matches;
};

const Schedule = ({ scheduleData, groupNum }) => {
    const isMobile = useMediaQuery('(max-width: 950px)');

    return isMobile ? (
        <ScheduleMobile scheduleData={scheduleData} groupNum={groupNum} />
    ) : (
        <ScheduleDesktop scheduleData={scheduleData} groupNum={groupNum} />
    );
}

export default Schedule;