import 'package:flutter/material.dart';

import '../../constants/app_typography.dart';
class TTextTheme {
  TTextTheme._();

  // Colors (from Figma)
  static const Color _primaryText = Color(0xFF1A1A1A);
  static const Color _secondaryText = Color(0xFF575757);
  static const Color _brandColor = Color(0xFFF84416);

  /// Expose the brand color for any custom text use-cases (links, highlights, etc.).
  static Color get brandColor => _brandColor;
  static final TextTheme _baseTextTheme = const TextTheme(
    // Body
    bodySmall: TextStyle(
      fontSize: AppTypography.fontSizeSm,
      height: AppTypography.heightSm,
      fontWeight: AppTypography.w400,
    ),
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
    titleSmall: TextStyle(
      fontSize: AppTypography.fontSizeLg,
      height: AppTypography.heightLg,
      fontWeight: AppTypography.w600,
    ),
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
    labelSmall: TextStyle(
      fontSize: AppTypography.fontSizeSm,
      height: AppTypography.heightSm,
      fontWeight: AppTypography.w500,
    ),
    labelMedium: TextStyle(
      fontSize: AppTypography.fontSizeSm,
      height: AppTypography.heightSm,
      fontWeight: AppTypography.w600,
    ),
    labelLarge: TextStyle(
      fontSize: AppTypography.fontSizeMd,
      height: AppTypography.heightMd,
      fontWeight: AppTypography.w600,
    ),
  );

  /// Light Theme
  /// - Primary text: 0xFF1A1A1A
  /// - Secondary text: 0xFF575757 (captions/lighter text)
  static final TextTheme lightTextTheme = () {
    final themed = _baseTextTheme.apply(
      bodyColor: _primaryText,
      displayColor: _primaryText,
      decorationColor: _primaryText,
    );

    return themed.copyWith(
      // Secondary text styles
      bodySmall: themed.bodySmall?.copyWith(color: _secondaryText),
      labelSmall: themed.labelSmall?.copyWith(color: _secondaryText),
    );
  }();

  /// Dark Theme (placeholder)
  ///
  /// Architecture supports dark mode; refine later.
  static final TextTheme darkTextTheme = _baseTextTheme.apply(
    bodyColor: Colors.white,
    displayColor: Colors.white,
    decorationColor: Colors.white,
  );
}
