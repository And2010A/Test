import 'package:flutter/material.dart';

class AppDimens {
  AppDimens._();
}

class AppTextStyles {
  AppTextStyles._();

  static const TextStyle baseHeadline = TextStyle(
    fontWeight: FontWeight.bold,
    color: Colors.black,
  );

  static final TextTheme lightTextTheme = TextTheme(
    headlineLarge: baseHeadline.copyWith(fontSize: 32.0),
    headlineMedium: baseHeadline.copyWith(fontSize: 24.0),
  );
}