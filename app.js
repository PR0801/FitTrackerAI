const form = document.querySelector("#healthForm");
const water = document.querySelector("#water");
const waterValue = document.querySelector("#waterValue");
const resetBtn = document.querySelector("#resetBtn");
const chart = document.querySelector("#progressChart");
const ctx = chart.getContext("2d");

const state = {
  chart: "weight",
  lastResult: null
};

const activityNames = {
  "1.2": "Sedentary",
  "1.375": "Lightly active",
  "1.55": "Moderately active",
  "1.725": "Very active"
};

function getProfile() {
  return {
    age: Number(document.querySelector("#age").value),
    gender: document.querySelector("#gender").value,
    height: Number(document.querySelector("#height").value),
    weight: Number(document.querySelector("#weight").value),
    activity: Number(document.querySelector("#activity").value),
    goal: document.querySelector("#goal").value,
    diet: document.querySelector("input[name='diet']:checked").value,
    highSugar: document.querySelector("#highSugar").checked,
    lowSleep: document.querySelector("#lowSleep").checked,
    condition: document.querySelector("#condition").checked,
    water: Number(water.value)
  };
}

function calculate(profile) {
  const heightM = profile.height / 100;
  const bmi = profile.weight / (heightM * heightM);
  const bmr = profile.gender === "male"
    ? 10 * profile.weight + 6.25 * profile.height - 5 * profile.age + 5
    : 10 * profile.weight + 6.25 * profile.height - 5 * profile.age - 161;
  const maintenance = Math.round(bmr * profile.activity);
  const target = profile.goal === "loss"
    ? maintenance - 500
    : profile.goal === "gain"
      ? maintenance + 350
      : maintenance;
  const waterTarget = Math.max(6, Math.round(profile.weight * 0.035 / 0.25));
  const score = getHealthScore(profile, bmi);

  return {
    bmi,
    bmiLabel: getBmiLabel(bmi),
    maintenance,
    target: Math.max(1200, target),
    waterTarget,
    alerts: buildAlerts(profile, bmi, waterTarget),
    dietPlan: buildDietPlan(profile),
    workoutPlan: buildWorkoutPlan(profile, bmi),
    score
  };
}

function getBmiLabel(bmi) {
  if (bmi < 18.5) return "Underweight";
  if (bmi < 25) return "Healthy range";
  if (bmi < 30) return "Slightly overweight";
  return "Obesity risk";
}

function getHealthScore(profile, bmi) {
  let score = 92;
  if (bmi < 18.5 || bmi >= 25) score -= 12;
  if (bmi >= 30) score -= 16;
  if (profile.activity <= 1.2) score -= 14;
  if (profile.highSugar) score -= 12;
  if (profile.lowSleep) score -= 10;
  if (profile.condition) score -= 10;
  if (profile.water < 6) score -= 6;
  return Math.max(35, Math.min(98, score));
}

function buildAlerts(profile, bmi, waterTarget) {
  const alerts = [];

  if (bmi >= 30) {
    alerts.push({ level: "high", text: "BMI indicates obesity risk. Increase daily movement and reduce calorie-dense foods gradually." });
  } else if (bmi >= 25) {
    alerts.push({ level: "medium", text: "BMI is above the healthy range. A steady calorie deficit and regular cardio can help." });
  } else if (bmi < 18.5) {
    alerts.push({ level: "medium", text: "BMI is below the healthy range. Add nutrient-dense meals and strength training." });
  } else {
    alerts.push({ level: "low", text: "BMI is in the healthy range. Keep tracking activity, sleep, and food quality." });
  }

  if (profile.highSugar) {
    alerts.push({ level: "high", text: "High sugar intake may increase diabetes risk. Choose fruit, curd, nuts, or whole grains more often." });
  }

  if (profile.activity <= 1.2) {
    alerts.push({ level: "medium", text: "Low activity can raise heart-health risk. Start with 25 to 30 minutes of walking daily." });
  }

  if (profile.lowSleep) {
    alerts.push({ level: "medium", text: "Poor sleep and stress can affect mental health, hunger, and recovery. Keep a consistent sleep routine." });
  }

  if (profile.condition) {
    alerts.push({ level: "high", text: "Health history selected. Confirm diet and exercise changes with a qualified doctor or dietician." });
  }

  if (profile.water < waterTarget) {
    alerts.push({ level: "medium", text: `Water intake is below the suggested target of ${waterTarget} glasses per day.` });
  }

  return alerts;
}

