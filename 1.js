"use strict";
const readlineSync = require('readline-sync');

// ENUM
const Day = Object.freeze({
  SUNDAY: 0,
  MONDAY: 1,
  TUESDAY: 2,
  WEDNESDAY: 3,
  THURSDAY: 4,
  FRIDAY: 5,
  SATURDAY: 6,
});

const Month = Object.freeze({
  JANUARY: 0,
  FEBRUARY: 1,
  MARCH: 2,
  APRIL: 3,
  MAY: 4,
  JUNE: 5,
  JULY: 6,
  AUGUST: 7,
  SEPTEMBER: 8,
  OCTOBER: 9,
  NOVEMBER: 10,
  DECEMBER: 11,
});

// Constant
// Reference date: January 1, 1800 = Wednesday
const BASE_YEAR = 1800;
const BASE_WEEKDAY = Day.WEDNESDAY;

const DAYS_PER_COMMON_YEAR = 365;
const DAYS_PER_LEAP_YEAR = 366;
const DAYS_PER_WEEK = Object.keys(Day).length;

const LEAP_YEAR_INTERVAL = 4;
const CENTURY_INTERVAL = 100;
const GREGORIAN_INTERVAL = 400;

const DAYS_IN_COMMON_YEAR = {
  [Month.JANUARY]: 31,
  [Month.FEBRUARY]: 28,
  [Month.MARCH]: 31,
  [Month.APRIL]: 30,
  [Month.MAY]: 31,
  [Month.JUNE]: 30,
  [Month.JULY]: 31,
  [Month.AUGUST]: 31,
  [Month.SEPTEMBER]: 30,
  [Month.OCTOBER]: 31,
  [Month.NOVEMBER]: 30,
  [Month.DECEMBER]: 31,
};

const DAY_SHORT_LABELS = Object.freeze([
  "Sun",
  "Mon",
  "Tue",
  "Wed",
  "Thu",
  "Fri",
  "Sat",
]);

const MONTH_LABELS = {
  [Month.JANUARY]: 'January',
  [Month.FEBRUARY]: 'February',
  [Month.MARCH]: 'March',
  [Month.APRIL]: 'April',
  [Month.MAY]: 'May',
  [Month.JUNE]: 'June',
  [Month.JULY]: 'July',
  [Month.AUGUST]: 'August',
  [Month.SEPTEMBER]: 'September',
  [Month.OCTOBER]: 'October',
  [Month.NOVEMBER]: 'November',
  [Month.DECEMBER]: 'December',
};

// Rendering Constant
const DAY_LABEL_WIDTH = 3;       // width of each day label / number
const SPACE_BETWEEN_DAYS = 2;    // space between columns
const COLUMN_TOTAL_WIDTH = DAY_LABEL_WIDTH + SPACE_BETWEEN_DAYS;

function Calendar(year, month) {
  Object.defineProperties(this, {
    _year: {
      value: year,
    },
    _monthIndex: {
      // conver into indexed month
      value: month - 1,
    },
  });
}

/**
 * Determines if a year is a leap year
 * 
 * @param {number} year
 * @returns {boolean} True if the year is a leap year, otherwise false
 */
Calendar.isLeapYear = function (year) {
  return (
    year % GREGORIAN_INTERVAL === 0 ||
    (year % LEAP_YEAR_INTERVAL === 0 && year % CENTURY_INTERVAL !== 0)
  );
};

/**
 * Counts the number of leap years from year 0 up to the specified year
 * 
 * @param {number} year - The year up to which to count leap years
 * @returns {number} The number of leap years
 */
Calendar.countLeapYearsUpTo = function (year) {
  return (
    Math.floor(year / LEAP_YEAR_INTERVAL) -
    Math.floor(year / CENTURY_INTERVAL) +
    Math.floor(year / GREGORIAN_INTERVAL)
  );
};

/**
 * Gets the number of days in a given month of a specific year
 * 
 * @param {number} year - The year
 * @param {number} monthIndex - The zero-based month index
 * @returns {number} Number of days in the month
 */
Calendar.getDaysInMonth = function (year, monthIndex) {
  if (monthIndex === Month.FEBRUARY && Calendar.isLeapYear(year)) {
    return DAYS_IN_COMMON_YEAR[monthIndex] + 1;
  }
  return DAYS_IN_COMMON_YEAR[monthIndex];
};

/**
 * Gets the year of the calendar
 * 
 * @returns {number} The year
 */
Calendar.prototype.getYear = function () {
  return this._year;
}

