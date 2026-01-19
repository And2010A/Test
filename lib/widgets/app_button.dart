import 'package:flutter/material.dart';

// button style type
enum ButtonVariant {
  primary,
  secondary,
  ghost,
  google, // google style
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
  // text label
  final String? text;
  // optional icon
  final Widget? icon;
  // tap callback
  final VoidCallback? onPressed;
  // style variant
  final ButtonVariant variant;
  // size preset
  final ButtonSize size;
  // icon side
  final IconPosition iconPosition;
  // full width or wrap
  final bool fullWidth;
  // disabled state
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

  // height per size
  double get _height {
    switch (size) {
      case ButtonSize.large:
        return 44;
      case ButtonSize.medium:
        return 40;
      case ButtonSize.small:
        return 32;
    }
  }

  // base text style (Google spec: 16, w500, 24 height)
  TextStyle _textStyle(Color color) {
    return TextStyle(
      color: color,
      fontSize: 16,
      fontWeight: FontWeight.w500,
      height: 24 / 16,
    );
  }

  // primary color #F84416
  Color _primaryColor(BuildContext context) {
    return const Color(0xFFF84416);
  }

  Color _disabledColor(BuildContext context) {
    return Colors.grey.shade400;
  }

  Color _borderColor(BuildContext context) {
    if (isDisabled) {
      return Colors.grey.shade300;
    }
    switch (variant) {
      case ButtonVariant.primary:
        return Colors.transparent;
      case ButtonVariant.secondary:
        return Colors.grey.shade500;
      case ButtonVariant.ghost:
        return Colors.transparent;
      case ButtonVariant.google:
        return const Color(0xFFE5E5E5); // google border
    }
  }

  Color _backgroundColor(BuildContext context) {
    if (isDisabled) {
      switch (variant) {
        case ButtonVariant.primary:
          return _disabledColor(context);
        case ButtonVariant.secondary:
        case ButtonVariant.ghost:
        case ButtonVariant.google:
          return Colors.transparent;
      }
    }
    switch (variant) {
      case ButtonVariant.primary:
        return _primaryColor(context);
      case ButtonVariant.secondary:
        return Colors.transparent;
      case ButtonVariant.ghost:
        return Colors.transparent; // ghost bg
      case ButtonVariant.google:
        return Colors.white; // card style
    }
  }

  Color _foregroundColor(BuildContext context) {
    if (isDisabled) {
      return Colors.grey.shade600;
    }
    switch (variant) {
      case ButtonVariant.primary:
        return Colors.white;
      case ButtonVariant.secondary:
        return Colors.black87;
      case ButtonVariant.ghost:
        return const Color(0xFF575757); // back arrow color
      case ButtonVariant.google:
        return Colors.black87; // google text
    }
  }

  @override
  Widget build(BuildContext context) {
    // radius 12px
    final radius = BorderRadius.circular(12);
    final bgColor = _backgroundColor(context);
    final fgColor = _foregroundColor(context);
    final borderColor = _borderColor(context);
    final hasText = text != null && text!.isNotEmpty;
    final hasIcon = icon != null;

    Widget child;

    // text + icon
    if (hasText && hasIcon) {
      // 24x24 icon box
      final Widget sizedIcon = SizedBox(
        width: 24,
        height: 24,
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
          const SizedBox(width: 4), // gap 4px
          Text(text!, style: _textStyle(fgColor)),
        ] else ...[
          Text(text!, style: _textStyle(fgColor)),
          const SizedBox(width: 4), // gap 4px
          sizedIcon,
        ],
      ];

      child = Row(
        mainAxisSize: fullWidth ? MainAxisSize.max : MainAxisSize.min,
        mainAxisAlignment: MainAxisAlignment.center,
        crossAxisAlignment: CrossAxisAlignment.center, // vertical center
        children: content,
      );
    } else if (hasText) {
      // text only
      child = Center(
        child: Text(
          text!,
          style: _textStyle(fgColor),
        ),
      );
    } else {
      // icon only (24x24)
      final Widget sizedIcon = SizedBox(
        width: 24,
        height: 24,
        child: Center(
          child: IconTheme(
            data: IconThemeData(color: fgColor),
            child: icon!,
          ),
        ),
      );
      child = Center(child: sizedIcon);
    }

    // padding + min height
    final buttonContent = ConstrainedBox(
      constraints: BoxConstraints(
        minHeight: _height, // keeps 44px / 40px / 32px area
      ),
      child: Padding(
        // 14h / 10v
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
        child: child,
      ),
    );

    // material + ripple
    final materialChild = Material(
      color: bgColor,
      shape: RoundedRectangleBorder(
        borderRadius: radius,
        side: BorderSide(
          color: borderColor,
          width: variant == ButtonVariant.google ? 1 : 0,
        ),
      ),
      child: InkWell(
        borderRadius: radius,
        onTap: isDisabled ? null : onPressed,
        child: buttonContent,
      ),
    );

    // width behavior
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