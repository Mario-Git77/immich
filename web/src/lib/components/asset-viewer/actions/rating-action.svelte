<script lang="ts">
  import { shortcuts } from '$lib/actions/shortcut';
  import type { OnAction } from '$lib/components/asset-viewer/actions/action';
  import { AssetAction } from '$lib/constants';
  import { preferences } from '$lib/stores/user.store';
  import { handleError } from '$lib/utils/handle-error';
  import { toTimelineAsset } from '$lib/utils/timeline-util';
  import { updateAsset, type AssetResponseDto } from '@immich/sdk';
  import { t } from 'svelte-i18n';

  type Props = {
    asset: AssetResponseDto;
    onAction: OnAction;
  };

  let { asset, onAction }: Props = $props();

  const rateAsset = async (rating: number | null) => {
    try {
      await updateAsset({
        id: asset.id,
        updateAssetDto: {
          rating,
          ...(asset.isRejected ? { isRejected: false } : {}),
        },
      });

      asset = {
        ...asset,
        exifInfo: { ...asset.exifInfo, rating },
        ...(asset.isRejected ? { isRejected: false } : {}),
      };

      onAction({
        type: AssetAction.RATING,
        asset: toTimelineAsset(asset),
        rating,
      });
    } catch (error) {
      handleError(error, $t('errors.unable_to_set_rating'));
    }
  };

  const rejectAsset = async () => {
    try {
      const willBeRejected = !asset.isRejected;
      await updateAsset({
        id: asset.id,
        updateAssetDto: {
          isRejected: willBeRejected,
          ...(willBeRejected ? { rating: null } : {}),
        },
      });
      onAction({ type: AssetAction.REJECT, asset: toTimelineAsset(asset) });
    } catch (error) {
      handleError(error, $t('errors.unable_to_reject'));
    }
  };
</script>

<svelte:document
  use:shortcuts={$preferences?.ratings.enabled
    ? [
        { shortcut: { key: '0' }, onShortcut: () => rateAsset(null) },
        ...[1, 2, 3, 4, 5].map((rating) => ({
          shortcut: { key: String(rating) },
          onShortcut: () => rateAsset(rating),
        })),
        { shortcut: { key: 'x' }, onShortcut: rejectAsset },
      ]
    : []}
/>
