import * as XLSX from 'xlsx';

const WEEK_DAYS = ["Понедельник", "Вторник", "Среда", "Четверг", "Пятница", "Суббота"];
const GROUP = "22РГФ1д_1";

export const useSchedule = () => {

    const getGroup = () => {
        return GROUP;
    }

    const openExcelFile = (file) => {
        return new Promise((resolve, reject) => {
            if (file) {
                const reader = new FileReader();
                reader.onload = function (e) {
                    const data = new Uint8Array(e.target.result);
                    const workbook = XLSX.read(data, { type: 'array' });

                    console.log('Файл успешно загружен.');

                    const sheetName = workbook.SheetNames[0];
                    const worksheet = workbook.Sheets[sheetName];
                    resolve(XLSX.utils.sheet_to_json(worksheet, { header: 1 }));
                };
                reader.readAsArrayBuffer(file);
            } else {
                console.error('Файл не выбран.');
                reject('File not selected');
            }
        });
    };

    const findClassesInDay = (rowGroup, startLineDay, endLineDay, sheetJson) => {
        const classes = [];
        let pointer = startLineDay;
        debugger
        while (pointer < endLineDay) {
            if (sheetJson[pointer][rowGroup] !== undefined && sheetJson[pointer][rowGroup] !== "") {
                classes.push({
                    time: sheetJson[pointer + 1][2],
                    subject: sheetJson[pointer][rowGroup],
                    teacher: !!sheetJson[pointer + 1][rowGroup] ? sheetJson[pointer + 1][rowGroup] : '',
                    room: !!sheetJson[pointer + 2][rowGroup] ? sheetJson[pointer + 2][rowGroup] : '',
                });
                pointer += 3;
            } else {
                pointer++;
            }
        }
        return classes;
    };

    const findRowGroup = (sheetJson) => {
        for (let i = 0; i < sheetJson.length; i++) {
            for (let j = 0; j < sheetJson[i].length; j++) {
                if (sheetJson[i][j] === GROUP) {
                    return j;
                }
            }
        }
        return null;
    };

    const createSchedule = async (file) => {
        const sheetJson = await openExcelFile(file);
        const newSchedule = [];
        try {
            const rowGroup = findRowGroup(sheetJson);
            sheetJson.forEach((line, i) => {
                line.forEach((row, j) => {
                    const weekDay = WEEK_DAYS.find(day => day === row);
                    if (weekDay) {
                        debugger
                        let endLineDay = i;
                        while (sheetJson[endLineDay][j] === "" || sheetJson[endLineDay][j] === weekDay) {
                            endLineDay++;
                        }
                        newSchedule.push({
                            date: sheetJson[i][j + 1],
                            dayOfWeek: row,
                            classes: findClassesInDay(rowGroup, i, endLineDay, sheetJson),
                        })
                    }
                });
            });
        } catch (e) {
            alert(e);
        }
        return newSchedule;
    };

    return {
        createSchedule,
        getGroup,
    }
}