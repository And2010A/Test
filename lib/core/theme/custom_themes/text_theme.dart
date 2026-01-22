import 'package:flutter/material.dart';

import '../../constants/app_typography.dart';
import '../app_colors.dart';
class TTextTheme {
  TTextTheme._();
  static const TextTheme _baseTextTheme = TextTheme(
    // Body
    bodyMedium: TextStyle(
      fontSize: AppTypography.fontSizeSm,
      height: AppTypography.heightSm,
      fontWeight: AppTypography.w400,
    ),
    bodyLarge: TextStyle(
      fontSize: AppTypography.fontSizeMd,
      height: AppTypography.heightMd,
      fontWeight: AppTypography.w400,
    ),

    // Titles
    titleMedium: TextStyle(
      fontSize: AppTypography.fontSizeMd,
      height: AppTypography.heightMd,
      fontWeight: AppTypography.w600,
    ),
    titleLarge: TextStyle(
      fontSize: AppTypography.fontSizeXl,
      height: AppTypography.heightXl,
      fontWeight: AppTypography.w600,
    ),

    // Headlines
    headlineSmall: TextStyle(
      fontSize: AppTypography.fontSize2xl,
      height: AppTypography.height2xl,
      fontWeight: AppTypography.w700,
    ),

    // Labels (buttons, chips, etc.)
    labelLarge: TextStyle(
      fontSize: AppTypography.fontSizeMd,
      height: AppTypography.heightMd,
      fontWeight: AppTypography.w600,
    ),
    labelMedium: TextStyle(
      fontSize: AppTypography.fontSizeSm,
      height: AppTypography.heightSm,
      fontWeight: AppTypography.w600,
    ),
  );

  /// Light theme colors.
  static final TextTheme lightTextTheme = _baseTextTheme.apply(
    bodyColor: AppColors.grey[900]!,
    displayColor: AppColors.grey[900]!,
  );

  /// Dark theme placeholder
  static TextTheme darkTextTheme = _baseTextTheme.apply(
    bodyColor: Colors.white,
    displayColor: Colors.white,
  );
}