 function convertDateToUnixTimestamp(dateString) {
    const [month, day, year] = dateString.split('/').map(Number);
    const date = new Date(year, month - 1, day);
    date.setHours(23, 59, 59, 0);
    return date.getTime();
  }

  const date = convertDateToUnixTimestamp("03/22/2026");
  console.log(date); // Outputs: 1647874799000
  1741334399000