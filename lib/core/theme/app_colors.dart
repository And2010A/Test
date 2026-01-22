import 'package:flutter/material.dart';
class AppColors {
  AppColors._();
  static const MaterialColor primary = MaterialColor(
    0xFFF84416,
    <int, Color>{
      50: Color(0xFFFFF3ED),
      100: Color(0xFFFFE4D5),
      200: Color(0xFFFFC8AA),
      300: Color(0xFFFC8E75),
      400: Color(0xFFFA6B3D),
      500: Color(0xFFF84416), // Base Primary
      600: Color(0xFFE92B0D),
      700: Color(0xFFC11C0D),
      800: Color(0xFF991813),
      900: Color(0xFF7C1712),
      950: Color(0xFF430807),
    },
  );
  static const MaterialColor grey = MaterialColor(
    0xFF767676,
    <int, Color>{
      50: Color(0xFFFAFAFA),
      100: Color(0xFFF5F5F5),
      200: Color(0xFFE5E5E5),
      300: Color(0xFFD6D6D6),
      400: Color(0xFFA5A5A5),
      500: Color(0xFF767676),
      600: Color(0xFF575757),
      700: Color(0xFF434343),
      800: Color(0xFF292929),
      900: Color(0xFF1A1A1A),
      950: Color(0xFF0A0A0A),
    },
  );

  // Basic colors
  static const Color white = Colors.white;
  static const Color black = Colors.black;

  // Semantic convenience getters (reference actual design system values)
  static Color get googleBorder => grey[200]!;
  static Color get ghostForeground => grey[600]!;

  static Color get disabledBackground => grey[400]!;
  static Color get disabledForeground => grey[600]!;
  static Color get disabledBorder => grey[300]!;
}