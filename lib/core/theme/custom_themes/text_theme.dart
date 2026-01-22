import 'package:flutter/material.dart';

import '../../constants/app_typography.dart';

/// App text theme that maps Material text styles to our design system tokens.
class TTextTheme {
  TTextTheme._();

  // Base styles
  static const TextStyle _base = TextStyle(
    color: Colors.black,
    fontWeight: FontWeight.w400,
  );

  static const TextStyle _baseTitle = TextStyle(
    color: Colors.black,
    fontWeight: FontWeight.w600,
  );

  static const TextStyle _baseHeadline = TextStyle(
    color: Colors.black,
    fontWeight: FontWeight.bold,
  );

  // Light only
  static final TextTheme lightTextTheme = TextTheme(
    // Body
    bodyMedium: _base.copyWith(
      fontSize: AppTypography.fontSizeSm,
      height: AppTypography.heightSm,
    ),
    bodyLarge: _base.copyWith(
      fontSize: AppTypography.fontSizeMd,
      height: AppTypography.heightMd,
    ),

    // Titles
    titleMedium: _baseTitle.copyWith(
      fontSize: AppTypography.fontSizeMd,
      height: AppTypography.heightMd,
    ),
    titleLarge: _baseTitle.copyWith(
      fontSize: AppTypography.fontSizeXl,
      height: AppTypography.heightXl,
    ),

    // Headlines
    headlineSmall: _baseHeadline.copyWith(
      fontSize: AppTypography.fontSize2xl,
      height: AppTypography.height2xl,
    ),

    // Labels (buttons, chips, etc.)
    labelLarge: _baseTitle.copyWith(
      fontSize: AppTypography.fontSizeMd,
      height: AppTypography.heightMd,
    ),
    labelMedium: _baseTitle.copyWith(
      fontSize: AppTypography.fontSizeSm,
      height: AppTypography.heightSm,
    ),
  );
}
