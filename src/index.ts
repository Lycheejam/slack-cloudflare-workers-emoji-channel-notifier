import { SlackApp, SlackEdgeAppEnv } from "slack-cloudflare-workers";

export interface Env extends SlackEdgeAppEnv {
  POST_CHANNEL_ID_EMOJI: string;
  POST_CHANNEL_ID_CHANNEL: string;
}

export default {
  async fetch(
    request: Request,
    env: Env,
    ctx: ExecutionContext
  ): Promise<Response> {
    const slackApp = new SlackApp({ env })
      .event("emoji_changed", async ({ context, payload }) => {
        if (payload.subtype === "add") {
          await context.client.chat.postMessage({
            channel: env.POST_CHANNEL_ID_EMOJI,
            text: `:tada: 新しいemojiが追加されました : \`:${payload.name}:\` :${payload.name}:`,
          });
        }
      })
      
      .event("channel_created", async ({ context, payload }) => {
        await context.client.chat.postMessage({
          channel: env.POST_CHANNEL_ID_CHANNEL,
          text: `:tada: チャンネル #${payload.channel.name} が作成されました！`,
          link_names: true,
        });
      })

      .event("channel_rename", async ({ context, payload }) => {
        await context.client.chat.postMessage({
          channel: env.POST_CHANNEL_ID_CHANNEL,
          text: `:pencil2: チャンネル #${payload.channel.name} の名前が変更されたようです。`,
          link_names: true,
        });
      })

      .event("channel_archive", async ({ context, payload }) => {
        await context.client.chat.postMessage({
          channel: env.POST_CHANNEL_ID_CHANNEL,
          text: `:notebook: チャンネル ${payload.channel} がアーカイブされたようです。`,
          link_names: true,
        });
      })

      .event("channel_deleted", async ({ context, payload }) => {
        await context.client.chat.postMessage({
          channel: env.POST_CHANNEL_ID_CHANNEL,
          text: `:shower: チャンネル ${payload.channel} が削除されたようです。`,
          link_names: true,
        });
      })
    return await slackApp.run(request, ctx);
  },
};
