import type { Language } from './translations';

export function buildChatGptPrompt(question: string, language: Language): string {
  return language === 'bg' ? `Подготвям се за техническо интервю за Senior Java Developer.

Въпрос за интервю:
"${question}"

Отговори на въпроса, като спазваш следните изисквания:

1. Започни с кратък, технически точен отговор, подходящ за интервю.
2. Обясни основните концепции ясно, логично и разбираемо.
3. Дай малък практически пример или Java код, когато това е полезно.
4. Посочи важни особености, често срещани заблуди и капани при интервю, когато са приложими.
5. Използвай актуалната Java терминология и поведение. Разграничавай езиковата спецификация от детайлите на конкретната имплементация.
6. Избягвай ненужната сложност, без да пропускаш съществени технически детайли.
7. Ако въпросът съдържа неправилно предположение, обясни и коригирай грешката.
8. Не измисляй факти и не представяй контекстно зависими твърдения като безусловно верни.

Отговори изцяло на български език, като запазиш утвърдените английски технически термини, когато е уместно.` : `I am preparing for a Senior Java Developer technical interview.

Interview question:
"${question}"

Please answer the question following these instructions:

1. Start with a concise, technically accurate, interview-ready answer.
2. Explain the underlying concepts clearly and logically.
3. Include a small practical example or Java code snippet when useful.
4. Highlight important nuances, common misconceptions, and interview traps when relevant.
5. Use current Java terminology and behavior. Distinguish language specifications from implementation details.
6. Avoid unnecessary complexity, but do not omit details essential for technical correctness.
7. If the question contains an incorrect assumption, explain and correct it.
8. Do not invent facts or claim certainty where the answer depends on context.

Respond entirely in English.`;
}

export function buildChatGptUrl(prompt: string): string {
  return `https://chatgpt.com/?${new URLSearchParams({ q: prompt })}`;
}
