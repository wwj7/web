/* ============================================
 * 陇上百合香 · 兰州百合产业数据可视化平台
 * 脚本文件
 * ============================================ */

// 全局图表实例缓存
const charts = {};

// 颜色主题（翡翠绿 + 敦煌琥珀金，新中式国潮风）
const COLORS = {
    green: '#1d9e63',
    greenLight: '#5fd6a0',
    gold: '#c8862e',
    goldLight: '#e8b85a',
    loess: '#b8773e',
    blue: '#4fc3f7',
    text: '#e6f0ff',
    dim: '#8aa0c4'
};

/* ---------- 1. 导航切换 ---------- */
function initNav() {
    const navItems = document.querySelectorAll('.nav-item');
    const pages = document.querySelectorAll('.page');
    const navToggle = document.getElementById('navToggle');
    const navMenu = document.querySelector('.nav-menu');

    // 汉堡菜单切换
    if (navToggle && navMenu) {
        navToggle.addEventListener('click', () => {
            navToggle.classList.toggle('active');
            navMenu.classList.toggle('open');
        });
    }

    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const target = item.getAttribute('data-page');

            // 切换导航高亮
            navItems.forEach(n => n.classList.remove('active'));
            item.classList.add('active');

            // 切换页面
            pages.forEach(p => p.classList.remove('active'));
            const targetPage = document.getElementById('page-' + target);
            if (targetPage) targetPage.classList.add('active');

            // 移动端点击后收起汉堡菜单
            if (navToggle && navMenu) {
                navToggle.classList.remove('active');
                navMenu.classList.remove('open');
            }

            // 切换后触发对应页面图表 resize
            setTimeout(() => resizeChartsByPage(target), 100);

            // 切回首页时重新触发数字滚动动画
            if (target === 'home') {
                animateNumbers();
            }
        });
    });
}

// 按页面 resize 图表
function resizeChartsByPage(page) {
    const map = {
        home: ['chart-nutrient', 'chart-altitude', 'chart-trend'],
        pain: ['chart-awareness', 'chart-motivation'],
        solution: ['chart-benefit-1', 'chart-benefit-2'],
        trace: [],
        product: []
    };
    const ids = map[page] || [];
    ids.forEach(id => {
        if (charts[id]) charts[id].resize();
    });
}

/* ---------- 2. 数字滚动动画 ---------- */
// 数字滚动动画（requestAnimationFrame + 缓动，1.5秒）
let statAnimFrameIds = [];

function animateNumbers() {
    // 取消之前的动画，避免叠加
    statAnimFrameIds.forEach(id => cancelAnimationFrame(id));
    statAnimFrameIds = [];

    const values = document.querySelectorAll('.stat-value');
    const duration = 1500;

    values.forEach(el => {
        const targetStr = el.getAttribute('data-target');
        const target = parseFloat(targetStr);
        const decimals = targetStr.includes('.') ? targetStr.split('.')[1].length : 0;

        el.textContent = decimals > 0 ? (0).toFixed(decimals) : '0';

        const startTime = performance.now();

        function tick(now) {
            const elapsed = now - startTime;
            const progress = Math.min(elapsed / duration, 1);
            // easeOutExpo 缓动
            const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
            const current = target * eased;
            el.textContent = decimals > 0 ? current.toFixed(decimals) : Math.floor(current).toString();

            if (progress < 1) {
                const id = requestAnimationFrame(tick);
                statAnimFrameIds.push(id);
            }
        }

        const id = requestAnimationFrame(tick);
        statAnimFrameIds.push(id);
    });
}

/* ---------- 3. 公共图表样式 ---------- */
const baseGrid = { left: '3%', right: '4%', bottom: '8%', top: '12%', containLabel: true };
const baseTooltip = { trigger: 'axis', backgroundColor: 'rgba(7,13,27,0.9)', borderColor: COLORS.green, textStyle: { color: COLORS.text } };
const axisStyle = {
    axisLine: { lineStyle: { color: 'rgba(138,160,196,0.3)' } },
    axisLabel: { color: COLORS.dim, fontSize: 12 },
    splitLine: { lineStyle: { color: 'rgba(138,160,196,0.1)' } }
};

