# Cell 27: Multi-GPU Cost Analysis
print("=" * 60)
print("EXERCISE 8.5.1: Multi-GPU Cost Analysis")
print("=" * 60)

def analyze_multi_gpu_cost(base_time_hours, gpu_type, gpu_counts, scaling_factors=None):
    """
    Analyze multi-GPU training costs with realistic sub-linear scaling.

    Parameters:
        base_time_hours (float): Single-GPU training time in hours
        gpu_type (str): GPU type (T4, A100, etc.)
        gpu_counts (list): List of GPU counts to analyze (e.g., [1, 2, 4, 8])
        scaling_factors (dict, optional): Scaling efficiency factors {gpu_count: efficiency}

    Returns:
        dict: Analysis with costs, times, and efficiency metrics
    """
    base_price = GPU_PRICING.get(gpu_type, GPU_PRICING["T4"])

    # Realistic scaling factors (sub-linear due to communication overhead)
    if scaling_factors is None:
        scaling_factors = {
            1: 1.0,
            2: 1.85,   # 92.5% efficiency
            4: 3.4,    # 85% efficiency
            8: 6.0,    # 75% efficiency
            16: 9.5,   # 59% efficiency
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
        "gpu_type": gpu_type,
        "base_price_per_hour": base_price,
        "base_time_hours": base_time_hours,
        "results": results,
        "optimal_gpu_count": optimal["gpu_count"],
        "optimal_cost": optimal["total_cost_usd"],
    }

# Test with real data
base_training_time = fp32_total_time / 3600  # convert seconds to hours
if base_training_time < 0.001:
    base_training_time = 2.0  # fallback for very short runs

test_gpu_counts = [1, 2, 4, 8]

analysis = analyze_multi_gpu_cost(base_training_time, detected_type, test_gpu_counts)

# Display results table
print(f"\nMulti-GPU Cost Analysis for {detected_type}")
print(f"   Base training time (1 GPU): {base_training_time:.4f} hours")
print(f"   GPU price: ${analysis['base_price_per_hour']:.2f}/hr")
print(f"\n{'GPUs':<6} {'Scaling':<10} {'Efficiency':<12} {'Time (hrs)':<12} {'Total Cost':<14} {'Cost/Perf':<12}")
print("-" * 68)
for r in analysis["results"]:
    print(f"{r['gpu_count']:<6} {r['scaling_factor']:<10.2f}x {r['efficiency_pct']:<11.1f}% {r['time_hours']:<12.4f} ${r['total_cost_usd']:<13.6f} ${r['cost_per_perf']:<11.6f}")

print(f"\nOptimal config: {analysis['optimal_gpu_count']}x {detected_type} at ${analysis['optimal_cost']:.6f}")

# Visualization
fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(14, 5))

gpu_counts = [r["gpu_count"] for r in analysis["results"]]
costs = [r["total_cost_usd"] for r in analysis["results"]]
efficiencies = [r["efficiency_pct"] for r in analysis["results"]]
times = [r["time_hours"] for r in analysis["results"]]

# Cost vs GPU count
ax1.bar(range(len(gpu_counts)), costs, color='#2196F3')
ax1.set_xlabel('GPU Count')
ax1.set_ylabel('Total Cost (USD)')
ax1.set_title(f'Multi-GPU Cost ({detected_type})')
ax1.set_xticks(range(len(gpu_counts)))
ax1.set_xticklabels(gpu_counts)
for i, (c, t) in enumerate(zip(costs, times)):
    ax1.text(i, c, f'{t:.3f}h', ha='center', va='bottom', fontsize=8)

# Scaling efficiency
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
print("Chart saved as multi_gpu_scaling.png")
