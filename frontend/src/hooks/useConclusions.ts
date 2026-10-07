import { useMemo } from 'react';
import { useSampleStore } from '../stores/sampleStore';
import { buildConclusionIndex, type SampleConclusion } from '../utils/conclusion';

/**
 * 全量样本分类结论索引（sampleId → 当前认定推导结论）。
 * 检测记录改动后 store 中的 analysis 立即变化，这里同步重算，
 * 总览、切片库、发现地分布与详情页消费同一份推导结果。
 */
export function useConclusions(): Map<string, SampleConclusion> {
  const samples = useSampleStore((s) => s.samples);
  const analysis = useSampleStore((s) => s.analysis);

  return useMemo(() => buildConclusionIndex(samples, analysis), [samples, analysis]);
}