/* ---------- 4. 页面1 图表 ---------- */
// 海拔与营养成分关联散点图
function initAltitudeChart() {
    const chart = echarts.init(document.getElementById('chart-altitude'));
    charts['chart-altitude'] = chart;

    // 模拟数据：[海拔, 蛋白质%, 多糖%, 水分%]
    const data = [
        [1500, 3.2, 6.5, 68],
        [1600, 3.5, 7.1, 66],
        [1700, 3.8, 7.8, 64],
        [1800, 4.1, 8.5, 62],
        [1900, 4.4, 9.2, 60],
        [2000, 4.7, 9.8, 58],
        [2100, 5.0, 10.3, 57],
        [2200, 5.2, 10.7, 56],
        [2300, 5.4, 11.0, 55],
        [2400, 5.5, 11.2, 55]
    ];

    chart.setOption({
        tooltip: {
            trigger: 'item',
            backgroundColor: 'rgba(7,13,27,0.9)',
            borderColor: COLORS.green,
            textStyle: { color: COLORS.text },
            formatter: p => `海拔：${p.value[0]}m<br/>蛋白质：${p.value[1]}%<br/>多糖：${p.value[2]}%<br/>水分：${p.value[3]}%`
        },
        grid: baseGrid,
        xAxis: {
            name: '海拔 (m)',
            nameTextStyle: { color: COLORS.dim },
            min: 1400, max: 2500,
            ...axisStyle
        },
        yAxis: {
            name: '营养成分含量 (%)',
            nameTextStyle: { color: COLORS.dim },
            ...axisStyle
        },
        legend: {
            data: ['蛋白质', '多糖', '水分'],
            textStyle: { color: COLORS.dim },
            top: 0
        },
        series: [
            {
                name: '蛋白质', type: 'scatter',
                data: data.map(d => [d[0], d[1]]),
                symbolSize: 14,
                itemStyle: { color: COLORS.green, shadowBlur: 10, shadowColor: COLORS.green }
            },
            {
                name: '多糖', type: 'scatter',
                data: data.map(d => [d[0], d[2]]),
                symbolSize: 14,
                itemStyle: { color: COLORS.gold, shadowBlur: 10, shadowColor: COLORS.gold }
            },
            {
                name: '水分', type: 'scatter',
                data: data.map(d => [d[0], d[3]]),
                symbolSize: 14,
                itemStyle: { color: COLORS.blue, shadowBlur: 10, shadowColor: COLORS.blue }
            },
            // 趋势线
            {
                name: '蛋白质趋势', type: 'line',
                data: data.map(d => [d[0], d[1]]),
                showSymbol: false,
                lineStyle: { color: COLORS.green, width: 2, type: 'dashed' },
                smooth: true,
                tooltip: { show: false }
            }
        ]
    });
}

// 近五年产值趋势折线图
function initTrendChart() {
    const chart = echarts.init(document.getElementById('chart-trend'));
    charts['chart-trend'] = chart;

    chart.setOption({
        tooltip: baseTooltip,
        grid: baseGrid,
        xAxis: {
            type: 'category',
            data: ['2021', '2022', '2023', '2024', '2025', '2026'],
            ...axisStyle
        },
        yAxis: {
            type: 'value',
            name: '产值 (亿元)',
            nameTextStyle: { color: COLORS.dim },
            ...axisStyle
        },
        series: [{
            name: '年产值',
            type: 'line',
            data: [8.2, 9.1, 10.3, 11.0, 11.9, 12.8],
            smooth: true,
            symbol: 'circle',
            symbolSize: 10,
            lineStyle: { color: COLORS.green, width: 3, shadowBlur: 10, shadowColor: COLORS.green },
            itemStyle: { color: COLORS.gold, borderColor: COLORS.green, borderWidth: 2 },
            areaStyle: {
                color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                    { offset: 0, color: 'rgba(31,181,114,0.4)' },
                    { offset: 1, color: 'rgba(31,181,114,0)' }
                ])
            }
        }]
    });
}

