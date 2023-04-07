import type { NextApiRequest, NextApiResponse } from 'next'
import {ReplicateUtils} from "@/utils/replicate.utils";
import TelegramService from "@/services/telegram.service";
import TelegramBot from "node-telegram-bot-api";
import {translate} from "@/utils/translate.utils";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const model = "prompthero/openjourney:9936c2001faa2194a261c01381f90e65261879985476014a0a37a334593a05eb";

  const midJourney = async (prompt: string, parameters = {}) =>
    await ReplicateUtils.run(model, { prompt, ...parameters });

  TelegramService.register();

  const vercelUrl = process.env.VERCEL_URL;
  const webhookPath = vercelUrl ? `https://${vercelUrl}/api/telegram-webhook` : `https://${req.headers.host}${req.url}`;
  if (req.method === 'GET') {
    TelegramService.bot.setWebHook(webhookPath).then(() => {
      res.json({
        message: 'Telegram Webhook has been successfully set'
      });
    }).catch((e) => {
      res.json({
        message: 'Failed to setup Telegram Webhook. ' + e.message
      })
    });
  } else {
    const {body} = req;
    const msg = body.message as TelegramBot.Message;
    const chatId = msg.chat.id;
    if (msg.text && msg.text.startsWith('/draw ')) {
      const sentMsg = await TelegramService.bot.sendMessage(chatId, 'Image is being drawn...');
      const translatedPrompt = translate(msg.text.slice(6), {
        to: 'en'
      });
      midJourney(translatedPrompt).then(res => {
        TelegramService.bot.sendPhoto(chatId, res[0]);
        TelegramService.bot.deleteMessage(chatId, sentMsg.message_id);
      }).catch(e => {
        console.log(e);
        TelegramService.bot.editMessageText('Failed to draw. Please check server logs for more details.', {
          chat_id: chatId,
          message_id: sentMsg.message_id
        });
      });
    }

    return res.json({
      success: true
    });
  }
}
