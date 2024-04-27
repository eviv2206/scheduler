import * as XLSX from 'xlsx';

const WEEK_DAYS = ["Понедельник", "Вторник", "Среда", "Четверг", "Пятница", "Суббота"];
const CLASSES_TIME = ['(08.00-09.25)', '(09.35-11.00)', '(11.30-12.55)', '(13.05-14.30)', '(14.40-16.05)', '(16.35-18.00)', '(18.10-19.35)'];
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

    const findClassesInDay = (rowGroup, lineDay, sheetJson) => {
        const classes = [];
        let counter = 0;
        for (let i = sheetJson[lineDay][2] - 1; i < CLASSES_TIME.length; i++) {
            if (sheetJson[lineDay + counter * 3] === undefined) break;
            if (sheetJson[lineDay + counter * 3][rowGroup] !== undefined) {
                classes[counter] = {time: sheetJson[(lineDay + counter * 3 + 1)][2]};
                classes[counter].subject = sheetJson[lineDay + counter * 3][rowGroup];
                classes[counter].teacher = !!sheetJson[lineDay + counter * 3 + 1][rowGroup] ? sheetJson[lineDay + counter * 3 + 1][rowGroup] : '';
                classes[counter].room = !!sheetJson[lineDay + counter * 3 + 2][rowGroup] ? sheetJson[lineDay + counter * 3 + 2][rowGroup] : '';
                counter++;
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
                    if (WEEK_DAYS.includes(row)) {
                        newSchedule.push({
                            date: sheetJson[i][j + 1],
                            dayOfWeek: row,
                            classes: findClassesInDay(rowGroup, i, sheetJson),
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