// 海拔梯度与营养成分关联双轴图
function initNutrientChart() {
    const chart = echarts.init(document.getElementById('chart-nutrient'));
    charts['chart-nutrient'] = chart;

    chart.setOption({
        // 标准悬停触发，提示框渲染到 body 避免被图表容器裁剪
        tooltip: {
            trigger: 'axis',
            appendToBody: true,
            backgroundColor: 'rgba(7,13,27,0.92)',
            borderColor: COLORS.green,
            textStyle: { color: COLORS.text },
            axisPointer: { type: 'shadow' },
            formatter: params => {
                let html = `<div style="font-weight:bold;margin-bottom:4px;">海拔：${params[0].name}</div>`;
                params.forEach(p => {
                    const unit = p.seriesName === '硒含量' ? ' μg/kg' : ' mg/g';
                    html += `${p.marker}${p.seriesName}：<b>${p.value}</b>${unit}<br/>`;
                });
                return html;
            }
        },
        legend: {
            data: ['β-葡聚糖含量', '硒含量'],
            textStyle: { color: COLORS.dim },
            top: 0
        },
        // 加大四周边距：顶部容纳图例+轴名称，底部 80px 避免与刻度/外部注释重叠
        grid: { top: 80, bottom: 80, left: '12%', right: '12%' },
        xAxis: {
            type: 'category',
            data: ['1800m', '1900m', '2000m', '2100m'],
            name: '海拔',
            nameLocation: 'middle', // 名称置于轴下方居中，避免与右轴刻度重叠
            nameGap: 32,
            nameTextStyle: { color: COLORS.dim },
            axisLine: axisStyle.axisLine,
            axisLabel: { color: COLORS.dim, fontSize: 12 }
        },
        yAxis: [
            {
                type: 'value',
                name: 'β-葡聚糖 (mg/g)',
                nameGap: 28,
                nameTextStyle: { color: COLORS.green, fontSize: 12, align: 'left' },
                min: 8, max: 16,
                axisLine: { lineStyle: { color: COLORS.green } },
                axisLabel: { color: COLORS.green, fontSize: 12 },
                splitLine: { lineStyle: { color: 'rgba(138,160,196,0.1)' } }
            },
            {
                type: 'value',
                name: '硒 (μg/kg)',
                nameGap: 28,
                nameTextStyle: { color: COLORS.gold, fontSize: 12, align: 'right' },
                min: 10, max: 24,
                axisLine: { lineStyle: { color: COLORS.gold } },
                axisLabel: { color: COLORS.gold, fontSize: 12 },
                splitLine: { show: false }
            }
        ],
        series: [
            {
                name: 'β-葡聚糖含量',
                type: 'bar',
                yAxisIndex: 0,
                data: [9.8, 11.2, 13.5, 14.2],
                barWidth: '40%',
                itemStyle: {
                    borderRadius: [6, 6, 0, 0],
                    color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                        { offset: 0, color: COLORS.green },
                        { offset: 1, color: 'rgba(31,181,114,0.2)' }
                    ])
                },
                label: {
                    show: true,
                    position: 'top',
                    color: COLORS.greenLight,
                    fontWeight: 'bold',
                    formatter: '{c}'
                }
            },
            {
                name: '硒含量',
                type: 'line',
                yAxisIndex: 1,
                z: 10, // 折线置于柱子上层，圆点不被遮挡
                data: [12.3, 15.6, 18.9, 21.4],
                smooth: true,
                symbol: 'circle',
                symbolSize: 8,
                lineStyle: { color: COLORS.gold, width: 3, shadowBlur: 10, shadowColor: COLORS.gold },
                itemStyle: { color: COLORS.gold, borderColor: '#fff', borderWidth: 2 },
                label: {
                    show: true,
                    position: 'top',
                    color: COLORS.gold,
                    fontWeight: 'bold',
                    formatter: '{c}'
                }
            }
        ]
    });
}

