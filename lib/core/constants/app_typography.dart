import 'package:flutter/widgets.dart';

class AppTypography {
  AppTypography._();

  // Font weights (semantic)
  static const FontWeight regular = FontWeight.w400;
  static const FontWeight medium = FontWeight.w500;
  static const FontWeight semiBold = FontWeight.w600;
  static const FontWeight bold = FontWeight.w700;

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
