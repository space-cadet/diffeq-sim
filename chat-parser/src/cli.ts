#!/usr/bin/env node
import { ChatParser } from './parser/chat-parser.js';
import { writeFileSync } from 'fs';

const HELP_TEXT = `
Chat Log Parser CLI

Usage:
  pnpm start <input-file> [output-file] [options]

Options:
  --use-llm        Use LLM for enhanced message classification (requires OPENAI_API_KEY)
  --debug          Enable debug logging
  --help, -h       Show this help message

Environment Variables:
  OPENAI_API_KEY   Required if using --use-llm

Examples:
  pnpm start chat.md output.json --use-llm
  pnpm start chat.md --debug
  OPENAI_API_KEY=your-key pnpm start input.md output.json --use-llm
`;

async function main(): Promise<void> {
  const args = process.argv.slice(2);

  // Show help
  if (args.includes('--help') || args.includes('-h') || args.length === 0) {
    console.log(HELP_TEXT);
    process.exit(0);
  }

  // Parse arguments
  const inputFile = args[0];
  const outputFile = args[1]?.startsWith('--') ? 'output.json' : args[1] || 'output.json';
  const useLLM = args.includes('--use-llm');
  const debug = args.includes('--debug');

  // Validate input file
  if (!inputFile) {
    console.error('Error: Input file is required');
    console.log(HELP_TEXT);
    process.exit(1);
  }

  // Check for API key if LLM is requested
  const apiKey = process.env.OPENAI_API_KEY;
  if (useLLM && !apiKey) {
    console.error('Error: OPENAI_API_KEY environment variable is required when using --use-llm');
    process.exit(1);
  }

  try {
    // Initialize parser
    const parser = new ChatParser({
      useLLM,
      apiKey,
      debug
    });

    // Parse file
    console.log(`Parsing ${inputFile}...`);
    const result = await parser.parseFile(inputFile);

    // Write output
    writeFileSync(outputFile, JSON.stringify(result, null, 2));
    console.log(`Successfully wrote parsed output to ${outputFile}`);

    // Print summary
    console.log('\nSummary:');
    console.log(`- Total messages: ${result.summary.totalMessages}`);
    console.log('- Messages by type:', result.summary.messagesByType);
    console.log('- Code blocks by language:', result.summary.codeBlocksByLanguage);
    console.log(`- Files referenced: ${result.summary.filesReferenced.length}`);
    console.log(`- Errors encountered: ${result.summary.errorsEncountered}`);
    console.log(`- Total thought time: ${result.summary.thoughtTimeTotal} seconds`);
  } catch (error) {
    console.error('Error:', error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}

// Handle unhandled promise rejections
process.on('unhandledRejection', (error) => {
  console.error('Unhandled promise rejection:', error);
  process.exit(1);
});

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});