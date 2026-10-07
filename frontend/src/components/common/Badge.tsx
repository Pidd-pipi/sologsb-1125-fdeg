import { Chip, Stack, Tooltip } from '@mui/material';
import {
  CATEGORY_LABELS,
  CHEMICAL_GROUP_LABELS,
  type ChemicalGroup,
  type SampleCategory,
} from '../../types/sample';
import { categoryColor } from '../../utils/format';

interface ClassificationBadgeProps {
  category: SampleCategory;
  group?: ChemicalGroup;
  size?: 'small' | 'medium';
  showGroup?: boolean;
  /** 推导结论与入藏登记分类不一致时展示待裁定标记 */
  pendingReview?: boolean;
  /** 当前认定推导出的分类（用于待裁定提示） */
  derivedCategory?: SampleCategory;
}

/** 分类与化学群着色标签：被 / 、/analysis、/locations 消费 */
export function ClassificationBadge({
  category,
  group,
  size = 'small',
  showGroup = true,
  pendingReview = false,
  derivedCategory,
}: ClassificationBadgeProps) {
  const color = categoryColor(category);
  return (
    <Stack direction="row" spacing={0.75} alignItems="center" flexWrap="wrap" useFlexGap>
      <Chip
        size={size}
        label={CATEGORY_LABELS[category] ?? category}
        sx={{
          bgcolor: color,
          color: '#fff',
          fontWeight: 600,
          letterSpacing: '0.02em',
          '& .MuiChip-label': { px: 1 },
        }}
      />
      {showGroup && group ? (
        <Tooltip title="化学群">
          <Chip
            size={size}
            variant="outlined"
            label={CHEMICAL_GROUP_LABELS[group] ?? group}
            sx={{ borderColor: color, color: 'text.primary', '& .MuiChip-label': { px: 1 } }}
          />
        </Tooltip>
      ) : null}
      {pendingReview ? (
        <Tooltip
          title={`当前认定推导为「${
            derivedCategory ? (CATEGORY_LABELS[derivedCategory] ?? derivedCategory) : '未定'
          }」，与入藏登记分类不一致，先照登记值展示，待裁定`}
        >
          <Chip
            size={size}
            color="warning"
            variant="outlined"
            label="待裁定"
            sx={{ fontWeight: 600, '& .MuiChip-label': { px: 1 } }}
          />
        </Tooltip>
      ) : null}
    </Stack>
  );
}

export default ClassificationBadge;