/* ---------- 5. 页面2 图表 ---------- */
// 消费者了解程度饼图
function initAwarenessPie() {
    const chart = echarts.init(document.getElementById('chart-awareness'));
    charts['chart-awareness'] = chart;

    chart.setOption({
        tooltip: {
            trigger: 'item',
            backgroundColor: 'rgba(7,13,27,0.9)',
            borderColor: COLORS.green,
            textStyle: { color: COLORS.text },
            formatter: '{b}: {c}%'
        },
        legend: {
            orient: 'vertical',
            right: 10,
            top: 'center',
            textStyle: { color: COLORS.dim, fontSize: 12 }
        },
        series: [{
            name: '了解程度',
            type: 'pie',
            radius: ['42%', '70%'],
            center: ['38%', '50%'],
            avoidLabelOverlap: true,
            itemStyle: {
                borderRadius: 6,
                borderColor: '#0c1629',
                borderWidth: 2
            },
            label: { color: COLORS.text, fontSize: 12, formatter: '{b}\n{d}%' },
            labelLine: { lineStyle: { color: COLORS.dim } },
            data: [
                { value: 48.7, name: '比较了解', itemStyle: { color: COLORS.green } },
                { value: 44.48, name: '听说过但不了解', itemStyle: { color: COLORS.gold } },
                { value: 6.82, name: '没听说过', itemStyle: { color: '#5a6e8f' } }
            ]
        }]
    });
}

// 消费者购买动机TOP3 横向柱状图
function initMotivationBar() {
    const chart = echarts.init(document.getElementById('chart-motivation'));
    charts['chart-motivation'] = chart;

    chart.setOption({
        tooltip: {
            trigger: 'axis',
            axisPointer: { type: 'shadow' },
            backgroundColor: 'rgba(7,13,27,0.9)',
            borderColor: COLORS.green,
            textStyle: { color: COLORS.text },
            formatter: p => `${p[0].name}: ${p[0].value}%`
        },
        grid: { left: '3%', right: '12%', bottom: '8%', top: '8%', containLabel: true },
        xAxis: {
            type: 'value',
            max: 100,
            axisLabel: { color: COLORS.dim, fontSize: 12, formatter: '{value}%' },
            axisLine: { lineStyle: { color: 'rgba(138,160,196,0.3)' } },
            splitLine: { lineStyle: { color: 'rgba(138,160,196,0.1)' } }
        },
        yAxis: {
            type: 'category',
            data: ['家庭日常食用', '馈赠亲友', '养生滋补'],
            axisLabel: { color: COLORS.text, fontSize: 13 },
            axisLine: { lineStyle: { color: 'rgba(138,160,196,0.3)' } },
            axisTick: { show: false }
        },
        series: [{
            name: '占比',
            type: 'bar',
            data: [50.14, 60.68, 76.35],
            barWidth: '45%',
            itemStyle: {
                borderRadius: [0, 6, 6, 0],
                color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [
                    { offset: 0, color: 'rgba(31,181,114,0.2)' },
                    { offset: 1, color: COLORS.green }
                ])
            },
            label: {
                show: true,
                position: 'right',
                color: COLORS.gold,
                fontWeight: 'bold',
                fontSize: 13,
                formatter: '{c}%'
            }
        }]
    });
}

