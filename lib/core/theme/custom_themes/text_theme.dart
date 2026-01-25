import 'package:flutter/material.dart';

import '../../constants/app_typography.dart';
import '../app_colors.dart';

class TTextTheme {
  TTextTheme._();

  /// Brand color (Figma): #F84416.
  static Color get brandColor => AppColors.primary.shade500;

  /// Base structure (DRY): typography only.
  /// Important: do NOT set colors here.
  static const TextTheme _baseTextTheme = TextTheme(
    // Body
    bodySmall: TextStyle(
      fontSize: AppTypography.fontSizeSm,
      height: AppTypography.heightSm,
      fontWeight: AppTypography.regular,
    ),
    bodyMedium: TextStyle(
      fontSize: AppTypography.fontSizeMd,
      height: AppTypography.heightMd,
      fontWeight: AppTypography.regular,
    ),
    bodyLarge: TextStyle(
      fontSize: AppTypography.fontSizeLg,
      height: AppTypography.heightLg,
      fontWeight: AppTypography.regular,
    ),

    // Titles
    titleSmall: TextStyle(
      fontSize: AppTypography.fontSizeLg,
      height: AppTypography.heightLg,
      fontWeight: AppTypography.semiBold,
    ),
    titleMedium: TextStyle(
      fontSize: AppTypography.fontSizeMd,
      height: AppTypography.heightMd,
      fontWeight: AppTypography.semiBold,
    ),
    titleLarge: TextStyle(
      fontSize: AppTypography.fontSizeXl,
      height: AppTypography.heightXl,
      fontWeight: AppTypography.semiBold,
    ),

    // Headlines
    headlineSmall: TextStyle(
      fontSize: AppTypography.fontSize2xl,
      height: AppTypography.height2xl,
      fontWeight: AppTypography.bold,
    ),

    // Labels (buttons, chips, etc.)
    labelSmall: TextStyle(
      fontSize: AppTypography.fontSizeSm,
      height: AppTypography.heightSm,
      fontWeight: AppTypography.medium,
    ),
    labelMedium: TextStyle(
      fontSize: AppTypography.fontSizeSm,
      height: AppTypography.heightSm,
      fontWeight: AppTypography.semiBold,
    ),
    labelLarge: TextStyle(
      fontSize: AppTypography.fontSizeMd,
      height: AppTypography.heightMd,
      fontWeight: AppTypography.semiBold,
    ),
  );

  /// Light Theme
  static final TextTheme lightTextTheme = () {
    final themed = _baseTextTheme.apply(
      bodyColor: AppColors.grey.shade900,
      displayColor: AppColors.grey.shade900,
    );

    return themed.copyWith(
      // Secondary text styles
      bodySmall: themed.bodySmall?.copyWith(color: AppColors.grey.shade600),
      labelSmall: themed.labelSmall?.copyWith(color: AppColors.grey.shade600),
    );
  }();

  /// Dark Theme (placeholder)
  static final TextTheme darkTextTheme = _baseTextTheme.apply(
    bodyColor: AppColors.white,
    displayColor: AppColors.white,
  );
}
