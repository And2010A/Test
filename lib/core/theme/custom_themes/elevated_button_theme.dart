import 'package:flutter/material.dart';

import '../app_colors.dart';
import 'text_theme.dart';

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
      foregroundColor: AppColors.white,
      backgroundColor: AppColors.primary.shade500,
      disabledForegroundColor: AppColors.disabledForeground,
      disabledBackgroundColor: AppColors.disabledBackground,
      side: BorderSide(
        color: AppColors.primary.shade500,
      ),
      padding: const EdgeInsets.symmetric(vertical: 18),
      minimumSize: Size.fromHeight(AppButtonSizes.medium),
      textStyle: TTextTheme.lightTextTheme.labelLarge,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(12),
      ),
    ),
  );
}
