async (page) => {
  const editors = await page.locator('.cm-content').all();
  let targetEditor = null;

  for (const editor of editors) {
    const text = await editor.textContent();
    if (text.includes('analyze_optimization_opportunities') && text.includes('TODO')) {
      targetEditor = editor;
      break;
    }
  }

  if (!targetEditor) return "Cell 29 editor not found";

  await targetEditor.click();
  await page.waitForTimeout(300);
  await page.keyboard.press('Control+a');
  await page.waitForTimeout(200);

  const code = `# Cell 29: Optimization Opportunity Analysis
print("=" * 60)
print("EXERCISE 8.5.3: Advanced Optimization Opportunity Analysis")
print("=" * 60)

def analyze_optimization_opportunities(current_config, optimization_strategies):
    """
    Analyze and prioritize optimization strategies based on savings, effort, and risk.

    Returns prioritized recommendations with cumulative savings.
    """
    baseline_hours = current_config.get("duration_hours", 100)
    baseline_gpu = current_config.get("gpu_type", "A100")
    baseline_count = current_config.get("gpu_count", 1)
    baseline_price = GPU_PRICING.get(baseline_gpu, GPU_PRICING["T4"])
    baseline_cost = baseline_hours * baseline_price * baseline_count

    # Score each strategy: savings vs effort vs risk
    effort_scores = {"LOW": 3, "MEDIUM": 2, "HIGH": 1}
    risk_penalty = {"LOW": 1.0, "MEDIUM": 0.7, "HIGH": 0.4}

    scored = []
    for s in optimization_strategies:
        savings_amount = baseline_cost * s["savings_pct"]
        effort_score = effort_scores.get(s["implementation_effort"], 2)
        risk_factor = risk_penalty.get(s["risk_level"], 0.7)
        # Priority = savings * effort_score * risk_factor (higher = better ROI)
        priority_score = s["savings_pct"] * effort_score * risk_factor * 100

        scored.append({
            **s,
            "savings_amount": savings_amount,
            "priority_score": priority_score,
            "roi_category": "QUICK WIN" if (s["implementation_effort"] == "LOW" and s["savings_pct"] > 0.10)
                            else "STRATEGIC" if s["savings_pct"] > 0.30
                            else "LONG-TERM",
        })

    # Sort by priority score descending
    scored.sort(key=lambda x: x["priority_score"], reverse=True)

    # Calculate cumulative savings (removing overlapping effects)
    cumulative = 0
    remaining = baseline_cost
    for s in scored:
        actual_saving = remaining * s["savings_pct"]
        cumulative += actual_saving
        remaining -= actual_saving
        s["cumulative_cost"] = remaining

    return {
        "baseline_cost": baseline_cost,
        "baseline_config": current_config,
        "strategies": scored,
        "total_potential_savings": baseline_cost - remaining,
        "final_optimized_cost": remaining,
        "optimization_pct": ((baseline_cost - remaining) / baseline_cost) * 100,
    }

current_training_config = {
    "gpu_type": "A100",
    "gpu_count": 4,
    "duration_hours": 100,
    "precision": "FP32",
    "instance_type": "on-demand",
}

example_strategies = [
    {"name": "Switch to Mixed Precision (AMP)", "savings_pct": 0.25, "implementation_effort": "LOW", "risk_level": "LOW", "dependencies": []},
    {"name": "Use Spot Instances", "savings_pct": 0.60, "implementation_effort": "MEDIUM", "risk_level": "HIGH", "dependencies": []},
    {"name": "Optimize Batch Size", "savings_pct": 0.15, "implementation_effort": "LOW", "risk_level": "LOW", "dependencies": []},
    {"name": "Implement Early Stopping", "savings_pct": 0.20, "implementation_effort": "MEDIUM", "risk_level": "LOW", "dependencies": []},
    {"name": "Switch to More Efficient GPU", "savings_pct": 0.40, "implementation_effort": "HIGH", "risk_level": "MEDIUM", "dependencies": []},
]

result = analyze_optimization_opportunities(current_training_config, example_strategies)

print("\\nBaseline: {}x {} for {}h".format(
    current_training_config["gpu_count"],
    current_training_config["gpu_type"],
    current_training_config["duration_hours"]))
print("Baseline cost: $ {:.2f}".format(result["baseline_cost"]))
print("\\n{:<5} {:<32} {:<10} {:<8} {:<8} {:<14} {:<12}".format(
    "Rank", "Strategy", "Savings%", "Effort", "Risk", "Save Amount", "ROI Type"))
print("-" * 95)
for i, s in enumerate(result["strategies"], 1):
    print("{:<5} {:<32} {:<9.0f}% {:<8} {:<8} $ {:<13.2f} {:<12}".format(
        i, s["name"][:30], s["savings_pct"]*100, s["implementation_effort"],
        s["risk_level"], s["savings_amount"], s["roi_category"]))

print("\\nCumulative optimization path:")
print("  Starting cost:   $ {:.2f}".format(result["baseline_cost"]))
prev = result["baseline_cost"]
for s in result["strategies"]:
    print("  + {}:  $ {:.2f} -> $ {:.2f} (save {:.0f}%)".format(
        s["name"][:30], prev, s["cumulative_cost"], s["savings_pct"]*100))
    prev = s["cumulative_cost"]
print("  Final cost:      $ {:.2f}".format(result["final_optimized_cost"]))
print("  Total savings:   {:.1f}%".format(result["optimization_pct"]))

# Visualization
fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(14, 5))

# Savings vs effort scatter
effort_map = {"LOW": 1, "MEDIUM": 2, "HIGH": 3}
colors = {'LOW': '#4CAF50', 'MEDIUM': '#FF9800', 'HIGH': '#F44336'}
for s in result["strategies"]:
    ax1.scatter(s["priority_score"], s["savings_pct"]*100,
                s=150, c=colors[s["risk_level"]],
                edgecolors='black', linewidth=0.5, alpha=0.8)
    ax1.annotate(s["name"][:20], (s["priority_score"], s["savings_pct"]*100),
                fontsize=7, xytext=(5, 5), textcoords='offset points')
ax1.set_xlabel('Priority Score (higher = better ROI)')
ax1.set_ylabel('Savings (%)')
ax1.set_title('Optimization Strategy Prioritization')
legend_elements = [plt.Line2D([0], [0], marker='o', color='w', markerfacecolor=c, label=r, markersize=10)
                   for r, c in colors.items()]
ax1.legend(handles=legend_elements, title='Risk Level', fontsize=8)

# Cumulative cost reduction
steps = ['Baseline'] + [s["name"][:15] for s in result["strategies"]]
costs = [result["baseline_cost"]] + [s["cumulative_cost"] for s in result["strategies"]]
ax2.plot(range(len(steps)), costs, 'b-o', linewidth=2, markersize=8)
ax2.fill_between(range(len(steps)), costs, alpha=0.3, color='#2196F3')
ax2.set_xticks(range(len(steps)))
ax2.set_xticklabels(steps, rotation=45, ha='right', fontsize=7)
ax2.set_ylabel('Cumulative Cost (USD)')
ax2.set_title('Cost Reduction Path')
ax2.grid(True, alpha=0.3)
ax2.axhline(y=result["final_optimized_cost"], color='green', linestyle='--', alpha=0.5, label='Optimized')

plt.tight_layout()
plt.savefig('optimization_roadmap.png', dpi=150, bbox_inches='tight')
plt.show()
print("Chart saved as optimization_roadmap.png")`;

  await page.keyboard.insertText(code);
  await page.waitForTimeout(500);
  await page.keyboard.press('Shift+Enter');
  return "Cell 29 implemented and running";
}