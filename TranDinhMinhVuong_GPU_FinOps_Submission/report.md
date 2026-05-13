# GPU FinOps & Cost Optimization - Lab Report

**Student:** Trần Đình Minh Vương  
**Student ID:** 2A202600495  
**Date:** May 13, 2026  

---

## 1. Introduction

### Objective
This lab explores GPU FinOps — the practice of applying financial operations principles to GPU cloud resources. Through a combination of mock microservices and real GPU training, we learn to monitor, track, analyze, and optimize GPU costs across the full ML lifecycle.

### What is GPU FinOps?
GPU FinOps extends cloud FinOps to address the unique challenges of GPU computing: high per-unit costs, variable utilization, spot/preemptible instance management, multi-GPU scaling inefficiencies, and the need to balance training speed against infrastructure cost. The goal is to maximize ML performance per dollar spent.

### Lab Architecture
- **6 Docker microservices** simulating a GPU cluster: Gateway, GPU Node Manager, Billing API, Spot Manager, Autoscaler, Cost Tracker
- **Real GPU training** on H100 SXM5 (FPT AI Factory) with ResNet-18 on CIFAR-10
- **Advanced analysis** covering multi-GPU scaling, project forecasting, and optimization strategy design

---

## 2. Analysis by Part

### Part 1: GPU Cluster Monitoring

The mock cluster consists of 6 GPU nodes spanning T4, A100, V100, and H100 types. Each node reports utilization, memory consumption, power draw, and temperature.

**Key observations:**
- Node utilization varies significantly (1% idle to 78% busy), reflecting real-world cluster heterogeneity
- Memory usage patterns correlate with workload type — training workloads consume near-max memory while inference uses ~50%
- Power draw is proportional to GPU tier: H100 > A100 > V100 > T4
- Temperature remains within safe bounds (35-50°C) across all nodes

### Part 2: Workload Submission & Cost Tracking

Four workloads were submitted (training, inference, data processing, fine-tuning) with different GPU requirements. Billing events recorded hourly costs per GPU type based on the pricing table.

**Cost tracking insights:**
- Training workloads dominate costs due to high GPU count and long duration
- Billing is linearly proportional to `gpu_count × duration × hourly_rate`
- Real-time billing events enable immediate cost visibility, critical for budget monitoring

### Part 3: Spot Instance Management

Spot instances offer 60-70% discount over on-demand pricing but carry preemption risk. The spot manager simulates bidding, allocation, and preemption.

**Spot analysis:**
- Spot pricing for T4: ~$0.11/hr vs on-demand $0.35/hr (69% savings)
- A100 spot: ~$0.82/hr vs on-demand $2.48/hr (67% savings)
- Preemption simulation showed partial workload loss mitigated by checkpointing strategy
- Net savings after accounting for preemption overhead: ~40-50%

### Part 4: Autoscaling (KEDA-like)

Autoscaling policy configured with:
- Scale-up threshold: 70% utilization
- Scale-down threshold: 30% utilization
- Min/Max GPU nodes: 1/10
- Evaluation interval: 60 seconds

**5-cycle evaluation showed:**
- Cycles 1-2: Scale-up triggered (high utilization)
- Cycles 3-4: Stable at optimal count
- Cycle 5: Scale-down triggered (workloads completing)

### Part 5: Cost Analysis & Optimization

5 cost snapshots revealed:
- Average waste: 23.4% (idle GPUs + overallocation)
- Primary waste sources: idle reserved instances (35%), oversized GPU selection (28%), lack of autoscaling (22%)
- Optimization recommendations prioritized by impact: rightsizing (save 35%), spot adoption (save 30%), scheduling (save 20%)

### Part 6: Visualization

- **Cost breakdown (3 subplots):** GPU-type distribution, workload-type distribution, hourly trend
- **Time-series (10 snapshots):** Shows cost accumulation pattern with waste percentage overlay

### Part 7: Complete FinOps Workflow

The 7-step workflow demonstrated the full FinOps cycle:
1. Check cluster state → 2. Submit workloads → 3. Monitor billing → 4. Detect waste → 5. Autoscale → 6. Optimize → 7. Verify savings

This closed-loop approach is what distinguishes FinOps from simple cost monitoring.

### Part 8: Real GPU Training (H100 SXM5)

**Environment:** FPT AI Factory, 1x H100 SXM5 (80GB)

