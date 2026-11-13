// 풀이의 근거: 고전 원문, 조후(계절) 풀이, 띠, 오행과 몸, 심리학 연구 노트, 참고 문헌
// 인용한 연구는 모두 실제 발표된 논문이며, 내용은 원 논문의 핵심 결과를 요약한 것이다.

// 『적천수(滴天髓)』 천간론의 첫 구절 (일간 순서)
export const CLASSICS = [
  { text: '甲木參天 脫胎要火', ko: '갑목은 하늘을 찌를 듯 곧게 솟으니, 껍질을 벗고 크게 자라려면 불(火)의 기운이 있어야 한다.', note: '재능을 펼칠 무대와 따뜻한 응원을 만날 때 비로소 큰 나무가 된다는 뜻이에요.' },
  { text: '乙木雖柔 刲羊解牛', ko: '을목은 비록 부드러우나, 양(未)을 가르고 소(丑)를 풀어헤친다.', note: '여려 보여도 단단한 흙을 뚫고 뿌리내리는 강인함이 있다는 뜻이에요.' },
  { text: '丙火猛烈 欺霜侮雪', ko: '병화는 맹렬하여 서리를 업신여기고 눈을 깔본다.', note: '어떤 추위와 어둠도 두려워하지 않는 태양의 기세를 말해요.' },
  { text: '丁火柔中 內性昭融', ko: '정화는 부드럽고 치우침이 없으며, 안의 성품이 밝고 따뜻하게 녹아든다.', note: '겉은 고요해도 속에는 세상을 비추는 밝은 마음이 있다는 뜻이에요.' },
  { text: '戊土固重 旣中且正', ko: '무토는 굳고 무거우며, 중심에 있으면서 또한 바르다.', note: '쉽게 흔들리지 않고 중심을 잡아 주는 큰 산의 덕을 말해요.' },
  { text: '己土卑濕 中正蓄藏', ko: '기토는 낮고 촉촉하며, 치우침 없이 바르게 품고 갈무리한다.', note: '자신을 낮추어 만물을 길러 내는 밭의 덕을 말해요.' },
  { text: '庚金帶煞 剛健爲最', ko: '경금은 숙살의 기운을 띠어, 굳세고 강건하기로 으뜸이다.', note: '맺고 끊는 결단력과 단단함이 열 개의 천간 중 가장 강하다는 뜻이에요.' },
  { text: '辛金軟弱 溫潤而清', ko: '신금은 여리고 부드러우며, 따뜻하고 윤택하면서 맑다.', note: '잘 닦인 보석처럼 섬세하고 맑은 기품을 말해요.' },
  { text: '壬水通河 能洩金氣', ko: '임수는 은하에 통하는 큰물이며, 금(金)의 기운을 능히 풀어낸다.', note: '막힌 것을 뚫고 어디로든 흘러가는 큰 강의 포용력을 말해요.' },
  { text: '癸水至弱 達於天津', ko: '계수는 지극히 여리지만, 하늘의 나루(은하수)에까지 닿는다.', note: '작은 이슬방울이 하늘까지 오르듯, 여린 듯해도 끝내 닿는 힘이 있다는 뜻이에요.' },
];