/* ---------- 6. 页面3 效益对比图（拆分为上下两个图表） ---------- */
function initBenefitChart() {
    const legend = {
        data: ['数字化前', '数字化后'],
        textStyle: { color: COLORS.dim },
        top: 0
    };
    const makeXAxis = categories => ({
        type: 'category',
        data: categories,
        axisLabel: { color: COLORS.dim, fontSize: 12 },
        axisLine: axisStyle.axisLine
    });
    const makeSeries = (name, data) => ({
        name,
        type: 'bar',
        data,
        barWidth: '30%',
        itemStyle: name === '数字化前'
            ? { borderRadius: [6, 6, 0, 0], color: 'rgba(138,160,196,0.6)' }
            : {
                borderRadius: [6, 6, 0, 0],
                color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                    { offset: 0, color: COLORS.gold },
                    { offset: 1, color: 'rgba(216,164,68,0.3)' }
                ])
            }
    });

    // 图表1：产量与收入对比（大数值指标，独立 Y 轴）
    const chart1 = echarts.init(document.getElementById('chart-benefit-1'));
    charts['chart-benefit-1'] = chart1;
    chart1.setOption({
        tooltip: baseTooltip,
        legend,
        grid: baseGrid,
        xAxis: makeXAxis(['亩产量(kg)', '农户收入(元)']),
        yAxis: { type: 'value', ...axisStyle },
        series: [
            makeSeries('数字化前', [1200, 18000]),
            makeSeries('数字化后', [1800, 32000])
        ]
    });

    // 图表2：产业效能提升对比（百分比指标，独立 Y 轴 max=50，避免被大数值压扁）
    const chart2 = echarts.init(document.getElementById('chart-benefit-2'));
    charts['chart-benefit-2'] = chart2;
    chart2.setOption({
        tooltip: baseTooltip,
        legend,
        grid: baseGrid,
        xAxis: makeXAxis(['损耗率(%)', '复购率(%)', '品牌溢价(%)']),
        yAxis: { type: 'value', max: 50, ...axisStyle },
        series: [
            makeSeries('数字化前', [15, 30, 0]),
            makeSeries('数字化后', [5, 45, 30])
        ]
    });
}

/* ---------- 7. 页面4 溯源模拟 ---------- */
// 生成 150x150 假二维码：25x25 网格，绿色方块 + 三角定位符（纯视觉模拟，不可真实扫描）
function buildFakeQR() {
    const group = document.getElementById('qrCells');
    if (!group) return;

    const NS = 'http://www.w3.org/2000/svg';
    const N = 25;
    const cell = 6;

    const inFinder = (x, y) =>
        (x < 8 && y < 8) || (x >= N - 8 && y < 8) || (x < 8 && y >= N - 8);
    const inLogo = (x, y) => x >= 9 && x <= 15 && y >= 9 && y <= 15;

    // 固定种子的伪随机，保证每次打开图案一致
    let seed = 20260917;
    const rand = () => {
        seed = (seed * 9301 + 49297) % 233280;
        return seed / 233280;
    };

    const addRect = (x, y, w, h, fill) => {
        const r = document.createElementNS(NS, 'rect');
        r.setAttribute('x', x * cell);
        r.setAttribute('y', y * cell);
        r.setAttribute('width', w * cell);
        r.setAttribute('height', h * cell);
        if (fill) r.setAttribute('fill', fill);
        group.appendChild(r);
    };

    // 数据区随机方块 + 第6行/列定时条纹
    for (let y = 0; y < N; y++) {
        for (let x = 0; x < N; x++) {
            if (inFinder(x, y) || inLogo(x, y)) continue;
            if (x === 6 || y === 6) {
                if ((x + y) % 2 === 0) addRect(x, y, 1, 1);
            } else if (rand() > 0.58) {
                addRect(x, y, 1, 1);
            }
        }
    }

    // 三个 7x7 定位角：外框 + 白圈 + 3x3 中心
    [[0, 0], [N - 7, 0], [0, N - 7]].forEach(([ox, oy]) => {
        addRect(ox, oy, 7, 7);
        addRect(ox + 1, oy + 1, 5, 5, '#ffffff');
        addRect(ox + 2, oy + 2, 3, 3);
    });
}

