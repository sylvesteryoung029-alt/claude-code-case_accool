/**
 * 空调制冷量计算器 — 前端逻辑
 * 包含：气候数据、计算公式、表单交互、输入验证、窗口控制
 */

// ==============================
//  数据定义
// ==============================

/**
 * 中国建筑气候分区与城市映射表
 * 基于 GB 50176《民用建筑热工设计规范》
 * 系数含义：夏季制冷需求强度（基准值 1.00 = 夏热冬冷地区）
 */
const CLIMATE_ZONES = [
  {
    zone: "严寒地区",
    coefficient: 0.70,
    cities: ["哈尔滨", "长春", "乌鲁木齐", "呼和浩特", "拉萨"],
  },
  {
    zone: "寒冷地区",
    coefficient: 0.85,
    cities: [
      "北京", "天津", "沈阳", "西安", "石家庄",
      "太原", "济南", "郑州", "兰州", "西宁", "银川",
    ],
  },
  {
    zone: "夏热冬冷",
    coefficient: 1.00,
    cities: [
      "上海", "南京", "武汉", "重庆", "成都",
      "杭州", "合肥", "南昌", "长沙",
    ],
  },
  {
    zone: "夏热冬暖",
    coefficient: 1.15,
    cities: ["广州", "深圳", "福州", "南宁", "海口", "厦门"],
  },
  {
    zone: "温和地区",
    coefficient: 0.80,
    cities: ["昆明", "贵阳"],
  },
];

/**
 * 房间朝向系数
 */
const ORIENTATIONS = [
  { label: "北", coefficient: 0.90 },
  { label: "东北", coefficient: 0.95 },
  { label: "东", coefficient: 1.05 },
  { label: "东南", coefficient: 1.00 },
  { label: "南", coefficient: 1.10 },
  { label: "西南", coefficient: 1.00 },
  { label: "西", coefficient: 1.05 },
  { label: "西北", coefficient: 0.95 },
];

/**
 * 计算常量
 */
const BASE_COOLING_LOAD = 120;   // 基础冷负荷 W/m²
const WINDOW_HEAT_GAIN = 200;    // 窗户热负荷 W/m²
const PERSON_HEAT = 150;         // 人体散热 W/人
const TOP_FLOOR_COEFF = 1.15;    // 顶层系数
const NORMAL_FLOOR_COEFF = 1.00; // 非顶层系数
const HP_TO_WATT = 2500;         // 1匹 = 2500W

// ==============================
//  DOM 元素引用
// ==============================

const elCity = document.getElementById("city");
const elArea = document.getElementById("area");
const elWindowArea = document.getElementById("window-area");
const elFloor = document.getElementById("floor");
const elTopFloor = document.getElementById("top-floor");
const elOrientation = document.getElementById("orientation");
const elPeople = document.getElementById("people");
const elBtnCalc = document.getElementById("btn-calculate");
const elResultCard = document.getElementById("result-card");
const elResultKw = document.getElementById("result-kw");
const elResultHp = document.getElementById("result-hp");
const elTitlebar = document.getElementById("titlebar");

// ==============================
//  初始化
// ==============================

/**
 * 检测运行环境：浏览器 or 桌面应用
 * Edge --app 模式：window.open 为 null，launchQueue 存在
 */
function detectEnvironment() {
  // Edge/Chrome app 模式：没有普通浏览器 chrome
  const isAppMode = !window.menubar || (window.location.protocol === "file:");
  return { isDesktop: isAppMode };
}

/**
 * 填充下拉选项
 */
function populateSelects() {
  // 城市下拉
  elCity.innerHTML = '<option value="" disabled selected>请选择城市</option>';
  CLIMATE_ZONES.forEach((zone) => {
    const optgroup = document.createElement("optgroup");
    optgroup.label = `${zone.zone}（系数 ${zone.coefficient.toFixed(2)}）`;
    zone.cities.forEach((city) => {
      const option = document.createElement("option");
      option.value = JSON.stringify({ city, coefficient: zone.coefficient, zone: zone.zone });
      option.textContent = city;
      optgroup.appendChild(option);
    });
    elCity.appendChild(optgroup);
  });

  // 朝向下拉
  elOrientation.innerHTML = '<option value="" disabled selected>请选择朝向</option>';
  ORIENTATIONS.forEach((o) => {
    const option = document.createElement("option");
    option.value = JSON.stringify({ label: o.label, coefficient: o.coefficient });
    option.textContent = `${o.label}（系数 ${o.coefficient.toFixed(2)}）`;
    elOrientation.appendChild(option);
  });
}

// ==============================
//  计算逻辑
// ==============================

/**
 * 解析城市选项值
 * @returns {{ city: string, coefficient: number, zone: string } | null}
 */
function parseCityValue() {
  if (!elCity.value) return null;
  try {
    return JSON.parse(elCity.value);
  } catch {
    return null;
  }
}

/**
 * 解析朝向选项值
 * @returns {{ label: string, coefficient: number } | null}
 */
function parseOrientationValue() {
  if (!elOrientation.value) return null;
  try {
    return JSON.parse(elOrientation.value);
  } catch {
    return null;
  }
}

/**
 * 显示 toast 提示
 * @param {string} message
 */
