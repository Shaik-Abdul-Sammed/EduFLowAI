import 'dart:async';
import 'package:flutter/material.dart';
import 'package:dio/dio.dart';
import '../core/sse_client.dart';

class OfficerStreamScreen extends StatefulWidget {
  const OfficerStreamScreen({super.key});

  @override
  State<OfficerStreamScreen> createState() => _OfficerStreamScreenState();
}

class _OfficerStreamScreenState extends State<OfficerStreamScreen> with SingleTickerProviderStateMixin {
  final Map<String, Map<String, dynamic>> _officerConfigs = {
    'accreditation': {
      'name': 'Accreditation Officer',
      'icon': Icons.account_balance,
      'color': Colors.purple,
      'defaultPrompt': 'NAAC Criteria 3 SSR Analysis for SSIT',
    },
    'student-success': {
      'name': 'Student Success Officer',
      'icon': Icons.school,
      'color': Colors.red,
      'defaultPrompt': 'Semester 4 dropout risk analysis',
    },
    'timetable': {
      'name': 'Timetable Officer',
      'icon': Icons.calendar_month,
      'color': Colors.blue,
      'defaultPrompt': 'CSE Semester 4 conflict-free timetable',
    },
    'admissions': {
      'name': 'Admissions Officer',
      'icon': Icons.group_add,
      'color': Colors.green,
      'defaultPrompt': 'B.Tech 2026 applicant yield prediction',
    },
    'finance': {
      'name': 'Finance Officer',
      'icon': Icons.currency_rupee,
      'color': Colors.amber.shade800,
      'defaultPrompt': 'Term 1 fee reconciliation against bank ledger',
    },
  };

  late String _selectedOfficer;
  late TextEditingController _promptController;
  final ScrollController _scrollController = ScrollController();
  final SSEClient _sseClient = SSEClient();

  CancelToken? _cancelToken;
  StreamSubscription? _subscription;

  bool _isStreaming = false;
  String _thinkingText = '';
  String _generatedText = '';
  Map<String, dynamic>? _roiData;
  String? _errorMessage;

  late AnimationController _cursorController;

