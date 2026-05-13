async (page) => {
  const editors = await page.locator('.cm-content').all();
  let targetEditor = null;

  for (const editor of editors) {
    const text = await editor.textContent();
    if (text.includes('forecast_project_cost') && text.includes('TODO')) {
      targetEditor = editor;
      break;
    }
  }

  if (!targetEditor) return "Cell 28 editor not found";

  await targetEditor.click();
  await page.waitForTimeout(300);
  await page.keyboard.press('Control+a');
  await page.waitForTimeout(200);

  const code = `# Cell 28: Project Cost Forecasting
print("=" * 60)
print("EXERCISE 8.5.2: Project Cost Forecasting")
print("=" * 60)

import numpy as np

def forecast_project_cost(phases, contingency_pct=20, confidence_level=0.95):
    """
    Forecast multi-phase project costs with confidence intervals.
    """
    z_score = 1.96  # 95% confidence
    if confidence_level == 0.90:
        z_score = 1.645
    elif confidence_level == 0.99:
        z_score = 2.576

    phase_breakdown = []
    total_base = 0
    total_low = 0
    total_high = 0

    for phase in phases:
        price = GPU_PRICING.get(phase["gpu_type"], GPU_PRICING["T4"])
        base_cost = price * phase["gpu_count"] * phase["duration_hours"]
        uncertainty = phase.get("uncertainty_pct", 0.20)
        std_dev = base_cost * uncertainty
        low_est = base_cost - z_score * std_dev
        high_est = base_cost + z_score * std_dev

        phase_breakdown.append({
            "name": phase["name"],
            "gpu_type": phase["gpu_type"],
            "gpu_count": phase["gpu_count"],
            "duration_hours": phase["duration_hours"],
            "base_cost": base_cost,
            "uncertainty_pct": uncertainty * 100,
            "low_est": max(0, low_est),
            "high_est": high_est,
        })
        total_base += base_cost
        total_low += max(0, low_est)
        total_high += high_est

    contingency = total_base * (contingency_pct / 100)
    total_with_contingency = total_base + contingency

    return {
        "phases": phase_breakdown,
        "total_base": total_base,
        "contingency_pct": contingency_pct,
        "contingency_amount": contingency,
        "total_with_contingency": total_with_contingency,
        "confidence_interval": (total_low, total_high),
        "confidence_level": confidence_level,
        "best_case": total_low,
        "worst_case": total_high + contingency,
        "expected_case": total_with_contingency,
    }

# Example project
example_project = [
    {"name": "Data Preparation", "gpu_type": "T4", "gpu_count": 1, "duration_hours": 40, "uncertainty_pct": 0.15},
    {"name": "Model Training", "gpu_type": "A100", "gpu_count": 4, "duration_hours": 120, "uncertainty_pct": 0.25},
    {"name": "Hyperparameter Tuning", "gpu_type": "A100", "gpu_count": 8, "duration_hours": 60, "uncertainty_pct": 0.30},
    {"name": "Model Evaluation", "gpu_type": "T4", "gpu_count": 2, "duration_hours": 20, "uncertainty_pct": 0.10},
]

forecast = forecast_project_cost(example_project, contingency_pct=20, confidence_level=0.95)

print("\\nProject Cost Forecast")
print("=" * 80)
print("{:<22} {:<8} {:<6} {:<10} {:<14} {:<10} {:<14} {:<14}".format(
    "Phase", "GPU", "Count", "Hours", "Base Cost", "Uncert%", "Low Est", "High Est"))
print("-" * 100)
for p in forecast["phases"]:
    print("{:<22} {:<8} {:<6} {:<10} $ {:<13.2f} {:<9.0f}% $ {:<13.2f} $ {:<13.2f}".format(
        p["name"], p["gpu_type"], p["gpu_count"], p["duration_hours"],
        p["base_cost"], p["uncertainty_pct"], p["low_est"], p["high_est"]))

print("-" * 100)
print("{:<22} {:>48} $ {:<13.2f}".format("TOTAL BASE", "", forecast["total_base"]))
print("{:<22} {:>48} $ {:<13.2f}".format("CONTINGENCY (" + str(forecast["contingency_pct"]) + "%)", "", forecast["contingency_amount"]))
print("{:<22} {:>48} $ {:<13.2f}".format("TOTAL W/ CONTINGENCY", "", forecast["total_with_contingency"]))
print("\\nConfidence Interval ({}%): $ {:.2f} - $ {:.2f}".format(
    int(forecast["confidence_level"] * 100),
    forecast["confidence_interval"][0],
    forecast["confidence_interval"][1]))
print("Best case:  $ {:.2f}".format(forecast["best_case"]))
print("Expected:   $ {:.2f}".format(forecast["expected_case"]))
print("Worst case: $ {:.2f}".format(forecast["worst_case"]))

# Visualization
fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(14, 5))

# Phase breakdown
phases_names = [p["name"][:15] for p in forecast["phases"]]
base_costs = [p["base_cost"] for p in forecast["phases"]]
low_costs = [p["low_est"] for p in forecast["phases"]]
high_costs = [p["high_est"] for p in forecast["phases"]]

x = range(len(phases_names))
width = 0.35
bars = ax1.bar(x, base_costs, width, color=['#2196F3', '#FF9800', '#4CAF50', '#9C27B0'])
ax1.set_xticks(x)
ax1.set_xticklabels(phases_names, rotation=20, ha='right', fontsize=8)
ax1.set_ylabel('Cost (USD)')
ax1.set_title('Phase Cost Breakdown')
for bar, cost in zip(bars, base_costs):
    ax1.text(bar.get_x() + bar.get_width()/2., bar.get_height(),
             '$' + str(int(cost)), ha='center', va='bottom', fontsize=8)

# Forecasting scenario comparison
scenarios = ['Best Case', 'Expected', 'Worst Case']
scenario_values = [forecast["best_case"], forecast["expected_case"], forecast["worst_case"]]
scenario_colors = ['#4CAF50', '#FF9800', '#F44336']
bars2 = ax2.bar(scenarios, scenario_values, color=scenario_colors)
ax2.set_ylabel('Cost (USD)')
ax2.set_title('Project Cost Scenarios')
for bar, val in zip(bars2, scenario_values):
    ax2.text(bar.get_x() + bar.get_width()/2., bar.get_height(),
             '$' + str(int(val)), ha='center', va='bottom', fontsize=10)

plt.tight_layout()
plt.savefig('project_forecast.png', dpi=150, bbox_inches='tight')
plt.show()
print("Chart saved as project_forecast.png")`;

  await page.keyboard.insertText(code);
  await page.waitForTimeout(500);
  await page.keyboard.press('Shift+Enter');
  return "Cell 28 implemented and running";
}