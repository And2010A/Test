import 'package:flutter/material.dart';

import '../../../../core/constants/app_typography.dart';
import '../../../../core/presentation/widgets/app_button.dart';
import '../../../../core/theme/app_colors.dart';

class TypographyShowcase extends StatelessWidget {
  const TypographyShowcase({super.key});

  @override
  Widget build(BuildContext context) {
    final textTheme = Theme.of(context).textTheme;

    final pageHeaderStyle = textTheme.headlineSmall;

    final sectionHeaderStyle = textTheme.bodyMedium?.copyWith(
          color: AppColors.grey.shade900,
          fontWeight: AppTypography.semiBold,
        ) ??
        TextStyle(
          color: AppColors.grey.shade900,
          fontSize: AppTypography.fontSizeMd,
          height: AppTypography.heightMd,
          fontWeight: AppTypography.semiBold,
        );

    final labelStyle = textTheme.labelSmall?.copyWith(color: AppColors.grey.shade600);

    final noteLabelStyle = labelStyle ??
        TextStyle(
          color: AppColors.grey.shade600,
          fontSize: AppTypography.fontSizeSm,
          height: AppTypography.heightSm,
          fontWeight: AppTypography.regular,
        );

    void onPressed(String label) {
      debugPrint('Pressed: $label');
    }

    Widget buttonBlock({
      required String title,
      required Widget child,
    }) {
      return Padding(
        padding: const EdgeInsets.symmetric(vertical: 12),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(title, style: sectionHeaderStyle),
            const SizedBox(height: 8),
            child,
          ],
        ),
      );
    }

    Widget textLine(String text, {TextStyle? style}) {
      return Padding(
        padding: const EdgeInsets.symmetric(vertical: 6),
        child: Text(text, style: style),
      );
    }

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text('Typography', style: pageHeaderStyle),
        const SizedBox(height: 16),

        // Title Component (h1-h5)
        Text('Title Component', style: sectionHeaderStyle),
        const SizedBox(height: 8),
        textLine(
          'h1. Ant Design',
          style: textTheme.headlineSmall?.copyWith(fontWeight: AppTypography.bold),
        ),
        textLine(
          'h2. Ant Design',
          style: textTheme.headlineSmall?.copyWith(fontWeight: AppTypography.semiBold),
        ),
        textLine(
          'h3. Ant Design',
          style: textTheme.bodyMedium?.copyWith(fontWeight: AppTypography.semiBold),
        ),
        textLine(
          'h4. Ant Design',
          style: textTheme.bodyMedium?.copyWith(fontWeight: AppTypography.medium),
        ),
        textLine(
          'h5. Ant Design',
          style: textTheme.labelSmall?.copyWith(
            fontWeight: AppTypography.medium,
            color: AppColors.grey.shade900,
          ),
        ),

        const Divider(height: 32),

        // Buttons (match previous showcase)
        Text('Buttons', style: pageHeaderStyle),
        const SizedBox(height: 4),
        buttonBlock(
          title: 'Primary (full width)',
          child: AppButton(
            text: 'Save',
            variant: ButtonVariant.primary,
            size: ButtonSize.large,
            fullWidth: true,
            onPressed: () => onPressed('Save'),
          ),
        ),
        buttonBlock(
          title: 'Primary with icon (hug contents)',
          child: AppButton(
            text: 'Add',
            icon: const Icon(Icons.add),
            variant: ButtonVariant.primary,
            size: ButtonSize.medium,
            iconPosition: IconPosition.right,
            fullWidth: false,
            onPressed: () => onPressed('Add'),
          ),
        ),
        buttonBlock(
          title: 'Sign in with Google',
          child: AppButton(
            text: 'Sign in with Google',
            icon: Image.asset(
              'assets/google_logo.png',
              width: 24,
              height: 24,
            ),
            variant: ButtonVariant.google,
            size: ButtonSize.medium,
            iconPosition: IconPosition.left,
            fullWidth: true,
            onPressed: () => onPressed('Google'),
          ),
        ),
        buttonBlock(
          title: 'Back (ghost icon)',
          child: AppButton(
            icon: const Icon(Icons.arrow_back),
            variant: ButtonVariant.ghost,
            size: ButtonSize.large,
            fullWidth: false,
            onPressed: () => onPressed('Back'),
          ),
        ),

        const Divider(height: 32),

        Text('Note', style: noteLabelStyle),
        const SizedBox(height: 8),
        Stack(
          children: [
            TextField(
              maxLines: 4,
              style: textTheme.bodyMedium,
              cursorColor: AppColors.primary.shade500,
              decoration: InputDecoration(
                hintText: 'Write your note here...',
                hintStyle: noteLabelStyle,
                filled: true,
                fillColor: AppColors.white,
                // Extra bottom padding so text doesn't collide with the grip
                contentPadding: const EdgeInsets.fromLTRB(14, 12, 14, 26),
                enabledBorder: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                  borderSide: BorderSide(
                    color: AppColors.grey.shade200,
                    width: 1,
                  ),
                ),
                focusedBorder: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                  borderSide: BorderSide(
                    color: AppColors.primary.shade500,
                    width: 1.5,
                  ),
                ),
              ),
            ),
            Positioned(
              right: 10,
              bottom: 10,
              child: IgnorePointer(
                child: CustomPaint(
                  size: const Size(16, 16),
                  painter: _ResizeGripPainter(
                    color: AppColors.grey.shade600,
                  ),
                ),
              ),
            ),
          ],
        ),
      ],
    );
  }
}

class _ResizeGripPainter extends CustomPainter {
  final Color color;

  const _ResizeGripPainter({required this.color});

  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()
      ..color = color.withAlpha(115)
      ..strokeWidth = 1.6
      ..strokeCap = StrokeCap.round;

    // Two small diagonal strokes (like a textarea resize handle)
    canvas.drawLine(
      Offset(size.width * 0.45, size.height * 0.95),
      Offset(size.width * 0.95, size.height * 0.45),
      paint,
    );
    canvas.drawLine(
      Offset(size.width * 0.65, size.height * 0.95),
      Offset(size.width * 0.95, size.height * 0.65),
      paint,
    );
  }

  @override
  bool shouldRepaint(covariant _ResizeGripPainter oldDelegate) {
    return oldDelegate.color != color;
  }
}
