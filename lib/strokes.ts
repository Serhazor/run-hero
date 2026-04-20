import type { Effort, SessionType } from "@/lib/types";

export type StrokeContext = {
  trainingType: SessionType;
  title: string;
  intensity: Effort | null;
  duration: number | null;
  distanceOrVolume: string;
  notes: string;
  plannedStatus: "planned" | "optional" | "extra";
  goal: string;
  consistencyContext: string;
};

const weakPatterns = [
  /ты завершил/i,
  /ещ[её] одна ценная/i,
  /ценная сессия/i,
  /эта сессия/i,
  /эта тренировка/i,
  /ты потренировался/i,
  /ты сделал тренировку/i,
  /это улучшает/i,
  /это помогает/i,
  /практика развивает/i,
  /развивает технику/i,
  /улучшает технику/i,
  /полезное внимание/i,
  /пользу для твоего/i,
  /для твоего bjj/i,
  /для bjj/i,
  /кардио/i,
  /силовая работа сегодня/i,
  /ты поработал сегодня/i,
  /ты сделал сегодня/i,
  /ты завершил тренировку/i,
  /ты завершил ещё одну/i,
  /сессия/i,
  /тренировк/i,
];

const bannedStarts = [
  "ты завершил",
  "ещё одна",
  "еще одна",
  "эта сессия",
  "эта тренировка",
  "ты потренировался",
  "ты сделал тренировку",
  "сегодняшняя тренировка",
];

function wordCount(line: string) {
  return line
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;
}

function normalizeLine(line: string) {
  return line
    .replace(/^[-•\d.\s]+/, "")
    .replace(/\s+/g, " ")
    .trim();
}

export function isWeakStroke(line: string) {
  const trimmed = normalizeLine(line);
  const lower = trimmed.toLowerCase();

  if (!trimmed) return true;
  if (wordCount(trimmed) < 5) return true;
  if (wordCount(trimmed) > 14) return true;

  if (bannedStarts.some((start) => lower.startsWith(start))) {
    return true;
  }

  if (weakPatterns.some((pattern) => pattern.test(trimmed))) {
    return true;
  }

  return false;
}

function isUniversalSecondLine(line: string) {
  const trimmed = normalizeLine(line);
  const lower = trimmed.toLowerCase();

  if (!trimmed.includes("Серёжа") && !trimmed.includes("Сережа")) {
    return false;
  }

  const forbiddenSecondLinePatterns = [
    /bjj/i,
    /бжж/i,
    /кардио/i,
    /бег/i,
    /сил/i,
    /восстанов/i,
    /техник/i,
    /защит/i,
    /удуш/i,
    /ковр/i,
    /мат/i,
    /база/i,
    /трениров/i,
    /сесси/i,
    /нагруз/i,
  ];

  if (forbiddenSecondLinePatterns.some((pattern) => pattern.test(lower))) {
    return false;
  }

  return true;
}

export function buildStrokePrompt(context: StrokeContext) {
  return `
Ты пишешь две короткие позитивные реплики для приложения тренировок.
Они будут озвучены после завершённой тренировки.

Это не отчёт и не summary.
Это короткие психологические strokes: спокойное, человеческое признание усилия, дисциплины, полезной работы или стабильности.

Напиши ровно 2 строки.

Строгие правила:
- Пиши только по-русски
- Каждая строка должна быть от 5 до 12 слов
- Первая строка должна быть связана именно с этой тренировкой
- Вторая строка должна быть универсальной, личной и не зависеть от типа тренировки
- Вторая строка должна обращаться по имени "Серёжа"
- Вторая строка не должна упоминать BJJ, силу, бег, кардио, технику, восстановление или детали сессии
- Тон должен быть спокойный, тёплый, уважительный, уверенный
- Нельзя писать как тренерский отчёт, уведомление приложения или сухое описание
- Не пересказывай очевидное
- Не объясняй тренировочную логику в лоб
- Не используй пафос, лозунги, клише, сленг, сарказм, эмодзи, кавычки, хэштеги
- Избегай фраз типа:
  "ты завершил тренировку"
  "ещё одна ценная сессия"
  "это улучшает"
  "это помогает"
  "практика развивает"
  "ты потренировался"
  "ты сделал тренировку"
  "эта сессия"

Хорошие примеры первой строки:
Хорошая работа. Ты дал делу нужное усилие
Это была полезная работа, не пустая нагрузка
Ты сегодня поработал по делу
Хорошая тренировка. В ней был смысл
Ты не просто отметился, ты вложился

Хорошие примеры второй строки:
Серёжа, вот так и строится настоящая стабильность
Серёжа, именно из таких дней всё и складывается
Серёжа, ты становишься надёжнее с каждым таким днём
Серёжа, ты спокойно строишь то, что потом будет держать
Серёжа, в этом и появляется настоящая внутренняя опора

Контекст:
Тип: ${context.trainingType}
Название: ${context.title}
Интенсивность: ${context.intensity ?? "unknown"}
Длительность: ${context.duration ?? "unknown"}
Объём: ${context.distanceOrVolume}
Заметки: ${context.notes || "none"}
Статус: ${context.plannedStatus}
Цель: ${context.goal || "none"}
Контекст стабильности: ${context.consistencyContext}
`.trim();
}

