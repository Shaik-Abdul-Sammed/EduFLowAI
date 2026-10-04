import 'dart:async';
import 'package:flutter/material.dart';
import 'package:dio/dio.dart';
import '../core/sse_client.dart';

class LORScreen extends StatefulWidget {
  const LORScreen({super.key});

  @override
  State<LORScreen> createState() => _LORScreenState();
}

class _LORScreenState extends State<LORScreen> with SingleTickerProviderStateMixin {
  final TextEditingController _promptController = TextEditingController(
    text: 'Draft comprehensive Letter of Recommendation for higher education application',
  );
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
      _thinkingText = 'AI Officer initializing...';
      _generatedText = '';
      _roiData = null;
      _errorMessage = null;
    });

    _cancelToken = CancelToken();

    final stream = _sseClient.streamOfficer(
      officerType: 'accreditation',
      payload: {'reportType': prompt},
      cancelToken: _cancelToken,
    );

    _subscription = stream.listen(
      (event) {
        final type = event['type'];
        if (type == 'thinking') {
          setState(() {
            _thinkingText = event['text'] ?? 'Thinking...';
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
            _errorMessage = event['message'] ?? 'An error occurred during generation';
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
    return Scaffold(
      appBar: AppBar(
        title: const Text('AI LOR Generator'),
        elevation: 0,
      ),
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            // Header Card
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: Colors.teal.withValues(alpha: 0.1),
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: Colors.teal.withValues(alpha: 0.3)),
              ),
              child: const Row(
                children: [
                  Icon(Icons.history_edu, size: 36, color: Colors.teal),
                  SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text('Institutional LOR Generator',
                            style: TextStyle(fontWeight: FontWeight.bold, fontSize: 15)),
                        Text('Powered by Accreditation Officer streaming intelligence',
                            style: TextStyle(color: Colors.grey, fontSize: 12)),
                      ],
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 12),

            // Prompt Input
            TextField(
              controller: _promptController,
              decoration: InputDecoration(
                labelText: 'Candidate Context / Specialization',
                hintText: 'Enter student achievements, CGPA, target university...',
                border: OutlineInputBorder(borderRadius: BorderRadius.circular(8)),
                contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
              ),
              maxLines: 2,
              enabled: !_isStreaming,
            ),
            const SizedBox(height: 10),

            // Actions (Generate / Stop)
            Row(
              children: [
                Expanded(
                  child: ElevatedButton.icon(
                    onPressed: _isStreaming ? null : _startStream,
                    icon: const Icon(Icons.auto_awesome),
                    label: const Text('Generate LOR'),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: Colors.teal,
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
                    icon: const Icon(Icons.stop_circle, color: Colors.red),
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

            // Thinking or Error indicator
            if (_thinkingText.isNotEmpty)
              Container(
                margin: const EdgeInsets.only(bottom: 8),
                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                decoration: BoxDecoration(
                  color: Colors.amber.withValues(alpha: 0.15),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Row(
                  children: [
                    const SizedBox(width: 14, height: 14, child: CircularProgressIndicator(strokeWidth: 2)),
                    const SizedBox(width: 8),
                    Expanded(child: Text(_thinkingText, style: const TextStyle(fontSize: 12, color: Colors.brown))),
                  ],
                ),
              ),

            if (_errorMessage != null)
              Container(
                margin: const EdgeInsets.only(bottom: 8),
                padding: const EdgeInsets.all(10),
                decoration: BoxDecoration(
                  color: Colors.red.withValues(alpha: 0.1),
                  borderRadius: BorderRadius.circular(8),
                  border: Border.all(color: Colors.red.withValues(alpha: 0.3)),
                ),
                child: Row(
                  children: [
                    const Icon(Icons.error_outline, color: Colors.red, size: 20),
                    const SizedBox(width: 8),
                    Expanded(child: Text(_errorMessage!, style: const TextStyle(color: Colors.red, fontSize: 13))),
                  ],
                ),
              ),

            // Streaming Output Box
            Expanded(
              child: Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: Colors.grey.shade50,
                  borderRadius: BorderRadius.circular(8),
                  border: Border.all(color: Colors.grey.shade300),
                ),
                child: SingleChildScrollView(
                  controller: _scrollController,
                  child: RichText(
                    text: TextSpan(
                      style: const TextStyle(color: Colors.black87, fontSize: 14, height: 1.5, fontFamily: 'monospace'),
                      children: [
                        TextSpan(
                          text: _generatedText.isEmpty && !_isStreaming
                              ? 'Tap "Generate LOR" to stream the recommendation letter in real time...'
                              : _generatedText,
                        ),
                        if (_isStreaming)
                          WidgetSpan(
                            child: FadeTransition(
                              opacity: _cursorController,
                              child: Container(
                                width: 8,
                                height: 15,
                                color: Colors.teal,
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

            // ROI Card on Done
            if (_roiData != null) ...[
              const SizedBox(height: 12),
              Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: Colors.green.withValues(alpha: 0.1),
                  borderRadius: BorderRadius.circular(10),
                  border: Border.all(color: Colors.green.withValues(alpha: 0.3)),
                ),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceAround,
                  children: [
                    Column(
                      children: [
                        const Text('Hours Saved', style: TextStyle(fontSize: 11, color: Colors.green)),
                        Text('${_roiData!['hoursSaved'] ?? _roiData!['timeSavedHours'] ?? 2} hrs',
                            style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16, color: Colors.green)),
                      ],
                    ),
                    Column(
                      children: [
                        const Text('Value Generated', style: TextStyle(fontSize: 11, color: Colors.green)),
                        Text('₹${_roiData!['moneySaved'] ?? _roiData!['costSaved'] ?? 5000}',
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