/**
 * Gets the label of the month of the calendar
 * 
 * @returns {string} The month label (e.g., "January")
 */
Calendar.prototype.getMonthLabel = function () {
  return MONTH_LABELS[this._monthIndex];
}

/**
 * Calculates the number of days since the base year (eg: January 1, 1800)
 * 
 * @returns {number} Total number of days since base year
 */
Calendar.prototype.getDaysSinceBaseYear = function () {
  const yearsDifference = this._year - BASE_YEAR;

  const leapYearsBetween =
    Calendar.countLeapYearsUpTo(this._year - 1) -
    Calendar.countLeapYearsUpTo(BASE_YEAR - 1);

  const commonYears = yearsDifference - leapYearsBetween;

  let totalDays =
    leapYearsBetween * DAYS_PER_LEAP_YEAR + commonYears * DAYS_PER_COMMON_YEAR;

  for (let m = Month.JANUARY; m < this._monthIndex; m++) {
    totalDays += Calendar.getDaysInMonth(this._year, m);
  }

  return totalDays;
};

/**
 * Gets the weekday index of the first day of the month
 * 
 * @returns {number} Weekday index (eg: 0 = Sunday, 6 = Saturday)
 */
Calendar.prototype.getFirstWeekdayIndex = function () {
  return (this.getDaysSinceBaseYear() + BASE_WEEKDAY) % DAYS_PER_WEEK;
};

/**
 * Gets the number of days in the current month
 * 
 * @returns {number} Number of days in the month
 */
Calendar.prototype.getDaysInCurrentMonth = function () {
  return Calendar.getDaysInMonth(this._year, this._monthIndex);
};

/**
 * Generates a 2D array representing the calendar grid of the month
 * Each sub-array represents a week, with `null` for empty days
 * 
 * @returns {Array<Array<number|null>>} Calendar grid
 */
Calendar.prototype.generateCalendarGrid = function () {
  const firstDayIndex = this.getFirstWeekdayIndex();
  const totalDays = this.getDaysInCurrentMonth();
  const weeks = [];
  let currentWeek = new Array(DAYS_PER_WEEK).fill(null);
  let dayCounter = 1;

  for (let i = firstDayIndex; i < DAYS_PER_WEEK; i++) {
    currentWeek[i] = dayCounter++;
  }

  weeks.push(currentWeek);

  while (dayCounter <= totalDays) {
    currentWeek = new Array(DAYS_PER_WEEK).fill(null);

    for (let i = 0; i < DAYS_PER_WEEK && dayCounter <= totalDays; i++) {
      currentWeek[i] = dayCounter++;
    }

    weeks.push(currentWeek);
  }

  return weeks;
};

/**
 * Renders the calendar to the console
 * 
 * @param {Calendar} calendar - The calendar instance to render
 */
function renderCalendar(calendar) {
  const grid = calendar.generateCalendarGrid();
  const title = `${calendar.getMonthLabel()} ${calendar.getYear()}`;
  const spacing = DAYS_PER_WEEK * COLUMN_TOTAL_WIDTH - SPACE_BETWEEN_DAYS;

  console.log(' '.repeat(Math.floor((spacing - title.length) / 2)) + title);
  console.log('-'.repeat(spacing));
  console.log(DAY_SHORT_LABELS.map(day => day.padStart(DAY_LABEL_WIDTH, ' ')).join(' '.repeat(SPACE_BETWEEN_DAYS)));

  grid.forEach(week => {
    const row = week
      .map(day => (day === null ? ' '.repeat(DAY_LABEL_WIDTH) : String(day).padStart(DAY_LABEL_WIDTH, ' ')))
      .join(' '.repeat(SPACE_BETWEEN_DAYS));
    console.log(row);
  });

  console.log();
}

while (true) {
  const inputYear = Number(readlineSync.question('Enter full year (e.g., 2001): '));
  const inputMonth = Number(readlineSync.question(`Enter month in number between ${Month.JANUARY + 1} and ${Month.DECEMBER + 1}: `));
  
  if (!Number.isFinite(inputYear) || Number.isNaN(inputYear) || inputYear < BASE_YEAR) {
    console.log('Please input valid year!\n');
    continue;
  }
  
  if (!Number.isFinite(inputMonth) || Number.isNaN(inputMonth) || !Object.values(Month).includes(inputMonth - 1)) {
    console.log('Please input valid month!\n');
    continue;
  }

  const calendar = new Calendar(inputYear, inputMonth);
  renderCalendar(calendar);
}