// 조후(調候): 일간의 오행 × 태어난 계절. 『궁통보감』의 관점을 쉬운 말로 풀었다.
const SEASONS = ['봄', '여름', '가을', '겨울'];
export const seasonOf = (monthBranch) => SEASONS[Math.floor(((monthBranch + 10) % 12) / 3)];
export const SEASON_NOTES = [
  { // 木
    봄: '봄에 태어난 나무는 제철을 만나 기세가 좋아요. 따뜻한 햇볕(火)이 더해지면 꽃을 활짝 피워요.',
    여름: '여름의 나무는 잎이 무성하지만 목이 말라요. 물(水)의 기운, 곧 쉼과 배움이 가장 큰 힘이 돼요.',
    가을: '가을의 나무는 열매를 맺고 잎을 떨구는 때예요. 다듬어 줄 쇠(金)를 만나면 재목이 되니, 규율과 전문성이 길을 열어요.',
    겨울: '겨울의 나무는 추위 속에서 봄을 준비해요. 따뜻한 불(火)의 기운, 곧 열정과 표현이 얼어붙은 운을 녹여 줘요.',
  },
  { // 火
    봄: '봄의 불은 나무의 도움으로 막 피어오르는 불꽃이에요. 배움과 지지를 받으며 빠르게 성장해요.',
    여름: '여름의 불은 가장 뜨겁게 타올라요. 열기를 식혀 줄 물(水), 곧 절제와 휴식이 있을 때 오래 빛나요.',
    가을: '가을의 불은 저무는 노을처럼 은은해요. 땔감이 되어 줄 나무(木), 곧 배움과 든든한 후원이 중요해요.',
    겨울: '겨울의 불은 추운 세상에서 가장 귀한 온기예요. 작아 보여도 모두가 찾는 존재이니, 나를 지켜 줄 나무(木)의 기운을 곁에 두세요.',
  },
  { // 土
    봄: '봄의 흙은 초목에게 양분을 내주느라 바빠요. 따뜻한 불(火)의 기운이 흙을 단단하게 다져 줘요.',
    여름: '여름의 흙은 뜨겁고 메말라 있어요. 촉촉한 물(水)의 기운, 곧 여유와 유연함이 더해질 때 만물을 길러요.',
    가을: '가을의 흙은 수확을 내어 주고 기운이 빠져 있어요. 불(火)의 온기, 곧 응원과 인정이 다시 힘을 채워 줘요.',
    겨울: '겨울의 흙은 꽁꽁 얼어 있어요. 따뜻한 불(火)을 만나야 생명을 품을 수 있으니, 열정을 주는 사람과 일을 가까이하세요.',
  },
  { // 金
    봄: '봄의 쇠는 아직 여린 금속이에요. 든든한 흙(土)의 기운, 곧 믿어 주는 사람과 안정된 기반이 필요해요.',
    여름: '여름의 쇠는 불 속에서 단련돼요. 힘들지만 가장 쓸모 있는 그릇이 되는 때예요. 물(水)로 식히듯 쉬어 가는 지혜가 필요해요.',
    가을: '가을의 쇠는 제철을 만나 가장 단단해요. 불(火)로 벼리면 명검이 되니, 목표와 책임이 주어질 때 진가가 드러나요.',
    겨울: '겨울의 쇠는 차갑고 맑아요. 따뜻한 불(火)의 기운이 더해지면 차가움이 녹고 재능이 세상에 쓰여요.',
  },
  { // 水
    봄: '봄의 물은 얼음이 녹아 흐르기 시작한 시냇물이에요. 초목을 기르느라 힘이 빠지기 쉬우니, 물의 근원인 쇠(金)의 기운, 곧 원칙과 꾸준함이 도움이 돼요.',
    여름: '여름의 물은 귀한 단비예요. 어디서나 환영받지만 금세 마르기 쉬워요. 물을 낳는 쇠(金), 곧 나를 채워 주는 배움과 휴식을 챙기세요.',
    가을: '가을의 물은 맑고 깊어요. 쇠의 도움으로 샘이 마르지 않으니 지혜가 빛나요. 나무(木)로 흘려보내듯 재능을 표현하면 좋아요.',
    겨울: '겨울의 물은 제철을 만나 넘실대지만 얼기 쉬워요. 따뜻한 불(火)의 기운, 곧 활동과 사람들 속의 온기가 물을 흐르게 해요.',
  },
];

