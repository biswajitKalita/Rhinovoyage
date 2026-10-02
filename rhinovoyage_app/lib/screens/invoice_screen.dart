import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:pdf/pdf.dart';
import 'package:pdf/widgets.dart' as pw;
import 'package:printing/printing.dart';
import '../theme/app_theme.dart';
import '../services/admin_service.dart';

class InvoiceScreen extends StatefulWidget {
  final String bookingId;

  const InvoiceScreen({super.key, required this.bookingId});

  @override
  State<InvoiceScreen> createState() => _InvoiceScreenState();
}

class _InvoiceScreenState extends State<InvoiceScreen> {
  bool _isLoading = true;
  Map<String, dynamic>? _bookingData;
  Map<String, dynamic>? _invoiceData;
  Map<String, dynamic>? _customerData;
  Map<String, dynamic>? _companyData;

  @override
  void initState() {
    super.initState();
    _fetchInvoice();
  }

  Future<void> _fetchInvoice() async {
    final result = await AdminService.getBookingInvoice(widget.bookingId);
    if (result['success']) {
      setState(() {
        _bookingData = result['booking'];
        _invoiceData = result['invoice'];
        _customerData = result['customerUser'];
        _companyData = result['company'];
        _isLoading = false;
      });
    } else {
      setState(() {
        _isLoading = false;
      });
      // ignore: use_build_context_synchronously
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(result['message'] ?? 'Failed to load invoice')));
    }
  }

  Future<void> _downloadPdf() async {
    final pdf = pw.Document();

    final b = _bookingData!;
    final inv = _invoiceData!;
    final cust = _customerData;

    pdf.addPage(
      pw.Page(
        pageFormat: PdfPageFormat.a4,
        margin: const pw.EdgeInsets.all(32),
        build: (pw.Context context) {
          return pw.Column(
            crossAxisAlignment: pw.CrossAxisAlignment.start,
            children: [
              pw.Row(
                mainAxisAlignment: pw.MainAxisAlignment.spaceBetween,
                crossAxisAlignment: pw.CrossAxisAlignment.start,
                children: [
                  pw.Column(
                    crossAxisAlignment: pw.CrossAxisAlignment.start,
                    children: [
                      pw.Text('RhinoVoyage', style: pw.TextStyle(fontSize: 28, fontWeight: pw.FontWeight.bold, color: const PdfColor.fromInt(0xFF1B4332))),
                      pw.SizedBox(height: 4),
                      pw.Text('Premier Assam & Northeast Travel Experience', style: const pw.TextStyle(fontSize: 10, color: PdfColors.grey700)),
                    ],
                  ),
                  pw.Column(
                    crossAxisAlignment: pw.CrossAxisAlignment.end,
                    children: [
                      pw.Text('INVOICE / RECEIPT', style: pw.TextStyle(fontSize: 22, fontWeight: pw.FontWeight.bold, color: const PdfColor.fromInt(0xFF0D2B1E))),
                      pw.SizedBox(height: 8),
                      pw.Text(inv['paymentStatus'] == 'Paid' ? 'PAID & COMPLETED' : 'PAYMENT DUE', 
                        style: pw.TextStyle(fontSize: 14, fontWeight: pw.FontWeight.bold, color: inv['paymentStatus'] == 'Paid' ? const PdfColor.fromInt(0xFF2D6A4F) : const PdfColor.fromInt(0xFFC62828))
                      ),
                    ],
                  )
                ]
              ),
              pw.SizedBox(height: 30),
              pw.Row(
                mainAxisAlignment: pw.MainAxisAlignment.spaceBetween,
                crossAxisAlignment: pw.CrossAxisAlignment.start,
                children: [
                  pw.Expanded(
                    child: pw.Column(
                      crossAxisAlignment: pw.CrossAxisAlignment.start,
                      children: [
                        pw.Text('BILLED TO:', style: pw.TextStyle(fontSize: 10, fontWeight: pw.FontWeight.bold, color: PdfColors.grey600)),
                        pw.SizedBox(height: 4),
                        pw.Text(b['name'] ?? cust?['name'] ?? 'Guest Traveler', style: pw.TextStyle(fontSize: 14, fontWeight: pw.FontWeight.bold)),
                        pw.Text(b['phone'] ?? cust?['phone'] ?? '', style: const pw.TextStyle(fontSize: 12, color: PdfColors.grey800)),
                        pw.Text(cust?['email'] ?? 'Registered Guest', style: const pw.TextStyle(fontSize: 12, color: PdfColors.grey800)),
                        pw.SizedBox(height: 8),
                        pw.Text('Payment Method: ${inv['paymentMethod'] ?? b['paymentMethod'] ?? 'UPI / Cash'}', style: const pw.TextStyle(fontSize: 12)),
                      ]
                    )
                  ),
                  pw.Expanded(
                    child: pw.Column(
                      crossAxisAlignment: pw.CrossAxisAlignment.end,
                      children: [
                        pw.Text('TRIP DETAILS:', style: pw.TextStyle(fontSize: 10, fontWeight: pw.FontWeight.bold, color: PdfColors.grey600)),
                        pw.SizedBox(height: 4),
                        pw.Text('Invoice #: ${inv['invoiceNumber']}', style: pw.TextStyle(fontSize: 12, fontWeight: pw.FontWeight.bold)),
                        pw.Text('Booking ID: ${b['id']}', style: const pw.TextStyle(fontSize: 12)),
                        pw.Text('Pickup Date: ${b['pickupDate']}', style: const pw.TextStyle(fontSize: 12)),
                        pw.Text('Vehicle: ${b['vehicle']}', style: const pw.TextStyle(fontSize: 12)),
                        pw.Text('Driver: ${b['driverName'] ?? 'Assigned Partner'}', style: const pw.TextStyle(fontSize: 12)),
                      ]
                    )
                  ),
                ]
              ),
              pw.SizedBox(height: 30),
              
              // Table Header
              pw.Container(
                color: const PdfColor.fromInt(0xFF0D2B1E),
                padding: const pw.EdgeInsets.symmetric(vertical: 10, horizontal: 16),
                child: pw.Row(
                  children: [
                    pw.Expanded(flex: 3, child: pw.Text('DESCRIPTION', style: pw.TextStyle(color: PdfColors.white, fontSize: 10, fontWeight: pw.FontWeight.bold))),
                    pw.Expanded(flex: 1, child: pw.Text('TOTAL', textAlign: pw.TextAlign.right, style: pw.TextStyle(color: PdfColors.white, fontSize: 10, fontWeight: pw.FontWeight.bold))),
                  ]
                )
              ),
              
              // Table Rows
              pw.Container(
                padding: const pw.EdgeInsets.symmetric(vertical: 12, horizontal: 16),
                decoration: const pw.BoxDecoration(border: pw.Border(bottom: pw.BorderSide(color: PdfColors.grey300))),
                child: pw.Row(
                  children: [
                    pw.Expanded(flex: 3, child: pw.Column(
                      crossAxisAlignment: pw.CrossAxisAlignment.start,
                      children: [
                        pw.Text('${b['serviceType'] == 'car_rental' ? 'Car Rental Service' : 'Tour Package'} — ${b['vehicle']}', style: pw.TextStyle(fontWeight: pw.FontWeight.bold, fontSize: 12)),
                        pw.Text('Guwahati / Sivasagar Northeast Heritage Route', style: const pw.TextStyle(color: PdfColors.grey700, fontSize: 10)),
                      ]
                    )),
                    pw.Expanded(flex: 1, child: pw.Text('Rs. ${inv['baseFare'] ?? 0}', textAlign: pw.TextAlign.right, style: const pw.TextStyle(fontSize: 12))),
                  ]
                )
              ),
              
              if ((inv['extraKmCharges'] ?? 0) > 0 || (inv['tollCharges'] ?? 0) > 0)
                pw.Container(
                  padding: const pw.EdgeInsets.symmetric(vertical: 12, horizontal: 16),
                  decoration: const pw.BoxDecoration(border: pw.Border(bottom: pw.BorderSide(color: PdfColors.grey300))),
                  child: pw.Row(
                    children: [
                      pw.Expanded(flex: 3, child: pw.Text('Extra KMs / Toll / Parking Charges', style: pw.TextStyle(fontWeight: pw.FontWeight.bold, fontSize: 12))),
                      pw.Expanded(flex: 1, child: pw.Text('Rs. ${(inv['extraKmCharges'] ?? 0) + (inv['tollCharges'] ?? 0)}', textAlign: pw.TextAlign.right, style: const pw.TextStyle(fontSize: 12))),
                    ]
                  )
                ),
                
              if ((inv['discount'] ?? 0) > 0)
                pw.Container(
                  padding: const pw.EdgeInsets.symmetric(vertical: 12, horizontal: 16),
                  decoration: const pw.BoxDecoration(border: pw.Border(bottom: pw.BorderSide(color: PdfColors.grey300))),
                  child: pw.Row(
                    children: [
                      pw.Expanded(flex: 3, child: pw.Text('Discount Applied', style: pw.TextStyle(fontWeight: pw.FontWeight.bold, fontSize: 12))),
                      pw.Expanded(flex: 1, child: pw.Text('- Rs. ${inv['discount']}', textAlign: pw.TextAlign.right, style: const pw.TextStyle(fontSize: 12, color: PdfColors.red600))),
                    ]
                  )
                ),
                
              pw.SizedBox(height: 20),
              
              // Totals
              pw.Row(
                mainAxisAlignment: pw.MainAxisAlignment.end,
                children: [
                  pw.Container(
                    width: 250,
                    child: pw.Column(
                      children: [
                        pw.Row(
                          mainAxisAlignment: pw.MainAxisAlignment.spaceBetween,
                          children: [
                            pw.Text('Subtotal:', style: pw.TextStyle(color: PdfColors.grey700, fontSize: 12)),
                            pw.Text('Rs. ${inv['subtotal'] ?? inv['totalAmount']}', style: pw.TextStyle(fontWeight: pw.FontWeight.bold, fontSize: 12)),
                          ]
                        ),
                        pw.SizedBox(height: 8),
                        pw.Row(
                          mainAxisAlignment: pw.MainAxisAlignment.spaceBetween,
                          children: [
                            pw.Text('GST (0%):', style: pw.TextStyle(color: PdfColors.grey700, fontSize: 12)),
                            pw.Text('Rs. 0', style: pw.TextStyle(fontWeight: pw.FontWeight.bold, fontSize: 12)),
                          ]
                        ),
                        pw.SizedBox(height: 12),
                        pw.Container(
                          padding: const pw.EdgeInsets.symmetric(vertical: 10, horizontal: 12),
                          color: const PdfColor.fromInt(0xFFFDF0E8),
                          child: pw.Row(
                            mainAxisAlignment: pw.MainAxisAlignment.spaceBetween,
                            children: [
                              pw.Text('GRAND TOTAL:', style: pw.TextStyle(color: const PdfColor.fromInt(0xFFE8651A), fontWeight: pw.FontWeight.bold, fontSize: 14)),
                              pw.Text('Rs. ${inv['totalAmount']}', style: pw.TextStyle(color: const PdfColor.fromInt(0xFFE8651A), fontWeight: pw.FontWeight.bold, fontSize: 16)),
                            ]
                          )
                        )
                      ]
                    )
                  )
                ]
              ),
              
              pw.Spacer(),
              pw.Divider(color: PdfColors.grey300),
              pw.SizedBox(height: 10),
              pw.Center(
                child: pw.Text('Thank you for choosing RhinoVoyage!', style: pw.TextStyle(color: PdfColors.grey700, fontSize: 12, fontStyle: pw.FontStyle.italic)),
              ),
              pw.SizedBox(height: 4),
              pw.Center(
                child: pw.Text('LKB Road, Amulapatty, Sivasagar, Assam — 785640, India | www.rhinovoyage.com', style: const pw.TextStyle(color: PdfColors.grey600, fontSize: 10)),
              ),
            ],
          );
        },
      ),
    );

    await Printing.layoutPdf(
      onLayout: (PdfPageFormat format) async => pdf.save(),
      name: '${inv['invoiceNumber'] ?? 'Invoice'}.pdf',
    );
  }

  @override
  Widget build(BuildContext context) {
    if (_isLoading) {
      return const Scaffold(body: Center(child: CircularProgressIndicator(color: AppTheme.primaryGreen)));
    }

    if (_bookingData == null || _invoiceData == null) {
      return Scaffold(
        appBar: AppBar(title: const Text('Invoice Error')),
        body: const Center(child: Text('Could not load invoice data.')),
      );
    }

    final b = _bookingData!;
    final inv = _invoiceData!;
    final cust = _customerData;
    
    final bool isPaid = inv['paymentStatus'] != 'Unpaid';

    return Scaffold(
      backgroundColor: const Color(0xFFEDE8DD), // Same as website body bg
      appBar: AppBar(
        backgroundColor: AppTheme.primaryGreen,
        title: Text('Trip Invoice & Receipt', style: GoogleFonts.playfairDisplay(color: Colors.white, fontWeight: FontWeight.bold)),
        iconTheme: const IconThemeData(color: Colors.white),
        actions: [
          ElevatedButton.icon(
            onPressed: _downloadPdf,
            icon: const Icon(Icons.print, size: 18),
            label: const Text('Print / Save PDF'),
            style: ElevatedButton.styleFrom(
              backgroundColor: const Color(0xFF1B4332), // var(--green)
              foregroundColor: Colors.white,
              elevation: 0,
              padding: const EdgeInsets.symmetric(horizontal: 16),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
            ),
          ),
          const SizedBox(width: 16),
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.symmetric(vertical: 32, horizontal: 16),
        child: Center(
          child: Container(
            constraints: const BoxConstraints(maxWidth: 850),
            padding: const EdgeInsets.all(40),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: const Color(0xFFE2D7C3)),
              boxShadow: [
                BoxShadow(color: const Color(0xFF1B4332).withOpacity(0.08), blurRadius: 35, offset: const Offset(0, 10)),
              ],
            ),
            child: Stack(
              children: [
                // Stamp
                Positioned(
                  top: 0,
                  right: 0,
                  child: Transform.rotate(
                    angle: -0.05,
                    child: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                      decoration: BoxDecoration(
                        border: Border.all(color: isPaid ? const Color(0xFF2D6A4F) : const Color(0xFFC62828), width: 3, style: BorderStyle.solid), // pseudo dashed
                        borderRadius: BorderRadius.circular(8),
                        color: isPaid ? const Color(0xFF2D6A4F).withOpacity(0.04) : const Color(0xFFC62828).withOpacity(0.04),
                      ),
                      child: Text(
                        isPaid ? 'PAID & COMPLETED' : 'PAYMENT DUE',
                        style: GoogleFonts.nunito(
                          color: isPaid ? const Color(0xFF2D6A4F) : const Color(0xFFC62828),
                          fontSize: 18,
                          fontWeight: FontWeight.w800,
                          letterSpacing: 2,
                        ),
                      ),
                    ),
                  ),
                ),
                
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Header
                    Row(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text('RhinoVoyage', style: GoogleFonts.playfairDisplay(fontSize: 32, fontWeight: FontWeight.bold, color: const Color(0xFF1B4332))),
                              const SizedBox(height: 4),
                              Text('Premier Assam & Northeast Travel Experience', style: GoogleFonts.nunito(fontSize: 13, color: const Color(0xFF7A695B))),
                            ],
                          ),
                        ),
                        Column(
                          crossAxisAlignment: CrossAxisAlignment.end,
                          children: [
                            const SizedBox(height: 50), // space for stamp
                            Text('INVOICE / RECEIPT', style: GoogleFonts.playfairDisplay(fontSize: 26, fontWeight: FontWeight.bold, color: const Color(0xFF0D2B1E), letterSpacing: 1)),
                          ],
                        ),
                      ],
                    ),
                    
                    const SizedBox(height: 40),
                    
                    // Info Grid
                    Row(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text('BILLED TO', style: GoogleFonts.nunito(fontSize: 12, fontWeight: FontWeight.w800, color: const Color(0xFF7A695B), letterSpacing: 1.5)),
                              const SizedBox(height: 8),
                              Text(b['name'] ?? cust?['name'] ?? 'Guest Traveler', style: GoogleFonts.nunito(fontSize: 18, fontWeight: FontWeight.w700, color: const Color(0xFF1A1209))),
                              const SizedBox(height: 4),
                              Text(b['phone'] ?? cust?['phone'] ?? 'N/A', style: GoogleFonts.nunito(fontSize: 14, color: const Color(0xFF4A3728))),
                              Text(cust?['email'] ?? 'Registered Guest', style: GoogleFonts.nunito(fontSize: 14, color: const Color(0xFF4A3728))),
                              const SizedBox(height: 12),
                              Text('Payment Method: ${inv['paymentMethod'] ?? b['paymentMethod'] ?? 'UPI / Cash'}', style: GoogleFonts.nunito(fontSize: 14, color: const Color(0xFF4A3728), fontWeight: FontWeight.w600)),
                            ],
                          ),
                        ),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.end,
                            children: [
                              Text('TRIP DETAILS', style: GoogleFonts.nunito(fontSize: 12, fontWeight: FontWeight.w800, color: const Color(0xFF7A695B), letterSpacing: 1.5)),
                              const SizedBox(height: 8),
                              _buildDetailRow('Invoice No:', inv['invoiceNumber'] ?? ''),
                              _buildDetailRow('Date of Issue:', (inv['issueDate'] ?? b['createdAt']).toString().split('T')[0]),
                              _buildDetailRow('Booking ID:', b['id']),
                              _buildDetailRow('Pickup Date:', b['pickupDate']),
                              _buildDetailRow('Vehicle:', b['vehicle']),
                              _buildDetailRow('Driver:', b['driverName'] ?? 'Assigned Partner'),
                            ],
                          ),
                        ),
                      ],
                    ),
                    
                    const SizedBox(height: 40),
                    
                    // Table
                    Container(
                      decoration: BoxDecoration(
                        border: Border.all(color: const Color(0xFFE2D7C3)),
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: Column(
                        children: [
                          // TH
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
                            decoration: const BoxDecoration(
                              color: Color(0xFF0D2B1E),
                              borderRadius: BorderRadius.only(topLeft: Radius.circular(7), topRight: Radius.circular(7)),
                            ),
                            child: Row(
                              children: [
                                Expanded(flex: 3, child: Text('DESCRIPTION', style: GoogleFonts.nunito(color: Colors.white, fontSize: 12, fontWeight: FontWeight.w700, letterSpacing: 1))),
                                Expanded(flex: 1, child: Text('TOTAL', textAlign: TextAlign.right, style: GoogleFonts.nunito(color: Colors.white, fontSize: 12, fontWeight: FontWeight.w700, letterSpacing: 1))),
                              ],
                            ),
                          ),
                          // TR 1
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 20),
                            decoration: const BoxDecoration(border: Border(bottom: BorderSide(color: Color(0xFFEAE2D2)))),
                            child: Row(
                              children: [
                                Expanded(flex: 3, child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Text('${b['serviceType'] == 'car_rental' ? 'Car Rental Service' : 'Tour Package Operator Service'} — ${b['vehicle']}', style: GoogleFonts.nunito(fontSize: 15, fontWeight: FontWeight.w700, color: const Color(0xFF1A1209))),
                                    const SizedBox(height: 4),
                                    Text(b['details'] != null ? 'Notes/Route: ${b['details']}' : 'Guwahati / Sivasagar Northeast Heritage Route', style: GoogleFonts.nunito(fontSize: 13, color: const Color(0xFF7A695B))),
                                  ],
                                )),
                                Expanded(flex: 1, child: Text('₹${(inv['baseFare'] ?? 0).toStringAsFixed(2)}', textAlign: TextAlign.right, style: GoogleFonts.jetBrainsMono(fontSize: 15, color: const Color(0xFF4A3728)))),
                              ],
                            ),
                          ),
                          // TR Extra
                          if ((inv['extraKmCharges'] ?? 0) > 0 || (inv['tollCharges'] ?? 0) > 0)
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
                              decoration: const BoxDecoration(border: Border(bottom: BorderSide(color: Color(0xFFEAE2D2)))),
                              child: Row(
                                children: [
                                  Expanded(flex: 3, child: Text('Extra KMs / Toll / Parking Charges', style: GoogleFonts.nunito(fontSize: 15, fontWeight: FontWeight.w600, color: const Color(0xFF1A1209)))),
                                  Expanded(flex: 1, child: Text('₹${((inv['extraKmCharges'] ?? 0) + (inv['tollCharges'] ?? 0) + (inv['parkingCharges'] ?? 0)).toStringAsFixed(2)}', textAlign: TextAlign.right, style: GoogleFonts.jetBrainsMono(fontSize: 15, color: const Color(0xFF4A3728)))),
                                ],
                              ),
                            ),
                          // TR Discount
                          if ((inv['discount'] ?? 0) > 0)
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
                              child: Row(
                                children: [
                                  Expanded(flex: 3, child: Text('Discount Applied', style: GoogleFonts.nunito(fontSize: 15, fontWeight: FontWeight.w600, color: const Color(0xFF1A1209)))),
                                  Expanded(flex: 1, child: Text('-₹${(inv['discount'] ?? 0).toStringAsFixed(2)}', textAlign: TextAlign.right, style: GoogleFonts.jetBrainsMono(fontSize: 15, color: const Color(0xFFC62828)))),
                                ],
                              ),
                            ),
                        ],
                      ),
                    ),
                    
                    const SizedBox(height: 24),
                    
                    // Totals
                    Row(
                      mainAxisAlignment: MainAxisAlignment.end,
                      children: [
                        SizedBox(
                          width: 320,
                          child: Column(
                            children: [
                              _buildSummaryRow('Subtotal', '₹${(inv['subtotal'] ?? inv['totalAmount'] ?? 0).toStringAsFixed(2)}'),
                              const SizedBox(height: 12),
                              _buildSummaryRow('GST (0%)', '₹0.00'),
                              const SizedBox(height: 16),
                              Container(
                                padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
                                decoration: BoxDecoration(
                                  color: const Color(0xFFFDF0E8), // var(--orange-pale)
                                  borderRadius: BorderRadius.circular(8),
                                  border: Border.all(color: const Color(0xFFE8651A).withOpacity(0.3)),
                                ),
                                child: Row(
                                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                  children: [
                                    Text('GRAND TOTAL', style: GoogleFonts.nunito(fontSize: 16, fontWeight: FontWeight.w800, color: const Color(0xFFC4511A))),
                                    Text('₹${(inv['totalAmount'] ?? 0).toStringAsFixed(2)}', style: GoogleFonts.jetBrainsMono(fontSize: 22, fontWeight: FontWeight.bold, color: const Color(0xFFE8651A))),
                                  ],
                                ),
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                    
                    const SizedBox(height: 60),
                    const Divider(color: Color(0xFFEAE2D2)),
                    const SizedBox(height: 24),
                    
                    // Footer
                    Row(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text('Terms & Conditions', style: GoogleFonts.nunito(fontSize: 14, fontWeight: FontWeight.w700, color: const Color(0xFF4A3728))),
                              const SizedBox(height: 8),
                              Text('1. All payments are non-refundable once the journey is completed.\n2. Please make all checks payable to RhinoVoyage.\n3. For any discrepancies, please contact support within 7 days.', style: GoogleFonts.nunito(fontSize: 12, color: const Color(0xFF7A695B), height: 1.6)),
                            ],
                          ),
                        ),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.end,
                            children: [
                              Text('Thank you for choosing RhinoVoyage!', style: GoogleFonts.playfairDisplay(fontSize: 18, fontStyle: FontStyle.italic, fontWeight: FontWeight.w600, color: const Color(0xFF1B4332))),
                              const SizedBox(height: 16),
                              Container(
                                width: 150,
                                height: 2,
                                color: const Color(0xFFEAE2D2),
                              ),
                              const SizedBox(height: 8),
                              Text('Authorized Signatory', style: GoogleFonts.nunito(fontSize: 12, color: const Color(0xFF7A695B))),
                            ],
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildDetailRow(String label, String value) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 6),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.end,
        children: [
          Text(label, style: GoogleFonts.nunito(fontSize: 13, color: const Color(0xFF7A695B))),
          const SizedBox(width: 8),
          Text(value, style: GoogleFonts.nunito(fontSize: 14, fontWeight: FontWeight.w600, color: const Color(0xFF1A1209))),
        ],
      ),
    );
  }

  Widget _buildSummaryRow(String label, String value) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(label, style: GoogleFonts.nunito(fontSize: 15, color: const Color(0xFF4A3728))),
        Text(value, style: GoogleFonts.jetBrainsMono(fontSize: 15, fontWeight: FontWeight.w600, color: const Color(0xFF1A1209))),
      ],
    );
  }
}