function buildDietPlan(profile) {
  const diabeticNote = profile.highSugar || profile.condition;
  const protein = profile.diet === "veg" ? "paneer, dal, sprouts, tofu, or curd" : "eggs, chicken, fish, dal, or curd";
  const dinnerProtein = profile.diet === "veg" ? "paneer/tofu" : "chicken/fish/paneer";

  if (profile.goal === "gain") {
    return [
      ["Breakfast", `Oats with milk, banana, nuts, and ${profile.diet === "veg" ? "curd" : "boiled eggs"}`],
      ["Lunch", `Rice or roti with dal, vegetables, salad, and ${protein}`],
      ["Snack", "Peanut butter toast, fruit, or a high-protein smoothie"],
      ["Dinner", `Roti with ${dinnerProtein}, vegetables, and curd`]
    ];
  }

  if (profile.goal === "maintain") {
    return [
      ["Breakfast", "Oats, milk, banana, and seeds"],
      ["Lunch", `Rice or roti with dal, vegetables, salad, and ${protein}`],
      ["Snack", diabeticNote ? "Roasted chana, nuts, or unsweetened curd" : "Fruit, nuts, or buttermilk"],
      ["Dinner", `Roti with ${dinnerProtein}, salad, and cooked vegetables`]
    ];
  }

  return [
    ["Breakfast", diabeticNote ? "Vegetable oats with curd and no added sugar" : "Oats, milk, banana, and chia seeds"],
    ["Lunch", "Smaller rice portion, dal, vegetables, salad, and curd"],
    ["Snack", "Fruit, roasted chana, sprouts, or green tea"],
    ["Dinner", `Two rotis with ${dinnerProtein}, salad, and low-oil vegetables`]
  ];
}

function buildWorkoutPlan(profile, bmi) {
  const gentle = profile.age > 55 || profile.condition || bmi >= 32;

  if (profile.goal === "gain") {
    return [
      ["Day 1", "Pushups, squats, lunges, and plank"],
      ["Day 2", "Strength training with progressive overload"],
      ["Day 3", "Walking 20 minutes and mobility work"],
      ["Weekly", "Train 4 days, rest 2 days, stretch after each workout"]
    ];
  }

  if (profile.goal === "maintain") {
    return [
      ["Cardio", gentle ? "Brisk walking 25 minutes" : "Jogging or cycling 25 minutes"],
      ["Strength", "Squats, wall pushups, rows, and core work"],
      ["Flexibility", "Stretching or yoga 15 minutes"],
      ["Weekly", "Move 5 days and include 2 strength sessions"]
    ];
  }

  return [
    ["Walking", gentle ? "30 minutes at a comfortable pace" : "30 minutes brisk walk"],
    ["Cardio", gentle ? "Cycling 15 minutes or step-ups" : "Running 20 minutes or cycling 20 minutes"],
    ["Strength", "Squats, pushups, glute bridges, and plank"],
    ["Weekly", "Aim for 150 minutes activity and 2 strength sessions"]
  ];
}

function render(result, profile) {
  document.querySelector("#bmiValue").textContent = result.bmi.toFixed(2);
  document.querySelector("#bmiLabel").textContent = result.bmiLabel;
  document.querySelector("#maintenanceCalories").textContent = result.maintenance.toLocaleString("en-IN");
  document.querySelector("#targetCalories").textContent = result.target.toLocaleString("en-IN");
  document.querySelector("#goalLabel").textContent = getGoalLabel(profile.goal);
  document.querySelector("#waterTarget").textContent = result.waterTarget;
  document.querySelector("#healthScore").textContent = `Health Score ${result.score}/100`;
  document.querySelector("#riskLevel").textContent = getRiskLabel(result.alerts);
  document.querySelector("#dietBadge").textContent = profile.diet === "veg" ? "Vegetarian" : "Non-veg";
  document.querySelector("#workoutBadge").textContent = getGoalLabel(profile.goal).replace(" calories", "");

  renderAlerts(result.alerts);
  renderPlan("#dietPlan", result.dietPlan);
  renderPlan("#workoutPlan", result.workoutPlan);
  drawChart(profile, result, state.chart);
}

function getGoalLabel(goal) {
  if (goal === "loss") return "Weight loss calories";
  if (goal === "gain") return "Muscle gain calories";
  return "Maintenance calories";
}