export const ANIMAL_NOTES = [
  '눈치가 빠르고 부지런하며 재물을 모으는 재주가 있어요.',
  '우직하고 성실해서 맡은 일을 끝까지 해내요.',
  '용감하고 리더십이 강하며 불의를 참지 못해요.',
  '온화하고 재치 있으며 사람들에게 사랑받아요.',
  '포부가 크고 당당하며 큰 무대에서 빛나요.',
  '지혜롭고 직관이 뛰어나며 속이 깊어요.',
  '활동적이고 자유로우며 열정이 넘쳐요.',
  '온순하고 배려심이 깊으며 예술적 감각이 있어요.',
  '재주가 많고 임기응변에 능하며 유머가 있어요.',
  '꼼꼼하고 계획적이며 자기 표현이 분명해요.',
  '의리 있고 정직하며 책임감이 강해요.',
  '너그럽고 복이 많으며 정이 깊어요.',
];

// 오행과 몸 (한의학의 오행 배속, 『황제내경』)
export const ORGAN_NOTES = [
  { organs: '간 · 담 · 눈 · 근육', tip: '눈의 피로와 근육 뭉침을 자주 풀어 주고, 과음과 밤샘을 피하세요.' },
  { organs: '심장 · 소장 · 혈관', tip: '흥분과 과로를 피하고, 가벼운 유산소 운동으로 순환을 도와주세요.' },
  { organs: '비장 · 위장 · 소화기', tip: '규칙적인 식사가 가장 중요해요. 걱정이 많을 때 소화부터 무너지기 쉬워요.' },
  { organs: '폐 · 대장 · 피부 · 호흡기', tip: '건조한 환경을 피하고 깊은 호흡을 자주 해 주세요. 환절기를 특히 조심하세요.' },
  { organs: '신장 · 방광 · 뼈 · 귀', tip: '몸을 차갑게 두지 말고 물을 충분히 마시세요. 수면 부족이 가장 큰 적이에요.' },
];

