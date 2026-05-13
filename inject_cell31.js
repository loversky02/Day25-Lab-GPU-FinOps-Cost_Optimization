async (page) => {
  const editors = await page.locator('.cm-content').all();
  let targetEditor = null;

  for (const editor of editors) {
    const text = await editor.textContent();
    if (text.includes('CHALLENGE EXERCISE') && text.includes('TODO')) {
      targetEditor = editor;
      break;
    }
  }

  if (!targetEditor) return "Cell 31 editor not found";

  await targetEditor.click();
  await page.waitForTimeout(300);
  await page.keyboard.press('Control+a');
  await page.waitForTimeout(200);

  const code = `# Cell 31: Challenge Exercise - Cost Optimization Strategy Design
print("=" * 60)
print("CHALLENGE EXERCISE 8.5.5: Design Cost Optimization Strategy")
print("=" * 60)

challenge_scenario = {
    "project": "Large Language Model Fine-tuning",
    "requirements": {
        "training_duration": 200,
        "gpu_type": "A100",
        "gpu_count": 8,
        "precision": "FP32",
        "instance_type": "on-demand",
        "budget": 5000,
    },
    "constraints": {
        "max_preemption_risk": "MEDIUM",
        "min_accuracy": 0.95,
        "deadline": "2 weeks",
    }
}

print("CHALLENGE SCENARIO:")
print("   Project: " + challenge_scenario['project'])
print("   Baseline: {}x {} for {}h on {}".format(
    challenge_scenario['requirements']['gpu_count'],
    challenge_scenario['requirements']['gpu_type'],
    challenge_scenario['requirements']['training_duration'],
    challenge_scenario['requirements']['instance_type']))
print("   Budget: $ " + str(challenge_scenario['requirements']['budget']))
print("   Deadline: " + challenge_scenario['constraints']['deadline'])

# Step 1: Calculate baseline cost
gpu_type = challenge_scenario['requirements']['gpu_type']
gpu_count = challenge_scenario['requirements']['gpu_count']
duration = challenge_scenario['requirements']['training_duration']
price_per_hour = GPU_PRICING[gpu_type]
baseline_cost = price_per_hour * gpu_count * duration

print("\\n" + "=" * 60)
print("STEP 1: Baseline Cost Analysis")
print("=" * 60)
print("   {}x {} at $ {:.2f}/hr each for {}h".format(gpu_count, gpu_type, price_per_hour, duration))
print("   Baseline cost: $ {:.2f}".format(baseline_cost))
print("   Budget: $ " + str(challenge_scenario['requirements']['budget']))
print("   Over budget by: $ {:.2f} ({:.1f}x)".format(
    max(0, baseline_cost - challenge_scenario['requirements']['budget']),
    baseline_cost / challenge_scenario['requirements']['budget']))

# Step 2: Multi-GPU analysis
print("\\n" + "=" * 60)
print("STEP 2: Multi-GPU Optimization")
print("=" * 60)
multi_gpu = analyze_multi_gpu_cost(duration, gpu_type, [1, 2, 4, 8])
print("   Optimal config: {}x {} at $ {:.2f}".format(
    multi_gpu['optimal_gpu_count'], gpu_type, multi_gpu['optimal_cost']))
# Check deadline constraint - fewer GPUs = longer time
for r in multi_gpu['results']:
    meets_deadline = "YES" if r['time_hours'] <= (14 * 24) else "NO"  # 2 weeks = 336 hours
    print("   {}x GPU: {}h training, $ {:.2f} [Meets deadline: {}]".format(
        r['gpu_count'], r['time_hours'], r['total_cost_usd'], meets_deadline))

# Step 3: Optimization strategies
print("\\n" + "=" * 60)
print("STEP 3: Apply Optimization Strategies")
print("=" * 60)

# Build config from optimal multi-GPU
optimal_gpu = multi_gpu['optimal_gpu_count']
optimized_config = {
    "gpu_type": gpu_type,
    "gpu_count": optimal_gpu,
    "duration_hours": multi_gpu['results'][optimal_gpu - 1]['time_hours'],
    "precision": "FP32",
    "instance_type": "on-demand",
}

# Filter strategies based on constraints
feasible_strategies = [
    {"name": "Switch to Mixed Precision (AMP)", "savings_pct": 0.25, "implementation_effort": "LOW", "risk_level": "LOW", "dependencies": []},
    {"name": "Use Spot Instances (partial)", "savings_pct": 0.30, "implementation_effort": "MEDIUM", "risk_level": "MEDIUM", "dependencies": []},
    {"name": "Optimize Batch Size for Memory", "savings_pct": 0.15, "implementation_effort": "LOW", "risk_level": "LOW", "dependencies": []},
    {"name": "Implement Gradient Checkpointing", "savings_pct": 0.20, "implementation_effort": "MEDIUM", "risk_level": "LOW", "dependencies": []},
    {"name": "Use Flash Attention", "savings_pct": 0.35, "implementation_effort": "MEDIUM", "risk_level": "LOW", "dependencies": []},
]

opt_results = analyze_optimization_opportunities(optimized_config, feasible_strategies)

print("   Starting cost (optimized multi-GPU): $ {:.2f}".format(opt_results['baseline_cost']))
print("\\n   {:<35} {:<10} {:<8} {:<8}".format("Strategy", "Savings%", "Effort", "Risk"))
print("   " + "-" * 65)
for s in opt_results['strategies']:
    print("   {:<35} {:<9.0f}% {:<8} {:<8}".format(
        s['name'][:33], s['savings_pct']*100, s['implementation_effort'], s['risk_level']))

print("\\n   Final optimized cost: $ {:.2f}".format(opt_results['final_optimized_cost']))
print("   Total savings: {:.1f}%".format(opt_results['optimization_pct']))

# Step 4: Final forecast
print("\\n" + "=" * 60)
print("STEP 4: Final Budget Assessment")
print("=" * 60)
final_cost = opt_results['final_optimized_cost']
budget = challenge_scenario['requirements']['budget']
is_under_budget = final_cost <= budget

print("   Baseline cost:               $ {:.2f}".format(baseline_cost))
print("   After multi-GPU optimization: $ {:.2f}".format(opt_results['baseline_cost']))
print("   After all optimizations:      $ {:.2f}".format(final_cost))
print("   Budget:                       $ {:.2f}".format(budget))
print("   Under budget:                 " + ("YES" if is_under_budget else "NO - need $" + str(round(budget * 0.1))))
print("   Total reduction:              {:.1f}%".format((1 - final_cost / baseline_cost) * 100))

# Step 5: Strategy Summary
print("\\n" + "=" * 60)
print("STEP 5: Recommended Strategy")
print("=" * 60)
print("""
  PHASE 1 - Quick Wins (Week 1):
    1. Enable Mixed Precision (AMP) - 25% savings, low risk
    2. Optimize batch size - 15% additional savings
    3. Implement Flash Attention - 35% compute savings

  PHASE 2 - Infrastructure (Week 1-2):
    4. Use {}x {} instead of 8x - saves $ {:.2f}
    5. Partial spot instances (50% workloads) - 30% savings

  RISK MITIGATION:
    - Keep 20% contingency buffer
    - Monitor preemption rate on spot instances
    - Validate accuracy after each optimization step

  FINAL ESTIMATE:
    - Cost: $ {:.2f} (vs $ {:.2f} baseline)
    - Savings: {:.1f}%
    - Within budget: {}
""".format(optimal_gpu, gpu_type,
           baseline_cost - opt_results['baseline_cost'],
           final_cost, baseline_cost,
           (1 - final_cost / baseline_cost) * 100,
           "YES" if is_under_budget else "NEED REVIEW"))

print("Challenge complete! Strategy covers multi-GPU, precision, infrastructure, and risk.")`;

  await page.keyboard.insertText(code);
  await page.waitForTimeout(500);
  await page.keyboard.press('Shift+Enter');
  return "Cell 31 implemented and running";
}