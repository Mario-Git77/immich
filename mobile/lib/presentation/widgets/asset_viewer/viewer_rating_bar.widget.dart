import 'package:flutter/material.dart';
import 'package:hooks_riverpod/hooks_riverpod.dart';
import 'package:immich_mobile/constants/enums.dart';
import 'package:immich_mobile/domain/models/asset/base_asset.model.dart';
import 'package:immich_mobile/presentation/widgets/asset_viewer/rating_bar.widget.dart';
import 'package:immich_mobile/providers/asset_viewer/asset_viewer.provider.dart';
import 'package:immich_mobile/providers/infrastructure/action.provider.dart';
import 'package:immich_mobile/providers/infrastructure/asset_viewer/asset.provider.dart';
import 'package:immich_mobile/providers/infrastructure/user_metadata.provider.dart';
import 'package:immich_mobile/providers/user.provider.dart';

class ViewerRatingBar extends ConsumerWidget {
  const ViewerRatingBar({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final isRatingEnabled = ref
        .watch(userMetadataPreferencesProvider)
        .maybeWhen(data: (prefs) => prefs?.ratingsEnabled ?? false, orElse: () => false);

    if (!isRatingEnabled) return const SizedBox.shrink();

    final asset = ref.watch(assetViewerProvider.select((s) => s.currentAsset));
    if (asset == null || asset is! RemoteAsset) return const SizedBox.shrink();

    final user = ref.watch(currentUserProvider);
    if (asset.ownerId != user?.id) return const SizedBox.shrink();

    final exif = ref.watch(assetExifProvider(asset)).valueOrNull;
    final rating = exif?.rating?.toDouble() ?? 0.0;

    return Padding(
      padding: const EdgeInsets.only(bottom: 4.0),
      child: RatingBar(
        key: ValueKey(asset.id),
        initialRating: rating,
        itemSize: 32.0,
        filledColor: Colors.amber,
        unfilledColor: Colors.white.withAlpha(100),
        starPadding: 2.0,
        showClearButton: false,
        onRatingUpdate: (value) async {
          await ref.read(actionProvider.notifier).updateRating(ActionSource.viewer, value);
        },
      ),
    );
  }
}