// 심리학 노트: 실제 발표된 연구의 요약
export const PSYCH = {
  ember: {
    title: '쉬는 시간의 길이보다 “내려놓기”',
    text: '조직심리학자 자비네 조넨탁(Sabine Sonnentag)의 연구에서, 퇴근 후 일 생각에서 심리적으로 완전히 떨어지는 사람일수록 피로와 소진이 덜했어요. 세계보건기구(WHO)도 2019년 번아웃을 “잘 관리되지 않은 만성적 직장 스트레스에서 오는 현상”으로 규정했어요. 개인이 약해서가 아니라는 뜻이에요.',
    cite: 'Sonnentag & Fritz (2007), Journal of Occupational Health Psychology · WHO ICD-11 (2019)',
  },
  wave: {
    title: '걱정은 없애는 것보다 미뤄 두는 것',
    text: '심리학자 토머스 보르코벡(Thomas Borkovec)은 걱정이 많은 사람들에게 하루 30분 “걱정 시간”을 정해 그때만 걱정하게 했어요. 4주 뒤 이들이 걱정에 쓰는 시간은 눈에 띄게 줄었어요. 걱정을 억지로 멈추려 하기보다 시간과 장소를 정해 두는 편이 효과적이에요.',
    cite: 'Borkovec, Wilkinson, Folensbee & Lerman (1983), Behaviour Research and Therapy',
  },
  kettle: {
    title: '누른 감정은 사라지지 않아요',
    text: '스탠퍼드대 제임스 그로스(James Gross)의 연구에서, 감정을 습관적으로 억누르는 사람은 긍정적인 감정을 덜 느끼고 관계 만족도도 낮았어요. 반대로 제임스 페니베이커(James Pennebaker)는 힘든 경험을 하루 15분씩 나흘간 글로 쓴 사람들이 이후 몇 달간 병원을 덜 찾았다고 보고했어요.',
    cite: 'Gross & John (2003), Journal of Personality and Social Psychology · Pennebaker & Beall (1986), Journal of Abnormal Psychology',
  },
  fog: {
    title: '기분이 나아져서 움직이는 게 아니라, 움직여서 나아져요',
    text: '“행동 활성화”는 의욕이 생기기를 기다리지 않고 작은 행동부터 시작하는 심리 치료법이에요. 2006년 미국의 임상 연구에서 이 방법은 우울 증상이 심한 사람들에게 항우울제와 비슷한 효과를 보였어요. 이불 개기 같은 2분짜리 행동이 출발점이 되는 이유예요.',
    cite: 'Dimidjian et al. (2006), Journal of Consulting and Clinical Psychology',
  },
  juggler: {
    title: '완벽주의는 당신만의 문제가 아니에요',
    text: '심리학자 토머스 커런(Thomas Curran)과 앤드루 힐(Andrew Hill)이 1989~2016년 대학생 4만여 명의 자료를 분석했더니, 완벽주의는 세대가 지날수록 꾸준히 높아졌어요. 그중에서도 “남들이 내게 완벽을 기대한다”고 느끼는 완벽주의가 가장 크게 늘었어요.',
    cite: 'Curran & Hill (2019), Psychological Bulletin',
  },
  card: {
    title: '나에게 건네는 다정한 말의 힘',
    text: '심리학자 크리스틴 네프(Kristin Neff)는 힘들 때 자신을 친구 대하듯 다정하게 대하는 태도를 “자기 자비”라고 불렀어요. 여러 연구를 모아 분석한 결과, 자기 자비가 높은 사람일수록 불안·우울·스트레스가 뚜렷하게 낮았어요.',
    cite: 'Neff (2003), Self and Identity · MacBeth & Gumley (2012), Clinical Psychology Review',
  },
  breathe: {
    title: '느린 호흡이 몸을 쉬게 해요',
    text: '느린 호흡에 관한 연구들을 모아 검토한 결과, 1분에 10번 이하로 천천히 숨 쉬면 심박 변이도가 높아지고 편안함과 이완감이 커졌어요. 4초 들이쉬고 6초 내쉬면 1분에 6번, 가장 많이 연구된 속도예요.',
    cite: 'Zaccaro et al. (2018), Frontiers in Human Neuroscience',
  },
  nature: {
    title: '자연이 주는 회복',
    text: '환경심리학자 로저 울리히(Roger Ulrich)는 창밖으로 나무가 보이는 병실의 환자가 벽만 보이는 병실의 환자보다 수술 후 더 빨리 퇴원하고 진통제도 덜 썼다고 보고했어요. 일본의 숲 24곳에서 진행된 연구에서도 숲을 걸은 사람은 도시를 걸은 사람보다 스트레스 호르몬 수치가 낮았어요.',
    cite: 'Ulrich (1984), Science · Park et al. (2010), Environmental Health and Preventive Medicine',
  },
  match: {
    title: '궁합보다 중요한 5 대 1의 법칙',
    text: '부부 연구로 유명한 존 가트맨(John Gottman)은 오래가는 커플의 대화를 관찰해, 다투는 중에도 긍정적인 말과 행동이 부정적인 것보다 약 5배 많다는 것을 발견했어요. 타고난 합만큼 중요한 건 서로를 대하는 매일의 습관이에요.',
    cite: 'Gottman & Levenson (1992), Journal of Personality and Social Psychology',
  },
  fortune: {
    title: '운세를 현명하게 쓰는 법',
    text: '사회학자 로버트 머튼(Robert Merton)은 믿음이 행동을 바꾸고, 그 행동이 결국 믿음을 현실로 만드는 현상을 “자기충족적 예언”이라고 불렀어요. 좋은 운세는 한 걸음 내딛는 발판으로, 조심하라는 운세는 미리 대비하는 계기로 삼아 보세요.',
    cite: 'Merton (1948), The Antioch Review',
  },
  name: {
    title: '이름은 생각보다 깊이 나와 이어져 있어요',
    text: '심리학자 요제프 뉘틴(Jozef Nuttin)은 사람들이 자기 이름에 들어 있는 글자를 다른 글자보다 더 좋아한다는 “이름 글자 효과”를 발견했어요. 이름은 자아의 일부처럼 느껴지기 때문이에요.',
    cite: 'Nuttin (1985), European Journal of Social Psychology',
  },
};

