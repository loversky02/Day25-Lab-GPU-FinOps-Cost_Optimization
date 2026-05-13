async (page) => {
  const editors = await page.locator('.cm-content').all();
  let targetEditor = null;

  for (const editor of editors) {
    const text = await editor.textContent();
    if (text.includes('create_advanced_finops_dashboard') && text.includes('TODO')) {
      targetEditor = editor;
      break;
    }
  }

  if (!targetEditor) return "Cell 30 editor not found";

  await targetEditor.click();
  await page.waitForTimeout(300);
  await page.keyboard.press('Control+a');
  await page.waitForTimeout(200);

  const code = `# Cell 30: Integrated Cost Dashboard
print("=" * 60)
print("EXERCISE 8.5.4: Integrated Cost Dashboard")
print("=" * 60)

def create_advanced_finops_dashboard(multi_gpu_analysis, project_forecast, optimization_recommendations):
    """
    Create comprehensive 6-panel dashboard combining all Part 8.5 analyses.
    """
    fig, axes = plt.subplots(2, 3, figsize=(18, 12))
    fig.suptitle('Advanced GPU FinOps Dashboard', fontsize=16, fontweight='bold', y=0.98)

    # Plot 1: Multi-GPU cost curve
    ax1 = axes[0, 0]
    if multi_gpu_analysis:
        gpu_counts = [r["gpu_count"] for r in multi_gpu_analysis["results"]]
        costs = [r["total_cost_usd"] for r in multi_gpu_analysis["results"]]
        ax1.plot(gpu_counts, costs, 'b-o', linewidth=2, markersize=8)
        ax1.fill_between(gpu_counts, costs, alpha=0.2, color='#2196F3')
        opt_idx = costs.index(min(costs))
        ax1.annotate('Optimal', (gpu_counts[opt_idx], costs[opt_idx]),
                    xytext=(0, -20), textcoords='offset points',
                    ha='center', fontsize=9, color='red')
        ax1.set_xlabel('GPU Count')
        ax1.set_ylabel('Total Cost (USD)')
        ax1.set_title('Multi-GPU Cost Optimization')
        ax1.grid(True, alpha=0.3)

    # Plot 2: Scaling efficiency
    ax2 = axes[0, 1]
    if multi_gpu_analysis:
        efficiencies = [r["efficiency_pct"] for r in multi_gpu_analysis["results"]]
        ax2.bar(gpu_counts, efficiencies, color='#4CAF50', alpha=0.8)
        ax2.axhline(y=100, color='gray', linestyle='--', alpha=0.5, label='Linear')
        ax2.set_xlabel('GPU Count')
        ax2.set_ylabel('Efficiency (%)')
        ax2.set_title('GPU Scaling Efficiency')
        ax2.set_ylim(0, 110)
        ax2.legend(fontsize=8)

    # Plot 3: Project forecast with confidence intervals
    ax3 = axes[0, 2]
    if project_forecast:
        names = [p["name"][:12] for p in project_forecast["phases"]]
        base = [p["base_cost"] for p in project_forecast["phases"]]
        low_err = [p["base_cost"] - p["low_est"] for p in project_forecast["phases"]]
        high_err = [p["high_est"] - p["base_cost"] for p in project_forecast["phases"]]
        x = range(len(names))
        ax3.bar(x, base, color=['#2196F3', '#FF9800', '#4CAF50', '#9C27B0'], alpha=0.8)
        ax3.errorbar(x, base, yerr=[low_err, high_err], fmt='none', ecolor='black', capsize=5)
        ax3.set_xticks(x)
        ax3.set_xticklabels(names, rotation=20, ha='right', fontsize=7)
        ax3.set_ylabel('Cost (USD)')
        ax3.set_title('Project Forecast with CI')

    # Plot 4: Phase breakdown (pie)
    ax4 = axes[1, 0]
    if project_forecast:
        labels = [p["name"][:15] for p in project_forecast["phases"]]
        sizes = [p["base_cost"] for p in project_forecast["phases"]]
        ax4.pie(sizes, labels=labels, autopct='%1.0f%%', colors=['#2196F3', '#FF9800', '#4CAF50', '#9C27B0'])
        ax4.set_title('Phase Cost Distribution')

    # Plot 5: Optimization prioritization (horizontal bar)
    ax5 = axes[1, 1]
    if optimization_recommendations:
        names = [s["name"][:25] for s in optimization_recommendations["strategies"]]
        scores = [s["priority_score"] for s in optimization_recommendations["strategies"]]
        savings_pcts = [s["savings_pct"]*100 for s in optimization_recommendations["strategies"]]
        colors_bar = ['#4CAF50' if s["implementation_effort"] == "LOW" else
                      '#FF9800' if s["implementation_effort"] == "MEDIUM" else '#F44336'
                      for s in optimization_recommendations["strategies"]]
        y_pos = range(len(names))
        ax5.barh(y_pos, savings_pcts, color=colors_bar, alpha=0.8)
        ax5.set_yticks(y_pos)
        ax5.set_yticklabels(names, fontsize=7)
        ax5.set_xlabel('Savings (%)')
        ax5.set_title('Optimization Priorities')

    # Plot 6: Cumulative savings
    ax6 = axes[1, 2]
    if optimization_recommendations:
        steps = ['Start'] + [s["name"][:10] for s in optimization_recommendations["strategies"]]
        cumul = [optimization_recommendations["baseline_cost"]]
        cumul += [s["cumulative_cost"] for s in optimization_recommendations["strategies"]]
        ax6.fill_between(range(len(steps)), cumul, alpha=0.4, color='#2196F3')
        ax6.plot(range(len(steps)), cumul, 'b-o', linewidth=2, markersize=6)
        ax6.set_xticks(range(len(steps)))
        ax6.set_xticklabels(steps, rotation=45, ha='right', fontsize=6)
        ax6.set_ylabel('Cost (USD)')
        ax6.set_title('Cost Reduction Roadmap')
        ax6.grid(True, alpha=0.3)

    plt.tight_layout(rect=[0, 0, 1, 0.95])
    plt.savefig('advanced_finops_dashboard.png', dpi=150, bbox_inches='tight')
    plt.show()
    print("Advanced FinOps Dashboard created")
    print("Chart saved as advanced_finops_dashboard.png")
    return fig

# Create the dashboard using results from previous exercises
dashboard = create_advanced_finops_dashboard(
    multi_gpu_analysis=analysis,           # from Cell 27
    project_forecast=forecast,             # from Cell 28
    optimization_recommendations=result    # from Cell 29
)

print("\\nDashboard Summary:")
print("  Multi-GPU: Optimal at {}x {} ($ {:.4f})".format(
    analysis['optimal_gpu_count'], analysis['gpu_type'], analysis['optimal_cost']))
print("  Project Forecast: Expected $ {:.2f} (range: $ {:.2f} - $ {:.2f})".format(
    forecast['expected_case'], forecast['confidence_interval'][0], forecast['confidence_interval'][1]))
print("  Optimization: {:.1f}% potential savings ($ {:.2f} -> $ {:.2f})".format(
    result['optimization_pct'], result['baseline_cost'], result['final_optimized_cost']))`;

  await page.keyboard.insertText(code);
  await page.waitForTimeout(500);
  await page.keyboard.press('Shift+Enter');
  return "Cell 30 implemented and running";
}