  @override
  void initState() {
    super.initState();
    _selectedOfficer = 'accreditation';
    _promptController = TextEditingController(
      text: _officerConfigs[_selectedOfficer]!['defaultPrompt'],
    );
    _cursorController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 600),
    )..repeat(reverse: true);
  }

  @override
  void dispose() {
    _cancelToken?.cancel();
    _subscription?.cancel();
    _promptController.dispose();
    _scrollController.dispose();
    _cursorController.dispose();
    super.dispose();
  }

  void _onOfficerChanged(String? newOfficer) {
    if (newOfficer == null || _isStreaming) return;
    setState(() {
      _selectedOfficer = newOfficer;
      _promptController.text = _officerConfigs[newOfficer]!['defaultPrompt'];
      _generatedText = '';
      _thinkingText = '';
      _roiData = null;
      _errorMessage = null;
    });
  }

  void _scrollToBottom() {
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (_scrollController.hasClients) {
        _scrollController.animateTo(
          _scrollController.position.maxScrollExtent,
          duration: const Duration(milliseconds: 100),
          curve: Curves.easeOut,
        );
      }
    });
  }

  void _stopStream() {
    _cancelToken?.cancel();
    _subscription?.cancel();
    setState(() {
      _isStreaming = false;
    });
  }

  void _startStream() {
    final prompt = _promptController.text.trim();
    if (prompt.isEmpty) return;

    setState(() {
      _isStreaming = true;
      _thinkingText = 'Dispatching to $_selectedOfficer intelligence...';
      _generatedText = '';
      _roiData = null;
      _errorMessage = null;
    });

    _cancelToken = CancelToken();

    final stream = _sseClient.streamOfficer(
      officerType: _selectedOfficer,
      payload: {'reportType': prompt},
      cancelToken: _cancelToken,
    );

    _subscription = stream.listen(
      (event) {
        final type = event['type'];
        if (type == 'thinking') {
          setState(() {
            _thinkingText = event['text'] ?? 'Analyzing institutional context...';
          });
        } else if (type == 'token') {
          setState(() {
            _generatedText += event['text'] ?? '';
            _thinkingText = '';
          });
          _scrollToBottom();
        } else if (type == 'done') {
          setState(() {
            _isStreaming = false;
            _roiData = event['roi'] as Map<String, dynamic>?;
          });
        } else if (type == 'error') {
          setState(() {
            _isStreaming = false;
            _errorMessage = event['message'] ?? 'Streaming error encountered';
          });
        }
      },
      onError: (err) {
        setState(() {
          _isStreaming = false;
          _errorMessage = err.toString();
        });
      },
      onDone: () {
        setState(() {
          _isStreaming = false;
        });
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    final config = _officerConfigs[_selectedOfficer]!;
    final Color officerColor = config['color'] as Color;

    return Scaffold(
      appBar: AppBar(
        title: const Text('AI Officers Streaming Hub'),
        elevation: 0,
      ),
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            // Officer Selector Dropdown
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
              decoration: BoxDecoration(
                color: officerColor.withOpacity(0.08),
                borderRadius: BorderRadius.circular(10),
                border: Border.all(color: officerColor.withOpacity(0.3)),
              ),
              child: DropdownButtonHideUnderline(
                child: DropdownButton<String>(
                  value: _selectedOfficer,
                  isExpanded: true,
                  icon: Icon(Icons.arrow_drop_down, color: officerColor),
                  onChanged: _isStreaming ? null : _onOfficerChanged,
                  items: _officerConfigs.entries.map((entry) {
                    return DropdownMenuItem<String>(
                      value: entry.key,
                      child: Row(
                        children: [
                          Icon(entry.value['icon'] as IconData, color: entry.value['color'] as Color, size: 20),
                          const SizedBox(width: 10),
                          Text(entry.value['name'] as String,
                              style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14)),
                        ],
                      ),
                    );
                  }).toList(),
                ),
              ),
            ),
            const SizedBox(height: 12),

            // Prompt TextField
            TextField(
              controller: _promptController,
              decoration: InputDecoration(
                labelText: 'Directives / Report Context',
                border: OutlineInputBorder(borderRadius: BorderRadius.circular(8)),
                contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
              ),
              maxLines: 2,
              enabled: !_isStreaming,
            ),
            const SizedBox(height: 10),

            // Control Buttons
            Row(
              children: [
                Expanded(
                  child: ElevatedButton.icon(
                    onPressed: _isStreaming ? null : _startStream,
                    icon: const Icon(Icons.bolt),
                    label: Text('Stream ${config['name']}'),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: officerColor,
                      foregroundColor: Colors.white,
                      padding: const EdgeInsets.symmetric(vertical: 12),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                    ),
                  ),
                ),
                if (_isStreaming) ...[
                  const SizedBox(width: 8),
                  OutlinedButton.icon(
                    onPressed: _stopStream,
                    icon: const Icon(Icons.stop, color: Colors.red),
                    label: const Text('Stop', style: TextStyle(color: Colors.red)),
                    style: OutlinedButton.styleFrom(
                      side: const BorderSide(color: Colors.red),
                      padding: const EdgeInsets.symmetric(vertical: 12, horizontal: 16),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                    ),
                  ),
                ],
              ],
            ),
            const SizedBox(height: 12),

            // Status message
            if (_thinkingText.isNotEmpty)
              Container(
                margin: const EdgeInsets.only(bottom: 8),
                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                decoration: BoxDecoration(
                  color: Colors.blue.withOpacity(0.1),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Row(
                  children: [
                    const SizedBox(width: 14, height: 14, child: CircularProgressIndicator(strokeWidth: 2)),
                    const SizedBox(width: 8),
                    Expanded(child: Text(_thinkingText, style: const TextStyle(fontSize: 12, color: Colors.indigo))),
                  ],
                ),
              ),

            if (_errorMessage != null)
              Container(
                margin: const EdgeInsets.only(bottom: 8),
                padding: const EdgeInsets.all(10),
                decoration: BoxDecoration(
                  color: Colors.red.withOpacity(0.1),
                  borderRadius: BorderRadius.circular(8),
                  border: Border.all(color: Colors.red.withOpacity(0.3)),
                ),
                child: Row(
                  children: [
                    const Icon(Icons.error_outline, color: Colors.red, size: 20),
                    const SizedBox(width: 8),
                    Expanded(child: Text(_errorMessage!, style: const TextStyle(color: Colors.red, fontSize: 13))),
                  ],
                ),
              ),

            // Streaming Console Output
            Expanded(
              child: Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: const Color(0xFF0F172A),
                  borderRadius: BorderRadius.circular(8),
                  border: Border.all(color: const Color(0xFF334155)),
                ),
                child: SingleChildScrollView(
                  controller: _scrollController,
                  child: RichText(
                    text: TextSpan(
                      style: const TextStyle(color: Color(0xFFE2E8F0), fontSize: 13, height: 1.5, fontFamily: 'monospace'),
                      children: [
                        TextSpan(
                          text: _generatedText.isEmpty && !_isStreaming
                              ? '// Select an AI Officer and tap stream to watch token-by-token synthesis...'
                              : _generatedText,
                        ),
                        if (_isStreaming)
                          WidgetSpan(
                            child: FadeTransition(
                              opacity: _cursorController,
                              child: Container(
                                width: 8,
                                height: 14,
                                color: officerColor,
                                margin: const EdgeInsets.only(left: 2),
                              ),
                            ),
                          ),
                      ],
                    ),
                  ),
                ),
              ),
            ),

            // ROI Summary on Done
            if (_roiData != null) ...[
              const SizedBox(height: 12),
              Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: Colors.green.withOpacity(0.12),
                  borderRadius: BorderRadius.circular(10),
                  border: Border.all(color: Colors.green.withOpacity(0.35)),
                ),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceAround,
                  children: [
                    Column(
                      children: [
                        const Text('Time Saved', style: TextStyle(fontSize: 11, color: Colors.green)),
                        Text('${_roiData!['hoursSaved'] ?? _roiData!['timeSavedHours'] ?? 0} hrs',
                            style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16, color: Colors.green)),
                      ],
                    ),
                    Column(
                      children: [
                        const Text('Cost Saved', style: TextStyle(fontSize: 11, color: Colors.green)),
                        Text('₹${_roiData!['moneySaved'] ?? _roiData!['costSaved'] ?? 0}',
                            style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16, color: Colors.green)),
                      ],
                    ),
                  ],
                ),
              ),
            ],
          ],
        ),
      ),
    );
  }
}
