document.addEventListener('DOMContentLoaded', function() {
    // 尺寸数据库
    const sizeDatabase = {
        // A系列纸张 (ISO 216)
        A: {
            A0: { width: 841, height: 1189 },
            A1: { width: 594, height: 841 },
            A2: { width: 420, height: 594 },
            A3: { width: 297, height: 420 },
            A4: { width: 210, height: 297 },
            A5: { width: 148, height: 210 },
            A6: { width: 105, height: 148 },
            A7: { width: 74, height: 105 },
            A8: { width: 52, height: 74 }
        },
        // B系列纸张 (ISO 216)
        B: {
            B0: { width: 1000, height: 1414 },
            B1: { width: 707, height: 1000 },
            B2: { width: 500, height: 707 },
            B3: { width: 353, height: 500 },
            B4: { width: 250, height: 353 },
            B5: { width: 176, height: 250 },
            B6: { width: 125, height: 176 },
            B7: { width: 88, height: 125 },
            B8: { width: 62, height: 88 }
        },
        // 屏幕尺寸（按对角线英寸和宽高比）
        screen: {
            '27寸 (16:9)': { width: 598, height: 336 },
            '24寸 (16:9)': { width: 531, height: 298 },
            '16寸 (16:9)': { width: 346, height: 194 },
            '15.6寸 (16:9)': { width: 344, height: 193 },
            '14寸 (16:9)': { width: 310, height: 174 },
            '13.3寸 (16:9)': { width: 294, height: 165 },
            '12.9寸 (4:3)': { width: 259, height: 194 },
            '11寸 (16:9)': { width: 243, height: 137 },
            '9.7寸 (4:3)': { width: 195, height: 147 }
        },
        // 设备尺寸
        device: {
            'iPhone 13 Pro Max': { width: 78, height: 161 },
            'iPhone 13/13 Pro': { width: 72, height: 147 },
            'iPhone 13 mini': { width: 64, height: 132 },
            'iPad Pro 12.9': { width: 215, height: 280 },
            'iPad Pro 11': { width: 178, height: 248 },
            'iPad Air': { width: 171, height: 248 },
            'Samsung S21': { width: 72, height: 152 },
            'Pixel 6 Pro': { width: 75, height: 164 }
        },
        // 自定义尺寸（将通过用户添加）
        custom: {}
    };
    
    // 获取DOM元素
    const primarySeriesSelect = document.getElementById('primary-size-series');
    const primarySizeSelect = document.getElementById('primary-size');
    const primaryDimensions = document.getElementById('primary-dimensions');
    const primaryVisual = document.querySelector('.primary');
    const primaryColorPicker = document.getElementById('primary-color-picker');
    const globalUnitSelect = document.getElementById('global-unit-select');
    const toggleRealSizeBtn = document.getElementById('toggle-real-size');
    const addCustomBtn = document.getElementById('add-custom');
    const customNameInput = document.getElementById('custom-name');
    const customWidthInput = document.getElementById('custom-width');
    const customHeightInput = document.getElementById('custom-height');
    const customSeriesSelect = document.getElementById('custom-series');
    const widthUnitSpan = document.getElementById('width-unit');
    const heightUnitSpan = document.getElementById('height-unit');
    const changeUnitPrimaryBtn = document.getElementById('change-unit-primary');
    const zoomSlider = document.getElementById('zoom-slider');
    const zoomValue = document.getElementById('zoom-value');
    const resetZoomBtn = document.getElementById('reset-zoom');
    const visualization = document.getElementById('visualization');
    const visualizationContainer = document.querySelector('.visualization-container');
    const comparisonSections = document.getElementById('comparison-sections');
    const addComparisonBtn = document.getElementById('add-comparison');
    const secondaryVisualsContainer = document.getElementById('secondary-visuals');
    
    // 模板元素
    const comparisonTemplate = document.getElementById('comparison-template');
    const visualTemplate = document.getElementById('visual-template');
    
    // 状态变量
    let isRealSize = false;
    let primaryUnit = 'mm';
    let currentZoom = 50; // 默认缩放值（百分比）
    let comparisonCount = 1; // 已有一个默认的对比项
    const secondaryUnits = ['mm']; // 每个对比项的单位
    const borderColors = ['#ffffff']; // 每个对比项的边框颜色
    let primaryColor = '#4a90e2'; // 主尺寸线条颜色
    
    // 旋转状态
    let primaryRotated = false; // 主尺寸是否旋转
    const secondaryRotated = [false]; // 对比项是否旋转
    
    // 拖动相关状态
    let isDragging = false;
    let startX, startY;
    let translateX = 0, translateY = 0;
    
    const MAX_COMPARISONS = 5; // 最多允许5个对比项
    
    // 初始化
    initializeSizes();
    initializeFirstComparison();
    setupEventListeners();
    setupDragEvents();
    updateVisualization();
    
    // 设置拖动事件
    function setupDragEvents() {
        visualizationContainer.addEventListener('mousedown', startDrag);
        document.addEventListener('mousemove', drag);
        document.addEventListener('mouseup', endDrag);
        
        // 触摸设备支持
        visualizationContainer.addEventListener('touchstart', startDrag);
        document.addEventListener('touchmove', drag);
        document.addEventListener('touchend', endDrag);
        
        // 添加重置拖动按钮事件
        resetZoomBtn.addEventListener('click', function() {
            resetDragPosition();
        });
    }
    
    // 开始拖动
    function startDrag(e) {
        isDragging = true;
        visualizationContainer.classList.add('dragging');
        
        // 确保使用正确的事件坐标（鼠标或触摸）
        if (e.type === 'touchstart') {
            startX = e.touches[0].clientX - translateX;
            startY = e.touches[0].clientY - translateY;
        } else {
            startX = e.clientX - translateX;
            startY = e.clientY - translateY;
        }
        
        e.preventDefault(); // 阻止默认行为
    }
    
    // 拖动过程
    function drag(e) {
        if (!isDragging) return;
        
        let currentX, currentY;
        
        // 确保使用正确的事件坐标（鼠标或触摸）
        if (e.type === 'touchmove') {
            currentX = e.touches[0].clientX;
            currentY = e.touches[0].clientY;
        } else {
            currentX = e.clientX;
            currentY = e.clientY;
        }
        
        translateX = currentX - startX;
        translateY = currentY - startY;
        
        // 应用变换
        applyTransform();
        
        e.preventDefault(); // 阻止默认行为
    }
    
    // 结束拖动
    function endDrag() {
        if (isDragging) {
            isDragging = false;
            visualizationContainer.classList.remove('dragging');
        }
    }
    
    // 应用变换
    function applyTransform() {
        // 组合缩放和平移变换
        const scale = isRealSize ? 1 : currentZoom / 100;
        visualization.style.transform = `translate(${translateX}px, ${translateY}px) scale(${scale})`;
    }
    
    // 重置拖动位置
    function resetDragPosition() {
        translateX = 0;
        translateY = 0;
        applyTransform();
    }
    
    // 设置事件监听
    function setupEventListeners() {
        // 主尺寸相关事件
        primarySeriesSelect.addEventListener('change', function() {
            populateSizeSelect(primarySeriesSelect.value, primarySizeSelect);
            updatePrimaryDimensions();
            updateVisualization();
        });
        
        primarySizeSelect.addEventListener('change', function() {
            updatePrimaryDimensions();
            updateVisualization();
        });
        
        // 主尺寸颜色变化
        primaryColorPicker.addEventListener('change', function() {
            primaryColor = primaryColorPicker.value;
            primaryVisual.style.borderColor = primaryColor;
        });
        
        // 主尺寸旋转
        const rotatePrimaryBtn = document.getElementById('rotate-primary');
        if (rotatePrimaryBtn) {
            rotatePrimaryBtn.addEventListener('click', function() {
                primaryRotated = !primaryRotated;
                updatePrimaryDimensions();
                updateVisualization();
            });
        }
        
        // 全局单位改变
        globalUnitSelect.addEventListener('change', function() {
            primaryUnit = globalUnitSelect.value;
            secondaryUnits.fill(globalUnitSelect.value);
            updatePrimaryDimensions();
            updateAllSecondaryDimensions();
            widthUnitSpan.textContent = globalUnitSelect.value;
            heightUnitSpan.textContent = globalUnitSelect.value;
        });
        
        // 真实尺寸切换
        toggleRealSizeBtn.addEventListener('click', function() {
            isRealSize = !isRealSize;
            document.body.classList.toggle('real-size-active', isRealSize);
            
            if (isRealSize) {
                toggleRealSizeBtn.textContent = '取消真实尺寸显示';
                // 在真实尺寸模式下重置缩放
                setZoom(100);
            } else {
                toggleRealSizeBtn.textContent = '切换真实尺寸显示';
                // 恢复到默认缩放
                setZoom(50);
            }
            
            updateVisualization();
        });
        
        // 主尺寸单位切换
        changeUnitPrimaryBtn.addEventListener('click', function() {
            primaryUnit = cycleUnit(primaryUnit);
            updatePrimaryDimensions();
        });
        
        // 缩放控制
        zoomSlider.addEventListener('input', function() {
            setZoom(parseInt(zoomSlider.value));
            updateVisualization();
        });
        
        resetZoomBtn.addEventListener('click', function() {
            setZoom(50);
            updateVisualization();
        });
        
        // 添加对比项
        addComparisonBtn.addEventListener('click', function() {
            if (comparisonCount < MAX_COMPARISONS) {
                addNewComparison();
            } else {
                alert(`最多只能添加${MAX_COMPARISONS}个对比项`);
            }
        });
        
        // 添加自定义尺寸
        addCustomBtn.addEventListener('click', function() {
            const name = customNameInput.value.trim();
            const width = parseFloat(customWidthInput.value);
            const height = parseFloat(customHeightInput.value);
            const series = customSeriesSelect.value;
            
            if (!name || isNaN(width) || isNaN(height) || width <= 0 || height <= 0) {
                alert('请输入有效的名称、宽度和高度！');
                return;
            }
            
            const currentUnit = globalUnitSelect.value;
            const widthInMm = convertToMm(width, currentUnit);
            const heightInMm = convertToMm(height, currentUnit);
            
            // 添加到尺寸数据库
            if (series === 'custom') {
                sizeDatabase.custom[name] = { width: widthInMm, height: heightInMm };
            } else {
                sizeDatabase[series][name] = { width: widthInMm, height: heightInMm };
            }
            
            // 更新所有下拉列表
            updateAllSizeSelects();
            
            // 清空输入
            customNameInput.value = '';
            customWidthInput.value = '';
            customHeightInput.value = '';
            
            alert(`成功添加尺寸: ${name}`);
        });
        
        // 委托事件处理函数 - 处理对比项的事件
        document.addEventListener('click', function(e) {
            // 处理移除对比项按钮
            if (e.target.classList.contains('remove-comparison')) {
                const section = e.target.closest('.comparison-item');
                if (section) {
                    const index = parseInt(section.getAttribute('data-index'));
                    removeComparison(index);
                }
            }
            
            // 处理对比项的单位切换按钮
            if (e.target.classList.contains('change-unit-secondary')) {
                const section = e.target.closest('.comparison-item');
                if (section) {
                    const index = parseInt(section.getAttribute('data-index'));
                    secondaryUnits[index] = cycleUnit(secondaryUnits[index]);
                    updateSecondaryDimensions(index);
                }
            }
            
            // 处理对比项的旋转按钮
            if (e.target.classList.contains('rotate-secondary')) {
                const section = e.target.closest('.comparison-item');
                if (section) {
                    const index = parseInt(section.getAttribute('data-index'));
                    secondaryRotated[index] = !secondaryRotated[index];
                    updateSecondaryDimensions(index);
                    updateSecondaryVisualization(index);
                }
            }
        });
        
        // 委托事件 - 处理对比项的下拉框和颜色选择器变化
        document.addEventListener('change', function(e) {
            // 对比项的系列选择变化
            if (e.target.classList.contains('secondary-size-series')) {
                const section = e.target.closest('.comparison-item');
                if (section) {
                    const index = parseInt(section.getAttribute('data-index'));
                    const sizeSelect = section.querySelector('.secondary-size');
                    populateSizeSelect(e.target.value, sizeSelect);
                    updateSecondaryDimensions(index);
                    updateVisualization();
                }
            }
            
            // 对比项的尺寸选择变化
            if (e.target.classList.contains('secondary-size')) {
                const section = e.target.closest('.comparison-item');
                if (section) {
                    const index = parseInt(section.getAttribute('data-index'));
                    updateSecondaryDimensions(index);
                    updateVisualization();
                }
            }
            
            // 对比项的边框颜色选择变化
            if (e.target.classList.contains('color-picker')) {
                const section = e.target.closest('.comparison-item');
                if (section) {
                    const index = parseInt(section.getAttribute('data-index'));
                    borderColors[index] = e.target.value;
                    updateSecondaryVisualization(index);
                }
            }
        });
    }
    
    // 初始化第一个对比项
    function initializeFirstComparison() {
        // 初始化第一个对比项的可视化元素
        const visualElement = createVisualElement(0);
        secondaryVisualsContainer.appendChild(visualElement);
        
        // 初始化第一个对比项的单位和颜色
        secondaryUnits[0] = 'mm';
        borderColors[0] = document.querySelector('.comparison-item[data-index="0"] .color-picker').value;
        
        // 初始化主尺寸颜色
        primaryColor = primaryColorPicker.value;
        primaryVisual.style.borderColor = primaryColor;
        
        // 填充尺寸选择
        const firstSeriesSelect = document.querySelector('.secondary-size-series');
        const firstSizeSelect = document.querySelector('.secondary-size');
        populateSizeSelect('A', firstSizeSelect);
        
        // 更新显示
        updateSecondaryDimensions(0);
    }
    
    // 添加新的对比项
    function addNewComparison() {
        // 创建新的对比项界面元素
        const index = comparisonCount;
        const newComparisonElement = createComparisonElement(index);
        comparisonSections.appendChild(newComparisonElement);
        
        // 创建新的可视化元素
        const newVisualElement = createVisualElement(index);
        secondaryVisualsContainer.appendChild(newVisualElement);
        
        // 增加计数并初始化单位和颜色
        comparisonCount++;
        secondaryUnits[index] = 'mm';
        
        // 设置默认颜色
        const colorPicker = newComparisonElement.querySelector('.color-picker');
        
        // 根据索引选择不同的默认颜色
        const defaultColors = ['#ffffff', '#f9ca24', '#6ab04c', '#eb4d4b', '#be2edd'];
        colorPicker.value = defaultColors[index % defaultColors.length];
        borderColors[index] = colorPicker.value;
        
        // 填充尺寸选择
        const seriesSelect = newComparisonElement.querySelector('.secondary-size-series');
        const sizeSelect = newComparisonElement.querySelector('.secondary-size');
        populateSizeSelect(seriesSelect.value, sizeSelect);
        
        // 更新显示
        updateSecondaryDimensions(index);
        updateVisualization();
    }
    
    // 移除对比项
    function removeComparison(index) {
        // 移除DOM元素
        const sectionToRemove = document.querySelector(`.comparison-item[data-index="${index}"]`);
        const visualToRemove = document.querySelector(`.secondary-visual[data-index="${index}"]`);
        
        if (sectionToRemove && visualToRemove) {
            sectionToRemove.remove();
            visualToRemove.remove();
            
            // 减少计数
            comparisonCount--;
            
            // 重新排列索引
            reindexComparisonItems();
            
            // 更新可视化
            updateVisualization();
        }
    }
    
    // 重新为对比项编号
    function reindexComparisonItems() {
        // 重新为对比项界面元素编号
        const sections = document.querySelectorAll('.comparison-item');
        sections.forEach((section, i) => {
            section.setAttribute('data-index', i);
        });
        
        // 重新为可视化元素编号
        const visuals = document.querySelectorAll('.secondary-visual');
        visuals.forEach((visual, i) => {
            visual.setAttribute('data-index', i);
        });
        
        // 重组单位数组和颜色数组
        const newUnits = [];
        const newBorderColors = [];
        
        sections.forEach((section, i) => {
            const oldIndex = parseInt(section.getAttribute('data-index'));
            newUnits[i] = secondaryUnits[oldIndex] || 'mm';
            newBorderColors[i] = borderColors[oldIndex] || '#ffffff';
        });
        
        // 更新单位和颜色数组
        for (let i = 0; i < MAX_COMPARISONS; i++) {
            secondaryUnits[i] = i < newUnits.length ? newUnits[i] : 'mm';
            borderColors[i] = i < newBorderColors.length ? newBorderColors[i] : '#ffffff';
        }
    }
    
    // 创建新的对比项界面元素
    function createComparisonElement(index) {
        // 克隆模板
        const template = comparisonTemplate.content.cloneNode(true);
        const element = template.querySelector('.comparison-item');
        
        // 设置索引
        element.setAttribute('data-index', index);
        
        return element;
    }
    
    // 创建新的可视化元素
    function createVisualElement(index) {
        // 克隆模板
        const template = visualTemplate.content.cloneNode(true);
        const element = template.querySelector('.secondary-visual');
        
        // 设置索引
        element.setAttribute('data-index', index);
        
        return element;
    }
    
    // 设置缩放值
    function setZoom(value) {
        currentZoom = value;
        zoomSlider.value = value;
        zoomValue.textContent = `${value}%`;
        
        // 应用缩放比例
        applyTransform();
    }
    
    // 初始化尺寸下拉选项
    function initializeSizes() {
        // 填充主尺寸选择器
        populateSizeSelect('A', primarySizeSelect);
        
        // 设置默认选择
        primarySizeSelect.value = 'A4';
        
        // 更新尺寸显示
        updatePrimaryDimensions();
        
        // 初始化缩放
        setZoom(currentZoom);
    }
    
    // 更新所有尺寸选择器
    function updateAllSizeSelects() {
        // 更新主尺寸选择器
        populateSizeSelect(primarySeriesSelect.value, primarySizeSelect);
        
        // 更新所有对比项的尺寸选择器
        document.querySelectorAll('.comparison-item').forEach(section => {
            const seriesSelect = section.querySelector('.secondary-size-series');
            const sizeSelect = section.querySelector('.secondary-size');
            populateSizeSelect(seriesSelect.value, sizeSelect);
        });
    }
    
    // 根据系列填充尺寸选择器
    function populateSizeSelect(series, selectElement) {
        // 保存当前选择
        const currentValue = selectElement.value;
        
        // 清空当前选项
        selectElement.innerHTML = '';
        
        // 添加新选项
        for (const size in sizeDatabase[series]) {
            const option = document.createElement('option');
            option.value = size;
            option.textContent = size;
            selectElement.appendChild(option);
        }
        
        // 如果没有选项，添加提示
        if (selectElement.options.length === 0) {
            const option = document.createElement('option');
            option.value = '';
            option.textContent = '无可用尺寸';
            selectElement.appendChild(option);
        }
        
        // 尝试恢复之前的选择
        if (currentValue && selectElement.querySelector(`option[value="${currentValue}"]`)) {
            selectElement.value = currentValue;
        }
    }
    
    // 更新主尺寸显示
    function updatePrimaryDimensions() {
        const series = primarySeriesSelect.value;
        const size = primarySizeSelect.value;
        
        if (sizeDatabase[series] && sizeDatabase[series][size]) {
            const dimensions = sizeDatabase[series][size];
            // 如果旋转了，则交换宽度和高度
            if (primaryRotated) {
                primaryDimensions.textContent = formatDimensions(dimensions.height, dimensions.width, primaryUnit);
            } else {
                primaryDimensions.textContent = formatDimensions(dimensions.width, dimensions.height, primaryUnit);
            }
        }
    }
    
    // 更新所有次要尺寸显示
    function updateAllSecondaryDimensions() {
        document.querySelectorAll('.comparison-item').forEach(section => {
            const index = parseInt(section.getAttribute('data-index'));
            updateSecondaryDimensions(index);
        });
    }
    
    // 更新次要尺寸显示
    function updateSecondaryDimensions(index) {
        const section = document.querySelector(`.comparison-item[data-index="${index}"]`);
        if (!section) return;
        
        const seriesSelect = section.querySelector('.secondary-size-series');
        const sizeSelect = section.querySelector('.secondary-size');
        const dimensionsSpan = section.querySelector('.secondary-dimensions');
        
        const series = seriesSelect.value;
        const size = sizeSelect.value;
        
        if (sizeDatabase[series] && sizeDatabase[series][size]) {
            const dimensions = sizeDatabase[series][size];
            // 如果旋转了，则交换宽度和高度
            if (secondaryRotated[index]) {
                dimensionsSpan.textContent = formatDimensions(dimensions.height, dimensions.width, secondaryUnits[index]);
            } else {
                dimensionsSpan.textContent = formatDimensions(dimensions.width, dimensions.height, secondaryUnits[index]);
            }
        }
    }
    
    // 更新可视化
    function updateVisualization() {
        updatePrimaryVisualization();
        updateAllSecondaryVisualizations();
    }
    
    // 更新主尺寸可视化
    function updatePrimaryVisualization() {
        const series = primarySeriesSelect.value;
        const size = primarySizeSelect.value;
        
        if (sizeDatabase[series] && sizeDatabase[series][size]) {
            const dimensions = sizeDatabase[series][size];
            let displayWidth, displayHeight;
            
            // 如果旋转了，则交换宽度和高度
            if (primaryRotated) {
                displayWidth = dimensions.height;
                displayHeight = dimensions.width;
            } else {
                displayWidth = dimensions.width;
                displayHeight = dimensions.height;
            }
            
            // 检查是否选择了很大的尺寸（如B0），如果是则自动降低缩放比例
            if (!isRealSize) {
                const maxDimension = Math.max(displayWidth, displayHeight);
                if (maxDimension > 500) {
                    // 根据尺寸大小自动调整缩放
                    const recommendedZoom = Math.min(Math.floor(400 / maxDimension * 100), currentZoom);
                    
                    // 如果新计算的缩放比例小于当前值，则使用它
                    if (recommendedZoom < currentZoom) {
                        setZoom(recommendedZoom);
                    }
                }
            }
            
            // 应用主尺寸颜色
            primaryVisual.style.borderColor = primaryColor;
            
            if (isRealSize) {
                // 使用实际尺寸 (1mm = 96/25.4 px)
                const pxPerMm = 96 / 25.4;
                
                primaryVisual.style.width = `${displayWidth * pxPerMm}px`;
                primaryVisual.style.height = `${displayHeight * pxPerMm}px`;
                
                // 调整容器高度以适应内容
                visualization.style.minHeight = `${displayHeight * pxPerMm + 40}px`;
            } else {
                // 使用缩放尺寸以适应视图
                const container = document.querySelector('.visualization-container');
                const containerWidth = container.clientWidth - 40; // 减去内边距
                
                // 基础比例（不考虑用户设置的缩放）
                const baseScale = Math.min(containerWidth / displayWidth, 1) * 0.8;
                
                // 应用用户缩放比例 - 注意，不要在这里应用到transform，让applyTransform函数处理
                const userScale = baseScale * (currentZoom / 50); // 50%为基准值
                
                primaryVisual.style.width = `${displayWidth * userScale}px`;
                primaryVisual.style.height = `${displayHeight * userScale}px`;
                
                // 调整容器高度以适应内容
                visualization.style.minHeight = `${displayHeight * userScale + 40}px`;
            }
        }
    }
    
    // 更新所有次要尺寸可视化
    function updateAllSecondaryVisualizations() {
        document.querySelectorAll('.secondary-visual').forEach(visual => {
            const index = parseInt(visual.getAttribute('data-index'));
            updateSecondaryVisualization(index);
        });
    }
    
    // 更新次要尺寸可视化
    function updateSecondaryVisualization(index) {
        const visual = document.querySelector(`.secondary-visual[data-index="${index}"]`);
        const section = document.querySelector(`.comparison-item[data-index="${index}"]`);
        
        if (!visual || !section) return;
        
        const rectangle = visual.querySelector('.visual-rectangle');
        const seriesSelect = section.querySelector('.secondary-size-series');
        const sizeSelect = section.querySelector('.secondary-size');
        
        const series = seriesSelect.value;
        const size = sizeSelect.value;
        
        if (sizeDatabase[series] && sizeDatabase[series][size]) {
            const secondaryDimensions = sizeDatabase[series][size];
            const primarySeries = primarySeriesSelect.value;
            const primarySize = primarySizeSelect.value;
            const primaryDimensions = sizeDatabase[primarySeries][primarySizeSelect.value];
            
            if (!primaryDimensions) return;
            
            // 准备显示尺寸，考虑旋转状态
            let displaySecondaryWidth, displaySecondaryHeight;
            let displayPrimaryWidth, displayPrimaryHeight;
            
            // 处理主尺寸的旋转状态
            if (primaryRotated) {
                displayPrimaryWidth = primaryDimensions.height;
                displayPrimaryHeight = primaryDimensions.width;
            } else {
                displayPrimaryWidth = primaryDimensions.width;
                displayPrimaryHeight = primaryDimensions.height;
            }
            
            // 处理次要尺寸的旋转状态
            if (secondaryRotated[index]) {
                displaySecondaryWidth = secondaryDimensions.height;
                displaySecondaryHeight = secondaryDimensions.width;
            } else {
                displaySecondaryWidth = secondaryDimensions.width;
                displaySecondaryHeight = secondaryDimensions.height;
            }
            
            // 应用自定义边框颜色
            rectangle.style.borderColor = borderColors[index];
            
            if (isRealSize) {
                // 使用实际尺寸 (1mm = 96/25.4 px)
                const pxPerMm = 96 / 25.4;
                
                rectangle.style.width = `${displaySecondaryWidth * pxPerMm}px`;
                rectangle.style.height = `${displaySecondaryHeight * pxPerMm}px`;
                
                // 所有对比项完全对齐在右下角（移除偏移）
                visual.style.left = `${(displayPrimaryWidth - displaySecondaryWidth) * pxPerMm}px`;
                visual.style.top = `${(displayPrimaryHeight - displaySecondaryHeight) * pxPerMm}px`;
            } else {
                // 计算缩放后的尺寸
                const container = document.querySelector('.visualization-container');
                const containerWidth = container.clientWidth - 40;
                const baseScale = Math.min(containerWidth / displayPrimaryWidth, 1) * 0.8;
                const userScale = baseScale * (currentZoom / 50);
                
                rectangle.style.width = `${displaySecondaryWidth * userScale}px`;
                rectangle.style.height = `${displaySecondaryHeight * userScale}px`;
                
                // 所有对比项完全对齐在右下角（移除偏移）
                visual.style.left = `${(displayPrimaryWidth - displaySecondaryWidth) * userScale}px`;
                visual.style.top = `${(displayPrimaryHeight - displaySecondaryHeight) * userScale}px`;
            }
        }
    }
    
    // 格式化尺寸显示
    function formatDimensions(widthMm, heightMm, unit) {
        let width, height, unitSymbol;
        
        switch(unit) {
            case 'cm':
                width = (widthMm / 10).toFixed(1);
                height = (heightMm / 10).toFixed(1);
                unitSymbol = 'cm';
                break;
            case 'inch':
                width = (widthMm / 25.4).toFixed(1);
                height = (heightMm / 25.4).toFixed(1);
                unitSymbol = '英寸';
                break;
            default: // mm
                width = widthMm.toFixed(1);
                height = heightMm.toFixed(1);
                unitSymbol = 'mm';
        }
        
        return `${width} × ${height} ${unitSymbol}`;
    }
    
    // 循环切换单位
    function cycleUnit(unit) {
        const units = ['mm', 'cm', 'inch'];
        const currentIndex = units.indexOf(unit);
        return units[(currentIndex + 1) % units.length];
    }
    
    // 转换为毫米
    function convertToMm(value, unit) {
        switch(unit) {
            case 'cm':
                return value * 10;
            case 'inch':
                return value * 25.4;
            default: // mm
                return value;
        }
    }
    
    // 窗口大小改变时更新可视化
    window.addEventListener('resize', function() {
        if (!isRealSize) {
            updateVisualization();
        }
    });
}); 