import 'package:flutter/widgets.dart';
class AppTypography {
  AppTypography._();

  // Font weights
  static const FontWeight w400 = FontWeight.w400; // Regular
  static const FontWeight w500 = FontWeight.w500; // Medium
  static const FontWeight w600 = FontWeight.w600; // SemiBold
  static const FontWeight w700 = FontWeight.w700; // Bold

  // Smallest
  static const double fontSizeSm = 14.0;
  static const double lineHeightSm = 20.0;
  static const double heightSm = lineHeightSm / fontSizeSm;

  static const double fontSizeMd = 16.0;
  static const double lineHeightMd = 24.0;
  static const double heightMd = lineHeightMd / fontSizeMd;

  static const double fontSizeLg = 18.0;
  static const double lineHeightLg = 28.0;
  static const double heightLg = lineHeightLg / fontSizeLg;

  static const double fontSizeXl = 20.0;
  static const double lineHeightXl = 28.0;
  static const double heightXl = lineHeightXl / fontSizeXl;

  // Largest
  static const double fontSize2xl = 24.0;
  static const double lineHeight2xl = 32.0;
  static const double height2xl = lineHeight2xl / fontSize2xl;
}