export function parseStrokeText(text: string) {
  const rawLines = text
    .split("\n")
    .map(normalizeLine)
    .filter(Boolean);

  const unique: string[] = [];
  for (const line of rawLines) {
    if (!unique.some((existing) => existing.toLowerCase() === line.toLowerCase())) {
      unique.push(line);
    }
  }

  const firstCandidates = unique.filter(
    (line) => !isWeakStroke(line) && !isUniversalSecondLine(line),
  );

  const secondCandidates = unique.filter(
    (line) => !isWeakStroke(line) && isUniversalSecondLine(line),
  );

  const first = firstCandidates[0];
  const second = secondCandidates[0];

  if (first && second) {
    return [first, second];
  }

  return [];
}

function pickRandom(pool: string[], exclude?: string) {
  const filtered = exclude
    ? pool.filter((item) => item.toLowerCase() !== exclude.toLowerCase())
    : pool;

  if (!filtered.length) {
    return pool[0];
  }

  return filtered[Math.floor(Math.random() * filtered.length)];
}

const sessionSpecificPools = {
  run: [
    "Спокойная, полезная работа. Всё было по делу.",
    "Хорошая работа. Ты дал базе нужное внимание.",
    "Ты сегодня поработал спокойно и правильно.",
    "Это была полезная нагрузка, не пустая суета.",
    "Хороший день. Работа была честной и нужной.",
    "Ты дал работе именно тот ритм, который был нужен.",
  ],
  strength: [
    "Хорошая силовая работа. День не ушёл впустую.",
    "Ты дал телу нужную силовую нагрузку.",
    "Это была крепкая, полезная работа.",
    "Хорошая работа. В ней был реальный смысл.",
    "Ты сегодня поработал с нормальным намерением.",
    "Ты вложился в то, что потом будет держать.",
  ],
  bjj: [
    "Хорошая работа. Ты дал своей игре нужное внимание.",
    "Это было полезное время на ковре.",
    "Ты сегодня вложился в свою игру не зря.",
    "Хорошая работа. В ней был реальный смысл.",
    "Ты не просто пришёл, ты поработал по делу.",
    "Ты дал важной части своей игры нормальное внимание.",
  ],
  recovery: [
    "Хорошая работа. Ты сделал именно то, что нужно.",
    "Это был разумный и полезный день.",
    "Ты сегодня не перегнул и сделал правильно.",
    "Спокойная работа, но очень нужная.",
    "Хороший выбор. Такая работа тоже двигает вперёд.",
    "Ты дал себе ровно то, что сейчас было нужно.",
  ],
  sauna: [
    "Хорошая работа. Ты дал телу восстановиться вовремя.",
    "Это был полезный и спокойный шаг.",
    "Ты сегодня выбрал не суету, а пользу.",
    "Хороший день. Восстановление тоже считается.",
    "Ты сделал то, что действительно было нужно.",
    "Ты не перегнул и выбрал правильный ритм.",
  ],
  general: [
    "Хорошая работа. Ты дал делу нужное усилие.",
    "Это была полезная работа, не пустая нагрузка.",
    "Ты сегодня поработал по делу.",
    "Хорошая работа. В ней был смысл.",
    "Ты не просто отметился, ты вложился.",
    "Ты дал дню полезное и честное усилие.",
  ],
};

const universalSeryozhaPool = [
  "Серёжа, вот так и строится настоящая стабильность.",
  "Серёжа, именно из таких дней всё и складывается.",
  "Серёжа, ты становишься надёжнее с каждым таким днём.",
  "Серёжа, ты спокойно строишь то, что потом будет держать.",
  "Серёжа, в этом и появляется настоящая внутренняя опора.",
  "Серёжа, ты уже делаешь это частью себя.",
  "Серёжа, такие шаги дают настоящую опору на будущее.",
  "Серёжа, вот так и собирается серьёзный результат.",
  "Серёжа, ты двигаешься правильно, даже когда тихо.",
  "Серёжа, такие дни значат больше, чем кажется.",
  "Серёжа, именно так и появляется внутренняя надёжность.",
  "Серёжа, ты постепенно собираешь себя в одно целое.",
];

export function getFallbackStrokes(context: StrokeContext) {
  const firstPool =
    context.trainingType === "run"
      ? sessionSpecificPools.run
      : context.trainingType === "strength"
        ? sessionSpecificPools.strength
        : context.trainingType === "bjj"
          ? sessionSpecificPools.bjj
          : context.trainingType === "recovery"
            ? sessionSpecificPools.recovery
            : context.trainingType === "sauna"
              ? sessionSpecificPools.sauna
              : sessionSpecificPools.general;

  const first = pickRandom(firstPool);
  const second = pickRandom(universalSeryozhaPool);

  return [first, second];
}