function getRiskLabel(alerts) {
  if (alerts.some((alert) => alert.level === "high")) return "High";
  if (alerts.some((alert) => alert.level === "medium")) return "Moderate";
  return "Low";
}

function renderAlerts(alerts) {
  document.querySelector("#alertsList").innerHTML = alerts
    .map((alert) => `<div class="alert ${alert.level === "high" ? "high" : alert.level === "low" ? "low" : ""}">${alert.text}</div>`)
    .join("");
}

function renderPlan(selector, items) {
  document.querySelector(selector).innerHTML = items
    .map(([title, text]) => `
      <article class="plan-item">
        <strong>${title}</strong>
        <p>${text}</p>
      </article>
    `)
    .join("");
}

function drawChart(profile, result, type) {
  const width = chart.width;
  const height = chart.height;
  const padding = 42;
  const data = getChartData(profile, result, type);
  const min = Math.min(...data.values) * 0.96;
  const max = Math.max(...data.values) * 1.04;

  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, width, height);

  ctx.strokeStyle = "#d7e4df";
  ctx.lineWidth = 1;
  for (let i = 0; i < 4; i += 1) {
    const y = padding + i * ((height - padding * 2) / 3);
    ctx.beginPath();
    ctx.moveTo(padding, y);
    ctx.lineTo(width - padding, y);
    ctx.stroke();
  }

  const points = data.values.map((value, index) => {
    const x = padding + index * ((width - padding * 2) / (data.values.length - 1));
    const y = height - padding - ((value - min) / (max - min || 1)) * (height - padding * 2);
    return { x, y, value };
  });

  ctx.strokeStyle = "#167a5a";
  ctx.lineWidth = 4;
  ctx.beginPath();
  points.forEach((point, index) => {
    if (index === 0) ctx.moveTo(point.x, point.y);
    else ctx.lineTo(point.x, point.y);
  });
  ctx.stroke();

  points.forEach((point, index) => {
    ctx.fillStyle = index === points.length - 1 ? "#f4b548" : "#167a5a";
    ctx.beginPath();
    ctx.arc(point.x, point.y, 7, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#66736d";
    ctx.font = "700 13px system-ui";
    ctx.textAlign = "center";
    ctx.fillText(data.labels[index], point.x, height - 14);
  });

  ctx.fillStyle = "#18231f";
  ctx.font = "800 16px system-ui";
  ctx.textAlign = "left";
  ctx.fillText(data.title, padding, 26);
}

function getChartData(profile, result, type) {
  const labels = ["Now", "W2", "W4", "W6", "W8"];
  if (type === "bmi") {
    const delta = profile.goal === "loss" ? -0.34 : profile.goal === "gain" ? 0.18 : -0.04;
    return {
      title: "Projected BMI trend",
      labels,
      values: labels.map((_, index) => Number((result.bmi + delta * index).toFixed(2)))
    };
  }

  if (type === "calories") {
    return {
      title: "Daily calorie target",
      labels,
      values: labels.map((_, index) => result.target + (profile.goal === "loss" ? index * 20 : profile.goal === "gain" ? index * 30 : 0))
    };
  }

  const weightDelta = profile.goal === "loss" ? -0.7 : profile.goal === "gain" ? 0.35 : -0.05;
  return {
    title: "Projected weight trend",
    labels,
    values: labels.map((_, index) => Number((profile.weight + weightDelta * index).toFixed(1)))
  };
}

function update() {
  const profile = getProfile();
  const result = calculate(profile);
  state.lastResult = { profile, result };
  waterValue.textContent = profile.water;
  render(result, profile);
}

form.addEventListener("submit", (event) => {
  event.preventDefault();
  update();
});

form.addEventListener("input", update);
form.addEventListener("change", update);
water.addEventListener("input", () => {
  waterValue.textContent = water.value;
});

resetBtn.addEventListener("click", () => {
  form.reset();
  update();
});

document.querySelectorAll(".tab").forEach((tab) => {
  tab.addEventListener("click", () => {
    document.querySelectorAll(".tab").forEach((button) => button.classList.remove("active"));
    tab.classList.add("active");
    state.chart = tab.dataset.chart;
    if (state.lastResult) {
      drawChart(state.lastResult.profile, state.lastResult.result, state.chart);
    }
  });
});

update();
