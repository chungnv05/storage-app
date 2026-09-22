import React from 'react';

const paths = {
  cloud: 'M7 18h11a4 4 0 0 0 0-8 6 6 0 0 0-11-2 5 5 0 0 0 0 10Z',
  folder: 'M3 7V5h6l2 2h10v13H3Z',
  file: 'M6 3h8l4 4v14H6Z M14 3v5h4 M9 12h6 M9 16h6',
  document: 'M6 3h8l4 4v14H6Z M14 3v5h4 M9 12h6 M9 16h6',
  video: 'M3 5h13v14H3Z M16 10l5-3v10l-5-3',
  image: 'M3 3h18v18H3Z M3 17l6-6 4 4 3-3 5 5 M8 7h.01',
  other: 'M7 3h10v18H7Z M10 7h4 M10 11h4 M10 15h4',
  share: 'M8 12l8-5 M8 12l8 5 M6 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6 M18 3a3 3 0 1 0 0 6 3 3 0 0 0 0-6 M18 15a3 3 0 1 0 0 6 3 3 0 0 0 0-6',
  trash: 'M3 6h18 M9 6V3h6v3 M5 6l1 15h12l1-15 M10 10v7 M14 10v7',
  bell: 'M5 17h14l-2-3V9a5 5 0 0 0-10 0v5Z M10 21h4',
  search: 'M10 3a7 7 0 1 0 0 14 7 7 0 0 0 0-14 M15 15l6 6',
  upload: 'M12 16V3 M7 8l5-5 5 5 M4 15v6h16v-6',
  plus: 'M12 5v14 M5 12h14',
  grid: 'M3 3h7v7H3Z M14 3h7v7h-7Z M3 14h7v7H3Z M14 14h7v7h-7Z',
  users: 'M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8 M2 21v-3a7 7 0 0 1 14 0v3 M17 4a4 4 0 0 1 0 7 M19 15a6 6 0 0 1 3 6',
  user: 'M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8 M4 21v-3a8 8 0 0 1 16 0v3',
  card: 'M3 5h18v14H3Z M3 9h18 M7 15h4',
  logout: 'M10 3H3v18h7 M10 12h11 M17 8l4 4-4 4',
  check: 'M5 12l4 4L19 6',
  close: 'M6 6l12 12 M6 18 18 6',
  menu: 'M3 6h18 M3 12h18 M3 18h18',
  arrow: 'M5 12h14 M14 7l5 5-5 5',
  down: 'M12 3v13 M7 11l5 5 5-5 M4 18v3h16v-3',
  refresh: 'M4 10a8 8 0 1 1 1 8 M4 3v7h7',
  lock: 'M5 10h14v11H5Z M8 10V6a4 4 0 0 1 8 0v4',
  chart: 'M4 3v18h17 M8 16v-5 M13 16V6 M18 16v-8',
  gift: 'M3 8h18v4H3Z M5 12v9h14v-9 M12 8v13 M12 8S4 8 6 4s6 4 6 4 8 0 6-4-6 4-6 4',
  edit: 'M14 5l5 5 M4 20l1-6L16 3l5 5-11 11Z',
  clock: 'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18 M12 7v6l4 2'
};

function Icon({ name, className = '', style = {} }) {
  const d = paths[name] || paths.file;
  return (
    <svg
      className={`icon ${className}`}
      style={style}
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path d={d} />
    </svg>
  );
}

export default Icon;