function initTrace() {
    buildFakeQR();

    const btn = document.getElementById('traceBtn');
    const input = document.getElementById('batchInput');
    const result = document.getElementById('traceResult');
    const batchNo = document.getElementById('traceBatchNo');
    const scanner = document.getElementById('qrScanner');

    function doTrace() {
        const batch = input.value.trim();
        if (!batch) {
            alert('请输入批次号');
            return;
        }
        // 前端模拟：任意批次号均显示溯源信息卡片
        batchNo.textContent = batch;
        result.classList.remove('hidden');
        // 强制重排后再添加 show 类，确保淡入动画生效
        void result.offsetWidth;
        result.classList.add('show');
    }

    btn.addEventListener('click', doTrace);
    input.addEventListener('keydown', e => {
        if (e.key === 'Enter') doTrace();
    });

    // 点击假二维码：自动填入示例批次号并触发查询
    if (scanner) {
        const scanQR = () => {
            scanner.classList.add('scanned');
            input.value = 'LZBH-2026-001';
            setTimeout(() => {
                doTrace();
                setTimeout(() => scanner.classList.remove('scanned'), 500);
            }, 220);
        };
        scanner.addEventListener('click', scanQR);
        scanner.addEventListener('keydown', e => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                scanQR();
            }
        });
    }
}

/* ---------- 7.5 页面5 助农倒计时 ---------- */
function initCountdown() {
    const box = document.getElementById('countdownBox');
    if (!box) return;

    const hEl = document.getElementById('cdH');
    const mEl = document.getElementById('cdM');
    const sEl = document.getElementById('cdS');
    const foot = box.querySelector('.countdown-foot');

    const STORAGE_KEY = 'lbGroupBuyEnd';
    const DURATION = (2 * 3600 + 15 * 60 + 30) * 1000; // 本场 02:15:30

    // 截止时间持久化：首次访问或上一场已结束时，开一场新的
    let endAt = parseInt(localStorage.getItem(STORAGE_KEY), 10);
    if (!endAt || isNaN(endAt) || endAt <= Date.now()) {
        endAt = Date.now() + DURATION;
        localStorage.setItem(STORAGE_KEY, String(endAt));
    }

    const pad = n => String(n).padStart(2, '0');

    function render() {
        const diff = endAt - Date.now();
        if (diff <= 0) {
            hEl.textContent = '00';
            mEl.textContent = '00';
            sEl.textContent = '00';
            box.classList.add('ended');
            foot.textContent = '本场团购已结束，下一场助农专场即将开启';
            clearInterval(timer);
            return;
        }
        const h = Math.floor(diff / 3600000);
        const m = Math.floor(diff % 3600000 / 60000);
        const s = Math.floor(diff % 60000 / 1000);
        hEl.textContent = pad(h);
        mEl.textContent = pad(m);
        sEl.textContent = pad(s);
    }

    render();
    const timer = setInterval(render, 1000);
}

/* 触屏设备无 hover：点击卡片翻转查看售价 */
function initProductFlips() {
    if (!window.matchMedia) return;
    if (!window.matchMedia('(hover: none), (pointer: coarse)').matches) return;
    document.querySelectorAll('.product-card').forEach(card => {
        card.addEventListener('click', () => card.classList.toggle('flipped'));
    });
}

/* ---------- 8. 页面5 预约表单 ---------- */
function initOrderForm() {
    const form = document.getElementById('orderForm');

    form.addEventListener('submit', e => {
        e.preventDefault();
        const name = document.getElementById('orderName').value.trim();
        const phone = document.getElementById('orderPhone').value.trim();
        const product = document.getElementById('orderProduct').value;

        if (!name) {
            alert('请输入姓名');
            return;
        }
        if (!/^\d{11}$/.test(phone)) {
            alert('请输入11位手机号');
            return;
        }

        alert('预约成功！我们会尽快联系您');
        form.reset();
    });
}

