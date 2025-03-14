import dayjs from 'dayjs'
export const formatDateClient = (date) =>{
    if (date !== null && date !== ""){
        return dayjs(date).format ("DD/MM/YYYY")
    }
    return null

}