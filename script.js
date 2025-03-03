document.addEventListener('DOMContentLoaded', () => {
    // 获取DOM元素
    const santa = document.getElementById('santa');
    const pole = document.getElementById('pole');
    const scoreElement = document.getElementById('score');
    const gameOverMessage = document.getElementById('gameOverMessage');
    const restartButton = document.getElementById('restartButton');
    const gameArea = document.querySelector('.game-area');
    const currentPillar = document.querySelector('.current-pillar');
    const nextPillar = document.querySelector('.next-pillar');
    const debugInfo = document.getElementById('debugInfo');
    
    // 是否启用调试模式（按D键切换）
    let debugMode = false;
    
    // 游戏变量
    let score = 0;
    let isGameOver = false;
    let isPressing = false;
    let poleLength = 0;
    let gameSpeed = 4;
    let animationId;
    let nextPillarDistance = 200;
    let nextPillarHeight = 40; // 固定高度
    let santaWidth = 40; // 圣诞老人宽度
    let isSmallScreen = window.innerWidth < 500;
    let gameAreaWidth = getGameAreaWidth(); // 获取游戏区域宽度
    let sceneResetCount = 0; // 场景重置计数器
    
    // 获取游戏区域实际宽度
    function getGameAreaWidth() {
        return gameArea.clientWidth || parseInt(getComputedStyle(gameArea).width);
    }
    
    // 更新调试信息
    function updateDebugInfo() {
        if (!debugMode) {
            debugInfo.style.display = 'none';
            return;
        }
        
        debugInfo.style.display = 'block';
        debugInfo.innerHTML = `
            游戏区域宽度: ${gameAreaWidth}px<br>
            当前柱子位置: ${currentPillar.style.left}<br>
            下一柱子位置: ${nextPillar.style.left}<br>
            圣诞老人位置: ${santa.style.left}<br>
            场景重置次数: ${sceneResetCount}
        `;
    }
    
    // 添加雪花效果
    function createSnowflakes() {
        const maxSnowflakes = isSmallScreen ? 20 : 40;
        
        // 清除现有雪花
        const existingSnowflakes = document.querySelectorAll('.snowflake');
        existingSnowflakes.forEach(flake => flake.remove());
        
        // 创建新雪花
        for (let i = 0; i < maxSnowflakes; i++) {
            const snowflake = document.createElement('div');
            snowflake.className = 'snowflake';
            
            // 随机位置和大小
            const size = Math.random() * 5 + 3;
            snowflake.style.width = `${size}px`;
            snowflake.style.height = `${size}px`;
            snowflake.style.left = `${Math.random() * 100}%`;
            snowflake.style.opacity = Math.random() * 0.7 + 0.3;
            
            // 随机动画时间
            const animationDuration = Math.random() * 10 + 5;
            snowflake.style.animationDuration = `${animationDuration}s`;
            
            // 随机延迟
            snowflake.style.animationDelay = `${Math.random() * 5}s`;
            
            gameArea.appendChild(snowflake);
        }
    }
    
    // 屏幕尺寸检测
    function checkScreenSize() {
        isSmallScreen = window.innerWidth < 500;
        // 更新游戏区域宽度
        gameAreaWidth = getGameAreaWidth();
        
        // 根据屏幕尺寸调整游戏元素
        if (isSmallScreen) {
            santaWidth = 30;
        } else {
            santaWidth = 40;
        }
        createSnowflakes(); // 重新创建雪花效果
        updateDebugInfo(); // 更新调试信息
    }
    
    // 监听屏幕尺寸变化
    window.addEventListener('resize', () => {
        checkScreenSize();
        initGame(); // 屏幕尺寸变化时重新初始化游戏
    });
    
    // 初始化游戏
    function initGame() {
        // 重置游戏状态
        score = 0;
        isGameOver = false;
        isPressing = false;
        poleLength = 0;
        gameSpeed = 4;
        sceneResetCount = 0; // 重置场景重置计数器
        
        // 检查屏幕尺寸
        checkScreenSize();
        
        // 更新UI
        scoreElement.textContent = score;
        gameOverMessage.style.display = 'none';
        
        // 设置初始位置
        const initialLeft = 50;
        const pillarTop = 150;
        const pillarHeight = 40; // 固定高度
        const santaBottom = pillarTop + pillarHeight;
        
        santa.style.left = initialLeft + 'px';
        santa.style.bottom = santaBottom + 'px';
        santa.style.transform = 'rotate(0deg)';
        
        // 修复杆子位置：确保杆子从圣诞老人右侧开始
        pole.style.left = (initialLeft + santaWidth) + 'px';
        pole.style.bottom = santaBottom + 'px';
        pole.style.width = '0';
        pole.style.transform = 'rotate(0deg)';
        
        currentPillar.style.left = initialLeft + 'px';
        currentPillar.style.height = pillarHeight + 'px';
        
        // 随机生成下一个柱子
        nextPillarDistance = 150 + Math.random() * 150;
        nextPillarHeight = pillarHeight; // 使用固定高度
        nextPillar.style.left = (initialLeft + nextPillarDistance) + 'px';
        nextPillar.style.height = nextPillarHeight + 'px';
        
        // 取消可能存在的动画帧
        if (animationId) {
            cancelAnimationFrame(animationId);
        }
        
        // 创建雪花
        createSnowflakes();
        
        // 更新调试信息
        updateDebugInfo();
    }
    
    // 获取固定高度（不再使用随机高度）
    function getFixedHeight() {
        return 40; // 所有柱子统一高度为40px
    }
    
    // 按下时伸出杆子
    function extendPole() {
        if (isGameOver || isPressing) return;
        
        isPressing = true;
        
        // 伸出杆子的动画
        function extend() {
            if (isPressing) {
                poleLength += 2;
                pole.style.width = poleLength + 'px';
                animationId = requestAnimationFrame(extend);
            }
        }
        
        extend();
    }
    
    // 释放时停止伸长并旋转杆子
    function rotatePole() {
        if (isGameOver) return;
        
        isPressing = false;
        cancelAnimationFrame(animationId);
        
        // 旋转杆子的动画
        let rotationAngle = 0;
        
        function rotate() {
            if (rotationAngle < 90) {
                rotationAngle += 3;
                pole.style.transform = `rotate(${rotationAngle}deg)`;
                animationId = requestAnimationFrame(rotate);
            } else {
                checkSuccess();
            }
        }
        
        rotate();
    }
    
    // 检查是否成功过悬崖
    function checkSuccess() {
        const currentLeft = parseInt(santa.style.left);
        const poleStartX = currentLeft + santaWidth;
        const poleEnd = poleStartX + poleLength;
        const nextPillarStart = parseInt(nextPillar.style.left);
        const nextPillarEnd = nextPillarStart + 60; // 柱子宽度为60px
        
        if (poleEnd >= nextPillarStart && poleEnd <= nextPillarEnd) {
            // 成功过悬崖
            moveSanta();
        } else {
            // 失败，圣诞老人掉下来
            santaFalls();
        }
    }
    
    // 圣诞老人移动动画
    function moveSanta() {
        let currentLeft = parseInt(santa.style.left);
        let movePhase = 1; // 1:向前, 2:向下, 3:完成
        const poleStartX = currentLeft + santaWidth;
        
        function moveStep() {
            if (movePhase === 1) {
                // 向前移动到杆子末端
                currentLeft += 2;
                santa.style.left = currentLeft + 'px';
                
                if (currentLeft >= poleStartX + poleLength - santaWidth) {
                    movePhase = 2;
                }
                
                animationId = requestAnimationFrame(moveStep);
            } else if (movePhase === 2) {
                // 向下移动到下一个柱子
                let santaBottom = parseInt(santa.style.bottom);
                let targetBottom = 150 + nextPillarHeight;
                
                santaBottom -= 2;
                santa.style.bottom = santaBottom + 'px';
                
                if (santaBottom <= targetBottom) {
                    movePhase = 3;
                    
                    // 完成移动，更新分数和位置
                    score++;
                    scoreElement.textContent = score;
                    
                    // 增加游戏难度
                    if (score % 3 === 0) {
                        gameSpeed += 0.5;
                    }
                    
                    // 显示分数增加的提示
                    showScoreIndicator();
                    
                    // 重置位置
                    setupNextRound();
                }
                
                animationId = requestAnimationFrame(moveStep);
            }
        }
        
        moveStep();
    }
    
    // 显示分数增加的提示
    function showScoreIndicator() {
        const indicator = document.createElement('div');
        indicator.textContent = '+1';
        indicator.style.position = 'absolute';
        indicator.style.color = '#fff';
        indicator.style.fontSize = '24px';
        indicator.style.fontWeight = 'bold';
        indicator.style.zIndex = '25';
        indicator.style.left = nextPillar.style.left;
        indicator.style.bottom = (parseInt(nextPillar.style.bottom) + 50) + 'px';
        indicator.style.textShadow = '0 0 5px rgba(0,0,0,0.5)';
        indicator.style.opacity = '1';
        indicator.style.transition = 'transform 1s, opacity 1s';
        
        gameArea.appendChild(indicator);
        
        // 动画效果
        setTimeout(() => {
            indicator.style.transform = 'translateY(-30px)';
            indicator.style.opacity = '0';
        }, 50);
        
        // 清除元素
        setTimeout(() => {
            indicator.remove();
        }, 1050);
    }
    
    // 圣诞老人掉落动画
    function santaFalls() {
        let santaBottom = parseInt(santa.style.bottom);
        let santaRotation = 0;
        
        function fall() {
            santaBottom -= 5;
            santaRotation += 5;
            
            santa.style.bottom = santaBottom + 'px';
            santa.style.transform = `rotate(${santaRotation}deg)`;
            
            if (santaBottom > -100) {
                animationId = requestAnimationFrame(fall);
            } else {
                gameOver();
            }
        }
        
        fall();
    }
    
    // 设置下一轮
    function setupNextRound() {
        // 更新当前柱子位置
        const nextPillarLeft = parseInt(nextPillar.style.left);
        currentPillar.style.left = nextPillarLeft + 'px';
        currentPillar.style.height = nextPillarHeight + 'px';
        
        // 生成新的下一个柱子
        let newDistance = 150 + Math.random() * 150;
        let newHeight = getFixedHeight(); // 使用固定高度
        
        // 重新计算游戏区域宽度（确保是最新值）
        gameAreaWidth = getGameAreaWidth();
        
        // 计算下一个柱子的位置
        const futureNextPillarLeft = nextPillarLeft + newDistance;
        const pillarWidth = isSmallScreen ? 50 : 60; // 柱子宽度
        const safetyMargin = gameAreaWidth * 0.6; // 更保守的安全边界
        
        // 判断是否需要重置场景位置
        if (futureNextPillarLeft + pillarWidth > safetyMargin) {
            // 如果下一个柱子会超出安全区域，重置场景
            resetScenePosition();
        } else {
            // 正常设置下一个柱子位置
            nextPillar.style.left = futureNextPillarLeft + 'px';
            nextPillar.style.height = newHeight + 'px';
            
            // 更新圣诞老人位置
            santa.style.left = nextPillarLeft + 'px';
            santa.style.bottom = (150 + nextPillarHeight) + 'px';
            
            // 重置杆子 - 确保杆子位置正确
            pole.style.left = (nextPillarLeft + santaWidth) + 'px';
            pole.style.bottom = (150 + nextPillarHeight) + 'px';
            pole.style.width = '0';
            pole.style.transform = 'rotate(0deg)';
            
            // 更新距离
            nextPillarDistance = newDistance;
            nextPillarHeight = newHeight;
            
            // 重置状态
            poleLength = 0;
            
            // 更新调试信息
            updateDebugInfo();
        }
    }
    
    // 重置场景位置（将场景元素重新居中）
    function resetScenePosition() {
        // 增加场景重置计数
        sceneResetCount++;
        
        // 保存当前得分和游戏状态
        const currentScore = score;
        const currentGameSpeed = gameSpeed;
        
        // 获取当前柱子的高度（用于新位置设置）
        const pillarHeight = getFixedHeight();
        
        // 设置初始位置
        const initialLeft = 50;
        
        // 重置柱子位置
        currentPillar.style.left = initialLeft + 'px';
        currentPillar.style.height = pillarHeight + 'px';
        
        // 随机生成下一个柱子，但确保距离不会太远
        nextPillarDistance = 150 + Math.random() * 100;
        // 确保下一个柱子在视野内
        nextPillarDistance = Math.min(nextPillarDistance, gameAreaWidth * 0.35);
        
        nextPillarHeight = pillarHeight;
        nextPillar.style.left = (initialLeft + nextPillarDistance) + 'px';
        nextPillar.style.height = nextPillarHeight + 'px';
        
        // 更新圣诞老人位置
        santa.style.left = initialLeft + 'px';
        santa.style.bottom = (150 + pillarHeight) + 'px';
        
        // 重置杆子
        pole.style.left = (initialLeft + santaWidth) + 'px';
        pole.style.bottom = (150 + pillarHeight) + 'px';
        pole.style.width = '0';
        pole.style.transform = 'rotate(0deg)';
        
        // 恢复得分和游戏状态
        score = currentScore;
        scoreElement.textContent = score;
        gameSpeed = currentGameSpeed;
        
        // 重置长度
        poleLength = 0;
        
        // 更新调试信息
        updateDebugInfo();
    }
    
    // 游戏结束
    function gameOver() {
        isGameOver = true;
        gameOverMessage.style.display = 'block';
        
        // 显示最终分数
        gameOverMessage.textContent = `游戏结束，得分: ${score}`;
        
        // 添加重新开始的提示
        const restartTip = document.createElement('div');
        restartTip.style.fontSize = '16px';
        restartTip.style.marginTop = '10px';
        restartTip.style.fontWeight = 'normal';
        restartTip.textContent = '点击"重新开始"按钮重玩';
        gameOverMessage.appendChild(restartTip);
        
        // 突出显示重新开始按钮
        restartButton.style.animation = 'pulse 1s infinite';
    }
    
    // 事件监听器
    gameArea.addEventListener('mousedown', extendPole);
    gameArea.addEventListener('touchstart', extendPole);
    
    gameArea.addEventListener('mouseup', rotatePole);
    gameArea.addEventListener('touchend', rotatePole);
    
    restartButton.addEventListener('click', () => {
        initGame();
        restartButton.style.animation = '';
    });
    
    // 添加键盘控制
    document.addEventListener('keydown', (e) => {
        if (e.code === 'Space') {
            extendPole();
        }
        
        // D键切换调试模式
        if (e.code === 'KeyD') {
            debugMode = !debugMode;
            updateDebugInfo();
        }
    });
    
    document.addEventListener('keyup', (e) => {
        if (e.code === 'Space') {
            rotatePole();
        }
    });
    
    // 阻止空格键滚动页面
    window.addEventListener('keydown', (e) => {
        if (e.code === 'Space') {
            e.preventDefault();
        }
    });
    
    // 初始化游戏
    checkScreenSize(); // 先检查屏幕尺寸
    initGame();
}); 