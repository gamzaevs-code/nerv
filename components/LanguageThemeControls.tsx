'use client';

import { useEffect, useState } from 'react';

export default function LanguageThemeControls() {
  const [lang, setLang] = useState('ru');
  useEffect(() => {
    setLang(localStorage.getItem('nerv-lang') || 'ru');
  }, []);
  function changeLang(value: string) {
    setLang(value);
    localStorage.setItem('nerv-lang', value);
  }
  return (
    <select className="language-select" value={lang} onChange={(event) => changeLang(event.target.value)} aria-label="Язык">
      <option value="ru">RU</option>
      <option value="en">EN</option>
    </select>
  );
}
