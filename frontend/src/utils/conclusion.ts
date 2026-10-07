import type { AnalysisRecord } from '../types/analysis';
import type { MeteoriteSample, SampleCategory } from '../types/sample';
import { classifyByAnalysis } from './classify';

/**
 * 检测记录新旧次序：先按检测日期，日期相同再按入档时间。
 * 升级迁移时「最新一条当当前认定」与运行期排序共用这一把尺子。
 */
export function isNewerAnalysis(a: AnalysisRecord, b: AnalysisRecord): boolean {
  if (a.testedAt !== b.testedAt) return a.testedAt > b.testedAt;
  return a.createdAt > b.createdAt;
}

/** 排序比较器：新记录在前（先检测日期、后入档时间） */
export function compareAnalysisDesc(a: AnalysisRecord, b: AnalysisRecord): number {
  if (a.testedAt !== b.testedAt) return a.testedAt < b.testedAt ? 1 : -1;
  return b.createdAt - a.createdAt;
}

/**
 * 取同一样本的当前认定记录：
 * 优先取显式标记为 current 的一条；数据异常（全为历史）时兜底取最新一条。
 */
export function pickCurrentAnalysis(records: AnalysisRecord[]): AnalysisRecord | undefined {
  if (records.length === 0) return undefined;
  const current = records.filter((r) => r.status !== 'history');
  const pool = current.length ? current : records;
  return pool.reduce((latest, r) => (isNewerAnalysis(r, latest) ? r : latest), pool[0]);
}

/** 样本分类结论：由当前认定检测记录推导；无检测记录时为 null */
export interface SampleConclusion {
  /** 当前认定检测记录 */
  current: AnalysisRecord;
  /** 由当前认定推导出的分类 */
  derivedCategory: SampleCategory;
  /** 入藏登记的分类 */
  registeredCategory: SampleCategory;
  /** 推导分类与入藏登记是否一致；不一致时展示登记值并标成待裁定 */
  pending: boolean;
}

/** 依据当前认定检测记录推导单个样本的分类结论 */
export function deriveConclusion(
  sample: Pick<MeteoriteSample, 'category'>,
  records: AnalysisRecord[],
): SampleConclusion | null {
  const current = pickCurrentAnalysis(records);
  if (!current) return null;
  const derivedCategory = classifyByAnalysis(current).category;
  return {
    current,
    derivedCategory,
    registeredCategory: sample.category,
    pending: derivedCategory !== sample.category,
  };
}

/**
 * 批量构建 sampleId → 结论 的索引，供总览 / 切片库 / 发现地一次推导全量使用。
 * 检测记录改动（新增复测、改判当前认定、删除）后重算即可，不回写样本登记值。
 */
export function buildConclusionIndex(
  samples: Pick<MeteoriteSample, 'id' | 'category'>[],
  analysis: AnalysisRecord[],
): Map<string, SampleConclusion> {
  const bySample = new Map<string, AnalysisRecord[]>();
  for (const a of analysis) {
    const list = bySample.get(a.sampleId);
    if (list) list.push(a);
    else bySample.set(a.sampleId, [a]);
  }
  const index = new Map<string, SampleConclusion>();
  for (const sample of samples) {
    const records = bySample.get(sample.id);
    if (!records) continue;
    const conclusion = deriveConclusion(sample, records);
    if (conclusion) index.set(sample.id, conclusion);
  }
  return index;
}
