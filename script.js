// 날씨 대시보드 JavaScript
class WeatherDashboard {
    constructor() {
        // OpenWeatherMap API 키 (실제 사용시에는 환경변수로 관리하세요)
        this.apiKey = 'YOUR_API_KEY_HERE';
        this.baseUrl = 'https://api.openweathermap.org/data/2.5';
        
        // 도시 정보
        this.cities = {
            seoul: {
                name: '서울 중구 을지로',
                lat: 37.5660,
                lon: 126.9784,
                id: 'seoul'
            },
            seogwipo: {
                name: '서귀포 대정읍 NLCS',
                lat: 33.2215,
                lon: 126.2495,
                id: 'seogwipo'
            }
        };
        
        // 이전 날씨 데이터 저장 (변화 감지용)
        this.previousWeatherData = {};
        
        // 사운드 요소
        this.notificationSound = document.getElementById('notification-sound');
        
        this.init();
    }
    
    init() {
        // API 키가 설정되지 않은 경우 데모 데이터 사용
        if (this.apiKey === 'YOUR_API_KEY_HERE') {
            console.warn('API 키가 설정되지 않았습니다. 데모 데이터를 사용합니다.');
            this.loadDemoData();
        } else {
            this.loadWeatherData();
        }
        
        // 새로고침 버튼 이벤트
        document.getElementById('refresh-btn').addEventListener('click', () => {
            this.loadWeatherData();
        });
        
        // 30분마다 자동 업데이트
        setInterval(() => {
            this.loadWeatherData();
        }, 30 * 60 * 1000);
    }
    
    async loadWeatherData() {
        try {
            // 두 도시의 날씨 데이터를 병렬로 가져오기
            const promises = Object.values(this.cities).map(city => 
                this.fetchCityWeather(city)
            );
            
            const results = await Promise.all(promises);
            
            // 결과 처리
            results.forEach((data, index) => {
                const city = Object.values(this.cities)[index];
                this.updateCityWeather(city.id, data);
                this.checkWeatherChanges(city.id, data);
            });
            
            this.updateLastUpdated();
            
        } catch (error) {
            console.error('날씨 데이터 로딩 실패:', error);
            this.showNotification('날씨 데이터를 불러오는데 실패했습니다.');
        }
    }
    
    async fetchCityWeather(city) {
        // 현재 날씨
        const currentResponse = await fetch(
            `${this.baseUrl}/weather?lat=${city.lat}&lon=${city.lon}&appid=${this.apiKey}&units=metric&lang=kr`
        );
        const currentData = await currentResponse.json();
        
        // 5일 예보 (3시간 간격)
        const forecastResponse = await fetch(
            `${this.baseUrl}/forecast?lat=${city.lat}&lon=${city.lon}&appid=${this.apiKey}&units=metric&lang=kr`
        );
        const forecastData = await forecastResponse.json();
        
        return {
            current: currentData,
            forecast: this.processForecastData(forecastData)
        };
    }
    
    processForecastData(forecastData) {
        const dailyForecasts = {};
        
        forecastData.list.forEach(item => {
            const date = new Date(item.dt * 1000);
            const dateKey = date.toISOString().split('T')[0];
            
            if (!dailyForecasts[dateKey]) {
                dailyForecasts[dateKey] = {
                    date: dateKey,
                    temps: [],
                    weather: item.weather[0],
                    humidity: item.main.humidity,
                    windSpeed: item.wind.speed
                };
            }
            
            dailyForecasts[dateKey].temps.push(item.main.temp);
        });
        
        // 일별 최고/최저 온도 계산
        return Object.values(dailyForecasts).slice(0, 9).map(day => ({
            ...day,
            tempMax: Math.round(Math.max(...day.temps)),
            tempMin: Math.round(Math.min(...day.temps))
        }));
    }
    
    updateCityWeather(cityId, weatherData) {
        const { current, forecast } = weatherData;
        
        // 현재 날씨 업데이트
        this.updateCurrentWeather(cityId, current);
        
        // 주간 예보 업데이트
        this.updateWeeklyForecast(cityId, forecast);
    }
    
