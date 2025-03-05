/**
 * 单词消消乐游戏
 * 将背诵单词和消消乐结合的网页游戏
 */

class WordMatchGame {
    constructor() {
        // 游戏状态
        this.currentLevel = 1;
        this.score = 0;
        this.timer = 0;
        this.timerInterval = null;
        this.matchedPairs = 0;
        this.totalPairs = 0;
        this.selectedCard = null;
        
        // 声音效果
        this.correctSound = document.getElementById('correct-sound');
        this.wrongSound = document.getElementById('wrong-sound');
        this.levelCompleteSound = document.getElementById('level-complete-sound');
        
        // 游戏元素
        this.gameIntro = document.getElementById('game-intro');
        this.gameBoard = document.getElementById('game-board');
        this.levelComplete = document.getElementById('level-complete');
        this.gameOver = document.getElementById('game-over');
        this.wordsContainer = document.getElementById('words-container');
        
        // 状态显示元素
        this.currentLevelEl = document.getElementById('current-level');
        this.scoreEl = document.getElementById('score');
        this.timerEl = document.getElementById('timer');
        this.completedLevelEl = document.getElementById('completed-level');
        this.levelTimeEl = document.getElementById('level-time');
        this.levelScoreEl = document.getElementById('level-score');
        this.finalScoreEl = document.getElementById('final-score');
        
        // 按钮
        this.startGameBtn = document.getElementById('start-game');
        this.nextLevelBtn = document.getElementById('next-level');
        this.restartGameBtn = document.getElementById('restart-game');
        
        // 初始化事件监听
        this.initEventListeners();
    }
    
    // 初始化事件监听器
    initEventListeners() {
        this.startGameBtn.addEventListener('click', () => this.startGame());
        this.nextLevelBtn.addEventListener('click', () => this.loadNextLevel());
        this.restartGameBtn.addEventListener('click', () => this.restartGame());
    }
    
    // 开始游戏
    startGame() {
        this.currentLevel = 1;
        this.score = 0;
        this.updateUI();
        this.loadLevel(this.currentLevel);
        this.hideAllScreens();
        this.gameBoard.classList.remove('hidden');
        this.startTimer();
    }
    
    // 重新开始游戏
    restartGame() {
        this.hideAllScreens();
        this.gameIntro.classList.remove('hidden');
        this.stopTimer();
    }
    
    // 隐藏所有游戏屏幕
    hideAllScreens() {
        this.gameIntro.classList.add('hidden');
        this.gameBoard.classList.add('hidden');
        this.levelComplete.classList.add('hidden');
        this.gameOver.classList.add('hidden');
    }
    
    // 加载指定关卡
    loadLevel(level) {
        // 确保关卡存在
        if (!VOCABULARY[level]) {
            this.endGame();
            return;
        }
        
        this.currentLevel = level;
        this.matchedPairs = 0;
        this.totalPairs = VOCABULARY[level].length;
        
        // 更新UI
        this.updateUI();
        
        // 创建卡片
        this.createWordCards();
    }
    
    // 加载下一关
    loadNextLevel() {
        this.stopTimer();
        this.loadLevel(this.currentLevel + 1);
        this.hideAllScreens();
        this.gameBoard.classList.remove('hidden');
        this.startTimer();
    }
    
    // 创建单词卡片
    createWordCards() {
        // 清空容器
        this.wordsContainer.innerHTML = '';
        
        // 获取当前关卡的单词
        const wordPairs = VOCABULARY[this.currentLevel];
        
        // 创建英文和中文卡片
        const cards = [];
        
        wordPairs.forEach(pair => {
            // 英文卡片
            const englishCard = document.createElement('div');
            englishCard.className = 'word-card english';
            englishCard.textContent = pair.english;
            englishCard.dataset.type = 'english';
            englishCard.dataset.pair = pair.english;
            
            // 中文卡片
            const chineseCard = document.createElement('div');
            chineseCard.className = 'word-card chinese';
            chineseCard.textContent = pair.chinese;
            chineseCard.dataset.type = 'chinese';
            chineseCard.dataset.pair = pair.english;
            
            cards.push(englishCard, chineseCard);
        });
        
        // 随机排序卡片
        this.shuffleArray(cards);
        
        // 添加到容器中
        cards.forEach(card => {
            card.addEventListener('click', (e) => this.handleCardClick(e));
            this.wordsContainer.appendChild(card);
            
            // 添加出场动画效果
            setTimeout(() => {
                card.style.animation = 'fadeIn 0.5s forwards';
            }, 50 * this.wordsContainer.children.length);
        });
    }
    
