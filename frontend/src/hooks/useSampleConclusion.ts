import { useMemo } from 'react';
import { useSampleStore } from '../stores/sampleStore';
import { deriveSampleConclusion, type SampleConclusion } from '../utils/classify';

/**
 * 样本分类结论（由当前认定的检测记录推导）。
 * 检测记录入档 / 退档后 analysis 数组变化，结论随渲染立即重算，
 * 总览、详情与切片库共用同一份推导结果。
 */
export function useSampleConclusions(): Map<string, SampleConclusion> {
  const samples = useSampleStore((s) => s.samples);
  const analysis = useSampleStore((s) => s.analysis);
  return useMemo(() => {
    const map = new Map<string, SampleConclusion>();
    for (const s of samples) map.set(s.id, deriveSampleConclusion(s, analysis));
    return map;
  }, [samples, analysis]);
}

/** 单份样本的分类结论 */
export function useSampleConclusion(sampleId: string): SampleConclusion | null {
  const conclusions = useSampleConclusions();
  return conclusions.get(sampleId) ?? null;
}