    updateCurrentWeather(cityId, currentData) {
        const container = document.getElementById(`${cityId}-current`);
        
        const weatherIcon = this.getWeatherIcon(currentData.weather[0].main);
        const temperature = Math.round(currentData.main.temp);
        const description = currentData.weather[0].description;
        const humidity = currentData.main.humidity;
        const windSpeed = Math.round(currentData.wind.speed * 3.6); // m/s를 km/h로 변환
        const pressure = currentData.main.pressure;
        const feelsLike = Math.round(currentData.main.feels_like);
        
        container.innerHTML = `
            <div class="weather-main">
                <div>
                    <div class="temperature">${temperature}°C</div>
                    <div class="weather-description">${description}</div>
                </div>
                <div class="weather-icon">${weatherIcon}</div>
            </div>
            <div class="weather-details">
                <div class="detail-item">
                    <i class="fas fa-thermometer-half"></i>
                    <span>체감온도: ${feelsLike}°C</span>
                </div>
                <div class="detail-item">
                    <i class="fas fa-tint"></i>
                    <span>습도: ${humidity}%</span>
                </div>
                <div class="detail-item">
                    <i class="fas fa-wind"></i>
                    <span>바람: ${windSpeed} km/h</span>
                </div>
                <div class="detail-item">
                    <i class="fas fa-gauge"></i>
                    <span>기압: ${pressure} hPa</span>
                </div>
            </div>
        `;
    }
    
    updateWeeklyForecast(cityId, forecastData) {
        const container = document.getElementById(`${cityId}-weekly`);
        
        const forecastHTML = forecastData.map((day, index) => {
            const date = new Date(day.date);
            const dayName = index === 0 ? '오늘' : 
                           index === 1 ? '내일' : 
                           this.getDayName(date.getDay());
            
            // 날짜 포맷 (월/일)
            const dateString = `${date.getMonth() + 1}/${date.getDate()}`;
            
            const weatherIcon = this.getWeatherIcon(day.weather.main);
            
            return `
                <div class="day-forecast">
                    <div class="day-name">${dayName}</div>
                    <div class="day-date">${dateString}</div>
                    <div class="day-icon">${weatherIcon}</div>
                    <div class="day-temps">
                        <span class="temp-high">${day.tempMax}°</span>
                        <span class="temp-low">${day.tempMin}°</span>
                    </div>
                    <div class="day-description">${day.weather.description}</div>
                </div>
            `;
        }).join('');
        
        container.innerHTML = forecastHTML;
    }
    
    checkWeatherChanges(cityId, newWeatherData) {
        const previousData = this.previousWeatherData[cityId];
        
        if (previousData) {
            const currentTemp = Math.round(newWeatherData.current.main.temp);
            const previousTemp = Math.round(previousData.current.main.temp);
            const currentWeather = newWeatherData.current.weather[0].main;
            const previousWeather = previousData.current.weather[0].main;
            
            let changeMessage = '';
            
            // 온도 변화 확인 (5도 이상 차이)
            if (Math.abs(currentTemp - previousTemp) >= 5) {
                const change = currentTemp > previousTemp ? '상승' : '하강';
                changeMessage += `${this.cities[cityId].name} 온도가 ${Math.abs(currentTemp - previousTemp)}도 ${change}했습니다. `;
            }
            
            // 날씨 상태 변화 확인
            if (currentWeather !== previousWeather) {
                changeMessage += `${this.cities[cityId].name} 날씨가 ${previousWeather}에서 ${currentWeather}로 변경되었습니다.`;
            }
            
            if (changeMessage) {
                this.showNotification(changeMessage);
                this.playNotificationSound();
                this.highlightWeatherChange(cityId);
            }
        }
        
        // 현재 데이터를 이전 데이터로 저장
        this.previousWeatherData[cityId] = newWeatherData;
    }
    
    showNotification(message) {
        const notification = document.getElementById('notification');
        const notificationText = document.getElementById('notification-text');
        
        notificationText.textContent = message;
        notification.style.display = 'block';
        
        // 5초 후 알림 숨기기
        setTimeout(() => {
            notification.style.display = 'none';
        }, 5000);
    }
    
