import { Box, Card, CardActionArea, CardContent, Chip, Stack, Tooltip, Typography } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import {
  CATEGORY_LABELS,
  FALL_OR_FIND_LABELS,
  WEATHERING_LABELS,
  type MeteoriteSample,
} from '../../types/sample';
import type { FindRecord } from '../../types/find';
import { formatWeight } from '../../utils/format';
import { formatCoordinate } from '../../utils/geo';
import { ClassificationBadge } from './Badge';

interface SampleCardProps {
  sample: MeteoriteSample;
  find?: FindRecord;
  sectionCount?: number;
  analysisCount?: number;
  /** 当前认定推导出的分类与登记不一致时，展示待裁定角标 */
  derivedCategory?: MeteoriteSample['category'];
  to?: string;
}

/** 样本摘要卡片：被 / 与 /samples/:id 消费 */
export function SampleCard({
  sample,
  find,
  sectionCount = 0,
  analysisCount = 0,
  derivedCategory,
  to,
}: SampleCardProps) {
  const missing: string[] = [];
  if (!find) missing.push('缺坐标');
  if (sectionCount === 0) missing.push('缺切片');

  // 与入藏登记分类对不上：先照登记值展示，标成待裁定
  const pending = derivedCategory !== undefined && derivedCategory !== sample.category;

  return (
    <Card
      variant="outlined"
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        borderRadius: 2.5,
        transition: 'box-shadow .2s ease, transform .2s ease',
        '&:hover': { boxShadow: 4, transform: 'translateY(-2px)' },
      }}
    >
      <CardActionArea
        component={RouterLink}
        to={to ?? `/samples/${sample.id}`}
        sx={{ flex: 1, alignItems: 'stretch' }}
      >
        <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 1.25, height: '100%' }}>
          <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={1}>
            <Box>
              <Typography variant="overline" color="text.secondary" lineHeight={1.2}>
                样本编号
              </Typography>
              <Typography variant="h6" fontWeight={700} letterSpacing="0.02em">
                {sample.sampleNo}
              </Typography>
            </Box>
            <Typography variant="h6" fontWeight={700} color="primary.main" whiteSpace="nowrap">
              {formatWeight(sample.totalWeight)}
            </Typography>
          </Stack>

          <Stack direction="row" spacing={0.75} alignItems="center" flexWrap="wrap" useFlexGap>
            <ClassificationBadge category={sample.category} group={sample.chemicalGroup} />
            {pending ? (
              <Tooltip
                title={`当前认定推导为「${CATEGORY_LABELS[derivedCategory]}」，与入藏登记不一致，待裁定`}
              >
                <Chip size="small" color="warning" variant="outlined" label="待裁定" />
              </Tooltip>
            ) : null}
          </Stack>

          <Typography variant="body2" color="text.secondary">
            {FALL_OR_FIND_LABELS[sample.fallOrFind]} · {WEATHERING_LABELS[sample.weathering]}
          </Typography>

          <Typography variant="body2" color="text.secondary">
            发现地：{find ? `${find.region} · ${find.placeName}` : '未登记'}
          </Typography>

          {find ? (
            <Typography variant="caption" color="text.secondary">
              {formatCoordinate(find.longitude, find.latitude)} · 来源
              {find.coordinateSource === 'gps' ? 'GPS' : '文献'}
            </Typography>
          ) : null}

          <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap sx={{ mt: 'auto', pt: 1 }}>
            <Chip size="small" variant="outlined" label={`切片 ${sectionCount}`} />
            <Chip size="small" variant="outlined" label={`检测 ${analysisCount}`} />
            {missing.map((m) => (
              <Chip key={m} size="small" color="warning" label={m} />
            ))}
          </Stack>
        </CardContent>
      </CardActionArea>
    </Card>
  );
}

export default SampleCard;
