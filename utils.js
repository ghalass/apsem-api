const getDaysInMonth = (date) => {
    const year = date.getUTCFullYear();
    const month = date.getUTCMonth();

    const firstDay = new Date(Date.UTC(year, month, 1));
    const nextMonthFirstDay = new Date(Date.UTC(year, month + 1, 1));

    const days = (nextMonthFirstDay - firstDay) / (1000 * 60 * 60 * 24);
    return days;
}


module.exports = {
    getDaysInMonth,
}