    // 处理卡片点击
    handleCardClick(event) {
        const clickedCard = event.target;
        
        // 如果点击已配对或选中的卡片，不做任何处理
        if (
            clickedCard.classList.contains('matched') || 
            clickedCard === this.selectedCard
        ) {
            return;
        }
        
        // 选中卡片
        clickedCard.classList.add('selected');
        
        // 如果这是第一张选中的卡片
        if (!this.selectedCard) {
            this.selectedCard = clickedCard;
            return;
        }
        
        // 这是第二张选中的卡片，检查是否匹配
        const firstCard = this.selectedCard;
        const secondCard = clickedCard;
        
        // 检查卡片是否匹配（同一对但类型不同）
        if (
            firstCard.dataset.pair === secondCard.dataset.pair && 
            firstCard.dataset.type !== secondCard.dataset.type
        ) {
            // 匹配成功
            this.handleMatch(firstCard, secondCard);
        } else {
            // 匹配失败
            this.handleMismatch(firstCard, secondCard);
        }
        
        // 清除选中状态
        this.selectedCard = null;
    }
    
    // 处理匹配成功
    handleMatch(firstCard, secondCard) {
        // 播放匹配成功音效
        this.playSound(this.correctSound);
        
        // 添加匹配成功动画
        firstCard.classList.add('correct');
        secondCard.classList.add('correct');
        
        // 增加分数
        this.score += 10 * this.currentLevel;
        this.updateUI();
        
        // 匹配数量+1
        this.matchedPairs++;
        
        // 延迟后移除卡片
        setTimeout(() => {
            firstCard.style.visibility = 'hidden';
            secondCard.style.visibility = 'hidden';
            firstCard.classList.remove('selected', 'correct');
            secondCard.classList.remove('selected', 'correct');
            
            // 检查是否完成所有匹配
            if (this.matchedPairs >= this.totalPairs) {
                this.completeLevel();
            }
        }, 500);
    }
    
    // 处理匹配失败
    handleMismatch(firstCard, secondCard) {
        // 播放匹配失败音效
        this.playSound(this.wrongSound);
        
        // 添加匹配失败动画
        firstCard.classList.add('wrong');
        secondCard.classList.add('wrong');
        
        // 减少分数（最少为0）
        this.score = Math.max(0, this.score - 5);
        this.updateUI();
        
        // 延迟后重置卡片
        setTimeout(() => {
            firstCard.classList.remove('selected', 'wrong');
            secondCard.classList.remove('selected', 'wrong');
        }, 800);
    }
    
    // 完成当前关卡
    completeLevel() {
        this.stopTimer();
        
        // 播放关卡完成音效
        this.playSound(this.levelCompleteSound);
        
        // 更新完成关卡显示
        this.completedLevelEl.textContent = this.currentLevel;
        this.levelTimeEl.textContent = this.formatTime(this.timer);
        this.levelScoreEl.textContent = this.score;
        
        // 隐藏游戏板，显示关卡完成屏幕
        this.hideAllScreens();
        this.levelComplete.classList.remove('hidden');
        
        // 如果已经是最后一关
        if (!VOCABULARY[this.currentLevel + 1]) {
            this.nextLevelBtn.textContent = '完成游戏';
            this.nextLevelBtn.addEventListener('click', () => this.endGame(), { once: true });
        }
    }
    
    // 结束游戏
    endGame() {
        this.stopTimer();
        
        // 更新最终分数
        this.finalScoreEl.textContent = this.score;
        
        // 隐藏其他屏幕，显示游戏结束屏幕
        this.hideAllScreens();
        this.gameOver.classList.remove('hidden');
    }
    
    // 开始计时器
    startTimer() {
        this.timer = 0;
        this.updateTimerDisplay();
        
        this.timerInterval = setInterval(() => {
            this.timer++;
            this.updateTimerDisplay();
        }, 1000);
    }
    
    // 停止计时器
    stopTimer() {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
    }
    
    // 更新计时器显示
    updateTimerDisplay() {
        this.timerEl.textContent = this.formatTime(this.timer);
    }
    
    // 格式化时间显示
    formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    
    // 更新UI显示
    updateUI() {
        this.currentLevelEl.textContent = this.currentLevel;
        this.scoreEl.textContent = this.score;
    }
    
    // 播放音效
    playSound(soundElement) {
        if (soundElement) {
            soundElement.currentTime = 0;
            soundElement.play().catch(e => console.log("Audio play error:", e));
        }
    }
    
    // 数组随机排序（Fisher-Yates 洗牌算法）
    shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }
}

// 在页面加载完成后初始化游戏
document.addEventListener('DOMContentLoaded', () => {
    // 创建声音文件夹
    const createSoundFolder = () => {
        const folder = '/Users/yexin/Documents/sideproject/word/sounds';
        const command = `mkdir -p ${folder}`;
        // 这个只是为了创建文件夹，不需要显示在UI上
    };
    
    // 初始化游戏
    const game = new WordMatchGame();
});