function showToast(message) {
  // 移除已有 toast
  const existing = document.querySelector(".toast");
  if (existing) existing.remove();

  const toast = document.createElement("div");
  toast.className = "toast";
  toast.textContent = message;
  document.body.appendChild(toast);

  // 触发显示动画
  requestAnimationFrame(() => {
    toast.classList.add("show");
  });

  // 2.5 秒后移除
  setTimeout(() => {
    toast.classList.remove("show");
    setTimeout(() => toast.remove(), 300);
  }, 2500);
}

/**
 * 校验输入参数
 * @returns {{ valid: boolean, message?: string }}
 */
function validateInputs(cityData, area, windowArea, floor, orientationData, people) {
  if (!cityData) {
    return { valid: false, message: "请选择城市" };
  }
  if (!area || area <= 0) {
    return { valid: false, message: "请输入有效的房间面积（大于 0）" };
  }
  if (area > 500) {
    return { valid: false, message: "房间面积不能超过 500 平方米" };
  }
  if (windowArea === null || windowArea < 0 || isNaN(windowArea)) {
    return { valid: false, message: "请输入有效的窗户面积（大于等于 0）" };
  }
  if (windowArea > area) {
    return { valid: false, message: "窗户面积不能大于房间面积" };
  }
  if (!floor || floor < 1) {
    return { valid: false, message: "请输入有效的楼层数（至少为 1）" };
  }
  if (!orientationData) {
    return { valid: false, message: "请选择房间朝向" };
  }
  if (!people || people < 1) {
    return { valid: false, message: "请输入有效的常驻人数（至少为 1）" };
  }
  if (people > 50) {
    return { valid: false, message: "常驻人数不能超过 50 人" };
  }
  return { valid: true };
}

/**
 * 计算空调制冷量
 * @param {number} area - 房间面积 (m²)
 * @param {number} windowArea - 窗户面积 (m²)
 * @param {number} climateCoeff - 气候系数
 * @param {number} orientationCoeff - 朝向系数
 * @param {boolean} isTopFloor - 是否为顶层
 * @param {number} people - 人数
 * @returns {{ watts: number, kw: number, hp: number }}
 */
function calculate(area, windowArea, climateCoeff, orientationCoeff, isTopFloor, people) {
  const floorCoeff = isTopFloor ? TOP_FLOOR_COEFF : NORMAL_FLOOR_COEFF;

  // 墙体负荷
  const wallLoad = area * BASE_COOLING_LOAD * climateCoeff * orientationCoeff * floorCoeff;

  // 窗户负荷
  const windowLoad = windowArea * WINDOW_HEAT_GAIN;

  // 人体负荷
  const personLoad = people * PERSON_HEAT;

  // 总制冷量
  const totalWatts = wallLoad + windowLoad + personLoad;

  // 单位转换
  const kw = totalWatts / 1000;
  const hp = totalWatts / HP_TO_WATT;

  return {
    watts: Math.round(totalWatts),
    kw: parseFloat(kw.toFixed(1)),
    hp: parseFloat(hp.toFixed(1)),
  };
}

/**
 * 显示计算结果
 * @param {{ kw: number, hp: number }} result
 */
function showResult(result) {
  elResultKw.textContent = result.kw.toFixed(1);
  elResultHp.textContent = result.hp.toFixed(1);
  elResultCard.classList.add("visible");
}

/**
 * 主计算入口
 */
function handleCalculate() {
  const cityData = parseCityValue();
  const area = parseFloat(elArea.value) || 0;
  const windowArea = elWindowArea.value === "" ? 0 : (parseFloat(elWindowArea.value) ?? 0);
  const floor = parseInt(elFloor.value) || 0;
  const orientationData = parseOrientationValue();
  const people = parseInt(elPeople.value) || 0;
  const isTopFloor = elTopFloor.checked;

  // 校验
  const validation = validateInputs(cityData, area, windowArea, floor, orientationData, people);
  if (!validation.valid) {
    showToast(validation.message);
    return;
  }

  // 计算
  const result = calculate(
    area,
    windowArea,
    cityData.coefficient,
    orientationData.coefficient,
    isTopFloor,
    people
  );

  // 显示
  showResult(result);
}

// ==============================
//  事件绑定
// ==============================

function bindEvents() {
  // 计算按钮
  elBtnCalc.addEventListener("click", handleCalculate);

  // Enter 键触发计算
  document.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleCalculate();
    }
  });

  // 楼层 > 1 时自动勾选/取消顶层（不做强制，但提供便利）
  elFloor.addEventListener("input", () => {
    const floor = parseInt(elFloor.value);
    if (floor === 1) {
      // 1 楼不可能是顶层（除非是平房）
      // 不自动取消，由用户自己判断
    }
  });

  // 桌面窗口控制按钮
  const btnClose = document.getElementById("btn-close");
  if (btnClose) {
    btnClose.addEventListener("click", () => {
      window.close();
    });
  }
}

// ==============================
//  启动
// ==============================

document.addEventListener("DOMContentLoaded", () => {
  // 浏览器模式下添加居中样式
  const env = detectEnvironment();
  if (!env.isDesktop) {
    document.body.classList.add("browser-mode");
  }

  populateSelects();
  bindEvents();
});
