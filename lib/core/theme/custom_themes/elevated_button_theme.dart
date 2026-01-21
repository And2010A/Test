import 'package:flutter/material.dart';

/// Button size constants
class AppButtonSizes {
  AppButtonSizes._();

  static const double large = 44.0;
  static const double medium = 40.0;
  static const double small = 32.0;
}

/// -- Light Elevated Button Theme
class TElevatedButtonTheme {
  TElevatedButtonTheme._(); // To avoid creating instances

  /// -- Light Theme
  static final lightElevatedButtonTheme = ElevatedButtonThemeData(
    style: ElevatedButton.styleFrom(
      elevation: 0,
      foregroundColor: Colors.white,
      backgroundColor: const Color(0xFFF84416), // App primary orange
      disabledForegroundColor: Colors.grey,
      disabledBackgroundColor: Colors.grey,
      side: const BorderSide(
        color: Color(0xFFF84416), // same orange
      ),
      padding: const EdgeInsets.symmetric(vertical: 18),
      minimumSize: Size.fromHeight(AppButtonSizes.medium),
      textStyle: const TextStyle(
        fontSize: 16,
        color: Colors.white,
        fontWeight: FontWeight.w600,
      ),
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(12),
      ),
    ),
  );
}