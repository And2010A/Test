import 'package:flutter/material.dart';

import '../widgets/typography_showcase.dart';

class TypographyShowcaseScreen extends StatelessWidget {
  const TypographyShowcaseScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(16),
          child: const TypographyShowcase(),
        ),
      ),
    );
  }
}
