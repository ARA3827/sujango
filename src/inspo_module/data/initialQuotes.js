// src/data/initialQuotes.js
export const INITIAL_QUOTES = [
  {
    id: "q-1",
    category: "movie",
    text: "내가 언제 당신을 사랑한다고 했어요? 내가 당신을 사랑한다는 말은, 당신을 지켜보겠다는 뜻이었어요.",
    workTitle: "헤어질 결심 (Decision to Leave)",
    creator: "박찬욱 감독 / 서래",
    context: "바닷가에서 두 사람의 눈빛이 교차할 때",
    userThought: "사랑을 직접적으로 고백하지 않고 시선과 태도로 증명한다는 것. 침묵 속에 가장 깊은 마음이 담겨 있다.",
    tags: ["사랑", "여운", "시선"],
    date: "2026-10-12",
    isFavorite: true,
    colorTheme: "sage"
  },
  {
    id: "q-2",
    category: "book",
    text: "새는 알에서 나오려고 투쟁한다. 알은 세계이다. 태어나려는 자는 하나의 세계를 깨뜨려야 한다.",
    workTitle: "데미안 (Demian)",
    creator: "헤르만 헤세",
    context: "에밀 싱클레어가 자아를 찾아가는 과정에서",
    userThought: "새로운 사업과 도전을 시작할 때마다 떠올리는 문장. 익숙한 안락함을 부수는 고통 없이 새로운 성장은 없다.",
    tags: ["성장", "도전", "자아"],
    date: "2026-10-10",
    isFavorite: true,
    colorTheme: "butter"
  },
  {
    id: "q-3",
    category: "tv",
    text: "네가 대수롭지 않게 받아들이면, 남들도 대수롭지 않게 생각해. 네가 심각하게 받으면, 남들도 심각하게 생각하고. 모든 일이 그래. 항상 네가 먼저야.",
    workTitle: "나의 아저씨",
    creator: "박동훈 (이선균 분)",
    context: "지안에게 밥을 사주며 건넨 덤덤하지만 묵직한 조언",
    userThought: "세상의 시선이나 평가보다 내가 내 일과 실수를 어떻게 규정하느냐가 먼저다. 1인 기업가로서 흔들릴 때마다 꺼내보는 나침반.",
    tags: ["위로", "자존감", "단단함"],
    date: "2026-10-08",
    isFavorite: true,
    colorTheme: "peach"
  },
  {
    id: "q-4",
    category: "book",
    text: "가장 중요한 것은 눈에 보이지 않아. 마음으로 보아야만 분명하게 볼 수 있어.",
    workTitle: "어린 왕자 (The Little Prince)",
    creator: "앙투안 드 생텍쥐페리",
    context: "여우가 어린 왕자에게 들려주는 세상에서 가장 소중한 비밀",
    userThought: "데이터와 숫자, 겉으로 보이는 화려함 뒤에 숨은 본질과 진심을 놓치지 말 것.",
    tags: ["본질", "진심", "지혜"],
    date: "2026-10-05",
    isFavorite: false,
    colorTheme: "lavender"
  },
  {
    id: "q-5",
    category: "tv",
    text: "기적이 무슨 로또인 줄 아십니까? 만만찮은 이태백 세상에서 하루하루를 성실하게 살아낸 당신들이 바로 기적입니다.",
    workTitle: "동백꽃 필 무렵",
    creator: "황용식 (강하늘 분)",
    context: "어려운 환경 속에서도 끝까지 성실했던 동백이를 안아주며",
    userThought: "대단한 한 방보다 매일 책상에 앉아 1줄 코드를 짜고 기록을 남기는 평범한 일상이 곧 기적이다.",
    tags: ["성실", "기적", "응원"],
    date: "2026-10-02",
    isFavorite: true,
    colorTheme: "rose"
  },
  {
    id: "q-6",
    category: "thought",
    text: "완벽하게 준비된 시작은 없다. 일단 세상에 내놓고 사람들의 반응을 보며 고쳐나가는 사람이 결국 이긴다.",
    workTitle: "오늘의 작업 노트",
    creator: "주 (Ara Agent Lab)",
    context: "아이디어를 고민하다 책상 앞에서 문득 떠오른 생각",
    userThought: "생각만 100번 하기보다 프로토타입 1개를 만들어 세상과 호흡하는 민첩한 실행력이 1인 창업가의 본질이다.",
    tags: ["실행력", "창업", "마인드셋"],
    date: "2026-09-28",
    isFavorite: true,
    colorTheme: "sky"
  },
  {
    id: "q-7",
    category: "movie",
    text: "삶이란 우리가 다른 계획을 세우느라 바쁠 때 일어나는 바로 그것이다.",
    workTitle: "보이후드 (Boyhood)",
    creator: "리처드 링클레이터 감독",
    context: "흘러가는 시간과 일상의 찰나들을 포착하며",
    userThought: "거창한 미래 목표도 중요하지만 지금 이 순간 문장을 읽고 차 한 잔 마시는 현재가 곧 인생이다.",
    tags: ["인생", "현재", "찰나"],
    date: "2026-09-25",
    isFavorite: false,
    colorTheme: "butter"
  }
];

export const CATEGORY_MAP = {
  all: { label: "전체 모아보기", icon: "Sparkles", emoji: "✨" },
  book: { label: "책 속 문장", icon: "BookOpen", emoji: "📚" },
  movie: { label: "영화 속 대사", icon: "Film", emoji: "🎬" },
  tv: { label: "TV·드라마 대사", icon: "Tv", emoji: "📺" },
  thought: { label: "생각·영감 메모", icon: "Lightbulb", emoji: "💡" }
};

export const COLOR_THEMES = {
  peach: { name: "살구 피치", bg: "#FFF4EE", border: "#FAD8C7", accent: "#E07A5F", text: "#683B2B" },
  butter: { name: "버터 바닐라", bg: "#FFFBEB", border: "#FDE68A", accent: "#D97706", text: "#78350F" },
  sage: { name: "세이지 민트", bg: "#F2F8F5", border: "#CBE4D8", accent: "#2D6A4F", text: "#1E3F30" },
  lavender: { name: "소프트 라벤더", bg: "#F7F5FC", border: "#E2D9F3", accent: "#7B61FF", text: "#483A7E" },
  sky: { name: "파스텔 스카이", bg: "#F0F7FF", border: "#CBE2FE", accent: "#2563EB", text: "#1E40AF" },
  rose: { name: "더스티 로즈", bg: "#FFF1F2", border: "#FECDD3", accent: "#E11D48", text: "#881337" }
};
