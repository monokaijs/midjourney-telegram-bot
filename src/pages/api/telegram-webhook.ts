import type { NextApiRequest } from 'next';
import {ReplicateUtils} from "@/utils/replicate.utils";
import TelegramService from "@/services/telegram.service";
import {translate} from "@/utils/translate.utils";

export const config = {
  runtime: 'edge',
}

const model = "prompthero/openjourney:9936c2001faa2194a261c01381f90e65261879985476014a0a37a334593a05eb";
const midJourney = async (prompt: string, parameters = {}) =>
  await ReplicateUtils.run(model, { prompt, ...parameters });

export default async function handler(req: Request) {
  const telegram = new TelegramService();
  const vercelUrl = process.env.VERCEL_URL;
  const webhookPath = `https://${vercelUrl}/api/telegram-webhook`;
  if (req.method === 'GET') {
    try {
      await telegram.setWebhook(webhookPath);
      return new Response(JSON.stringify({
        message: 'Telegram Webhook has been successfully set'
      }));
    } catch (e: any) {
      return new Response(JSON.stringify({
        message: 'Failed to setup Telegram Webhook. ' + e.message
      }));
    }
  } else {
    const body = await req.json() as any;
    const msg = body.message as any;
    const chatId = msg.chat.id;
    console.log('chat id', chatId)

    if (msg.text && msg.text.startsWith('/draw ')) {
      const sentMsg = await telegram.sendMessage(chatId, 'Image is being drawn...');
      // Temporarily disable translation due to limitations
      // const translation = await translate(msg.text.slice(6), {
      //   to: 'en'
      // });
      // const translatedPrompt = translation.text;
      try {
        const mjResponse = await midJourney(msg.text.slice(6))
        if (!mjResponse) {
          throw new Error("Cannot generated images");
        }
        await Promise.all([
          telegram.sendPhoto(chatId, mjResponse[0]),
          telegram.deleteMessage(chatId, sentMsg.message_id)
        ]);
      } catch (e) {
        await telegram.editMessageText(chatId, sentMsg.message_id, 'Failed to draw. Please check server logs for more details.');
      }
      return new Response(JSON.stringify({
        success: true
      }))
    }
  }
}