/* ---------- 9. 数字赋能卡片翻转 ---------- */
function initFlowCards() {
    document.querySelectorAll('.flow-card').forEach(card => {
        card.addEventListener('click', () => {
            card.classList.toggle('flipped');
        });
    });
}

/* ---------- 10. 开始探索按钮 ---------- */
function initExplore() {
    const btn = document.getElementById('exploreBtn');
    if (!btn) return;
    btn.addEventListener('click', () => {
        const target = document.getElementById('statCards');
        if (!target) return;
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });

        // 滚动完成后依次高亮 4 张卡片，每张 0.5 秒
        setTimeout(() => {
            const cards = document.querySelectorAll('#statCards .stat-card');
            cards.forEach((card, index) => {
                setTimeout(() => {
                    card.classList.add('highlight');
                    setTimeout(() => card.classList.remove('highlight'), 500);
                }, index * 500);
            });
        }, 600);
    });
}

/* ---------- 10.5 沉浸式品牌故事：打字机 ---------- */
function initBrandStory() {
    const section = document.getElementById('brandStory');
    const textEl = document.getElementById('brandStoryText');
    const btn = document.getElementById('brandStoryBtn');
    if (!section || !textEl || !btn) return;

    const story = '兰州百合，全国唯一食用甜百合。生长于海拔2000米的黄土高原，历经9年岁月沉淀，酝酿出13.5mg/g的β-葡聚糖。这不仅是一颗百合，更是乡村振兴的‘致富果’。';
    const TYPE_SPEED = 55; // 每字间隔（毫秒）

    let started = false;
    let timer = null;

    function startTyping() {
        if (started) return;
        started = true;

        const textNode = document.createTextNode('');
        const caret = document.createElement('span');
        caret.className = 'type-caret';
        textEl.innerHTML = '';
        textEl.appendChild(textNode);
        textEl.appendChild(caret);

        let i = 0;
        timer = setInterval(() => {
            i++;
            textNode.data = story.slice(0, i);
            if (i >= story.length) {
                clearInterval(timer);
                caret.remove();          // 打完后移除闪烁光标
                btn.classList.add('show'); // 按钮淡入
            }
        }, TYPE_SPEED);
    }

    // 进入视口时开始播放，仅播放一次
    if ('IntersectionObserver' in window) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    startTyping();
                    observer.disconnect();
                }
            });
        }, { threshold: 0.3 });
        observer.observe(section);
    } else {
        startTyping();
    }

    // 按钮：平滑滚动到数据卡片
    btn.addEventListener('click', () => {
        const target = document.getElementById('statCards');
        if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
}

/* ---------- 10.5 国潮包装与场景营销 滑块 ---------- */
function initSceneSlider() {
    const slider = document.getElementById('sceneSlider');
    const track = document.getElementById('sceneTrack');
    const prevBtn = document.getElementById('scenePrev');
    const nextBtn = document.getElementById('sceneNext');
    const dotsBox = document.getElementById('sceneDots');
    if (!slider || !track || !prevBtn || !nextBtn || !dotsBox) return;

    const slides = track.querySelectorAll('.scene-slide');
    const total = slides.length;
    if (total === 0) return;

    let current = 0;
    let autoTimer = null;
    const AUTO_INTERVAL = 5000;

    // 生成圆点
    for (let i = 0; i < total; i++) {
        const dot = document.createElement('button');
        dot.className = 'scene-dot' + (i === 0 ? ' active' : '');
        dot.setAttribute('aria-label', `切换到第${i + 1}个场景`);
        dot.type = 'button';
        dot.addEventListener('click', () => goTo(i));
        dotsBox.appendChild(dot);
    }
    const dots = dotsBox.querySelectorAll('.scene-dot');

    function goTo(index) {
        current = (index + total) % total;
        track.style.transform = `translateX(-${current * 100}%)`;
        dots.forEach((d, i) => d.classList.toggle('active', i === current));
    }

    function next() { goTo(current + 1); }
    function prev() { goTo(current - 1); }

    prevBtn.addEventListener('click', prev);
    nextBtn.addEventListener('click', next);

    // 自动播放
    function startAuto() {
        stopAuto();
        autoTimer = setInterval(next, AUTO_INTERVAL);
    }
    function stopAuto() {
        if (autoTimer) { clearInterval(autoTimer); autoTimer = null; }
    }

    // 悬停暂停
    slider.addEventListener('mouseenter', stopAuto);
    slider.addEventListener('mouseleave', startAuto);

    // 页面不可见时暂停，避免后台空转
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) stopAuto();
        else startAuto();
    });

    // 触屏滑动支持
    let touchStartX = 0;
    track.addEventListener('touchstart', e => {
        touchStartX = e.touches[0].clientX;
        stopAuto();
    }, { passive: true });
    track.addEventListener('touchend', e => {
        const dx = e.changedTouches[0].clientX - touchStartX;
        if (Math.abs(dx) > 40) {
            dx < 0 ? next() : prev();
        }
        startAuto();
    }, { passive: true });

    startAuto();
}

