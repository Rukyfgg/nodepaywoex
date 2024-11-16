const TelegramBot = require('node-telegram-bot-api');
const fs = require('fs');
const inquirer = require('inquirer');
const Config = require('./src/config');
const Bot = require('./src/bot');
const initLogger = require('./src/logger');
const { readLines, displayHeader } = require('./src/utils');

const token = 'YOUR_TELEGRAM_BOT_TOKEN'; // Replace with your actual Telegram Bot token
const bot = new TelegramBot(token, { polling: true });

// Initialize config, logger, and bot instance
const config = new Config();
const logger = initLogger();
const telegramBot = new Bot(config, logger, bot); // Pass the bot instance to the Bot class

// Handle commands
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  bot.sendMessage(chatId, 'Welcome! I can help you interact with the Nodepay bot. Use /help for more details.');
});

bot.onText(/\/token/, async (msg) => {
  const chatId = msg.chat.id;
  bot.sendMessage(chatId, 'Please provide the token you would like to use:');

  // Wait for the user to send the token
  bot.once('message', (message) => {
    const token = message.text.trim(); // Get the token sent by the user
    if (token) {
      // Save the token to token.txt
      fs.writeFile('token.txt', token, (err) => {
        if (err) {
          bot.sendMessage(chatId, '❌ Failed to save token. Please try again.');
        } else {
          bot.sendMessage(chatId, `✅ Token saved successfully: ${token}`);
        }
      });
    } else {
      bot.sendMessage(chatId, '❌ Invalid token provided. Please try again.');
    }
  });
});

bot.onText(/\/cpu/, (msg) => {
  const chatId = msg.chat.id;
  // List CPU details (use system or process info)
  const cpuInfo = getCpuInfo(); // Assume this function provides the CPU details
  bot.sendMessage(chatId, `CPU Info: ${cpuInfo}`);
});

bot.onText(/\/stmining/, async (msg) => {
  const chatId = msg.chat.id;
  bot.sendMessage(chatId, 'Running the mining code...');
  
  try {
    await runMiningCode(); // Implement this function to run the mining code
    bot.sendMessage(chatId, 'Mining code executed successfully!');
  } catch (error) {
    bot.sendMessage(chatId, `Error while running mining code: ${error.message}`);
  }
});

bot.onText(/\/help/, (msg) => {
  const chatId = msg.chat.id;
  bot.sendMessage(chatId, `
Available commands:
- /start - Welcome message
- /token - Ask for the token used in the bot
- /cpu - List CPU details
- /stmining - Run the mining code
- /help - Show this help message
  `);
});

// Function to get CPU details (example)
function getCpuInfo() {
  const os = require('os');
  return os.cpus().map(cpu => `${cpu.model} - ${cpu.speed}MHz`).join('\n');
}

// Example function to run mining code (replace with actual code)
async function main() {
  displayHeader();
  console.log('⏳ Please wait...\n'.yellow);

  const config = new Config();
  const logger = initLogger();

  // Read tokens from token.txt
  const tokens = await readLines('token.txt');

  // Check if there is at least one token
  if (tokens.length === 0) {
    console.log('❌ No tokens found in token.txt'.red);
    return;
  }

  const bot = new Bot(config, logger);

  // Connect using the first token without proxies
  const singleToken = tokens[0];
  bot
    .connect(singleToken)
    .catch((err) => console.log(`❌ ${err.message}`.red));

  process.on('SIGINT', () => {
    console.log(`\n👋 ${'Shutting down...'.green}`);
    process.exit(0);
  });
}

main().catch((error) => console.log(`❌ ${error.message}`.red));
}
