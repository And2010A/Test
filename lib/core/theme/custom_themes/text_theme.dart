import 'package:flutter/material.dart';
class TTextTheme {
  TTextTheme._();

  // Base styles
  static const TextStyle _baseHeadline = TextStyle(
    fontWeight: FontWeight.bold,
    color: Colors.black,
  );
  static const TextStyle _baseLabel = TextStyle(
    fontSize: 16.0,
    fontWeight: FontWeight.w600,
    height: 24 / 16,
  );

  // Light only
  static final TextTheme lightTextTheme = TextTheme(
    headlineLarge: _baseHeadline.copyWith(fontSize: 32.0),
    headlineMedium: _baseHeadline.copyWith(fontSize: 24.0),

    // Buttons
    labelLarge: _baseLabel,
  );
}
