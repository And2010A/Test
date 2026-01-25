import 'package:flutter/material.dart';

import '../../constants/app_typography.dart';
import '../../theme/app_colors.dart';
import '../../theme/custom_themes/elevated_button_theme.dart';

// button style type
enum ButtonVariant {
  primary,
  secondary,
  ghost,
  google,
}

// button size type
enum ButtonSize {
  large,
  medium,
  small,
}

// icon position type
enum IconPosition {
  left,
  right,
}

class AppButton extends StatelessWidget {
  final String? text;
  final Widget? icon;
  final VoidCallback? onPressed;
  final ButtonVariant variant;
  final ButtonSize size;
  final IconPosition iconPosition;
  final bool fullWidth;
  final bool isDisabled;

  const AppButton({
    Key? key,
    this.text,
    this.icon,
    required this.onPressed,
    this.variant = ButtonVariant.primary,
    this.size = ButtonSize.medium,
    this.iconPosition = IconPosition.left,
    this.fullWidth = true,
    this.isDisabled = false,
  })  : assert(text != null || icon != null,
            'Either text or icon must be provided'),
        super(key: key);

  double get _height {
    const map = {
      ButtonSize.large: AppButtonSizes.large,
      ButtonSize.medium: AppButtonSizes.medium,
      ButtonSize.small: AppButtonSizes.small,
    };
    return map[size]!;
  }

  TextStyle _textStyle(BuildContext context, Color color) {
    final base = Theme.of(context).textTheme.labelLarge ??
        const TextStyle(
          fontSize: AppTypography.fontSizeMd,
          height: AppTypography.heightMd,
          fontWeight: AppTypography.semiBold,
        );

    return base.copyWith(
      color: color,
      fontWeight: AppTypography.medium,
    );
  }

  Color get _primaryColor => AppColors.primary.shade500;
  Color get _googleBorder => AppColors.googleBorder;
  Color get _ghostColor => AppColors.ghostForeground;

  Color get _backgroundColor {
    if (isDisabled) {
      switch (variant) {
        case ButtonVariant.primary:
          return AppColors.disabledBackground;
        case ButtonVariant.secondary:
        case ButtonVariant.ghost:
        case ButtonVariant.google:
          return Colors.transparent;
      }
    }
    switch (variant) {
      case ButtonVariant.primary:
        return _primaryColor;
      case ButtonVariant.secondary:
        return Colors.transparent;
      case ButtonVariant.ghost:
        return Colors.transparent;
      case ButtonVariant.google:
        return AppColors.white;
    }
  }

  Color get _foregroundColor {
    if (isDisabled) {
      return AppColors.disabledForeground;
    }
    switch (variant) {
      case ButtonVariant.primary:
        return AppColors.white;
      case ButtonVariant.secondary:
        return AppColors.grey.shade900;
      case ButtonVariant.ghost:
        return _ghostColor;
      case ButtonVariant.google:
        return AppColors.grey.shade900;
    }
  }

  BorderSide get _side {
    if (isDisabled) {
      return BorderSide(color: AppColors.disabledBorder, width: 0);
    }
    switch (variant) {
      case ButtonVariant.primary:
        return const BorderSide(color: Colors.transparent, width: 0);
      case ButtonVariant.secondary:
        return BorderSide(color: AppColors.grey.shade600, width: 1);
      case ButtonVariant.ghost:
        return const BorderSide(color: Colors.transparent, width: 0);
      case ButtonVariant.google:
        return BorderSide(color: _googleBorder, width: 1);
    }
  }

  double get _iconSize => 24;

  @override
  Widget build(BuildContext context) {
    final radius = BorderRadius.circular(12);
    final bgColor = _backgroundColor;
    final fgColor = _foregroundColor;
    final borderSide = _side;
    final hasText = text != null && text!.isNotEmpty;
    final hasIcon = icon != null;

    Widget child;

    if (hasText && hasIcon) {
      final Widget sizedIcon = SizedBox(
        width: _iconSize,
        height: _iconSize,
        child: Center(
          child: IconTheme(
            data: IconThemeData(color: fgColor),
            child: icon!,
          ),
        ),
      );

      final content = <Widget>[
        if (iconPosition == IconPosition.left) ...[
          sizedIcon,
          const SizedBox(width: 4),
          Text(text!, style: _textStyle(context, fgColor)),
        ] else ...[
          Text(text!, style: _textStyle(context, fgColor)),
          const SizedBox(width: 4),
          sizedIcon,
        ],
      ];

      child = Row(
        mainAxisSize: fullWidth ? MainAxisSize.max : MainAxisSize.min,
        mainAxisAlignment: MainAxisAlignment.center,
        crossAxisAlignment: CrossAxisAlignment.center,
        children: content,
      );
    } else if (hasText) {
      child = Center(
        child: Text(
          text!,
          style: _textStyle(context, fgColor),
        ),
      );
    } else {
      final Widget sizedIcon = SizedBox(
        width: _iconSize,
        height: _iconSize,
        child: Center(
          child: IconTheme(
            data: IconThemeData(color: fgColor),
            child: icon!,
          ),
        ),
      );
      child = Row(
        mainAxisSize: MainAxisSize.min,
        mainAxisAlignment: MainAxisAlignment.center,
        children: [sizedIcon],
      );
    }

    final paddedContent = ConstrainedBox(
      constraints: BoxConstraints(
        minHeight: _height,
      ),
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
        child: child,
      ),
    );

    final materialChild = Material(
      color: bgColor,
      shape: RoundedRectangleBorder(
        borderRadius: radius,
        side: borderSide,
      ),
      child: InkWell(
        borderRadius: radius,
        onTap: isDisabled ? null : onPressed,
        child: paddedContent,
      ),
    );

    if (fullWidth) {
      return SizedBox(
        width: double.infinity,
        child: materialChild,
      );
    } else {
      return Align(
        alignment: Alignment.centerLeft,
        child: materialChild,
      );
    }
  }
}
