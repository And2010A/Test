import 'package:flutter/material.dart';
import '../widgets/app_button.dart';

// simple demo screen
class ButtonsShowcaseScreen extends StatelessWidget {
  const ButtonsShowcaseScreen({Key? key}) : super(key: key);

  void _debugAction(String label) {
    debugPrint('Pressed: $label');
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      // keep away from status bar
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              // full-width save
              const Text(
                'Primary (full width)',
                style: TextStyle(fontWeight: FontWeight.bold),
              ),
              const SizedBox(height: 8),
              AppButton(
                text: 'Save',
                variant: ButtonVariant.primary,
                size: ButtonSize.large,
                fullWidth: true,
                onPressed: () => _debugAction('Save'),
              ),
              const SizedBox(height: 24),

              // compact add +
              const Text(
                'Primary with icon (hug contents)',
                style: TextStyle(fontWeight: FontWeight.bold),
              ),
              const SizedBox(height: 8),
              Row(
                mainAxisAlignment: MainAxisAlignment.start,
                children: [
                  AppButton(
                    text: 'Add',
                    icon: const Icon(Icons.add),
                    variant: ButtonVariant.primary,
                    size: ButtonSize.medium,
                    iconPosition: IconPosition.right,
                    fullWidth: false,
                    onPressed: () => _debugAction('Add'),
                  ),
                ],
              ),
              const SizedBox(height: 24),

              // sign in with google (full width, card style)
              const Text(
                'Sign in with Google',
                style: TextStyle(fontWeight: FontWeight.bold),
              ),
              const SizedBox(height: 8),
              AppButton(
                text: 'Sign in with Google',
                icon: Image.asset(
                  'assets/google_logo.png',
                  width: 24,
                  height: 24,
                ),
                variant: ButtonVariant.google,
                size: ButtonSize.medium,
                iconPosition: IconPosition.left,
                fullWidth: true,
                onPressed: () => _debugAction('Sign in with Google'),
              ),
              const SizedBox(height: 24),

              // back arrow ghost button (compact)
              const Text(
                'Back (ghost icon)',
                style: TextStyle(fontWeight: FontWeight.bold),
              ),
              const SizedBox(height: 8),
              Row(
                mainAxisAlignment: MainAxisAlignment.start,
                children: [
                  AppButton(
                    icon: const Icon(Icons.arrow_back),
                    variant: ButtonVariant.ghost,
                    size: ButtonSize.large, // 44px tap area
                    fullWidth: false,
                    onPressed: () => _debugAction('Back'),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }
}