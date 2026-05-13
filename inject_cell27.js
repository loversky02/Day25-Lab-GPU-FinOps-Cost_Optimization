async (page) => {
  // Find Cell 27 editor and replace content
  const editors = await page.locator('.cm-content').all();
  let targetEditor = null;

  for (const editor of editors) {
    const text = await editor.textContent();
    if (text.includes('analyze_multi_gpu_cost') && text.includes('TODO')) {
      targetEditor = editor;
      break;
    }
  }

  if (!targetEditor) return "Cell 27 editor not found";

  await targetEditor.click();
  await page.waitForTimeout(300);
  await page.keyboard.press('Control+a');
  await page.waitForTimeout(200);

  // Type the code
  const code = `# Cell 27: Multi-GPU Cost Analysis
print("=" * 60)
print("EXERCISE 8.5.1: Multi-GPU Cost Analysis")
print("=" * 60)

def analyze_multi_gpu_cost(base_time_hours, gpu_type, gpu_counts, scaling_factors=None):
    base_price = GPU_PRICING.get(gpu_type, GPU_PRICING["T4"])
    if scaling_factors is None:
        scaling_factors = {
            1: 1.0, 2: 1.85, 4: 3.4, 8: 6.0, 16: 9.5,
        }
    results = []
    for gpu_count in gpu_counts:
        scale = scaling_factors.get(gpu_count, gpu_count * 0.7)
        effective_time = base_time_hours / scale
        total_cost = effective_time * base_price * gpu_count
        cost_per_perf = total_cost / scale
        results.append({
            "gpu_count": gpu_count,
            "scaling_factor": scale,
            "efficiency_pct": (scale / gpu_count) * 100,
            "time_hours": effective_time,
            "total_cost_usd": total_cost,
            "cost_per_perf": cost_per_perf,
        })
    optimal = min(results, key=lambda r: r["cost_per_perf"])
    return {
        "gpu_type": gpu_type, "base_price_per_hour": base_price,
        "base_time_hours": base_time_hours, "results": results,
        "optimal_gpu_count": optimal["gpu_count"],
        "optimal_cost": optimal["total_cost_usd"],
    }

base_training_time = fp32_total_time / 3600
if base_training_time < 0.001:
    base_training_time = 2.0

test_gpu_counts = [1, 2, 4, 8]
analysis = analyze_multi_gpu_cost(base_training_time, detected_type, test_gpu_counts)

print("\\nMulti-GPU Cost Analysis for", detected_type)
print("   Base training time (1 GPU): {:.4f} hours".format(base_training_time))
print("   GPU price: $ {:.2f}/hr".format(analysis['base_price_per_hour']))
print("\\n{:<6} {:<10} {:<12} {:<12} {:<14} {:<12}".format(
    'GPUs', 'Scaling', 'Efficiency', 'Time (hrs)', 'Total Cost', 'Cost/Perf'))
print("-" * 68)
for r in analysis["results"]:
    print("{:<6} {:<10.2f}x {:<11.1f}% {:<12.4f} $ {:<13.6f} $ {:<11.6f}".format(
        r['gpu_count'], r['scaling_factor'], r['efficiency_pct'],
        r['time_hours'], r['total_cost_usd'], r['cost_per_perf']))

print("\\nOptimal config: {}x {} at $ {:.6f}".format(
    analysis['optimal_gpu_count'], detected_type, analysis['optimal_cost']))

fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(14, 5))
gpu_counts = [r["gpu_count"] for r in analysis["results"]]
costs = [r["total_cost_usd"] for r in analysis["results"]]
efficiencies = [r["efficiency_pct"] for r in analysis["results"]]
times = [r["time_hours"] for r in analysis["results"]]

ax1.bar(range(len(gpu_counts)), costs, color='#2196F3')
ax1.set_xlabel('GPU Count')
ax1.set_ylabel('Total Cost (USD)')
ax1.set_title('Multi-GPU Cost (' + detected_type + ')')
ax1.set_xticks(range(len(gpu_counts)))
ax1.set_xticklabels(gpu_counts)
for i, (c, t) in enumerate(zip(costs, times)):
    ax1.text(i, c, '{:.3f}h'.format(t), ha='center', va='bottom', fontsize=8)

ax2.plot(gpu_counts, efficiencies, 'g-o', linewidth=2, markersize=10)
ax2.axhline(y=100, color='gray', linestyle='--', alpha=0.5, label='Linear (100%)')
ax2.set_xlabel('GPU Count')
ax2.set_ylabel('Scaling Efficiency (%)')
ax2.set_title('GPU Scaling Efficiency')
ax2.set_ylim(0, 110)
ax2.legend()
ax2.grid(True, alpha=0.3)

plt.tight_layout()
plt.savefig('multi_gpu_scaling.png', dpi=150, bbox_inches='tight')
plt.show()
print("Chart saved as multi_gpu_scaling.png")`;

  await page.keyboard.insertText(code);
  await page.waitForTimeout(500);
  await page.keyboard.press('Shift+Enter');
  return "Cell 27 implemented and running";
}