    playNotificationSound() {
        // 간단한 비프음 생성
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
        oscillator.frequency.setValueAtTime(600, audioContext.currentTime + 0.1);
        oscillator.frequency.setValueAtTime(800, audioContext.currentTime + 0.2);
        
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.3);
    }
    
    highlightWeatherChange(cityId) {
        const section = document.getElementById(`${cityId}-section`);
        section.classList.add('weather-change');
        
        setTimeout(() => {
            section.classList.remove('weather-change');
        }, 3000);
    }
    
    getWeatherIcon(weatherMain) {
        const iconMap = {
            'Clear': '☀️',
            'Clouds': '☁️',
            'Rain': '🌧️',
            'Drizzle': '🌦️',
            'Thunderstorm': '⛈️',
            'Snow': '❄️',
            'Mist': '🌫️',
            'Fog': '🌫️',
            'Haze': '🌫️',
            'Dust': '🌪️',
            'Sand': '🌪️',
            'Ash': '🌋',
            'Squall': '💨',
            'Tornado': '🌪️'
        };
        
        return iconMap[weatherMain] || '🌤️';
    }
    
    getDayName(dayIndex) {
        const days = ['일', '월', '화', '수', '목', '금', '토'];
        return days[dayIndex];
    }
    
    updateLastUpdated() {
        const now = new Date();
        const timeString = now.toLocaleString('ko-KR', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
        
        document.getElementById('last-updated').textContent = `마지막 업데이트: ${timeString}`;
    }
    
    // 데모 데이터 (API 키가 없을 때 사용)
    loadDemoData() {
        // 오늘부터 9일간의 날짜 생성
        const today = new Date();
        const generateDates = () => {
            const dates = [];
            for (let i = 0; i < 9; i++) {
                const date = new Date(today);
                date.setDate(today.getDate() + i);
                dates.push(date.toISOString().split('T')[0]);
            }
            return dates;
        };
        
        const dates = generateDates();
        
        const demoData = {
            seoul: {
                current: {
                    main: { temp: 22, feels_like: 24, humidity: 65, pressure: 1013 },
                    weather: [{ main: 'Clear', description: '맑음' }],
                    wind: { speed: 3.2 }
                },
                forecast: [
                    { date: dates[0], tempMax: 25, tempMin: 18, weather: { main: 'Clear', description: '맑음' } },
                    { date: dates[1], tempMax: 23, tempMin: 16, weather: { main: 'Clouds', description: '구름많음' } },
                    { date: dates[2], tempMax: 20, tempMin: 14, weather: { main: 'Rain', description: '비' } },
                    { date: dates[3], tempMax: 22, tempMin: 15, weather: { main: 'Clear', description: '맑음' } },
                    { date: dates[4], tempMax: 24, tempMin: 17, weather: { main: 'Clouds', description: '구름많음' } },
                    { date: dates[5], tempMax: 21, tempMin: 13, weather: { main: 'Rain', description: '소나기' } },
                    { date: dates[6], tempMax: 26, tempMin: 19, weather: { main: 'Clear', description: '맑음' } },
                    { date: dates[7], tempMax: 27, tempMin: 20, weather: { main: 'Clouds', description: '흐림' } },
                    { date: dates[8], tempMax: 25, tempMin: 18, weather: { main: 'Clear', description: '맑음' } }
                ]
            },
            seogwipo: {
                current: {
                    main: { temp: 26, feels_like: 28, humidity: 78, pressure: 1015 },
                    weather: [{ main: 'Clouds', description: '구름많음' }],
                    wind: { speed: 4.1 }
                },
                forecast: [
                    { date: dates[0], tempMax: 28, tempMin: 22, weather: { main: 'Clouds', description: '구름많음' } },
                    { date: dates[1], tempMax: 27, tempMin: 21, weather: { main: 'Rain', description: '비' } },
                    { date: dates[2], tempMax: 25, tempMin: 19, weather: { main: 'Rain', description: '비' } },
                    { date: dates[3], tempMax: 29, tempMin: 23, weather: { main: 'Clear', description: '맑음' } },
                    { date: dates[4], tempMax: 30, tempMin: 24, weather: { main: 'Clear', description: '맑음' } },
                    { date: dates[5], tempMax: 28, tempMin: 22, weather: { main: 'Clouds', description: '구름많음' } },
                    { date: dates[6], tempMax: 27, tempMin: 20, weather: { main: 'Rain', description: '소나기' } },
                    { date: dates[7], tempMax: 29, tempMin: 23, weather: { main: 'Clear', description: '맑음' } },
                    { date: dates[8], tempMax: 26, tempMin: 21, weather: { main: 'Clouds', description: '흐림' } }
                ]
            }
        };
        
        Object.keys(demoData).forEach(cityId => {
            this.updateCityWeather(cityId, demoData[cityId]);
        });
        
        this.updateLastUpdated();
        
        // 데모 모드에서는 10초마다 랜덤하게 날씨 변화 시뮬레이션
        setInterval(() => {
            this.simulateWeatherChange();
        }, 10000);
    }
    
    simulateWeatherChange() {
        const cities = ['seoul', 'seogwipo'];
        const randomCity = cities[Math.floor(Math.random() * cities.length)];
        const messages = [
            `${this.cities[randomCity].name} 온도가 5도 상승했습니다.`,
            `${this.cities[randomCity].name} 날씨가 맑음에서 흐림으로 변경되었습니다.`,
            `${this.cities[randomCity].name}에 비가 시작되었습니다.`
        ];
        
        if (Math.random() < 0.3) { // 30% 확률로 알림
            const randomMessage = messages[Math.floor(Math.random() * messages.length)];
            this.showNotification(randomMessage);
            this.playNotificationSound();
            this.highlightWeatherChange(randomCity);
        }
    }
}

// 페이지 로드 시 대시보드 초기화
document.addEventListener('DOMContentLoaded', () => {
    new WeatherDashboard();
});