/* ---------- 10.6 全渠道销售矩阵 气泡交互 ---------- */
function initChannelMatrix() {
    const cards = document.querySelectorAll('.channel-card');
    if (cards.length === 0) return;

    cards.forEach(card => {
        const toggle = (e) => {
            e.stopPropagation();
            const isActive = card.classList.contains('active');
            cards.forEach(c => c.classList.remove('active'));
            if (!isActive) card.classList.add('active');
        };
        card.addEventListener('click', toggle);
        card.addEventListener('keydown', e => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                toggle(e);
            }
        });
    });

    // 点击空白处关闭气泡
    document.addEventListener('click', e => {
        if (!e.target.closest('.channel-card')) {
            cards.forEach(c => c.classList.remove('active'));
        }
    });
}

/* ---------- 10.7 12周落地执行路线图 ---------- */
function initExecTimeline() {
    const nodes = document.querySelectorAll('.timeline-node');
    const progress = document.getElementById('timelineProgress');
    if (nodes.length === 0) return;

    // 进度条默认填充到当前节点（演示用：假设进行到第3个节点，索引2）
    // space-between 布局下，第 n 个节点位于 n/(length-1)*100% 处
    const currentStep = 2;
    const fillPercent = nodes.length > 1
        ? (currentStep / (nodes.length - 1)) * 100
        : 100;
    setTimeout(() => { if (progress) progress.style.width = fillPercent + '%'; }, 400);

    // 触屏设备：点击节点切换 Tooltip 显示（CSS hover 在触屏上不生效）
    const isTouch = ('ontouchstart' in window) || navigator.maxTouchPoints > 0;
    if (isTouch) {
        nodes.forEach(node => {
            node.addEventListener('click', (e) => {
                e.stopPropagation();
                const wasActive = node.classList.contains('active');
                nodes.forEach(n => n.classList.remove('active'));
                if (!wasActive) node.classList.add('active');
            });
        });
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.timeline-node')) {
                nodes.forEach(n => n.classList.remove('active'));
            }
        });
    }
}

/* ---------- 11. 窗口 resize ---------- */
window.addEventListener('resize', () => {
    Object.values(charts).forEach(c => c && c.resize());
});

/* ---------- 11. 初始化 ---------- */
window.addEventListener('load', () => {
    initNav();
    animateNumbers();
    initExplore();
    initBrandStory();

    // 页面1
    initNutrientChart();
    initAltitudeChart();
    initTrendChart();

    // 页面2
    initAwarenessPie();
    initMotivationBar();
    initExecTimeline();

    // 页面3
    initBenefitChart();
    initFlowCards();

    // 页面4 & 5
    initTrace();
    initCountdown();
    initProductFlips();
    initOrderForm();
    initSceneSlider();
    initChannelMatrix();
});