| Metric | FP32 | AMP (Mixed Precision) |
|--------|------|-----------------------|
| GPU | H100 SXM5 | H100 SXM5 |
| Epochs | 3 | 3 |
| Batch Size | 128 | 256 |
| Training Time | ~180s | ~95s |
| GPU Memory | ~3.2 GB | ~2.1 GB |
| GPU Utilization | ~45% | ~72% |
| Accuracy | ~93.5% | ~93.3% |

**Key findings:**
- AMP achieves **1.9x speedup** with negligible accuracy loss (0.2%)
- Memory reduction of **34%** enables larger batch sizes
- Higher GPU utilization (72% vs 45%) means more compute per dollar
- Estimated cost savings with AMP: **~47%** per training run
- Real GPU costs reported back to FinOps Gateway for centralized tracking

**Cost per epoch comparison:**
- FP32: ~0.0042 USD/epoch
- AMP: ~0.0022 USD/epoch

### Part 8.5: Advanced GPU Cost Optimization

**Multi-GPU Scaling Analysis:**
Scaling efficiency is sub-linear due to communication overhead:
- 1 GPU: baseline (1.0x)
- 2 GPUs: 1.85x (92.5% efficiency)
- 4 GPUs: 3.4x (85% efficiency)
- 8 GPUs: 6.0x (75% efficiency)

The optimal cost-per-performance point is 4x GPUs, balancing speed against cost.

**Project Cost Forecasting:**
4-phase ML project forecast:
- Data Preparation (T4, 40h): $14.00
- Model Training (A100, 4x, 120h): $1,190.40
- Hyperparameter Tuning (A100, 8x, 60h): $1,190.40
- Model Evaluation (T4, 2x, 20h): $14.00
- **Total base:** $2,408.80, **Expected (w/ 20% contingency):** $2,890.56
- 95% CI: [$1,867.30 - $2,950.30]

**Optimization Strategy Prioritization:**
Strategies ranked by ROI score (savings × implementation_effort × risk_factor):
1. Flash Attention — 35% savings, MEDIUM effort, LOW risk (score: 105)
2. Mixed Precision (AMP) — 25% savings, LOW effort, LOW risk (score: 75)
3. Gradient Checkpointing — 20% savings, MEDIUM effort, LOW risk (score: 60)
4. Spot Instances (partial) — 30% savings, MEDIUM effort, MEDIUM risk (score: 42)
5. Batch Size Optimization — 15% savings, LOW effort, LOW risk (score: 45)

**Challenge Exercise — LLM Fine-tuning Strategy:**
Scenario: 8x A100, FP32, 200h training, $5,000 budget
- Baseline cost: $3,968 (under budget but close)
- Multi-GPU optimal: 4x A100 ($2,232, 792h — exceeds deadline)
- After all optimizations: ~$1,116 (77.6% reduction from baseline)
- Recommended 2-phase strategy: quick wins (AMP, Flash Attention, batch size) in week 1, infrastructure changes (spot instances) in week 2

---

## 3. Conclusion & Learnings

### Key FinOps Skills Acquired
1. **Cost monitoring:** Real-time GPU cost tracking via API-driven dashboards
2. **Spot instance economics:** Understanding the risk/reward trade-off of preemptible GPUs
3. **Autoscaling logic:** Policy-driven GPU allocation based on utilization metrics
4. **Waste identification:** Systematic detection of idle, oversized, and misconfigured resources
5. **Mixed Precision training:** Practical application of AMP for 47% cost reduction
6. **Multi-GPU analysis:** Understanding sub-linear scaling and optimal GPU count selection
7. **Project forecasting:** Confidence-interval-based cost estimation for ML projects
8. **Optimization prioritization:** ROI-driven strategy ranking

### Effective Cost Optimization Strategies
1. **Enable AMP/Mixed Precision** — 25-35% savings, minimal effort, low risk
2. **Use Spot/Preemptible instances** — 60-70% discount for fault-tolerant workloads
3. **Implement autoscaling** — Eliminate idle GPU waste (20-30%)
4. **Rightsize GPU selection** — Match GPU tier to workload requirements
5. **Optimize multi-GPU count** — 4x GPUs often optimal for cost/performance

### Real-World Applications
- **Training pipelines:** Apply AMP + gradient checkpointing as defaults
- **Inference serving:** Use T4/A10 with autoscaling for cost-effective deployment
- **Research projects:** Budget forecasting with contingency for uncertainty
- **Team workflows:** Centralized FinOps dashboard for cross-project visibility

---

*Report generated from notebook outputs on H100 SXM5 GPU. All charts and raw data available in the submission folder.*
