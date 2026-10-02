const fs = require('fs');
const pkgs = require('./client/public/src/js/packages-data.js');

let out = `class TourPackage {
  final String id;
  final String title;
  final String duration;
  final String price;
  final String vehicle;
  final String region;
  final String badge;
  final List<String> includes;
  final List<dynamic> days;

  TourPackage({
    required this.id,
    required this.title,
    required this.duration,
    required this.price,
    required this.vehicle,
    required this.region,
    required this.badge,
    required this.includes,
    required this.days,
  });
}

final List<TourPackage> allPackages = [
`;

pkgs.forEach(p => {
  out += `  TourPackage(
    id: '${p.key.replace(/'/g, "\\'")}',
    title: '${p.title.replace(/'/g, "\\'")}',
    duration: '${p.duration.replace(/'/g, "\\'")}',
    price: '${p.price.replace(/'/g, "\\'")}',
    vehicle: '${p.vehicle.replace(/'/g, "\\'")}',
    region: '${p.region.replace(/'/g, "\\'")}',
    badge: '${p.badge.replace(/'/g, "\\'")}',
    includes: ${JSON.stringify(p.includes)},
    days: ${JSON.stringify(p.days)},
  ),\n`;
});
out += '];\n';

fs.mkdirSync('./rhinovoyage_app/lib/data', { recursive: true });
fs.writeFileSync('./rhinovoyage_app/lib/data/packages_data.dart', out);
console.log('Conversion successful.');
