import 'package:flutter/material.dart';
class AppColors {
  AppColors._();

  /// Brand primary palette (50..900).
  ///
  /// `primary.shade500` is the base brand color.
  static const MaterialColor primary = MaterialColor(
    0xFFF84416,
    <int, Color>{
      50: Color(0xFFFB987F),
      100: Color(0xFFFB8F73),
      200: Color(0xFFFA7C5C),
      300: Color(0xFFF96945),
      400: Color(0xFFF9572D),
      500: Color(0xFFF84416),
      600: Color(0xFFDF3D14),
      700: Color(0xFFC63612),
      800: Color(0xFFAE300F),
      900: Color(0xFF95290D),
    },
  );

  /// Standard neutral palette.
  static const MaterialColor grey = Colors.grey;

  // Basic colors
  static const Color white = Colors.white;
  static const Color black = Colors.black;

  // App-specific neutrals (non-standard greys used by components)
  static const Color googleBorder = Color(0xFFE5E5E5);
  static const Color ghostForeground = Color(0xFF575757);

  // Semantic convenience getters
  static Color get disabledBackground => grey.shade400;
  static Color get disabledForeground => grey.shade600;
  static Color get disabledBorder => grey.shade300;
}