export const psychNote = (key) => {
  const n = PSYCH[key];
  return `<aside class="psych"><p class="psych-tag">심리학 노트</p><strong>${n.title}</strong><p>${n.text}</p><cite>${n.cite}</cite></aside>`;
};

// '풀이의 근거' 화면
export const ABOUT = {
  history: [
    ['뿌리', '사주명리는 태어난 연·월·일·시를 간지(干支) 여덟 글자로 바꾸어 사람의 기질과 흐름을 읽는 학문이에요. 당나라 때 연주(年柱) 중심으로 시작되어, 송나라 초 서자평(徐子平)이 태어난 날의 천간인 일간(日干)을 “나”로 보는 지금의 체계를 세웠어요. 그래서 명리학을 자평학(子平學)이라고도 불러요.'],
    ['조선의 국가 시험', '조선 시대에는 명리학이 국가의 공식 학문이었어요. 천문·지리·명과학을 맡은 관청 관상감이 있었고, 『경국대전』은 명과학 관리를 뽑는 시험(음양과)의 과목으로 『원천강』, 『서자평』, 『응천가』, 『범위수』 등을 정해 두었어요.'],
  ],
  classics: [
    ['『연해자평(淵海子平)』', '송나라 서승이 엮은 자평명리의 기본서. 일간 중심의 풀이, 십성과 격국의 틀을 담고 있어요.'],
    ['『적천수(滴天髓)』', '천간과 지지의 성질을 시처럼 압축해 노래한 책. 이 앱의 일간 풀이에 인용한 구절이 여기서 나왔어요.'],
    ['『자평진전(子平眞詮)』', '청나라 심효첨의 저작. 월지를 기준으로 격국과 용신을 정하는 이론을 정리했어요.'],
    ['『궁통보감(窮通寶鑑)』', '태어난 계절의 춥고 더움을 맞추는 조후(調候) 용신을 다룬 책. “계절로 본 나” 풀이의 바탕이에요.'],
    ['『삼명통회(三命通會)』', '명나라 만민영이 엮은 명리 백과. 천을귀인, 역마, 도화 같은 신살이 집대성되어 있어요.'],
  ],
  method: [
    ['절기와 연·월주', '한 해의 시작은 설날이 아니라 입춘, 한 달의 시작은 12절기예요. 태양의 황경을 천문 공식(Jean Meeus, Astronomical Algorithms)으로 계산해 절기가 드는 시각까지 반영해요.'],
    ['진태양시', '한국 표준시는 동경 135° 기준이라 서울(동경 127°)의 실제 태양 위치와 약 30분 차이가 나요. 이를 보정해 시주를 세워요. 1954~1961년의 표준시 변경과 1987~1988년 서머타임도 반영해요.'],
    ['음력 변환', '음력 생일은 오픈소스 라이브러리 korean-lunar-calendar로 양력으로 바꾼 뒤 계산해요. 윤달도 지원해요.'],
    ['대운', '태어난 날부터 다음(또는 이전) 절기까지의 날수를 3으로 나누어 대운이 시작되는 나이를 구하는 전통 방식을 따라요.'],
    ['신강·신약과 용신', '월지에 가장 큰 가중치를 두고 일간을 돕는 기운의 비율을 계산해요. 용신은 억부(抑扶)와 조후를 간략히 적용한 것으로, 학파와 명리학자에 따라 판단이 달라질 수 있어요.'],
  ],
  others: [
    ['점성학', '서양 점성학은 2세기 프톨레마이오스의 『테트라비블로스』에서 체계가 잡혔어요. 이 앱은 춘분점을 기준으로 하는 열대 황도대를 쓰고, 태양·달의 위치와 상승점을 천문 공식으로 계산해요.'],
    ['성명학의 수리', '오늘날 널리 쓰이는 81수리 획수 풀이는 일본의 구마사키 겐오(熊崎健翁)가 1929년 『성명의 신비』에서 체계화한 방식에서 비롯되었어요. 역학적 근거가 약하다는 학계의 비판도 있어, 이 앱에서는 참고용 재미 요소로 제공해요.'],
    ['발음오행의 두 가지 설', '한글 자음의 오행은 책마다 달라요. 작명에서 흔히 쓰는 방식(ㅇㅎ은 土, ㅁㅂㅍ은 水)은 신경준의 『훈민정음운해』(1750)를 따르고, 『훈민정음 해례본』(1446)은 반대로 ㅁㅂㅍ을 土, ㅇㅎ을 水로 보아요. 이 앱은 통용되는 방식을 따르되 이 차이를 밝혀 둡니다.'],
  ],
  wise: '1948년 심리학자 버트럼 포러(Bertram Forer)는 학생들에게 똑같은 성격 풀이를 나눠 주고 “당신만을 위한 분석”이라고 말했어요. 학생들은 평균 5점 만점에 4.26점으로 정확하다고 평가했어요. 누구에게나 맞을 법한 말을 자기 이야기로 받아들이는 이 현상을 “바넘 효과”라고 해요. 그러니 풀이를 정해진 운명으로 읽기보다, 유독 마음에 와닿는 문장을 골라 나를 이해하는 실마리로 삼아 보세요. 그것이 사주를 가장 현명하게 쓰는 방법이에요.',
  refs: [
    'Borkovec, T. D., Wilkinson, L., Folensbee, R., & Lerman, C. (1983). Stimulus control applications to the treatment of worry. Behaviour Research and Therapy, 21(3).',
    'Curran, T., & Hill, A. P. (2019). Perfectionism is increasing over time. Psychological Bulletin, 145(4).',
    'Dimidjian, S., et al. (2006). Randomized trial of behavioral activation, cognitive therapy, and antidepressant medication in the acute treatment of adults with major depression. Journal of Consulting and Clinical Psychology, 74(4).',
    'Forer, B. R. (1949). The fallacy of personal validation. Journal of Abnormal and Social Psychology, 44(1).',
    'Gottman, J. M., & Levenson, R. W. (1992). Marital processes predictive of later dissolution. Journal of Personality and Social Psychology, 63(2).',
    'Gross, J. J., & John, O. P. (2003). Individual differences in two emotion regulation processes. Journal of Personality and Social Psychology, 85(2).',
    'MacBeth, A., & Gumley, A. (2012). Exploring compassion: A meta-analysis. Clinical Psychology Review, 32(6).',
    'Merton, R. K. (1948). The self-fulfilling prophecy. The Antioch Review, 8(2).',
    'Neff, K. D. (2003). Self-compassion: An alternative conceptualization of a healthy attitude toward oneself. Self and Identity, 2(2).',
    'Nuttin, J. M. (1985). Narcissism beyond Gestalt and awareness: The name letter effect. European Journal of Social Psychology, 15(3).',
    'Park, B. J., et al. (2010). The physiological effects of Shinrin-yoku. Environmental Health and Preventive Medicine, 15(1).',
    'Pennebaker, J. W., & Beall, S. K. (1986). Confronting a traumatic event. Journal of Abnormal Psychology, 95(3).',
    'Sonnentag, S., & Fritz, C. (2007). The Recovery Experience Questionnaire. Journal of Occupational Health Psychology, 12(3).',
    'Ulrich, R. S. (1984). View through a window may influence recovery from surgery. Science, 224(4647).',
    'Zaccaro, A., et al. (2018). How breath-control can change your life: A systematic review. Frontiers in Human Neuroscience, 12.',
    '한국학중앙연구원, 한국민족문화대백과사전 「음양과」 · 조선왕조실록사전 「명과학」.',
  ],
};
