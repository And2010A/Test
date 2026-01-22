import 'package:flutter/material.dart';

import '../../constants/app_typography.dart';

class TTextTheme {
  TTextTheme._();

  // Base styles
  static const TextStyle _baseHeadline = TextStyle(
    fontWeight: FontWeight.bold,
    color: Colors.black,
  );

  static const TextStyle _baseLabel = TextStyle(
    fontSize: AppFontSizes.h5,
    fontWeight: FontWeight.w600,
    height: AppLineHeights.h5 / AppFontSizes.h5,
  );

  // Light only
  static final TextTheme lightTextTheme = TextTheme(
    // Headings
    headlineLarge: _baseHeadline.copyWith(
      fontSize: AppFontSizes.h2,
      height: AppLineHeights.h2 / AppFontSizes.h2,
    ),
    headlineMedium: _baseHeadline.copyWith(
      fontSize: AppFontSizes.h3,
      height: AppLineHeights.h3 / AppFontSizes.h3,
    ),

    // Buttons
    labelLarge: _baseLabel,
  );
}
