import 'package:flutter/material.dart';
import 'theme/app_theme.dart';
import 'screens/main_navigation.dart';

void main() {
  runApp(const RhinoVoyageApp());
}

class RhinoVoyageApp extends StatelessWidget {
  const RhinoVoyageApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'RhinoVoyage',
      theme: AppTheme.lightTheme,
      debugShowCheckedModeBanner: false,
      home: const MainNavigation(),
    );
  }
}
