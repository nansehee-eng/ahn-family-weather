# 안씨 가족 날씨 대시보드 🌤️

서울 중구 을지로와 제주 서귀포 대정읍 NLCS의 9일간 날씨 예보를 제공하는 가족 전용 반응형 웹 대시보드입니다. 날씨 변화가 있을 때 사운드 알림을 제공합니다.

## 🌐 사이트 접속
- **GitHub Pages**: https://사용자명.github.io/ahn-family-weather

## 주요 기능

- 📍 **두 도시 날씨 정보**: 서울과 제주 서귀포의 현재 날씨 및 7일 예보
- 🔔 **날씨 변화 알림**: 온도가 5도 이상 변하거나 날씨 상태가 바뀔 때 사운드 알림
- 📱 **반응형 디자인**: 모바일, 태블릿, 데스크톱에서 최적화된 화면
- 🇰🇷 **한국어 지원**: 모든 인터페이스와 날씨 정보가 한국어로 표시
- 🎨 **모던 UI**: 그라데이션과 글래스모피즘 효과를 활용한 아름다운 디자인
- ⚡ **실시간 업데이트**: 30분마다 자동으로 날씨 정보 갱신

## 설치 및 실행

### 1. 파일 다운로드
프로젝트 파일들을 로컬 폴더에 다운로드합니다:
- `index.html`
- `style.css`
- `script.js`
- `README.md`

### 2. OpenWeatherMap API 키 설정

1. [OpenWeatherMap](https://openweathermap.org/api) 사이트에 가입
2. 무료 API 키 발급
3. `script.js` 파일의 다음 부분을 수정:

```javascript
// 이 부분을 찾아서
this.apiKey = 'YOUR_API_KEY_HERE';

// 발급받은 API 키로 변경
this.apiKey = '여기에_발급받은_API_키_입력';
```

### 3. 웹 서버에서 실행

보안상의 이유로 로컬 파일을 직접 열면 API 호출이 제한될 수 있습니다. 다음 중 하나의 방법으로 실행하세요:

#### 방법 1: Python 내장 서버 (권장)
```bash
# Python 3가 설치된 경우
python -m http.server 8000

# Python 2가 설치된 경우
python -m SimpleHTTPServer 8000
```

그 후 브라우저에서 `http://localhost:8000` 접속

#### 방법 2: Node.js http-server
```bash
# http-server 설치
npm install -g http-server

# 서버 실행
http-server

# 또는 특정 포트로 실행
http-server -p 8000
```

#### 방법 3: Live Server (VS Code 확장)
VS Code에서 Live Server 확장을 설치하고 `index.html` 파일에서 "Go Live" 클릭

## 데모 모드

API 키를 설정하지 않으면 자동으로 데모 모드로 실행됩니다:
- 샘플 날씨 데이터 표시
- 10초마다 랜덤한 날씨 변화 알림 시뮬레이션
- 모든 기능을 테스트해볼 수 있음

## 기술 스택

- **HTML5**: 시맨틱 마크업
- **CSS3**: Flexbox, Grid, 애니메이션, 반응형 디자인
- **Vanilla JavaScript**: ES6+ 문법, Fetch API, Web Audio API
- **OpenWeatherMap API**: 실시간 날씨 데이터
- **Font Awesome**: 아이콘

## 브라우저 지원

- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

## 파일 구조

```
weather-dashboard/
├── index.html          # 메인 HTML 파일
├── style.css           # 스타일시트
├── script.js           # JavaScript 로직
└── README.md           # 이 파일
```

## 주요 클래스와 메서드

### WeatherDashboard 클래스

- `loadWeatherData()`: 날씨 데이터 로드
- `updateCityWeather()`: 도시별 날씨 정보 업데이트
- `checkWeatherChanges()`: 날씨 변화 감지
- `showNotification()`: 알림 표시
- `playNotificationSound()`: 사운드 재생

## 커스터마이징

### 도시 추가
`script.js`의 `cities` 객체에 새로운 도시를 추가할 수 있습니다:

```javascript
this.cities = {
    seoul: { name: '서울', lat: 37.5665, lon: 126.9780, id: 'seoul' },
    seogwipo: { name: '서귀포', lat: 33.2541, lon: 126.5601, id: 'seogwipo' },
    // 새 도시 추가
    busan: { name: '부산', lat: 35.1796, lon: 129.0756, id: 'busan' }
};
```

### 알림 조건 변경
온도 변화 임계값이나 알림 조건을 수정하려면 `checkWeatherChanges()` 메서드를 편집하세요.

### 스타일 변경
`style.css`에서 색상, 폰트, 레이아웃 등을 자유롭게 수정할 수 있습니다.

## 문제 해결

### API 키 관련 오류
- API 키가 올바른지 확인
- OpenWeatherMap 계정이 활성화되었는지 확인
- 일일 API 호출 한도를 초과하지 않았는지 확인

### CORS 오류
- 로컬 웹 서버를 통해 실행
- 브라우저의 개발자 도구에서 오류 메시지 확인

### 사운드 재생 안됨
- 브라우저의 자동 재생 정책으로 인해 사용자 상호작용 후에만 사운드 재생 가능
- 새로고침 버튼을 한 번 클릭한 후 사운드 알림이 정상 작동

## 라이선스

MIT License

## 기여하기

버그 리포트나 기능 제안은 언제든 환영합니다!
