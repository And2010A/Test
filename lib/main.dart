import 'package:flutter/material.dart';

import 'core/theme/app_colors.dart';
import 'features/ui_showcase/presentation/pages/buttons_showcase_screen.dart';

void main() {
  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'AppButton Demo',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        primarySwatch: AppColors.primary,
        useMaterial3: false,
      ),
      home: const ButtonsShowcaseScreen(),
    );
  }
}
